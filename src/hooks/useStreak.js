import { useCallback } from 'react'
import useStreakStore from '@/store/streakStore'

export function useStreak() {
  const store = useStreakStore()

  const checkGoal = useCallback((goalId) => {
    store.checkGoal(goalId)
  }, [store])

  const getTodayStatus = useCallback(() => {
    return store.getTodayGoals()
  }, [store])

  const getWeeklyReport = useCallback(() => {
    return store.getWeeklyReport()
  }, [store])

  const getTodayCompletion = useCallback(() => {
    return store.getTodayCompletion()
  }, [store])

  return {
    streak: store.streak,
    longestStreak: store.longestStreak,
    lastCheckIn: store.lastCheckIn,
    dailyGoals: store.dailyGoals,
    history: store.history,
    checkGoal,
    getTodayStatus,
    getWeeklyReport,
    getTodayCompletion,
  }
}
