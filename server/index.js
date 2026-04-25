import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runLighthouse } from './utils/lighthouseRunner.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://webanalyze.netlify.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection (Optional but recommended)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webperf';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Report Model
const reportSchema = new mongoose.Schema({
  url: String,
  userId: String,
  device: String,
  performance: Number,
  accessibility: Number,
  bestPractices: Number,
  seo: Number,
  metrics: Object,
  resources: Object,
  suggestions: Array,
  security: Object,
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// In-memory job store
const jobs = new Map();

// Routes
app.post('/api/analyze', async (req, res) => {
  const { url, device, userId } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const jobId = Date.now().toString();
  jobs.set(jobId, { status: 'loading', data: null, error: null });

  // Start analysis in background
  (async () => {
    try {
      console.log(`🚀 Starting Background Analysis [${jobId}]: ${url}`);
      const result = await runLighthouse(url, device || 'desktop');
      
      const reportData = { ...result, userId, createdAt: new Date() };
      const report = new Report(reportData);
      const savedReport = await report.save();

      jobs.set(jobId, { status: 'complete', data: savedReport, error: null });
      console.log(`✅ Background Analysis Complete [${jobId}]`);
    } catch (error) {
      console.error(`❌ Background Analysis Failed [${jobId}]:`, error);
      jobs.set(jobId, { status: 'error', data: null, error: error.message });
    }
  })();

  // Return JOB ID immediately
  res.json({ jobId });
});

app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);

  // Clean up if complete or error
  if (job.status === 'complete' || job.status === 'error') {
    // Keep it for a bit so frontend can read it, then delete
    setTimeout(() => jobs.delete(jobId), 60000); 
  }
});

app.get('/api/history', async (req, res) => {
  const { userId } = req.query;
  try {
    const filter = userId ? { userId } : {};
    const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json(reports);
  } catch (error) {
    console.error('History fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
