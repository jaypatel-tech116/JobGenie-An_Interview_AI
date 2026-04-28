const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const crypto = require("crypto");
const NodeCache = require("node-cache");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
const cache = new NodeCache({ stdTTL: 3600 });

// ─── RATE LIMIT ────────────────────────────────────────────────────────────────
let lastCall = 0;
const MIN_DELAY = 1500;

async function rateLimit() {
  const now = Date.now();
  const wait = MIN_DELAY - (now - lastCall);
  if (wait > 0) await new Promise((res) => setTimeout(res, wait));
  lastCall = Date.now();
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getCacheKey(data) {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

function safeParse(text) {
  if (!text) return null;
  const clean = text
    .replace(/```json|```/g, "")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function isValid(data) {
  return (
    data &&
    typeof data.title === "string" &&
    data.title.trim().length > 0 &&
    typeof data.matchScore === "number" &&
    data.matchScore >= 0 &&
    Array.isArray(data.technicalQuestions) &&
    data.technicalQuestions.length >= 5 &&
    Array.isArray(data.behavioralQuestions) &&
    data.behavioralQuestions.length >= 5 &&
    Array.isArray(data.skillGaps) &&
    data.skillGaps.length >= 5 &&
    Array.isArray(data.preparationPlan) &&
    data.preparationPlan.length >= 7
  );
}

function extractHTML(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(clean);
    if (parsed?.html) return parsed.html;
  } catch {
    /* not JSON — treat as raw HTML */
  }
  return clean;
}

// ─── CSS SHELL ─────────────────────────────────────────────────────────────────
// Design: "Refined Editorial" — Playfair Display name, Source Serif body copy,
// deep navy accent (#1B3A5C), warm off-white paper (#FAFAF8).
// Crisp left rule on experience entries, generous but tight whitespace.
// ATS-safe: semantic tags only, zero tables for layout.
function ensureHTML(html) {
  if (!html) return "";
  html = html.replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
  if (html.includes("<html")) return html;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    /* ═══════════════════════════════════════════════════════════
       REFINED EDITORIAL RESUME  —  A4 · Google Fonts
       Palette: #1B3A5C navy · #C8A96E gold · #FAFAF8 paper · #2D2D2D ink
       ═══════════════════════════════════════════════════════════ */

    :root {
      --navy:   #1B3A5C;
      --gold:   #C8A96E;
      --ink:    #2D2D2D;
      --muted:  #5C6470;
      --rule:   #D6D0C8;
      --paper:  #FAFAF8;
      --accent-light: #EEF2F7;
    }

    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 9.5pt;
      font-weight: 300;
      line-height: 1.55;
      color: var(--ink);
      background: var(--paper);
      width: 178mm;
      margin: 0 auto;
    }

    /* ── HEADER ─────────────────────────────────────────── */
    .resume-header {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-bottom: 10px;
      margin-bottom: 12px;
      border-bottom: 2px solid var(--navy);
      position: relative;
    }

    /* Thin gold line above the main rule for a luxury double-border effect */
    .resume-header::before {
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      background: var(--gold);
      margin-bottom: 9px;
    }

    .resume-name {
      font-family: 'Playfair Display', 'Times New Roman', serif;
      font-size: 26pt;
      font-weight: 700;
      color: var(--navy);
      letter-spacing: -0.3px;
      line-height: 1.1;
      margin-bottom: 2px;
    }

    .resume-tagline {
      font-family: 'DM Sans', sans-serif;
      font-size: 9.3pt;
      font-weight: 500;
      color: var(--gold);
      letter-spacing: 2.2px;
      text-transform: uppercase;
      margin-bottom: 7px;
    }

    .resume-contact-line {
      font-family: 'DM Sans', sans-serif;
      font-size: 8.3pt;
      font-weight: 400;
      color: var(--muted);
      letter-spacing: 0.1px;
      line-height: 1.6;
    }

    .resume-contact-line a {
      color: var(--navy);
      text-decoration: none;
      border-bottom: 0.6px solid var(--rule);
    }

    .contact-sep {
      margin: 0 6px;
      color: var(--gold);
      font-size: 8pt;
    }

    /* ── SECTION HEADINGS ──────────────────────────────── */
    h2 {
      font-family: 'DM Sans', sans-serif;
      font-size: 7.6pt;
      font-weight: 600;
      letter-spacing: 2.8px;
      text-transform: uppercase;
      color: var(--navy);
      margin-top: 14px;
      margin-bottom: 7px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--rule);
      position: relative;
    }

    /* Short gold underline accent on section headings */
    h2::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 28px;
      height: 2px;
      background: var(--gold);
    }

    /* ── PROFESSIONAL SUMMARY ──────────────────────────── */
    .summary-text {
      font-size: 9.5pt;
      font-weight: 300;
      line-height: 1.65;
      color: var(--ink);
      font-style: italic;
      border-left: 2px solid var(--gold);
      padding-left: 10px;
      margin-top: 1px;
    }

    /* ── SKILLS GRID ───────────────────────────────────── */
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5px 24px;
      margin-top: 2px;
    }

    .skill-row {
      font-family: 'DM Sans', sans-serif;
      font-size: 8.6pt;
      line-height: 1.55;
      color: var(--ink);
    }

    .skill-label {
      font-weight: 600;
      color: var(--navy);
    }

    /* ── EXPERIENCE / PROJECT ENTRIES ──────────────────── */
    /* Left rule gives a clean editorial structure */
    .entry {
      margin-bottom: 10px;
      padding-left: 10px;
      border-left: 1.5px solid var(--rule);
      position: relative;
    }

    /* Navy dot on the left rule */
    .entry::before {
      content: '';
      position: absolute;
      left: -4px;
      top: 4px;
      width: 7px;
      height: 7px;
      background: var(--navy);
      border-radius: 50%;
    }

    .entry:last-child { margin-bottom: 2px; }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 0px;
    }

    .entry-company {
      font-family: 'DM Sans', sans-serif;
      font-size: 9.8pt;
      font-weight: 600;
      color: var(--navy);
      flex: 1;
    }

    .entry-date {
      font-family: 'DM Sans', sans-serif;
      font-size: 7.8pt;
      font-weight: 500;
      color: var(--muted);
      white-space: nowrap;
      flex-shrink: 0;
      background: var(--accent-light);
      padding: 1px 5px;
      border-radius: 2px;
    }

    .entry-role {
      font-size: 8.8pt;
      font-style: italic;
      font-weight: 400;
      color: var(--gold);
      margin-bottom: 4px;
    }

    .entry-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 9.8pt;
      font-weight: 600;
      color: var(--navy);
      margin-bottom: 2px;
    }

    .entry-tech {
      font-family: 'DM Sans', sans-serif;
      font-size: 7.8pt;
      color: var(--muted);
      font-style: italic;
      margin-bottom: 3px;
    }

    /* ── BULLET LISTS ───────────────────────────────────── */
    ul {
      margin: 3px 0 2px 0;
      padding-left: 13px;
      list-style-type: none;
    }

    li {
      font-size: 9pt;
      font-weight: 300;
      margin-bottom: 3px;
      line-height: 1.5;
      color: var(--ink);
      position: relative;
    }

    /* Custom bullet: small gold square */
    li::before {
      content: '▪';
      position: absolute;
      left: -11px;
      top: 0;
      color: var(--gold);
      font-size: 7pt;
      line-height: 1.7;
    }

    /* ── EDUCATION ──────────────────────────────────────── */
    .edu-entry {
      margin-bottom: 7px;
      padding-left: 10px;
      border-left: 1.5px solid var(--rule);
      position: relative;
    }

    .edu-entry::before {
      content: '';
      position: absolute;
      left: -4px;
      top: 4px;
      width: 7px;
      height: 7px;
      background: var(--gold);
      border-radius: 50%;
    }

    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 6px;
    }

    .edu-degree {
      font-family: 'DM Sans', sans-serif;
      font-size: 9.8pt;
      font-weight: 600;
      color: var(--navy);
      flex: 1;
    }

    .edu-year {
      font-family: 'DM Sans', sans-serif;
      font-size: 7.8pt;
      color: var(--muted);
      white-space: nowrap;
      flex-shrink: 0;
      background: var(--accent-light);
      padding: 1px 5px;
      border-radius: 2px;
    }

    .edu-institution {
      font-size: 9pt;
      color: var(--ink);
      margin-top: 1px;
    }

    .edu-detail {
      font-family: 'DM Sans', sans-serif;
      font-size: 8pt;
      color: var(--muted);
      margin-top: 1px;
    }

    /* ── CERTIFICATIONS ─────────────────────────────────── */
    .cert-entry {
      font-family: 'DM Sans', sans-serif;
      font-size: 8.8pt;
      margin-bottom: 4px;
      line-height: 1.5;
      color: var(--ink);
      padding-left: 10px;
      border-left: 1.5px solid var(--rule);
    }

    .cert-name { font-weight: 600; color: var(--navy); }

    /* ── ACHIEVEMENTS ───────────────────────────────────── */
    .achievement-entry {
      margin-bottom: 6px;
      padding-left: 10px;
      border-left: 1.5px solid var(--gold);
    }

    .achievement-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 9.3pt;
      font-weight: 600;
      color: var(--navy);
    }

    .achievement-desc {
      font-size: 8.8pt;
      font-weight: 300;
      color: var(--muted);
      margin-top: 1px;
      line-height: 1.5;
    }

    /* ── MISC ───────────────────────────────────────────── */
    p   { font-size: 9.5pt; line-height: 1.55; margin-bottom: 3px; }
    a   { color: var(--navy); text-decoration: none; }
    hr  { display: none; }
    strong { color: var(--ink); font-weight: 600; }
  </style>
