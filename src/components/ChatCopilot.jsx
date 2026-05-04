import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCpu, FiStar, FiRefreshCw, FiSquare } from 'react-icons/fi';

/* ── Markdown-lite renderer ── */
const FormatMessage = ({ text }) => {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {paragraphs.map((para, i) => {
        if (/^\d+\.\s/.test(para.trim())) {
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {para.split(/\n/).filter(Boolean).map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 700, flexShrink: 0 }}>{j + 1}.</span>
                  <span>{renderInline(item.replace(/^\d+\.\s*/, ''))}</span>
                </div>
              ))}
            </div>
          );
        }
        if (/^[-•]\s/.test(para.trim())) {
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {para.split(/\n/).filter(Boolean).map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-emerald)', flexShrink: 0 }}>•</span>
                  <span>{renderInline(item.replace(/^[-•]\s*/, ''))}</span>
                </div>
              ))}
            </div>
          );
        }
        return <p key={i} style={{ margin: 0 }}>{renderInline(para)}</p>;
      })}
    </div>
  );
};

const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'white', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.includes('`')) {
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cp, j) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <code key={`${i}-${j}`} style={{ background: 'rgba(59,130,246,0.15)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.78rem', color: 'var(--accent-blue)' }}>{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    }
    return part;
  });
};

/* ── Typing dots ── */
const TypingDots = () => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.6rem 0.8rem' }}>
    {[0, 1, 2].map(i => (
      <motion.span key={i}
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-blue)', display: 'block' }}
      />
    ))}
  </div>
);

/* ── Main ── */
const ChatCopilot = ({ reportData }) => {
  const getInitialMsg = () => ({
    role: 'assistant',
    content: reportData
      ? "👋 I'm **SpeedGenius AI**. Ask me anything about your audit — LCP, CLS, SEO tips, or code fixes!"
      : "👋 I'm **SpeedGenius AI**. Run an audit first, or ask me general web performance questions!"
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([getInitialMsg()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const quickPrompts = ["Why is my LCP high?", "Top 3 quick wins", "How to fix CLS?"];

  const handleNewChat = () => {
    setMessages([getInitialMsg()]);
    setInput('');
    setLoading(false);
    setAbortController(null);
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
  };

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: msg,
        reportData: reportData || { url: 'N/A', performance: 'N/A', seo: 'N/A', accessibility: 'N/A', metrics: { lcp: 0, cls: 0, fcp: 0 } },
        history: messages.slice(-4)
      }, { signal: controller.signal });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      if (axios.isCancel(err)) {
        setMessages(prev => [...prev, { role: 'assistant', content: "⏹ Stopped." }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Couldn't connect to AI. Make sure Ollama is running." }]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              width: 'min(360px, calc(100vw - 2rem))',
              height: 'min(440px, calc(100vh - 120px))',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(15,15,20,0.98), rgba(8,8,12,0.98))',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.2)',
              backdropFilter: 'blur(20px)',
              zIndex: 1001,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '0.75rem 1rem',
              background: 'linear-gradient(90deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(59,130,246,0.15)', padding: '0.35rem', borderRadius: '7px' }}>
                  <FiCpu size={14} color="var(--accent-blue)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>SpeedGenius AI</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>● Online</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {/* New Chat (always visible) */}
                <button onClick={handleNewChat} title="New chat"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px', display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <FiRefreshCw size={14} />
                </button>
                {/* Close */}
                <button onClick={() => setIsOpen(false)} title="Close"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px', display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-rose)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                >
                  <div style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, var(--accent-blue), #6366f1)'
                      : 'rgba(255,255,255,0.04)',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: m.role === 'user' ? 'white' : 'rgba(255,255,255,0.8)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}>
                    {m.role === 'user' ? m.content : <FormatMessage text={m.content} />}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)', borderRadius: '12px 12px 12px 2px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <TypingDots />
                </motion.div>
              )}

              {messages.length === 1 && !loading && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
                  {quickPrompts.map((q, i) => (
                    <button key={i} onClick={() => handleSend(q)}
                      style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '18px', padding: '0.3rem 0.65rem', fontSize: '0.7rem', color: 'var(--accent-blue)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                    >{q}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{
              padding: '0.65rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              gap: '0.4rem',
              flexShrink: 0,
            }}>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about performance..."
                disabled={loading}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.5rem 0.75rem', color: 'white', fontSize: '0.8rem', outline: 'none' }}
              />
              {loading ? (
                <button type="button" onClick={handleStop}
                  style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '0.5rem 0.6rem', cursor: 'pointer', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center' }}>
                  <FiSquare size={14} />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()}
                  style={{ background: input.trim() ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '0.5rem 0.6rem', cursor: input.trim() ? 'pointer' : 'default', color: 'white', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                  <FiSend size={14} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Star Button (hidden when chat is open) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.08, boxShadow: '0 12px 35px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem',
              background: 'linear-gradient(135deg, var(--accent-blue), #6366f1)',
              color: 'white', width: '50px', height: '50px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.35)', border: 'none', cursor: 'pointer', zIndex: 1000,
            }}
          >
            <FiStar size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatCopilot;
