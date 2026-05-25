import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Send, Sparkles, Trash2 } from 'lucide-react'
import { chatAssistant } from '../api/assistant'

const STORAGE_KEY = 'pm_chat_history'

const SUGGESTIONS = [
  "Quels sites sont en retard ?",
  "Performance du mois en cours",
  "Sites Gen Only non visités",
  "Résumé pour rapport MTN",
]

function loadHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function ChatAssistant() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState(loadHistory)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [hasNew, setHasNew]   = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const panelRef   = useRef(null)

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setHasNew(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Persist to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const send = useCallback(async (text) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg, ts: Date.now() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    const history = messages.map(({ role, content }) => ({ role, content }))

    try {
      const { data } = await chatAssistant({ message: msg, conversation_history: history })
      setMessages((prev) => [...prev, { role: 'model', content: data.reply, ts: Date.now() }])
      if (!open) setHasNew(true)
    } catch (err) {
      const detail = err.response?.data?.detail || "Erreur de connexion à l'assistant"
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `⚠️ ${detail}`, ts: Date.now(), error: true },
      ])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, open])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const clearHistory = () => {
    setMessages([])
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
        style={{ width: 52, height: 52 }}
        aria-label="Ouvrir l'assistant IA"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
        {hasNew && !open && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {/* ── Slide-in panel ──────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`fixed top-0 bottom-0 right-0 z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: 400,
          background: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-edge bg-surface-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-content leading-tight">Assistant PM</p>
            <p className="text-[11px] text-muted">Gemini 2.5 Flash · MTN CI</p>
          </div>
          <button
            onClick={clearHistory}
            title="Effacer l'historique"
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger-light transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-content hover:bg-surface transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center py-10 gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
                <Sparkles size={26} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-content">Bonjour !</p>
                <p className="text-xs text-muted mt-1 leading-relaxed max-w-[260px]">
                  Je suis votre assistant PM. Posez-moi une question sur le planning
                  ou choisissez une suggestion ci-dessous.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : msg.error
                    ? 'bg-danger-light text-danger rounded-bl-sm'
                    : 'bg-surface-2 text-content rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-white/50 text-right' : 'text-muted'
                }`}>
                  {formatTime(msg.ts)}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-2 rounded-2xl rounded-bl-sm px-4 py-3">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions (shown only when chat is empty) */}
        {messages.length === 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-xs bg-primary-light text-primary border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-edge bg-surface-2 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Posez votre question…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none input-base py-2 text-sm leading-relaxed disabled:opacity-60"
              style={{ minHeight: 38, maxHeight: 96 }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-muted mt-1.5">
            Entrée pour envoyer · Maj+Entrée pour saut de ligne
          </p>
        </div>
      </div>

      {/* Transparent overlay — click outside to close */}
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
      )}
    </>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1" style={{ height: 16 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}
