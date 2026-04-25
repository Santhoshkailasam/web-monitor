import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiGlobe, FiZap, FiArrowRight, FiShield } from 'react-icons/fi';

const Hero = ({ onAnalyze }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) onAnalyze(url);
  };

  return (
    <section style={{ padding: '6rem 0 4rem', textAlign: 'center' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '2rem' }}>
            <FiShield size={16} /> Trusted by 5,000+ developers
          </div>
          
          <h1 className="gradient-text" style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Optimize Your Web <br /> Performance with AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
            Analyze any URL in seconds. Get professional audits, security checks, and 
            Lighthouse-powered insights with our advanced performance engine.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <FiGlobe size={24} />
              </div>
              <input 
                type="text" 
                placeholder="Enter website URL (e.g., https://google.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%', padding: '1.5rem 1.5rem 1.5rem 4rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '1.1rem', outline: 'none' }}
              />
              <button 
                type="submit"
                className="btn-primary" 
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', padding: '0.8rem 2rem' }}
              >
                Analyze <FiZap size={18} />
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem' }}>
            <MetricSummary label="Audit Time" value="< 30s" />
            <MetricSummary label="Analysis categories" value="20+" />
            <MetricSummary label="Global nodes" value="50+" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const MetricSummary = ({ label, value }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>{value}</p>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
  </div>
);

export default Hero;
