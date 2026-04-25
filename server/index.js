import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runLighthouse } from './utils/lighthouseRunner.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// Routes
app.post('/api/analyze', async (req, res) => {
  const { url, device } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Analyzing: ${url} on ${device || 'desktop'}`);
    const result = await runLighthouse(url, device || 'desktop');
    
    // Save to DB
    const report = new Report({ 
      ...result,
      createdAt: new Date()
    });
    await report.save();

    res.json(result);
  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ error: 'Failed to analyze website', details: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  const { userId } = req.query;
  try {
    const filter = userId ? { userId } : {};
    const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
