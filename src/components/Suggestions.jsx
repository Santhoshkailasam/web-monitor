import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiCopy, FiCheck, FiAlertCircle, FiInfo, FiCpu, FiPlayCircle, FiLoader, FiRepeat } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SuggestionItem = ({ sug, idx, url }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiFix, setAiFix] = useState(null);

  const handleCopy = () => {
    const code = aiFix ? aiFix.codeSnippet : sug.codeSnippet;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateFix = async () => {
    setLoading(true);
    const toastId = toast.loading(`Generating AI fix for ${sug.title}...`);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-fix', {
        title: sug.title,
        description: sug.description,
        url: url
      });
      setAiFix(response.data);
      toast.success('AI Fix generated!', { id: toastId });
    } catch (err) {
      console.error('AI Fix failed', err);
      toast.error('AI failed to generate fix. Local LLM might be busy.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const showCode = aiFix || (sug.codeSnippet && !loading);

  const isAiFailure = aiFix && (aiFix.explanation?.includes("AI format error") || aiFix.codeSnippet?.includes("Retry or manually"));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="glass" 
      style={{ padding: '1.5rem', border: isAiFailure ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-glass)', overflow: 'hidden' }}
    >
      {/* Header - responsive wrap */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
          <span className="badge" style={{ background: sug.impact === 'High' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: sug.impact === 'High' ? 'var(--accent-rose)' : 'var(--accent-gold)', flexShrink: 0, fontSize: '0.7rem' }}>
            {sug.impact} Impact
          </span>
          {aiFix && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <span className="badge" style={{ background: isAiFailure ? 'rgba(244, 63, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)', color: isAiFailure ? 'var(--accent-rose)' : 'var(--accent-purple)', border: '1px solid currentColor', opacity: 0.8, fontSize: '0.7rem' }}>
                {isAiFailure ? 'AI Error' : 'AI-Tailored'}
              </span>
              <button 
                onClick={generateFix} disabled={loading} title="Retry AI"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                {loading ? <FiLoader className="animate-spin" size={13} /> : <FiRepeat size={13} />}
              </button>
            </div>
          )}
          <h3 style={{ fontSize: '1.1rem', margin: 0, wordBreak: 'break-word' }}>{sug.title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {aiFix && !isAiFailure && <FiCpu size={16} color="var(--accent-purple)" className="animate-pulse" />}
          {isAiFailure && <FiAlertCircle size={16} color="var(--accent-rose)" />}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6', fontSize: '0.9rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {aiFix ? aiFix.explanation : sug.description}
      </p>
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass"
            style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}
          >
            <FiLoader className="animate-spin" size={28} color="var(--accent-blue)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.85rem' }}>AI is analyzing your code...</p>
          </motion.div>
        ) : isAiFailure ? (
          <motion.div 
            key="failure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.05)' }}
          >
            <FiAlertCircle size={28} color="var(--accent-rose)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>AI Optimization Failed</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              The local LLM returned an invalid format.
            </p>
            <button 
              className="btn-primary" 
              onClick={generateFix}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
            >
              <FiRepeat size={14} /> Retry AI Optimization
            </button>
          </motion.div>
        ) : !showCode ? (
          <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button 
              className="btn-primary" 
              onClick={generateFix}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <FiPlayCircle size={16} /> Generate AI Code Fix
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="code"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#020203', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem', position: 'relative', maxWidth: '100%' }}
          >
            <pre style={{ margin: 0, overflowX: 'auto', color: '#60a5fa', fontSize: '0.82rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <code>{aiFix ? aiFix.codeSnippet : sug.codeSnippet}</code>
            </pre>
            <button 
              onClick={handleCopy}
              className="btn-secondary"
              style={{ 
                position: 'absolute', top: '0.75rem', right: '0.75rem', 
                padding: '0.3rem 0.6rem', fontSize: '0.75rem', 
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                borderColor: copied ? 'var(--accent-emerald)' : 'var(--border-glass)',
                color: copied ? 'var(--accent-emerald)' : 'white'
              }}
            >
              {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Suggestions = ({ suggestions, url }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <section className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <FiCpu size={24} color="var(--accent-blue)" />
        </div>
        <div>
          <h2 style={{ fontSize: '2.25rem', margin: 0 }}>Smart Optimization Engine</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Select an audit below to generate a tailored AI solution.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {suggestions.map((sug, idx) => (
          <SuggestionItem key={idx} sug={sug} idx={idx} url={url} />
        ))}
      </div>
    </section>
  );
};

export default Suggestions;
