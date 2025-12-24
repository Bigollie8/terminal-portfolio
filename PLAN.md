# Terminal Portfolio - Implementation Plan

A terminal-themed home page where users interact via command-line interface to explore and navigate to projects.

---

## Project Overview

**Concept**: A retro terminal emulator in the browser that serves as a portfolio/project directory. Users type commands like `ls`, `cd`, `help` to navigate and discover projects.

**Tech Stack**:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (or SQLite for simplicity)
- **Styling**: CSS Modules or Tailwind CSS

---

## Repository Structure

```
terminal-portfolio/
├── PLAN.md                      # This file - main plan
├── FRONTEND_PLAN.md             # Frontend agent instructions
├── BACKEND_PLAN.md              # Backend agent instructions
├── frontend/                    # React frontend app
└── backend/                     # Express backend API
```

---

## Features

### Terminal Commands
| Command | Description |
|---------|-------------|
| `help` | List all available commands |
| `ls` | List all projects |
| `ls -l` | Detailed project list with tech stack |
| `cd <project>` | Navigate/redirect to project URL |
| `cat <project>` | View full project details |
| `clear` | Clear terminal screen |
| `whoami` | Display about me info |
| `contact` | Show contact information |
| `theme` | List available themes |
| `theme <name>` | Change terminal theme |
| `history` | Show command history |
| `echo <text>` | Echo text back |

### Themes
- **Matrix** - Classic green on black
- **Dracula** - Popular dark theme
- **Monokai** - Vibrant colors
- **Light** - Light terminal theme

### UX Features
- Command history with arrow key navigation
- Tab completion for commands and project names
- Auto-focus input
- Mobile responsive
- Blinking cursor animation
- CRT/scanline effects (optional)

---

## Shared Types

Both frontend and backend should use these interfaces:

```typescript
// Project
interface Project {
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

// About
interface About {
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
```

---

## API Contract

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:slug` | Get single project |
| GET | `/api/about` | Get about/contact info |

### Response: GET /api/projects
```json
{
  "projects": [
    {
      "name": "Project Name",
      "slug": "project-name",
      "description": "Short description",
      "url": "https://project.com",
      "techStack": ["React", "Node.js"],
      "status": "active"
    }
  ]
}
```

### Response: GET /api/projects/:slug
```json
{
  "project": {
    "name": "Project Name",
    "slug": "project-name",
    "description": "Short description",
    "longDescription": "Full detailed description...",
    "url": "https://project.com",
    "githubUrl": "https://github.com/user/project",
    "techStack": ["React", "Node.js", "PostgreSQL"],
    "status": "active",
    "featured": true,
    "createdAt": "2024-01-15T00:00:00Z"
  }
}
```

### Response: GET /api/about
```json
{
  "name": "Your Name",
  "title": "Full Stack Developer",
  "bio": "Bio text here...",
  "email": "email@example.com",
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "asciiArt": "ASCII art string"
}
```

---

## Implementation Order

### Phase 1: Foundation (Parallel)
- **Backend**: Set up Express, database, GET endpoints, seed data
- **Frontend**: Set up Vite/React, Terminal component shell, basic styling

### Phase 2: Core Features
- **Backend**: Ensure all endpoints working with test data
- **Frontend**: Implement command system, `help`, `clear`, `ls`

### Phase 3: Integration
- **Frontend**: Connect to backend API
- **Frontend**: Implement `cat`, `cd`, `whoami`, `contact`

### Phase 4: Polish
- **Frontend**: Themes, history, tab completion
- **Frontend**: Mobile responsiveness, loading states
- **Backend**: Error handling, validation

### Phase 5: Admin (Optional)
- **Backend**: POST/PUT/DELETE endpoints with auth
- **Frontend/Other**: Admin interface

---

## Development

### Running Locally
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev  # Runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Environment Variables

**Backend (.env)**
```
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/terminal_portfolio
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001
```
