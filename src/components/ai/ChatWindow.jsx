import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { Bot } from 'lucide-react'

export default function ChatWindow({ messages, isStreaming }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet/15 flex items-center justify-center">
          <Bot className="w-8 h-8 text-violet-light" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-1">AI Career Advisor</h3>
          <p className="text-sm text-text-secondary max-w-sm">
            Ask me anything about your career. I&apos;ll analyze your GitHub + LeetCode data to give personalized advice.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && messages[messages.length - 1]?.role === 'assistant' && (
        <div className="flex items-center gap-1.5 px-4">
          <span className="w-1.5 h-1.5 bg-violet rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-violet rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-violet rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
