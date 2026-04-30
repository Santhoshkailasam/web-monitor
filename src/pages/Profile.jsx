import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiCalendar, FiShield, 
  FiAward, FiSettings, FiLogOut, FiZap, 
  FiActivity, FiPieChart, FiStar, FiChevronRight, FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const Profile = () => {
  const { user, userData, isPremium, logout } = useAuth();

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '1200px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }} className="mobile-only-stack">
        
        {/* Left: User Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-premium"
          style={{ padding: '3rem', textAlign: 'center', height: 'fit-content' }}
        >
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
            <img 
              src={user?.photoURL || 'https://via.placeholder.com/120'} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--accent-blue)', padding: '4px' }} 
            />
            {isPremium && (
              <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--accent-gold)', borderRadius: '50%', padding: '6px', border: '3px solid var(--bg-main)', color: 'black' }}>
                <FiAward size={14} />
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.5rem' }}>{user?.displayName || 'User'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>{user?.email}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ProfileActionButton icon={<FiSettings />} text="Account Settings" />
            <ProfileActionButton icon={<FiCreditCard />} text="Billing & Plans" />
            <ProfileActionButton icon={<FiShield />} text="Privacy & Security" />
            <button 
              onClick={logout}
              style={{ marginTop: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: '700', transition: '0.2s' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </motion.div>

        {/* Right: Membership & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Membership Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium"
            style={{ 
              padding: '2.5rem', 
              background: isPremium ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'rgba(255,255,255,0.02)',
              border: isPremium ? '1px solid var(--accent-blue)' : '1px solid var(--border-glass)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isPremium && <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-blue)', filter: 'blur(100px)', opacity: 0.3 }} />}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Membership Status</h3>
                <h4 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
                  {isPremium ? 'PRO MEMBER' : 'FREE ACCOUNT'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                  {isPremium 
                    ? 'You have full access to all premium features, AI-powered code fixes, and executive reports.' 
                    : 'Upgrade your account to unlock unlimited scans, PDF reports, and AI code doctor.'}
                </p>
              </div>
              <div style={{ background: isPremium ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', color: 'white' }}>
                {isPremium ? <FiStar size={32} /> : <FiZap size={32} />}
              </div>
            </div>

            {!isPremium && (
              <button className="btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 2rem' }}>
                Upgrade to Pro
              </button>
            )}
          </motion.div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <StatCard icon={<FiActivity />} label="Total Audits" value="124" />
            <StatCard icon={<FiPieChart />} label="Avg. Score" value="96%" />
          </div>

          {/* Usage Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-premium"
            style={{ padding: '2.5rem' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ActivityItem title="Turbo Audit Run" date="2 hours ago" url="speedgenius.app" score={98} />
              <ActivityItem title="PDF Report Generated" date="5 hours ago" url="myportfolio.dev" score={94} />
              <ActivityItem title="AI Code Fix Applied" date="1 day ago" url="shop-online.com" score={89} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ProfileActionButton = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{text}</span>
    </div>
    <FiChevronRight color="var(--border-glass)" />
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-premium" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '14px', color: 'var(--accent-blue)' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <h4 style={{ fontSize: '2rem', fontWeight: '900' }}>{value}</h4>
    </div>
  </motion.div>
);

const ActivityItem = ({ title, date, url, score }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiZap size={18} color="var(--accent-blue)" />
      </div>
      <div>
        <h5 style={{ fontWeight: '700', fontSize: '1rem' }}>{title}</h5>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{url} • {date}</p>
      </div>
    </div>
    <div style={{ fontWeight: '800', color: score > 90 ? 'var(--accent-emerald)' : 'var(--accent-gold)' }}>{score}%</div>
  </div>
);

export default Profile;
