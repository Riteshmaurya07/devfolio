import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const COLUMNS = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected']

const useJobStore = create(
  persist(
    (set, get) => ({
      jobs: {
        Applied: [],
        OA: [],
        Interview: [],
        Offer: [],
        Rejected: [],
      },

      addJob: (columnId, jobData) => {
        const job = {
          id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          company: jobData.company,
          role: jobData.role,
          ctc: jobData.ctc || '',
          dateApplied: jobData.dateApplied || new Date().toISOString().split('T')[0],
          notes: jobData.notes || '',
          location: jobData.location || '',
          jobUrl: jobData.jobUrl || '',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          jobs: {
            ...state.jobs,
            [columnId]: [...state.jobs[columnId], job],
          },
        }))
      },

      moveJob: (jobId, fromColumn, toColumn) => {
        const state = get()
        const job = state.jobs[fromColumn]?.find((j) => j.id === jobId)
        if (!job) return

        set((state) => ({
          jobs: {
            ...state.jobs,
            [fromColumn]: state.jobs[fromColumn].filter((j) => j.id !== jobId),
            [toColumn]: [...state.jobs[toColumn], { ...job, movedAt: new Date().toISOString() }],
          },
        }))
      },

      updateJob: (jobId, columnId, updates) => {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [columnId]: state.jobs[columnId].map((j) =>
              j.id === jobId ? { ...j, ...updates } : j
            ),
          },
        }))
      },

      deleteJob: (jobId, columnId) => {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [columnId]: state.jobs[columnId].filter((j) => j.id !== jobId),
          },
        }))
      },

      reorderJobs: (columnId, newOrder) => {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [columnId]: newOrder,
          },
        }))
      },

      getStats: () => {
        const state = get()
        const total = COLUMNS.reduce((sum, col) => sum + state.jobs[col].length, 0)
        const interviews = state.jobs['Interview'].length
        const offers = state.jobs['Offer'].length
        const successRate = total > 0 ? Math.round((offers / total) * 100) : 0
        return { total, interviews, offers, successRate }
      },
    }),
    {
      name: 'devfolio-jobs',
    }
  )
)

export default useJobStore
