import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCreditCard, FiSmartphone, FiHome, 
  FiCheckCircle, FiClock, FiShield, 
  FiArrowRight, FiLock, FiX, FiCheck, FiChevronRight, FiChevronLeft, FiStar, FiZap
} from 'react-icons/fi';
import upiQr from '../assets/upi-qr.png';

const Payment = ({ plan, onCancel, onSuccess }) => {
  const [method, setMethod] = useState('upi');
  const [timer, setTimer] = useState(300);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let interval = null;
    if (method === 'upi' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [method, timer]);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isSuccess) {
    return (
      <div className="container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotateY: 10 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="glass-premium"
          style={{ 
            padding: '5rem 4rem', 
            textAlign: 'center', 
            maxWidth: '600px', 
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid var(--accent-blue)',
            boxShadow: '0 0 80px rgba(59, 130, 246, 0.2)'
          }}
        >
          {/* Decorative Elements */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', borderRadius: '50%' }}
          />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)' }}
            >
              <FiCheck size={50} color="white" />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: '3rem', fontWeight: '950', marginBottom: '1rem', letterSpacing: '-0.03em' }}
            >
              WELCOME TO <span className="gradient-text">PRO</span>
            </motion.h2>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3.5rem', lineHeight: '1.6' }}
            >
              Payment of <b>{plan?.price || '$19.00'}</b> confirmed. Your account is now fully supercharged with AI performance power.
            </motion.p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3.5rem' }}>
              <SuccessBadge icon={<FiZap />} text="Instant Access" />
              <SuccessBadge icon={<FiStar />} text="Pro Support" />
            </div>

            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onSuccess} 
              className="btn-primary" 
              style={{ width: '100%', padding: '1.5rem', fontSize: '1.25rem', fontWeight: '800', justifyContent: 'center', borderRadius: '16px' }}
            >
              Launch Dashboard <FiArrowRight style={{ marginLeft: '0.75rem' }} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '90vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ maxWidth: '1000px', width: '100%', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }} className="mobile-only-stack">
        
        {/* Left: Checkout Flow */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-premium"
          style={{ padding: '3rem', border: '1px solid var(--border-glass)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Secure Checkout</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <FiShield color="var(--accent-emerald)" size={20} />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>SSL SECURED</span>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Select Payment Method</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <MethodSelector active={method === 'upi'} onClick={() => setMethod('upi')} icon={<FiSmartphone />} label="UPI" />
              <MethodSelector active={method === 'card'} onClick={() => setMethod('card')} icon={<FiCreditCard />} label="Card" />
              <MethodSelector active={method === 'bank'} onClick={() => setMethod('bank')} icon={<FiHome />} label="Bank" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {method === 'upi' && (
              <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }} className="mobile-only-stack">
                  <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <img src={upiQr} alt="QR" style={{ width: '180px', height: '180px' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                      <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'white' }}>{formatTime(timer)}</span>
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Scan with UPI App</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Open GPay, PhonePe, or Paytm and scan the QR code to pay instantly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {method === 'card' && (
              <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Cardholder Name</label>
                  <input type="text" className="glass-input" placeholder="Full Name" style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" className="glass-input" placeholder="0000 0000 0000 0000" style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }} />
                    <FiCreditCard style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Expiry</label>
                    <input type="text" className="glass-input" placeholder="MM/YY" style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>CVC</label>
                    <input type="password" className="glass-input" placeholder="***" style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {method === 'bank' && (
              <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Select your bank to redirect to safe portal.</p>
                <select className="glass-input" style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }}>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>SBI</option>
                  <option>Axis Bank</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="btn-primary" 
            style={{ width: '100%', marginTop: '3rem', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
          >
            {isProcessing ? 'Verifying Transaction...' : `Pay ${plan?.price || '$19'} Now`}
          </button>
        </motion.div>

        {/* Right: Plan Details */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <div className="glass-premium" style={{ padding: '2.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{plan?.name || 'Pro Plan'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>You are about to unlock full power.</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subscription</span>
              <span>{plan?.price || '$19.00'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tax (GST 0%)</span>
              <span>$0.00</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700' }}>Total Amount</span>
              <span style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--accent-blue)' }}>{plan?.price || '$19.00'}</span>
            </div>
          </div>

          <div style={{ padding: '0 1rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1.5rem', fontWeight: '800' }}>What\'s included:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Feature text="Unlimited Site Audits" />
              <Feature text="Advanced AI Suggestions" />
              <Feature text="Priority Cloud Infrastructure" />
              <Feature text="White-label PDF Reports" />
            </div>
          </div>
          
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', marginTop: 'auto' }}>
            <FiChevronLeft /> Back to Plans
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const SuccessBadge = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ color: 'var(--accent-blue)', fontSize: '1.25rem' }}>{icon}</div>
    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{text}</span>
  </div>
);

const MethodSelector = ({ active, onClick, icon, label }) => (
  <div 
    onClick={onClick}
    style={{ 
      padding: '1.25rem 1rem', 
      borderRadius: '16px', 
      background: active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
      border: `2px solid ${active ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)'}`,
      cursor: 'pointer',
      textAlign: 'center',
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: active ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: active ? 'white' : 'var(--text-secondary)' }}>{label}</span>
  </div>
);

const Feature = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
    <FiCheck size={14} color="var(--accent-emerald)" />
    {text}
  </div>
);

export default Payment;
