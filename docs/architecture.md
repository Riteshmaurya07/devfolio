# Devfolio OS - Multi-User System Architecture

This document defines the complete architectural overhaul required to transition Devfolio from a single-user, local-first application to a fully scalable, multi-user SaaS platform.

## 1. Technology Stack

*   **Frontend:** Next.js (React) with Tailwind CSS (located in `frontend/` directory)
*   **Backend:** FastAPI (Python) (located in `backend/` directory)
*   **Database:** PostgreSQL
*   **Background Jobs & Notifications:** Celery (Worker + Beat) with Redis
    *   *Why:* To handle background synchronization of user data, and power a robust notification service (both time-based and event-based).
*   **Infrastructure:** Docker & Docker Compose

---

## 2. System Architecture Diagram

```mermaid
graph TD
    Client[Web Browser] -->|HTTP / WebSockets| NextJS[Next.js Frontend :3000]
    NextJS -->|REST API / JSON| FastAPI[FastAPI Backend :8000 (CORS Enabled)]
    
    FastAPI -->|SQLAlchemy / asyncpg| Postgres[(PostgreSQL :5432)]
    
    FastAPI -->|Enqueue Event Tasks| Redis[(Redis Broker :6379)]
    Redis -->|Consume Task| CeleryWorker[Celery Worker]
    CeleryBeat[Celery Beat] -->|Schedule Cron / Time-based| Redis
    
    CeleryWorker -->|Async HTTP| ExternalAPIs[External APIs: GitHub, LeetCode, etc.]
    CeleryWorker -->|Save Sync Data & Notifications| Postgres
    FastAPI -->|Live Fetch / Async HTTP| ExternalAPIs
    
    FastAPI -->|SDK| AIServices[AI Providers: Gemini / Anthropic]
```

---

## 3. Database Schema (Entity Relationship)

The schema supports multi-user analytics, background syncing, social features, and a **Notification Service**.

```mermaid
erDiagram
        string auth_provider "local, github, etc."
        string avatar_url
        boolean is_email_verified
        jsonb preferences "Sync preferences"
        datetime created_at
    }

    USER_METRICS {
        uuid id PK
        uuid user_id FK
        int developer_score
        int total_problems_solved
        int current_streak
        datetime updated_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string notification_type
        string title
        string message
        boolean is_read
        datetime created_at
    }

    FRIEND_REQUESTS {
        uuid id PK
        uuid requester_id FK
        uuid addressee_id FK
        string status "pending, accepted, rejected"
    }

    CONNECTED_ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string platform_name
        string platform_username
    }

    PLATFORM_STATS_HISTORY {
        uuid id PK
        uuid account_id FK
        jsonb raw_data
        jsonb parsed_metrics
        datetime recorded_at
    }

    AI_CHATS {
        uuid id PK
        uuid user_id FK
        string title
        string topic
    }

    AI_MESSAGES {
        uuid id PK
        uuid chat_id FK
        string role "user, ai, system"
        text content
        datetime created_at
    }

    RESUMES {
        uuid id PK
        uuid user_id FK
        string title
    }

    RESUME_VERSIONS {
        uuid id PK
        uuid resume_id FK
        jsonb resume_data
        datetime created_at
    }

    ROADMAPS {
        uuid id PK
        uuid user_id FK
        string goal
        boolean is_completed
    }

    ROADMAP_WEEKS {
        uuid id PK
        uuid roadmap_id FK
        int week_number
        string title
    }

    ROADMAP_TASKS {
        uuid id PK
        uuid week_id FK
        string description
        boolean is_completed
    }
```

---

## 4. Notifications Service Flow

The system leverages **Celery and Redis** to decouple notifications from the main API thread:

1.  **Event-Based Notifications:** When a specific action occurs (e.g., User A sends a friend request to User B), the FastAPI backend instantly enqueues an event task to Redis. The Celery Worker picks this up and creates a `NOTIFICATIONS` record in PostgreSQL for User B without blocking the API response for User A.
2.  **Time-Based Notifications:** **Celery Beat** runs on a cron schedule. For example, every 24 hours it can trigger a task that scans for users whose coding streak is about to expire, and pushes a time-based notification to their queue.

---

## 5. API Design (FastAPI Routes)

*   **Auth & Users:** 
    *   `POST /api/auth/register` & `POST /api/auth/login`
    *   `GET /api/auth/github` & `GET /api/auth/github/callback`
    *   `GET /api/users/me` & `GET /api/users/{username}`
*   **Notifications:**
    *   `GET /api/notifications` - Get all user notifications.
    *   `PUT /api/notifications/{id}/read` - Mark a notification as read.
*   **Friends & Social:**
    *   `POST /api/friends/requests` - Send friend request (triggers event notification).
    *   `GET /api/friends/requests` & `PUT /api/friends/requests/{id}/accept`
    *   `GET /api/friends`
    *   `GET /api/leaderboard/global` & `GET /api/leaderboard/friends`
*   **Platforms & Analytics:**
    *   `POST /api/platforms/connect` & `POST /api/platforms/sync`
    *   `GET /api/platforms/analytics`
*   **AI Advisor:**
    *   `GET /api/ai/chats` & `POST /api/ai/chats` & `POST /api/ai/chats/{chat_id}/message`
*   **Feed & Social Platform (Module 10):**
    *   `GET /api/feed` - Composite-cursor paginated feed (own + followed users' posts)
    *   `POST /api/feed/posts` - Create post (rate-limited: 10/hour, content max 5000 chars)
    *   `GET /api/feed/posts/{id}` - Post detail with comments
    *   `POST /api/feed/posts/{id}/comments` - Add comment (rate-limited: 30/min, max 2000 chars)
    *   `POST /api/feed/posts/{id}/like` - Toggle like (idempotent)
    *   `POST /api/feed/posts/{id}/bookmark` - Toggle bookmark (idempotent)
    *   `GET /api/feed/trending` - Trending projects (Celery Beat scored)
*   **Admin Panel (Module 13):**
    *   `POST /api/reports` - User report ingestion (flag post, comment, or user)
    *   `GET /api/admin/users` - Admin user management table (search, pagination, role badges)
    *   `PUT /api/admin/users/{id}/suspend` - Toggle user suspension interlock (protected against self/admin suspension)
    *   `GET /api/admin/analytics` - Platform-wide aggregated metrics
    *   `PUT /api/admin/moderation/posts/{id}/soft-delete` - Soft-delete post with evidence preservation
    *   `GET /api/admin/reports` & `PUT /api/admin/reports/{id}/status` - Moderation queue resolution
    *   `GET /api/admin/audit-logs` - Immutable administrative audit log timeline
*   **Schema Extensions:**
    *   `analytics_events.entity_id` (UUID, nullable) — ties project_view events to specific projects for trending calculation

---

## 6. Project Structure & Docker Architecture

```text
/
├── frontend/             # Next.js application
│   ├── package.json
│   ├── src/
│   └── Dockerfile
├── backend/              # FastAPI application
│   ├── requirements.txt
│   ├── app/
│   └── Dockerfile
└── docker-compose.yml    # Orchestrates all services
```

### Docker Compose Services
1.  **`frontend`**: Next.js app on port `3000`.
2.  **`backend`**: FastAPI app via Uvicorn on port `8000`.
3.  **`db`**: PostgreSQL database on port `5432`.
4.  **`redis`**: Message broker on port `6379`.
5.  **`celery_worker`**: Executes background syncs and processes event-based notifications.
6.  **`celery_beat`**: Schedules periodic syncs and triggers time-based notifications.