</head>
<body>${html}</body>
</html>`;
}

// ─── PDF ───────────────────────────────────────────────────────────────────────
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  // Load Google Fonts over network — keep networkidle0 so fonts render
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", right: "16mm", bottom: "14mm", left: "16mm" },
  });
  await browser.close();
  return pdf;
}

// ─── INTERVIEW REPORT ──────────────────────────────────────────────────────────
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const cacheKey = getCacheKey({ resume, selfDescription, jobDescription });
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log("CACHE HIT (report)");
    return cached;
  }

  await rateLimit();

  const systemPrompt = `You are a senior technical interviewer. Return ONLY valid JSON, no markdown.
Generate minimum: 5 technicalQuestions, 5 behavioralQuestions, 5 skillGaps, 7 preparationPlan days.
Rules:
- question: real-world scenario specific to the candidate and job, never a definition
- intention: 1 or 2 sentences — skill being tested, what a strong answer demonstrates
- answer: 3 sentences — approach, concrete example from candidate background, key technical detail, best practices
- behavioral answer: 3 sentences — Situation+Task setup, Actions taken, quantified Result, lesson learned
- skillGap reason: 1 or 2 sentences — why gap exists based on resume, impact on hiring
- tasks: 3-5 specific items naming a real resource/activity (e.g. "Solve 3 LeetCode BFS/DFS mediums")
Schema: {"title":string,"matchScore":number(0-100),"technicalQuestions":[{"question":string,"intention":string,"answer":string}],"behavioralQuestions":[{"question":string,"intention":string,"answer":string}],"skillGaps":[{"skill":string,"severity":"low"|"medium"|"high","reason":string}],"preparationPlan":[{"day":number,"focus":string,"tasks":[string]}]}`;

  const userContent = `RESUME: ${resume || "Not provided"}
