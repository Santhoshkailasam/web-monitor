import dotenv from "dotenv";

dotenv.config();

/* =========================
   ✅ CONFIG
========================= */
const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "llama3.2";

/* =========================
   ✅ CORE OLLAMA FUNCTION
========================= */
const generateWithAI = async (prompt) => {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 1024,
          temperature: 0.3
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🤖 [AI RAW]: ${data.response?.substring(0, 100)}...`);
    return data.response || null;
  } catch (error) {
    console.error("❌ [AI ERROR]:", error.message);
    return null;
  }
};

/* =========================
   ✅ EXECUTIVE SUMMARY
========================= */
export const generateExecutiveSummary = async (data) => {
  const prompt = `
You are a senior technical consultant writing for an executive.
Context:
URL: ${data.url}
Device: ${data.device}
Scores: Perf ${data.performance}, SEO ${data.seo}, Acc ${data.accessibility}
Metrics: LCP ${data.metrics.lcp}s, CLS ${data.metrics.cls}, FCP ${data.metrics.fcp}s

Task: Write a human-readable 1-paragraph summary. 
Include:
1. How the site benchmarks (e.g. "better than X% of sites").
2. The single most critical issue.
3. The potential business impact (e.g. "improve conversion by ~2%").

Example tone: "Your site is performing better than 85% of e-commerce sites, but the LCP is lagging due to unoptimized hero images. Fixing this could improve conversion by ~2%."
Return ONLY the paragraph.
`;

  const text = await generateWithAI(prompt);
  if (text) console.log(`✅ [AI SUMMARY GENERATED]`);

  return text || simulateExecutiveSummary(data);
};

/* =========================
   ✅ CODE FIX GENERATOR
========================= */
export const generateCodeFix = async (
  auditTitle,
  auditDescription,
  url
) => {
  const prompt = `
You are a senior frontend performance engineer.
Context:
Website: ${url}
Issue: ${auditTitle}
Description: ${auditDescription}

Task: Provide a practical fix with a code snippet.
IMPORTANT: Return ONLY a valid JSON object. 
RULES:
1. Do NOT use backticks (\`) for strings. Use double quotes (").
2. Escape all newlines in the code as \\n.
3. Escape all double quotes inside the code snippet as \\".

Format:
{
  "explanation": "Short explanation.",
  "codeSnippet": "The escaped code string."
}
`;

  const text = await generateWithAI(prompt);

  if (!text) return simulateCodeFix(auditTitle);

  try {
    // ── STRATEGY 1: Try standard JSON parse first ──
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.explanation && parsed.codeSnippet) {
          console.log(`✅ [AI FIX PARSED]: ${auditTitle}`);
          return parsed;
        }
      } catch {}
    }

    // ── STRATEGY 2: Extract fields individually (handles unescaped code) ──
    console.warn("Standard parse failed, extracting fields individually...");

    let explanation = '';
    let codeSnippet = '';

    // Extract explanation
    const expMatch = text.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (expMatch) {
      explanation = expMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    } else {
      // Try unquoted extraction
      const expFallback = text.match(/"explanation"\s*:\s*"([^"]{10,})/);
      if (expFallback) explanation = expFallback[1];
    }

    // Extract codeSnippet — handle triple quotes, backticks, or regular quotes
    const codeMatch = text.match(/"codeSnippet"\s*:\s*(?:"""|`|")([\s\S]*?)(?:"""|`|")\s*\}?\s*$/);
    if (codeMatch) {
      codeSnippet = codeMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
    } else {
      // Last resort: grab everything after "codeSnippet":
      const codeFallback = text.match(/"codeSnippet"\s*:\s*"?([\s\S]{10,})/);
      if (codeFallback) {
        codeSnippet = codeFallback[1]
          .replace(/"\s*\}\s*$/, '')  // Remove trailing "}
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .trim();
      }
    }

    if (explanation || codeSnippet) {
      console.log(`✅ [AI FIX EXTRACTED]: ${auditTitle}`);
      return {
        explanation: explanation || `Optimization for: ${auditTitle}`,
        codeSnippet: codeSnippet || '// AI generated snippet — see explanation above'
      };
    }

    throw new Error("Could not extract any fields");

  } catch (err) {
    console.error(`⚠️ [AI FIX FAILED]: ${auditTitle}`, err.message);
    console.log(`📄 [AI FAILED TEXT]:`, text?.substring(0, 300));
    return simulateCodeFix(auditTitle);
  }
};

/* =========================
   ✅ PERFORMANCE COPILOT
========================= */
export const generateChatResponse = async (message, reportData, history = []) => {
  const context = `You are SpeedGenius AI, a web performance expert. Be concise (under 80 words). Use **bold** for key terms.
Site: ${reportData.url} | Perf: ${reportData.performance} | LCP: ${reportData.metrics?.lcp}s | CLS: ${reportData.metrics?.cls} | FCP: ${reportData.metrics?.fcp}s
${history.slice(-2).map(h => `${h.role}: ${h.content}`).join('\n')}
User: ${message}`;

  return await generateWithAI(context);
};

export const generateDependencyInsights = async (reportData) => {
  const prompt = `You are a performance engineer. JS: ${reportData.resources?.js || 0}KB, CSS: ${reportData.resources?.css || 0}KB, Images: ${reportData.resources?.images || 0}KB.
Suggest 2-3 bloated libraries and lighter alternatives. Return ONLY valid JSON:
{"insights":[{"library":"Example","alternative":"Better","savings":"50KB","reason":"Why"}]}`;

  const text = await generateWithAI(prompt);
  return parseAiJson(text, { insights: [
    { library: "jQuery", alternative: "Vanilla JS", savings: "30KB", reason: "Modern browsers support native DOM APIs" },
    { library: "Moment.js", alternative: "date-fns", savings: "60KB", reason: "Tree-shakeable and modular" }
  ]});
};

export const predictImpact = async (reportData, changes) => {
  const prompt = `You are a performance predictor. Current: Perf ${reportData.performance}, LCP ${reportData.metrics?.lcp}s, JS ${reportData.resources?.js || 0}KB.
Changes: ${changes}
Predict new scores. Return ONLY valid JSON:
{"predictedPerformance":75,"predictedLcp":"3.2s","explanation":"Brief reason"}`;

  const text = await generateWithAI(prompt);
  return parseAiJson(text, {
    predictedPerformance: Math.max(20, (reportData.performance || 80) - 15),
    predictedLcp: ((reportData.metrics?.lcp || 2) + 1.5).toFixed(1) + "s",
    explanation: "Adding heavy resources will increase load times and reduce the performance score."
  });
};

/* ── JSON Parser with repair ── */
function parseAiJson(text, fallback) {
  if (!text) return fallback;
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    let jsonStr = match[0]
      .replace(/"""/g, '"')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    // Fix unescaped newlines inside strings
    jsonStr = jsonStr.replace(/"([^"]*)"/g, (m, p1) =>
      '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '') + '"'
    );

    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('⚠️ AI JSON parse failed, using fallback:', e.message);
    return fallback;
  }
}

/* =========================
   🧪 FALLBACKS
========================= */

function simulateExecutiveSummary(data) {
  if (data.performance > 85) {
    return `Your website performs well with a score of ${data.performance}%. Core metrics are stable. Minor improvements in caching and resource delivery can push it closer to perfection.`;
  }

  return `Your website shows performance issues, mainly due to slow Largest Contentful Paint (${data.metrics.lcp}s). Optimize render-blocking resources to improve performance.`;
}

function simulateCodeFix(auditTitle) {
  if (auditTitle.toLowerCase().includes("image")) {
    return {
      explanation:
        "Use modern image formats and lazy loading to improve performance.",
      codeSnippet: `<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="description" loading="lazy">
</picture>`,
    };
  }

  return {
    explanation:
      "Lazy loading reduces initial load time and improves performance.",
    codeSnippet: `const Component = React.lazy(() => import('./Component'));

<Suspense fallback={<div>Loading...</div>}>
  <Component />
</Suspense>`,
  };
}