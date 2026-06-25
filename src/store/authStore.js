import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => {
        set({
          user: {
            id: userData.id || userData.login,
            login: userData.login,
            name: userData.name || userData.login,
            avatar_url: userData.avatar_url,
            html_url: userData.html_url,
            bio: userData.bio || '',
            company: userData.company || '',
            location: userData.location || '',
            public_repos: userData.public_repos || 0,
            followers: userData.followers || 0,
            following: userData.following || 0,
            email: userData.email || '',
          },
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        const current = get().user
        set({ user: { ...current, ...updates } })
      },
    }),
    {
      name: 'devfolio-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
