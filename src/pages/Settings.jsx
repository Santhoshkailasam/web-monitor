import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiKey, FiSlack, FiBell, FiGlobe, FiTrash2, FiPlus, FiLock } from 'react-icons/fi';

const Settings = () => {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Account Settings</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SettingsTab active icon={<FiShield size={18} />} label="General" />
          <SettingsTab icon={<FiKey size={18} />} label="API Keys" premium />
          <SettingsTab icon={<FiSlack size={18} />} label="Integrations" premium />
          <SettingsTab icon={<FiBell size={18} />} label="Notifications" />
          <SettingsTab icon={<FiGlobe size={18} />} label="Monitoring" premium />
        </div>

        {/* Content */}
        <div className="glass" style={{ padding: '3rem' }}>
          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>API Configuration</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your API keys for programmatic access to SpeedGenius analytics.</p>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '600' }}>Production Key</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Created: Apr 25, 2026</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="password" 
                  value="sk_live_51Pxxxxxxxxxxxxxxxxxxxx" 
                  readOnly 
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', color: 'white', padding: '0.75rem', borderRadius: '8px' }} 
                />
                <button className="btn-secondary" style={{ padding: '0.75rem' }}>Copy</button>
              </div>
            </div>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiPlus size={18} /> Generate New Key
            </button>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '3rem 0' }} />

          <section>
            <h3 style={{ marginBottom: '1.5rem' }}>Team & Permissions</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AD</div>
                <div>
                  <p style={{ fontWeight: '600' }}>Admin User</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>admin@speedgenius.ai</p>
                </div>
              </div>
              <span className="badge badge-pro">Owner</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ icon, label, active, premium }) => (
  <div 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      padding: '1rem 1.5rem', 
      borderRadius: '12px', 
      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      color: active ? 'white' : 'var(--text-secondary)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
  >
    {icon} 
    <span style={{ flex: 1 }}>{label}</span>
    {premium && <FiLock size={12} color="var(--accent-gold)" />}
  </div>
);

export default Settings;