SELF: ${selfDescription || "Not provided"}
JOB: ${jobDescription || "Not provided"}`;

  const geminiPrompt = systemPrompt + "\n\n" + userContent;

  const timeout = (ms) =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    );

  const providers = [
    async () => {
      const tryGemini = async (model) => {
        const res = await Promise.race([
          ai.models.generateContent({
            model,
            contents: geminiPrompt,
            config: { responseMimeType: "application/json" },
          }),
          timeout(30000),
        ]);
        const text = res.text;
        if (text?.includes('"error"')) {
          const errObj = safeParse(text);
          throw new Error(errObj?.error?.message || "Gemini API error");
        }
        return text;
      };
      console.log("Report → Gemini 2.5-flash");
      try {
        return await tryGemini("gemini-2.5-flash");
      } catch (e) {
        if (
          e.message.includes("high demand") ||
          e.message.includes("UNAVAILABLE")
        ) {
          console.log("Report → Gemini 2.0-flash (fallback)");
          return await tryGemini("gemini-2.0-flash");
        }
        throw e;
      }
    },

    async () => {
      console.log("Report → Groq");
      const res = await Promise.race([
        axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            temperature: 0.4,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          },
          { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } },
        ),
        timeout(30000),
      ]);
      if (res.data.error) throw new Error(res.data.error.message);
      return res.data.choices[0].message.content;
    },

    async () => {
      console.log("Report → OpenRouter");
      const res = await Promise.race([
        axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            temperature: 0.4,
            max_tokens: 4000,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "http://localhost:5173",
            },
          },
        ),
        timeout(30000),
      ]);
      if (res.data.error) throw new Error(res.data.error.message);
      return res.data.choices[0].message.content;
    },
  ];

  for (const provider of providers) {
    try {
      const raw = await provider();
      const parsed = safeParse(raw);
      if (!parsed) throw new Error("Parse failed");
      if (isValid(parsed)) {
        cache.set(cacheKey, parsed);
        return parsed;
      }
      throw new Error(
        "Incomplete response (required fields missing or too few items)",
      );
    } catch (err) {
      console.error("❌ Provider failed:", err.message);
    }
  }

  throw new Error("All AI providers failed");
}

// ─── RESUME PDF ────────────────────────────────────────────────────────────────
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const cacheKey = getCacheKey({
    resume,
    selfDescription,
    jobDescription,
    type: "resume",
  });
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log("CACHE HIT (resume)");
    return cached;
  }

  // ─── RESUME PROMPT ────────────────────────────────────────────────────────────
  // Key goals:
  //   1. Human-sounding output — varied sentence lengths, natural voice, no AI clichés
  //   2. 100% faithful to candidate data — never invent facts or metrics
  //   3. ATS-safe HTML with the pre-loaded stylesheet classes
  //   4. Full A4 page — every skill-relevant piece of content must be included
  //   5. Credit protection — temperature tuning + paraphrasing instructions
  const prompt = `You are a professional resume writer who has spent 15 years crafting resumes for engineers, designers, and product managers at top-tier companies. You write in a natural, confident, human voice. Your work has never once been flagged as AI-generated.

