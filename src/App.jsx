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
import loginBg from './assets/login-bg.png';

const App = () => {
  const { user, loginWithGoogle, logout, testMode, setTestMode, isPremium } = useAuth();
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
      const response = await axios.get(`http://localhost:5000/api/history?userId=${user.uid}`);
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
      const response = await axios.post('http://localhost:5000/api/analyze', { 
        url, 
        device,
        userId: user?.uid 
      });
      setReport(response.data);
      if (user) fetchHistory();
      setView('home');
    } catch (err) {
      console.error('Analysis failed', err);
      alert('Analysis failed. Please try again.');
    } finally {
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
            <LoginView key="login" onLogin={loginWithGoogle} />
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

const LoginView = ({ onLogin }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${loginBg})` }}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="glass-premium login-card"
      >
        <div className="login-visual">
          <motion.div variants={itemVariants}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--accent-blue)', padding: '0.6rem', borderRadius: '12px' }}>
                <FiZap size={24} color="white" />
              </div>
              <span style={{ fontWeight: '800', fontSize: '1.75rem' }}>SpeedGenius</span>
            </div>
            
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', lineHeight: '1.2' }}>
              Precision tools for <br />
              <span className="gradient-blue">Modern Performance.</span>
            </h2>

            <div style={{ marginTop: '3rem' }}>
              <FeatureItem 
                icon={<FiMonitor size={18} />} 
                title="Lighthouse Audits" 
                desc="Deep analysis of performance, SEO, and accessibility metrics." 
              />
              <FeatureItem 
                icon={<FiRepeat size={18} />} 
                title="Comparison Mode" 
                desc="Track improvements across multiple runs and deployments." 
              />
              <FeatureItem 
                icon={<FiAward size={18} />} 
                title="AI Suggestions" 
                desc="Smart recommendations to boost your core web vitals." 
              />
            </div>
          </motion.div>
        </div>

        <div className="login-content">
          <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
              Sign in to your account to continue optimizing.
            </p>

            <button 
              className="btn-primary" 
              onClick={onLogin} 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '1.25rem', 
                fontSize: '1.1rem',
                gap: '1rem',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <p style={{ marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              By signing in, you agree to our <span style={{ color: 'white', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'white', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="feature-item">
    <div className="feature-icon">
      {icon}
    </div>
    <div>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{title}</h4>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{desc}</p>
    </div>
  </div>
);

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
