# Devfolio OS — User Perspective Feature Flows

## 0. Overall Product Flow
The product should conceptually work like this:

```text
User visits Devfolio OS
        │
        ▼
 Authentication
        │
        ▼
   Onboarding
        │
        ├── Connect GitHub
        ├── Connect LeetCode
        ├── Connect other platforms
        └── Set preferences
        │
        ▼
    Dashboard
        │
        ├── Overall coding score
        ├── Platform statistics
        ├── Activity / progress
        ├── Streaks
        ├── Notifications
        └── Quick actions
        │
        ├──────────────┬──────────────┬───────────────┐
        ▼              ▼              ▼               ▼
    Analytics       Roadmap         Resume           AI
        │              │              │               │
        └──────────────┴──────────────┴───────────────┘
                         │
                         ▼
                   Social System
                         │
                 Friends / Leaderboard
```
*The important point is that Dashboard is not the source of truth. It is a presentation layer that combines data from platforms, analytics, social, roadmap, resume, etc.*

---

## 1. Registration & Authentication

### 1.1 Email/Password Registration
**User Flow:**
```text
 Landing Page
      │
      ▼
   Sign Up
      │
      ▼
 Enter:
 - Username
 - Email
 - Password
      │
      ▼
 Create Account
      │
      ▼
 Verification Email
      │
      ▼
 User clicks verification link
      │
      ▼
 Email verified
      │
      ▼
    Login
      │
      ▼
 Dashboard / Onboarding
```
**Important behavior:**
- Username and email must be unique.
- Password should never be stored directly.
- The user should not be treated as fully verified until email verification succeeds.

---

## 2. GitHub OAuth Login
```text
      Login
        │
        ▼
Continue with GitHub
        │
        ▼
   GitHub OAuth
        │
        ▼
User authorizes Devfolio
        │
        ▼
  GitHub callback
        │
        ├── Existing account?
        │       │
        │       └── Login
        │
        └── New account?
                │
                ▼
            Create user
                │
                ▼
          Connect GitHub
                │
                ▼
             Dashboard
```
*GitHub authentication and GitHub platform synchronization are related, but they should not be treated as the same thing. A user can authenticate with GitHub, but the platform integration should still have its own lifecycle.*

---

## 3. Login / Session Flow
```text
User enters credentials
        │
        ▼
Backend validates credentials
        │
        ▼
Access Token + Refresh Token
        │
        ▼
Authenticated session
        │
        ▼
User accesses protected APIs
```
**When the access token expires:**
```text
    API request
         │
         ▼
Access token expired
         │
         ▼
   Refresh token
         │
         ▼
  New access token
         │
         ▼
  Continue session
```
**If refresh fails:**
```text
   Refresh failed
         │
         ▼
  Session invalid
         │
         ▼
     Login page
```

---

## 4. Password Reset
```text
      Login
        │
        ▼
 Forgot Password
        │
        ▼
    Enter email
        │
        ▼
Receive reset email
        │
        ▼
  Open reset link
        │
        ▼
Enter new password
        │
        ▼
  Password updated
        │
        ▼
      Login
```
*The reset token should be short-lived and single-use.*

---

## 5. Account Management
**The user should be able to:**
```text
     Profile
        │
        ├── Change username
        ├── Change email
        ├── Change password
        ├── Manage connected accounts
        ├── Notification preferences
        └── Delete account
```
**Username change:**
```text
 Current username
        │
        ▼
Enter new username
        │
        ▼
Check availability
        │
        ▼
     Confirm
        │
        ▼
Username updated
```
*All internal relationships continue using the immutable `user_id`.*

---

## 6. Onboarding
**After first registration:**
```text
  Account created
        │
        ▼
  Welcome / Setup
        │
        ├── Profile information
        │
        ├── Connect platforms
        │
        ├── Choose goals
        │
        └── Preferences
        │
        ▼
Initial synchronization
        │
        ▼
     Dashboard
```
*The user shouldn't be forced to connect every platform. They should be able to skip and connect later.*

---

## 7. Dashboard
**The dashboard is the user's central view.**
```text
Dashboard
│
├── Overall Score
├── Platform Summary
│   ├── GitHub
│   ├── LeetCode
│   └── Other platforms
│
├── Coding Activity
├── Streak
├── Recent Activity
├── Progress
├── Roadmap Progress
├── Resume Status
├── Notifications
└── Friends / Ranking
```
**User perspective:** The user opens Devfolio and should immediately understand: *"How am I doing right now?"* Not: *"Here are 17 database records."*

