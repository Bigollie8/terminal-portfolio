import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Create a test app with mocked dependencies
function createTestApp() {
  const app: Express = express();
  app.use(express.json());

  // Mock project storage
  const projects: Map<string, {
    id: number;
    name: string;
    slug: string;
    description: string;
    longDescription?: string;
    url: string;
    githubUrl?: string;
    techStack: string[];
    status: 'active' | 'archived' | 'wip';
    featured: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
  }> = new Map();
  let nextProjectId = 1;

  // Helper functions
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const slugExists = (slug: string, excludeId?: number): boolean => {
    for (const project of projects.values()) {
      if (project.slug === slug && project.id !== excludeId) {
        return true;
      }
    }
    return false;
  };

  const getNextDisplayOrder = (): number => {
    let max = 0;
    for (const project of projects.values()) {
      if (project.displayOrder > max) {
        max = project.displayOrder;
      }
    }
    return max + 1;
  };

  // Routes
  app.get('/api/projects', (req, res) => {
    const { status, sort, featured } = req.query;

    let result = Array.from(projects.values());

    // Filter by status
    if (status) {
      result = result.filter(p => p.status === status);
    }

    // Filter by featured
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      result = result.filter(p => p.featured === isFeatured);
    }

    // Sort
    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    res.json({ projects: result });
  });

  app.get('/api/projects/:slug', (req, res) => {
    const { slug } = req.params;
    const project = projects.get(slug);

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project '${slug}' not found`
      });
    }

    res.json({ project });
  });

  app.post('/api/projects', (req, res) => {
    const { name, description, url, techStack, slug, longDescription, githubUrl, status, featured, displayOrder } = req.body;

    // Validation
    if (!name || !description || !url || !techStack) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalSlug = slug || slugify(name);

    // Check for duplicate slug
    if (slugExists(finalSlug)) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Project with slug '${finalSlug}' already exists`
      });
    }

    const now = new Date().toISOString();
    const project = {
      id: nextProjectId++,
      name,
      slug: finalSlug,
      description,
      longDescription,
      url,
      githubUrl,
      techStack,
      status: status || 'active',
      featured: featured || false,
      displayOrder: displayOrder ?? getNextDisplayOrder(),
      createdAt: now,
      updatedAt: now
    };

    projects.set(finalSlug, project);
    res.status(201).json({ project });
  });

  app.put('/api/projects/:slug', (req, res) => {
    const { slug } = req.params;
    const existing = projects.get(slug);

    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project '${slug}' not found`
      });
    }

    const { name, description, url, techStack, slug: newSlug, longDescription, githubUrl, status, featured, displayOrder } = req.body;

    // Check for slug conflict if changing slug
    if (newSlug && newSlug !== slug) {
      if (slugExists(newSlug, existing.id)) {
        return res.status(409).json({
          error: 'Conflict',
          message: `Project with slug '${newSlug}' already exists`
        });
      }
    }

    const finalSlug = newSlug || slug;
    const now = new Date().toISOString();

    const updated = {
      ...existing,
      name: name ?? existing.name,
      slug: finalSlug,
      description: description ?? existing.description,
      longDescription: longDescription ?? existing.longDescription,
      url: url ?? existing.url,
      githubUrl: githubUrl ?? existing.githubUrl,
      techStack: techStack ?? existing.techStack,
      status: status ?? existing.status,
      featured: featured ?? existing.featured,
      displayOrder: displayOrder ?? existing.displayOrder,
      updatedAt: now
    };

    // If slug changed, remove old key
    if (finalSlug !== slug) {
      projects.delete(slug);
    }
    projects.set(finalSlug, updated);

    res.json({ project: updated });
  });

  app.delete('/api/projects/:slug', (req, res) => {
    const { slug } = req.params;

    if (!projects.has(slug)) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project '${slug}' not found`
      });
    }

    projects.delete(slug);
    res.status(204).send();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  return { app, projects };
}

