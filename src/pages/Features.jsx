import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiZap, FiSmartphone, FiShield, FiClock, 
  FiBarChart2, FiEye, FiFileText, FiSend,
  FiActivity, FiLock, FiTrendingUp, FiPieChart,
  FiSettings, FiUsers, FiGlobe, FiCpu,
  FiCloud, FiKey, FiCompass, FiMonitor, FiRepeat, FiArrowRight,
  FiChevronDown, FiChevronUp, FiX, FiInfo, FiExternalLink,
  FiSearch, FiRefreshCw as FiLoader, FiCheckCircle, FiAward
} from 'react-icons/fi';

import turboAudit from '../assets/turbo-audit.png';
import aiFixer from '../assets/ai-fixer.png';
import pdfReports from '../assets/pdf-reports.png';
import mobileView from '../assets/mobile-view.png';
import step1 from '../assets/step-1.png';
import step2 from '../assets/step-2.png';
import step3 from '../assets/step-3.png';

const Features = ({ onTry }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const featureList = [
    { 
      title: 'Turbo Audit Engine', 
      desc: 'The speedometer for your website. Millisecond-accurate metrics.',
      what: 'A high-speed scanner that checks your website speed just like Google does.',
      why: 'Slow sites lose visitors. We help you stay fast so your customers stay happy.',
      how: 'Type your URL and watch as we analyze every single pixel for speed bottlenecks.',
      icon: <FiZap />,
      tier: 'Free',
      image: turboAudit,
      steps: [
        { title: 'Enter URL', desc: 'Paste your website address into the search bar.', img: step1, icon: <FiSearch /> },
        { title: 'AI Analysis', desc: 'Our engine runs 20+ checks in under 30 seconds.', img: step2, icon: <FiLoader /> },
        { title: 'View Report', desc: 'Get a full breakdown of your speed scores.', img: step3, icon: <FiCheckCircle /> }
      ]
    },
    { 
      title: 'Pocket-View Simulator', 
      desc: 'Test on any phone, instantly. Simulate 3G and 4G networks.',
      what: 'A virtual smartphone that shows you exactly how your site looks on mobile.',
      why: '80% of users are on phones. If your site is slow on mobile, you\'re losing money.',
      how: 'Select a device and network speed to see your site through your customer\'s eyes.',
      icon: <FiSmartphone />,
      tier: 'Pro',
      image: mobileView,
      steps: [
        { title: 'Choose Device', desc: 'Select from a range of high-end and low-end phones.', img: step1, icon: <FiSmartphone /> },
        { title: 'Set Network', desc: 'Simulate slow 3G or fast 4G connection speeds.', img: step2, icon: <FiGlobe /> },
        { title: 'Audit Mobile', desc: 'See real-world mobile performance metrics.', img: step3, icon: <FiMonitor /> }
      ]
    },
    { 
      title: 'Smart AI Code Doctor', 
      desc: 'Real-time performance engine that generates custom code fixes for your site.',
      what: 'An intelligent AI that analyzes your specific site code and provides tailored optimization snippets.',
      why: 'Knowing there is a problem is good, but having the solution is better.',
      how: 'Click the "Fix" button and the AI will generate a custom code snippet for your site.',
      icon: <FiCpu />,
      tier: 'Free',
      image: aiFixer,
      steps: [
        { title: 'Find Issues', desc: 'Run an audit to identify performance bottlenecks.', img: step1, icon: <FiSearch /> },
        { title: 'Consult AI', desc: 'Our AI analyzes the specific code causing the lag.', img: step2, icon: <FiCpu /> },
        { title: 'Apply Fix', desc: 'Copy and paste the generated code to your site.', img: step3, icon: <FiZap /> }
      ]
    },
    { 
      title: 'Executive PDF Reports', 
      desc: 'Wow your clients with professional, presentation-ready reports.',
      what: 'Beautifully designed documents that summarize your site\'s performance.',
      why: 'Great for showing your boss or clients exactly how much you\'ve improved the site.',
      how: 'Hit the "Export" button and get a branded PDF delivered to your folder instantly.',
      icon: <FiFileText />,
      tier: 'Pro',
      image: pdfReports,
      steps: [
        { title: 'Select Data', desc: 'Choose which metrics to include in your report.', img: step1, icon: <FiPieChart /> },
        { title: 'Customize', desc: 'Add your company logo and brand colors.', img: step2, icon: <FiSettings /> },
        { title: 'Generate', desc: 'Download a high-quality PDF in one click.', img: step3, icon: <FiFileText /> }
      ]
    },
    { 
      title: 'Ironclad Security Scan', 
      desc: 'Because a fast site must also be a safe site. Deep header audits.',
      what: 'A complete health check for your website\'s security settings and SSL.',
      why: 'Security builds trust. We ensure your site is protected against common threats.',
      how: 'We run security checks automatically alongside every performance audit.',
      icon: <FiShield />,
      tier: 'Pro',
      steps: [
        { title: 'SSL Check', desc: 'Verify your certificate and encryption levels.', img: step1, icon: <FiLock /> },
        { title: 'Header Audit', desc: 'Check CSP, HSTS, and X-Frame protections.', img: step2, icon: <FiShield /> },
        { title: 'Safety Score', desc: 'Get an overall grade for your site\'s security.', img: step3, icon: <FiAward /> }
      ]
    },
    { 
      title: 'Historical Trends', 
      desc: 'Watch your site get faster over time with 30-day interactive charts.',
      what: 'A visual history of every test you\'ve ever run on your website.',
      why: 'One test isn\'t enough. You need to see that your site is consistently fast.',
      how: 'Check the "History" tab to see your performance scores plotted on a beautiful line graph.',
      icon: <FiTrendingUp />,
      tier: 'Pro',
      steps: [
        { title: 'Run Tests', desc: 'Perform regular audits as you update your site.', img: step1, icon: <FiActivity /> },
        { title: 'Compare', desc: 'See how each change affects your speed score.', img: step2, icon: <FiRepeat /> },
        { title: 'Track Wins', desc: 'Visualize your long-term performance growth.', img: step3, icon: <FiTrendingUp /> }
      ]
    },
    {
      title: 'Security Headers Audit',
      desc: 'HSTS, CSP, and X-Frame analysis with A–F grading.',
      what: 'A deep dive into your server response headers to ensure best-practice security.',
      why: 'Prevent clickjacking and XSS attacks by properly configuring your headers.',
      how: 'Our security engine automatically audits your headers during every scan.',
      icon: <FiShield />,
      tier: 'Pro'
    },
    {
      title: 'Social Meta Preview',
      desc: 'See how your site looks on Google, Facebook, and Twitter cards.',
      what: 'A live preview of your OpenGraph and Twitter meta tags.',
      why: 'Better social previews lead to higher click-through rates from social platforms.',
      how: 'Navigate to the "Social" tab in your report to see live previews.',
      icon: <FiEye />,
      tier: 'Pro'
    },
    {
      title: 'CI/CD Integration',
      desc: 'Fail pull requests automatically if performance regresses.',
      what: 'A GitHub Action and CLI tool that integrates with your build pipeline.',
      why: 'Stop performance regressions before they ever reach production.',
      how: 'Connect your GitHub repository in settings and add our action to your workflow.',
      icon: <FiActivity />,
      tier: 'Enterprise'
    },
    {
      title: 'Team Workspaces',
      desc: 'Collaborate with your team with role-based access control.',
      what: 'A shared dashboard for your entire organization or agency.',
      why: 'Manage multiple projects and team members in one centralized place.',
      how: 'Create a workspace and invite team members via email.',
      icon: <FiUsers />,
      tier: 'Enterprise'
    }
  ];

  return (
    <div className="container" style={{ padding: '2rem 0 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Everything You Need to Scale</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Over 20+ premium features designed for modern web performance engineers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {featureList.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="glass glass-hover"
            style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '15px', color: 'var(--accent-blue)', fontSize: '1.5rem' }}>
                {feature.icon}
              </div>
              <span className={`badge ${feature.tier === 'Free' ? '' : 'badge-pro'}`}>
                {feature.tier}
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>{feature.desc}</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button 
                onClick={() => setSelectedFeature(feature)}
                className="btn-google" 
                style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)' }}
              >
                <FiInfo size={16} /> More Details
              </button>
              
              <button 
                onClick={() => onTry(feature)}
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.75rem' }}
              >
                Try Now <FiArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedFeature && (
          <FeatureModal 
            feature={selectedFeature} 
            onClose={() => setSelectedFeature(null)} 
            onTry={() => { onTry(selectedFeature); setSelectedFeature(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureModal = ({ feature, onClose, onTry }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 20, opacity: 0 }}
      className="glass-premium"
      style={{ maxWidth: '1000px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '32px', position: 'relative' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
      >
        <FiX size={24} />
      </button>

      <div style={{ padding: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '4rem' }} className="mobile-only-stack">
          <div>
            {feature.image ? (
              <img src={feature.image} alt={feature.title} style={{ width: '100%', borderRadius: '20px', border: '1px solid var(--border-glass)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                {feature.icon}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className={`badge ${feature.tier === 'Free' ? '' : 'badge-pro'}`}>{feature.tier}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Feature Overview</span>
            </div>
            
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.1' }}>{feature.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>{feature.desc}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ModalDetail title="What is it?" content={feature.what} />
              <ModalDetail title="Why do I need it?" content={feature.why} />
              <ModalDetail title="How to use it?" content={feature.how} />
            </div>
          </div>
        </div>

        {feature.steps && (
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2.5rem', textAlign: 'center' }}>Step-by-Step Help</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {feature.steps.map((step, sIdx) => (
                <div key={sIdx} className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                  <img src={step.img} alt={step.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '8px' }}>
                      {step.icon}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{step.title}</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <button 
            onClick={onTry}
            className="btn-primary" 
            style={{ minWidth: '300px', justifyContent: 'center', padding: '1.25rem', fontSize: '1.1rem' }}
          >
            Get Started Now <FiArrowRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const ModalDetail = ({ title, content }) => (
  <div>
    <h5 style={{ color: 'white', fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: '4px', height: '16px', background: 'var(--accent-blue)', borderRadius: '2px' }} />
      {title}
    </h5>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{content}</p>
  </div>
);

export default Features;
