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
  const wallPosts: Map<number, {
    id: number;
    userId: number;
    username: string;
    content: string;
    createdAt: string;
  }> = new Map();

  let nextUserId = 1;
  let nextPostId = 1;

  // Helper to create user
  const createUser = (username: string) => {
    const id = nextUserId++;
    const user = { id, username, bio: '' };
    users.set(username.toLowerCase(), user);
    return user;
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
    (req as any).token = token;
    next();
  };

  // Wall Routes
  app.get('/api/wall', (_req, res) => {
    const posts = Array.from(wallPosts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ posts });
  });

  app.post('/api/wall', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Content must be 500 characters or less' });
    }

    const post = {
      id: nextPostId++,
      userId: user.id,
      username: user.username,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    wallPosts.set(post.id, post);
    res.status(201).json({ post });
  });

  app.delete('/api/wall/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const postId = parseInt(req.params.id, 10);

    const post = wallPosts.get(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    wallPosts.delete(postId);
    res.status(204).send();
  });

  // Helper route to set up test users (not in production)
  app.post('/test/setup-user', (req, res) => {
    const { username } = req.body;
    const user = createUser(username);
    const token = createSession(user.id);
    res.json({ user, token });
  });

  return { app, users, sessions, wallPosts };
}

describe('Wall API', () => {
  let app: Express;
  let testUserToken: string;
  let testUserId: number;

  beforeEach(async () => {
    const testApp = createTestApp();
    app = testApp.app;

    // Create a test user
    const response = await request(app)
      .post('/test/setup-user')
      .send({ username: 'testuser' });
    testUserToken = response.body.token;
    testUserId = response.body.user.id;
  });

  describe('GET /api/wall', () => {
    it('should return empty array when no posts exist', async () => {
      const response = await request(app).get('/api/wall');

      expect(response.status).toBe(200);
      expect(response.body.posts).toEqual([]);
    });

    it('should return all wall posts', async () => {
      // Create some posts
      await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'First post' });

      await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Second post' });

      const response = await request(app).get('/api/wall');

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(2);
    });

    it('should return posts in reverse chronological order', async () => {
      await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'First post' });

      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Second post' });

      const response = await request(app).get('/api/wall');

      expect(response.status).toBe(200);
      expect(response.body.posts[0].content).toBe('Second post');
      expect(response.body.posts[1].content).toBe('First post');
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app).get('/api/wall');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/wall', () => {
    it('should create a new wall post', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Hello, World!' });

      expect(response.status).toBe(201);
      expect(response.body.post).toHaveProperty('id');
      expect(response.body.post.content).toBe('Hello, World!');
      expect(response.body.post.username).toBe('testuser');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/wall')
        .send({ content: 'Hello' });

      expect(response.status).toBe(401);
    });

    it('should reject empty content', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: '' });

      expect(response.status).toBe(400);
    });

    it('should reject whitespace-only content', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: '   ' });

      expect(response.status).toBe(400);
    });

    it('should reject content longer than 500 characters', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'a'.repeat(501) });

      expect(response.status).toBe(400);
    });

    it('should accept content exactly 500 characters', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'a'.repeat(500) });

      expect(response.status).toBe(201);
    });

    it('should trim whitespace from content', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: '  Hello World  ' });

      expect(response.status).toBe(201);
      expect(response.body.post.content).toBe('Hello World');
    });

    it('should include createdAt timestamp', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Hello' });

      expect(response.status).toBe(201);
      expect(response.body.post).toHaveProperty('createdAt');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', 'Bearer invalid-token')
        .send({ content: 'Hello' });

      expect(response.status).toBe(401);
    });

    it('should reject missing authorization header', async () => {
      const response = await request(app)
        .post('/api/wall')
        .send({ content: 'Hello' });

      expect(response.status).toBe(401);
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', 'InvalidFormat token')
        .send({ content: 'Hello' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/wall/:id', () => {
    let postId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/wall')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Post to delete' });
      postId = response.body.post.id;
    });

    it('should delete own post', async () => {
      const response = await request(app)
        .delete(`/api/wall/${postId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(204);

      // Verify post is gone
      const wallResponse = await request(app).get('/api/wall');
      expect(wallResponse.body.posts).toHaveLength(0);
    });

    it('should require authentication', async () => {
      const response = await request(app).delete(`/api/wall/${postId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .delete('/api/wall/99999')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });

    it('should not allow deleting another user post', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/test/setup-user')
        .send({ username: 'otheruser' });
      const otherToken = otherUserResponse.body.token;

      const response = await request(app)
        .delete(`/api/wall/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe('Wall Post Content Validation', () => {
  let app: Express;
  let token: string;

  beforeEach(async () => {
    const testApp = createTestApp();
    app = testApp.app;

    const response = await request(app)
      .post('/test/setup-user')
      .send({ username: 'testuser' });
    token = response.body.token;
  });

  it('should handle unicode content', async () => {
    const response = await request(app)
      .post('/api/wall')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello World! 🎉 Привет мир! 你好世界!' });

    expect(response.status).toBe(201);
    expect(response.body.post.content).toBe('Hello World! 🎉 Привет мир! 你好世界!');
  });

  it('should handle multiline content', async () => {
    const multilineContent = 'Line 1\nLine 2\nLine 3';
    const response = await request(app)
      .post('/api/wall')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: multilineContent });

    expect(response.status).toBe(201);
    expect(response.body.post.content).toBe(multilineContent);
  });

  it('should handle special characters', async () => {
    const response = await request(app)
      .post('/api/wall')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '<script>alert("XSS")</script>' });

    expect(response.status).toBe(201);
    // Content should be stored as-is, XSS prevention happens on frontend
    expect(response.body.post.content).toBe('<script>alert("XSS")</script>');
  });
});
