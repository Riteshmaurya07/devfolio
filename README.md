# DevFolio OS 🚀

> **Your all-in-one developer career operating system** — GitHub analytics, LeetCode tracking, AI career coaching, resume builder, job tracker, and more.

![DevFolio OS](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

| Page | Description |
|------|-------------|
| 🏠 **Dashboard** | GitHub heatmap, skill radar, metric cards, activity feed |
| 🐙 **GitHub** | Repo grid, commit frequency, language distribution |
| 💻 **Coding** | LeetCode donut chart, topic coverage, recent submissions |
| 📄 **Resume** | Live A4 preview, auto-fill from GitHub, PDF export |
| 📁 **Projects** | Kanban board (Idea/Building/Deployed) with drag & drop |
| 💼 **Jobs** | 5-column pipeline with stats and drag & drop |
| 🔥 **Streak** | Daily goals, Duolingo-style streak, weekly report |
| 🤖 **AI Advisor** | Chat, mock interview, roadmap generator |
| ⚔️ **Compare** | Side-by-side GitHub profile comparison with share |
| 👤 **Profile** | Shareable public portfolio page |

---

## 🛠️ Tech Stack

- **React 18** + **Vite 5**
- **React Router v6** — nested layouts with Outlet
- **Zustand** — global state (auth, userData, jobs, streak)
- **Tailwind CSS v3** — dark mode via `class` strategy
- **Framer Motion** — page transitions, micro-animations
- **Recharts** — BarChart, PieChart, RadarChart, AreaChart
- **@dnd-kit** — drag & drop for Projects + Jobs Kanban
- **react-activity-calendar** — GitHub contribution heatmap
- **react-to-print** — Resume PDF export
- **html2canvas** — Screenshot share for Compare page
- **date-fns** — Streak date logic
- **Axios** — GitHub API calls
- **react-hot-toast** — Toast notifications
- **Lucide React** — Icons

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd devfolio-os
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# GitHub Personal Access Token (for higher API rate limits)
# Create at: https://github.com/settings/tokens
# Required scopes: public_repo, read:user
VITE_GITHUB_TOKEN=your_github_pat_here

# Anthropic API Key (currently uses mock streaming — see note below)
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── layout/     # Sidebar, Navbar, PageWrapper, BottomNav
│   ├── charts/     # HeatMap, Radar, Pie, Bar, Area charts
│   ├── ui/         # MetricCard, SkeletonCard, Badge, Modal, ProgressRing, Button
│   ├── resume/     # ResumeForm, ResumePreview
│   ├── kanban/     # KanbanBoard, KanbanColumn, TaskCard
│   ├── ai/         # ChatWindow, MessageBubble, PromptChip, ScoreCard, RoadmapView
│   ├── compare/    # CompareCard, StatRow, WinnerBadge
│   └── streak/     # GoalCheckbox, StreakCounter, WeeklyReport
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── GitHub.jsx
│   ├── Coding.jsx
│   ├── Resume.jsx
│   ├── Projects.jsx
│   ├── Jobs.jsx
│   ├── Streak.jsx
│   ├── AIAdvisor.jsx
│   ├── Compare.jsx
│   └── Profile.jsx
├── store/
│   ├── authStore.js        # User auth, persisted
│   ├── userDataStore.js    # GitHub + LeetCode data
│   ├── jobStore.js         # Job kanban, persisted
│   └── streakStore.js      # Streak + Projects, persisted
├── hooks/
│   ├── useGitHub.js        # GitHub API calls
│   ├── useLeetCode.js      # LeetCode mock data
│   ├── useAI.js            # AI streaming (mock)
│   └── useStreak.js        # Streak helpers
├── data/
│   ├── mockLeetCode.js     # Realistic LC mock data
│   └── mockUser.js         # Mock GitHub user
└── utils/
    ├── formatDate.js        # date-fns helpers
    ├── calcSkillScore.js    # Skill score algorithm
    ├── exportPDF.js         # PDF export helper
    └── captureScreenshot.js # html2canvas helper
```

---

## ⚠️ Important Notes

### LeetCode API
LeetCode's API is CORS-blocked in browsers. The app uses **realistic mock data** that mirrors the real API response shape. To use real data, proxy through a backend:
```
POST /api/leetcode { username } → your server → LeetCode GraphQL
```

### AI Advisor
The Anthropic SDK cannot be called from the browser (CORS + API key security). The AI Advisor uses a **mock streaming simulator** that mimics real streaming behavior. To connect real Claude:
1. Create a backend endpoint: `POST /api/ai/chat`
2. Your server uses the Anthropic SDK with `VITE_ANTHROPIC_API_KEY`
3. Swap `simulateStream()` in `src/hooks/useAI.js` with a `fetch()` to your backend

### GitHub Token
Without a token, GitHub API allows 60 requests/hour. With `VITE_GITHUB_TOKEN`, it's 5,000/hour. The token is only used for reading public data.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#0A0A0B` |
| Surface | `#111113` |
| Card | `#16161A` |
| Border | `#1E1E22` |
| Primary (Violet) | `#7C3AED` |
| Secondary (Teal) | `#0D9488` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Font | Inter 400/500/600 |

---

## 📱 Mobile Support

- Sidebar collapses to a **bottom navigation bar** on mobile (`md:hidden`)
- All grids are responsive (1 → 2 → 3 columns)
- Resume preview hidden on mobile (PDF export still works)

---

## 📄 License

MIT © DevFolio OS
