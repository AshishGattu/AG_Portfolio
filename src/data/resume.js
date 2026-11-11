// Single source of truth for the "Ask my resume" chat and command palette.
export const contact = {
  location: "Hyderabad, Telangana",
  email: "ashishg2204@gmail.com",
  phone: "+91 70324 15999",
  github: "github.com/AshishGattu",
  linkedin: "linkedin.com/in/ashish-gattu",
};

export const summary =
  "AI & ML Engineer with a strong foundation in Deep Learning, Computer Vision and Agentic AI, building production systems: an LLM-powered insurance document-extraction platform on Azure and real-time video analytics for US retail stores. Hands-on with full-stack web development, RAG chatbots and multi-agent architectures; national 3rd-place hackathon finish and a published patent.";

export const skills = {
  "AI & ML": ["Supervised & Unsupervised Learning", "Deep Learning", "Transfer Learning", "NLP", "Computer Vision", "Object Tracking", "LLMs", "LangChain", "RAG", "Agentic AI"],
  Frameworks: ["PyTorch", "TensorFlow", "Keras", "YOLOv5", "Scikit-learn", "OpenCV", "NLTK", "SpaCy", "Hugging Face Transformers"],
  Cloud: ["Azure AI Document Intelligence", "Azure OpenAI (GPT-5 mini)"],
  Languages: ["Python", "JavaScript", "Node.js", "React", "HTML", "CSS"],
  "Data & Tools": ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Git", "GitHub", "Jupyter", "Google Colab", "VS Code", "Figma"],
};

