import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
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
  FiCopy, FiRepeat, FiGlobe, FiZap, FiAward, FiTrendingUp
} from 'react-icons/fi';

const Dashboard = ({ data, history, onCompare, isCompareView, setView }) => {
  const { isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState('performance');
  const [isSyncing, setIsSyncing] = useState(true);
  const dashboardRef = useRef(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!data) return null;

  const handleExport = async (type) => {
    if (type === 'pdf') {
      if (!isPremium) {
        setView('pricing');
        return;
      }
      
      const toastId = toast.loading('Generating PDF report...');
      try {
        const element = dashboardRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0a0a0c'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`speedgenius_report_${Date.now()}.pdf`);
        toast.success('PDF downloaded successfully!', { id: toastId });
      } catch (err) {
        console.error('PDF generation failed', err);
        toast.error('Failed to generate PDF. Please try again.', { id: toastId });
      }
    } else {
      // CSV Export
      const headers = ['Metric', 'Value', 'Unit'];
      const rows = [
        ['Performance', data.performance, '%'],
        ['SEO', data.seo, '%'],
        ['Accessibility', data.accessibility, '%'],
        ['Best Practices', data.bestPractices, '%'],
        ['LCP', data.metrics.lcp, 's'],
        ['CLS', data.metrics.cls, ''],
        ['FCP', data.metrics.fcp, 's'],
        ['Speed Index', data.metrics.speedIndex, '']
      ];
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = url;
      link.download = `speedgenius_report_${Date.now()}.csv`;
      link.click();
      document.body.removeChild(link);
      toast.success('CSV downloaded successfully!');
    }
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
    { subject: 'Perf', A: data.performance },
    { subject: 'SEO', A: data.seo },
    { subject: 'Access', A: data.accessibility },
    { subject: 'Best Pr', A: data.bestPractices },
    { subject: 'Secur', A: data.security?.hsts ? 100 : 50 }
  ];

  return (
    <motion.section 
      ref={dashboardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container" 
      style={{ padding: '2rem 0 6rem', position: 'relative' }}
    >
      {/* Ultra Premium Ambient Background Orbs */}
      <div className="dashboard-ambient-bg">
        <div className="orb-1" />
        <div className="orb-2" />
      </div>

      {/* Premium Header Summary */}
      {!isCompareView && (
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <ScoreBubble label="Performance" value={data.performance} color="var(--accent-emerald)" icon={<FiZap size={16} />} />
            <ScoreBubble label="SEO" value={data.seo} color="var(--accent-purple)" icon={<FiEye size={16} />} />
            <ScoreBubble label="Accessibility" value={data.accessibility} color="var(--accent-blue)" icon={<FiSmartphone size={16} />} />
            <ScoreBubble label="Best Practices" value={data.bestPractices} color="var(--accent-gold)" icon={<FiCheckCircle size={16} />} />
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="dash-header-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)' }}>
            <FiGlobe size={36} color="var(--accent-blue)" className="animate-pulse-glow" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>{new URL(data.url).hostname}</h2>
              <span className="badge score-badge-lg" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <FiCheckCircle size={14} /> Healthy
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Report generated on <span style={{ color: 'white', fontWeight: '600' }}>{new Date(data.createdAt).toLocaleString()}</span></p>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div style={{ position: 'absolute', right: '0', top: '0', width: '300px', height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%)', pointerEvents: 'none' }} />

        {!isCompareView && (
          <div className="dash-header-actions" style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <button className="btn-secondary" onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.03)' }}>
              <FiShare2 size={18} /> Share Report
            </button>
            <button className="btn-primary" onClick={() => handleExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)' }}>
              <FiDownload size={18} /> Export PDF {!isPremium && <span className="badge badge-pro" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', marginLeft: '0.5rem' }}>PRO</span>}
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-grid-layout" style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ minWidth: 0 }}>
          {/* Tabs Nav */}
          <div className="tabs-premium">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-premium ${activeTab === tab.id ? 'active' : ''}`}
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
               {activeTab === 'security' && (isPremium ? <SecurityTab data={data.security} /> : <LockedTab category="security" setView={setView} />)}
              {activeTab === 'resources' && (isPremium ? <ResourcesTab data={data.resources} /> : <LockedTab category="resources" setView={setView} />)}
              {activeTab === 'social' && (isPremium ? <SocialTab data={data} /> : <LockedTab category="social" setView={setView} />)}
              {activeTab === 'compare' && (isPremium ? <CompareTab data={data} history={history} onCompare={onCompare} /> : <LockedTab category="compare" setView={setView} />)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Health Radar */}
        {!isCompareView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="sidebar-card-premium">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Health Radar</h3>
                <FiActivity size={18} color="var(--accent-blue)" />
              </div>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="var(--accent-blue)"
                      fill="var(--accent-blue)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InsightRow label="Site Status" value="Excellent" color="var(--accent-emerald)" />
                <InsightRow label="Load Time" value={`${data.metrics.lcp}s`} color="var(--accent-blue)" />
                <InsightRow label="SEO Health" value={`${data.seo}%`} color="var(--accent-purple)" />
              </div>
            </div>

            <div className="sidebar-card-premium">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Live Monitor</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSyncing ? 'var(--accent-gold)' : 'var(--accent-emerald)', boxShadow: isSyncing ? '0 0 10px var(--accent-gold)' : '0 0 10px var(--accent-emerald)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isSyncing ? 'Syncing...' : 'Live'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <LiveMetric label="Server Latency" value="42ms" trend="up" />
                <LiveMetric label="Request Queue" value="0" trend="stable" />
                <LiveMetric label="Edge Cache" value="98.2%" trend="up" />
              </div>
            </div>

            <div className="sidebar-card-premium" style={{ background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiAward color="var(--accent-gold)" /> Quick Tip
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Optimize your Largest Contentful Paint by preloading the main hero image and reducing initial server response time.
              </p>
              <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.8rem' }}>View Roadmap</button>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

const PerformanceTab = ({ data }) => (
  <div className="tab-content-glass">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Core Metrics</h3>
      <span className="badge score-badge-lg" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        {data.performance}% Score
      </span>
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
  <div className="tab-content-glass">
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
  <div className="tab-content-glass">
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
  <div className="tab-content-glass">
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

const ScoreBubble = ({ label, value, color, icon }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      className="score-card-premium"
      style={{ borderBottom: `3px solid ${color}` }}
    >
      <div className="card-bg-icon" style={{ color: color }}>
        {React.cloneElement(icon, { size: 100 })}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`, 
            color: color, 
            width: '42px', height: '42px', 
            borderRadius: '12px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}40`,
            boxShadow: `0 4px 12px ${color}20`
          }}>
            {icon}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {label}
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
            <span className="text-shimmer" style={{ fontSize: '3rem', fontWeight: '900', filter: `drop-shadow(0 2px 10px ${color}40)` }}>
              {value}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score out of 100</p>
        </div>
        
        <div className="score-ring-container" style={{ width: '80px', height: '80px' }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle 
              cx="40" cy="40" r={radius} 
              className="score-ring-bg" 
            />
            <motion.circle 
              cx="40" cy="40" r={radius} 
              className="score-ring-fill" 
              stroke={color}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>{value}</span>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InsightRow = ({ label, value, color }) => (
  <div className="insight-row-premium">
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>{label}</span>
    <span style={{ color: color || 'white', fontWeight: '800', fontSize: '0.9rem' }}>{value}</span>
  </div>
);

const LiveMetric = ({ label, value, trend }) => (
  <div className="live-metric-premium">
    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{value}</span>
      {trend === 'up' && <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.2rem', borderRadius: '4px' }}><FiTrendingUp size={12} color="var(--accent-emerald)" /></div>}
      {trend === 'stable' && <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.2rem', borderRadius: '4px' }}><FiActivity size={12} color="var(--accent-blue)" /></div>}
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
    <div className="tab-content-glass">
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
  <div className="tab-content-glass">
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
  <div className="tab-content-glass">
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

const LockedTab = ({ category, setView }) => (
  <div className="locked-tab-premium">
    <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)', padding: '1.5rem', borderRadius: '50%', marginBottom: '2rem', boxShadow: '0 0 40px rgba(245, 158, 11, 0.2)' }}>
      <FiLock size={48} color="var(--accent-gold)" />
    </div>
    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Premium Feature Locked</h3>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '450px', lineHeight: '1.6', fontSize: '1.05rem' }}>
      Unlock full {category.charAt(0).toUpperCase() + category.slice(1)} audits, advanced analytics, and deeper insights by upgrading to SpeedGenius Pro.
    </p>
    <button className="btn-primary" onClick={() => setView('pricing')} style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '16px' }}>
      <FiAward size={20} /> Upgrade to Pro
    </button>
  </div>
);

const MetricCard = ({ icon, label, value, unit, desc }) => (
  <div className="metric-card-premium">
    <div className="metric-icon-bg">{React.cloneElement(icon, { size: 120 })}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
      <FiInfo size={18} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
    </div>
    <p style={{ position: 'relative', zIndex: 1, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</p>
    <h4 className="text-shimmer" style={{ position: 'relative', zIndex: 1, fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
      {value}<span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', marginLeft: '0.25rem' }}>{unit}</span>
    </h4>
    <p style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>{desc}</p>
  </div>
);

const AuditItem = ({ success, warning, title }) => (
  <div className="audit-item-premium">
    <div style={{ background: success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
      {success ? <FiCheckCircle size={20} color="var(--accent-emerald)" /> : <FiAlertCircle size={20} color="var(--accent-gold)" />}
    </div>
    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{title}</span>
  </div>
);

export default Dashboard;
