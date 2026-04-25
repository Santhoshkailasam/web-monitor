import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runLighthouse } from './utils/lighthouseRunner.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   ✅ CORS (FIXED PROPERLY)
========================= */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://webanalyze.netlify.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

/* =========================
   ✅ MONGODB CONNECTION
========================= */
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/* =========================
   ✅ MODELS
========================= */

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

// Job Model (🔥 NEW - FIXES 404 ISSUE)
const jobSchema = new mongoose.Schema({
  jobId: String,
  status: String,
  data: Object,
  error: String,
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

/* =========================
   ✅ ROUTES
========================= */

// 🚀 START ANALYSIS
app.post('/api/analyze', async (req, res) => {
  try {
    const { url, device, userId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const jobId = Date.now().toString();

    // Save job in DB (important)
    await Job.create({
      jobId,
      status: 'loading',
      data: null,
      error: null
    });

    console.log(`🚀 Job Created: ${jobId}`);

    // Background processing
    (async () => {
      try {
        console.log(`🔍 Running Lighthouse: ${url}`);

        const result = await runLighthouse(url, device || 'desktop');

        const reportData = {
          ...result,
          url,
          userId,
          device,
          createdAt: new Date()
        };

        const savedReport = await new Report(reportData).save();

        await Job.findOneAndUpdate(
          { jobId },
          { status: 'complete', data: savedReport }
        );

        console.log(`✅ Job Completed: ${jobId}`);
      } catch (error) {
        console.error(`❌ Job Failed: ${jobId}`, error.message);

        await Job.findOneAndUpdate(
          { jobId },
          { status: 'error', error: error.message }
        );
      }
    })();

    res.json({ jobId });

  } catch (err) {
    console.error('❌ Analyze route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   📡 JOB STATUS
========================= */
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ jobId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);

  } catch (err) {
    console.error('❌ Status route error:', err);
    res.status(500).json({ error: 'Server crashed' });
  }
});

/* =========================
   📊 HISTORY
========================= */
app.get('/api/history', async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = userId ? { userId } : {};

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reports);

  } catch (error) {
    console.error('❌ History fetch failed:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      details: error.message
    });
  }
});

/* =========================
   🧪 HEALTH CHECK (IMPORTANT)
========================= */
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

/* =========================
   🚀 SERVER START
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});