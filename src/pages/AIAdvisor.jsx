import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, MessageSquare, Mic, Map } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import ChatWindow from '@/components/ai/ChatWindow'
import PromptChip from '@/components/ai/PromptChip'
import ScoreCard from '@/components/ai/ScoreCard'
import RoadmapView from '@/components/ai/RoadmapView'
import AIProviderSelector from '@/components/ai/AIProviderSelector'
import Button from '@/components/ui/Button'
import { useAI } from '@/hooks/useAI'
import useUserDataStore from '@/store/userDataStore'
import useAuthStore from '@/store/authStore'

const TABS = [
  { id: 'chat', label: 'Chat Advisor', icon: MessageSquare },
  { id: 'interview', label: 'Mock Interview', icon: Mic },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
]

const PROMPT_CHIPS = [
  { label: 'Review my resume', icon: '📄' },
  { label: 'What skills am I missing?', icon: '🔍' },
  { label: 'Suggest jobs for me', icon: '💼' },
  { label: 'How to crack FAANG?', icon: '🎯' },
  { label: 'Build my study plan', icon: '📚' },
]

const INTERVIEW_TOPICS = ['DSA', 'React', 'System Design', 'HR']

export default function AIAdvisor() {
  const [activeTab, setActiveTab] = useState('chat')
  const [input, setInput] = useState('')
  const [interviewTopic, setInterviewTopic] = useState(null)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [interviewFeedback, setInterviewFeedback] = useState('')
  const [waitingNext, setWaitingNext] = useState(false)
  const [showScoreCard, setShowScoreCard] = useState(false)
  const [roadmapGoal, setRoadmapGoal] = useState('')
  const [roadmapText, setRoadmapText] = useState('')
  const [roadmapGenerating, setRoadmapGenerating] = useState(false)

  const { user } = useAuthStore()
  const { githubData, skillScore } = useUserDataStore()

  const {
    provider, setProvider,
    messages, isStreaming,
    sendChatMessage, clearChat,
    startInterview, currentQuestion, interviewAnswers,
    submitInterviewAnswer, interviewQuestions,
    generateRoadmap, roadmapPlan, toggleRoadmapTask,
  } = useAI()

  const questions = interviewTopic ? interviewQuestions[interviewTopic] : []

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    const context = `User: ${user?.login}, GitHub repos: ${githubData?.public_repos || 0}, Skill score: ${skillScore?.total || 0}`
    sendChatMessage(input, context)
    setInput('')
  }

  const handleStartInterview = (topic) => {
    setInterviewTopic(topic)
    setInterviewStarted(true)
    startInterview(topic)
    setShowScoreCard(false)
    setInterviewFeedback('')
    setWaitingNext(false)
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isStreaming || waitingNext) return
    setInterviewFeedback('')
    setWaitingNext(true)
    await submitInterviewAnswer(
      interviewTopic,
      currentQuestion,
      currentAnswer,
      (feedback) => setInterviewFeedback(feedback)
    )
    setCurrentAnswer('')
    setWaitingNext(false)

    if (currentQuestion + 1 >= 5) {
      setTimeout(() => setShowScoreCard(true), 500)
    }
  }

  const handleGenerateRoadmap = async () => {
    if (!roadmapGoal.trim() || roadmapGenerating) return
    setRoadmapGenerating(true)
    setRoadmapText('')
    await generateRoadmap(roadmapGoal, (text) => setRoadmapText(text))
    setRoadmapGenerating(false)
  }

  return (
    <PageWrapper>
      {/* Tab switcher + provider selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-violet text-white shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <AIProviderSelector
            provider={provider}
            onProviderChange={setProvider}
            disabled={isStreaming}
          />
        </div>
      </div>

      {/* Chat Mode */}
      <AnimatePresence mode="wait">
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card flex flex-col"
            style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
          >
            <ChatWindow messages={messages} isStreaming={isStreaming} />

            {/* Prompt chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border">
                {PROMPT_CHIPS.map((chip) => (
                  <PromptChip
                    key={chip.label}
                    label={chip.label}
                    icon={chip.icon}
                    onClick={(text) => sendChatMessage(text)}
                    disabled={isStreaming}
                  />
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="flex gap-2 p-4 border-t border-border">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask your AI career advisor..."
                className="input flex-1"
                disabled={isStreaming}
              />
              <Button onClick={clearChat} variant="ghost" size="md" icon={RotateCcw} aria-label="Clear chat" />
              <Button onClick={handleSend} loading={isStreaming} icon={Send} aria-label="Send message" />
            </div>
          </motion.div>
        )}

        {/* Interview Mode */}
        {activeTab === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {!interviewStarted ? (
              <div className="card space-y-4">
                <h3 className="section-title">Choose Interview Type</h3>
                <p className="text-sm text-text-secondary">I&apos;ll ask you 5 questions and evaluate your answers with AI feedback.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INTERVIEW_TOPICS.map((topic) => (
                    <motion.button
                      key={topic}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStartInterview(topic)}
                      className="card-hover py-4 text-center"
                    >
                      <p className="text-2xl mb-2">
                        {topic === 'DSA' ? '🧮' : topic === 'React' ? '⚛️' : topic === 'System Design' ? '🏗️' : '🤝'}
                      </p>
                      <p className="text-sm font-semibold text-text-primary">{topic}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : showScoreCard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="section-title">Interview Results — {interviewTopic}</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setInterviewStarted(false); setShowScoreCard(false) }}>
                    Try Again
                  </Button>
                </div>
                <ScoreCard answers={interviewAnswers} topic={interviewTopic} />
              </div>
            ) : (
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="section-title">{interviewTopic} Interview</h3>
                    <p className="text-xs text-text-muted">Question {Math.min(currentQuestion + 1, 5)} of 5</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < currentQuestion ? 'bg-success' : i === currentQuestion ? 'bg-violet' : 'bg-border'}`} />
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setInterviewStarted(false)}>End</Button>
                  </div>
                </div>

                {/* Question */}
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <p className="text-sm font-medium text-text-primary">
                    {questions[currentQuestion] || 'Loading question...'}
                  </p>
                </div>

                {/* Feedback */}
                {interviewFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-violet/5 border border-violet/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-violet-light mb-2">AI Feedback:</p>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{interviewFeedback}</p>
                    {!isStreaming && currentQuestion < 5 && (
                      <p className="text-xs text-text-muted mt-2">↓ Answer the next question below</p>
                    )}
                  </motion.div>
                )}

                {/* Answer input */}
                {currentQuestion < 5 && (
                  <div className="space-y-2">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="input resize-none"
                      disabled={isStreaming || waitingNext}
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      loading={isStreaming || waitingNext}
                      icon={Send}
                      className="w-full justify-center"
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Roadmap Mode */}
        {activeTab === 'roadmap' && (
          <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {!roadmapPlan ? (
              <div className="card space-y-4">
                <h3 className="section-title">Generate Your Roadmap</h3>
                <p className="text-sm text-text-secondary">Tell me your career goal and I&apos;ll create a personalized week-by-week plan.</p>
                <div>
                  <label className="label">What&apos;s your goal?</label>
                  <input
                    className="input"
                    value={roadmapGoal}
                    onChange={(e) => setRoadmapGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
                    placeholder="e.g. I want to crack SDE2 in 3 months"
                  />
                </div>
                {roadmapText && (
                  <div className="bg-surface rounded-xl p-4 border border-border max-h-48 overflow-y-auto no-scrollbar">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono">{roadmapText}</pre>
                  </div>
                )}
                <Button
                  onClick={handleGenerateRoadmap}
                  loading={roadmapGenerating}
                  icon={Map}
                  className="w-full justify-center"
                >
                  Generate 12-Week Roadmap
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="section-title">Your 12-Week Roadmap</h3>
                  <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => { setRoadmapGoal(''); setRoadmapText('') }}>
                    New Goal
                  </Button>
                </div>
                <RoadmapView weeks={roadmapPlan} onToggleTask={toggleRoadmapTask} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