---

## 8. Platform Connection
This needs to support two connection methods.

**OAuth-capable platform:**
```text
   Platforms
       │
       ▼
 Connect GitHub
       │
       ▼
OAuth authorization
       │
       ▼
 Account connected
       │
       ▼
   Initial sync
       │
       ▼
Statistics available
```

**Username-based platform:**
```text
   Platforms
       │
       ▼
 Connect LeetCode
       │
       ▼
  Enter username
       │
       ▼
  Validate account
       │
       ▼
 Account connected
       │
       ▼
   Initial sync
```

---

## 9. Platform Synchronization (Manual Sync)
```text
     User:
       │
   Platforms
       │
       ▼
     GitHub
       │
       ▼
    Sync Now
       │
       ▼
Sync starts immediately
       │
       ▼
   External API
       │
       ▼
   Process data
       │
       ▼
  Save snapshot
       │
       ▼
 Update analytics
       │
       ▼
 Dashboard updated
```
**The UI should show:** `Syncing...` then `Last synced: Just now` or `Sync failed / Try again`.

---

## 10. Automatic Synchronization (Background)
```text
   Celery Beat
        │
        ▼
  Scheduled sync
        │
        ▼
Find accounts needing sync
        │
        ▼
 Create sync tasks
        │
        ▼
   Celery Worker
        │
        ▼
    Platform API
        │
        ▼
   Save snapshot
        │
        ▼
  Update analytics
```
*The user doesn't need to do anything. When they open the dashboard later, they see updated information.*

---

## 11. Analytics
The user should be able to move from **Current performance** to **Historical performance**.
```text
Analytics
│
├── Overall Score
│
├── GitHub
│   ├── Contributions
│   ├── Repositories
│   └── Activity
│
├── LeetCode
│   ├── Problems solved
│   ├── Easy
│   ├── Medium
│   └── Hard
│
├── Platform comparison
│
└── Historical trends
```
**Historical flow:**
```text
  Platform sync
        │
        ▼
 Snapshot created
        │
        ▼
Historical database
        │
        ▼
  Analytics query
        │
        ▼
   Chart / trend
```
*So the user can see Score: Jan ── 42, Feb ── 48, Mar ── 55, etc.*

---

## 12. Overall Score
The leaderboard and dashboard should calculate a platform-based score.
```text
     GitHub Score
          +
    LeetCode Score
          +
   Codeforces Score
          +
Other Platform Scores
          │
          ▼
    Overall Score
```
*AI score is excluded. This same scoring system should be centralized across Dashboard, Leaderboard, Profile, and Analytics.*

---

## 13. Leaderboard
**Global leaderboard:**
```text
  Leaderboard
       │
       ▼
     Global
       │
       ▼
Rank users by Overall Score
```
**Friends leaderboard:**
```text
  Leaderboard
       │
       ▼
    Friends
       │
       ▼
Rank only your friends
```
*AI score does not participate.*

---

## 14. Profile
A public profile could show: Username, Avatar, Overall Score, Platforms, Achievements, Roadmap progress, Resume.
**Private information must not leak** (e.g., Email, Password, Private AI conversations, Private resume data).

---

## 15. Friends
**Send request:**
```text
   Search user
        │
        ▼
   Open profile
        │
        ▼
    Add Friend
        │
        ▼
Friend Request created
        │
        ├───────────────► Notification for recipient
        │
        ▼
     Pending
```
**Accept/Reject:**
```text
  Recipient:
 Notifications
       │
       ▼
 Friend Request
       │
       ├── Accept ──► Both users are friends
       │
       └── Reject ──► Request closed
```

---

## 16. Notifications
**Event notification:**
```text
User A sends friend request
             │
             ▼
   FastAPI creates request
             │
             ▼
         Event task
             │
             ▼
           Celery
             │
             ▼
Notification created for User B
             │
             ▼
  User B opens application
             │
             ▼
Notification appears immediately
```
*Needs a real-time mechanism (WebSocket or SSE) on the frontend/backend boundary.*

---

