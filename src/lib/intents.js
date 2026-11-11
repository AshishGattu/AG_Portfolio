// Client-side intent layer for the "Ask my resume" chat. No network, no LLM.
// Pipeline: normalise -> entity detection -> intent scoring -> answer composer -> (BM25 fallback).
// Every fact comes from the structured exports in ../data/resume.js.
import {
  contact, summary, skills, experience, projects, education, achievements, patent,
  certifications, spoken, activities, resumeUrl, caseStudy, chunks,
} from "../data/resume.js";
import { answer as bm25 } from "./retrieve.js";

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */
const WORDS = {
  whats: "what is", wats: "what is", wheres: "where is", whos: "who is", hows: "how is", hes: "he is", shes: "he is",
  thats: "that is", dont: "do not", doesnt: "does not", cant: "can not", isnt: "is not", didnt: "did not", wont: "will not",
  hasnt: "has not", im: "i am", ur: "your", u: "you", r: "are", ya: "you", pls: "please", plz: "please", abt: "about",
  knw: "know", wat: "what", wht: "what", wut: "what", wer: "where", hw: "how", thx: "thanks", thnx: "thanks", tnx: "thanks", ty: "thanks",
  tysm: "thanks", exp: "experience", edu: "education", quals: "qualifications", info: "information", yrs: "years", yr: "year",
  wrk: "work", proj: "project", projs: "projects", lang: "language", langs: "languages", univ: "university", uni: "university",
  msg: "message", num: "number", mob: "mobile", ph: "phone", cert: "certification", certs: "certifications", sup: "hello",
  hii: "hi", hiii: "hi", heyy: "hey", heya: "hey", helo: "hello", bday: "birthday", gud: "good", gd: "good", gr8: "great",
  organise: "organize", organised: "organized", organiser: "organizer", organisers: "organizers", organising: "organizing",
  favourite: "favorite", favourites: "favorites", colour: "color", honours: "honors", honour: "honor", programme: "program",
  programmes: "programs", centre: "center", specialisation: "specialization", specialise: "specialize", analyse: "analyze",
  licence: "license", behaviour: "behavior", recognised: "recognized", recognise: "recognize", summarise: "summarize",
  candidate: "ashish", ashishs: "ashish", gattu: "", mr: "", sir: "", guys: "", ok: "okay", okk: "okay",
  kinda: "kind of", wanna: "want to", gonna: "going to", lemme: "let me", tell: "tell", pic: "picture",
  gimme: "give me", w: "with", rn: "right now", tldr: "tl dr", summarize: "summarize", ppl: "people", coz: "because", cuz: "because",
  bc: "because", smth: "something", sth: "something", nd: "and", kno: "know",
};

function basic(raw) {
  let s = ` ${String(raw).toLowerCase().replace(/[‘’´`]/g, "'")} `;
  s = s.replace(/c\+\+/g, "cpp").replace(/c#/g, "csharp").replace(/\.net\b/g, "dotnet").replace(/\+2\b/g, " plus two ");
  s = s.replace(/ashish's/g, "ashish").replace(/\b(what|who|where|when|how|he|she|it|that|there|here)'s/g, "$1 is");
  s = s.replace(/can't/g, "can not").replace(/won't/g, "will not").replace(/n't\b/g, " not")
    .replace(/'re\b/g, " are").replace(/'m\b/g, " am").replace(/'ll\b/g, " will").replace(/'ve\b/g, " have").replace(/'d\b/g, " would")
    .replace(/'s\b/g, "").replace(/'/g, "");
  for (let i = 0; i < 2; i++) s = s.replace(/([a-z0-9])\.([a-z0-9])/g, "$1$2");
  return s.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
};

/* ------------------------------------------------------------------ */
/* Entity dictionary                                                   */
/* ------------------------------------------------------------------ */
const ENT = [];
const E = (id, type, label, aliases, o = {}) => ENT.push({ id, type, label, aliases, ...o });

// Skills present on the resume (places are discovered by searching resume text).
E("python", "skill", "Python", ["python", "py", "python3"]);
E("javascript", "skill", "JavaScript", ["javascript", "js", "ecmascript"]);
E("nodejs", "skill", "Node.js", ["nodejs", "node js", "node"]);
E("react", "skill", "React", ["react", "reactjs", "react js"]);
E("html", "skill", "HTML", ["html", "html5"]);
E("css", "skill", "CSS", ["css", "css3"]);
E("pytorch", "skill", "PyTorch", ["pytorch", "torch", "py torch"]);
E("tensorflow", "skill", "TensorFlow", ["tensorflow", "tf", "tensor flow"]);
E("keras", "skill", "Keras", ["keras"]);
E("yolo", "skill", "YOLOv5", ["yolo", "yolov5", "yolo v5", "you only look once"], { match: ["yolo", "yolov5"] });
E("sklearn", "skill", "Scikit-learn", ["scikit learn", "sklearn", "scikit", "scikitlearn"], { match: ["scikit learn"] });
E("opencv", "skill", "OpenCV", ["opencv", "cv2", "open cv"]);
E("nltk", "skill", "NLTK", ["nltk"]);
E("spacy", "skill", "SpaCy", ["spacy"]);
E("hf", "skill", "Hugging Face Transformers", ["hugging face", "huggingface", "hf", "transformers", "transformer", "hf transformers"], { match: ["hugging face"] });
E("langchain", "skill", "LangChain", ["langchain", "lang chain"]);
E("pandas", "skill", "Pandas", ["pandas"]);
E("numpy", "skill", "NumPy", ["numpy", "num py"]);
E("matplotlib", "skill", "Matplotlib", ["matplotlib"]);
E("seaborn", "skill", "Seaborn", ["seaborn"]);
E("git", "skill", "Git", ["git"]);
E("githubtool", "skill", "GitHub", ["github", "git hub"]);
E("jupyter", "skill", "Jupyter", ["jupyter", "jupyter notebook", "ipynb"]);
E("colab", "skill", "Google Colab", ["colab", "google colab"]);
E("vscode", "skill", "VS Code", ["vscode", "vs code", "visual studio code"]);
E("figma", "skill", "Figma", ["figma"]);
E("nlp", "field", "NLP", ["nlp", "natural language processing", "text processing", "language models"], { tag: "nlp", match: ["nlp", "nltk", "spacy"] });
E("ml", "field", "machine learning", ["machine learning", "ml", "ai ml", "ai and ml"], { tag: "ml", match: ["machine learning", "supervised unsupervised learning"] });
E("dl", "field", "deep learning", ["deep learning", "dl", "neural network", "neural networks", "deep neural networks"], { tag: "dl", match: ["deep learning"] });
E("transfer", "skill", "transfer learning", ["transfer learning"]);
E("tracking", "skill", "object tracking", ["object tracking", "tracking"]);
E("phidata", "skill", "Phidata", ["phidata"]);
E("qdrant", "skill", "Qdrant", ["qdrant", "vector db", "vector database"]);
E("ruby", "skill", "Ruby", ["ruby", "roda", "ruby on rails", "rails"], { match: ["ruby", "roda"] });
E("postgres", "skill", "PostgreSQL", ["postgresql", "postgres", "psql"]);
E("arduino", "skill", "Arduino", ["arduino"]);
E("esp32", "skill", "ESP32", ["esp32", "esp 32"]);
E("cnn", "skill", "CNNs", ["cnn", "cnns", "convolutional neural network", "convolutional"], { match: ["cnns"] });
E("rl", "field", "reinforcement learning", ["reinforcement learning", "rl"], { tag: "rl", match: ["rl"] });
E("llama", "skill", "Llama", ["llama", "llama2", "llama 3", "meta llama"]);

// Fields (answers are synthesised from every relevant job/project).
// Fields: evidence comes from the explicit `tags` on each job item / project / the patent in resume.js (hand-verified),
// never from loose text matching. `match` is only used to find the matching skills-section category.
E("cv", "field", "computer vision", ["cv", "computer vision", "cv work", "cv projects", "cv experience", "cv role", "image processing", "image recognition", "object detection", "video analytics", "vision", "cv engineer"],
  { tag: "cv", match: ["computer vision", "object tracking"] });
E("agentic", "field", "agentic AI / multi-agent systems", ["agentic ai", "agentic", "multi agent", "multiagent", "multi agent systems", "ai agents", "ai agent", "agents", "agent", "agent frameworks", "llm agents"],
  { tag: "agentic", match: ["agentic ai"] });
E("rag", "field", "RAG", ["rag", "retrieval augmented generation", "retrieval augmented", "rag chatbot", "rag chatbots", "rag pipelines", "rag pipeline", "vector search", "semantic search"], { tag: "rag", match: ["rag"] });
E("llm", "field", "LLM", ["llm", "llms", "large language model", "large language models", "gpt", "chatgpt", "gpt 5", "gpt5", "openai"],
  { tag: "llm", match: ["llms", "langchain"] });
E("generative", "field", "generative AI", ["generative ai", "genai", "gen ai", "generative", "generative models", "image generation"], { tag: "generative", match: [] });
E("chatbot", "field", "chatbots / conversational AI", ["chatbot", "chatbots", "chat bot", "chat bots", "conversational ai", "virtual assistant", "assistant bot"], { tag: "chatbot", match: [] });
E("fullstack", "field", "full-stack / web development", ["apps", "app development", "applications", "full stack", "fullstack", "web development", "web dev", "web developer", "frontend", "front end", "backend", "back end", "web app", "web apps", "website", "websites", "mern", "web"],
  { tag: "fullstack", match: ["react", "nodejs", "html", "css"] });
E("iot", "field", "IoT / hardware", ["iot", "internet of things", "hardware", "embedded", "sensors", "sensor", "microcontroller", "microcontrollers", "electronics"],
  { tag: "iot", match: [] });
E("cloud", "field", "cloud (Azure)", ["cloud", "cloud platforms", "cloud computing"],
  { tag: "cloud", match: ["azure"], note: "Separately, his Smart Stream patent streams IoT sensor data to cloud storage." });
E("azure", "field", "Azure", ["azure", "azure openai", "document intelligence", "azure ai document intelligence", "form recognizer", "azure ai", "microsoft azure"], { tag: "cloud", match: ["azure"] });
E("production", "field", "production systems", ["production", "in production", "prod", "deployed", "deploy", "deployment", "deploying", "shipped", "real world", "production systems", "production grade", "live systems"],
  { tag: "production", match: [], intro: "both of his Maaze systems are production systems" });
E("speech", "field", "speech / audio", ["speech", "audio", "voice", "audio processing"], { tag: "speech", match: [] });
E("automation", "field", "automation", ["automation", "automate", "automating", "workflow automation"], { tag: "automation", match: [] });
E("database", "field", "databases", ["database", "databases", "db"], { tag: "db", match: [] });
E("casestudy", "site", "Case Study", ["case study", "case studies", "case study section", "document to json", "doc to json", "pdf to json", "json demo", "the demo"]);

// Things that are NOT on the resume (so the skill check answers "no" honestly), with a category for "closest" suggestions.
const NEG = {
  lang: ["java", "cpp", "csharp", "rust", "golang", "kotlin", "swift", "php", "typescript", "scala", "matlab", "perl", "dart", "bash", "shell", "r language"],
  web: ["angular", "vue", "vuejs", "nextjs", "django", "flask", "fastapi", "spring", "springboot", "express", "expressjs", "svelte", "tailwind", "bootstrap", "graphql", "dotnet", "laravel", "wordpress"],
  cloud: ["aws", "gcp", "kubernetes", "docker", "terraform", "lambda", "ec2", "sagemaker", "vertex", "jenkins", "cicd", "devops", "linux", "firebase", "heroku", "vercel"],
  db: ["sql", "mongodb", "mysql", "redis", "sqlite", "nosql", "oracle", "cassandra", "dynamodb", "snowflake", "firebase"],
  data: ["spark", "pyspark", "hadoop", "kafka", "tableau", "powerbi", "excel", "airflow", "databricks", "mlflow", "mlops", "xgboost", "lightgbm", "jax", "onnx", "cuda", "dbt"],
  mlfw: ["yolov8", "yolov3", "pinecone", "stable diffusion", "mediapipe", "detectron", "mxnet", "caffe", "fastai", "autogen", "crewai", "llamaindex", "ollama"],
};
const NEG_ALIAS = { cpp: ["cpp", "c plus plus", "cplusplus"], csharp: ["csharp", "c sharp"], golang: ["golang"], typescript: ["typescript", "ts"], vue: ["vue", "vuejs"], nextjs: ["nextjs", "next js"], kubernetes: ["kubernetes", "k8s"], aws: ["aws", "amazon web services", "ec2", "s3", "sagemaker"], gcp: ["gcp", "google cloud", "vertex"], cicd: ["cicd", "ci cd"], powerbi: ["powerbi", "power bi"], sql: ["sql", "mysql", "sqlite", "sql server"], "r language": ["r language", "rstudio"], springboot: ["springboot", "spring boot", "spring"], mongodb: ["mongodb", "mongo"], express: ["express", "expressjs"], dotnet: ["dotnet"], stablediff: [] };
const negSeen = new Set();
for (const [cat, list] of Object.entries(NEG)) {
  for (const id of list) {
    if (negSeen.has(id)) continue;
    negSeen.add(id);
    const label = id === "cpp" ? "C++" : id === "csharp" ? "C#" : id === "aws" ? "AWS" : id === "gcp" ? "GCP" : id === "r language" ? "R" : id === "cicd" ? "CI/CD" : id === "powerbi" ? "Power BI" : id === "nosql" ? "NoSQL" : id === "dotnet" ? ".NET" : id === "sql" ? "SQL" : id === "mlops" ? "MLOps" : id === "xgboost" ? "XGBoost" : id === "mongodb" ? "MongoDB" : id === "mysql" ? "MySQL" : id === "yolov8" ? "YOLOv8" : id === "php" ? "PHP" : id === "graphql" ? "GraphQL" : id[0].toUpperCase() + id.slice(1);
    const skip = ["vue", "vuejs", "nextjs", "expressjs", "springboot", "firebase"].includes(id) && (id === "vuejs" || id === "expressjs" || id === "springboot");
    if (skip) continue;
    E(`neg-${id}`, "skill", label, NEG_ALIAS[id] || [id], { cat, neg: true, match: NEG_ALIAS[id] || [id] });
  }
}

// Companies, projects, schools, patent, activities, spoken languages.
E("c-maaze", "company", "Maaze", ["maaze", "maaze underwriting", "maaze underwriting solutions", "underwriting", "mazee"], { co: "maaze" });
E("c-srin", "company", "Srinishtha", ["srinishtha", "srinishta", "srinistha", "srinishtha technologies", "internship", "internships", "intern", "interned", "interning"], { co: "srinishtha" });
E("p-docs", "project", "Insurance Document Extraction Platform", ["insurance document extraction", "document extraction", "insurance", "extraction platform", "insurance platform"], { item: "maaze-docs" });
E("p-video", "project", "Real-Time Retail Video Analytics", ["retail video analytics", "retail analytics", "retail video", "footfall", "real time video analytics", "store analytics"], { item: "maaze-video" });
E("p-hrops", "project", "HROps", ["hrops", "hr ops", "hr automation", "hr agents"], { item: "hrops" });
E("p-wealth", "project", "WealthMaps", ["wealthmaps", "wealth maps", "fueled contest", "fueled", "fueled contest 2"], { item: "wealthmaps" });
E("p-parquik", "project", "Parquik", ["parquik", "smart parking", "parking"], { item: "parquik" });
E("p-getfit", "project", "Get-Fit", ["getfit", "get fit", "fitness tracker", "fitness"], { item: "getfit" });
E("p-emotion", "project", "Emotion S2S", ["emotion s2s", "s2s", "speech to speech", "speech translation", "emotion", "voice translation"], { item: "emotion" });
E("p-cyber", "project", "CyberGPT 2", ["cybergpt", "cyber gpt", "cybergpt 2"], { item: "cybergpt" });
E("p-edusense", "project", "EduSense", ["edusense", "edu sense", "emis"], { item: "edusense" });
E("p-fashion", "project", "Context-Aware Fashion Advisory", ["fashion advisory", "fashion advisor", "fashion", "context aware fashion advisory"], { item: "fashion" });
E("p-diffusion", "project", "Diffusion Model", ["diffusion model", "diffusion", "ddpm"], { item: "diffusion" });
E("patent", "patent", "Smart Stream patent", ["patent", "patents", "smart stream", "smartstream", "water flow", "water flow detection", "invention"]);
E("s-uni", "school", "Woxsen University", ["woxsen", "woxsen university", "alma mater"], { sub: "uni" });
E("s-12", "school", "Narayana Junior College", ["narayana", "narayana junior college", "junior college"], { sub: "12" });
E("s-10", "school", "St. Andrews School", ["st andrews", "saint andrews", "st andrews school", "andrews"], { sub: "10" });
E("a-udhgam", "activity", "Udhgam Hackathon 2025", ["udhgam", "udgam", "udhgam hackathon"], { act: "udhgam" });
E("a-mark", "activity", "MARK XXIV", ["mark xxiv", "mark 24", "markxxiv", "mark xxiv national hackathon", "mark hackathon"], { act: "mark" });
E("a-ajman", "activity", "Ajman University Winter Study Tour", ["ajman", "ajman university", "winter study tour", "study tour"], { act: "ajman" });
E("a-nvidia", "activity", "Nvidia AI Summit", ["nvidia", "nvidia ai summit", "ai summit", "nvidia summit"], { act: "nvidia" });
E("a-tech", "activity", "Technology Club", ["tech club", "technology club"], { act: "techclub" });
E("a-coe", "activity", "COE MetaTech", ["coe metatech", "metatech", "coe", "center of excellence"], { act: "coe" });
for (const [id, label] of [["english", "English"], ["hindi", "Hindi"], ["telugu", "Telugu"], ["german", "German"], ["french", "French"], ["spanish", "Spanish"], ["tamil", "Tamil"], ["kannada", "Kannada"], ["malayalam", "Malayalam"], ["marathi", "Marathi"], ["bengali", "Bengali"], ["gujarati", "Gujarati"], ["punjabi", "Punjabi"], ["urdu", "Urdu"], ["arabic", "Arabic"], ["japanese", "Japanese"], ["chinese", "Chinese"], ["mandarin", "Mandarin"], ["korean", "Korean"], ["russian", "Russian"], ["italian", "Italian"]]) {
  E(`l-${id}`, "spoken", label, [id]);
}

// Aliases that are also everyday English words only count as tech mentions when the question has a tech cue.
const AMBIGUOUS = new Set(["express", "spring", "swift", "shell", "bash", "excel", "spark", "oracle", "dart", "lambda", "vision", "applications", "apps", "tracking", "emotion", "fitness", "fashion", "parking", "insurance", "web", "agent", "agents", "transformer", "transformers", "deploy", "deployed", "live systems", "real world"]);
const TECH_CUE = /\b(know|knows|use|uses|used|using|experience|experienced|familiar|proficient|skill|skills|skilled|good|worked|work|tech|technology|technologies|framework|frameworks|library|language|project|projects|built|build|building|coding|code|program|developer|dev|stuff|systems?|any|done|production|ai|ml|model|models|app|tool|tools)\b/;
const normAlias = (a) => basic(a).join(" ");
const ALIAS_LIST = [];
for (const e of ENT) for (const a of e.aliases) ALIAS_LIST.push({ alias: normAlias(a), ent: e });
ALIAS_LIST.sort((a, b) => b.alias.length - a.alias.length);

// Longest alias first, so multiword entities ("case study", "study tour", "computer vision") win over single words.
// Returns the entities plus `masked`: the text with multiword entity mentions blanked out, so their component
// words ("study", "case", "vision") can't also fire keyword intents on their own.
function findEntities(t) {
  let work = ` ${t} `;
  let masked = work;
  const found = [];
  for (const { alias, ent } of ALIAS_LIST) {
    let idx = work.indexOf(` ${alias} `);
    while (idx >= 0) {
      found.push({ ent, pos: idx, alias, amb: AMBIGUOUS.has(alias) });
      const blank = " ".repeat(alias.length);
      work = work.slice(0, idx + 1) + blank + work.slice(idx + 1 + alias.length);
      if (alias.includes(" ")) masked = masked.slice(0, idx + 1) + blank + masked.slice(idx + 1 + alias.length);
      idx = work.indexOf(` ${alias} `);
    }
  }
  found.sort((a, b) => a.pos - b.pos);
  const seen = new Set();
  const nTok = t.split(" ").filter(Boolean).length;
  const cvOk = (f) => f.alias !== "cv" || (found.some((g) => g !== f && (g.ent.type === "field" || g.ent.type === "skill")) || / (cv|vision) (projects?|work|experience|engineer|models?|roles?|stuff|skills?) /.test(` ${t} `)) && !/ (download|send|share|pdf|copy|attach|resume|curriculum) /.test(` ${t} `);
  const ents = found.filter((f) => (!f.amb || nTok <= 2 || TECH_CUE.test(t)) && cvOk(f)).map((f) => f.ent).filter((e) => (seen.has(e.id) ? false : seen.add(e.id)));
  return { ents, masked: masked.split(/\s+/).filter(Boolean) };
}

/* ------------------------------------------------------------------ */
/* Resume data helpers                                                 */
/* ------------------------------------------------------------------ */
const monthIdx = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const monthsInclusive = (a, b) => {
  const [m1, y1] = a.split(" "), [m2, y2] = b.split(" ");
  return (Number(y2) - Number(y1)) * 12 + monthIdx[m2] - monthIdx[m1] + 1;
};
const period = (j) => (j.current ? `${j.start} to present` : `${j.start} to ${j.end}`);

const POOL = [];
for (const j of experience) for (const it of j.items) POOL.push({ ...it, kind: "job", company: j.short, label: `${it.name} at ${j.short}` });
for (const p of projects) POOL.push({ ...p, kind: "project", label: p.name });
POOL.push({ id: "patent", kind: "patent", name: "Smart Stream", label: "the Smart Stream patent", short: "IoT water-flow detection system (flow, pressure and temperature sensors on Arduino/ESP32, data streamed to cloud storage, web app for usage analytics)", desc: patent.desc, tech: ["IoT", "Arduino", "ESP32", "sensors", "web app"], tags: patent.tags });
for (const it of POOL) it.norm = ` ${normAlias([it.name, it.short, it.desc, ...(it.tech || []), it.award || ""].join(" "))} `;

const SKILL_ITEMS = [];
for (const [cat, list] of Object.entries(skills)) for (const s of list) SKILL_ITEMS.push({ cat, name: s, norm: ` ${normAlias(s)} ` });
const catName = (c) => (c === "Data & Tools" ? "Data & Tools" : c);

const patsOf = (ent) => (ent.match || ent.aliases).map(normAlias);
const placesOf = (ent) => {
  if (ent.tag) return POOL.filter((it) => (it.tags || []).includes(ent.tag));
  const pats = patsOf(ent);
  return POOL.filter((it) => pats.some((p) => it.norm.includes(` ${p} `)));
};
const skillCats = (ent) => {
  const pats = ent.type === "field" ? (ent.match || []).map(normAlias) : patsOf(ent);
  return [...new Set(SKILL_ITEMS.filter((s) => pats.some((p) => s.norm.includes(` ${p} `))).map((s) => s.cat))];
};
const certsOf = (ent) => {
  const pats = patsOf(ent);
  return certifications.filter((c) => (c.match || []).some((m) => pats.includes(normAlias(m))));
};

const join = (arr) => (arr.length <= 1 ? arr.join("") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`);
const bullets = (arr) => arr.map((l) => `- ${l}`).join("\n");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const CLOSEST = {
  lang: "Python, JavaScript and Node.js", web: "React, Node.js, HTML and CSS", cloud: "Azure (AI Document Intelligence and Azure OpenAI at Maaze), plus Git and GitHub",
  db: "PostgreSQL (used in the EduSense project)", data: "Pandas, NumPy, Matplotlib and Seaborn", mlfw: "PyTorch, TensorFlow, Keras, Scikit-learn, OpenCV, YOLOv5 and Hugging Face Transformers",
  other: "Python, PyTorch, TensorFlow, Azure and LangChain",
};
const R = (text, sources, extra = {}) => ({ text, sources, ...extra });

