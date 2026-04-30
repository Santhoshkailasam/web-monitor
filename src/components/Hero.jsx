import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiArrowRight, FiStar, FiClock, FiBarChart2, FiAward, FiCheck } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const Hero = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');
  const { isPremium } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && !loading) onAnalyze(url);
  };

  const quickUrls = [
    { name: 'Google', url: 'https://google.com' },
    { name: 'Amazon', url: 'https://amazon.com' },
    { name: 'Vercel', url: 'https://vercel.com' },
  ];

  return (
    <section style={{ padding: '1rem 0 6rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '60%', left: '30%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {isPremium ? (
            <motion.div 
              initial={{ scale: 0.8, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)', border: '2px solid #fbbf24', color: '#fbbf24', borderRadius: '100px', fontSize: '1rem', fontWeight: '900', marginBottom: '2.5rem', boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              <FiAward size={20} />
              <span>SpeedGenius Pro Activated</span>
              <FiCheck size={18} />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '500', marginBottom: '2.5rem' }}
            >
              <span style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => <FiStar key={i} size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--border-glass)' }} />
              <span>Trusted by 5,000+ developers</span>
            </motion.div>
          )}
          
          <h1 className="gradient-text hero-title">
            The Intelligence Layer for <br />
            <span style={{ color: 'white' }}>Web Performance.</span>
          </h1>
          
          <p className="hero-subtitle">
            Stop guessing. Start optimizing. SpeedGenius uses AI to dissect your site 
            performance and deliver professional, actionable insights in seconds.
          </p>

          <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }} className="hero-form-container">
            <div style={{ position: 'relative', maxWidth: '850px', margin: '0 auto' }}>
              <div className="glass-premium" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '0.5rem', gap: '0.5rem', background: 'rgba(15, 15, 20, 0.4)', borderRadius: '24px' }}>
                <div style={{ padding: '0 1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }} className="desktop-only">
                  <FiGlobe size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter website URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', outline: 'none', padding: '1rem' }}
                />
                <button 
                  type="submit"
                  className="btn-primary" 
                  disabled={loading}
                  style={{ padding: '1rem 2rem', borderRadius: '18px', fontSize: '1rem', width: 'auto', flexShrink: 0, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Analyzing...' : 'Analyze'} <span className="desktop-only" style={{ marginLeft: '0.25rem' }}>Site</span> <FiArrowRight size={18} />
                </button>
              </div>
            </div>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick audit:</span>
            {quickUrls.map(item => (
              <button 
                key={item.name}
                onClick={() => setUrl(item.url)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s' }}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="hero-metrics">
            <HeroMetric label="Audit Speed" value="< 30s" icon={<FiClock size={16} />} />
            <HeroMetric label="Metrics Tracked" value="20+" icon={<FiBarChart2 size={16} />} />
            <HeroMetric label="Global Nodes" value="50+" icon={<FiGlobe size={16} />} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HeroMetric = ({ label, value, icon }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <div style={{ color: 'var(--accent-blue)', opacity: 0.8 }}>{icon}</div>
      <p style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', margin: 0 }}>{value}</p>
    </div>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>{label}</p>
  </div>
);

export default Hero;
