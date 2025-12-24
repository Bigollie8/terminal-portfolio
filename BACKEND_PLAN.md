# Backend Agent Plan - Terminal Portfolio

Build a REST API with Node.js + Express + TypeScript to serve project and profile data for the terminal portfolio.

---

## Setup

```bash
cd C:\Users\bigol\repos\terminal-portfolio
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
npx tsc --init
```

### tsconfig.json adjustments
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## File Structure

Create this structure inside `backend/`:

```
backend/
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── config/
│   │   └── database.ts          # Database connection (if using DB)
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── projects.ts          # /api/projects routes
│   │   └── about.ts             # /api/about routes
│   ├── controllers/
│   │   ├── projectController.ts # Project logic
│   │   └── aboutController.ts   # About logic
│   ├── data/
│   │   ├── projects.json        # Project data (JSON file approach)
│   │   └── about.json           # About data
│   ├── middleware/
│   │   └── errorHandler.ts      # Global error handling
│   └── types/
│       └── index.ts             # Type definitions
├── package.json
├── tsconfig.json
└── .env
```

---

## Data Storage Options

### Option A: JSON Files (Simpler - Recommended to Start)
Store data in JSON files. Easy to edit, no database setup needed.

### Option B: SQLite (Middle Ground)
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### Option C: PostgreSQL (Production Ready)
```bash
npm install pg
npm install -D @types/pg
```

**Recommendation**: Start with JSON files for rapid development. Can migrate to database later.

---

## Type Definitions

### types/index.ts
```typescript
export interface Project {
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
}

export interface About {
  name: string;
  title: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  asciiArt?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

---

## Sample Data

### data/projects.json
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Terminal Portfolio",
      "slug": "terminal-portfolio",
      "description": "A terminal-themed portfolio website",
      "longDescription": "An interactive terminal emulator that serves as a portfolio homepage. Built with React and TypeScript, featuring multiple themes, command history, and a retro CRT aesthetic.",
      "url": "https://terminal.example.com",
      "githubUrl": "https://github.com/user/terminal-portfolio",
      "techStack": ["React", "TypeScript", "Node.js", "Express"],
      "status": "active",
      "featured": true,
      "displayOrder": 1,
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Weather App",
      "slug": "weather-app",
      "description": "Real-time weather application",
      "longDescription": "A weather application that provides real-time forecasts, radar maps, and severe weather alerts. Features location-based automatic updates and a clean, modern interface.",
      "url": "https://weather.example.com",
      "githubUrl": "https://github.com/user/weather-app",
      "techStack": ["Vue.js", "Python", "FastAPI"],
      "status": "active",
      "featured": false,
      "displayOrder": 2,
      "createdAt": "2023-08-20T00:00:00Z",
      "updatedAt": "2023-12-01T00:00:00Z"
    },
    {
      "id": 3,
      "name": "Task Manager",
      "slug": "task-manager",
      "description": "Kanban-style task management tool",
      "longDescription": "A productivity application featuring drag-and-drop kanban boards, team collaboration, due date tracking, and integration with popular calendar apps.",
      "url": "https://tasks.example.com",
      "techStack": ["React", "Redux", "Node.js", "MongoDB"],
      "status": "active",
      "featured": true,
      "displayOrder": 3,
      "createdAt": "2023-05-10T00:00:00Z",
      "updatedAt": "2024-01-10T00:00:00Z"
    }
  ]
}
```

### data/about.json
```json
{
  "name": "Your Name",
  "title": "Full Stack Developer",
  "bio": "Passionate developer with expertise in building modern web applications. I love creating intuitive user experiences and solving complex problems with elegant solutions.",
  "email": "hello@example.com",
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "twitter": "https://twitter.com/username",
  "website": "https://example.com",
  "asciiArt": "    _____\n   /     \\\n  | () () |\n   \\  ^  /\n    |||||\n    |||||\n"
}
```

---

## Implementation

### src/index.ts - Entry Point
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### src/routes/index.ts - Route Aggregator
```typescript
import { Router } from 'express';
import projectRoutes from './projects';
import aboutRoutes from './about';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/about', aboutRoutes);

export default router;
```

### src/routes/projects.ts - Project Routes
```typescript
import { Router } from 'express';
import * as projectController from '../controllers/projectController';

const router = Router();

// GET /api/projects - List all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/:slug - Get single project
router.get('/:slug', projectController.getProjectBySlug);

// POST /api/projects - Create project (admin)
router.post('/', projectController.createProject);

// PUT /api/projects/:slug - Update project (admin)
router.put('/:slug', projectController.updateProject);

// DELETE /api/projects/:slug - Delete project (admin)
router.delete('/:slug', projectController.deleteProject);

export default router;
```

