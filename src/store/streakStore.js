import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, differenceInDays, parseISO, isToday, isYesterday } from 'date-fns'

const DAILY_GOALS = [
  { id: 'leetcode', label: '1 LeetCode problem', icon: '💻' },
  { id: 'commit', label: '1 GitHub commit', icon: '🔨' },
  { id: 'study', label: '30 min study', icon: '📚' },
]

const useStreakStore = create(
  persist(
    (set, get) => ({
      streak: 0,
      longestStreak: 0,
      lastCheckIn: null,
      dailyGoals: DAILY_GOALS,

      // { "2024-01-15": { leetcode: true, commit: false, study: true } }
      history: {},

      // Projects Kanban (stored here for convenience)
      projects: {
        Idea: [],
        Building: [],
        Deployed: [],
      },

      checkGoal: (goalId) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const state = get()
        const todayRecord = state.history[today] || {}

        const updated = {
          ...todayRecord,
          [goalId]: !todayRecord[goalId],
        }

        set((state) => ({
          history: {
            ...state.history,
            [today]: updated,
          },
        }))

        // Recalculate streak
        get().recalculateStreak()
      },

      getTodayGoals: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const state = get()
        return state.history[today] || {}
      },

      getTodayCompletion: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const state = get()
        const record = state.history[today] || {}
        const completed = Object.values(record).filter(Boolean).length
        return { completed, total: DAILY_GOALS.length }
      },

      recalculateStreak: () => {
        const state = get()
        const history = state.history

        let streak = 0
        let checkDate = new Date()

        // Walk backwards from today
        while (true) {
          const dateKey = format(checkDate, 'yyyy-MM-dd')
          const record = history[dateKey]
          const allDone = record && DAILY_GOALS.every((g) => record[g.id])

          if (allDone) {
            streak++
            checkDate = new Date(checkDate)
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }

        const longestStreak = Math.max(streak, state.longestStreak)
        const lastCheckIn = format(new Date(), 'yyyy-MM-dd')

        set({ streak, longestStreak, lastCheckIn })
      },

      getWeeklyReport: () => {
        const report = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateKey = format(d, 'yyyy-MM-dd')
          const state = get()
          const record = state.history[dateKey] || {}
          const completed = DAILY_GOALS.filter((g) => record[g.id]).length
          const pct = Math.round((completed / DAILY_GOALS.length) * 100)
          report.push({
            date: dateKey,
            label: format(d, 'EEE'),
            completed,
            total: DAILY_GOALS.length,
            pct,
          })
        }
        return report
      },

      // Projects methods
      addProject: (columnId, projectData) => {
        const project = {
          id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: projectData.name,
          description: projectData.description || '',
          techStack: projectData.techStack || [],
          githubUrl: projectData.githubUrl || '',
          demoUrl: projectData.demoUrl || '',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          projects: {
            ...state.projects,
            [columnId]: [...state.projects[columnId], project],
          },
        }))
      },

      moveProject: (projectId, fromColumn, toColumn) => {
        const state = get()
        const project = state.projects[fromColumn]?.find((p) => p.id === projectId)
        if (!project) return

        set((state) => ({
          projects: {
            ...state.projects,
            [fromColumn]: state.projects[fromColumn].filter((p) => p.id !== projectId),
            [toColumn]: [...state.projects[toColumn], project],
          },
        }))
      },

      deleteProject: (projectId, columnId) => {
        set((state) => ({
          projects: {
            ...state.projects,
            [columnId]: state.projects[columnId].filter((p) => p.id !== projectId),
          },
        }))
      },

      updateProject: (projectId, columnId, updates) => {
        set((state) => ({
          projects: {
            ...state.projects,
            [columnId]: state.projects[columnId].map((p) =>
              p.id === projectId ? { ...p, ...updates } : p
            ),
          },
        }))
      },
    }),
    {
      name: 'devfolio-streak',
    }
  )
)

export default useStreakStore
