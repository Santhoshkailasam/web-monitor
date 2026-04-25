import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts';
import { 
  FiClock, FiMousePointer, FiLayout, FiActivity, FiAlertCircle,
  FiCheckCircle, FiInfo, FiCode, FiShield, FiEye,
  FiSmartphone, FiMonitor, FiDownload, FiShare2, FiBarChart2, 
  FiLock, FiMessageSquare, FiFacebook, FiTwitter, FiLinkedin,
  FiCopy, FiRepeat, FiGlobe, FiZap
} from 'react-icons/fi';

const Dashboard = ({ data, history, onCompare, isCompareView }) => {
  const { isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState('performance');

  if (!data) return null;

  const handleExport = (type) => {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `speedgenius_report_${Date.now()}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'performance', label: 'Performance', icon: <FiActivity size={18} /> },
    { id: 'seo', label: 'SEO', icon: <FiEye size={18} /> },
    { id: 'accessibility', label: 'Accessibility', icon: <FiSmartphone size={18} /> },
    { id: 'security', label: 'Security', icon: <FiShield size={18} /> },
    { id: 'resources', label: 'Resources', icon: <FiCode size={18} /> },
    { id: 'social', label: 'Social', icon: <FiShare2 size={18} /> },
    { id: 'compare', label: 'Compare', icon: <FiRepeat size={18} /> },
  ];

  const radarData = [
    { subject: 'Perf', A: data.performance, fullMark: 100 },
    { subject: 'SEO', A: data.seo, fullMark: 100 },
    { subject: 'Access', A: data.accessibility, fullMark: 100 },
    { subject: 'Best Prac', A: data.bestPractices, fullMark: 100 },
    { subject: 'Security', A: 85, fullMark: 100 },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container" 
      style={{ padding: '2rem 0 6rem' }}
    >
      {/* Top Scores Section */}
      {!isCompareView && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <ScoreBubble label="Performance" value={data.performance} color="var(--accent-emerald)" />
          <ScoreBubble label="SEO" value={data.seo} color="var(--accent-purple)" />
          <ScoreBubble label="Accessibility" value={data.accessibility} color="var(--accent-blue)" />
          <ScoreBubble label="Best Practices" value={data.bestPractices} color="var(--accent-gold)" />
          <ScoreBubble label="Security" value={85} color="var(--accent-rose)" />
        </div>
      )}

      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Detailed Report</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Detailed audit for <span style={{ color: 'white' }}>{data.url}</span></p>
        </div>
        {!isCompareView && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShare2 size={18} /> Export CSV
            </button>
            <button className="btn-primary" onClick={() => handleExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiDownload size={18} /> Export PDF <span className="badge badge-pro" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>PRO</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isCompareView ? '1fr' : '1fr 350px', gap: '2rem' }}>
        <div>
          {/* Tabs Nav */}
          <div className="tabs-nav">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {tab.icon} {tab.label}
                {['security', 'resources', 'social', 'compare'].includes(tab.id) && !isPremium && <FiLock size={12} color="var(--accent-gold)" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'performance' && <PerformanceTab data={data} />}
              {activeTab === 'seo' && <SEOTab data={data} />}
              {activeTab === 'accessibility' && <AccessibilityTab data={data} />}
              {activeTab === 'security' && (isPremium ? <SecurityTab data={data.security} /> : <LockedTab category="security" />)}
              {activeTab === 'resources' && (isPremium ? <ResourcesTab data={data.resources} /> : <LockedTab category="resources" />)}
              {activeTab === 'social' && (isPremium ? <SocialTab data={data} /> : <LockedTab category="social" />)}
              {activeTab === 'compare' && (isPremium ? <CompareTab data={data} history={history} onCompare={onCompare} /> : <LockedTab category="compare" />)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Health Radar */}
        {!isCompareView && (
          <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Overall Health</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="var(--accent-blue)"
                    fill="var(--accent-blue)"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>Excellent</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Scanned</span>
                <span>Just now</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

const PerformanceTab = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid var(--border-glass)' }}>
      <h3 style={{ fontSize: '1.1rem' }}>Core Metrics</h3>
      <span className="badge" style={{ background: 'var(--accent-emerald)', color: 'white' }}>{data.performance}% Score</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
    <MetricCard 
      icon={<FiClock size={22} color="var(--accent-blue)" />}
      label="Largest Contentful Paint"
      value={data.metrics.lcp}
      unit="s"
      desc="Time for main content to appear"
    />
    <MetricCard 
      icon={<FiMousePointer size={22} color="var(--accent-emerald)" />}
      label="Cumulative Layout Shift"
      value={data.metrics.cls}
      unit=""
      desc="Visual stability of the page"
    />
    <MetricCard 
      icon={<FiLayout size={22} color="var(--accent-gold)" />}
      label="First Contentful Paint"
      value={data.metrics.fcp}
      unit="s"
      desc="Time for first visual element"
    />
    <MetricCard 
      icon={<FiActivity size={22} color="var(--accent-purple)" />}
      label="Speed Index"
      value={data.metrics.speedIndex}
      unit=""
      desc="How quickly contents are visible"
    />
    </div>
  </div>
);

const AccessibilityTab = ({ data }) => (
  <div className="glass" style={{ padding: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h3>Accessibility Audit</h3>
      <span className="badge" style={{ background: 'var(--accent-blue)', color: 'white' }}>{data.accessibility}% Score</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <MetricCard icon={<FiActivity size={20} />} label="ARIA Roles" value="98" unit="%" desc="Correct usage of ARIA attributes" />
      <MetricCard icon={<FiEye size={20} />} label="Contrast" value="92" unit="%" desc="Text color contrast ratios" />
      <MetricCard icon={<FiSmartphone size={20} />} label="Screen Readers" value="100" unit="%" desc="Alt text and navigation" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AuditItem success title="Image elements have [alt] attributes" />
      <AuditItem success title="Form elements have associated labels" />
      <AuditItem success title="[aria-*] attributes match their roles" />
      <AuditItem warning title="Heading elements are not in a sequentially-descending order" />
      <AuditItem success title="HTML has a [lang] attribute" />
    </div>
  </div>
);

const SEOTab = ({ data }) => (
  <div className="glass" style={{ padding: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h3>SEO Audit Details</h3>
      <span className="badge" style={{ background: 'var(--accent-purple)', color: 'white' }}>{data.seo}% Score</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AuditItem success title="Document has a title element" />
      <AuditItem success title="Document has a meta description" />
      <AuditItem success title="Links have descriptive text" />
      <AuditItem success title="Page is crawlable" />
      <AuditItem warning title="Image elements missing alt attributes" />
    </div>
  </div>
);

const SecurityTab = ({ data }) => (
  <div className="glass" style={{ padding: '2rem' }}>
    <h3 style={{ marginBottom: '1.5rem' }}>Security Headers Analysis</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AuditItem success={data?.hsts} title="Strict-Transport-Security (HSTS)" />
      <AuditItem success={data?.csp} title="Content-Security-Policy (CSP)" />
      <AuditItem success={data?.xFrame} title="X-Frame-Options (Clickjacking protection)" />
      <AuditItem success={data?.xContentType} title="X-Content-Type-Options" />
      <AuditItem success={data?.referrer} title="Referrer-Policy" />
      <AuditItem success title="SSL/TLS Certificate is valid" />
    </div>
  </div>
);

const ScoreBubble = ({ label, value, color }) => (
  <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white' }}>{value}%</div>
    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color }} />
    </div>
  </div>
);

const ResourcesTab = ({ data }) => {
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Resource data unavailable.</div>;
  
  const chartData = [
    { name: 'JS', size: data.js || 0, color: '#3b82f6' },
    { name: 'CSS', size: data.css || 0, color: '#10b981' },
    { name: 'Images', size: data.images || 0, color: '#f59e0b' },
  ];

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '2rem' }}>Resource Weight Distribution</h3>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" />
            <RechartsTooltip 
              cursor={{ fill: 'transparent' }} 
              contentStyle={{ background: '#0a0a0c', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
            />
            <Bar dataKey="size" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Total Page Weight: <span style={{ color: 'white', fontWeight: '700' }}>{data.total || 0} KB</span></p>
      </div>
    </div>
  );
};

const SocialTab = ({ data }) => (
  <div className="glass" style={{ padding: '2rem' }}>
    <h3 style={{ marginBottom: '2rem' }}>Social Media Preview Audit</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <SocialCard platform="Google" icon={<FiGlobe size={18} color="#4285F4" />} title={data.url} desc="Experience the best web performance optimizer tool..." />
      <SocialCard platform="Facebook" icon={<FiFacebook size={18} color="#1877F2" />} title="SpeedGenius Pro Analysis" desc="Boost your site speed and SEO with AI..." />
      <SocialCard platform="Twitter" icon={<FiTwitter size={18} color="#1DA1F2" />} title="SpeedGenius Report" desc="Analyzed with SpeedGenius Pro." />
    </div>
  </div>
);

const SocialCard = ({ platform, icon, title, desc }) => (
  <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
      {icon} {platform}
    </div>
    <div style={{ padding: '1rem' }}>
      <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, #1e1e24 0%, #0a0a0c 100%)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiZap size={32} color="var(--border-glass)" />
      </div>
      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  </div>
);

const CompareTab = ({ data, history, onCompare }) => (
  <div className="glass" style={{ padding: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h3 style={{ margin: 0 }}>Comparison Portal</h3>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{history?.length || 0} analyses available</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {history?.slice(0, 5).map((item, idx) => (
        <div key={idx} className="glass-hover" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
          <div>
            <p style={{ fontWeight: '700', fontSize: '1rem', color: 'white' }}>{new Date(item.createdAt).toLocaleDateString()} @ {new Date(item.createdAt).toLocaleTimeString()}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Perf: {item.performance}%</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>SEO: {item.seo}%</span>
            </div>
          </div>
          <button 
            className="btn-primary" 
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }} 
            onClick={() => {
              console.log('Comparing with:', item);
              onCompare(item);
            }}
          >
            Compare Now
          </button>
        </div>
      ))}
      {!history?.length && (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <FiRepeat size={32} color="var(--border-glass)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No history found for this user.</p>
        </div>
      )}
    </div>
  </div>
);

const LockedTab = ({ category }) => (
  <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
      <FiLock size={32} color="var(--accent-gold)" />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Premium Feature</h3>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
      {category.charAt(0).toUpperCase() + category.slice(1)} audits and advanced analytics are available to SpeedGenius Pro and Enterprise users.
    </p>
    <button className="btn-primary">Upgrade to Unlock</button>
  </div>
);

const MetricCard = ({ icon, label, value, unit, desc }) => (
  <div className="glass glass-hover" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
        {icon}
      </div>
      <FiInfo size={16} color="var(--text-secondary)" />
    </div>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</p>
    <h4 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
      {value}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{unit}</span>
    </h4>
    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</p>
  </div>
);

const AuditItem = ({ success, warning, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-glass)' }}>
    {success ? <FiCheckCircle size={18} color="#10b981" /> : <FiAlertCircle size={18} color="#f59e0b" />}
    <span style={{ fontSize: '0.95rem' }}>{title}</span>
  </div>
);

export default Dashboard;
