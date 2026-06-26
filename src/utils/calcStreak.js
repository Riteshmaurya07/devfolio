/**
 * calcStreak.js
 * Calculates the current GitHub contribution streak from the
 * contribution calendar data returned by the GitHub GraphQL API.
 *
 * A "streak" is the number of consecutive days (going backwards from today
 * or yesterday) on which there was at least 1 contribution.
 * 
 * - If you contributed today: streak counts from today backwards.
 * - If you didn't contribute today but did yesterday: streak still counts
 *   from yesterday (you have until midnight to maintain it).
 */

export function calcGitHubStreak(contributions = []) {
  if (!contributions || contributions.length === 0) return 0

  // Sort ascending by date just in case
  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date))

  // Build a date → count map
  const map = {}
  sorted.forEach(({ date, count }) => {
    map[date] = count
  })

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Build yesterday string
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Start streak from today if contributed today, otherwise from yesterday
  let startDate
  if (map[todayStr] > 0) {
    startDate = new Date(today)
  } else if (map[yesterdayStr] > 0) {
    startDate = new Date(yesterday)
  } else {
    return 0 // streak is broken
  }

  // Walk backwards counting consecutive days with contributions
  let streak = 0
  const cursor = new Date(startDate)

  let checking = true
  while (checking) {
    const dateStr = cursor.toISOString().split('T')[0]
    if (map[dateStr] === undefined || map[dateStr] === 0) {
      checking = false
      break
    }
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

/**
 * Calculates the longest streak in the entire contribution history.
 */
export function calcLongestStreak(contributions = []) {
  if (!contributions || contributions.length === 0) return 0

  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date))

  let longest = 0
  let current = 0
  let prevDate = null

  sorted.forEach(({ date, count }) => {
    if (count > 0) {
      if (prevDate) {
        const prev = new Date(prevDate)
        prev.setDate(prev.getDate() + 1)
        const expectedNext = prev.toISOString().split('T')[0]
        if (date === expectedNext) {
          current++
        } else {
          current = 1 // gap — restart
        }
      } else {
        current = 1
      }
      longest = Math.max(longest, current)
      prevDate = date
    } else {
      current = 0
      prevDate = date
    }
  })

  return longest
}