/* ------------------------------------------------------------------ */
/* Answer composers                                                    */
/* ------------------------------------------------------------------ */
const A = {};

const skillOne = (ent, c) => {
  const pl = placesOf(ent), cats = skillCats(ent), certs = certsOf(ent);
  const yn = c.yn;
  if (!pl.length && !cats.length) {
    if (certs.length) {
      const cc = certs[0];
      return `${ent.label} isn't one of Ashish's listed skills, though he completed the ${cc.name} course (${cc.by}, ${cc.date.split(", ").pop()}).`;
    }
    const cat = ent.cat || "other";
    return `That isn't on Ashish's resume (${ent.label}), but here's what's closest: ${CLOSEST[cat] || CLOSEST.other}.`;
  }
  const lead = yn ? "Yes — " : "";
  const catTxt = cats.length ? `listed under ${join(cats.map(catName))}` : "";
  if (ent.type === "field") {
    const intro = ent.intro || `Ashish has hands-on ${ent.label} experience`;
    return `${lead}${lead ? intro : cap(intro)}:\n${bullets(pl.map((p) => `**${p.label}** — ${p.short}`))}` + (cats.length ? `\nAlso ${catTxt} in his skills.` : "") + (ent.note ? `\n${ent.note}` : "");
  }
  if (!pl.length) return `${lead}${cap(ent.label)} is ${catTxt} in Ashish's skills.`.replace(/^Yes — (\w)/, (m, ch) => `Yes — ${ch}`);
  if (pl.length > 2 || c.more) {
    return `${lead}Ashish uses ${ent.label}:\n${bullets(pl.map((p) => `**${p.label}** — ${p.short}`))}` + (cats.length ? `\nIt's also ${catTxt} in his skills.` : "");
  }
  return `${lead}Ashish uses ${ent.label} — ${join(pl.map((p) => `in ${p.label}`))} (${pl.map((p) => p.short).join("; ")}).` + (cats.length ? ` It's also ${catTxt} in his skills.` : "");
};

const COMPARE = /\b(prefer|prefers|preferred|favou?rite|better|more into|stronger|vs|versus|or)\b/;
A.skill_check = (c) => {
  let es = c.ents.filter((e) => e.type === "skill" || e.type === "field");
  // "computer vision in production" -> production narrows the other capability instead of being a second answer
  const prod = es.find((e) => e.id === "production");
  if (prod && es.length >= 2) {
    const other = es.find((e) => e !== prod);
    const pl = placesOf(other).filter((p) => (p.tags || []).includes("production"));
    if (pl.length) return R(`${c.yn ? "Yes — in" : "In"} production, Ashish's ${other.label} work is:\n${bullets(pl.map((p) => `**${p.label}** — ${p.short}`))}`, ["Experience"], { ents: [other] });
    es = es.filter((e) => e !== prod);
    return R(`${c.yn ? "No — " : ""}None of his listed production systems involve ${other.label}; his production work at ${cur.short} is ${join(cur.items.map((i) => i.name))}.`, ["Experience"], { ents: [other] });
  }
  const compare = es.length >= 2 && COMPARE.test(c.t) && /\b(which|prefer|prefers|more|better|stronger|vs|versus)\b/.test(c.t);
  if (compare) {
    const lines = es.slice(0, 4).map((e) => {
      const pl = placesOf(e), cats = skillCats(e);
      if (!pl.length && !cats.length) return `**${e.label}** — not on his resume`;
      return `**${e.label}** — ${pl.length ? join(pl.slice(0, 5).map((p) => p.label)) : `listed under ${join(cats.map(catName))} in his skills`}`;
    });
    return R(`His resume doesn't rank these or state a preference — the evidence for each:\n${bullets(lines)}`, ["Skills", "Projects", "Experience"], { ents: es });
  }
  return R(es.slice(0, 4).map((e) => skillOne(e, c)).join("\n\n"), ["Skills", "Projects", "Experience"], { ents: es });
};

A.skill_unknown = (c) => R(
  `That doesn't appear on Ashish's resume. For reference, his listed skills include Python, JavaScript, PyTorch, TensorFlow, OpenCV, LangChain and Azure — ask "what are his skills?" for the full list.`, ["Skills"], { ents: c.ents });

A.projects_by_tech = (c) => {
  const es = c.ents.filter((e) => e.type === "skill" || e.type === "field");
  const out = es.slice(0, 3).map((e) => {
    const pl = placesOf(e);
    if (!pl.length) return `None of Ashish's listed projects mention ${e.label}. Closest from his resume: ${CLOSEST[e.cat || "other"]}.`;
    const intro = e.intro || (c.yn ? `Ashish's ${e.label} work` : `Work involving ${e.label}`);
    return `${c.yn ? "Yes — " : ""}${c.yn ? intro : cap(intro)}:\n${bullets(pl.map((p) => `**${p.label}** — ${p.short}`))}` + (e.note ? `\n${e.note}` : "");
  });
  return R(out.join("\n\n"), ["Projects", "Experience"], { ents: es });
};

A.skills_list = (c) => {
  const t = c.pad;
  let cat = null;
  if (/ (frameworks?|librar(y|ies)|ml frameworks?|dl frameworks?) /.test(t)) cat = "Frameworks";
  else if (/ (cloud|azure) /.test(t)) cat = "Cloud";
  else if (/ (programming|coding|code|prog) /.test(t) || / (languages?) /.test(t)) cat = "Languages";
  else if (/ (tools?|tooling|software|ides?|data tools?|visuali[sz]ation) /.test(t)) cat = "Data & Tools";
  else if (/ (techniques?|ai skills?|ml skills?|ai ml|ai techniques?|ml techniques?) /.test(t)) cat = "AI & ML";
  if (cat) {
    const label = { Frameworks: "ML and deep learning frameworks", Cloud: "cloud", Languages: "programming and web languages", "Data & Tools": "data and developer tools", "AI & ML": "AI and ML techniques" }[cat];
    return R(`Ashish's ${label}: ${join(skills[cat])}.`, ["Skills"], { cat });
  }
  return R(`Ashish's tech stack:\n${bullets(Object.entries(skills).map(([k, v]) => `**${k}:** ${v.join(", ")}`))}`, ["Skills"]);
};

