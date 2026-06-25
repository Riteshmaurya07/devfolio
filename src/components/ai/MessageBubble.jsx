import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'

// Simple markdown-ish renderer for bold and newlines
function renderContent(text) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-text-primary">{part}</strong> : part
    )
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-violet/20' : 'bg-teal/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-violet-light" />
        ) : (
          <Bot className="w-4 h-4 text-teal-light" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-violet/20 text-text-primary rounded-tr-sm'
            : 'bg-card border border-border text-text-secondary rounded-tl-sm'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {renderContent(message.content)}
        </div>
      </div>
    </motion.div>
  )
}
