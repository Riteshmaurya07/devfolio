import { useState, useCallback } from 'react'
import axios from 'axios'
import useUserDataStore from '@/store/userDataStore'
import { calcSkillScore } from '@/utils/calcSkillScore'

const BASE_URL = 'https://api.github.com'

const getHeaders = () => {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  // Skip placeholder/empty values
  if (!token || token.includes('your_') || token.length < 10) return {}
  return { Authorization: `Bearer ${token}` }
}

// ─── GitHub GraphQL — real contribution calendar ────────────────────────────
// Same data displayed on your GitHub profile page (green squares).
// Requires a token with at least public read scope.

async function fetchContributionCalendar(username, token) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { username } }),
  })

  if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')

  const weeks =
    json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []

  const contributions = []
  weeks.forEach((week) => {
    week.contributionDays.forEach(({ date, contributionCount }) => {
      contributions.push({ date, count: contributionCount })
    })
  })

  return contributions
}

// ─── Fallback: derive contributions from Events API ─────────────────────────
// The Events API only returns the last ~90 events so this will be sparse,
// but works without a token.

function deriveContributionsFromEvents(events) {
  const contributionMap = {}
  events.forEach((event) => {
    if (event.type === 'PushEvent') {
      const date = event.created_at.split('T')[0]
      const commits = event.payload?.commits?.length || 0
      contributionMap[date] = (contributionMap[date] || 0) + commits
    }
  })
  return Object.entries(contributionMap).map(([date, count]) => ({ date, count }))
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGitHub() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setGitHubData, setSkillScore } = useUserDataStore()

  const fetchUserData = useCallback(async (username) => {
    setLoading(true)
    setError(null)
    try {
      const headers = getHeaders()
      const token = import.meta.env.VITE_GITHUB_TOKEN
      const hasToken = token && !token.includes('your_') && token.length >= 10

      // Fetch profile, repos, events in parallel
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        axios.get(`${BASE_URL}/users/${username}`, { headers }),
        axios.get(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`, { headers }),
        axios.get(`${BASE_URL}/users/${username}/events?per_page=100`, { headers }),
      ])

      const profile = profileRes.data
      const repos = reposRes.data
      const events = eventsRes.data

      // Calculate language distribution from repos
      const langCounts = {}
      repos.forEach((repo) => {
        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + (repo.size || 1)
        }
      })

      // ── Contribution calendar ─────────────────────────────────────────────
      // Prefer GraphQL (exact data matching GitHub profile). Requires a token.
      // Falls back to Events API which only covers ~90 recent events.
      let contributions = []
      if (hasToken) {
        try {
          contributions = await fetchContributionCalendar(username, token)
        } catch (gqlErr) {
          console.warn('[useGitHub] GraphQL contributions failed, falling back to events:', gqlErr.message)
          contributions = deriveContributionsFromEvents(events)
        }
      } else {
        contributions = deriveContributionsFromEvents(events)
      }

      const data = { profile, repos, events, languages: langCounts, contributions }
      setGitHubData(data)

      // Calculate skill score
      const score = calcSkillScore(langCounts, repos)
      setSkillScore(score)

      return data
    } catch (err) {
      const message =
        err.response?.status === 404
          ? 'GitHub user not found'
          : err.response?.status === 403
          ? 'GitHub API rate limit exceeded. Add a VITE_GITHUB_TOKEN to .env'
          : 'Failed to fetch GitHub data'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [setGitHubData, setSkillScore])

  const fetchTwoUsers = useCallback(async (username1, username2) => {
    const headers = getHeaders()
    const fetchOne = async (username) => {
      const [profile, repos] = await Promise.all([
        axios.get(`${BASE_URL}/users/${username}`, { headers }),
        axios.get(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`, { headers }),
      ])
      const langs = {}
      repos.data.forEach((r) => {
        if (r.language) langs[r.language] = (langs[r.language] || 0) + 1
      })
      return { ...profile.data, repos: repos.data, languages: langs }
    }
    const [user1, user2] = await Promise.all([fetchOne(username1), fetchOne(username2)])
    return { user1, user2 }
  }, [])

  return { fetchUserData, fetchTwoUsers, loading, error }
}