A.about = () => R(`Ashish Gattu is an ${summary}\nHe currently works as AI Engineer at Maaze Underwriting Solutions.`, ["About", "Experience"]);

A.greeting = () => R(`Hi! I can answer questions about Ashish Gattu's experience, projects, skills, education and contact details. For example:\n${bullets(["Where does he work?", "What are his hackathon wins?", "Which ML frameworks does he use?"])}`, ["About"]);
A.thanks = () => R("You're welcome! Ask me anything else about Ashish's resume.", []);
A.goodbye = () => R(`Thanks for stopping by! If you'd like to get in touch with Ashish, email ${contact.email}.`, []);

const jobLine = (j) => `**${j.role}**, ${j.company}${j.location ? ` (${j.location})` : ""} — ${period(j)}${j.current ? "" : ` (about ${monthsInclusive(j.start, j.end)} months)`}`;
A.current_role = (c) => {
  const j = experience[0];
  const yn = c.yn && /\b(employed|working|work|have a job|has a job|got a job|jobless|unemployed)\b/.test(c.t);
  return R(`${yn ? "Yes — " : ""}Ashish currently works as ${j.role} at ${j.company} (since ${j.start}), building the ${j.items[0].name} and ${j.items[1].name}.`, ["Experience"], { ents: [ENT.find((e) => e.id === "c-maaze")] });
};

const TIME_Q = /\b(start|started|join|joined|begin|began|end|ended|finish|finished|leave|left|since|until|till)\b/;
A.company = (c) => {
  const cos = c.ents.filter((e) => e.type === "company");
  const timeQ = c.qtype === "when" || c.qtype === "howlong" || (TIME_Q.test(c.t) && !c.more);
  const out = cos.map((e) => {
    const j = experience.find((x) => x.id === e.co);
    if (timeQ) {
      return j.current
        ? `Ashish joined ${j.company} as ${j.role} in **${j.start}** and is still there (${period(j)}).`
        : `Ashish was ${j.role} at ${j.company}${j.location ? `, ${j.location},` : ""} from **${j.start} to ${j.end}** — about ${monthsInclusive(j.start, j.end)} months.`;
    }
    if (c.qtype === "howmany" && !j.current) return `One — Ashish was ${j.role} at ${j.company}, ${j.location} (${j.start} to ${j.end}, about ${monthsInclusive(j.start, j.end)} months).`;
    if (c.qtype === "where") {
      return j.location ? `${j.company} (where Ashish was ${j.role}) is in **${j.location}**.` : `His resume doesn't give a location for ${j.company}, where he is ${j.role}; Ashish himself is based in ${contact.location}.`;
    }
    if (j.current) return `Ashish is ${j.role} at ${j.company} (${period(j)}):\n${bullets(j.items.map((i) => `**${i.name}** — ${i.desc}${c.more ? `. Tech: ${i.tech.join(", ")}` : ""}`))}`;
    return `Ashish was ${j.role} at ${j.company}, ${j.location} (${j.start} to ${j.end}, about ${monthsInclusive(j.start, j.end)} months): he built ${join(j.items.map((i) => i.desc))}.`;
  });
  return R(out.join("\n\n"), ["Experience"], { ents: cos });
};

A.experience = (c) => {
  const howMuch = /\b(how much|how many|years|total|long)\b/.test(c.t);
  const lines = bullets(experience.map(jobLine));
  const claim = c.yn && /\b\d+\+? (years?|yrs?)\b/.test(c.t);
  const intro = claim ? "His resume doesn't support a figure like that — it doesn't state total years, and lists two roles:"
    : howMuch ? "Ashish's resume lists two roles (it doesn't state a total years figure):" : "Ashish's work experience:";
  return R(`${intro}\n${lines}`, ["Experience"]);
};

A.hire = () => R(`Ashish is currently ${experience[0].role} at ${experience[0].short} (since ${experience[0].start}). His resume doesn't state availability, so the best way to ask is to contact him directly:\n${bullets([`Email: ${contact.email}`, `LinkedIn: ${contact.linkedin}`, `Phone: ${contact.phone}`])}`, ["Contact"]);

A.projects_list = (c = {}) => c.qtype === "howmany" ? R(`Ashish's site lists **${projects.length} projects** — ${join(projects.map((p) => p.name))} — plus ${experience[0].items.length} production systems at ${cur.short} and the Smart Stream patent.`, ["Projects", "Experience"]) : R(`Ashish's projects:\n${bullets(projects.map((p) => `**${p.name}** — ${p.short}`))}\nPlus production work at ${cur.short} (${join(cur.items.map((i) => i.name))}) and the Smart Stream patent.`, ["Projects", "Experience"]);

A.project_best = () => R(`Ashish doesn't rank his work, but the standouts on his resume are:\n${bullets([
  "**Insurance Document Extraction Platform** (Maaze) — a production Azure + GPT-5 mini system",
  "**WealthMaps** — National 3rd Place at Fueled Contest 2.0 (2024)",
  "**Smart Stream** — a patented IoT water-flow detection system",
])}`, ["Projects", "Experience", "Patent"]);

A.project_detail = (c) => {
  const es = c.ents.filter((e) => e.type === "project");
  const out = es.slice(0, 3).map((e) => {
    const p = POOL.find((x) => x.id === e.item);
    const tech = (p.tech || []).length ? ` Tech: ${p.tech.join(", ")}.` : "";
    const award = p.award ? ` It won: ${p.award}.` : "";
    const where = p.company ? ` (built at ${p.company})` : p.date ? ` (${p.date})` : "";
    if (c.qtype === "when" || c.qtype === "howlong") {
      const j = p.company ? experience.find((x) => x.short === p.company) : null;
      const d = j ? period(j) : p.date;
      return d ? `**${p.name}**: ${d}${p.award ? ` — ${p.award}` : ""}.` : `His resume doesn't give a date for **${p.name}**${p.award ? ` (${p.award})` : ""}.`;
    }
    return `**${p.name}**${where} is ${p.desc}.${tech}${award}`;
  });
  return R(out.join("\n\n"), ["Projects", "Experience"], { ents: es });
};

A.achievements = (c = {}) => R(`${c.qtype === "howmany" ? `Ashish has **${achievements.length} hackathon results** on his resume (plus a patent):` : "Ashish's achievements:"}\n${bullets(achievements.map((a) => `**${a.title}** — ${a.detail}`))}\n- **Patent** — ${patent.title} (${patent.office}, ${patent.year})`, ["Projects", "Patent"]);

A.patent = (c) => {
  const paper = /\b(paper|papers|research|publications?|published|journal)\b/.test(c.t);
  return R(`${paper ? "Ashish's resume lists no research papers, but it does list a patent: " : "Ashish holds a patent: "}**${patent.title}**, Application No. ${patent.number}, ${patent.office}, ${patent.year}. It uses ${patent.desc}.`, ["Patent"], { ents: [ENT.find((e) => e.id === "patent")] });
};

A.edu_overall = (c = {}) => (c.qtype === "when" || c.qtype === "howlong") ? A.edu_grad(c) : R(`Ashish's education:\n${bullets([
  `**${education.degree}**, ${education.school}, ${education.years} — CGPA ${education.cgpa}`,
  `**${education.twelfth.name}**, ${education.twelfth.school}, ${education.twelfth.years} — ${education.twelfth.pct}`,
  `**${education.tenth.name}**, ${education.tenth.school}, ${education.tenth.years} — ${education.tenth.pct}`,
])}`, ["Education"]);
A.edu_cgpa = () => R(`Ashish's CGPA is **${education.cgpa}** in his ${education.degree} at ${education.school} (${education.years}).`, ["Education"]);
A.edu_marks = () => R(`Ashish's academic scores:\n${bullets([`B.Tech: CGPA ${education.cgpa}`, `${education.twelfth.name}: ${education.twelfth.pct}`, `${education.tenth.name} (10th): ${education.tenth.pct}`])}`, ["Education"]);
A.edu_12 = () => R(`Ashish scored **${education.twelfth.pct}** in Higher Secondary (PCM) at ${education.twelfth.school} (${education.twelfth.years}).`, ["Education"]);
A.edu_10 = () => R(`Ashish scored **${education.tenth.pct}** in CBSE (10th) at ${education.tenth.school} (${education.tenth.years}).`, ["Education"]);
A.edu_uni = (c) => {
  const sub = c.ents.find((e) => e.type === "school")?.sub;
  if (sub === "12") return A.edu_12(c);
  if (sub === "10") return A.edu_10(c);
  if (c.qtype === "when" || c.qtype === "howlong") return R(`Ashish's ${education.degree} at ${education.school} runs **${education.years}** (started ${education.years.split("-")[0]}, graduating ${education.gradYear}).`, ["Education"]);
  return R(`Ashish studies at **${education.school}** — ${education.degree}, ${education.years}.`, ["Education"]);
};
A.edu_grad = () => R(`Ashish's ${education.degree} at ${education.school} runs ${education.years}, so his graduation year is **${education.gradYear}**.`, ["Education"]);
A.edu_major = () => R(`Ashish studies **${education.degree}** at ${education.school} (${education.years}).`, ["Education"]);

