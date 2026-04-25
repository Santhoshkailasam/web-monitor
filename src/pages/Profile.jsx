import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { FiUser, FiMail, FiShield, FiAward, FiClock, FiLogOut, FiEdit } from 'react-icons/fi';

const Profile = () => {
  const { user, isPremium, logout } = useAuth();

  if (!user) return null;

  const stats = [
    { label: 'Analyses Run', value: '42', icon: <FiClock /> },
    { label: 'Avg. Perf Score', value: '94%', icon: <FiAward /> },
    { label: 'Issues Resolved', value: '128', icon: <FiShield /> },
  ];

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>
        {/* Profile Card */}
        <div className="glass" style={{ padding: '3rem 2rem', height: 'fit-content', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--border-glass)' }} 
            />
            <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
              <FiEdit size={16} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.displayName}</h2>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FiMail /> {user.email}
          </p>
          
          <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '20px', background: isPremium ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)', color: isPremium ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '0.8rem', border: `1px solid ${isPremium ? 'var(--accent-gold)' : 'var(--border-glass)'}` }}>
            {isPremium ? 'SPEEDGENIUS PRO' : 'FREE ACCOUNT'}
          </div>

          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
            <button className="btn-secondary" onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--accent-rose)' }}>
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>

        {/* Detailed Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '2rem' }}>Performance Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '1.5rem', color: 'var(--accent-blue)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stat.value}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Subscription & Billing</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
              <div>
                <p style={{ fontWeight: '600' }}>{isPremium ? 'Pro Monthly Plan' : 'Free Trial'}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Next billing date: May 25, 2026</p>
              </div>
              <button className="btn-primary">Manage Billing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
