import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiZap, FiMail, FiLock, FiAlertCircle, 
  FiArrowRight, FiMonitor, FiRepeat, FiAward, FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import loginBg from '../assets/login-bg.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithEmail, registerWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };



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
          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {isLogin ? 'Welcome Back' : 'Join SpeedGenius'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {isLogin 
                    ? 'Enter your credentials to access your dashboard' 
                    : 'Start optimizing your web performance today'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><FiMail size={18} /></div>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    {isLogin && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '500' }}>
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <div className="input-icon"><FiLock size={18} /></div>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <FiAlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '1rem' }}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-toggle" style={{ textAlign: 'center' }}>
                {isLogin ? (
                  <>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></>
                ) : (
                  <>Already have an account? <span onClick={() => setIsLogin(true)}>Sign In</span></>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
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

export default Auth;
