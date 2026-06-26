import { useState, useCallback, useRef } from 'react'
import {
  streamAIResponse,
  AI_PROVIDERS,
} from '@/utils/aiService'

// ─── Mock responses ───────────────────────────────────────────────────────────

const MOCK_CHAT_RESPONSES = {
  default: `Based on your GitHub profile and LeetCode stats, here's my assessment:

**Strengths:**
- Strong presence in JavaScript/TypeScript ecosystem
- Good problem-solving foundation with 247 LeetCode problems solved
- Active open source contributor with consistent commit history

**Areas to Improve:**
- System design skills (common SDE2+ requirement)
- DSA: Focus on Hard problems — you're at 38/247 Hard (15%)
- Backend experience: consider building a Node.js/Go project

**Recommended Next Steps:**
1. Solve 2 Medium/Hard DSA problems daily for 30 days
2. Build one end-to-end full-stack project with deployment
3. Study system design: "Designing Data-Intensive Applications"
4. Apply to 5-10 companies per week with tailored resumes

Your skill score of 78/100 puts you in a competitive range for mid-level roles. 🎯`,

  resume: `**Resume Review Feedback:**

✅ **What's working:**
- Clean structure with clear sections
- Good technical skills listed
- Projects section shows real-world experience

⚠️ **Improvements needed:**
- Add quantified impact: "Reduced API latency by 40%" not just "improved performance"
- GitHub stats: mention your star count and contribution streak
- Skills section: organize by proficiency (Expert / Proficient / Familiar)
- Add your LeetCode profile URL in contact section
- Each job/project bullet should follow: Action verb + What + Result

📝 **Suggested bullet rewrites:**
- ❌ "Built a REST API"
- ✅ "Designed and deployed a REST API serving 10K+ daily requests with <100ms p99 latency"`,

  skills: `**Missing Skills Analysis:**

Based on current job market data for your target roles:

🔴 **Critical Gaps:**
- Docker & Kubernetes — required in 73% of SDE job postings
- System Design fundamentals — key for L4+ interviews
- SQL/PostgreSQL — 68% of backend roles require this

🟡 **Good to Have:**
- Cloud (AWS/GCP) — certification helps significantly
- GraphQL — increasingly common in modern stacks
- Testing (Jest/Cypress) — shows engineering maturity

🟢 **You're Strong In:**
- React ecosystem (from your GitHub repos)
- JavaScript/TypeScript
- Git workflow and open source collaboration

**30-day learning plan:**
Week 1-2: Docker basics → containerize 2 existing projects
Week 3: AWS EC2 + S3 + RDS basics
Week 4: System design: URL shortener + rate limiter`,

  jobs: `**Job Recommendations Based on Your Profile:**

🎯 **Best Fit Roles:**
1. **Frontend Engineer** (React/TypeScript) — Vercel, Linear, Notion
2. **Full Stack Developer** — Startups Series A-B
3. **JavaScript Engineer** — Meta, Atlassian, Shopify

📊 **Salary Range:** ₹15-35 LPA (India) | $100-150K (US remote)

🏢 **Companies Actively Hiring:**
- Razorpay, Zepto, Groww (India product companies)
- Remote-first: Remote.com, Deel, Notion
- FAANG prep: start with Google/Microsoft after 2-3 months prep

💡 **Application Tips:**
- Your GitHub activity is a strong signal — link it prominently
- Apply through LinkedIn + company career pages (avoid job boards for top companies)
- Referrals increase interview rate by 5x — reach out on LinkedIn`,
}

const INTERVIEW_QUESTIONS = {
  DSA: [
    "Given an array of integers, find the maximum subarray sum. Explain your approach and time complexity.",
    "How would you implement a LRU Cache? Walk me through the data structures you'd use.",
    "Given a binary tree, find the lowest common ancestor of two nodes. What's your approach?",
    "Explain the difference between BFS and DFS. When would you use each?",
    "How would you detect a cycle in a linked list? Explain Floyd's algorithm.",
  ],
  React: [
    "Explain the difference between useEffect and useLayoutEffect. When would you use each?",
    "How does React's reconciliation algorithm work? Explain the key diffing heuristics.",
    "What are React Server Components? How do they differ from Client Components?",
    "How would you optimize a React application that has performance issues? Name 5 strategies.",
    "Explain the concept of lifting state up vs using a global state manager like Zustand.",
  ],
  'System Design': [
    "Design a URL shortening service like bit.ly. Walk me through the architecture.",
    "How would you design a real-time chat system that scales to 10M users?",
    "Design a rate limiting system for an API gateway. What algorithms would you consider?",
    "How would you design a notification system (push, email, SMS) that handles 1M events/day?",
    "Design a distributed file storage system like Google Drive. What are the key components?",
  ],
  HR: [
    "Tell me about yourself and your journey as a developer.",
    "Describe a challenging technical problem you solved. What was your approach?",
    "How do you handle tight deadlines and competing priorities?",
    "Where do you see yourself in 3-5 years as a software engineer?",
    "Why are you looking for a new opportunity? What's your ideal work environment?",
  ],
}

