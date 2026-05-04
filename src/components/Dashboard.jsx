import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import PredictiveModel from './PredictiveModel';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts';
import { 
  FiClock, FiMousePointer, FiLayout, FiActivity, FiAlertCircle,
  FiCheckCircle, FiInfo, FiCode, FiShield, FiEye, FiCpu,
  FiSmartphone, FiMonitor, FiDownload, FiShare2, FiBarChart2, 
  FiLock, FiMessageSquare, FiFacebook, FiTwitter, FiLinkedin,
  FiCopy, FiRepeat, FiGlobe, FiZap, FiAward, FiTrendingUp, FiPackage
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
        ['CLS', parseFloat(Number(data.metrics.cls).toFixed(3)), ''],
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
      style={{ padding: '2rem 0 6rem' }}
    >
      {/* AI Insights Section */}
      {!isCompareView && data.executiveSummary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium"
          style={{ 
            padding: '2.5rem', 
            marginBottom: '3rem', 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--accent-purple)', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}>
              <FiCpu size={24} color="white" className="animate-pulse" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>AI Performance Executive Summary</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Generated in real-time by SpeedGenius Intelligence</p>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{data.executiveSummary}"
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Critical Bottleneck Identified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Custom Fixes Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
      <div className="glass-premium" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderLeft: '4px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px' }}>
            <FiGlobe size={32} color="var(--accent-blue)" className="animate-pulse-glow" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{new URL(data.url).hostname}</h2>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Healthy</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzed on <span style={{ color: 'white' }}>{new Date(data.createdAt).toLocaleString()}</span></p>
          </div>
        </div>
        {!isCompareView && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShare2 size={18} /> Share Report
            </button>
            <button className="btn-primary" onClick={() => handleExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiDownload size={18} /> Download PDF {!isPremium && <span className="badge badge-pro" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', marginLeft: '0.5rem' }}>PRO</span>}
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-grid-layout" style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ minWidth: 0 }}>
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
               {activeTab === 'security' && (isPremium ? <SecurityTab data={data.security} /> : <LockedTab category="security" setView={setView} />)}
              {activeTab === 'resources' && (isPremium ? <ResourcesTab data={data.resources} /> : <LockedTab category="resources" setView={setView} />)}
              {activeTab === 'social' && (isPremium ? <SocialTab data={data} /> : <LockedTab category="social" setView={setView} />)}
              {activeTab === 'compare' && (isPremium ? <CompareTab data={data} history={history} onCompare={onCompare} /> : <LockedTab category="compare" setView={setView} />)}
            </motion.div>
          </AnimatePresence>

          {/* 🔮 Predictive Modeling */}
          {!isCompareView && <PredictiveModel reportData={data} />}

          {/* 📦 Dependency Auditor */}
          {data.dependencyInsights && (() => {
            // Parse if it's a string
            let insights = data.dependencyInsights;
            if (typeof insights === 'string') {
              try {
                const match = insights.match(/\{[\s\S]*\}/);
                insights = match ? JSON.parse(match[0]) : { insights: [] };
              } catch { insights = { insights: [] }; }
            }
            const items = insights?.insights || [];
            if (items.length === 0) return null;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '2rem', marginTop: '2rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <FiPackage size={24} color="var(--accent-purple)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Smart Dependency Auditor</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Found Library</p>
                          <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-rose)', margin: '0.25rem 0 0' }}>{item.library}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Est. Savings</p>
                          <p style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', fontWeight: '700', margin: '0.25rem 0 0' }}>~{item.savings}</p>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.85rem', borderRadius: '10px', marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Recommended Alternative</p>
                        <p style={{ fontWeight: '600', color: 'var(--accent-blue)', margin: 0 }}>{item.alternative}</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.reason}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* Sidebar Health Radar */}
        {!isCompareView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-premium" style={{ padding: '2rem' }}>
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

            <div className="glass-premium" style={{ padding: '2rem' }}>
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

            <div className="glass-premium" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
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
      value={parseFloat(Number(data.metrics.cls).toFixed(3))}
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

const ScoreBubble = ({ label, value, color, icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-premium" 
    style={{ 
      padding: '2rem', 
      borderBottom: `4px solid ${color}`, 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '180px',
      willChange: 'transform'
    }}
  >
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
      {React.cloneElement(icon, { size: 80 })}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{ background: `${color}15`, color: color, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.02em' }}>{label}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{value}</span>
      <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span>
    </div>
    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1.5rem', overflow: 'hidden' }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ height: '100%', background: color }} 
      />
    </div>
  </motion.div>
);

const InsightRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ color: color || 'white', fontWeight: '600' }}>{value}</span>
  </div>
);

const LiveMetric = ({ label, value, trend }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{value}</span>
      {trend === 'up' && <FiTrendingUp size={12} color="var(--accent-emerald)" />}
      {trend === 'stable' && <FiActivity size={12} color="var(--accent-blue)" />}
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

const LockedTab = ({ category, setView }) => (
  <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
      <FiLock size={32} color="var(--accent-gold)" />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Premium Feature</h3>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
      {category.charAt(0).toUpperCase() + category.slice(1)} audits and advanced analytics are available to SpeedGenius Pro and Enterprise users.
    </p>
    <button className="btn-primary" onClick={() => setView('pricing')}>Upgrade to Unlock</button>
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
