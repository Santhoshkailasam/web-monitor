import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiLoader, FiPlay, FiInfo, FiRefreshCw } from 'react-icons/fi';

const PredictiveModel = ({ reportData }) => {
  const [changes, setChanges] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!changes.trim() || loading) return;

    setLoading(true);
    setError(false);
    try {
      const response = await axios.post('http://localhost:5000/api/predict', {
        reportData,
        changes
      });
      
      const data = response.data;
      
      // Handle if the response is a raw string instead of parsed JSON
      if (typeof data === 'string') {
        const match = data.match(/\{[\s\S]*\}/);
        if (match) {
          setPrediction(JSON.parse(match[0]));
        } else {
          throw new Error('Invalid format');
        }
      } else {
        setPrediction(data);
      }
    } catch (err) {
      console.error('Prediction failed', err);
      setError(true);
      setPrediction({
        predictedPerformance: Math.max(20, (reportData.performance || 80) - 15),
        predictedLcp: ((reportData.metrics?.lcp || 2) + 1.5).toFixed(1) + "s",
        explanation: "AI couldn't generate a precise prediction. Based on general analysis, adding heavy resources typically reduces scores by 10-20 points."
      });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-gold)';
    return 'var(--accent-rose)';
  };

  return (
    <section className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <FiTrendingUp size={24} color="var(--accent-blue)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Predictive Performance Modeling</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Simulate changes to see their impact on Web Vitals.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: prediction ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        <div>
          <form onSubmit={handlePredict}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Describe planned changes (e.g., "Add 3 hero images and GTM script")
            </label>
            <textarea 
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Example: I want to add a 400KB analytics script and a video background to the hero section."
              style={{ width: '100%', minHeight: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '0.95rem', marginBottom: '1.5rem', resize: 'vertical' }}
            />
            <button 
              type="submit" 
              disabled={loading || !changes.trim()} 
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem' }}
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiPlay />}
              {loading ? 'Analyzing Impact...' : 'Simulate Impact'}
            </button>
          </form>
        </div>

        {prediction && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${error ? 'rgba(244,63,94,0.3)' : 'var(--border-glass)'}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>AI Prediction</span>
              <button 
                onClick={handlePredict} 
                disabled={loading}
                title="Re-run prediction"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
              >
                {loading ? <FiLoader className="animate-spin" size={12} /> : <FiRefreshCw size={12} />}
                Refresh
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Est. Performance</p>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: scoreColor(prediction.predictedPerformance) }}>
                  {prediction.predictedPerformance || '—'}
                </p>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Est. LCP</p>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-rose)' }}>
                  {prediction.predictedLcp || '—'}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(59,130,246,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.1)' }}>
              <FiInfo size={16} color="var(--accent-blue)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                {prediction.explanation || 'No explanation available.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PredictiveModel;