Return ONLY a valid JSON object in this exact format:
{"html": "<inner body HTML here>"}

Do NOT wrap in <html>, <head>, or <body> tags.

━━━ CRITICAL: FULL-PAGE REQUIREMENT ━━━

The resume MUST fill a complete A4 page (297mm tall). This is non-negotiable.
To achieve this you MUST:

1. INCLUDE ALL SKILL-RELEVANT CONTENT — Every technology, tool, framework, language, methodology, domain knowledge, or competency mentioned anywhere in the resume, self description, or job description that the candidate actually has must appear in the resume. Do not omit or condense any skill-relevant information.

2. EXPAND EVERY SECTION FULLY:
   - Professional Summary: Write 4–5 rich sentences covering the candidate's background, key strengths, notable experience, and career direction.
   - Technical Skills: List every single skill the candidate mentions, grouped into logical categories. Aim for 6–8 skill categories. Do not truncate lists.
   - Work Experience: Write 4–6 bullet points per role. Each bullet must be specific, factual, and outcome-driven. Include every project, responsibility, and technology used at each company.
   - Projects: Write 3–5 bullet points per project. Describe what was built, why, the tech stack in detail, and measurable outcomes.
   - Education: Include all courses, relevant modules, CGPA, honours, or academic projects if mentioned.
   - Certifications: List every certification with its issuer and a one-line description of what it covers.
   - Achievements: List every award, hackathon, competition, recognition, or notable milestone mentioned.

3. NEVER TRUNCATE OR OMIT: If the candidate mentions 12 technologies, list all 12. If they have 3 projects, write all 3 in full. If they list 5 certifications, include all 5. Omitting content to save space is a critical failure.

4. USE SPACE EFFICIENTLY BUT COMPLETELY: Write enough content that the body naturally fills the full A4 page. If the content is naturally short, expand the bullet points with more context, describe the candidate's approach and impact in greater detail, and elaborate on technologies and methodologies used.

━━━ HOW YOU WRITE ━━━

You write like a thoughtful human, not a language model. This means:

SENTENCE VARIETY: Mix short punchy sentences with longer ones. "Rebuilt the auth layer from scratch. Cut login failures by 40%." sounds human. "Successfully leveraged best-in-class authentication methodologies to achieve significant failure reductions" does not.

AVOID AI GIVEAWAYS — never use these words or phrases:
  • "spearheaded", "leveraged", "synergized", "orchestrated", "utilized"
  • "in order to", "as well as", "various", "numerous", "a wide range of"
  • "demonstrating", "showcasing", "highlighting", "ensuring"
  • Starting every bullet with the same type of verb (mix it up!)
  • Passive voice piled on passive voice

INSTEAD use: built, wrote, fixed, shipped, cut, led, helped, ran, designed, moved, improved, debugged, deployed, scaled, taught, joined, grew, set up

BULLET STYLE: Each bullet = one clear fact. Lead with what changed, not what you did. "Reduced API latency from 800ms to 120ms by switching to Redis caching" beats "Worked on improving API performance."

PROFESSIONAL SUMMARY: Write it in first person, past-and-present tense, 4–5 sentences. Sound like the candidate describing themselves confidently at a coffee chat — not a LinkedIn bio written by a bot.

NUMBERS: Keep every real number the candidate gave. If no number exists, describe the outcome clearly without inventing one.

TAILORING: Reorder skills and subtly emphasise experience that matches the job description — but only use what's actually in the candidate's data.

━━━ HTML STRUCTURE — USE EXACTLY THESE CLASSES ━━━