const MOCK_FEEDBACK = [
  "**Good attempt!** You identified the key concept. Score: 7/10\n\nYour answer covers the basics but missing edge cases. The interviewer would likely ask about space complexity tradeoffs.",
  "**Strong answer!** Score: 9/10\n\nExcellent explanation with concrete examples. You mentioned the right data structures. Minor improvement: discuss scalability implications.",
  "**Needs improvement.** Score: 5/10\n\nYou're on the right track but the explanation lacks precision. Make sure to mention Big-O complexity upfront and walk through examples.",
  "**Great insight!** Score: 8/10\n\nSolid technical depth. Good use of terminology. Next time, start with the simplest brute force first, then optimize.",
  "**Perfect!** Score: 10/10\n\nComprehensive answer. You nailed the time/space complexity, edge cases, and provided a real-world analogy. This is exactly what interviewers want.",
]

const MOCK_ROADMAP = (goal) => `# 12-Week Roadmap: ${goal}

## Week 1-2: Foundation Assessment
- [ ] Audit your current skills with a self-assessment
- [ ] Set up daily coding schedule (2-3 hours minimum)
- [ ] Join relevant communities: Discord, Reddit r/cscareerquestions
- [ ] Create a study tracker spreadsheet
- [ ] Complete 10 Easy LeetCode problems to warm up

## Week 3-4: Data Structures & Algorithms
- [ ] Arrays, Strings, HashMaps — 15 problems
- [ ] Linked Lists, Stacks, Queues — 10 problems
- [ ] Trees (BFS/DFS) — 15 problems
- [ ] Read "Cracking the Coding Interview" chapters 1-5
- [ ] Mock interview with a friend or Pramp

## Week 5-6: System Design Basics
- [ ] Study: Scalability, Load Balancing, Caching
- [ ] Design: URL shortener, rate limiter, cache system
- [ ] Read "Designing Data-Intensive Applications" (chapters 1-4)
- [ ] Watch: ByteByteGo system design videos (20 videos)
- [ ] Practice drawing architecture diagrams

## Week 7-8: Advanced DSA
- [ ] Dynamic Programming — 20 problems (patterns: knapsack, LCS, grid)
- [ ] Graphs (Dijkstra, Union-Find, Topological sort) — 15 problems
- [ ] Heaps & Priority Queues — 10 problems
- [ ] Timed mock sessions: 2 problems in 45 minutes
- [ ] LeetCode contest participation (weekly)

## Week 9-10: Projects & Portfolio
- [ ] Build one production-quality project showcasing target skills
- [ ] Write 2 technical blog posts about what you built
- [ ] Update GitHub profile README with pinned repos
- [ ] Polish resume with quantified achievements
- [ ] Prepare behavioral stories (STAR format, 10 scenarios)

## Week 11-12: Interview Blitz
- [ ] Apply to 5-10 companies per day
- [ ] Daily mock interviews (Pramp, Interviewing.io)
- [ ] System design practice: 2 full designs per day
- [ ] Negotiate offers: research salary data on levels.fyi
- [ ] Rest and confidence building before interviews

---
**Daily Schedule:**
- Morning (1h): LeetCode problem
- Evening (2h): Study material + project work
- Weekends: Mock interviews + system design

**Success Metrics:** Target 80%+ on mock interviews by Week 10`

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAI() {
  const [provider, setProvider] = useState(
    import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here'
      ? AI_PROVIDERS.GEMINI
      : AI_PROVIDERS.MOCK
  )
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [interviewAnswers, setInterviewAnswers] = useState([])
  const [roadmapPlan, setRoadmapPlan] = useState(null)
  const stopStreamRef = useRef(null)

  // ── Chat ────────────────────────────────────────────────────────────────────

  const sendChatMessage = useCallback(async (userMessage, context = '') => {
    const userMsg = { role: 'user', content: userMessage, id: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)
    setStreamError(null)

    const aiMsgId = Date.now() + 1
    setMessages((prev) => [...prev, { role: 'assistant', content: '', id: aiMsgId }])

    // Determine mock response
    const lower = userMessage.toLowerCase()
    let mockResponse = MOCK_CHAT_RESPONSES.default
    if (lower.includes('resume')) mockResponse = MOCK_CHAT_RESPONSES.resume
    else if (lower.includes('skill') || lower.includes('missing')) mockResponse = MOCK_CHAT_RESPONSES.skills
    else if (lower.includes('job') || lower.includes('suggest')) mockResponse = MOCK_CHAT_RESPONSES.jobs

    await streamAIResponse({
      provider,
      prompt: userMessage,
      context,
      mockResponse,
      onChunk: (text) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: text } : m))
        )
      },
      onDone: () => setIsStreaming(false),
      onError: (err) => {
        setIsStreaming(false)
        setStreamError(err.message)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: `⚠️ **AI Error:** ${err.message}` }
              : m
          )
        )
      },
    })
  }, [provider])

  // ── Interview ────────────────────────────────────────────────────────────────

  const startInterview = useCallback((topic) => {
    const questions = INTERVIEW_QUESTIONS[topic] || INTERVIEW_QUESTIONS.DSA
    setCurrentQuestion(0)
    setInterviewAnswers([])
    return questions[0]
  }, [])

  const submitInterviewAnswer = useCallback(async (topic, questionIndex, answer, onFeedback) => {
    const questions = INTERVIEW_QUESTIONS[topic] || INTERVIEW_QUESTIONS.DSA
    const question = questions[questionIndex]
    const score = [7, 9, 5, 8, 10][questionIndex % 5]

    setIsStreaming(true)
    setStreamError(null)

    const interviewPrompt = provider !== AI_PROVIDERS.MOCK
      ? `You are a technical interviewer. The candidate was asked: "${question}"\n\nTheir answer: "${answer}"\n\nEvaluate the answer and give feedback in this format:\n**[Evaluation]** Score: X/10\n\n[Specific feedback on what was good, what was missing, and how to improve. Be constructive and specific.]`
      : ''

    const mockFeedback = MOCK_FEEDBACK[questionIndex % MOCK_FEEDBACK.length]

    let accumulated = ''

    await streamAIResponse({
      provider,
      prompt: interviewPrompt,
      context: `Interview topic: ${topic}`,
      mockResponse: mockFeedback,
      onChunk: (text) => {
        accumulated = text
        onFeedback(text)
      },
      onDone: () => {
        setIsStreaming(false)
        setInterviewAnswers((prev) => [
          ...prev,
          { question, answer, feedback: accumulated || mockFeedback, score },
        ])
        setCurrentQuestion(questionIndex + 1)
      },
      onError: (err) => {
        setIsStreaming(false)
        setStreamError(err.message)
        onFeedback(`⚠️ **AI Error:** ${err.message}`)
        setInterviewAnswers((prev) => [
          ...prev,
          { question, answer, feedback: `Error: ${err.message}`, score: 0 },
        ])
        setCurrentQuestion(questionIndex + 1)
      },
    })
  }, [provider])

  // ── Roadmap ──────────────────────────────────────────────────────────────────

  const generateRoadmap = useCallback(async (goal, onChunk) => {
    setIsStreaming(true)
    setStreamError(null)

    const roadmapPrompt = provider !== AI_PROVIDERS.MOCK
      ? `Create a detailed 12-week career roadmap for a software engineer with this goal: "${goal}"\n\nFormat the roadmap with:\n- Week ranges as headers (## Week X-Y: Title)\n- Specific tasks as checkboxes (- [ ] Task)\n- A daily schedule section\n- Success metrics\n\nMake it actionable, specific, and realistic.`
      : ''

    const mockRoadmap = MOCK_ROADMAP(goal)
    let finalText = ''

    await streamAIResponse({
      provider,
      prompt: roadmapPrompt,
      context: `Goal: ${goal}`,
      mockResponse: mockRoadmap,
      onChunk: (text) => {
        finalText = text
        onChunk(text)
      },
      onDone: (text) => {
        setIsStreaming(false)
        const roadmapText = text || finalText || mockRoadmap
        const weeks = []
        const lines = roadmapText.split('\n')
        let currentWeek = null
        lines.forEach((line) => {
          if (line.startsWith('## Week')) {
            if (currentWeek) weeks.push(currentWeek)
            currentWeek = { title: line.replace('## ', ''), tasks: [], completed: 0 }
          } else if (line.startsWith('- [ ]') && currentWeek) {
            currentWeek.tasks.push({ text: line.replace('- [ ] ', ''), done: false })
          }
        })
        if (currentWeek) weeks.push(currentWeek)
        if (weeks.length > 0) setRoadmapPlan(weeks)
      },
      onError: (err) => {
        setIsStreaming(false)
        setStreamError(err.message)
        onChunk(`⚠️ **AI Error:** ${err.message}`)
      },
    })
  }, [provider])

  // ── Misc ─────────────────────────────────────────────────────────────────────

  const toggleRoadmapTask = useCallback((weekIndex, taskIndex) => {
    setRoadmapPlan((prev) => {
      const updated = prev.map((week, wi) => {
        if (wi !== weekIndex) return week
        const tasks = week.tasks.map((task, ti) =>
          ti === taskIndex ? { ...task, done: !task.done } : task
        )
        return { ...week, tasks, completed: tasks.filter((t) => t.done).length }
      })
      return updated
    })
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    if (stopStreamRef.current) stopStreamRef.current()
    setIsStreaming(false)
    setStreamError(null)
  }, [])

  return {
    provider,
    setProvider,
    messages,
    isStreaming,
    streamError,
    currentQuestion,
    interviewAnswers,
    roadmapPlan,
    sendChatMessage,
    startInterview,
    submitInterviewAnswer,
    generateRoadmap,
    toggleRoadmapTask,
    clearChat,
    interviewQuestions: INTERVIEW_QUESTIONS,
  }
}
