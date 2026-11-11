import { chunks } from "../data/resume.js";

const STOP = new Set(("a an the is are was were be been do does did of in on at to for from with and or but what which who whom how when where why about tell me his him he ashish my i you your can could should would any some it its this that there their they them as by up has have had get").split(" "));

const SYN = {
  job: "experience current", work: "experience current", role: "experience current", company: "experience current", employer: "experience current", intern: "experience", internship: "experience",
  cv: "computer vision", vision: "computer vision", yolo: "computer vision",
  llm: "llm gpt genai", gpt: "llm genai", genai: "llm gpt",
  contact: "contact email phone reach", email: "contact email", phone: "contact phone", reach: "contact email", call: "contact phone",
  school: "education", college: "education", university: "education", degree: "education", study: "education", cgpa: "education",
  award: "hackathon place", won: "hackathon place", win: "hackathon place", prize: "hackathon place", hackathon: "hackathon place",
  patent: "patent invention", invention: "patent invention",
  framework: "frameworks", library: "frameworks", ml: "machine learning",
  language: "languages", speak: "languages",
  cert: "certifications", certificate: "certifications", course: "certifications",
};

const stem = (w) => {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
};

const base = (s) =>
  s.toLowerCase().replace(/[^a-z0-9+\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));

export const tokenize = (s) => base(s).map(stem);

const expandQuery = (s) => {
  const out = [];
  for (const w of base(s)) {
    out.push(stem(w));
    const syn = SYN[w] || SYN[stem(w)];
    if (syn) out.push(...tokenize(syn));
  }
  return out;
};

const docs = chunks.map((c) => {
  const tokens = tokenize(`${c.title} ${c.title} ${c.section} ${c.text} ${c.keywords || ""}`);
  const tf = new Map();
  tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  return { chunk: c, tf, len: tokens.length };
});
const avgLen = docs.reduce((a, d) => a + d.len, 0) / docs.length;
const df = new Map();
docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));

const K1 = 1.4, B = 0.75, THRESHOLD = 1.0;
export const FALLBACK =
  "I couldn't find that in my resume — try asking about experience, projects, skills, education or contact, or email ashishg2204@gmail.com.";

export function answer(query) {
  const q = expandQuery(query);
  if (!q.length) return { text: FALLBACK, sources: [], top: null };
  const scored = docs.map((d) => {
    let score = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      const n = df.get(t);
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      score += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
    }
    return { chunk: d.chunk, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score < THRESHOLD) return { text: FALLBACK, sources: [], top: null };
  // Chunks that share an id group (e.g. "exp-maaze-docs" / "exp-maaze-video") belong to one entry: answer with all of them.
  const group = (c) => c.id.split("-").slice(0, 2).join("-");
  const siblings = scored.filter((s) => s !== top && /^exp-/.test(top.chunk.id) && group(s.chunk) === group(top.chunk));
  const picked = [top, ...siblings];
  if (siblings.length) picked.sort((a, b) => chunks.indexOf(a.chunk) - chunks.indexOf(b.chunk));
  const second = scored.find((s, i) => i > 0 && s.chunk.section !== top.chunk.section && s.score >= 0.6 * top.score);
  if (second) picked.push(second);
  return {
    text: picked.map((p) => p.chunk.text).join("\n\n"),
    sources: [...new Set(picked.map((p) => p.chunk.section))],
    top: top.chunk.id,
    score: top.score,
    // How much of the question's OWN wording (before synonym expansion) the top chunk contains.
    matched: tokenize(query).filter((w) => docs.find((d) => d.chunk === top.chunk).tf.has(w)),
    content: tokenize(query),
  };
}
