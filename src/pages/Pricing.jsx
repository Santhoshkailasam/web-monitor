import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiShield, FiAward } from 'react-icons/fi';

const Pricing = () => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for side projects',
      features: ['5 scans per day', 'Performance metrics', 'Standard history', 'Core web vitals'],
      icon: <FiZap size={24} />,
      color: 'var(--text-secondary)'
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'For growing websites',
      features: ['Unlimited scans', 'Advanced SEO & Accessibility', 'PDF & CSV Export', 'Comparison tool', '7-day trend history'],
      icon: <FiAward size={24} color="#f59e0b" />,
      color: '#f59e0b',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'For teams and agencies',
      features: ['White-label reports', 'API Access', 'Auto-monitoring', 'Slack/Discord alerts', 'Priority support'],
      icon: <FiZap size={24} color="#3b82f6" />,
      color: '#3b82f6'
    }
  ];

  return (
    <div className="container" style={{ padding: '6rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Scale Your Performance</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Choose the plan that fits your needs. All plans include our AI-powered suggestions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {tiers.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass glow-card ${tier.popular ? 'animate-pulse-glow' : ''}`}
            style={{ 
              padding: '3rem 2rem', 
              position: 'relative', 
              border: tier.popular ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)'
            }}
          >
            {tier.popular && (
              <span className="badge badge-pro" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                Most Popular
              </span>
            )}
            
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                {tier.icon}
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tier.name}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '800' }}>{tier.price}</span>
                <span style={{ color: 'var(--text-secondary)' }}>/mo</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{tier.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
              {tier.features.map((feature, fidx) => (
                <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem', borderRadius: '50%' }}>
                    <FiCheck size={14} color="#10b981" />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button className={tier.popular ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center' }}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