describe('Projects API', () => {
  let app: Express;
  let projects: Map<string, any>;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    projects = testApp.projects;
  });

  describe('GET /api/projects', () => {
    it('should return empty array when no projects exist', async () => {
      const response = await request(app).get('/api/projects');

      expect(response.status).toBe(200);
      expect(response.body.projects).toEqual([]);
    });

    it('should return all projects', async () => {
      // Create some projects first
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Project A',
          description: 'Description A',
          url: 'https://example.com/a',
          techStack: ['React']
        });

      await request(app)
        .post('/api/projects')
        .send({
          name: 'Project B',
          description: 'Description B',
          url: 'https://example.com/b',
          techStack: ['Vue']
        });

      const response = await request(app).get('/api/projects');

      expect(response.status).toBe(200);
      expect(response.body.projects).toHaveLength(2);
    });

    it('should filter by status', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Active Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React'],
          status: 'active'
        });

      await request(app)
        .post('/api/projects')
        .send({
          name: 'Archived Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['Vue'],
          status: 'archived'
        });

      const response = await request(app).get('/api/projects?status=active');

      expect(response.status).toBe(200);
      expect(response.body.projects).toHaveLength(1);
      expect(response.body.projects[0].status).toBe('active');
    });

    it('should filter by featured', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Featured Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React'],
          featured: true
        });

      await request(app)
        .post('/api/projects')
        .send({
          name: 'Regular Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['Vue'],
          featured: false
        });

      const response = await request(app).get('/api/projects?featured=true');

      expect(response.status).toBe(200);
      expect(response.body.projects).toHaveLength(1);
      expect(response.body.projects[0].featured).toBe(true);
    });

    it('should sort by name', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Zebra Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      await request(app)
        .post('/api/projects')
        .send({
          name: 'Alpha Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['Vue']
        });

      const response = await request(app).get('/api/projects?sort=name');

      expect(response.status).toBe(200);
      expect(response.body.projects[0].name).toBe('Alpha Project');
      expect(response.body.projects[1].name).toBe('Zebra Project');
    });

    it('should sort by display order by default', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Project A',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React'],
          displayOrder: 2
        });

      await request(app)
        .post('/api/projects')
        .send({
          name: 'Project B',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['Vue'],
          displayOrder: 1
        });

      const response = await request(app).get('/api/projects');

      expect(response.status).toBe(200);
      expect(response.body.projects[0].name).toBe('Project B');
      expect(response.body.projects[1].name).toBe('Project A');
    });
  });

  describe('GET /api/projects/:slug', () => {
    it('should return a single project by slug', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'My Project',
          description: 'A great project',
          url: 'https://example.com',
          techStack: ['React', 'TypeScript']
        });

      const response = await request(app).get('/api/projects/my-project');

      expect(response.status).toBe(200);
      expect(response.body.project.name).toBe('My Project');
      expect(response.body.project.slug).toBe('my-project');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app).get('/api/projects/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'New Project',
          description: 'Project description',
          url: 'https://example.com',
          techStack: ['React', 'Node.js']
        });

      expect(response.status).toBe(201);
      expect(response.body.project).toHaveProperty('id');
      expect(response.body.project.name).toBe('New Project');
      expect(response.body.project.slug).toBe('new-project');
    });

    it('should generate slug from name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'My Amazing Project!!!',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      expect(response.status).toBe(201);
      expect(response.body.project.slug).toBe('my-amazing-project');
    });

    it('should use provided slug', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'My Project',
          slug: 'custom-slug',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      expect(response.status).toBe(201);
      expect(response.body.project.slug).toBe('custom-slug');
    });

    it('should reject duplicate slug', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'First Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'First Project',
          description: 'Another description',
          url: 'https://example.com/other',
          techStack: ['Vue']
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Conflict');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Project Name'
          // Missing description, url, techStack
        });

      expect(response.status).toBe(400);
    });

    it('should set default status to active', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'New Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      expect(response.status).toBe(201);
      expect(response.body.project.status).toBe('active');
    });

    it('should set default featured to false', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'New Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      expect(response.status).toBe(201);
      expect(response.body.project.featured).toBe(false);
    });

    it('should auto-increment display order', async () => {
      const first = await request(app)
        .post('/api/projects')
        .send({
          name: 'First Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      const second = await request(app)
        .post('/api/projects')
        .send({
          name: 'Second Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['Vue']
        });

      expect(first.body.project.displayOrder).toBe(1);
      expect(second.body.project.displayOrder).toBe(2);
    });

    it('should include timestamps', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'New Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });

      expect(response.status).toBe(201);
      expect(response.body.project).toHaveProperty('createdAt');
      expect(response.body.project).toHaveProperty('updatedAt');
    });
  });

  describe('PUT /api/projects/:slug', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Original Project',
          description: 'Original description',
          url: 'https://original.com',
          techStack: ['React']
        });
    });

    it('should update project name', async () => {
      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ name: 'Updated Project' });

      expect(response.status).toBe(200);
      expect(response.body.project.name).toBe('Updated Project');
    });

    it('should update project description', async () => {
      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.project.description).toBe('Updated description');
    });

    it('should update project slug', async () => {
      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ slug: 'new-slug' });

      expect(response.status).toBe(200);
      expect(response.body.project.slug).toBe('new-slug');

      // Verify old slug no longer works
      const old = await request(app).get('/api/projects/original-project');
      expect(old.status).toBe(404);

      // Verify new slug works
      const newReq = await request(app).get('/api/projects/new-slug');
      expect(newReq.status).toBe(200);
    });

    it('should reject slug conflict', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Other Project',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['Vue']
        });

      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ slug: 'other-project' });

      expect(response.status).toBe(409);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent')
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
    });

    it('should update featured status', async () => {
      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ featured: true });

      expect(response.status).toBe(200);
      expect(response.body.project.featured).toBe(true);
    });

    it('should update tech stack', async () => {
      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ techStack: ['Vue', 'TypeScript', 'Tailwind'] });

      expect(response.status).toBe(200);
      expect(response.body.project.techStack).toEqual(['Vue', 'TypeScript', 'Tailwind']);
    });

    it('should update updatedAt timestamp', async () => {
      const original = await request(app).get('/api/projects/original-project');
      const originalUpdatedAt = original.body.project.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .put('/api/projects/original-project')
        .send({ name: 'New Name' });

      expect(response.body.project.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('DELETE /api/projects/:slug', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/projects')
        .send({
          name: 'Project to Delete',
          description: 'Description',
          url: 'https://example.com',
          techStack: ['React']
        });
    });

    it('should delete a project', async () => {
      const response = await request(app).delete('/api/projects/project-to-delete');

      expect(response.status).toBe(204);

      // Verify project is gone
      const check = await request(app).get('/api/projects/project-to-delete');
      expect(check.status).toBe(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app).delete('/api/projects/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    it('should return ok status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
