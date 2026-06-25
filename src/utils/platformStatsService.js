import axios from 'axios'
import { generateMockStats } from './mockStatsGenerator'

// LeetCode queries
const LC_STATS_QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        ranking
        userAvatar
        reputation
        starRating
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`

const LC_RECENT_SUBMISSIONS_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      lang
    }
  }
`

const LC_CALENDAR_QUERY = `
  query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`

// Hashnode query
const HASHNODE_QUERY = `
  query UserProfile($username: String!) {
    user(username: $username) {
      name
      username
      tagline
      profilePicture
      followersCount
      followingCount
      publications(first: 5) {
        edges {
          node {
            title
            postsCount
          }
        }
      }
    }
  }
`

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

  const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
  const contributions = []
  weeks.forEach((week) => {
    week.contributionDays.forEach(({ date, contributionCount }) => {
      contributions.push({ date, count: contributionCount })
    })
  })

  return contributions
}

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

export const platformStatsService = {
  async fetchGitHub(username, token) {
    const headers = {}
    if (token && !token.includes('your_') && token.length >= 10) {
      headers.Authorization = `Bearer ${token}`
    }

    const [profileRes, reposRes, eventsRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
      axios.get(`https://api.github.com/users/${username}/events?per_page=100`, { headers }),
    ])

    const profile = profileRes.data
    const repos = reposRes.data
    const events = eventsRes.data

    const langCounts = {}
    repos.forEach((repo) => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + (repo.size || 1)
      }
    })

    let contributions = []
    if (token && !token.includes('your_') && token.length >= 10) {
      try {
        contributions = await fetchContributionCalendar(username, token)
      } catch (gqlErr) {
        console.warn('[platformStatsService] GitHub GraphQL failed, using events:', gqlErr.message)
        contributions = deriveContributionsFromEvents(events)
      }
    } else {
      contributions = deriveContributionsFromEvents(events)
    }

    return {
      profile,
      repos,
      events,
      languages: langCounts,
      contributions,
      _isReal: true
    }
  },

  async fetchLeetCode(username) {
    const lcQuery = async (query, variables) => {
      const res = await fetch('/leetcode-graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      })
      if (!res.ok) throw new Error(`LeetCode API error: ${res.status}`)
      const json = await res.json()
      if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
      return json.data
    }

    const [statsData, submissionsData, calendarData] = await Promise.all([
      lcQuery(LC_STATS_QUERY, { username }),
      lcQuery(LC_RECENT_SUBMISSIONS_QUERY, { username, limit: 15 }),
      lcQuery(LC_CALENDAR_QUERY, { username, year: new Date().getFullYear() }),
    ])

    if (!statsData?.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found`)
    }

    const user = statsData.matchedUser
    const calendar = calendarData?.matchedUser?.userCalendar
    const acNums = user?.submitStats?.acSubmissionNum || []
    const totalNums = user?.submitStats?.totalSubmissionNum || []

    const findCount = (arr, difficulty) =>
      arr.find((x) => x.difficulty === difficulty)?.count ?? 0

    const totalSolved = findCount(acNums, 'All')
    const easySolved = findCount(acNums, 'Easy')
    const mediumSolved = findCount(acNums, 'Medium')
    const hardSolved = findCount(acNums, 'Hard')

    const totalSubmissions = findCount(totalNums, 'All')
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((totalSolved / totalSubmissions) * 1000) / 10
      : 0

    let streakCalendar = {}
    try {
      streakCalendar = JSON.parse(calendar?.submissionCalendar || '{}')
    } catch {}

    const recentSubmissions = (submissionsData?.recentAcSubmissionList || []).map((s) => ({
      id: s.id,
      title: s.title,
      titleSlug: s.titleSlug,
      timestamp: Number(s.timestamp),
      statusDisplay: 'Accepted',
      lang: s.lang,
      difficulty: 'Medium',
    }))

    return {
      username: user.username,
      realName: user.profile?.realName || '',
      ranking: user.profile?.ranking || 0,
      avatar: user.profile?.userAvatar || null,
      reputation: user.profile?.reputation || 0,
      starRating: user.profile?.starRating || 0,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalEasy: 800,
      totalMedium: 1600,
      totalHard: 700,
      acceptanceRate,
      streak: calendar?.streak ?? 0,
      totalActiveDays: calendar?.totalActiveDays ?? 0,
      submissionCalendar: streakCalendar,
      recentSubmissions,
      topicStats: [
        { topic: 'Arrays', solved: Math.round(totalSolved * 0.3) },
        { topic: 'Strings', solved: Math.round(totalSolved * 0.25) },
        { topic: 'Hash Table', solved: Math.round(totalSolved * 0.15) },
        { topic: 'Sorting', solved: Math.round(totalSolved * 0.1) },
      ],
      badges: [],
      submitStats: {
        acSubmissionNum: acNums,
        totalSubmissionNum: totalNums,
      },
      _isReal: true,
    }
  },

  async fetchCodeforces(username) {
    const [infoRes, ratingRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${username}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${username}`)
    ])

    if (infoRes.data.status !== 'OK' || !infoRes.data.result?.[0]) {
      throw new Error(`Codeforces user "${username}" not found`)
    }

    const user = infoRes.data.result[0]
    const ratings = ratingRes.data.status === 'OK' ? ratingRes.data.result : []

    const contestHistory = [...ratings].reverse().slice(0, 8).map(r => ({
      name: r.contestName,
      rating: r.newRating,
      rank: r.rank,
      date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0],
      ratingChange: r.newRating - r.oldRating,
    }))

    const ratingGraph = ratings.map(r => ({
      contestId: r.contestId,
      contestName: r.contestName,
      rank: r.rank,
      newRating: r.newRating,
      date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0]
    }))

    return {
      username: user.handle,
      currentRating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'newbie',
      maxRank: user.maxRank || 'newbie',
      avatar: user.avatar || user.titlePhoto,
      contestsParticipated: ratings.length,
      problemsSolved: Math.round(ratings.length * 6.5 + 15), // estimate based on contests
      ratingGraph,
      contestHistory,
      recentContests: contestHistory.slice(0, 4),
      _isReal: true
    }
  },

  async fetchStackOverflow(username) {
    // StackOverflow user handle can be a profile URL or user ID
    // Extract numbers from handle
    const userIdMatch = username.match(/\d+/)
    const userId = userIdMatch ? userIdMatch[0] : username

    if (!/^\d+$/.test(userId)) {
      throw new Error(`Invalid StackOverflow User ID. Must be numeric or contain numeric ID (e.g. from profile URL).`)
    }

    const res = await axios.get(`https://api.stackexchange.com/2.3/users/${userId}?site=stackoverflow`)
    if (!res.data?.items?.[0]) {
      throw new Error(`StackOverflow user ID "${userId}" not found`)
    }

    const user = res.data.items[0]
    return {
      username: user.display_name,
      reputation: user.reputation,
      reputationChangeYear: user.reputation_change_year || 0,
      badgeCounts: {
        gold: user.badge_counts?.gold || 0,
        silver: user.badge_counts?.silver || 0,
        bronze: user.badge_counts?.bronze || 0,
      },
      userId: user.user_id,
      acceptRate: user.accept_rate || 80,
      location: user.location || '',
      creationDate: user.creation_date,
      _isReal: true
    }
  },

  async fetchDevto(username) {
    const profileRes = await axios.get(`https://dev.to/api/users/by_username?url=${username}`)
    if (!profileRes.data?.id) {
      throw new Error(`Dev.to user "${username}" not found`)
    }

    const articlesRes = await axios.get(`https://dev.to/api/articles?username=${username}`)
    const profile = profileRes.data
    const articles = articlesRes.data || []

    return {
      username: profile.username,
      name: profile.name,
      summary: profile.summary || '',
      profileImage: profile.profile_image,
      joinedAt: profile.joined_at,
      websiteUrl: profile.website_url || '',
      followersCount: profile.followers_count || 0,
      postsCount: articles.length,
      articles: articles.slice(0, 5).map(a => ({
        title: a.title,
        publicReactionsCount: a.public_reactions_count || 0,
        commentsCount: a.comments_count || 0,
        readablePublishDate: a.readable_publish_date,
      })),
      _isReal: true
    }
  },

  async fetchHashnode(username) {
    const res = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: HASHNODE_QUERY, variables: { username } })
    })

    if (!res.ok) throw new Error(`Hashnode API error: ${res.status}`)
    const json = await res.json()
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')

    const user = json.data?.user
    if (!user) {
      throw new Error(`Hashnode user "${username}" not found`)
    }

    const publications = (user.publications?.edges || []).map(edge => ({
      title: edge.node.title,
      postsCount: edge.node.postsCount || 0
    }))

    return {
      username: user.username,
      name: user.name,
      tagline: user.tagline || '',
      profilePicture: user.profilePicture,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      publications,
      _isReal: true
    }
  },

  async fetchAllPlatformStats(platform, username, token) {
    const platLower = platform.toLowerCase()
    try {
      if (platLower === 'github') {
        return await this.fetchGitHub(username, token)
      } else if (platLower === 'leetcode') {
        return await this.fetchLeetCode(username)
      } else if (platLower === 'codeforces') {
        return await this.fetchCodeforces(username)
      } else if (platLower === 'stackoverflow') {
        return await this.fetchStackOverflow(username)
      } else if (platLower === 'dev.to') {
        return await this.fetchDevto(username)
      } else if (platLower === 'hashnode') {
        return await this.fetchHashnode(username)
      } else {
        // Platform requires mock generation
        return generateMockStats(platform, username)
      }
    } catch (error) {
      console.warn(`[platformStatsService] Failed to fetch real stats for ${platform}, falling back to mock:`, error.message)
      // Fallback to mock data on error so application works seamlessly
      const mockData = generateMockStats(platform, username)
      mockData._isReal = false
      mockData._error = error.message
      return mockData
    }
  }
}
