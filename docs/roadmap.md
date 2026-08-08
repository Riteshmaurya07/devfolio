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

---

# Detailed Feature Flows (Implementation Checklist)

## 0. Overall Product Flow
- [ ] Implement global routing logic: `Authentication -> Onboarding (Connect Platforms/Preferences) -> Dashboard`.
- [ ] Ensure Dashboard is acting purely as a presentation layer combining analytics, social, roadmaps, and resume data.

## 1. Registration & Authentication
- [ ] **1.1 Email/Password Registration Flow**: Landing -> Sign Up (Username, Email, Password) -> Verification Email.
- [ ] Ensure username and email uniqueness constraints in DB.
- [ ] Ensure passwords are never stored directly (Bcrypt hashing implemented).
- [ ] Implement email verification gate (user not fully verified until clicked).

## 2. GitHub OAuth Login
- [ ] Implement "Continue with GitHub" flow.
- [ ] Handle callback: Login if existing, Create user & connect GitHub if new.
- [ ] Separate GitHub authentication from GitHub platform statistics integration.

## 3. Login / Session Flow
- [ ] Validate credentials -> Issue Access Token + Refresh Token.
- [ ] Implement token refresh flow when access token expires.
- [ ] Implement redirect to Login page if refresh token fails/expires.

## 4. Password Reset
- [ ] Implement "Forgot Password" flow -> Email reset link.
- [ ] Ensure reset token is short-lived and single-use.
- [ ] Implement password update form and confirmation.

## 5. Account Management
- [ ] **Profile Settings**: Allow changing username, email, password, notification preferences.
- [ ] Implement live "username availability" check.
- [ ] Ensure all relationships use immutable `user_id`, not username.

## 6. Onboarding
- [ ] Build Welcome/Setup screens after first registration.
- [ ] Allow users to optionally connect platforms, choose goals, and set preferences.
- [ ] Implement "Skip for now" functionality for platform connections.

## 7. Dashboard
- [ ] Build central view: Overall Score, Platform Summary (GitHub, LeetCode, etc.).
- [ ] Add modules for Coding Activity, Streak, Recent Activity, Progress, Roadmap Progress, Resume Status.
- [ ] Add Notifications and Friends/Ranking widgets.

## 8. Platform Connection
- [ ] **OAuth Platforms (GitHub)**: Implement OAuth flow for statistics syncing.
- [ ] **Username-based Platforms (LeetCode)**: Implement username validation and initial sync.

## 9. Platform Synchronization (Manual)
- [ ] Implement "Sync Now" button on frontend.
- [ ] Trigger background job -> Fetch External API -> Save snapshot -> Update analytics -> Update Dashboard.
- [ ] Display real-time UI statuses: "Syncing...", "Last synced: Just now", or "Sync failed".

## 10. Automatic Synchronization (Background)
- [ ] Configure Celery Beat for scheduled syncs.
- [ ] Auto-create sync tasks for stale accounts -> Celery Worker -> External API -> Update analytics.

## 11. Analytics
- [ ] Build charts for Current Performance vs Historical Performance.
- [ ] Aggregate platform-specific metrics (GitHub contributions, LeetCode problems, etc.).
- [ ] Plot historical trend graphs from database snapshots (e.g., Score over time).

## 12. Overall Score System
- [ ] Implement centralized scoring logic (`Overall Score = GitHub Score + LeetCode Score + Codeforces Score + ...`).
- [ ] Ensure AI score is excluded from overall ranking.
- [ ] Use the exact same scoring formula for Dashboard, Leaderboard, Profile, and Analytics.

## 13. Leaderboard
- [ ] **Global Leaderboard**: Rank all users by Overall Score.
- [ ] **Friends Leaderboard**: Filter rankings strictly to connected friends.

## 14. Public Profile
- [ ] Build public view: Username, Avatar, Overall Score, Platform Stats, Achievements, Roadmap Progress, Resume.
- [ ] **Security**: Ensure private data (Email, Password, AI chats, private resume details) are strictly hidden from public API responses.

## 15. Friends System
- [ ] **Send Request**: Search user -> Add Friend -> Create Pending Request -> Send Notification.
- [ ] **Accept Request**: Notification -> Accept -> Mutual Friendship established.
- [ ] **Reject Request**: Close request without creating friendship.

## 16 & 17. Notifications
- [ ] Implement strictly in-app notifications (no email/SMS/push).
- [ ] Implement event-based triggers (e.g., FastAPI -> Celery -> Notification record).
- [ ] Build WebSocket or SSE connection for real-time delivery without page refresh.
- [ ] Implement "Unread badge" and "Mark as read" flow on click.

## 18 & 19. AI Advisor (Chat & Interview)
- [ ] Build AI Chat UI with topic selection (General, Interview, Roadmap).
- [ ] Implement message flow: Frontend -> FastAPI -> Gemini/Anthropic -> Save -> Display.
- [ ] Store messages scalably (individual `Chat Messages` records, not a single massive JSON array).
- [ ] Implement **AI Interview Mode**: Select role -> AI asks -> User answers -> AI evaluates -> Next question.

## 20 & 21. Roadmap Generation & Management
- [ ] Build Roadmap generation prompt chain (User inputs goal -> AI generates weeks & tasks).
- [ ] Allow user to review and save the generated roadmap.
- [ ] Implement roadmap management: mark task complete, reopen, edit, regenerate, track completion percentage.

## 22 & 23. Resume Builder & Autosave
- [ ] Build Resume Builder UI with standard sections (Education, Experience, Projects, Skills, etc.).
- [ ] Implement **Debounced Autosave**: Fire backend update only when user stops typing.
- [ ] Display "Saving..." -> "Saved" UI states.

## 24. Resume Version History
- [ ] Implement version tracking (v1, v2, v3, Current).
- [ ] Allow users to view past versions and "Restore" them (creates a new version, doesn't destroy history).

## 25 & 26. Resume PDF & Templates
- [ ] Separate resume data from visual templates.
- [ ] Allow switching between templates (Modern, Minimal, Professional) without losing data.
- [ ] Implement PDF Generation (Synchronous is fine for standard resumes).

## 27 & 28. Platform Management & Disconnect
- [ ] Build "Connected Platforms" settings page showing sync status for each.
- [ ] Implement "Disconnect" flow with confirmation.
- [ ] **Crucial**: Keep historical analytics snapshots when a platform is disconnected, unless the user explicitly requests data deletion.

## 29. Account Deletion
- [ ] Implement explicit, destructive account deletion flow with warning and confirmation.
- [ ] Define and implement cascading deletion/anonymization rules for platforms, snapshots, resumes, AI chats, roadmaps, notifications, and friendships.
- [ ] Invalidate all active sessions.

## 30. Settings Menu Structure
- [ ] Build Settings navigation: Profile, Security, Connected Platforms, Notifications, Preferences.

## 31. Complete User Journey Flow Test
- [ ] E2E Test the full journey: Landing -> Signup -> Onboarding -> Dashboard -> Features -> Social -> Settings.