A.certs = (c = {}) => {
  const es = (c.ents || []).filter((e) => e.type === "skill" || e.type === "field");
  if (es.length) {
    const lines = es.map((e) => {
      const cs = certsOf(e);
      return cs.length ? `${c.yn ? "Yes — " : ""}His ${e.label} certification: **${cs[0].name}**, ${cs[0].by} (${cs[0].date}).`
        : `${c.yn ? "No — " : ""}His resume doesn't list a ${e.label} certification.`;
    });
    if (lines.every((l) => /doesn't list/.test(l))) lines.push(`His certifications: ${join(certifications.filter((x) => x.match.length).map((x) => `${x.name} (${x.by})`))}, plus hackathon certificates from Oriental Group Bhopal and GDSC WOW Kerala.`);
    return R(lines.join("\n"), ["Certifications"], { ents: es });
  }
  if (c.qtype === "howmany") {
    const courses = certifications.filter((x) => x.name !== "Hackathon certificate");
    return R(`**${certifications.length}** — ${courses.length} courses (${join(courses.map((x) => `${x.name}, ${x.by}`))}) and ${certifications.length - courses.length} hackathon certificates (Oriental Group Bhopal, GDSC WOW Kerala).`, ["Certifications"]);
  }
  return certsAll();
};
const certsAll = () => R(`Ashish's certifications:\n${bullets(certifications.map((x) => (x.name === "Hackathon certificate" ? `Hackathon certificate — ${x.by} (${x.date})` : `**${x.name}** — ${x.by} (${x.date})`)))}`, ["Certifications"]);

A.spoken = (c) => {
  const es = c.ents.filter((e) => e.type === "spoken");
  const lvl = spoken.map((s) => `${s.name}${s.level === "beginner" ? " (beginner)" : ""}`);
  if (es.length) {
    return R(es.map((e) => {
      const s = spoken.find((x) => x.name === e.label);
      if (!s) return `${e.label} isn't listed on Ashish's resume. He speaks ${join(lvl)}.`;
      return `Yes — Ashish ${s.level === "fluent" ? `is fluent in ${s.name}` : `has beginner ${s.name}`}.`;
    }).join("\n"), ["About"]);
  }
  if (c.qtype === "howmany" && /\b(speak|spoken|fluent|talk)\b/.test(c.t)) return R(`**${spoken.length}** — fluent English, Hindi and Telugu, plus beginner German.`, ["About"]);
  if (!/\b(speak|spoken|fluent|fluency|bilingual|multilingual|native|tongue|talk|human)\b/.test(c.t)) {
    return R(`Ashish's languages:\n${bullets([`Spoken: fluent in English, Hindi and Telugu; beginner German`, `Programming: ${skills.Languages.join(", ")}`])}`, ["About", "Skills"]);
  }
  return R(`Ashish is fluent in English, Hindi and Telugu, with beginner German.`, ["About"]);
};

const ABROAD = /\b(abroad|international|internationally|overseas|foreign|outside india|travel\w*|countries|country|trip|visited|uae|dubai|exposure)\b/;
A.activities = (c = {}) => {
  if (ABROAD.test(c.t || "")) {
    const a = activities.find((x) => x.id === "ajman");
    return R(`${c.yn ? "Yes — " : ""}Ashish took part in the **${a.org}** in ${a.place} (${a.when}) — the international exposure on his resume.`, ["Activities"]);
  }
  if (/\b(organi[sz]\w*|hosted|host|hosting|ran|run|coordinat\w*|manag\w*)\b/.test(c.t || "")) {
    const org = activities.filter((a) => /Organizer|Manager/.test(a.role));
    return R(`${c.qtype === "howmany" ? `**${org.length}** — ` : c.yn ? "Yes — " : ""}Ashish helped run ${join(org.map((a) => `${a.org} (${a.role}, ${a.when})`))}.`, ["Activities"]);
  }
  return activitiesAll();
};
const activitiesAll = () => R(`Ashish's leadership and activities:\n${bullets(activities.map((a) => `${a.role}, ${a.org}${a.when ? ` (${a.when})` : ""}`))}`, ["Activities"]);
A.activity_detail = (c) => {
  const es = c.ents.filter((e) => e.type === "activity");
  return R(es.map((e) => {
    const a = activities.find((x) => x.id === e.act);
    const verb = { Attendee: "attended the", Participant: "took part in the", Organizer: "was an organizer of the" }[a.role];
    const when = [a.place, a.when].filter(Boolean).join(", ");
    return verb ? `Ashish ${verb} ${a.org}${when ? ` (${when})` : ""}${a.note ? ` — his international exposure` : ""}.` : `Ashish was ${a.role} of ${a.org}${when ? ` (${when})` : ""}.`;
  }).join("\n"), ["Activities"], { ents: es });
};

A.contact = () => R(`You can reach Ashish here:\n${bullets([`Email: ${contact.email}`, `Phone: ${contact.phone}`, `LinkedIn: ${contact.linkedin}`, `GitHub: ${contact.github}`, `Location: ${contact.location}`])}`, ["Contact"]);
A.contact_email = () => R(`Ashish's email is ${contact.email}.`, ["Contact"]);
A.contact_phone = () => R(`Ashish's phone number is ${contact.phone}.`, ["Contact"]);
A.contact_linkedin = () => R(`Ashish's LinkedIn is ${contact.linkedin}.`, ["Contact"]);
A.contact_github = () => R(`Ashish's GitHub is ${contact.github}.`, ["Contact"]);
const OTHER_CITY = /\b(bangalore|bengaluru|mumbai|delhi|noida|gurgaon|gurugram|pune|chennai|kolkata|ahmedabad|usa|uk|london|america|canada|germany|dubai|singapore|europe|office|onsite)\b/;
A.location = (c) => {
  const other = OTHER_CITY.test(c.t);
  const ask = /\b(relocat\w*|remote|onsite|willing|abroad)\b/.test(c.t);
  if (other || ask) return R(`Ashish is based in **${contact.location}**. His resume doesn't mention relocation or remote preferences, so it's best to ask him directly at ${contact.email}.`, ["Contact"]);
  const yn = c.yn && /\b(hyderabad|telangana|india)\b/.test(c.t);
  return R(`${yn ? "Yes — " : ""}Ashish is based in ${contact.location}.`, ["Contact"]);
};
A.resume_dl = () => R(`You can get Ashish's resume with the **Download Resume** button on this site (or press ⌘K / Ctrl+K), or directly: [Ashish_Gattu_Resume_2026.pdf](${resumeUrl}).`, ["Contact"]);

A.out_of_scope = (c) => {
  const ns = notStatedFor(c);
  return ns ? R(nsText(ns, c), ["About", "Contact"]) : R(`That isn't something Ashish's resume covers, so I can't answer it. I can talk about his experience, projects, skills, education or contact details — and for anything else, you can email him at ${contact.email}.`, []);
};

A.more = (c) => {
  const prev = c.prev;
  if (!prev) return A.help(c);
  const fn = A[prev.intent];
  if (!fn) return A.help(c);
  const ents = (prev.ents || []).map((id) => ENT.find((e) => e.id === id)).filter(Boolean);
  const res = fn({ ...c, ents, more: true, yn: false, t: prev.t || "", pad: ` ${prev.t || ""} ` });
  return { ...res, text: res.text, isMore: true };
};
A.where_used = (c) => {
  const prev = c.prev;
  const ents = (prev?.ents || []).map((id) => ENT.find((e) => e.id === id)).filter((e) => e && (e.type === "skill" || e.type === "field"));
  if (!ents.length) return A.projects_list(c);
  return A.projects_by_tech({ ...c, ents });
};

/* ---- Open-ended / meta / not-stated composers ---- */
const cur = experience[0];
const contactLine = `Email ${contact.email} or LinkedIn ${contact.linkedin}.`;
const ONE_LINER = `Ashish Gattu is an AI & ML Engineer — currently ${cur.role} at ${cur.company}, building production LLM and computer-vision systems — with a national 3rd-place hackathon finish and a published patent.`;

A.pitch = (c) => {
  if (/ (one line|one liner|a line|one sentence|a sentence|in a nutshell|tl dr|in short|briefly) /.test(c.pad)) return R(ONE_LINER, ["About"]);
  const hire = /\b(hire|hiring|recruit|consider|considering|choose|pick|shortlist|interview|interviewing|fit|worth)\b/.test(c.t);
  const lines = [
    `Currently **${cur.role} at ${cur.company}** (since ${cur.start}), building production systems: an Azure AI Document Intelligence + GPT-5 mini insurance document-extraction platform, and real-time YOLOv5 video analytics for a US retail franchise`,
    "**National 3rd Place** at Fueled Contest 2.0 (WealthMaps, 2024), plus Most Innovative Project (Parquik) and a national Top 10 (Get-Fit)",
    `A published **patent** — ${patent.title} (${patent.year})`,
    "**Multi-agent / agentic AI** work: HROps (4 LangChain agents) and CyberGPT 2 (multi-agent compliance RAG)",
  ];
  const intro = hire ? "The evidence-based case for Ashish, from his resume:" : "Ashish Gattu is an AI & ML Engineer. The highlights:";
  return R(`${intro}\n${bullets(lines)}${hire ? `\nTo talk to him: ${contactLine}` : ""}`, ["About", "Experience", "Projects"]);
};

A.strengths = () => R(`Ashish's strongest areas, with the evidence:\n${bullets([
  "**Computer vision** — YOLOv5 person detection/tracking in production at Maaze, Parquik (Most Innovative Project), Context-Aware Fashion Advisory",
  "**LLMs & agentic AI** — GPT-5 mini document extraction at Maaze, multi-agent systems (HROps, CyberGPT 2), RAG chatbots at Srinishtha",
  "**Deep learning** — Diffusion Model (DDPM), Emotion S2S speech translation, CNN-based fashion advisory",
  "**Production systems** — both Maaze systems are in production",
])}\nCore stack: Python, PyTorch, TensorFlow, OpenCV, LangChain, Azure.`, ["Skills", "Experience", "Projects"]);

const HELP_EXAMPLES = ["What does he do at Maaze?", "Does he know PyTorch?", "What's his CGPA?", "Any computer vision projects?", "How can I contact him?"];
A.help = (c = {}) => {
  const name = / (your name|you called|call you|name of this bot|name of the bot) /.test(c.pad || "");
  const how = / (how do you work|how does this work|how does this chatbot work|how does it work|are you ai|are you an ai|are you a bot|are you chatgpt|is this chatgpt|is this ai|are you real|are you human|using ai|an llm|use ai|use an llm) /.test(c.pad || "");
  const head = name
    ? "I don't have a name — I'm the resume assistant on Ashish Gattu's portfolio."
    : "I'm a resume assistant for Ashish Gattu.";
  const body = how || name
    ? " I'm not an AI service: I match your question to facts from his resume, right here in your browser (no network calls), so I can only answer what the resume covers."
    : " I answer from his resume only, right here in your browser — no AI service.";
  return R(`${head}${body} Try:\n${bullets(HELP_EXAMPLES)}`, ["About"]);
};
A.name = () => R(`His name is **Ashish Gattu** — an AI & ML Engineer, currently ${cur.role} at ${cur.company}.`, ["About"]);

// Things recruiters ask that the resume does NOT state. Each answer says so plainly, adds the nearest real fact, and offers contact.
const NOT_STATED = [
  { id: "roles", re: /\b(roles?|positions?|jobs?|opportunit\w*|kind of work|type of work|domains?)\b.*\b(looking|seeking|want\w*|target\w*|interested|prefer\w*|aim\w*|aspir\w*|open to)\b|\b(looking|seeking|target\w*|interested|aspir\w*)\b.*\b(roles?|positions?)\b|career goals?|dream job|aspirations?|next role|what does he want to do|\bwhere does he want to (work|go|be)\b|\bwant\w* to work (at|for|in|on|next)\b|\b(work|job|role) next\b|\bnext (job|role|move|step|position)\b/,
    text: `His resume doesn't state target roles. He describes himself as an AI & ML Engineer focused on deep learning, computer vision and agentic AI, and currently works as ${cur.role} at ${cur.short}. For what he's looking for next, ask him: ${contactLine}` },
  { id: "notice", re: /notice period|immediate joiner|join immediately|how soon can he (join|start)|when can he (join|start)|can he (join|start)|joining date|serving notice|start date/,
    text: `His resume doesn't state a notice period or joining date. He's currently ${cur.role} at ${cur.short} (since ${cur.start}) — ask him directly: ${contactLine}` },
  { id: "visa", re: /\b(visa|sponsorship|sponsor|work permit|h1b|green card|citizenship|citizen|work authori[sz]ation|nationality)\b/,
    text: `His resume doesn't state visa or work-authorisation details. He's based in ${contact.location}, India — ask him directly: ${contactLine}` },
  { id: "salary", re: /\b(salary|salaries|ctc|compensation|package|lpa|stipend|pay scale|expected pay|income|earn|earns|earning|hourly rate|rate card)\b/,
    text: `His resume doesn't state salary or compensation expectations — that's best discussed with him directly: ${contactLine}` },
  { id: "age", re: /\bhow old\b|\bage\b|birthday|date of birth|\bdob\b|\bborn\b/,
    text: `His resume doesn't state his age or date of birth. For anything personal, ask him directly: ${contactLine}` },
  { id: "hobbies", re: /\bhobb\w*|free time|spare time|for fun|weekends?|pastimes?|passions?\b/,
    text: `His resume doesn't list hobbies. Outside work it lists leadership and activities — Technology Club, organizing hackathons (Udhgam, MARK XXIV) and the Ajman University study tour. Ask him for more: ${contactLine}` },
  { id: "gpaconv", re: /\b(cgpa|gpa)\b.*\b(percent\w*|out of 10|10 point|scale of 10|convert\w*|equivalent)\b|\b(percent\w*|out of 10|10 point)\b.*\b(cgpa|gpa)\b/,
    text: `His CGPA is **${education.cgpa}** (${education.degree}, ${education.school}); the resume doesn't state a percentage or 10-point conversion.` },
  { id: "title", re: /\bis (he|ashish) (an? )?(data scientist|data analyst|data engineer|software engineer|software developer|sde|swe|researcher|research scientist|ml engineer|machine learning engineer|ai engineer|ai ml engineer|ai and ml engineer|mlops engineer|devops engineer|architect|product manager|computer vision engineer|cv engineer|nlp engineer|llm engineer|prompt engineer)\b/,
    text: (c) => {
      const m = c.t.match(/\bis (?:he|ashish) (?:an? )?([a-z ]+?(?:scientist|analyst|engineer|developer|sde|swe|researcher|architect|manager))\b/);
      const t = m ? m[1] : "that";
      if (/^(ai|ml|machine learning|ai ml|ai and ml) engineer$/.test(t)) return `${c.yn ? "Yes — " : ""}Ashish is an AI & ML Engineer; his current title is ${cur.role} at ${cur.company} (since ${cur.start}).`;
      return `His resume doesn't give him the title "${t}". He's an AI & ML Engineer — currently ${cur.role} at ${cur.company} (since ${cur.start}) — so judge the fit from his work: ask about his projects or skills.`;
    } },
  { id: "senior", re: /\b(senior|junior|lead|principal|staff|mid level|entry level)\s+(engineer|developer|dev|ml engineer|ai engineer|data scientist|level|role)\b|\bseniority\b|\bis (he|ashish) (a )?(senior|junior)\b/,
    text: `His title is ${cur.role} at ${cur.company} (since ${cur.start}); the resume doesn't state a seniority level. His earlier role was AI Intern at Srinishtha Technologies (Dec 2024 to Sep 2025).` },
  { id: "traits", re: /\b(team player|weakness\w*|personality|soft skills?|work ethic|attitude|hard ?working|punctual|reliable|leadership style|culture fit|introvert\w*|extrovert\w*|temperament|character|strengths and weaknesses|how does he handle|under pressure|work under)\b/,
    text: `His resume doesn't describe personal traits like that — it sticks to work, projects and results. It does show team settings (two roles, hackathon teams, organizing Udhgam and MARK XXIV). For this, an interview or a chat with him works best: ${contactLine}` },
  { id: "refs", re: /\b(references?|referees?|recommendation letters?|lor)\b/,
    text: `His resume doesn't list references — ask him directly: ${contactLine}` },
  { id: "personal", re: /\b(married|marital|wife|girlfriend|boyfriend|relationship|single|dating|religion|caste|gender|family|parents|siblings|height|weight|politics|political)\b|how tall/,
    text: `That isn't something Ashish's resume covers, so I can't answer it. For anything personal, ask him directly at ${contact.email}.` },
];
const notStatedFor = (c) => NOT_STATED.find((n) => n.re.test(c.t));
const nsText = (n, c) => (typeof n.text === "function" ? n.text(c) : n.text);
A.not_stated = (c) => R(nsText(notStatedFor(c) || NOT_STATED[0], c), ["About", "Contact"]);

A.case_study = (c) => {
  const realQ = c.yn && /\b(real|actual|genuine|client|confidential|true|authentic)\b/.test(c.t);
  const lead = realQ ? "No — the data in it is illustrative and fictional (real client documents are confidential). " : "";
  return R(`${lead}The **Case Study** section is an illustrative demo of Ashish's Insurance Document Extraction work at ${cur.short}: ${join(caseStudy.stages)}. The sample shown (${caseStudy.sample}) uses fictional data — ${caseStudy.note.split(". ")[1].toLowerCase()}`, ["Case Study", "Experience"], { ents: [ENT.find((e) => e.id === "c-maaze")] });
};

// "did he work at Google?" — an employer not on the resume.
const ORG_SKIP = new Set(["a", "an", "the", "his", "him", "my", "our", "your", "their", "any", "some", "home", "it", "this", "that", "maaze", "srinishtha", "all", "least", "once", "present", "moment", "night", "scale", "speed", "pace", "same"]);
const orgAsked = (c) => {
  const m = c.pad.match(/ (?:work|worked|working|intern|interned|interning|employed|job|jobs) (?:at|for) ([a-z0-9]+)/);
  if (!m || ORG_SKIP.has(m[1])) return null;
  return ENT.some((e) => e.type === "company" && e.aliases.some((a) => normAlias(a).split(" ")[0] === m[1])) ? null : m[1];
};
// "what did he do in 2025?" — everything on the resume dated in that year.
const yearsOf = (str) => {
  const ys = String(str || "").match(/\b20\d\d\b/g) || [];
  if (/present/i.test(str) && ys.length) ys.push("2026");
  if (ys.length >= 2) { const out = []; for (let y = +ys[0]; y <= +ys[ys.length - 1]; y++) out.push(String(y)); return out; }
  const two = String(str || "").match(/\b(20\d\d)-(\d\d)\b/);
  return two ? [two[1], `20${two[2]}`] : ys;
};
A.timeline = (c) => {
  const y = c.t.match(/\b20[12]\d\b/)[0];
  const rows = [];
  for (const j of experience) if (yearsOf(`${j.start} ${j.end === "Present" ? "Present" : j.end}`).includes(y)) rows.push(`${j.role} at ${j.company} (${period(j)})`);
  for (const p of projects) if (yearsOf(p.date).includes(y)) rows.push(`${p.name} (${p.date}${p.award ? `; ${p.award}` : ""})`);
  if (patent.year === y) rows.push(`Patent filed: ${patent.title}`);
  for (const a of activities) if (yearsOf(a.when).includes(y)) rows.push(`${a.role}, ${a.org}`);
  for (const x of certifications) if (yearsOf(x.date).includes(y)) rows.push(x.name === "Hackathon certificate" ? `Hackathon certificate — ${x.by}` : `Certification: ${x.name} (${x.by})`);
  if (yearsOf(education.years).includes(y)) rows.unshift(`${education.degree} at ${education.school} (${education.years})`);
  if (!rows.length) return R(`Nothing on Ashish's resume is dated ${y}.`, ["About"]);
  return R(`On Ashish's resume for **${y}**:\n${bullets(rows)}`, ["Experience", "Projects", "Activities"]);
};

// "is Smart Stream computer vision?", "does HROps use React?" — checks the item's verified tags / tech.
A.item_check = (c) => {
  const ie = c.ents.find((e) => e.type === "project" || e.type === "patent");
  const p = POOL.find((x) => x.id === (ie.type === "patent" ? "patent" : ie.item));
  const lines = c.ents.filter((e) => e.type === "skill" || e.type === "field").slice(0, 3).map((e) => {
    const ok = e.tag ? (p.tags || []).includes(e.tag) : patsOf(e).some((pt) => p.norm.includes(` ${pt} `));
    if (ok) return `Yes — ${p.name} involves ${e.label}: ${p.short}.`;
    const elsewhere = placesOf(e).filter((x) => x !== p);
    return `No — ${p.name} isn't ${e.label} work (${p.short}).` + (elsewhere.length ? ` His ${e.label} work is in ${join(elsewhere.slice(0, 4).map((x) => x.label))}.` : "");
  });
  return R(lines.join("\n"), ["Projects", "Experience"], { ents: c.ents });
};

A.employer_check = (c) => {
  const org = orgAsked(c);
  const name = org ? (org.length <= 3 ? org.toUpperCase() : cap(org)) : "that company";
  return R(`${c.yn ? "No — " : ""}Ashish's resume doesn't list ${name}. His roles are ${cur.role} at ${cur.company} (${cur.start} to present) and AI Intern at Srinishtha Technologies (Dec 2024 to Sep 2025).`, ["Experience"]);
};

// "does he have a PhD / masters?" — degree level check.
A.degree_check = (c) => {
  if (/\b(bachelors?|undergrad\w*|btech|b tech|engineering degree)\b/.test(c.t)) return R(`${c.yn ? "Yes — " : ""}Ashish has a **${education.degree}** from ${education.school} (${education.years}), CGPA ${education.cgpa}.`, ["Education"]);
  return R(`${c.yn ? "No — " : ""}Ashish's highest listed degree is a **${education.degree}** from ${education.school} (${education.years}); no postgraduate degree is listed.`, ["Education"]);
};

/* ------------------------------------------------------------------ */
/* Intent table                                                        */
/* ------------------------------------------------------------------ */
const QW = /\b(does|did|do|has|have|had|can|could|is|are|was|will|would|any|know|knows|familiar|experience|experienced|expertise|proficient|worked|used|use|uses|using|skilled|good|expert|hands|comfortable|work)\b/;
const hasEnt = (c, ...types) => c.ents.some((e) => types.includes(e.type));
const hasOwn = (c, ...types) => !c.inherited && hasEnt(c, ...types);
const projWord = / (projects?|built|build|made|developed|created|apps?|applications?|anything|something|examples?|portfolio) /;

const INTENTS = [
  { id: "greeting", w: { yo: 5, hi: 5, hello: 5, hey: 5, hola: 5, namaste: 5, greetings: 5, morning: 3, evening: 3, afternoon: 3 }, p: { "what is up": 5, "how are you": 3, "good morning": 5, "good evening": 5, "good afternoon": 5, "you there": 7, "anyone there": 7, "anybody there": 7 }, short: 3 },
  { id: "thanks", w: { thanks: 5, thank: 5, appreciated: 4, awesome: 2, great: 2, cool: 2, nice: 2, okay: 2, perfect: 2, helpful: 3 }, short: 3 },
  { id: "goodbye", w: { bye: 6, goodbye: 6, cya: 6, farewell: 6, later: 2, night: 2 }, p: { "see you": 5, "good night": 6, "take care": 5 } },
  { id: "help", w: { help: 5, commands: 3, options: 2 }, p: { "what can you do": 7, "what can i ask": 7, "how does this work": 6, "who are you": 7, "what are you": 7, "are you a bot": 7, "are you ai": 7, "are you real": 7, "are you human": 7, "what do you know": 6, "how do i use": 5, "what should i ask": 7, "what questions": 5, "example questions": 6, "are you chatgpt": 7, "how do you work": 6, "your name": 9, "who made you": 8, "who built you": 8, "who created you": 8, "is this chatgpt": 9, "is this ai": 8, "are you an ai": 9, "how does this chatbot work": 9, "how does this bot work": 9, "how does it work": 5, "is this a bot": 9, "what is this chatbot": 9, "what is this bot": 9, "are you an llm": 9, "do you use ai": 9 } },
  { id: "help_self", alias: "help", w: {}, boost: (c) => (/ (this|the|you|your|ur) (assistant|chatbot|bot|chat|widget) | are (you|u) (a |an )?(human|bot|ai|real|robot|person|machine|llm) /.test(c.pad) && !hasOwn(c, "field", "skill", "project") ? 9 : 0) },
  { id: "about", w: { introduce: 5, introduction: 4, summary: 5, overview: 5, profile: 3, bio: 4, biography: 4, describe: 3, pitch: 5, intro: 4, background: 4 },
    p: { "who is ashish": 7, "who is he": 7, "who is this": 6, "who is the owner": 7, "who is the ashish": 7, "about ashish": 4, "about him": 4, "tell me about him": 6, "tell me about ashish": 6, "tell me about yourself": 7, "about yourself": 7, "introduce yourself": 7, "elevator pitch": 7, "in a nutshell": 5, "in short": 3, "one line": 4, "who are you": 0, "describe ashish": 6, "what is ashish like": 5, "know about ashish": 5, "know about him": 5, "tell me something about": 4, "tell me about": 3 },
    boost: (c) => (c.ents.length && !/ashish| he | him /.test(c.pad) ? -4 : 0) + (c.ents.length ? -3 : 0)
      + (/ (kind|type|sort) of (engineer|developer|professional|person|guy|profile|candidate) | like as an? (engineer|developer|person|candidate) /.test(c.pad) && !c.ents.length ? 8 : 0) },
  { id: "current_role", w: { currently: 4, current: 3, present: 2, employed: 5, employer: 4, job: 2, working: 2, workplace: 5, designation: 5, occupation: 5, profession: 5, presently: 4, unemployed: 5, jobless: 5 },
    p: { "where does he work": 7, "where does ashish work": 7, "where do you work": 7, "where is he working": 7, "where is he employed": 7, "what does he do": 5, "what do you do": 5, "what is he doing": 5, "what is his role": 6, "what is his job": 6, "what is your role": 6, "what is your job": 6, "job title": 6, "right now": 3, "at the moment": 3, "his company": 3, "which company": 4, "what company": 4, "for a living": 6, "does he have a job": 6, "has he got a job": 6, "is he working": 6, "is ashish working": 6, "is he working somewhere": 7, "is ashish working somewhere": 7, "does he work anywhere": 7, "does he work somewhere": 7, "is he employed": 7, "is he unemployed": 7, "his position": 3, "his role": 3, "current role": 6, "current job": 6, "what is he up to": 4, "up to": 3, "lately": 4, "these days": 5, "recently": 3, "doing now": 4, "what does he do now": 7, "what is ashish doing": 5, "who does he work for": 7, "where is ashish working": 7, "who is his employer": 7, "his work": 2 },
    boost: (c) => (hasEnt(c, "company") ? -4 : 0) },
  { id: "company", w: {}, boost: (c) => (hasEnt(c, "company") ? 6 : 0) },
  { id: "experience", w: { experience: 3, career: 4, professional: 3, employment: 4, internships: 3, jobs: 4, roles: 3, companies: 4, previously: 3, worked: 2, tenure: 4, duration: 3, seniority: 3 },
    p: { "work history": 7, "previous job": 6, "previous jobs": 7, "past jobs": 7, "previous companies": 7, "past experience": 6, "work experience": 7, "professional experience": 7, "how much experience": 8, "how many years": 6, "years of experience": 8, "how long has he": 5, "how long has ashish": 5, "since when": 5, "when did he join": 6, "when did he start": 6, "where has he worked": 7, "where did he work": 7, "where has ashish worked": 7, "his experience": 4, "his jobs": 4, "employment history": 7, "career so far": 6, "how experienced": 6, "is he experienced": 6, "is he a fresher": 7, "fresher": 5, "years of work": 6, "worked before": 5, "job history": 7, "how long": 3 },
    boost: (c) => (hasEnt(c, "company", "skill", "field") ? -5 : 0) },
  { id: "hire", w: { hire: 6, hiring: 6, recruit: 6, recruiter: 6, recruiting: 6, available: 4, availability: 6, opportunity: 4, opportunities: 4, freelance: 6, freelancing: 6, collaborate: 5, collaboration: 5, openings: 4, "notice": 4, "join": 2, interview: 4, consider: 2, vacancy: 3, onboard: 3 },
    p: { "open to work": 7, "open to opportunities": 7, "looking for a job": 6, "looking for work": 6, "work with him": 4, "work with ashish": 4, "work together": 4, "job offer": 6, "join my team": 6, "join our team": 6, "join us": 4, "how do i hire": 8, "how can i hire": 8, "want to hire": 8, "would like to hire": 8, "can i hire": 8, "is he available": 7, "notice period": 6, "immediate joiner": 6, "ready to join": 6, "open for work": 7, "open to offers": 7 },
    boost: (c) => (hasEnt(c, "skill", "field") ? -2 : 0) + (/\b(looking|searching|hunting|open)\b.*\b(job|jobs|work|opportunit\w*|change|switch|offers?)\b/.test(c.t) && !/\b(remote|remotely|relocat\w*|onsite|hybrid|office)\b/.test(c.t) ? 7 : 0) },
  { id: "skill_check", w: {}, boost: (c) => {
    if (!hasEnt(c, "skill", "field")) return 0;
    let s = 3;
    if (QW.test(c.t)) s += 2;
    if (projWord.test(c.pad)) s -= 3;
    if (/\b(frameworks?|libraries|library|tools?|skills?|technologies|languages?)\b/.test(c.t)) s -= 2;
    return s;
  } },
  { id: "skill_unknown", w: {}, p: { "does he know": 4, "do you know": 4, "does ashish know": 4, "has he used": 4, "have you used": 4, "is he familiar with": 5, "experience with": 4, "experience in": 3, "can he use": 4, "is he proficient in": 5, "is he good at": 5, "skilled in": 4, "expert in": 4, "does he use": 4, "has he worked with": 5, "has he worked on": 4, "does he have experience": 4, "familiar with": 4, "knowledge of": 4, "can he code in": 5, "can he program in": 5, "is he good with": 5 },
    boost: (c) => (c.ents.length ? -10 : 0) + (c.objectless ? -10 : 0) },
  { id: "skills_list", w: { skills: 4, skill: 3, technologies: 4, technology: 2, tools: 4, tooling: 4, frameworks: 5, framework: 4, libraries: 5, library: 3, toolkit: 4, expertise: 3, strengths: 3, proficiencies: 4, competencies: 4, techniques: 3, software: 2, techstack: 4, programming: 4, coding: 3 },
    p: { "tech stack": 7, "his stack": 5, "what stack": 6, "stack does he use": 7, "what does he know": 5, "what can he do": 5, "what technologies": 6, "what tools": 6, "which tools": 6, "which frameworks": 7, "what frameworks": 7, "ml frameworks": 7, "programming languages": 7, "coding languages": 7, "technical skills": 7, "key skills": 7, "core skills": 7, "strong at": 4, "which languages does he code": 6, "languages does he code": 6, "cloud skills": 6, "cloud platforms": 6, "which cloud": 6, "what cloud": 6, "what libraries": 7, "what ai skills": 7, "ai skills": 6, "ml skills": 6, "data tools": 7, "dev tools": 7, "what software": 5, "technical expertise": 7, "known languages": 4, "what languages": 3, "tools does he use": 7, "stack does he": 7, "what does he use": 5 },
    boost: (c) => (hasEnt(c, "company", "project") ? -3 : 0) + (/ (frameworks?|libraries|library|tools?|skills?|technologies) /.test(c.pad) && hasEnt(c, "field") && !hasEnt(c, "skill") ? 3 : 0) + (hasOwn(c, "skill") && !/ (what|which|list|all) /.test(c.pad) ? -4 : 0) + (/\b(speak|spoken|fluent)\b/.test(c.t) ? -6 : 0) },
  { id: "projects_list", w: { projects: 4, portfolio: 4, builds: 3, creations: 3, "side": 1 },
    p: { "what has he built": 7, "what did he build": 7, "what has ashish built": 7, "what have you built": 7, "what has he made": 7, "what has he developed": 7, "personal projects": 7, "side projects": 7, "his projects": 6, "list projects": 7, "all projects": 7, "show me projects": 7, "show projects": 7, "what projects": 7, "which projects": 6, "any projects": 6, "work samples": 7, "what apps": 4, "tell me about his projects": 8, "projects he has done": 7, "projects done": 6, "what has he worked on": 6, "what did he work on": 6, "things he built": 6, "previous projects": 7, "past projects": 7, "other projects": 6, "more projects": 6 },
    boost: (c) => (hasEnt(c, "project", "company", "skill", "field", "patent") ? -9 : 0) },
  { id: "project_best", w: { best: 2, impressive: 4, proudest: 5, flagship: 5, standout: 5, biggest: 3, favorite: 2, highlight: 3, highlights: 3, greatest: 3, notable: 3, signature: 3, strongest: 4, hardest: 4, toughest: 4, challenging: 3, coolest: 5, nicest: 5, finest: 5, smartest: 5, craziest: 5, largest: 4, neatest: 5 },
    p: { "best project": 8, "top project": 8, "most impressive": 8, "main project": 7, "favorite project": 8, "proudest project": 8, "biggest project": 8, "key project": 7, "major project": 7, "flagship project": 8, "most notable": 7, "best work": 6, "best thing": 5, "stand out": 3, "most significant": 7, "most important project": 8, "highlight project": 7, "best one": 4, "which project is best": 8, "most challenging": 7, "technically challenging": 7, "most complex project": 8, "pick a project": 4, "most complex": 5, "most interesting": 5, "your best": 4, "his best": 4, "star project": 7 },
    boost: (c) => (hasOwn(c, "project", "company") ? -5 : 0) + (hasOwn(c, "skill", "field") ? -3 : 0) + (projWord.test(c.pad) && /\b(best|strongest|top|most|biggest|greatest|proudest|hardest|toughest|coolest|nicest|finest|smartest|craziest|largest|neatest)\b/.test(c.t) && !/\b(win|won|award\w*|prize|innovative|place|rank\w*|hackathons?)\b/.test(c.t) ? 4 : 0)
      + (/\b(skills?|areas?|abilit\w*|suit|strengths?)\b/.test(c.t) && !projWord.test(c.pad) ? -6 : 0) },
  { id: "project_detail", w: {}, boost: (c) => (hasEnt(c, "project") ? 6 : 0) },
  { id: "projects_by_tech", w: {}, boost: (c) => (hasEnt(c, "skill", "field") && projWord.test(c.pad) ? 8 : 0) + (hasEnt(c, "skill", "field") && / (which|what) (project|projects|work|ones) /.test(c.pad) ? 3 : 0) },
  { id: "achievements", w: { achievements: 6, achievement: 6, awards: 6, award: 6, hackathons: 6, hackathon: 6, win: 3, wins: 4, won: 4, winner: 5, prize: 5, prizes: 5, rank: 5, ranking: 5, ranked: 5, podium: 5, recognition: 5, honors: 5, accomplishments: 6, accomplishment: 6, trophy: 4, medals: 4, medal: 4, competitions: 5, competition: 5, contests: 4, contest: 3, achieved: 5, accolades: 6, finalist: 5, victories: 5 },
    p: { "national rank": 8, "did he win": 7, "did you win": 7, "has he won": 7, "any awards": 8, "hackathon wins": 8, "hackathon results": 8, "third place": 6, "3rd place": 6, "top 10": 5, "most innovative": 5, "what has he achieved": 8, "proud of": 3 },
    boost: (c) => (hasEnt(c, "project", "company") ? -2 : 0) + (hasEnt(c, "activity") ? -3 : 0) + (/\b(organi[sz]\w*|hosted|coordinat\w*|volunteer\w*)\b/.test(c.t) ? -6 : 0) },
  { id: "patent", w: { patent: 4, patents: 4, publications: 6, publication: 6, published: 4, research: 4, papers: 5, paper: 4, journal: 5, ip: 2, innovation: 2, invention: 4, inventions: 4, arxiv: 5, scholar: 4, citations: 5 }, p: { "intellectual property": 7, "research paper": 8, "research papers": 8, "any research": 7, "any publications": 8, "published any": 7, "has he published": 8, "smart stream": 7 }, boost: (c) => (hasEnt(c, "patent") ? 5 : 0) },
  { id: "edu_overall", w: { education: 5, educational: 5, qualifications: 6, qualification: 6, academics: 6, academic: 4, degree: 4, degrees: 4, college: 4, schooling: 5, studies: 4, studied: 3, study: 3, student: 3, btech: 4, graduate: 2, university: 3, school: 3, major: 1 }, p: { "educational background": 8, "academic background": 8 },
    boost: (c) => (hasEnt(c, "school") ? -4 : 0) },
  { id: "edu_cgpa", w: { cgpa: 8, gpa: 8, sgpa: 8, cpi: 7, grade: 3, grades: 5, gradepoint: 6, rank: 0 }, p: { "grade point": 7, "college score": 6, "btech score": 7, "btech marks": 7, "btech percentage": 7, "university marks": 6, "academic performance": 6, "how good are his grades": 8, "college grades": 8, "university grades": 8, "his grades": 5 } },
  { id: "edu_marks", w: { marks: 5, percentage: 5, percent: 5, percentages: 6, score: 3, scores: 4, results: 3, academically: 3, toppers: 3 }, p: { "how smart": 4, "how did he score": 7, "how much did he score": 7, "board marks": 7, "all marks": 7, "his marks": 5, "his percentage": 5 },
    boost: (c) => (/ (12th|10th|twelfth|tenth|cbse|pcm|intermediate|plus two|higher secondary|btech|cgpa) /.test(c.pad) ? -4 : 0) },
  { id: "edu_12", w: { "12th": 8, twelfth: 8, intermediate: 7, pcm: 8, xii: 7, inter: 3, narayana: 6, plus: 0, hsc: 7, puc: 6 }, p: { "higher secondary": 8, "class 12": 8, "grade 12": 8, "plus two": 8, "junior college": 7, "12th class": 8, "12th grade": 8, "senior secondary": 8, "board exams 12": 6, "pre university": 7 } },
  { id: "edu_10", w: { "10th": 8, tenth: 8, cbse: 8, ssc: 7, matric: 7, matriculation: 7, andrews: 6, xth: 7, icse: 5 }, p: { "class 10": 8, "grade 10": 8, "secondary school": 7, "10th class": 8, "10th grade": 8, "high school": 6, "school marks": 6, "school percentage": 7, "board exams": 4 } },
  { id: "edu_uni", w: { woxsen: 6 }, p: { "which university": 8, "which college": 8, "what university": 8, "what college": 8, "university name": 8, "college name": 8, "where does he study": 8, "where did he study": 8, "where is he studying": 8, "where do you study": 8, "which school": 5, "alma mater": 8, "studying at": 6, "his university": 7, "his college": 7, "which institute": 8, "which institution": 8, "where did he graduate from": 8 }, boost: (c) => (c.ents.some((e) => e.type === "school" && e.sub === "uni") ? 3 : 0) + (c.ents.some((e) => e.type === "school" && e.sub !== "uni") ? 6 : 0) },
  { id: "edu_grad", w: { "graduat*": 8, graduates: 8, graduating: 8, graduation: 8, graduated: 8, passout: 8, batch: 5, convocation: 6, finishes: 5, finish: 5, completes: 4, completion: 3 }, p: { "pass out": 8, "passing out": 8, "year of passing": 8, "end of degree": 7, "when does he finish": 8, "when will he finish": 8, "when does he complete": 8, "degree end": 7, "when does his degree": 8, "which year does he graduate": 9, "when will he graduate": 9, "graduation year": 9, "joined university": 5, "when did he finish": 7, "when did he complete": 7, "batch of": 8 } },
  { id: "edu_major", w: { major: 6, specialization: 7, branch: 6, stream: 5, discipline: 6, "specialisation": 7, field: 1, minor: 4 }, p: { "what did he study": 7, "what does he study": 7, "what is he studying": 8, "what are you studying": 8, "what do you study": 8, "degree in": 7, "field of study": 8, "which degree": 7, "what degree": 8, "which course is he": 7, "is he an engineer": 7, "which btech": 8, "btech in": 8, "what is his degree": 8, "what is his major": 9, "studying what": 7, "subject he studied": 8, "what did ashish study": 8, "which branch": 8, "what branch": 8 } },
  { id: "certs", w: { certification: 8, certifications: 8, certificate: 7, certificates: 7, certified: 7, courses: 6, coursera: 7, udemy: 6, edx: 6, nptel: 6, licenses: 4, credentials: 5, badges: 4, "course": 3, "certs": 8 }, p: { "online courses": 8, "uc davis": 7, "deeplearning ai": 7, "uc san diego": 7, "university of zurich": 7, "intuitive introduction to probability": 8, "object oriented programming in java": 8, "any courses": 7, "courses taken": 7, "courses completed": 7, "has he taken": 4, "completed any course": 8 },
    boost: (c) => (hasEnt(c, "skill", "field") && !/ (certification|certifications|certificate|certificates|certified|courses|course|coursera) /.test(c.pad) ? -6 : 0) },
  { id: "spoken", w: { speak: 6, speaks: 6, spoken: 6, fluent: 6, fluency: 6, bilingual: 7, multilingual: 7, tongue: 6, languages: 3, language: 3, linguistic: 5 }, p: { "mother tongue": 8, "native language": 8, "which languages": 3, "what languages does he speak": 9, "languages spoken": 9, "human languages": 8, "speak english": 8, "can he speak": 7, "does he speak": 8, "does he know english": 4, "can he communicate": 4 },
    boost: (c) => (hasEnt(c, "spoken") ? 5 : 0) + (/ (programming|coding|code|prog) /.test(c.pad) ? -6 : 0) },
  { id: "activities", w: { activities: 6, extracurricular: 8, extracurriculars: 8, extracurricularactivities: 8, leadership: 6, clubs: 6, club: 5, events: 4, event: 3, organized: 5, organizer: 5, organizing: 5, volunteer: 5, volunteering: 5, societies: 5, curricular: 6, exposure: 4, abroad: 6, overseas: 6, travel: 4, travelled: 6, traveled: 6, trip: 4, uae: 6, dubai: 6, summit: 5, responsibility: 4, responsibilities: 3, involvement: 5, community: 3, executive: 4, leader: 4, manager: 3 }, p: { "international exposure": 8, "positions of responsibility": 9, "any leadership": 8, "study tour": 7, "events organized": 8, "events has he organized": 8, "outside of work": 5, "beyond academics": 8, "outside academics": 8, "co curricular": 8, "what else does he do": 4, "other than work": 5, "any clubs": 8, "was he part of": 5, "is he part of": 5, "member of": 4, "team lead": 3 }, boost: (c) => (hasEnt(c, "activity") ? -2 : 0) + (/\b(lead|leading|led|leader|manag\w*|mentor\w*|head\w*)\b.*\b(people|team|teams|others|members|juniors|group)\b|\bleadership\b/.test(c.t) ? 6 : 0)
      + (/\b(organi[sz]\w*|hosted|host|hosting|ran|run|coordinat\w*|volunteer\w*)\b/.test(c.t) ? 6 : 0) },
  { id: "activity_detail", w: {}, boost: (c) => (hasEnt(c, "activity") ? 6 : 0) },
  { id: "contact_email", w: { email: 7, emails: 7, mail: 6, gmail: 7, inbox: 5, emailid: 7 }, p: { "e mail": 7, "email id": 8, "mail id": 8, "email address": 8, "mail address": 8 }, boost: (c) => (/ (phone|number|linkedin|github) /.test(c.pad) ? -4 : 0) },
  { id: "contact_phone", w: { phone: 7, mobile: 7, whatsapp: 7, telephone: 7, cell: 5, call: 5, number: 5, dial: 5, sms: 4, text: 1 }, p: { "contact number": 8, "phone number": 9, "mobile number": 9, "ph no": 8, "can i call": 8, "call him": 8, "call ashish": 8 }, boost: (c) => (/ (email|mail|linkedin|github) /.test(c.pad) ? -4 : 0) },
  { id: "contact_linkedin", w: { linkedin: 8, linkedln: 8, "linked": 3 }, p: { "linked in": 8 } },
  { id: "contact_github", w: { github: 4, gitlab: 5, repo: 5, repos: 5, repositories: 5, repository: 5, opensource: 4 }, p: { "git hub": 5, "github profile": 8, "github link": 8, "github url": 8, "github account": 8, "github handle": 8, "github username": 8, "his github": 7, "your github": 7, "source code": 4, "code samples": 5, "open source": 4 },
    boost: (c) => (/ (does|did|has|have|can|is|know|use|uses|used|skilled|familiar|experience) /.test(c.pad) && !/ (profile|link|url|account|handle|username|repo|repos|his github|your github) /.test(c.pad) ? -4 : 0) },
  { id: "location", w: { location: 6, based: 6, located: 6, city: 5, hyderabad: 6, telangana: 6, india: 3, relocate: 6, relocation: 6, relocating: 6, remote: 4, onsite: 4, hybrid: 3, reside: 6, resides: 6, live: 4, lives: 4, living: 4, stay: 3, stays: 3, country: 4, hometown: 6, commute: 4, timezone: 4, address: 5 }, p: { "where is he from": 8, "where is he based": 9, "where are you based": 9, "where does he live": 9, "where is he located": 9, "where is ashish": 6, "where is he": 5, "where do you live": 9, "where are you from": 8, "is he in": 6, "which city": 8, "what city": 8, "which country": 8, "work remotely": 6, "open to relocation": 8, "willing to relocate": 9, "move to": 7, "willing to move": 8, "shift to": 6, "move cities": 8 }, boost: (c) => (OTHER_CITY.test(c.t) ? 7 : / (work|working|employed|employer|company) /.test(c.pad) && !/ (based|located|live|lives|city|relocat\w*|remote|remotely|hybrid|onsite|wfh) /.test(c.pad) ? -5 : 0) },
  { id: "contact", w: { contact: 6, reach: 6, touch: 4, connect: 4, message: 4, socials: 5, social: 3, links: 4, dm: 4, ping: 4, handles: 4, details: 1 }, p: { "get in touch": 8, "how can i reach": 9, "how do i reach": 9, "how to reach": 9, "how to contact": 9, "contact details": 9, "contact info": 9, "contact information": 9, "talk to him": 6, "speak to him": 6, "talk to ashish": 6, "write to him": 6, "how can i contact": 9, "how do i contact": 9, "how can i connect": 8, "reach out": 7, "social media": 6, "contact him": 8 }, boost: (c) => (/ (email|phone|linkedin|github|resume|number|mail) /.test(c.pad) ? -3 : 0) },
  { id: "resume_dl", w: { resume: 2, cv: 3, download: 6, pdf: 6, vitae: 6, curriculum: 5, attach: 3 }, p: { "get his resume": 9, "get his cv": 9, "his resume": 5, "his cv": 5, "your resume": 5, "your cv": 5, "send resume": 9, "send me his resume": 9, "send me the resume": 9, "share his resume": 9, "resume pdf": 9, "download resume": 9, "download cv": 9, "download his": 8, "resume download": 9, "copy of his resume": 9, "copy of resume": 9, "can i get": 2, "can i have": 2, "can i see his resume": 9, "see his resume": 8, "view resume": 8, "full resume": 6, "resume link": 9 }, boost: (c) => (hasEnt(c, "skill", "field") ? -4 : 0) },
  { id: "out_of_scope", w: { salary: 8, ctc: 8, pay: 3, earn: 5, earns: 5, earning: 5, compensation: 8, income: 6, age: 4, old: 3, birthday: 8, dob: 8, married: 8, marital: 8, wife: 8, girlfriend: 8, boyfriend: 8, relationship: 8, single: 5, dating: 8, religion: 8, caste: 8, politics: 8, political: 8, election: 8, weather: 8, joke: 8, jokes: 8, recipe: 8, movie: 6, movies: 6, cricket: 6, football: 6, bitcoin: 7, crypto: 7, stocks: 6, hobbies: 7, hobby: 7, pizza: 8, food: 6, music: 6, song: 6, politician: 8, president: 6, capital: 5, news: 4, sports: 6, gossip: 8, height: 6, weight: 4, salary_expectation: 8, visa: 6, passport: 6, references: 4, reference: 3, gender: 6, family: 6, parents: 6, siblings: 6, brother: 6, sister: 6, "stock": 4, lottery: 8, horoscope: 8, instagram: 4, insta: 4, twitter: 3, facebook: 5, pets: 6, "address": 0, solve: 6, calculate: 6, translate: 4, poem: 8, essay: 8, homework: 8, diet: 6, workout: 3, "net": 0, worth: 3, bank: 5, loan: 6, "ceo": 2, "prime": 4, minister: 8, trivia: 8, riddle: 8, "math": 5, "equation": 6, "wifi": 5, password: 8, hack: 3, "meaning": 3, "life": 3, "love": 4, "crush": 8, "sex": 8, "drugs": 8, "alcohol": 8, "smoke": 6 },
    p: { "write me": 8, "write a": 6, "write an": 6, "can you write": 8, "write code": 3, "give me code": 8, "how much does he earn": 9, "how old": 9, "what is the capital": 9, "who is the president": 9, "who is the prime minister": 9, "who won the": 7, "tell me a joke": 9, "expected salary": 9, "what is his salary": 9, "what is your salary": 9, "do you like": 6, "what is his favorite": 7, "what is your favorite": 7, "notice period": 0, "meaning of life": 9, "what is the weather": 9, "are you married": 9, "is he married": 9, "is he single": 9, "who is elon musk": 9, "what is the time": 7, "what time is it": 7, "stock price": 8, "cover letter": 8, "his password": 9, "how tall": 8, "ctc expectation": 9, "current ctc": 9, "pay scale": 8, "what is 2": 6, "tell me a story": 8, "sing a song": 8, "debug my": 8, "fix my": 6, "explain quantum": 8, "who created you": 5, "what is the meaning": 5 },
    boost: (c) => (hasEnt(c, "skill", "field", "project", "company") ? -1 : 0) },
  { id: "pitch", w: { rundown: 8, gist: 6, lowdown: 8 },
    p: { "his deal": 8, "deal with him": 8, "deal with ashish": 8, "ashish deal": 8, "quick rundown": 9, "tl dr": 9, "stand out": 7, "stands out": 8, "what makes him": 7, "what makes ashish": 7, "why should we hire": 12, "why should i hire": 12, "why hire": 12, "why him": 10, "why should we consider": 12, "why should i consider": 12, "why should we pick": 12, "why ashish": 9, "sell me": 9, "sell him": 9, "convince me": 9, "something interesting": 8, "anything interesting": 8, "interesting about": 7, "cool about": 7, "special about": 8, "unique about": 8, "impressive about": 8, "fun fact": 8, "worth hiring": 10, "good candidate": 8, "a good fit": 7, "a good hire": 9, "in a line": 8, "summarize him": 8, "sum him up": 9, "describe him in": 8, "the gist": 8, "anything cool": 8, "something cool": 8, "what is so special": 9, "what is special": 8, "bring to the table": 10, "what does he bring": 9, "what can he bring": 9, "what would he bring": 9, "what does he offer": 8, "what can he offer": 8, "what value": 7 },
    boost: (c) => (hasOwn(c, "company", "project", "skill", "field", "patent", "activity", "school") ? -8 : 0) + (projWord.test(c.pad) && !/ (why|sell|deal) /.test(c.pad) ? -6 : 0)
      + (/\bworth\b.*\b(hir\w*|interview\w*|consider\w*|call|look|it|talking|meeting|shortlist\w*)\b/.test(c.t) ? 12 : 0) },
  { id: "strengths", w: { strengths: 8, strength: 7, superpower: 8, superpowers: 8, forte: 8, specialty: 7, speciality: 7, excel: 5, excels: 6, specializes: 6 },
    p: { "best at": 8, "what is he good at": 8, "good at": 4, "strong suit": 9, "strongest skills": 9, "strongest areas": 9, "strong areas": 8, "key strengths": 9, "core strengths": 9, "core competency": 8, "core competencies": 8, "areas of expertise": 9, "what is he great at": 8, "what does he excel": 8, "what is he known for": 7, "known for": 6, "famous for": 7, "main skills": 6 },
    boost: (c) => (hasOwn(c, "skill", "field", "project", "company") ? -10 : 0)
      + (/\b(strongest|best|top|main|biggest|greatest|core|key|primary)\b.*\b(skills?|areas?|strengths?|abilit\w*|competenc\w*|suit)\b/.test(c.t) ? 9 : 0) },
  { id: "not_stated", w: {}, boost: (c) => { const n = notStatedFor(c); return n && n.id !== "personal" && !(n.id === "title" && hasOwn(c, "skill", "field")) ? 11 : 0; } },
  { id: "case_study", w: {}, boost: (c) => (hasOwn(c, "site") ? 10 : 0) },
  { id: "name", w: {}, p: { "his name": 9, "full name": 9, "ashish name": 9, "name of the ashish": 9, "what is he called": 9 }, boost: (c) => (/ your name /.test(c.pad) ? -20 : 0) },
  { id: "timeline", w: {}, boost: (c) => (/\b20[12]\d\b/.test(c.t) && !c.ents.length && !/\b(cgpa|gpa|graduat\w*|passout|batch|resume|cv|pdf|patent)\b/.test(c.t) ? 9 : 0) },
  { id: "employer_check", w: {}, boost: (c) => (orgAsked(c) && !hasOwn(c, "skill", "field", "project", "patent", "school", "activity") ? 10 : 0) },
  { id: "item_check", w: {}, boost: (c) => (c.yn && hasOwn(c, "project", "patent") && hasOwn(c, "skill", "field") ? 16 : 0) },
  { id: "degree_check", w: { phd: 10, doctorate: 10, masters: 9, mtech: 10, mba: 10, msc: 10, postgraduate: 10, postgrad: 10, bachelors: 6, bachelor: 6 }, p: { "post graduate": 10, "post graduation": 10, "master degree": 10 } },
  { id: "more", w: { more: 3, elaborate: 5, details: 3, detail: 3, expand: 4, continue: 4, further: 3 }, p: { "tell me more": 9, "more details": 9, "more info": 9, "more about that": 9, "go on": 7, "say more": 8, "can you elaborate": 9, "elaborate on that": 9, "what else": 7, "anything else": 6, "explain more": 8, "more please": 8, "tell me more about it": 9, "give me more": 8, "more on that": 9, "in detail": 5, "in more detail": 8, "dig deeper": 8, "and more": 3, "details please": 8, "tell more": 8, "tell me about it": 7, "explain that": 6 }, boost: (c) => (!c.prev ? -9 : 0) + (c.tokens.length > 6 ? -5 : 0) + (hasOwn(c, "company", "project", "skill", "field", "patent", "activity") ? -4 : 0) },
  { id: "where_used", w: {}, p: { "which project": 8, "which projects": 8, "which one": 6, "where did he use it": 9, "where did he use that": 9, "where has he used it": 9, "where was it used": 9, "where is it used": 9, "where did he use them": 9, "in which project": 9, "in what project": 9, "in which projects": 9, "which ones": 7, "where did he apply it": 9, "what project": 6, "what projects": 5, "where used": 8, "used where": 8, "for which project": 9, "on which project": 9, "where": 3 }, boost: (c) => (!c.prev || !(c.prev.ents || []).length ? -9 : 0) + (c.tokens.length > 7 ? -5 : 0) + (hasOwn(c, "company", "project", "skill", "field", "patent", "activity") ? -4 : 0) },
];

// Words/phrases compiled for fast matching.
for (const it of INTENTS) {
  it.exact = {}; it.prefix = [];
  for (const [k, v] of Object.entries(it.w || {})) {
    if (k.endsWith("*")) it.prefix.push([k.slice(0, -1), v]);
    else it.exact[k] = v;
  }
  // singular/plural forms share a weight ("project" ~ "projects", "experiences" ~ "experience")
  for (const [k, v] of Object.entries(it.exact)) {
    // only for longer words: short ones collide with function words ("hi" -> "his", "news" -> "new")
    const alt = k.endsWith("s") ? (k.length >= 6 && !k.endsWith("ss") ? k.slice(0, -1) : null) : (k.length >= 4 ? `${k}s` : null);
    if (alt && !(alt in it.exact)) it.exact[alt] = v;
  }
  // a phrase written with "ashish" also matches "he" (and vice versa via c.padHe)
  const ph = new Map(Object.entries(it.p || {}));
  for (const [k, v] of [...ph]) { const alt = k.replace(/\bashish\b/g, "he"); if (!ph.has(alt)) ph.set(alt, v); }
  it.phrases = [...ph];
}

const SHORT_OK = new Set(["greeting", "thanks"]);
// Keyword words are scored on `c.free` (tokens outside multiword entity mentions); phrases on the full text.
// `ev` records the evidence so a lone weak keyword in a longer question can be treated as low confidence.
function scoreIntent(it, c, ev = {}) {
  let s = 0;
  ev.words = 0; ev.maxW = 0; ev.phrases = 0; ev.boost = 0;
  for (const k of c.free) if (it.exact[k]) { s += it.exact[k]; ev.words++; ev.maxW = Math.max(ev.maxW, it.exact[k]); }
  for (const [p, v] of it.prefix) if (c.free.some((t) => t.startsWith(p))) { s += v; ev.words++; ev.maxW = Math.max(ev.maxW, v); }
  for (const [p, v] of it.phrases) if (v > 0 && (c.pad.includes(` ${p} `) || c.padHe.includes(` ${p} `))) { s += v; ev.phrases++; }
  if (it.boost) { ev.boost = it.boost(c); s += ev.boost; }
  if (it.short) {
    // greetings/thanks only dominate short messages
    const bare = c.tokens.filter((t) => !["he", "ashish", "there", "you", "please", "okay", "very", "much", "so", "a", "lot", "bot", "again", "all"].includes(t));
    if (bare.length > it.short) s -= 4;
    else if (s > 0 && bare.length <= it.short) s += 2;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Fuzzy vocabulary                                                    */
/* ------------------------------------------------------------------ */
const COMMON = ("the a an is are was were be been am do does did of in on at to for from with and or but what which who whom how when where why about tell me his him he she her they them you your yours my i we our it its this that there their these those as by up has have had get got any some all can could should would will shall may might must not no yes please okay thanks sure also just only very much many more most less other another each every both either neither than then so if because while during before after since until here now today still even ever never always often again once new old good bad best better big small long short high low first last next same different own such like likes want wants need needs let make made makes see seen show shows give gave take took come came go goes went going know knows knew think thought say said ask asked answer question questions find found look looked work works worked working use used using try tried call called name named mean meant help helps keep kept start started end ended open close closed read write wrote written run ran put set turn way thing things time times year years month months day days week people person man woman guy world life part place case point fact lot kind sort type form line list page site web app code data info number part side area level role job team company school class course game fun free full real true false right left top bottom back front end head hand eye face body home house room door water food money city country state state age girl boy child children family friend friends mother father brother sister wife husband email mail phone text link links page image video music movie song book books word words story news weather joke tell recipe pizza capital president minister cricket football salary hire hiring available worth earn income born stay live lives living based located hello hey hola bye thank resume contact reach skills skill project projects education experience award awards win wins won hackathon hackathons patent language languages speak spoken fluent certification certifications certificate course courses cgpa gpa grade grades marks percentage score scores university college degree graduate graduation graduating btech major tech technology tools tool framework frameworks library libraries stack cloud model models machine learning deep vision computer agent agents agentic intelligence artificial engineer engineering developer software full hardware sensor sensors device devices smart parking fitness fashion advisory emotion speech translation diffusion education intern internship current currently present previous past experience background summary introduction overview profile pitch achievements activities leadership club clubs events event organizer organized summit abroad international exposure study tour download pdf cv vitae location city hyderabad telangana india relocate remote linkedin github gmail whatsapp mobile call").split(/\s+/);

const VOCAB = new Set();
const addVocab = (w) => { if (w && w.length >= 3 && !/\d/.test(w)) VOCAB.add(w); };
for (const w of COMMON) addVocab(w);
for (const { alias } of ALIAS_LIST) alias.split(" ").forEach(addVocab);
for (const it of INTENTS) {
  for (const k of Object.keys(it.w || {})) k.replace("*", "").split(" ").forEach(addVocab);
  for (const k of Object.keys(it.p || {})) k.split(" ").forEach(addVocab);
}
for (const w of Object.keys(WORDS)) addVocab(w);
for (const s of SKILL_ITEMS) s.norm.trim().split(" ").forEach(addVocab);
for (const it of POOL) it.norm.trim().split(" ").forEach(addVocab);
const VOCAB_LIST = [...VOCAB];

// Real English words must never be "corrected" into domain vocabulary (e.g. deal -> dial -> phone intent).
const ENGLISH = new Set(("deal deals show shows study case cases real sell legit fit fits guy guys stuff thing cool tour line lines rundown " +
  "special story stories sort lead leads led team teams trip trips abroad overseas trying deploy deployed deploying production prod live " +
  "standing stand strong strongest strength strengths weak weakness best better worth worthy unique hire hires hired fresh mind trouble " +
  "wonder wondering curious client clients needs need someone anyone hunt hunting role roles target targets seek seeking looking prefer " +
  "rather much many more most less fill filled fine kind kinds ones sure nope yeah yep nah okay alright piece field fields area areas " +
  "range ranges word talk talks tale task tasks date dates year when then than them they data dial mail main made make makes take takes " +
  "move moved work view views pick picks deep keep seen send sent tool cell call fall tall wall ball bill fill hill mill pill till will " +
  "plan plans plane lane cane cake bake fake lake make name names same game came fame tame shame grade grades trade trades made shade " +
  "superpower forte excel excels edge salary visa passport notice period relocate hobby hobbies interest interests passion passions " +
  "candidate person profile overview pitch interesting impressive impress impressed proud sentence brief briefly quick quickly short " +
  "summary summarise summarize wrap gist core tell tells told says said what which whose wish dish fish").split(" "));

function fixToken(tok) {
  if (tok.length < 4 || VOCAB.has(tok) || ENGLISH.has(tok) || /\d/.test(tok)) return tok;
  // Short words (4-5 letters): only adjacent transpositions (cgap -> cgpa); substitutions on short words
  // turn ordinary words into unrelated vocabulary. Longer words: edit distance 1 (2 for 8+ letters).
  const short = tok.length < 6;
  const maxD = tok.length >= 8 ? 2 : 1;
  let best = null, bd = 99;
  for (const v of VOCAB_LIST) {
    if (v[0] !== tok[0] || Math.abs(v.length - tok.length) > maxD || (short && v.length !== tok.length)) continue;
    if (short && !isTransposition(tok, v)) continue;
    const d = levenshtein(tok, v);
    if (d <= maxD && d < bd) { best = v; bd = d; }
  }
  return best || tok;
}
function isTransposition(a, b) {
  if (a.length !== b.length) return false;
  const diff = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff.push(i);
  return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]];
}

export function normalize(raw) {
  const out = [];
  for (const w of basic(raw)) {
    const mapped = WORDS[w] !== undefined ? WORDS[w] : fixToken(w);
    for (const m of String(mapped).split(" ")) if (m && out[out.length - 1] !== m) out.push(m);
  }
  return out.join(" ").replace(/\bthe ashish\b/g, "ashish")
    // "this dude", "the guy", "ur candidate" are the subject, not filler
    .replace(/\b(this|that|the|your|ur|ya|my) (guy|dude|bro|man|person|fellow|chap|candidate|applicant)\b/g, "ashish")
    // "what's he built" means "what has he built", not "what is he built"
    .replace(/\bis (he|ashish) (built|made|done|developed|created|worked|achieved|won|published|used|studied|learned|got|been)\b/g, "has $1 $2")
    .replace(/\b(he|ashish) is (built|made|done|developed|created|worked|achieved|won|published|used|studied|learned|got|been)\b/g, "$1 has $2");
}

/* ------------------------------------------------------------------ */
/* Context + routing                                                   */
/* ------------------------------------------------------------------ */
const SUBJ = new Set(["he", "his", "him", "she", "her", "you", "your", "ashish", "i", "me", "my", "the", "a", "an", "is", "are", "was", "does", "do", "did", "has", "have", "can", "could", "what", "which", "any", "of", "in", "with", "on", "at", "to", "for", "and", "or", "about", "it", "that", "this", "also", "please", "tell", "know", "knows", "used", "use", "uses", "using", "experience", "familiar", "proficient", "good", "skilled", "expert", "worked", "work", "how", "much", "many", "can", "ever", "really", "actually", "so", "then", "there", "if", "be", "by", "as"]);

// Question TYPE (independent of topic): shapes the answer (only yes/no questions get "Yes —", "when" gets dates, ...).
function qtypeOf(t, raw) {
  const lead = t.replace(/^(so|ok|okay|and|but|hey|hi|also|well|um|uh|like|just|please|quick question|one more thing)\s+/g, "");
  if (/\bhow many\b|\bnumber of\b|\bhow much (marks|did he score)\b|\bcount\b/.test(t) && !/\bhow many (months|years|weeks)\b/.test(t)) return "howmany";
  if (/\bhow long\b|\bhow many (months|years|weeks)\b|\bduration\b/.test(t)) return "howlong";
  if (/^(when|since when)\b|\b(when|since when) (did|does|do|is|was|will|has|were)\b|\b(what|which) (year|month|date)\b|\bwhen\b/.test(lead)) return "when";
  if (/^why\b|\bwhy (should|would|hire|him|ashish)\b/.test(lead)) return "why";
  // "could you tell me…", "can I get…" are requests, not yes/no questions.
  if (/^(can|could|would|will) (you|i|we) (please |kindly )?(tell|elaborate|explain|give|share|describe|list|walk|show|summari[sz]e|provide|send|get|see|have|know|talk|help)\b/.test(lead)) return "what";
  if (/^(do|does|did|has|have|had|is|are|was|were|can|could|will|would|should|shall|may)\b/.test(lead)) return "yn";
  if (/^(he|ashish) (is|has|have|did|does|can|knows|know|any|ever|got|was)\b/.test(lead) && /\?\s*$/.test(String(raw).trim().replace(/[^\w?]+$/g, ""))) return "yn";
  if (/^where\b|\bwhere (did|does|is|was|has)\b/.test(lead)) return "where";
  if (/^who\b/.test(lead)) return "who";
  return "what";
}

const ANAPHOR = / (it|that|there|this|them|those|these|its|the project|that project|the company|that company|that job|that role|that internship) /;
function buildCtx(query, state) {
  const t = normalize(query);
  const tokens = t.split(" ").filter(Boolean);
  const fe = findEntities(t);
  const c = { raw: query, t, tokens, tokSet: new Set(tokens), free: fe.masked, pad: ` ${t} `, padHe: ` ${t} `.replace(/ ashish /g, " he "), ents: fe.ents, own: fe.ents.length, prev: state?.last || null };
  c.qtype = qtypeOf(t, query);
  c.yn = c.qtype === "yn";
  // Anaphora: "when did he start there?", "how long was that", "what tech did he use for it" -> previous turn's entities.
  if (!c.ents.length && c.prev?.ents?.length && ANAPHOR.test(c.pad)) {
    c.ents = c.prev.ents.map((id) => ENT.find((e) => e.id === id)).filter(Boolean);
    c.inherited = true;
  }
  const objAfter = c.pad.match(/ (?:know|knows|used|use|uses|using|familiar with|experience with|experience in|proficient in|good at|good with|skilled in|expert in|worked with|worked on|knowledge of|code in|program in) (.*)$/);
  const rest = (objAfter ? objAfter[1] : "").split(" ").filter((w) => w && !SUBJ.has(w));
  c.objectless = rest.length === 0;
  return c;
}

const MIN = 3;
function best(c) {
  let top = null;
  for (const it of INTENTS) {
    const ev = {};
    const s = scoreIntent(it, c, ev);
    if (!top || s > top.score) top = { it, score: s, ev };
  }
  // Low confidence: the only evidence is ONE weak keyword (weight <= 3) inside a longer question.
  top.weak = top.ev.phrases === 0 && top.ev.words <= 1 && top.ev.maxW <= 3 && top.ev.boost <= 0;
  return top;
}

// Open-ended questions clearly about Ashish ("what's his deal", "tell me something about him") get the pitch, not "couldn't find".
const VAGUE = new Set(("good great legit decent solid any who whom so what is are was the a an his him he ashish guy guys dude person candidate profile this that about tell me give "
  + "know thing things stuff info information something anything everything interesting cool special story overview quick brief bit little "
  + "lowdown scoop more details detail need want learn hear like kind sort really just okay ok hmm well i we you can could would should "
  + "please of on to for with in and or say quickly exactly actually some all any lot overall general generally main basically do does did his own").split(" "));
const ABOUT_HIM = /\b(he|him|his|ashish|guy|dude|candidate|person|profile)\b/;
const vagueAboutHim = (c) => ABOUT_HIM.test(c.t) && c.tokens.every((w) => VAGUE.has(w));

// BM25 is only used to pick a TOPIC; the answer is still composed by that topic's template (no raw chunk dumps).
const ENT_BY = (id) => ENT.find((e) => e.id === id);
// Words too generic to pick a topic on their own ("what is his work ethic" must not become the Maaze job).
const GENERIC_TERMS = new Set(["work", "job", "role", "company", "current", "currently", "vision", "new", "engineer", "ai", "project", "thing", "know", "think", "like", "good", "best", "real", "time", "data", "system", "platform", "app", "web", "full", "place", "national", "top"]);
const CHUNK_ROUTE = {
  summary: ["about"], contact: ["contact"], "skills-ai": ["skills_list"], "skills-frameworks": ["skills_list"], "skills-cloud": ["skills_list"], "skills-lang": ["skills_list"],
  "exp-maaze-docs": ["company", "c-maaze"], "exp-maaze-video": ["company", "c-maaze"], "exp-srinishtha": ["company", "c-srin"],
  "proj-hrops": ["project_detail", "p-hrops"], "proj-wealthmaps": ["project_detail", "p-wealth"], "proj-parquik": ["project_detail", "p-parquik"], "proj-getfit": ["project_detail", "p-getfit"],
  "proj-others": ["projects_list"], hackathons: ["achievements"], patent: ["patent"], education: ["edu_overall"], languages: ["spoken"], certs: ["certs"], activities: ["activities"],
};
if (chunks.some((ch) => !CHUNK_ROUTE[ch.id])) throw new Error("CHUNK_ROUTE is missing a resume chunk");

const FOLLOW_LEAD = /^(and|what about|how about|also|same for|what of|and what about|and how about)\b/;
const FOLLOW_ENT = new Set(["skill_check", "projects_by_tech", "company", "project_detail", "activity_detail"]);
const ENTITY_DEFAULT = new Set(["skill_check", "company", "project_detail", "activity_detail"]);

// Answer shape follows question type: only yes/no questions keep a "Yes — " / "No — " lead.
function run(id, c) {
  const it = INTENTS.find((x) => x.id === id);
  if (it?.alias) id = it.alias;
  const res = A[id](c);
  const text = c.yn ? res.text : res.text.replace(/(^|\n)(?:Yes|No) — (.)/g, (m, p, ch) => p + ch.toUpperCase());
  return { ...res, text, intent: id };
}

function single(c) {
  const b = best(c);
  if (c.prev && FOLLOW_LEAD.test(c.t) && c.ents.length && FOLLOW_ENT.has(c.prev.intent) && (b.score < MIN || ENTITY_DEFAULT.has(b.it.id))) {
    const id = c.prev.intent === "projects_by_tech" ? "projects_by_tech" : (c.ents[0].type === "company" ? "company" : c.ents[0].type === "project" ? "project_detail" : c.ents[0].type === "activity" ? "activity_detail" : c.prev.intent);
    if (A[id]) return run(id, c);
  }
  const lowConf = b.score < MIN || (b.weak && c.tokens.length >= 4 && !c.ents.length);
  if (!lowConf) return run(b.it.id, c);
  // entity mention fallback
  if (c.ents.length) {
    const e = c.ents[0];
    const id = { skill: "skill_check", field: "skill_check", company: "company", project: "project_detail", patent: "patent", school: "edu_uni", activity: "activity_detail", spoken: "spoken", site: "case_study" }[e.type];
    return run(id, c);
  }
  if (vagueAboutHim(c)) return run(c.qtype === "who" ? "about" : "pitch", c);
  // BM25 picks a topic; the topic's template answers.
  const r = bm25(c.raw);
  const specific = (r.matched || []).filter((w) => !GENERIC_TERMS.has(w));
  if (r.top && CHUNK_ROUTE[r.top] && specific.length && r.matched.length / r.content.length >= 0.6) {
    const [id, ent] = CHUNK_ROUTE[r.top];
    const out = run(id, { ...c, ents: ent ? [ENT_BY(ent)] : [] });
    return { ...out, intent: `bm25:${id}` };
  }
  if (b.score >= MIN) return run(b.it.id, c);
  return { text: `I couldn't find that on Ashish's resume. I can help with his experience, projects, skills, education, achievements or contact details — or email him at ${contact.email}.`, sources: [], intent: "fallback", ents: [] };
}

const SPLIT_RE = /\?+|;|\balso\b|\band also\b|\bplus\b|\band\b|\bas well as\b|\bthen\b/i;
const NOT_INDEPENDENT = new Set(["skill_check", "project_detail", "company", "activity_detail", "more", "where_used", "greeting", "thanks"]);

function multi(query, state) {
  const parts = query.split(SPLIT_RE).map((p) => p.trim()).filter((p) => p && normalize(p));
  if (parts.length < 2 || parts.length > 6) return null;
  const PREAMBLE = /^(hi|hello|hey)?\s*(there)?[\s,]*(i|we|my|our|so i|so we)\s+(was|am|have|had|wanted|want|need|got|are|were|looked|saw|came|just|recently|m|ve|d)\b/i;
  const solidOf = (p) => {
    if (PREAMBLE.test(p) && !/\?/.test(p)) return false;
    const c = buildCtx(p, state);
    const b = best(c);
    return b.score >= MIN && (!NOT_INDEPENDENT.has(b.it.id) || c.tokens.length >= 3);
  };
  // Fragments that aren't questions on their own (e.g. "pandas") are folded into the previous question.
  const groups = [];
  let carry = "";
  for (const p of parts) {
    if (solidOf(p)) { groups.push(carry ? `${carry} ${p}` : p); carry = ""; }
    else if (groups.length) groups[groups.length - 1] += ` and ${p}`;
    else carry = carry ? `${carry} and ${p}` : p;
  }
  if (carry) return null;
  if (groups.length < 2 || groups.length > 4) return null;
  const rs = groups.map((g) => { const c = buildCtx(g, state); return { c, id: best(c).it.id }; });
  if (new Set(rs.map((r) => r.id)).size < 2) return null;
  return rs;
}

const SUGG = {
  greeting: ["Where does he work?", "What are his hackathon wins?", "What's his CGPA?"],
  help: ["Tell me about Ashish", "What are his skills?", "Show his projects"],
  about: ["Where does he work?", "What are his skills?", "Any awards?", "How can I contact him?"],
  current_role: ["What did he do at Srinishtha?", "Any computer vision projects?", "Which cloud does he use?", "When does he graduate?"],
  company: ["Does he know YOLO?", "What is his tech stack?", "Tell me about his education", "Any hackathon wins?"],
  experience: ["What did he build at Maaze?", "What are his skills?", "Tell me about his projects"],
  hire: ["Can I get his resume?", "Where is he based?", "What did he build at Maaze?"],
  skill_check: ["Which projects use it?", "What about TensorFlow?", "Any LLM projects?", "What are all his skills?"],
  skill_unknown: ["What are his skills?", "Which ML frameworks?", "Any cloud experience?"],
  skills_list: ["Any computer vision projects?", "Does he know PyTorch?", "What certifications does he have?"],
  projects_list: ["What is his best project?", "Tell me about HROps", "Any RAG projects?", "Tell me about the patent"],
  project_best: ["Tell me about WealthMaps", "Tell me about the patent", "Any awards?"],
  project_detail: ["Tell me more", "Any other projects?", "Any hackathon wins?"],
  projects_by_tech: ["Tell me more", "What about PyTorch?", "What are his achievements?"],
  achievements: ["Tell me about WealthMaps", "Tell me about the patent", "What leadership roles has he had?"],
  patent: ["Does he know IoT?", "Any hackathon wins?", "What are his projects?"],
  edu_overall: ["What's his CGPA?", "When does he graduate?", "What certifications does he have?"],
  edu_cgpa: ["And his 12th percentage?", "When does he graduate?", "Which university?"],
  edu_marks: ["Which university?", "When does he graduate?", "Any certifications?"],
  edu_12: ["And his 10th?", "What's his CGPA?", "Which university?"],
  edu_10: ["And his 12th?", "What's his CGPA?", "What did he study?"],
  edu_uni: ["What's his CGPA?", "When does he graduate?", "Any certifications?"],
  edu_grad: ["What's his CGPA?", "Where does he work?", "What did he study?"],
  edu_major: ["What's his CGPA?", "Any certifications?", "What are his skills?"],
  certs: ["What are his skills?", "What's his CGPA?", "Any hackathon wins?"],
  spoken: ["Where is he based?", "How can I contact him?", "Tell me about his education"],
  activities: ["Any hackathon wins?", "Tell me about Udhgam", "International exposure?"],
  activity_detail: ["Other leadership roles?", "Any hackathon wins?", "Tell me about his projects"],
  contact: ["Can I get his resume?", "Where is he based?", "Is he open to opportunities?"],
  contact_email: ["What's his phone number?", "What's his LinkedIn?", "Can I get his resume?"],
  contact_phone: ["What's his email?", "What's his LinkedIn?", "Where is he based?"],
  contact_linkedin: ["What's his GitHub?", "What's his email?", "Can I get his resume?"],
  contact_github: ["What's his LinkedIn?", "What are his projects?", "What's his email?"],
  location: ["How can I contact him?", "Where does he work?", "Is he open to opportunities?"],
  resume_dl: ["How can I contact him?", "What are his skills?", "Tell me about his projects"],
  out_of_scope: ["Tell me about Ashish", "How can I contact him?", "What are his skills?"],
  more: ["What are his skills?", "Any awards?", "How can I contact him?"],
  pitch: ["What does he do at Maaze?", "What is he best at?", "How can I contact him?"],
  strengths: ["Any computer vision projects?", "Tell me about HROps", "What's his best project?"],
  not_stated: ["How can I contact him?", "Where does he work?", "Can I get his resume?"],
  case_study: ["What does he do at Maaze?", "Does he know Azure?", "Any LLM projects?"],
  name: ["Tell me about Ashish", "Where does he work?", "How can I contact him?"],
  employer_check: ["What does he do at Maaze?", "What did he do at Srinishtha?", "What are his skills?"],
  degree_check: ["What's his CGPA?", "When does he graduate?", "Any certifications?"],
  where_used: ["Tell me more", "What is his tech stack?", "Any awards?"],
  bm25: ["What are his skills?", "Any awards?", "How can I contact him?"],
  fallback: ["Tell me about Ashish", "What are his skills?", "How can I contact him?"],
};
const BANK = ["What does he do at Maaze?", "Which ML frameworks?", "Hackathon wins?", "Tell me about the patent", "What's his CGPA?", "How to contact?", "Any computer vision projects?", "Does he know PyTorch?", "What did he do at Srinishtha?", "Is he good at LLMs?", "Which languages does he speak?", "Tell me about HROps", "Can I get his resume?", "What certifications does he have?"];
export const defaultSuggestions = (n = 4, seed = 0) => Array.from({ length: n }, (_, i) => BANK[(seed * 3 + i * 2) % BANK.length]).filter((s, i, a) => a.indexOf(s) === i);

function suggestionsFor(intent, seed, asked) {
  const pool = (SUGG[intent] || SUGG.fallback).filter((s) => normalize(s) !== normalize(asked));
  const k = pool.length;
  return Array.from({ length: Math.min(3, k) }, (_, i) => pool[(seed + i) % k]).filter((s, i, a) => a.indexOf(s) === i);
}

/**
 * Answer a question. `state` carries lightweight context ({ last, turn }) between turns.
 * Returns { text, sources, intent, state, suggestions }.
 */
export function respond(query, state = {}) {
  const seed = state.turn || 0;
  let res;
  const rs = multi(query, state);
  if (rs) {
    const outs = rs.map((r) => run(r.id, r.c));
    res = {
      text: outs.map((o) => o.text).join("\n\n"),
      sources: [...new Set(outs.flatMap((o) => o.sources))],
      intent: outs.map((o) => o.intent).join("+"),
      ents: outs[outs.length - 1].ents,
      lastIntent: outs[outs.length - 1].intent,
      lastT: rs[rs.length - 1].c.t,
    };
  } else {
    const c = buildCtx(query, state);
    res = single(c);
    res.lastIntent = res.intent;
    res.lastT = c.t;
  }
  if (res.isMore && res.text === state.lastText) res.text = "That covers everything Ashish's resume says on this topic. Try one of the suggestions below, or ask about something else.";
  const keep = ["more", "where_used", "greeting", "thanks", "goodbye", "help", "bm25", "fallback", "out_of_scope", "not_stated", "name"].includes(res.lastIntent) && state.last
    ? state.last
    : { intent: res.lastIntent, ents: (res.ents || []).map((e) => e.id), t: res.lastT };
  return {
    text: res.text,
    sources: res.sources || [],
    intent: res.intent,
    suggestions: suggestionsFor(String(res.lastIntent).replace(/^bm25:/, ""), seed, query),
    state: { last: keep, turn: seed + 1, lastText: res.text },
  };
}
