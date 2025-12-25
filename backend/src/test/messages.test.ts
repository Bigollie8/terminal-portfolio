import { describe, it, expect, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Create a test app with mocked dependencies
function createTestApp() {
  const app: Express = express();
  app.use(express.json());

  // Mock storage
  const users: Map<string, { id: number; username: string; bio: string }> = new Map();
  const sessions: Map<string, { userId: number; expiresAt: Date }> = new Map();
  const messages: Map<number, {
    id: number;
    senderId: number;
    recipientId: number;
    senderUsername: string;
    recipientUsername: string;
    content: string;
    subject?: string;
    read: boolean;
    createdAt: string;
  }> = new Map();

  let nextUserId = 1;
  let nextMessageId = 1;

  // Helper to create user
  const createUser = (username: string) => {
    const id = nextUserId++;
    const user = { id, username, bio: '' };
    users.set(username.toLowerCase(), user);
    return user;
  };

  const getUserByUsername = (username: string) => {
    return users.get(username.toLowerCase());
  };

  // Helper to create session
  const createSession = (userId: number) => {
    const token = `token-${Date.now()}-${Math.random()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    sessions.set(token, { userId, expiresAt });
    return token;
  };

  // Auth middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    if (session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session has expired' });
    }

    const user = Array.from(users.values()).find(u => u.id === session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    (req as any).user = user;
    next();
  };

  // Message Routes
  app.post('/api/messages', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { to, content, subject } = req.body;

    if (!to || !content) {
      return res.status(400).json({ error: 'Recipient and content are required' });
    }

    const recipient = getUserByUsername(to);
    if (!recipient) {
      return res.status(404).json({ error: `User '${to}' not found` });
    }

    if (recipient.id === user.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = {
      id: nextMessageId++,
      senderId: user.id,
      recipientId: recipient.id,
      senderUsername: user.username,
      recipientUsername: recipient.username,
      content,
      subject,
      read: false,
      createdAt: new Date().toISOString()
    };

    messages.set(message.id, message);
    res.status(201).json({ message });
  });

  app.get('/api/messages/inbox', requireAuth, (req, res) => {
    const user = (req as any).user;
    const inbox = Array.from(messages.values())
      .filter(m => m.recipientId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ messages: inbox });
  });

  app.get('/api/messages/sent', requireAuth, (req, res) => {
    const user = (req as any).user;
    const sent = Array.from(messages.values())
      .filter(m => m.senderId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ messages: sent });
  });

  app.get('/api/messages/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const messageId = parseInt(req.params.id, 10);

    const message = messages.get(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender or recipient can view
    if (message.senderId !== user.id && message.recipientId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to view this message' });
    }

    res.json({ message });
  });

  app.put('/api/messages/:id/read', requireAuth, (req, res) => {
    const user = (req as any).user;
    const messageId = parseInt(req.params.id, 10);

    const message = messages.get(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only recipient can mark as read
    if (message.recipientId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to mark this message as read' });
    }

    message.read = true;
    messages.set(messageId, message);

    res.json({ message });
  });

  app.delete('/api/messages/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const messageId = parseInt(req.params.id, 10);

    const message = messages.get(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender or recipient can delete
    if (message.senderId !== user.id && message.recipientId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    messages.delete(messageId);
    res.status(204).send();
  });

  // Helper route to set up test users
  app.post('/test/setup-user', (req, res) => {
    const { username } = req.body;
    const user = createUser(username);
    const token = createSession(user.id);
    res.json({ user, token });
  });

  return { app, users, sessions, messages };
}

describe('Messages API', () => {
  let app: Express;
  let senderToken: string;
  let recipientToken: string;
  let senderId: number;
  let recipientId: number;

  beforeEach(async () => {
    const testApp = createTestApp();
    app = testApp.app;

    // Create sender
    const senderResponse = await request(app)
      .post('/test/setup-user')
      .send({ username: 'sender' });
    senderToken = senderResponse.body.token;
    senderId = senderResponse.body.user.id;

    // Create recipient
    const recipientResponse = await request(app)
      .post('/test/setup-user')
      .send({ username: 'recipient' });
    recipientToken = recipientResponse.body.token;
    recipientId = recipientResponse.body.user.id;
  });

  describe('POST /api/messages', () => {
    it('should send a message', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'recipient',
          content: 'Hello there!'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toHaveProperty('id');
      expect(response.body.message.content).toBe('Hello there!');
      expect(response.body.message.senderUsername).toBe('sender');
      expect(response.body.message.recipientUsername).toBe('recipient');
    });

    it('should send a message with subject', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'recipient',
          content: 'Message body',
          subject: 'Important Subject'
        });

      expect(response.status).toBe(201);
      expect(response.body.message.subject).toBe('Important Subject');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          to: 'recipient',
          content: 'Hello'
        });

      expect(response.status).toBe(401);
    });

    it('should require recipient', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          content: 'Hello'
        });

      expect(response.status).toBe(400);
    });

    it('should require content', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'recipient'
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent recipient', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'nonexistent',
          content: 'Hello'
        });

      expect(response.status).toBe(404);
    });

    it('should not allow sending message to self', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'sender',
          content: 'Hello'
        });

      expect(response.status).toBe(400);
    });

    it('should be case-insensitive for recipient username', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'RECIPIENT',
          content: 'Hello'
        });

      expect(response.status).toBe(201);
    });

    it('should initialize read as false', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'recipient',
          content: 'Hello'
        });

      expect(response.status).toBe(201);
      expect(response.body.message.read).toBe(false);
    });

    it('should include createdAt timestamp', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          to: 'recipient',
          content: 'Hello'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toHaveProperty('createdAt');
    });
  });

  describe('GET /api/messages/inbox', () => {
    beforeEach(async () => {
      // Send some messages
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ to: 'recipient', content: 'Message 1' });

      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ to: 'recipient', content: 'Message 2' });
    });

    it('should return inbox messages', async () => {
      const response = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(2);
    });

    it('should return messages in reverse chronological order', async () => {
      const response = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages[0].content).toBe('Message 2');
      expect(response.body.messages[1].content).toBe('Message 1');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/messages/inbox');

      expect(response.status).toBe(401);
    });

    it('should return empty array for user with no messages', async () => {
      const response = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(0);
    });
  });

  describe('GET /api/messages/sent', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ to: 'recipient', content: 'Sent message' });
    });

    it('should return sent messages', async () => {
      const response = await request(app)
        .get('/api/messages/sent')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].content).toBe('Sent message');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/messages/sent');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/:id', () => {
    let messageId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ to: 'recipient', content: 'Test message' });
      messageId = response.body.message.id;
    });

    it('should return message for sender', async () => {
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message.content).toBe('Test message');
    });

    it('should return message for recipient', async () => {
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message.content).toBe('Test message');
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/messages/${messageId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .get('/api/messages/99999')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(404);
    });

    it('should not allow third party to view message', async () => {
      // Create a third user
      const thirdUserResponse = await request(app)
        .post('/test/setup-user')
        .send({ username: 'thirduser' });
      const thirdToken = thirdUserResponse.body.token;

      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${thirdToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/messages/:id/read', () => {
    let messageId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ to: 'recipient', content: 'Test message' });
      messageId = response.body.message.id;
    });

    it('should mark message as read', async () => {
      const response = await request(app)
        .put(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message.read).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/messages/${messageId}/read`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .put('/api/messages/99999/read')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(404);
    });

    it('should not allow sender to mark as read', async () => {
      const response = await request(app)
        .put(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(403);
    });

    it('should not allow third party to mark as read', async () => {
      const thirdUserResponse = await request(app)
        .post('/test/setup-user')
        .send({ username: 'thirduser' });
      const thirdToken = thirdUserResponse.body.token;

      const response = await request(app)
        .put(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${thirdToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    let messageId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ to: 'recipient', content: 'Test message' });
      messageId = response.body.message.id;
    });

    it('should allow sender to delete message', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(204);
    });

    it('should allow recipient to delete message', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(204);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .delete('/api/messages/99999')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(404);
    });

    it('should not allow third party to delete message', async () => {
      const thirdUserResponse = await request(app)
        .post('/test/setup-user')
        .send({ username: 'thirduser' });
      const thirdToken = thirdUserResponse.body.token;

      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${thirdToken}`);

      expect(response.status).toBe(403);
    });
  });
});
