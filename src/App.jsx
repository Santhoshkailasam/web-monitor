import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Suggestions from './components/Suggestions';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Features from './pages/Features';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiZap, FiClock, FiLayout, FiAward,
  FiSmartphone, FiMonitor, FiCreditCard, FiChevronRight,
  FiStar, FiGlobe, FiLogIn, FiLogOut, 
  FiUser, FiTerminal, FiSettings, FiRepeat, FiList
} from 'react-icons/fi';
import Auth from './components/Auth';
import loginBg from './assets/login-bg.png';

const App = () => {
  const { user, logout, testMode, setTestMode, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [compareReport, setCompareReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home'); // 'home', 'history', 'pricing'
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`https://web-monitor-eqkb.onrender.com/api/history?userId=${user.uid}`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleAnalyze = async (url) => {
    setLoading(true);
    setReport(null);
    setCompareReport(null);
    try {
      const { data } = await axios.post('https://web-monitor-eqkb.onrender.com/api/analyze', { 
        url, 
        device,
        userId: user?.uid 
      });

      const jobId = data.jobId;
      console.log(`Polling status for job: ${jobId}`);

      // Polling function with retries
      let retryCount = 0;
      const maxRetries = 5;

      const pollStatus = async () => {
        try {
          const statusRes = await axios.get(`https://web-monitor-eqkb.onrender.com/api/status/${jobId}`);
          const { status, data: reportData, error } = statusRes.data;

          if (status === 'complete') {
            setReport(reportData);
            if (user) fetchHistory();
            setView('home');
            setLoading(false);
          } else if (status === 'error') {
            throw new Error(error || 'Analysis failed');
          } else {
            // Reset retry count on successful response
            retryCount = 0;
            setTimeout(pollStatus, 3000);
          }
        } catch (pollErr) {
          // If it's a network error, retry a few times
          if (retryCount < maxRetries && (!pollErr.response || pollErr.response.status >= 500)) {
            retryCount++;
            console.warn(`Polling attempt ${retryCount} failed, retrying...`, pollErr.message);
            setTimeout(pollStatus, 4000); // Wait a bit longer before retry
          } else {
            console.error('Polling failed after retries', pollErr);
            const errorMsg = pollErr.response?.data?.error || pollErr.message || 'Analysis failed. Please try again.';
            alert(`Analysis failed: ${errorMsg}`);
            setLoading(false);
          }
        }
      };

      pollStatus();

    } catch (err) {
      console.error('Initial request failed', err);
      const errorMsg = err.response?.data?.error || err.message || 'Analysis failed. Please try again.';
      alert(`Analysis failed: ${errorMsg}`);
      setLoading(false);
    }
  };

  const handleTryFeature = (feature) => {
    if (feature.tier !== 'Free' && !isPremium) {
      setView('pricing');
      return;
    }

    switch (feature.title) {
      case 'Mobile Device Emulation':
        setDevice('mobile');
        setView('home');
        break;
      case 'Historical Trends':
      case 'Side-by-Side Comparison':
        setView('history');
        break;
      case 'Developer API Keys':
      case 'Slack & Discord Integration':
        setView('settings');
        break;
      default:
        setView('home');
    }
  };

  const handleCompare = (oldReport) => {
    setCompareReport(oldReport);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      <Navbar setView={setView} currentView={view} />
      
      <main style={{ minHeight: 'calc(100vh - 160px)' }}>
        {/* Test Toggle Floating Panel */}
        <div className="glass" style={{ position: 'fixed', left: '2rem', bottom: '2rem', padding: '1rem', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiTerminal size={18} color={testMode ? 'var(--accent-emerald)' : 'var(--text-secondary)'} />
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Dev Mode</span>
          <div 
            onClick={() => setTestMode(!testMode)}
            style={{ width: '40px', height: '20px', background: testMode ? 'var(--accent-emerald)' : '#333', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
          >
            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: testMode ? '22px' : '2px', transition: '0.3s' }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!user ? (
            <Auth key="auth" />
          ) : view === 'pricing' ? (
            <Pricing key="pricing" />
          ) : view === 'settings' ? (
            <Settings key="settings" />
          ) : view === 'profile' ? (
            <Profile key="profile" />
          ) : view === 'features' ? (
            <Features key="features" onTry={handleTryFeature} />
          ) : view === 'history' ? (
            <HistoryView key="history" history={history} onSelect={(item) => { setReport(item); setView('home'); }} />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!report && !loading && (
                <>
                  <Hero onAnalyze={handleAnalyze} />
                  <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <div className="glass" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setDevice('desktop')}
                        style={{ background: device === 'desktop' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                      >
                        <FiMonitor size={16} /> Desktop
                      </button>
                      <button 
                        onClick={() => {
                          if (isPremium) setDevice('mobile');
                          else setView('pricing');
                        }}
                        style={{ background: device === 'mobile' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                      >
                        <FiSmartphone size={16} /> Mobile {!isPremium && <span className="badge badge-pro" style={{ fontSize: '0.5rem' }}>PRO</span>}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {loading && <LoadingScreen />}

              {report && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {compareReport && (
                    <div className="container" style={{ marginBottom: '2rem' }}>
                      <div className="glass" style={{ padding: '1rem 2rem', border: '1px solid var(--accent-blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <FiRepeat size={20} color="var(--accent-blue)" />
                          <span>Comparing current run with report from <b>{new Date(compareReport.createdAt).toLocaleDateString()}</b></span>
                        </div>
                        <button className="btn-secondary" onClick={() => setCompareReport(null)}>Exit Comparison</button>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: compareReport ? 'grid' : 'block', gridTemplateColumns: compareReport ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                    <Dashboard data={report} history={history} onCompare={handleCompare} />
                    {compareReport && <Dashboard data={compareReport} isCompareView />}
                  </div>

                  {!compareReport && (
                    <>
                      <Suggestions suggestions={report.suggestions} />
                      <div className="container" style={{ textAlign: 'center', paddingBottom: '6rem' }}>
                        <button 
                          onClick={() => setReport(null)}
                          className="btn-secondary"
                        >
                          Analyze Another URL
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer setView={setView} />
      
      {/* Premium Floating Support */}
      <motion.div 
        whileHover={{ scale: 1.1 }}
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--accent-blue)', color: 'white', padding: '1rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.4)', zIndex: 1000 }}
      >
        <FiStar size={24} />
      </motion.div>
    </div>
  );
};



const Navbar = ({ setView, currentView }) => {
  const { user, logout, isPremium } = useAuth();
  
  return (
    <nav className="glass" style={{ margin: '1rem 2rem', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setView('home')}>
        <div style={{ background: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '10px' }}>
          <FiZap size={20} color="white" />
        </div>
        <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>Speed<span style={{ color: 'var(--accent-blue)' }}>Genius</span></span>
        {isPremium && <span className="badge badge-pro" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>PRO</span>}
      </div>
      
      {user && (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <NavBtn active={currentView === 'home'} onClick={() => setView('home')} icon={<FiLayout size={18} />} label="Dashboard" />
          <NavBtn active={currentView === 'history'} onClick={() => setView('history')} icon={<FiClock size={18} />} label="History" />
          <NavBtn active={currentView === 'features'} onClick={() => setView('features')} icon={<FiList size={18} />} label="Features" />
          <NavBtn active={currentView === 'pricing'} onClick={() => setView('pricing')} icon={<FiCreditCard size={18} />} label="Pricing" />
          <NavBtn active={currentView === 'settings'} onClick={() => setView('settings')} icon={<FiSettings size={18} />} label="Settings" />
          <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setView('profile')}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{user.displayName}</p>
              <p style={{ fontSize: '0.7rem', color: isPremium ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{isPremium ? 'PRO Member' : 'Free Plan'}</p>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${currentView === 'profile' ? 'var(--accent-blue)' : 'var(--border-glass)'}` }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={18} />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{ background: 'transparent', border: 'none', color: active ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: active ? '600' : '400', cursor: 'pointer', transition: 'color 0.2s' }}
  >
    {icon} {label}
  </button>
);

const HistoryView = ({ history, onSelect }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="container" 
    style={{ padding: '4rem 0' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FiClock size={32} color="var(--accent-blue)" />
        <h2 style={{ fontSize: '2.25rem', fontWeight: '800' }}>Recent Analyses</h2>
      </div>
      <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>Export All CSV</button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
      {history.length === 0 ? (
        <div className="glass" style={{ padding: '5rem', textAlign: 'center' }}>
          <FiGlobe size={48} color="var(--border-glass)" style={{ marginBottom: '1.5rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No history found. Start your first analysis!</p>
        </div>
      ) : (
        history.map((item) => (
          <div 
            key={item._id} 
            onClick={() => onSelect(item)}
            className="glass glass-hover" 
            style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
                <FiGlobe size={22} color="var(--text-secondary)" />
              </div>
              <div>
                <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.url}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <ScoreSummary label="Perf" value={item.performance} color="var(--accent-blue)" />
              <ScoreSummary label="SEO" value={item.seo} color="var(--accent-purple)" />
              <FiChevronRight size={20} color="var(--border-glass)" />
            </div>
          </div>
        ))
      )}
    </div>
  </motion.section>
);

const ScoreSummary = ({ label, value, color }) => (
  <div style={{ textAlign: 'right' }}>
    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.1rem', textTransform: 'uppercase' }}>{label}</p>
    <span style={{ color: color, fontWeight: '800', fontSize: '1.25rem' }}>{value}%</span>
  </div>
);

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.random() * 5 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2.5rem' }}>
      <div style={{ position: 'relative' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{ width: '80px', height: '80px', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%' }}
        />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate( -50%, -50% )', fontSize: '0.8rem', fontWeight: '800' }}>
          {Math.round(progress)}%
        </div>
      </div>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Analyzing Performance</h2>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }}
          />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Our AI is auditing your site metrics...</p>
      </div>
    </div>
  );
};

const Footer = ({ setView }) => (
  <footer style={{ padding: '5rem 0', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <FiZap size={24} color="var(--accent-blue)" />
          <span style={{ fontWeight: '800', fontSize: '1.5rem' }}>SpeedGenius</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          The world's most advanced performance optimization tool. 
          Analyze, optimize, and scale with AI-driven insights.
        </p>
      </div>
      <div>
        <h4 style={{ marginBottom: '1.5rem' }}>Product</h4>
        <FooterLink onClick={() => setView('home')}>Dashboard</FooterLink>
        <FooterLink onClick={() => setView('pricing')}>Pricing</FooterLink>
        <FooterLink>Features</FooterLink>
        <FooterLink>Extensions</FooterLink>
      </div>
      <div>
        <h4 style={{ marginBottom: '1.5rem' }}>Company</h4>
        <FooterLink>About</FooterLink>
        <FooterLink>Blog</FooterLink>
        <FooterLink>Careers</FooterLink>
        <FooterLink>Contact</FooterLink>
      </div>
      <div>
        <h4 style={{ marginBottom: '1.5rem' }}>Legal</h4>
        <FooterLink>Privacy</FooterLink>
        <FooterLink>Terms</FooterLink>
        <FooterLink>Cookie Policy</FooterLink>
      </div>
    </div>
    <div className="container" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
      <span>© 2026 SpeedGenius AI. All rights reserved.</span>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <span>Twitter</span>
        <span>GitHub</span>
        <span>LinkedIn</span>
      </div>
    </div>
  </footer>
);

const FooterLink = ({ children, onClick }) => (
  <p 
    onClick={onClick}
    style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', cursor: 'pointer', transition: 'color 0.2s' }}
    onMouseEnter={(e) => e.target.style.color = 'white'}
    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
  >
    {children}
  </p>
);

export default App;
