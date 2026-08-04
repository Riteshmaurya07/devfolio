# Devfolio OS

A modern, multi-user SaaS platform for developers. Features include profile building, platform syncing (GitHub/LeetCode), AI chat advisors, interactive roadmaps, smart resume building, and global leaderboards.

## Architecture

- **Frontend**: Next.js 14, Tailwind CSS, Zustand, App Router
- **Backend**: FastAPI, SQLAlchemy (Async), PostgreSQL, Alembic
- **Background Jobs**: Celery, Redis (Beat for cron tasks, Workers for async logic)
- **Deployment**: Fully containerized with Docker Compose

## Features

- **Auth**: Email/Password + GitHub OAuth (JWT with HTTPOnly cookies)
- **Platform Sync**: Integrates with external coding platforms to aggregate statistics.
- **Analytics**: Calculates global Developer Scores and tracks problem-solving streaks.
- **Social**: Send friend requests and track mutual connections.
- **Smart Resumes**: Drag-and-drop resume builder with built-in version control.
- **AI Advisor**: Converse with an AI assistant or generate learning roadmaps.

## Getting Started

Make sure you have Docker and Docker Compose installed.

1. Create a `.env` file in the `backend/` directory with your database/redis configuration.
2. Run the startup script:

```bash
bash start_local.sh
```

### Accessing the Platform
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
