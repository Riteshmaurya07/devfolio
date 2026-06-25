/**
 * mockStatsGenerator.js
 * Generates high-fidelity, consistent mock statistics for developer platforms
 * based on the username as a seed. This ensures that the data is stable and
 * doesn't change randomly across refreshes.
 */

// Seeded random number generator
function createRandom(seedString) {
  let h = 0
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(31, h) + seedString.charCodeAt(i) | 0
  }
  return function () {
    let t = h += 0x6D2B79F5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateMockStats(platform, username) {
  const seed = `${platform}-${username}`
  const rand = createRandom(seed)

  const range = (min, max) => Math.floor(rand() * (max - min + 1)) + min
  const choice = (arr) => arr[Math.floor(rand() * arr.length)]
  const choices = (arr, count) => {
    const shuffled = [...arr].sort(() => rand() - 0.5)
    return shuffled.slice(0, count)
  }

  // Common dates generator
  const getRecentDates = (count) => {
    const dates = []
    const baseDate = new Date()
    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() - range(i * 3, (i + 1) * 3))
      dates.push(d.toISOString().split('T')[0])
    }
    return dates.sort()
  }

  const recentDates = getRecentDates(30)

  switch (platform.toLowerCase()) {
    case 'codechef': {
      const currentRating = range(1400, 2400)
      const highestRating = currentRating + range(50, 300)
      let stars = '1★'
      if (currentRating >= 2200) stars = '5★'
      else if (currentRating >= 2000) stars = '4★'
      else if (currentRating >= 1800) stars = '3★'
      else if (currentRating >= 1600) stars = '2★'

      const contests = Array.from({ length: 6 }).map((_, i) => ({
        name: `CodeChef Starters ${range(110, 130)}`,
        rating: currentRating - range(-100, 150),
        rank: range(100, 5000),
        date: recentDates[range(i * 4, (i + 1) * 4)] || '2026-05-10',
      })).sort((a, b) => b.date.localeCompare(a.date))

      return {
        username,
        currentRating,
        highestRating,
        stars,
        globalRank: range(500, 25000),
        countryRank: range(100, 8000),
        problemsSolved: range(80, 450),
        contestHistory: contests,
      }
    }

    case 'geekforgeeks':
    case 'geeksforgeeks': {
      return {
        username,
        codingScore: range(300, 2800),
        instituteRank: range(1, 450),
        overallRank: range(500, 12000),
        problemsSolved: range(150, 800),
        streak: range(3, 45),
        badges: choices([
          { name: 'Problem Solving Badge', icon: '💎', tier: 'Gold' },
          { name: 'Monthly Challenge Master', icon: '🏆', tier: 'Silver' },
          { name: 'Geek of the Month', icon: '🌟', tier: 'Gold' },
          { name: '100 Days Badge', icon: '🔥', tier: 'Gold' },
          { name: 'DSA Explorer', icon: '🧭', tier: 'Bronze' }
        ], range(2, 4)),
        codingActivity: recentDates.map(date => ({
          date,
          problemsCount: rand() > 0.4 ? range(1, 5) : 0
        }))
      }
    }

    case 'hackerrank': {
      return {
        username,
        skillBadges: choices([
          { name: 'Problem Solving', stars: range(4, 6), icon: '💻' },
          { name: 'Python', stars: range(5, 6), icon: '🐍' },
          { name: 'Java', stars: range(3, 5), icon: '☕' },
          { name: 'C++', stars: range(4, 6), icon: '➕' },
          { name: 'SQL', stars: range(4, 5), icon: '🗄️' },
        ], range(3, 5)),
        certifications: choices([
          'Problem Solving (Basic)',
          'React (Basic)',
          'JavaScript (Intermediate)',
          'Python (Basic)',
          'Angular (Intermediate)'
        ], range(1, 3)),
        problemSolvingLevel: choice(['Advanced', 'Intermediate', 'Expert']),
        stars: range(4, 6),
        contestParticipation: range(2, 12),
      }
    }

    case 'linkedin': {
      const connections = range(200, 1500)
      return {
        username,
        profileCompletion: range(85, 100),
        followers: Math.round(connections * range(1.1, 2.5)),
        connections,
        experience: [
          {
            role: 'Software Engineer Intern',
            company: choice(['TechCorp', 'InnoSoft', 'AlphaLabs', 'Google Developer Student Clubs']),
            duration: 'Jun 2025 - Present',
          },
          {
            role: 'Full Stack Web Developer',
            company: 'Freelance / Open Source Contributor',
            duration: 'Jan 2024 - May 2025',
          }
        ],
        skills: choices([
          'React.js', 'Node.js', 'TypeScript', 'Data Structures & Algorithms',
          'System Design', 'Git', 'Cloud Computing', 'SQL', 'MongoDB'
        ], range(5, 8)),
        certifications: choices([
          'AWS Certified Cloud Practitioner',
          'Google Cloud Digital Leader',
          'Meta Front-End Developer Specialization',
          'Certified Kubernetes Administrator'
        ], range(1, 3)),
        education: [
          {
            degree: 'Bachelor of Technology in Computer Science',
            school: 'Institute of Engineering & Technology',
            year: '2022 - 2026',
          }
        ],
        recentPosts: Array.from({ length: 3 }).map((_, i) => ({
          text: `Excited to announce that I have successfully completed a project solving ${range(50, 100)} advanced engineering challenges! Thanks to my peers for support. #buildinginpublic #developer`,
          likes: range(15, 150),
          comments: range(2, 20),
          date: recentDates[range(i * 8, (i + 1) * 8)] || '2026-06-01',
        })),
      }
    }

    case 'atcoder': {
      const currentRating = range(800, 2100)
      const maxRating = currentRating + range(20, 200)
      const rankColor = (r) => {
        if (r >= 2000) return 'Yellow'
        if (r >= 1600) return 'Blue'
        if (r >= 1200) return 'Cyan'
        if (r >= 800) return 'Green'
        return 'Brown'
      }
      return {
        username,
        currentRating,
        maxRating,
        rank: `${range(500, 8000)}th`,
        maxRank: `${range(400, 7000)}th`,
        color: rankColor(currentRating),
        contestsParticipated: range(5, 45),
        problemsSolved: range(40, 320),
        recentContests: Array.from({ length: 5 }).map((_, i) => ({
          name: `AtCoder Beginner Contest ${range(300, 360)}`,
          rank: range(200, 4000),
          ratingChange: range(-50, 90),
          date: recentDates[range(i * 5, (i + 1) * 5)] || '2026-05-20',
        })),
        ratingHistory: Array.from({ length: 10 }).map((_, i) => ({
          contest: `ABC ${range(290 + i * 5, 295 + i * 5)}`,
          rating: 700 + i * 110 + range(-40, 40),
        })),
      }
    }

    case 'hackerearth': {
      return {
        username,
        currentRating: range(1200, 2150),
        maxRating: range(1300, 2300),
        rank: range(100, 4500),
        contestsParticipated: range(3, 18),
        problemsSolved: range(30, 210),
        skillScore: range(60, 98),
        codingActivity: recentDates.map(date => ({
          date,
          solvedCount: rand() > 0.55 ? range(1, 3) : 0
        }))
      }
    }

    case 'kaggle': {
      return {
        username,
        tier: choice(['Grandmaster', 'Master', 'Expert', 'Contributor', 'Novice']),
        points: range(200, 18000),
        rankings: {
          competitions: range(100, 50000),
          notebooks: range(50, 25000),
          datasets: range(80, 12000),
          discussion: range(120, 15000),
        },
        medals: {
          gold: range(0, 3),
          silver: range(0, 8),
          bronze: range(1, 15),
        },
      }
    }

    case 'topcoder': {
      const rating = range(1100, 2400)
      return {
        username,
        rating,
        maxRating: rating + range(50, 200),
        rank: choice(['Div I - Red', 'Div I - Yellow', 'Div II - Blue', 'Div II - Green']),
        volatility: range(250, 450),
        designStats: { rating: range(800, 1500), submissions: range(2, 10) },
        devStats: { rating: range(1100, 2200), submissions: range(5, 30) },
        recentContests: Array.from({ length: 4 }).map((_, i) => ({
          name: `SRM ${range(840, 860)}`,
          ratingChange: range(-80, 120),
          placement: range(5, 120),
          date: recentDates[range(i * 6, (i + 1) * 6)] || '2026-04-15',
        })),
      }
    }

    case 'codolio': {
      return {
        username,
        developerIndex: range(680, 940),
        summary: `${username} shows high profile synergy, strong skill alignment in backend and algorithms, with active contributions matching elite developer footprints.`,
        profileLink: `https://codolio.com/profile/${username}`,
      }
    }

    case 'codingninjas': {
      return {
        username,
        ninjaPoints: range(2000, 25000),
        belt: choice(['Black Belt', 'Brown Belt', 'Blue Belt', 'Orange Belt']),
        ninjaLevel: range(12, 68),
        problemsSolved: range(120, 950),
        contestParticipation: range(4, 25),
      }
    }

    // --- FALLBACKS FOR API PLATFORMS ---
    case 'github': {
      const repoCount = range(10, 60)
      const stars = range(5, 350)
      const commits = range(150, 2000)
      return {
        profile: {
          login: username,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          html_url: `https://github.com/${username}`,
          bio: 'Passionate developer coding beautiful software solutions.',
          company: 'Tech Innovators',
          location: 'San Francisco, CA',
          public_repos: repoCount,
          followers: range(10, 400),
          following: range(15, 300),
        },
        repos: Array.from({ length: Math.min(repoCount, 8) }).map((_, i) => ({
          id: i,
          name: `project-${i + 1}`,
          html_url: `https://github.com/${username}/project-${i + 1}`,
          description: `An awesome open source project for developers.`,
          stargazers_count: range(0, Math.floor(stars / 4)),
          forks_count: range(0, 20),
          language: choice(['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'C++']),
          updated_at: new Date(Date.now() - range(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
        })),
        events: Array.from({ length: 15 }).map((_, i) => ({
          type: 'PushEvent',
          created_at: new Date(Date.now() - range(0, 10) * 24 * 60 * 60 * 1000).toISOString(),
          payload: { commits: Array.from({ length: range(1, 4) }) },
        })),
        languages: {
          JavaScript: range(10000, 80000),
          TypeScript: range(20000, 150000),
          Python: range(5000, 50000),
        },
        contributions: recentDates.map(date => ({
          date,
          count: rand() > 0.3 ? range(1, 8) : 0
        })),
        _isReal: false,
      }
    }

    case 'leetcode': {
      const easy = range(30, 150)
      const medium = range(40, 200)
      const hard = range(10, 60)
      const totalSolved = easy + medium + hard
      return {
        username,
        realName: username,
        ranking: range(5000, 150000),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-lc`,
        reputation: range(50, 600),
        starRating: range(3, 5),
        totalSolved,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        totalEasy: 800,
        totalMedium: 1600,
        totalHard: 700,
        acceptanceRate: range(45, 72),
        streak: range(2, 35),
        totalActiveDays: range(30, 240),
        submissionCalendar: recentDates.reduce((acc, date) => {
          if (rand() > 0.4) {
            const timestamp = Math.floor(new Date(date).getTime() / 1000)
            acc[timestamp] = range(1, 4)
          }
          return acc
        }, {}),
        recentSubmissions: Array.from({ length: 8 }).map((_, i) => ({
          id: `sub-${i}`,
          title: choice(['Two Sum', 'Add Two Numbers', 'Longest Substring Without Repeating Characters', 'Median of Two Sorted Arrays', 'Container With Most Water', 'Integer to Roman', '3Sum', 'Valid Parentheses']),
          titleSlug: 'two-sum',
          timestamp: Math.floor(Date.now() / 1000) - range(i * 3600, (i + 1) * 3600 * 4),
          statusDisplay: choice(['Accepted', 'Accepted', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded']),
          lang: choice(['python3', 'cpp', 'javascript', 'golang']),
          difficulty: choice(['Easy', 'Medium', 'Hard']),
        })),
        topicStats: [
          { topic: 'Arrays', solved: range(20, 60) },
          { topic: 'Strings', solved: range(15, 50) },
          { topic: 'Hash Table', solved: range(10, 40) },
          { topic: 'Dynamic Programming', solved: range(5, 25) },
          { topic: 'Math', solved: range(10, 30) },
          { topic: 'Sorting', solved: range(8, 35) },
        ],
        badges: [
          { id: '1', name: '50 Days Badge', icon: '🏅', year: '2026' },
          { id: '2', name: '100 Days Badge', icon: '🏆', year: '2026' },
        ],
        _isReal: false,
      }
    }

    case 'codeforces': {
      const currentRating = range(1200, 2200)
      const maxRating = currentRating + range(0, 250)
      const getCfRank = (r) => {
        if (r >= 2400) return 'grandmaster'
        if (r >= 2100) return 'master'
        if (r >= 1900) return 'candidate master'
        if (r >= 1600) return 'expert'
        if (r >= 1400) return 'specialist'
        if (r >= 1200) return 'pupil'
        return 'newbie'
      }

      return {
        username,
        currentRating,
        maxRating,
        rank: getCfRank(currentRating),
        maxRank: getCfRank(maxRating),
        contestsParticipated: range(5, 40),
        problemsSolved: range(40, 380),
        ratingGraph: Array.from({ length: 8 }).map((_, i) => ({
          contestId: 1000 + i * 20,
          contestName: `Codeforces Round #${800 + i * 5}`,
          rank: range(100, 3000),
          newRating: 1100 + i * 110 + range(-50, 50),
          date: recentDates[range(i * 3, (i + 1) * 3)] || '2026-05-01',
        })),
        recentContests: Array.from({ length: 4 }).map((_, i) => ({
          contestName: `Codeforces Round #${890 + i}`,
          rank: range(300, 5000),
          ratingChange: range(-60, 110),
          date: recentDates[range(i * 7, (i + 1) * 7)] || '2026-06-10',
        })),
      }
    }

    case 'stackoverflow': {
      const rep = range(100, 12000)
      return {
        username,
        reputation: rep,
        reputationChangeYear: range(50, 2000),
        badgeCounts: {
          gold: Math.floor(rep / 5000),
          silver: Math.floor(rep / 1000) + range(0, 3),
          bronze: Math.floor(rep / 200) + range(1, 10),
        },
        userId: range(1000000, 9999999),
        acceptRate: range(60, 98),
        location: choice(['Berlin, Germany', 'New Delhi, India', 'London, UK', 'Austin, TX']),
        creationDate: Math.floor(Date.now() / 1000) - range(31536000 * 2, 31536000 * 6),
      }
    }

    case 'devto': {
      return {
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        summary: 'Writing about Frontend, React, and Open Source contributions.',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-devto`,
        joinedAt: 'Feb 12, 2024',
        websiteUrl: `https://${username}.dev`,
        followersCount: range(50, 4500),
        postsCount: range(2, 28),
        articles: Array.from({ length: 3 }).map((_, i) => ({
          title: choice([
            'Mastering React Server Components',
            'Why I Switched from Redux to Zustand',
            'How to Build a Custom Terminal IDE with React',
            'A Guide to Clean Code Architecture in JavaScript',
            'Optimizing React Performance: A Case Study'
          ]),
          publicReactionsCount: range(10, 450),
          commentsCount: range(0, 30),
          readablePublishDate: choice(['Jun 10', 'May 28', 'Apr 14']),
        })),
      }
    }

    case 'hashnode': {
      return {
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        tagline: 'Coding and sharing my developer journey with the community.',
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-hash`,
        followersCount: range(20, 1800),
        followingCount: range(10, 600),
        publications: [
          {
            title: `${username}'s Tech Blog`,
            postsCount: range(2, 18),
          }
        ],
      }
    }

    default:
      return { username, connected: true }
  }
}