export const chunks = [
  {
    id: "summary",
    section: "About",
    title: "Summary",
    text: summary,
    keywords: "who is ashish about summary profile introduction engineer",
  },
  {
    id: "contact",
    section: "Contact",
    title: "Contact",
    text: `Based in ${contact.location}. Email ${contact.email}, phone ${contact.phone}, GitHub ${contact.github}, LinkedIn ${contact.linkedin}.`,
    keywords: "contact email phone reach location hyderabad github linkedin",
  },
  {
    id: "skills-ai",
    section: "Skills",
    title: "AI & ML skills",
    text: `AI & ML: ${skills["AI & ML"].join(", ")}.`,
    keywords: "skills machine learning ai techniques",
  },
  {
    id: "skills-frameworks",
    section: "Skills",
    title: "Frameworks",
    text: `Frameworks: ${skills.Frameworks.join(", ")}.`,
    keywords: "frameworks libraries ml deep learning tools",
  },
  {
    id: "skills-cloud",
    section: "Skills",
    title: "Cloud",
    text: `Cloud: ${skills.Cloud.join(", ")}.`,
    keywords: "cloud azure openai",
  },
  {
    id: "skills-lang",
    section: "Skills",
    title: "Languages and data tools",
    text: `Languages: ${skills.Languages.join(", ")}. Data & Tools: ${skills["Data & Tools"].join(", ")}.`,
    keywords: "programming languages python javascript tools",
  },
  {
    id: "exp-maaze-docs",
    section: "Experience",
    title: "Maaze: Insurance Document Extraction Platform",
    text: "AI Engineer at Maaze Underwriting Solutions (Jul 2026 - Present). Insurance Document Extraction Platform: a web platform on Azure AI Document Intelligence and GPT-5 mini that ingests varied-layout insurance documents via HTTP and email, extracts text and maps it to structured JSON aligned with form-specific schemas per insurance form type, and includes an LLM assistant that reads the ingested documents and answers user questions.",
    keywords: "maaze underwriting job work role company current currently now present employer ai engineer insurance document extraction llm",
  },
  {
    id: "exp-maaze-video",
    section: "Experience",
    title: "Maaze: Retail Video Analytics",
    text: "At Maaze, also built Real-Time Retail Video Analytics for a US store franchise: YOLOv5 person detection and tracking on in-store camera footage, crowd-density heatmaps, and store analytics including dwell time, fulfilment time and total footfall in and out.",
    keywords: "maaze computer vision yolo video retail store analytics heatmap footfall",
  },
  {
    id: "exp-srinishtha",
    section: "Experience",
    title: "Srinishtha Technologies internship",
    text: "AI Intern at Srinishtha Technologies, Hyderabad (Dec 2024 - Sep 2025): built the UI and backend for a scalable EdTech platform supporting 80+ branches across Telangana, RAG-based conversational AI chatbots for e-commerce, and automation tools for client projects.",
    keywords: "internship intern job work experience company edtech chatbot rag",
  },
  {
    id: "proj-hrops",
    section: "Projects",
    title: "HROps",
    text: "HROps (Oct 2025 - Present): multi-agent HR automation with 4 agents for resume screening, onboarding, compliance and communications. Built with LangChain, Node.js and React.",
    keywords: "project agentic multi-agent hr automation langchain",
  },
  {
    id: "proj-wealthmaps",
    section: "Projects",
    title: "WealthMaps",
    text: "WealthMaps, Fueled Contest 2.0 (National 3rd Place, 2024): a full-stack app (React, Node.js) aggregating US property data with AI report generation using Llama.",
    keywords: "project hackathon national third place award won prize full-stack llama",
  },
  {
    id: "proj-parquik",
    section: "Projects",
    title: "Parquik",
    text: "Parquik: smart parking with computer vision. Won Most Innovative Project at a Bhopal hackathon.",
    keywords: "project hackathon award won prize parking computer vision bhopal",
  },
  {
    id: "proj-getfit",
    section: "Projects",
    title: "Get-Fit",
    text: "Get-Fit: an Arduino fitness tracker with real-time movement feedback. Top 10 nationally at a Kerala hackathon.",
    keywords: "project hackathon award top 10 prize arduino fitness kerala",
  },
  {
    id: "proj-others",
    section: "Projects",
    title: "Other projects",
    text: "Also on the site: Emotion S2S (deep-learning speech-to-speech translation preserving voice and emotion), CyberGPT 2 (multi-agent compliance RAG with Phidata and Qdrant), EduSense (EMIS for 80+ branches, React/Ruby/Roda/PostgreSQL), Context-Aware Fashion Advisory (CNNs, RL, OpenCV) and a Diffusion Model (DDPM, U-Net, PyTorch, cars).",
    keywords: "projects emotion speech translation cybergpt rag edusense fashion diffusion model",
  },
  {
    id: "hackathons",
    section: "Projects",
    title: "Hackathon results",
    text: "Hackathon results: National 3rd Place (WealthMaps, Fueled Contest 2.0, 2024), Most Innovative Project (Parquik, Bhopal hackathon), and Top 10 nationally (Get-Fit, Kerala hackathon).",
    keywords: "hackathon wins awards won prize place national",
  },
  {
    id: "patent",
    section: "Patent",
    title: "Smart Stream patent",
    text: "Patent: Smart Stream - Water Flow Detection System, Application No. 202641011870-A, Indian Patent Office, 2026. IoT sensors (flow, pressure, temperature) on faucets and showerheads, with Arduino and ESP32 streaming to the cloud and a web app for per-device usage analytics.",
    keywords: "patent invention iot water sensor esp32 arduino",
  },
  {
    id: "education",
    section: "Education",
    title: "Education",
    text: "B.Tech in AI & Machine Learning, Woxsen University, 2022-2026, CGPA 3.4/4.0. Higher Secondary (PCM) 90% at Narayana Junior College, 2020-22. CBSE 94% at St. Andrews School, 2018-20.",
    keywords: "education degree university college school btech cgpa marks grades woxsen",
  },
  {
    id: "languages",
    section: "About",
    title: "Languages spoken",
    text: "Languages spoken: fluent in English, Hindi and Telugu; beginner German.",
    keywords: "languages spoken english hindi telugu german speak",
  },
  {
    id: "certs",
    section: "Certifications",
    title: "Certifications",
    text: "Certifications: Introduction to TensorFlow for AI, ML & DL (DeepLearning.AI, Mar 2024); Introduction to Web Development (UC Davis, Apr 2025); Object Oriented Programming in Java (UC San Diego, Apr 2023); An Intuitive Introduction to Probability (University of Zurich, Apr 2023). Hackathon certificates: Oriental Group Bhopal (2024) and GDSC WOW Kerala (2023).",
    keywords: "certifications certificates courses coursera tensorflow web development java object oriented probability zurich ucsd",
  },
  {
    id: "activities",
    section: "Activities",
    title: "Leadership and activities",
    text: "Senior Executive, Technology Club (2023-24); Project Sector Executive, COE MetaTech (2023-24); Event Manager, Udhgam Hackathon 2025; Organizer, MARK XXIV National Hackathon (2023); Ajman University Winter Study Tour (Ajman, UAE, 2023); attended the Nvidia AI Summit Mumbai.",
    keywords: "activities leadership club events organizer extracurricular nvidia summit ajman",
  },
];

// ---------------------------------------------------------------------------
// Structured data (answers in src/lib/intents.js are generated from these).
// ---------------------------------------------------------------------------
export const resumeUrl = "/Ashish_Gattu_Resume_2026.pdf";