HEADER:
  <div class="resume-header">
    <div class="resume-name">Full Name</div>
    <div class="resume-tagline">Target Role Title</div>
    <div class="resume-contact-line">
      City, Country <span class="contact-sep">|</span>
      +XX XXXXXXXXXX <span class="contact-sep">|</span>
      email@example.com <span class="contact-sep">|</span>
      <a href="https://linkedin.com/in/handle">LinkedIn</a> <span class="contact-sep">|</span>
      <a href="https://github.com/handle">GitHub</a>
    </div>
  </div>

SECTION HEADINGS:  <h2>Section Name</h2>

PROFESSIONAL SUMMARY:
  <p class="summary-text">4–5 sentences. First person. Confident. Specific. Human.</p>

TECHNICAL SKILLS:
  <div class="skills-grid">
    <div class="skill-row"><span class="skill-label">Languages:</span> Python, TypeScript, Go</div>
    ...
  </div>
  Group into 6–8 categories. Include EVERY skill the candidate has mentioned. Do not leave any out.

WORK EXPERIENCE:
  <div class="entry">
    <div class="entry-header">
      <span class="entry-company">Company Name</span>
      <span class="entry-date">Jan 2022 – Mar 2024</span>
    </div>
    <div class="entry-role">Software Engineer</div>
    <ul>
      <li>Specific, factual, outcome-driven bullet. Write 4–6 bullets per role.</li>
    </ul>
  </div>

PROJECTS:
  <div class="entry">
    <div class="entry-title">Project Name</div>
    <div class="entry-tech">Tech: React, Node.js, PostgreSQL</div>
    <ul><li>What was built, why it matters, and what it achieved. Write 3–5 bullets per project.</li></ul>
  </div>

EDUCATION:
  <div class="edu-entry">
    <div class="edu-header">
      <span class="edu-degree">B.Tech in Computer Science</span>
      <span class="edu-year">2024</span>
    </div>
    <div class="edu-institution">University Name, City</div>
    <div class="edu-detail">CGPA: 8.7 / 10 — Relevant coursework: Data Structures, OS, DBMS, Computer Networks</div>
  </div>

CERTIFICATIONS (include ALL that are present):
  <div class="cert-entry"><span class="cert-name">AWS Solutions Architect</span> — Amazon. Covers cloud architecture, IAM, and cost optimisation.</div>

ACHIEVEMENTS (include ALL that are present):
  <div class="achievement-entry">
    <div class="achievement-title">1st Place — HackIndia 2023</div>
    <div class="achievement-desc">Built a real-time flood prediction tool. Beat 200+ teams.</div>
  </div>

ETC... Which is needed in resume and important

━━━ SECTION ORDER ━━━
Only include sections where the candidate actually has data.
Include ALL sections that have data — do not skip any:
1. Header  2. Professional Summary  3. Technical Skills  4. Work Experience
5. Projects  6. Education  7. Certifications  8. Achievements

━━━ CANDIDATE DATA ━━━

RESUME:
${resume || "(not provided)"}

SELF DESCRIPTION:
${selfDescription || "(not provided)"}

JOB DESCRIPTION:
${jobDescription || "(not provided)"}`;

  const timeout = (ms) =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    );

  const providers = [
    // Gemini 2.5-flash — best HTML quality, temperature 0.75 for natural writing
    async () => {
      console.log("Resume → Gemini 2.5-flash");
      const res = await Promise.race([
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.75, // Higher = more varied, human-sounding prose
          },
        }),
        timeout(35000),
      ]);
      return res.text;
    },

    // Groq — fast fallback, temperature 0.7
    async () => {
      console.log("Resume → Groq llama-3.3-70b");
      const res = await Promise.race([
        axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          },
          { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } },
        ),
        timeout(30000),
      ]);
      if (res.data.error) throw new Error(res.data.error.message);
      return res.data.choices[0].message.content;
    },

    // OpenRouter — GPT-3.5 safety net, temperature 0.7
    async () => {
      console.log("Resume → OpenRouter gpt-3.5-turbo");
      const res = await Promise.race([
        axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3500,
            response_format: { type: "json_object" },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "http://localhost:5173",
            },
          },
        ),
        timeout(30000),
      ]);
      if (res.data.error) throw new Error(res.data.error.message);
      return res.data.choices[0].message.content;
    },
  ];

  for (const provider of providers) {
    try {
      const raw = await provider();
      let html = extractHTML(raw);
      if (!html) throw new Error("Empty HTML response");
      html = ensureHTML(html);
      const pdf = await generatePdfFromHtml(html);
      cache.set(cacheKey, pdf);
      return pdf;
    } catch (err) {
      console.error("❌ Provider failed:", err.message);
    }
  }

  throw new Error("All resume providers failed");
}

module.exports = { generateInterviewReport, generateResumePdf };