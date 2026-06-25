// Language weights for skill score calculation
// Higher weight = more in-demand / harder skill
const LANGUAGE_WEIGHTS = {
  Rust: 10,
  Go: 9,
  TypeScript: 9,
  Python: 8,
  'C++': 8,
  Java: 7,
  Kotlin: 7,
  Swift: 7,
  JavaScript: 6,
  C: 6,
  Ruby: 5,
  PHP: 4,
  Shell: 3,
  HTML: 2,
  CSS: 2,
}

const RADAR_SKILLS = [
  'Frontend',
  'Backend',
  'DSA',
  'System Design',
  'DevOps',
  'Mobile',
]

export function calcSkillScore(languages = {}, repos = [], leetcodeData = null) {
  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)

  // Base language score
  let langScore = 0
  let totalWeight = 0
  topLangs.forEach((lang) => {
    const w = LANGUAGE_WEIGHTS[lang] || 3
    langScore += w
    totalWeight += 10
  })
  const normalizedLangScore = totalWeight > 0 ? (langScore / totalWeight) * 100 : 0

  // Repo score
  const repoScore = Math.min(repos.length * 2, 40)
  const starsScore = Math.min(
    repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) / 10,
    30
  )

  // LeetCode score
  const lcScore = leetcodeData
    ? Math.min((leetcodeData.totalSolved / 500) * 30, 30)
    : 20

  const total = Math.round(
    (normalizedLangScore * 0.3) + (repoScore * 0.3) + (starsScore * 0.2) + (lcScore * 0.2)
  )

  // Radar chart data
  const frontendLangs = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte']
  const backendLangs = ['Python', 'Go', 'Java', 'Ruby', 'PHP', 'Rust', 'C#']
  const devopsLangs = ['Shell', 'Dockerfile', 'HCL']
  const mobileLangs = ['Swift', 'Kotlin', 'Dart']

  const hasFrontend = topLangs.some((l) => frontendLangs.includes(l))
  const hasBackend = topLangs.some((l) => backendLangs.includes(l))
  const hasDevops = topLangs.some((l) => devopsLangs.includes(l))
  const hasMobile = topLangs.some((l) => mobileLangs.includes(l))

  const radarData = [
    { skill: 'Frontend', score: hasFrontend ? Math.min(60 + repos.length * 2, 95) : 30 },
    { skill: 'Backend', score: hasBackend ? Math.min(55 + repos.length * 2, 90) : 25 },
    { skill: 'DSA', score: leetcodeData ? Math.min(40 + leetcodeData.totalSolved / 5, 95) : 45 },
    { skill: 'System Design', score: Math.min(30 + repos.length * 1.5, 75) },
    { skill: 'DevOps', score: hasDevops ? 65 : 20 },
    { skill: 'Mobile', score: hasMobile ? 70 : 15 },
  ]

  return {
    total: Math.min(total, 100),
    radarData,
    topLanguages: topLangs,
  }
}