### src/routes/about.ts - About Routes
```typescript
import { Router } from 'express';
import * as aboutController from '../controllers/aboutController';

const router = Router();

// GET /api/about - Get about info
router.get('/', aboutController.getAbout);

// PUT /api/about - Update about info (admin)
router.put('/', aboutController.updateAbout);

export default router;
```

### src/controllers/projectController.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Project } from '../types';

const dataPath = path.join(__dirname, '../data/projects.json');

const readProjects = (): { projects: Project[] } => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

const writeProjects = (data: { projects: Project[] }): void => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

export const getAllProjects = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = readProjects();

    // Optional sorting
    const sort = req.query.sort as string;
    if (sort === 'name') {
      data.projects.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      data.projects.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    // Optional status filter
    const status = req.query.status as string;
    if (status) {
      data.projects = data.projects.filter(p => p.status === status);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const data = readProjects();
    const project = data.projects.find(p => p.slug === slug);

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project '${slug}' not found`,
        statusCode: 404,
      });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const createProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = readProjects();
    const newProject: Project = {
      id: Math.max(...data.projects.map(p => p.id), 0) + 1,
      ...req.body,
      slug: req.body.slug || slugify(req.body.name),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.projects.push(newProject);
    writeProjects(data);

    res.status(201).json({ project: newProject });
  } catch (error) {
    next(error);
  }
};

export const updateProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const data = readProjects();
    const index = data.projects.findIndex(p => p.slug === slug);

    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project '${slug}' not found`,
        statusCode: 404,
      });
    }

    data.projects[index] = {
      ...data.projects[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    writeProjects(data);
    res.json({ project: data.projects[index] });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const data = readProjects();
    const index = data.projects.findIndex(p => p.slug === slug);

    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project '${slug}' not found`,
        statusCode: 404,
      });
    }

    data.projects.splice(index, 1);
    writeProjects(data);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Helper function
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

### src/controllers/aboutController.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { About } from '../types';

const dataPath = path.join(__dirname, '../data/about.json');

const readAbout = (): About => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

const writeAbout = (data: About): void => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

export const getAbout = (req: Request, res: Response, next: NextFunction) => {
  try {
    const about = readAbout();
    res.json(about);
  } catch (error) {
    next(error);
  }
};

export const updateAbout = (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentAbout = readAbout();
    const updatedAbout: About = {
      ...currentAbout,
      ...req.body,
    };

    writeAbout(updatedAbout);
    res.json(updatedAbout);
  } catch (error) {
    next(error);
  }
};
```

### src/middleware/errorHandler.ts
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    statusCode: 500,
  });
};
```

### .env
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | List all projects | No |
| GET | `/api/projects/:slug` | Get single project | No |
| POST | `/api/projects` | Create project | Admin |
| PUT | `/api/projects/:slug` | Update project | Admin |
| DELETE | `/api/projects/:slug` | Delete project | Admin |
| GET | `/api/about` | Get about info | No |
| PUT | `/api/about` | Update about info | Admin |
| GET | `/health` | Health check | No |

### Query Parameters

**GET /api/projects**
- `sort`: `name` or `order` (default: order)
- `status`: `active`, `archived`, or `wip`

---

## Task Checklist

### Phase 1: Setup
- [ ] Initialize Node.js project
- [ ] Install dependencies
- [ ] Configure TypeScript
- [ ] Set up project structure
- [ ] Create type definitions

### Phase 2: Core API
- [ ] Create Express app with middleware
- [ ] Set up route structure
- [ ] Create sample JSON data files
- [ ] Implement GET /api/projects
- [ ] Implement GET /api/projects/:slug
- [ ] Implement GET /api/about
- [ ] Add error handling middleware

### Phase 3: Admin Endpoints
- [ ] Implement POST /api/projects
- [ ] Implement PUT /api/projects/:slug
- [ ] Implement DELETE /api/projects/:slug
- [ ] Implement PUT /api/about
- [ ] Add input validation

### Phase 4: Polish
- [ ] Add query parameter support (sort, filter)
- [ ] Add health check endpoint
- [ ] Test all endpoints
- [ ] Add request logging (optional)

### Phase 5: Database Migration (Optional)
- [ ] Set up SQLite or PostgreSQL
- [ ] Create database schema
- [ ] Migrate from JSON to database
- [ ] Update controllers to use database

---

## Testing

Use curl or a tool like Postman/Insomnia to test:

```bash
# Get all projects
curl http://localhost:3001/api/projects

# Get single project
curl http://localhost:3001/api/projects/terminal-portfolio

# Get about
curl http://localhost:3001/api/about

# Create project (admin)
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","description":"A new project","url":"https://example.com","techStack":["React"]}'

# Health check
curl http://localhost:3001/health
```

---

## Notes

- JSON file approach is simple but not suitable for high traffic
- Consider adding rate limiting for production
- Admin endpoints currently have no authentication - add this before deploying
- Keep CORS restricted to known frontend origins in production
