# Devfolio OS - Master Implementation Roadmap

## Milestone 1: Infrastructure & Core Backend Foundation
*   **Objective:** Setup Docker, monorepo structure, FastAPI boilerplate (Domain-Driven), and PostgreSQL + Alembic.
*   **Scope:** Docker Compose, DB connection, Base models, Alembic migrations, Error handling, Dependency Injection container.
*   **APIs:** `GET /health`

## Milestone 2: Authentication & User Domain
*   **Objective:** Implement hybrid auth (Email + GitHub OAuth) with JWT and Refresh tokens (HttpOnly).
*   **Scope:** User model, Auth service, GitHub OAuth connector, JWT middleware.
*   **APIs:** `/api/auth/register`, `/api/auth/login`, `/api/auth/github`, `/api/auth/refresh`, `/api/users/me`

## Milestone 3: Platform Integrations & Background Jobs (Celery)
*   **Objective:** Implement the platform abstraction layer, Redis caching, and Celery workers for syncing.
*   **Scope:** Base `PlatformConnector` interface. GitHub & LeetCode implementations. Celery worker setup.
*   **APIs:** `/api/platforms/connect`, `/api/platforms/sync`

## Milestone 4: Frontend Foundation & Auth Integration
*   **Objective:** Setup Next.js, Tailwind, state management (Zustand), and connect to backend auth.
*   **Scope:** Next.js scaffolding, UI component library (shadcn/radix based), Login page, Dashboard shell (Sidebar/Navbar).

## Milestone 5: Core Features - Analytics & Leaderboard
*   **Objective:** Aggregate synced data into `USER_METRICS` and display on the dashboard.
*   **Scope:** Dashboard charts, global and friends leaderboard APIs, frontend integration.
*   **APIs:** `/api/leaderboard/global`, `/api/leaderboard/friends`

## Milestone 6: Social System (Friends) & Notifications
*   **Objective:** Implement friend requests, mutual connections, and the notification engine (Event + Time-based).
*   **Scope:** `FRIEND_REQUESTS` and `NOTIFICATIONS` tables, Celery beat for time-based notifications.
*   **APIs:** `/api/friends/*`, `/api/notifications/*`

## Milestone 7: Smart Resume Builder
*   **Objective:** Implement the resume builder with versioning and profile data import.
*   **Scope:** `RESUMES` and `RESUME_VERSIONS` backend CRUD, Frontend Drag & Drop builder, PDF Export.
*   **APIs:** `/api/resumes/*`

## Milestone 8: AI Advisor (Chats & Roadmaps)
*   **Objective:** Integrate LLMs (Gemini/Anthropic) for chat, mock interviews, and roadmap generation.
*   **Scope:** Normalized AI chat backend, Roadmap generation prompt chain, interactive Roadmap UI.
*   **APIs:** `/api/ai/chats/*`, `/api/roadmaps/*`

## Milestone 9: Polish, Testing & Production Readiness
*   **Objective:** Final security sweep, performance optimization, and production Dockerfiles.
