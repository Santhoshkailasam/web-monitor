import lighthouse from 'lighthouse';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { generateExecutiveSummary, generateCodeFix, generateDependencyInsights } from './aiAssistant.js';

export const runLighthouse = async (url, device = 'desktop') => {
  console.log(`🚀 Starting Lighthouse (${device}) for: ${url}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      headless: true,
    });
    process.env.CHROME_PATH = puppeteer.executablePath();
    const port = parseInt(new URL(browser.wsEndpoint()).port);
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: port,
      formFactor: device === 'mobile' ? 'mobile' : 'desktop',
      screenEmulation: device === 'mobile' ? {
        mobile: true,
        width: 360,
        height: 640,
        deviceScaleFactor: 2,
        disabled: false,
      } : {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: device === 'mobile' ? {
        rttMs: 150,
        throughputKbps: 1638.4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
        cpuSlowdownMultiplier: 4,
      } : {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
    };

    const runnerResult = await lighthouse(url, options);
    console.log(`✅ Lighthouse completed for: ${url}`);

    const report = runnerResult.lhr;

    const baseData = {
      url,
      device,
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),

      metrics: {
        lcp: parseFloat((report.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2)) || 0,
        cls: report.audits['cumulative-layout-shift'].numericValue || 0,
        fcp: parseFloat((report.audits['first-contentful-paint'].numericValue / 1000).toFixed(2)) || 0,
        speedIndex: report.audits['speed-index']?.displayValue || 'N/A',
        tbt: report.audits['total-blocking-time']?.displayValue || '0 ms',
      },

      resources: {
        js: Math.round((report.audits['resource-summary']?.details?.items?.find(i => i.resourceType === 'script')?.size || 0) / 1024),
        css: Math.round((report.audits['resource-summary']?.details?.items?.find(i => i.resourceType === 'stylesheet')?.size || 0) / 1024),
        images: Math.round((report.audits['resource-summary']?.details?.items?.find(i => i.resourceType === 'image')?.size || 0) / 1024),
        total: Math.round((report.audits['resource-summary']?.details?.items?.find(i => i.resourceType === 'total')?.size || 0) / 1024),
      },
      security: await checkSecurityHeaders(url)
    };

    // Initial suggestions are now static; AI fixes will be on-demand
    const suggestions = getSuggestionsFromAudits(report.audits);
    const executiveSummary = await generateExecutiveSummary(baseData);
    const dependencyInsights = await generateDependencyInsights(baseData);

    return {
      ...baseData,
      suggestions,
      executiveSummary,
      dependencyInsights
    };

  } catch (error) {
    console.error('❌ Lighthouse error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log(`🛑 Browser closed for: ${url}`);
    }
  }
};

const checkSecurityHeaders = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const headers = response.headers;
    return {
      hsts: !!headers['strict-transport-security'],
      csp: !!headers['content-security-policy'],
      xFrame: !!headers['x-frame-options'],
      xContentType: !!headers['x-content-type-options'],
      referrer: !!headers['referrer-policy'],
    };
  } catch (e) {
    return { hsts: false, csp: false, xFrame: false, xContentType: false, referrer: false };
  }
};

const getSuggestionsFromAudits = (audits) => {
  const auditKeys = [
    'modern-image-formats',
    'efficient-animated-content',
    'unused-javascript',
    'unused-css-rules',
    'render-blocking-resources',
    'uses-optimized-images'
  ];

  return auditKeys
    .map(key => audits[key])
    .filter(audit => audit && audit.score !== null && audit.score < 0.9)
    .map(audit => ({
      impact: audit.score < 0.5 ? 'High' : 'Medium',
      title: audit.title,
      description: audit.description,
      isAiGenerated: false
    }));
};

export const getAiFixForAudit = async (title, description, url) => {
  return await generateCodeFix(title, description, url);
};