export const experience = [
  {
    id: "maaze", company: "Maaze Underwriting Solutions", short: "Maaze", role: "AI Engineer",
    start: "Jul 2026", end: "Present", current: true, location: null,
    items: [
      {
        id: "maaze-docs", name: "Insurance Document Extraction Platform",
        short: "Azure AI Document Intelligence + GPT-5 mini platform that turns insurance documents into structured JSON",
        desc: "a web platform on Azure AI Document Intelligence and GPT-5 mini that ingests varied-layout insurance documents via HTTP and email, extracts text and maps it to structured JSON aligned with form-specific schemas per insurance form type, and includes an LLM assistant that answers user questions over the ingested documents",
        tech: ["Azure AI Document Intelligence", "GPT-5 mini", "LLM"],
        tags: ["llm", "nlp", "generative", "cloud", "fullstack", "chatbot", "production", "docai"],
      },
      {
        id: "maaze-video", name: "Real-Time Retail Video Analytics",
        short: "YOLOv5 person detection and tracking with heatmaps and store analytics for a US store franchise",
        desc: "real-time video analytics for a US store franchise: YOLOv5 person detection and tracking on in-store camera footage, crowd-density heatmaps, and store analytics including dwell time, fulfilment time and total footfall in and out",
        tech: ["YOLOv5"],
        tags: ["cv", "dl", "ml", "tracking", "production"],
      },
    ],
  },
  {
    id: "srinishtha", company: "Srinishtha Technologies", short: "Srinishtha", role: "AI Intern",
    start: "Dec 2024", end: "Sep 2025", current: false, location: "Hyderabad",
    items: [
      { id: "srin-edtech", name: "EdTech platform", short: "UI and backend of a scalable EdTech platform supporting 80+ branches across Telangana", desc: "the UI and backend for a scalable EdTech platform supporting 80+ branches across Telangana", tech: ["UI", "backend"], tags: ["fullstack"] },
      { id: "srin-rag", name: "RAG chatbots", short: "RAG-based conversational AI chatbots for e-commerce", desc: "RAG-based conversational AI chatbots for e-commerce", tech: ["RAG", "chatbots"], tags: ["rag", "llm", "nlp", "chatbot"] },
      { id: "srin-auto", name: "Automation tools", short: "automation tools for client projects", desc: "automation tools for client projects", tech: ["automation"], tags: ["automation"] },
    ],
  },
];

export const projects = [
  { id: "hrops", name: "HROps", date: "Oct 2025 - Present", short: "multi-agent HR automation with 4 agents (resume screening, onboarding, compliance, communications)", desc: "multi-agent HR automation with 4 agents for resume screening, onboarding, compliance and communications", tech: ["LangChain", "Node.js", "React"], tags: ["agentic", "llm", "nlp", "fullstack", "automation"] },
  { id: "wealthmaps", name: "WealthMaps", date: "2024", short: "full-stack app (React, Node.js) aggregating US property data with Llama-powered AI report generation", desc: "a full-stack app (React front end, Node.js back end) that aggregates US property data and uses Llama for AI-generated property and market reports", tech: ["React", "Node.js", "Llama"], tags: ["fullstack", "llm", "generative"], award: "National 3rd Place at Fueled Contest 2.0 (2024)" },
  { id: "parquik", name: "Parquik", date: "", short: "real-time smart parking that detects free slots from CCTV video with computer vision", desc: "a real-time smart parking system that processes CCTV video with computer vision (Python, OpenCV, object detection) to detect free slots", tech: ["Python", "OpenCV", "Object Detection"], tags: ["cv", "ml"], award: "Most Innovative Project at a Bhopal hackathon" },
  { id: "getfit", name: "Get-Fit", date: "", short: "Arduino fitness tracker with real-time movement feedback", desc: "an Arduino Uno fitness tracker with an accelerometer/gyroscope (MPU6050) that counts reps and gives real-time posture and movement feedback", tech: ["Arduino", "Accelerometer", "Gyroscope"], tags: ["iot", "embedded"], award: "Top 10 nationally at a Kerala hackathon" },
  { id: "emotion", name: "Emotion S2S", date: "", short: "deep-learning speech-to-speech translation that preserves the speaker's voice and emotion", desc: "a deep-learning speech-to-speech translation model that preserves the speaker's voice, tone and emotion", tech: ["Deep Learning", "Audio Processing", "Python"], tags: ["dl", "ml", "nlp", "speech", "generative"] },
  { id: "cybergpt", name: "CyberGPT 2", date: "", short: "multi-agent compliance RAG with Phidata and Qdrant", desc: "a multi-agent compliance-checking system: regulations (RBI, ISO, TRM) are embedded in Qdrant and agents use RAG to audit controls, with a diagnostic chatbot; built with Phidata", tech: ["RAG", "Phidata", "Qdrant", "Python"], tags: ["rag", "llm", "nlp", "agentic", "chatbot"] },
  { id: "edusense", name: "EduSense", date: "", short: "EMIS for 80+ branches (React, Ruby, Roda, PostgreSQL)", desc: "an EMIS for 80+ branches built with React, Ruby, Roda and PostgreSQL", tech: ["React", "Ruby", "Roda", "PostgreSQL"], tags: ["fullstack", "db"] },
  { id: "fashion", name: "Context-Aware Fashion Advisory", date: "", short: "fashion recommendations using CNNs, RL and OpenCV", desc: "a context-aware fashion advisory system using CNNs, RL and OpenCV", tech: ["CNNs", "RL", "OpenCV"], tags: ["cv", "dl", "ml", "rl"] },
  { id: "diffusion", name: "Diffusion Model", date: "", short: "DDPM with a U-Net in PyTorch, generating cars", desc: "a diffusion model (DDPM, U-Net) in PyTorch that generates cars", tech: ["DDPM", "U-Net", "PyTorch"], tags: ["dl", "ml", "generative"] },
];

