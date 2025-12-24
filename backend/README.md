# Terminal Portfolio Backend

REST API for the Terminal Portfolio project built with Node.js, Express, TypeScript, and SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with sample data
npm run db:seed

# Start development server
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| GET | `/api/projects` | List all projects | No |
| GET | `/api/projects/:slug` | Get single project | No |
| POST | `/api/projects` | Create project | No* |
| PUT | `/api/projects/:slug` | Update project | No* |
| DELETE | `/api/projects/:slug` | Delete project | No* |
| GET | `/api/about` | Get about info | No |
| PUT | `/api/about` | Update about info | No* |

*Note: Admin endpoints are currently unprotected. See SEC-001 in DEVELOPMENT.md.

## Query Parameters

### GET /api/projects

| Parameter | Values | Description |
|-----------|--------|-------------|
| `status` | `active`, `archived`, `wip` | Filter by status |
| `sort` | `name`, `order` | Sort order (default: order) |
| `featured` | `true`, `false` | Filter featured projects |

Example:
```bash
curl "http://localhost:3001/api/projects?status=active&sort=name"
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── config/
│   │   └── database.ts       # SQLite connection and schema
│   ├── controllers/
│   │   ├── projectController.ts
│   │   └── aboutController.ts
│   ├── middleware/
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── validate.ts       # Zod validation middleware
│   ├── models/
│   │   ├── projectModel.ts   # Project database operations
│   │   └── aboutModel.ts     # About database operations
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── projects.ts
│   │   └── about.ts
│   ├── scripts/
│   │   ├── seed.ts           # Database seeding
│   │   └── reset.ts          # Database reset
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── validation/
│       └── schemas.ts        # Zod validation schemas
├── data/                     # SQLite database files
├── shared/                   # Shared types (symlinked)
├── package.json
├── tsconfig.json
└── .env
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled JavaScript |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (deletes all data) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `DATABASE_URL` | ./data/portfolio.db | SQLite database path |

## Error Response Format

All errors follow this format:

```json
{
  "error": "Not Found",
  "message": "Project 'xyz' not found",
  "statusCode": 404
}
```

## Testing with curl

```bash
# Health check
curl http://localhost:3001/health

# Get all projects
curl http://localhost:3001/api/projects

# Get single project
curl http://localhost:3001/api/projects/terminal-portfolio

# Get about info
curl http://localhost:3001/api/about

# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","description":"A test project","url":"https://example.com","techStack":["React"]}'

# Update project
curl -X PUT http://localhost:3001/api/projects/new-project \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'

# Delete project
curl -X DELETE http://localhost:3001/api/projects/new-project
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Validation**: Zod
- **CORS**: cors middleware
