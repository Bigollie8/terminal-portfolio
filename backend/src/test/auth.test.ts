import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';

// Create a test app with mocked dependencies
function createTestApp() {
  const app: Express = express();
  app.use(express.json());

  // Mock user storage
  const users: Map<string, { id: number; username: string; passwordHash: string; bio: string }> = new Map();
  const sessions: Map<string, { userId: number; expiresAt: Date }> = new Map();
  let nextUserId = 1;

  // Helper functions
  const usernameExists = (username: string) => {
    for (const user of users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) return true;
    }
    return false;
  };

  const createUser = async (username: string, password: string) => {
    const id = nextUserId++;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id, username, passwordHash, bio: '' };
    users.set(username.toLowerCase(), user);
    return { id, username, bio: '' };
  };

  const createSession = (userId: number) => {
    const token = `token-${Date.now()}-${Math.random()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    sessions.set(token, { userId, expiresAt });
    return { token, expiresAt };
  };

  const verifyPassword = async (username: string, password: string) => {
    const user = users.get(username.toLowerCase());
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, username: user.username, bio: user.bio };
  };

  const getSessionByToken = (token: string) => {
    return sessions.get(token);
  };

  // Auth middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const session = getSessionByToken(token);

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

    (req as any).user = { id: user.id, username: user.username, bio: user.bio };
    (req as any).token = token;
    next();
  };

  // Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      if (usernameExists(username)) {
        return res.status(409).json({ error: `Username '${username}' is already taken` });
      }

      const user = await createUser(username, password);
      const session = createSession(user.id);

      res.status(201).json({ user, token: session.token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await verifyPassword(username, password);

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const session = createSession(user.id);

      res.json({ user, token: session.token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    const token = (req as any).token;
    if (token) {
      sessions.delete(token);
    }
    res.status(204).send();
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({ user });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, users, sessions };
}

describe('Auth API', () => {
  let app: Express;
  let users: Map<string, any>;
  let sessions: Map<string, any>;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    users = testApp.users;
    sessions = testApp.sessions;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject registration with existing username', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      // Second registration with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password456' });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already taken');
    });

    it('should reject registration with case-insensitive duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'TestUser', password: 'password123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password456' });

      expect(response.status).toBe(409);
    });

    it('should reject registration without username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'short' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should login case-insensitively', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'TESTUSER', password: 'password123' });

      expect(response.status).toBe(200);
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(response.status).toBe(401);
    });

    it('should reject login without username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });
      token = response.body.token;
    });

    it('should logout authenticated user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it('should invalidate session after logout', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Try to use the token again
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it('should reject logout without auth token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });
      token = response.body.token;
    });

    it('should return current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject without auth token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should reject with malformed auth header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
    });
  });

  describe('Health Check', () => {
    it('should return ok status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});

describe('Password Hashing', () => {
  it('should hash password securely', async () => {
    const password = 'testpassword123';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('should verify correct password', async () => {
    const password = 'testpassword123';
    const hash = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testpassword123';
    const hash = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare('wrongpassword', hash);
    expect(isValid).toBe(false);
  });
});

describe('Session Token', () => {
  it('should generate unique tokens', () => {
    const tokens = new Set();
    for (let i = 0; i < 100; i++) {
      tokens.add(`token-${Date.now()}-${Math.random()}`);
    }
    expect(tokens.size).toBe(100);
  });
});
