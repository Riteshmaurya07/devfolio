/**
 * AIProviderSelector.jsx
 * A dropdown/pill selector for switching between AI providers (Gemini, Anthropic, Mock).
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, Bot, Cpu } from 'lucide-react'
import { AI_PROVIDERS, providerLabel, providerDescription } from '@/utils/aiService'

const PROVIDER_CONFIG = {
  [AI_PROVIDERS.GEMINI]: {
    icon: Sparkles,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    activeBg: 'bg-blue-500',
    badge: 'Live',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    envKey: 'VITE_GEMINI_API_KEY',
  },
  [AI_PROVIDERS.ANTHROPIC]: {
    icon: Bot,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    activeBg: 'bg-orange-500',
    badge: 'Backend',
    badgeColor: 'bg-amber-500/20 text-amber-400',
    envKey: 'VITE_ANTHROPIC_BACKEND_URL',
  },
  [AI_PROVIDERS.MOCK]: {
    icon: Cpu,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    activeBg: 'bg-violet-500',
    badge: 'Demo',
    badgeColor: 'bg-violet-500/20 text-violet-400',
    envKey: null,
  },
}

export default function AIProviderSelector({ provider, onProviderChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = PROVIDER_CONFIG[provider]
  const Icon = current.icon

  return (
    <div ref={ref} className="relative" id="ai-provider-selector">
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${current.bg} ${current.border} ${current.color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
        id={`ai-provider-btn-${provider}`}
        title="Switch AI Provider"
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">{providerLabel[provider]}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Provider</p>
            </div>

            {/* Options */}
            <div className="p-2 space-y-1">
              {Object.values(AI_PROVIDERS).map((p) => {
                const cfg = PROVIDER_CONFIG[p]
                const PIcon = cfg.icon
                const isActive = provider === p

                return (
                  <motion.button
                    key={p}
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      onProviderChange(p)
                      setOpen(false)
                    }}
                    id={`ai-provider-option-${p}`}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                      isActive
                        ? `${cfg.bg} ${cfg.border} border`
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <PIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isActive ? cfg.color : 'text-text-primary'}`}>
                          {providerLabel[p]}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.badgeColor}`}>
                          {cfg.badge}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ml-auto">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {providerDescription[p]}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Footer note */}
            <div className="px-4 py-3 border-t border-border bg-surface/50">
              <p className="text-[11px] text-text-muted leading-relaxed">
                Add API keys to your <code className="text-violet-light font-mono">.env</code> file.{' '}
                Gemini runs directly in the browser. Anthropic requires a backend proxy.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
