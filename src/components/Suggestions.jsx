import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiCopy, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

const SuggestionItem = ({ sug, idx }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sug.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="glass" 
      style={{ padding: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge" style={{ background: sug.impact === 'High' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: sug.impact === 'High' ? 'var(--accent-rose)' : 'var(--accent-gold)' }}>
            {sug.impact} Impact
          </span>
          <h3 style={{ fontSize: '1.25rem' }}>{sug.title}</h3>
        </div>
        <FiInfo size={20} color="var(--text-secondary)" />
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{sug.description}</p>
      
      <div style={{ background: '#020203', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.5rem', position: 'relative' }}>
        <pre style={{ margin: 0, overflowX: 'auto', color: '#60a5fa', fontSize: '0.9rem' }}>
          <code>{sug.codeSnippet}</code>
        </pre>
        <button 
          onClick={handleCopy}
          className="btn-secondary"
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            padding: '0.4rem 0.75rem', 
            fontSize: '0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem',
            borderColor: copied ? 'var(--accent-emerald)' : 'var(--border-glass)',
            color: copied ? 'var(--accent-emerald)' : 'white'
          }}
        >
          {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy</>}
        </button>
      </div>
    </motion.div>
  );
};

const Suggestions = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <section className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <FiZap size={24} color="var(--accent-gold)" />
        </div>
        <h2 style={{ fontSize: '2.25rem' }}>AI Optimization Fixes</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {suggestions.map((sug, idx) => (
          <SuggestionItem key={idx} sug={sug} idx={idx} />
        ))}
      </div>
    </section>
  );
};

export default Suggestions;