export const education = {
  degree: "B.Tech in AI & Machine Learning", school: "Woxsen University", years: "2022-2026", gradYear: "2026", cgpa: "3.4/4.0",
  twelfth: { name: "Higher Secondary (PCM)", pct: "90%", school: "Narayana Junior College", years: "2020-22" },
  tenth: { name: "CBSE", pct: "94%", school: "St. Andrews School", years: "2018-20" },
};

export const achievements = [
  { title: "National 3rd Place", detail: "WealthMaps at Fueled Contest 2.0 (2024)" },
  { title: "Most Innovative Project", detail: "Parquik at a Bhopal hackathon" },
  { title: "Top 10 nationally", detail: "Get-Fit at a Kerala hackathon" },
];

export const patent = {
  title: "Smart Stream - Water Flow Detection System", number: "202641011870-A", office: "Indian Patent Office", year: "2026",
  desc: "IoT sensors (flow, pressure, temperature) on faucets and showerheads, with Arduino and ESP32 streaming to the cloud and a web app for per-device usage analytics",
  // Not computer vision and not Azure: sensor data streamed to cloud storage.
  tags: ["iot", "embedded", "fullstack", "cloudstorage"],
};

// Capability tags used on experience items / projects / patent (hand-checked against the descriptions above):
// cv = camera/image understanding; dl = deep neural models; nlp = language (text/speech); llm = large language models;
// rag = retrieval-augmented generation; agentic = multi-agent / LLM agents; generative = generates text/images/audio;
// cloud = Azure services; fullstack = web front end/back end; iot/embedded = sensors & microcontrollers;
// production = deployed production systems (the two Maaze systems, per the summary).

// The "Case Study" section of the site (src/components/CaseStudy.jsx).
export const caseStudy = {
  title: "Document → JSON",
  basedOn: "maaze-docs",
  stages: ["a document arrives via HTTP or email", "Azure AI Document Intelligence extracts its text and fields", "GPT-5 mini maps them to a form-specific JSON schema", "an ask-the-document assistant answers questions about it"],
  sample: "a commercial property application",
  note: "Illustrative data. Real client documents are confidential.",
};

export const certifications = [
  { name: "Introduction to TensorFlow for AI, ML, and DL", by: "DeepLearning.AI", date: "Mar 24, 2024", match: ["tensorflow"] },
  { name: "Introduction to Web Development", by: "UC Davis", date: "Apr 2, 2025", match: ["web development"] },
  { name: "Object Oriented Programming in Java", by: "UC San Diego", date: "Apr 19, 2023", match: ["java", "oop", "object oriented"] },
  { name: "An Intuitive Introduction to Probability", by: "University of Zurich", date: "Apr 24, 2023", match: ["probability"] },
  { name: "Hackathon certificate", by: "Oriental Group Bhopal", date: "2024", match: [] },
  { name: "Hackathon certificate", by: "GDSC WOW Kerala", date: "2023", match: [] },
];

export const spoken = [
  { name: "English", level: "fluent" }, { name: "Hindi", level: "fluent" }, { name: "Telugu", level: "fluent" }, { name: "German", level: "beginner" },
];

export const activities = [
  { id: "techclub", role: "Senior Executive", org: "Technology Club", when: "2023-24" },
  { id: "coe", role: "Project Sector Executive", org: "COE MetaTech", when: "2023-24" },
  { id: "udhgam", role: "Event Manager", org: "Udhgam Hackathon 2025", when: "2025" },
  { id: "mark", role: "Organizer", org: "MARK XXIV National Hackathon", when: "2023" },
  { id: "ajman", role: "Participant", org: "Ajman University Winter Study Tour", when: "2023", place: "Ajman, UAE", note: "international exposure" },
  { id: "nvidia", role: "Attendee", org: "Nvidia AI Summit, Mumbai", when: "" },
];
