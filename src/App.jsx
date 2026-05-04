import React, { useState, useEffect, Component, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Suggestions from './components/Suggestions';
import ChatCopilot from './components/ChatCopilot';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Features from './pages/Features';

import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiZap, FiClock, FiLayout, FiAward,
  FiSmartphone, FiMonitor, FiCreditCard, FiChevronRight,
  FiStar, FiGlobe, FiLogIn, FiLogOut, 
  FiUser, FiTerminal, FiSettings, FiRepeat, FiList, FiMenu, FiX
} from 'react-icons/fi';
import Auth from './components/Auth';
import loginBg from './assets/login-bg.png';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ margin: '2rem auto' }}>Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const { user, logout, testMode, setTestMode, isPremium, upgradeUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [compareReport, setCompareReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home'); // 'home', 'history', 'pricing'
  const [device, setDevice] = useState('desktop');
  const [progress, setProgress] = useState(0);
  const pollTimer = useRef(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
    }
    
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:5001/api/history?userId=${user.uid}`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleAnalyze = async (url) => {
    setLoading(true);
    setReport(null);
    setCompareReport(null);
    setProgress(0);
    try {
      const { data } = await axios.post('http://localhost:5001/api/analyze', { 
        url, 
        device,
        userId: user?.uid 
      });

      const jobId = data.jobId;

      // Polling function with retries
      let retryCount = 0;
      const maxRetries = 30; // Increased to 90s for local LLM processing

      const pollStatus = async () => {
        try {
          const statusRes = await axios.get(`http://localhost:5001/api/status/${jobId}`);
          const { status, data: reportData, error } = statusRes.data;
          
          if (status === 'complete') {
            setReport(reportData);
            if (user) fetchHistory();
            setView('home');
            setLoading(false);
          } else if (status === 'error') {
            throw new Error(error || 'Analysis failed');
          } else {
            retryCount = 0;
            pollTimer.current = setTimeout(pollStatus, 3000);
          }
        } catch (pollErr) {
          if (retryCount < maxRetries) {
            retryCount++;
            pollTimer.current = setTimeout(pollStatus, 5000); 
          } else {
            const errorMsg = pollErr.response?.data?.error || pollErr.message || 'Analysis failed. Please try again.';
            toast.error(`Analysis failed: ${errorMsg}`);
            setLoading(false);
          }
        }
      };

      pollStatus();

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Analysis failed. Please try again.';
      toast.error(`Analysis failed: ${errorMsg}`);
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
      
      {/* Test Toggle Floating Panel - Moved for Global Visibility */}
      {process.env.NODE_ENV === 'development' && (
        <div className="glass" style={{ position: 'fixed', left: '2rem', bottom: '2rem', padding: '1rem', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.75rem', border: testMode ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <FiTerminal size={18} color={testMode ? 'var(--accent-emerald)' : 'var(--text-secondary)'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Status</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{testMode ? 'PREMIUM ACTIVE' : 'Dev Mode'}</span>
          </div>
          <div 
            onClick={() => setTestMode(!testMode)}
            style={{ width: '40px', height: '20px', background: testMode ? 'var(--accent-emerald)' : '#333', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
          >
            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: testMode ? '22px' : '2px', transition: '0.3s' }} />
          </div>
        </div>
      )}
      
      <main style={{ minHeight: 'calc(100vh - 160px)', willChange: 'transform' }}>
        <ErrorBoundary>


        <AnimatePresence mode="wait">
          {!user ? (
            <Auth key="auth" />
          ) : view === 'pricing' ? (
            <Pricing key="pricing" onSelectPlan={(plan) => setView('payment')} />
          ) : view === 'payment' ? (
            <Payment key="payment" onCancel={() => setView('pricing')} onSuccess={() => { upgradeUser(); setView('home'); }} />
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
                  <Hero onAnalyze={handleAnalyze} loading={loading} />
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
              
              {loading && <LoadingScreen progress={progress} setProgress={setProgress} />}

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
                    <Dashboard data={report} history={history} onCompare={handleCompare} setView={setView} />
                    {compareReport && <Dashboard data={compareReport} isCompareView setView={setView} />}
                  </div>

                  {!compareReport && (
                    <>
                      <Suggestions suggestions={report.suggestions} url={report.url} />
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
        </ErrorBoundary>
      </main>

      <Footer setView={setView} />
      
      <ChatCopilot reportData={report} />
      <Toaster position="bottom-right" />
    </div>
  );
};



const Navbar = ({ setView, currentView }) => {
  const { user, logout, isPremium } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavClick = (view) => {
    setView(view);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="glass-premium" style={{ margin: '1.5rem auto', maxWidth: '1400px', width: 'calc(100% - 3rem)', padding: '0.6rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 1000, border: '1px solid var(--border-glass)' }}>
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: '0 0 200px' }} onClick={() => handleNavClick('home')}>
          <div style={{ background: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap size={18} color="white" />
          </div>
          <span style={{ fontWeight: '900', fontSize: '1.25rem' }}>Speed<span style={{ color: 'var(--accent-blue)' }}>Genius</span></span>
        </div>
        
        {user && (
          <>
            {/* Center: Nav Items */}
            <div className="desktop-only" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <NavBtn active={currentView === 'home'} onClick={() => handleNavClick('home')} icon={<FiLayout size={18} />} label="Dashboard" />
              <NavBtn active={currentView === 'history'} onClick={() => handleNavClick('history')} icon={<FiClock size={18} />} label="History" />
              <NavBtn active={currentView === 'features'} onClick={() => handleNavClick('features')} icon={<FiList size={18} />} label="Features" />
              <NavBtn active={currentView === 'pricing'} onClick={() => handleNavClick('pricing')} icon={<FiCreditCard size={18} />} label="Pricing" />
            </div>

            {/* Right: Profile & Action */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '0 0 200px', justifyContent: 'flex-end' }}>
              {!isPremium && (
                <button onClick={() => handleNavClick('pricing')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                  Go Pro
                </button>
              )}
              
              <div 
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', border: `2px solid ${currentView === 'profile' ? 'var(--accent-blue)' : 'var(--border-glass)'}`, padding: '2px', transition: '0.2s' }} 
                onClick={() => handleNavClick('profile')}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUser size={16} />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="mobile-only">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zLayer: 998 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass mobile-only"
              style={{ position: 'fixed', top: '5.5rem', left: '1rem', right: '1rem', zIndex: 999, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <NavBtn active={currentView === 'home'} onClick={() => handleNavClick('home')} icon={<FiLayout size={18} />} label="Dashboard" />
              <NavBtn active={currentView === 'history'} onClick={() => handleNavClick('history')} icon={<FiClock size={18} />} label="History" />
              <NavBtn active={currentView === 'features'} onClick={() => handleNavClick('features')} icon={<FiList size={18} />} label="Features" />
              <NavBtn active={currentView === 'pricing'} onClick={() => handleNavClick('pricing')} icon={<FiCreditCard size={18} />} label="Pricing" />
              <NavBtn active={currentView === 'profile'} onClick={() => handleNavClick('profile')} icon={<FiUser size={18} />} label="Profile" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const NavBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.6rem', 
      padding: '0.6rem 1.1rem', 
      borderRadius: '10px', 
      background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      color: active ? 'white' : 'var(--text-secondary)', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '0.875rem',
      fontWeight: active ? '700' : '500',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    }}
  >
    <span style={{ display: 'flex', color: active ? 'var(--accent-blue)' : 'inherit' }}>{icon}</span>
    {label}
    {active && (
      <motion.div 
        layoutId="nav-active"
        style={{ position: 'absolute', bottom: '-4px', left: '20%', right: '20%', height: '2px', background: 'var(--accent-blue)', borderRadius: '2px', boxShadow: '0 0 8px var(--accent-blue)' }} 
      />
    )}
  </button>
);

const HistorySkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
    {[1, 2, 3].map(i => (
      <div key={i} className="glass" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '46px', height: '46px', borderRadius: '12px' }} className="animate-pulse" />
          <div>
            <div style={{ width: '200px', height: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }} className="animate-pulse" />
            <div style={{ width: '150px', height: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} className="animate-pulse" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ width: '60px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="animate-pulse" />
          <div style={{ width: '60px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="animate-pulse" />
        </div>
      </div>
    ))}
  </div>
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
        <div className="glass" style={{ padding: '5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <FiGlobe size={80} color="var(--border-glass)" style={{ opacity: 0.2 }} />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, border: '1px dashed var(--border-glass)', borderRadius: '50%', opacity: 0.3 }}
            />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your history is empty</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.6' }}>Start your first analysis to see performance trends and historical reports here.</p>
          <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>Try Analysis Now</button>
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

const LoadingScreen = ({ progress, setProgress }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.random() * 5 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [setProgress]);

  const statusMessages = [
    { threshold: 0, msg: "Initializing Turbo Engine..." },
    { threshold: 20, msg: "Launching Lighthouse Headless..." },
    { threshold: 40, msg: "Warming up Network Layers..." },
    { threshold: 60, msg: "Auditing SEO & Performance..." },
    { threshold: 80, msg: "Crunching AI Recommendations..." },
    { threshold: 95, msg: "Finalizing Report Data..." }
  ];

  const currentMsg = statusMessages.reverse().find(m => progress >= m.threshold)?.msg || statusMessages[0].msg;

  return (
    <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '3rem', position: 'relative' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer Pulsing Ring */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: '100%', height: '100%', border: '1px solid var(--accent-blue)', borderRadius: '50%' }}
        />
        
        {/* Middle Rotating Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          style={{ position: 'absolute', width: '80%', height: '80%', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%' }}
        />

        {/* Main Spinner */}
        <div style={{ position: 'relative' }}>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            style={{ width: '100px', height: '100px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}
          />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{Math.round(progress)}%</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>Scan</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', width: '100%', maxWidth: '500px', zIndex: 1 }}>
        <motion.h2 
          key={currentMsg}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-text" 
          style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '900' }}
        >
          Analyzing performance
        </motion.h2>
        
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
            />
          </div>
          <motion.p 
            key={currentMsg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-blue)' }} />
            {currentMsg}
          </motion.p>
        </div>
      </div>

      {/* Decorative background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
    </div>
  );
};

const Footer = ({ setView }) => (
  <footer style={{ padding: '5rem 0', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
    <div className="container footer-grid">
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
    <div className="container footer-bottom">
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
