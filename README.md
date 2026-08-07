<div align="center">
  <img src="https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Devfolio+OS" alt="Devfolio OS Logo" width="120" height="120">
  <h1>Devfolio OS</h1>
  <p><strong>A modern, multi-user SaaS platform for developers.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#commands">Commands</a>
  </p>
</div>

---

Devfolio OS is an all-in-one developer portfolio and productivity platform. Built from the ground up as a multi-user SaaS, it provides developers with the tools to sync their coding platform statistics, build interactive roadmaps with AI, craft smart resumes, and compete on global leaderboards.

## Features

*   **Authentication:** Secure email/password login and seamless GitHub OAuth integration via HTTPOnly JWTs.
*   **Platform Sync:** Connect to external platforms (GitHub, LeetCode, etc.) and auto-sync your problem-solving statistics and streaks using background workers.
*   **Global Leaderboards:** Rank developers dynamically using a custom Developer Score algorithm based on synchronized activity.
*   **Social Networking:** Send friend requests, build connections, and track mutual connections.
*   **Smart Resumes:** A drag-and-drop resume builder complete with version history (append-only JSONB versioning) and PDF export capabilities.
*   **AI Advisor:** Engage with an LLM-powered assistant to generate personalized, multi-week learning roadmaps or to conduct mock interviews.

## Tech Stack

**Frontend**
*   [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
*   [React](https://reactjs.org/) & [Tailwind CSS](https://tailwindcss.com/)
*   [Zustand](https://github.com/pmndrs/zustand) (State Management)

**Backend & Data**
*   [FastAPI](https://fastapi.tiangolo.com/) (Python Async API)
*   [PostgreSQL 15](https://www.postgresql.org/) & [SQLAlchemy](https://www.sqlalchemy.org/) (Async ORM)
*   [Alembic](https://alembic.sqlalchemy.org/en/latest/) (Database Migrations)

**Background & Infrastructure**
*   [Celery](https://docs.celeryq.dev/en/stable/) & [Redis](https://redis.io/) (Task Queues & Cron Scheduling)
*   [Docker](https://www.docker.com/) & Docker Compose

---

## Getting Started

Follow these steps to get Devfolio OS running on your local machine.

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop)
*   Git / Bash Terminal (WSL/Git Bash if on Windows)

### 2. Configuration
Clone the repository and set up your environment variables:

```bash
git clone https://github.com/your-org/devfolio-os.git
cd devfolio-os

# Create your local environment file
cp .env.example .env.local
```

> **Note:** Open `.env.local` and add your LLM API Keys (Gemini/Anthropic) to test the AI Advisor features.

### 3. Launch the Platform
We provide an all-in-one bash utility to manage the entire application lifecycle. Run:

```bash
bash start_local.sh
```

**What this script does automatically:**
1. Verifies your Docker installation and checks if required ports are free.
2. Builds the `frontend`, `backend`, and `celery` images.
3. Provisions the PostgreSQL database and Redis instance.
4. Waits for health checks and automatically runs Alembic Database Migrations.

### 4. Access the Application
Once the launch sequence completes, access the system at:
*   **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:8000](http://localhost:8000)
*   **Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Command Reference (`start_local.sh`)

Managing the application lifecycle is easy with the included utility script:

| Command | Description |
| :--- | :--- |
| `bash start_local.sh start` | Start all services (default behavior). |
| `bash start_local.sh start --fresh` | Nuke the database, wipe all images, and perform a full cold rebuild. |
| `bash start_local.sh stop` | Gracefully stop all services (retains database state). |
| `bash start_local.sh restart` | Stop and start services. |
| `bash start_local.sh logs` | Tail the Docker Compose logs for all services. |
| `bash start_local.sh shell backend`| Drop into an interactive shell inside the specified container. |
| `bash start_local.sh db` | Drop into an interactive PostgreSQL `psql` shell. |
| `bash start_local.sh migrate` | Manually auto-generate and apply Alembic migrations. |

### Database Migrations (Alembic Workflow)
To modify database models or apply migrations directly in the backend container:
1. **Generate a migration:** `docker compose exec backend alembic revision --autogenerate -m "description"`
2. **Apply migrations:** `docker compose exec backend alembic upgrade head`

## Architecture Overview

Devfolio OS uses a Domain-Driven Design (DDD) approach in the backend for strict modularity, organized around the following bounded contexts:

*   **`users`**: Core identity, authentication, and JWT handling.
*   **`platforms`**: Background integration connectors for LeetCode and GitHub.
*   **`leaderboard`**: Caches and ranks the Developer Score.
*   **`social`**: Mutual connections and friend requests.
*   **`notifications`**: WebSocket and long-polling ready events powered by Celery Beat.
*   **`resumes`**: Managing resume metadata and its heavily versioned JSON structures.
*   **`ai` / `roadmaps`**: Specialized domains for communicating with Large Language Models.

All state transitions and domain logic are thoroughly abstracted away from Routers and Repositories into dedicated Service classes, ensuring long-term maintainability and simple unit testing.