## 17. Notification Read Flow
```text
 New notification
        │
        ▼
   Unread badge
        │
        ▼
User opens notification
        │
        ▼
Notification marked read
```
*The UI should update immediately.*

---

## 18. AI Advisor
```text
  Create conversation
          │
          ▼
     Choose topic
          │
          ├── General
          ├── Interview
          └── Roadmap
          │
          ▼
        Chat
```
**Message flow:**
```text
   User message
        │
        ▼
     Frontend
        │
        ▼
     FastAPI
        │
        ▼
    AI service
        │
        ▼
Gemini / Anthropic
        │
        ▼
   AI response
        │
        ▼
   Save message
        │
        ▼
  Display response
```
*For scalable storage: Save individual `User message` and `Assistant message` rows in the DB.*

---

## 19. AI Interview Mode
```text
  AI Advisor
      │
      ▼
  Interview
      │
      ▼
Choose role/topic
      │
      ▼
AI asks question
      │
      ▼
  User answers
      │
      ▼
 AI evaluates
      │
      ▼
 Next question
```

---

## 20 & 21. Roadmap Generation & Management
**Generation:**
```text
   Roadmaps
      │
      ▼
Create Roadmap
      │
      ▼
  Enter goal
      │
      ▼
AI generates roadmap
      │
      ▼
    Weeks
      │
      ▼
    Tasks
      │
      ▼
 User reviews
      │
      ▼
 Save roadmap
```
**Management:** User can mark task complete, reopen task, edit task, edit roadmap, regenerate roadmap, track progress.

---

## 22 & 23. Resume Builder & Autosave
**Creation:**
```text
   Resume
     │
     ▼
Create Resume
     │
     ▼
Choose Template
     │
     ▼
Fill information
```
**Autosave:**
```text
User stops typing
        │
        ▼
    Autosave
        │
        ▼
     Backend
        │
        ▼
New resume version
```
*Use debounced autosave and an appropriate versioning strategy.*

---

## 24. Resume Version History
```text
    Resume
      │
      ▼
Version History
      │
      ├── v5 Current
      ├── v4
      ├── v3
      ├── v2
      └── v1
```
*Restoring should create a new version rather than destroying history.*

---

## 25. Resume PDF Generation
```text
    Resume
      │
      ▼
Select template
      │
      ▼
    Preview
      │
      ▼
 Generate PDF
      │
      ▼
 PDF renderer
      │
      ▼
      PDF
```

---

## 26. Resume Templates
```text
Create Resume
      │
      ▼
  Templates
      │
      ├── Modern
      ├── Minimal
      ├── Professional
      └── ...
      │
      ▼
Select template
      │
      ▼
 Resume editor
```
*Template and resume data should be separated.*

---

## 27. Platform Management & Disconnect
```text
Connected Platform
       │
       ▼
   Disconnect
       │
       ▼
  Confirmation
       │
       ▼
Remove connection
```
*Disconnecting an account should not necessarily delete historical analytics.*

---

## 29. Account Deletion
```text
     Settings
        │
        ▼
  Delete Account
        │
        ▼
     Warning
        │
        ▼
     Confirm
        │
        ▼
Delete/anonymize data
        │
        ▼
 Invalidate sessions
        │
        ▼
  Account deleted
        │
        ▼
    Logged out
```

---

## 30. Settings
```text
Settings
├── Profile
│   ├── Username
│   ├── Email
│   └── Avatar
│
├── Security
│   ├── Password
│   ├── Sessions
│   └── Account deletion
│
├── Connected Platforms
│
├── Notifications
│
└── Preferences
```

---

## 31. Complete User Journey
```text
                    ┌───────────────┐
                    │    Landing    │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ Auth / Signup │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │   Onboarding  │
                    └───────┬───────┘
                            │
              ┌─────────────▼─────────────┐
              │         Dashboard         │
              └─────────────┬─────────────┘
                            │
       ┌────────┬───────────┼───────────┬─────────┐
       │        │           │           │         │
       ▼        ▼           ▼           ▼         ▼
   Platforms Analytics    Roadmaps    Resume      AI
       │        │           │           │         │
       └────────┴───────────┴───────────┴─────────┘
                            │
                            ▼
                      Social System
                            │
                    ┌───────┴────────┐
                    ▼                ▼
                 Friends         Leaderboard
                    │
                    ▼
              Notifications
```
