import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserDataStore = create(
  persist(
    (set, get) => ({
      // GitHub data
      githubData: null,
      repos: [],
      events: [],
      languages: {},
      contributions: [],

      // LeetCode data
      leetcodeData: null,

      // Computed skill score
      skillScore: null,

      // Loading states
      githubLoading: false,
      leetcodeLoading: false,

      // Setters
      setGitHubData: (data) => {
        set({
          githubData: data.profile,
          repos: data.repos || [],
          events: data.events || [],
          languages: data.languages || {},
          contributions: data.contributions || [],
          githubLoading: false,
        })
      },

      setLeetCodeData: (data) => {
        set({
          leetcodeData: data,
          leetcodeLoading: false,
        })
      },

      setGitHubLoading: (loading) => set({ githubLoading: loading }),
      setLeetCodeLoading: (loading) => set({ leetcodeLoading: loading }),

      setSkillScore: (score) => set({ skillScore: score }),

      clearData: () => set({
        githubData: null,
        repos: [],
        events: [],
        languages: {},
        contributions: [],
        leetcodeData: null,
        skillScore: null,
      }),
    }),
    {
      name: 'devfolio-userdata',
      partialize: (state) => ({
        githubData: state.githubData,
        repos: state.repos,
        languages: state.languages,
        contributions: state.contributions,
        leetcodeData: state.leetcodeData,
        skillScore: state.skillScore,
      }),
    }
  )
)

export default useUserDataStore
