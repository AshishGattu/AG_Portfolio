// Run: node scripts/chat-eval.mjs   [--dev | --holdout] [--verbose] [--samples]
// DEV = the original tuning set (intent label + required facts).
// HOLDOUT = probe questions + paraphrases written from the resume facts BEFORE the mechanism was changed,
// in a deliberately different style. Graded on facts only (no intent labels): required substrings (`has`),
// at-least-one-of groups (`any`), forbidden patterns (`not`), never the generic fallback, and a length cap.
import process from "node:process";
import { respond } from "../src/lib/intents.js";

const NOYES = /\byes\b/i;
// [question, expected intent (string | string[]), [required substrings], { not: [regex] }]
const T = (q, intent, has = [], o = {}) => ({ q, intent, has, ...o });
const cases = [
  // greetings / meta
  T("hi", "greeting", ["Ashish"]), T("hello there", "greeting"), T("hey!", "greeting"), T("good morning", "greeting"), T("namaste", "greeting"),
  T("thanks", "thanks"), T("thank you so much", "thanks"), T("thx", "thanks"), T("bye", "goodbye"), T("ok goodbye", "goodbye"),
  T("who are you?", "help", ["resume assistant"]), T("what can you do?", "help"), T("help", "help"), T("what can I ask?", "help"), T("are you a bot", "help"),
  // about
  T("who is ashish", "about", ["AI & ML Engineer"]), T("tell me about him", "about", ["Maaze"]), T("Tell me about yourself", "about"), T("give me an elevator pitch", "about"),
  T("introduce ashish", "about"), T("summary please", "about"), T("who is the candidate?", "about"), T("brief overview of ashish", "about"),
  // current role / company
  T("where does he work", "current_role", ["Maaze", "AI Engineer"]), T("what does he do now", "current_role", ["Maaze"]), T("is he employed?", "current_role", ["Maaze"]),
  T("what's his current role", "current_role", ["AI Engineer"]), T("where do you work?", "current_role", ["Maaze"]), T("wat does he do for a living", "current_role", ["Maaze"]),
  T("current job?", "current_role", ["Maaze"]), T("who does he work for", "current_role", ["Maaze Underwriting"]), T("is ashish working somewhere", "current_role", ["Maaze"]),
  T("what did he do at srinishtha", "company", ["Srinishtha", "Dec 2024", "80+"]), T("maaze?", "company", ["Maaze", "Jul 2026", "YOLOv5"]),
  T("tell me about his internship", "company", ["Srinishtha", "10 months"]), T("what does he do at Maaze?", "company", ["Document Extraction", "Video Analytics"]),
  T("srinishtha", "company", ["AI Intern"]), T("how long was the internship", "company", ["10 months"]), T("maze underwriting", "company", ["AI Engineer"]),
  // experience
  T("work history", "experience", ["Maaze", "Srinishtha"]), T("previous jobs?", "experience", ["Srinishtha"]), T("how much experience does he have", "experience", ["Dec 2024", "Jul 2026"], { not: [/\b\d+ years\b/] }),
  T("what is his professional experience", "experience", ["Maaze"]), T("where has he worked before", "experience", ["Srinishtha"]), T("his career so far", "experience", ["Maaze"]),
  T("how many years of experience", "experience", ["Jul 2026"], { not: [/\b\d+ years of\b/] }), T("experiance?", "experience", ["Maaze"]),
  // skill check yes
  T("does he know pytorch", "skill_check", ["PyTorch", "Diffusion"], { not: [] }), T("Does he know pytroch?", "skill_check", ["PyTorch"]), T("has he used tensorflow", "skill_check", ["TensorFlow", "Yes"]),
  T("is he good at python", "skill_check", ["Python", "Yes"]), T("can he do computer vision", "skill_check", ["YOLOv5", "Parquik", "Yes"]), T("experience with opencv?", "skill_check", ["OpenCV", "Fashion"]),
  T("yolo", "skill_check", ["YOLOv5", "Maaze"]), T("does ur guy know sklearn", "skill_check", ["Scikit-learn"]), T("do u know langchain", "skill_check", ["LangChain", "HROps"]),
  T("hugging face?", "skill_check", ["Hugging Face"]), T("does he use hf transformers", "skill_check", ["Hugging Face"]), T("what about tf", "skill_check", ["TensorFlow"]),
  T("is he familiar with react", "skill_check", ["React", "HROps"]), T("does he know node js", "skill_check", ["Node.js"]), T("does he use github", "skill_check", ["GitHub"]),
  T("can he code in javascript?", "skill_check", ["JavaScript"]), T("does he have experience with RAG", "skill_check", ["RAG", "CyberGPT", "Srinishtha"]),
  T("has he worked with llms", "skill_check", ["Maaze", "WealthMaps"]), T("is he into agentic ai", "skill_check", ["HROps"]), T("any multi-agent experience", "skill_check", ["HROps"]),
  T("does he do full stack", "skill_check", ["WealthMaps", "EduSense"]), T("web dev experience?", "skill_check", ["EduSense"]), T("IoT experience", "skill_check", ["Smart Stream", "Get-Fit"]),
  T("does he know arduino", "skill_check", ["Arduino", "Get-Fit"]), T("hardware?", "skill_check", ["Arduino"]), T("azure experience", "skill_check", ["Azure", "Maaze"]),
  T("does he know cloud", "skill_check", ["Azure"]), T("is he good with nlp", "skill_check", ["NLP"]), T("does he know cv2", "skill_check", ["OpenCV"]),
  T("does he know deep learning", "skill_check", ["Deep Learning"]), T("pandas?", "skill_check", ["Pandas"]), T("does he know figma", "skill_check", ["Figma"]),
  T("how good is he at postgres", "skill_check", ["PostgreSQL", "EduSense"]), T("does he know keras", "skill_check", ["Keras"]), T("what about numpy", "skill_check", ["NumPy"]),
  T("what's your experience with azure openai", "skill_check", ["Azure"]), T("does he know gpt", "skill_check", ["GPT-5 mini"]),
  // skill check negative
  T("does he know rust", "skill_check", ["isn't on Ashish's resume"], { not: [NOYES] }), T("kubernetes?", "skill_check", ["isn't on Ashish's resume"], { not: [NOYES] }),
  T("does he know java?", "skill_check", ["Java isn't one of Ashish's listed skills", "UC San Diego"], { not: [NOYES] }), T("is he good at java", "skill_check", ["UC San Diego"], { not: [NOYES] }),
  T("docker?", "skill_check", ["closest"], { not: [NOYES] }), T("does he know aws", "skill_check", ["Azure"], { not: [NOYES] }), T("has he used c++", "skill_check", ["Python"], { not: [NOYES] }),
  T("does he know sql", "skill_check", ["PostgreSQL"], { not: [NOYES] }), T("can he use mongodb", "skill_check", ["closest"], { not: [NOYES] }), T("does he know angular", "skill_check", ["React"], { not: [NOYES] }),
  T("does he know cobol", "skill_unknown", ["doesn't appear"], { not: [NOYES] }), T("is he proficient in fortran", "skill_unknown", [], { not: [NOYES] }),
  // skills lists
  T("what are his skills", "skills_list", ["PyTorch", "Azure", "Python"]), T("tech stack?", "skills_list", ["Frameworks"]), T("which ml frameworks does he use", "skills_list", ["PyTorch", "TensorFlow", "Keras"]),
  T("what programming languages does he know", "skills_list", ["Python", "JavaScript"]), T("cloud skills", "skills_list", ["Azure"]), T("what tools does he use", "skills_list", ["Git", "Figma"]),
  T("ml frameworks", "skills_list", ["Scikit-learn"]), T("technologies he works with", "skills_list", ["Python"]), T("frameworkz?", "skills_list", ["PyTorch"]),
  T("what ai techniques does he know", "skills_list", ["Deep Learning", "RAG"]), T("libraries?", "skills_list", ["NLTK"]), T("what is he good at", "strengths", ["Python", "computer vision"]),
  // projects
  T("what projects has he built", "projects_list", ["HROps", "WealthMaps", "Parquik"]), T("show me his projects", "projects_list", ["Get-Fit"]), T("portfolio", "projects_list", ["CyberGPT"]),
  T("what is his best project", "project_best", ["WealthMaps", "Document Extraction"]), T("most impressive thing he built", "project_best", ["Smart Stream"]),
  T("tell me about hrops", "project_detail", ["4 agents", "LangChain"]), T("wealthmaps", "project_detail", ["National 3rd", "Llama"]), T("what is parquik", "project_detail", ["parking", "Bhopal"]),
  T("get fit project", "project_detail", ["Arduino", "Kerala"]), T("emotion s2s?", "project_detail", ["speech-to-speech"]), T("tell me about cybergpt", "project_detail", ["Qdrant", "Phidata"]),
  T("edusense", "project_detail", ["80+ branches", "PostgreSQL"]), T("fashion advisory", "project_detail", ["CNNs", "OpenCV"]), T("diffusion model project", "project_detail", ["DDPM", "PyTorch"]),
  T("insurance document extraction platform", "project_detail", ["Azure AI Document Intelligence"]), T("any computer vision projects", "projects_by_tech", ["Parquik", "Video Analytics", "Fashion"]),
  T("anything with LLMs?", "projects_by_tech", ["Document Extraction", "WealthMaps"]), T("projects using pytorch", "projects_by_tech", ["Diffusion"]), T("which projects use react", "projects_by_tech", ["HROps", "EduSense"]),
  T("any rag projects", "projects_by_tech", ["CyberGPT"]), T("projects with yolo", "projects_by_tech", ["Video Analytics"]), T("any iot projects", "projects_by_tech", ["Get-Fit", "Smart Stream"]),
  // achievements / patent
  T("did he win anything", "achievements", ["National 3rd", "Parquik"]), T("hackathon wins?", "achievements", ["WealthMaps", "Get-Fit"]), T("hackthon", "achievements", ["National 3rd"]),
  T("any awards", "achievements", ["Most Innovative"]), T("national rank?", "achievements", ["3rd"]), T("what are his achievements", "achievements", ["Top 10"]),
  T("tell me about the patent", "patent", ["202641011870-A", "Smart Stream"]), T("has he published anything", "patent", ["patent"]), T("any research papers", "patent", ["no research papers"]),
  T("publications", "patent", ["patent"]), T("patent?", "patent", ["Indian Patent Office"]), T("what is smart stream", "patent", ["ESP32"]),
  // education
  T("tell me about his education", "edu_overall", ["Woxsen", "3.4", "90%", "94%"]), T("what's your cgpa", "edu_cgpa", ["3.4"]), T("cgpa", "edu_cgpa", ["3.4/4.0"]),
  T("what is his cgap", "edu_cgpa", ["3.4"]), T("gpa?", "edu_cgpa", ["3.4"]), T("how are his grades", ["edu_marks", "edu_cgpa"], ["3.4"]), T("what was his 12th percentage", "edu_12", ["90%", "Narayana"]),
  T("intermediate marks", "edu_12", ["90%"]), T("pcm score", "edu_12", ["90%"]), T("10th marks?", "edu_10", ["94%", "St. Andrews"]), T("cbse percentage", "edu_10", ["94%"]),
  T("which university does he go to", "edu_uni", ["Woxsen"]), T("where did he study", "edu_uni", ["Woxsen"]), T("college name", "edu_uni", ["Woxsen"]), T("woxsen", "edu_uni", ["Woxsen"]),
  T("when does he graduate", "edu_grad", ["2026"]), T("graduation year?", "edu_grad", ["2026"]), T("year of passing out", "edu_grad", ["2026"]), T("what did he study", "edu_major", ["AI & Machine Learning"]),
  T("what is his major", "edu_major", ["B.Tech"]), T("which degree", "edu_major", ["B.Tech"]), T("what percentage did he score", "edu_marks", ["90%", "94%", "3.4"]),
  T("narayana junior college", "edu_12", ["Narayana"]), T("qualifications", "edu_overall", ["Woxsen"]),
  // certs / languages / activities
  T("what certifications does he have", "certs", ["TensorFlow", "UC Davis", "Java"]), T("any courses", "certs", ["Zurich"]), T("certificates?", "certs", ["GDSC WOW Kerala"]), T("coursera?", "certs", ["DeepLearning.AI"]),
  T("which languages does he speak", "spoken", ["English", "Hindi", "Telugu", "German"]), T("does he speak german", "spoken", ["beginner German"]), T("can he speak hindi", "spoken", ["fluent in Hindi"]),
  T("does he speak french", "spoken", ["isn't listed"], { not: [NOYES] }), T("is he fluent in english", "spoken", ["English"]), T("telugu?", "spoken", ["Telugu"]),
  T("what extracurricular activities does he do", "activities", ["Technology Club", "Udhgam"]), T("leadership experience", "activities", ["COE MetaTech"]), T("clubs?", "activities", ["Technology Club"]),
  T("any international exposure", "activities", ["Ajman"]), T("events he organised", "activities", ["MARK XXIV", "Udhgam"]), T("tell me about udhgam", "activity_detail", ["Event Manager"]),
  T("mark xxiv", "activity_detail", ["Organizer"]), T("did he go to nvidia summit", "activity_detail", ["Nvidia AI Summit"]), T("ajman", "activity_detail", ["Ajman University"]),
  T("what was his role at the tech club", "activity_detail", ["Senior Executive"]), T("coe metatech", "activity_detail", ["Project Sector Executive"]),
  // contact
  T("what's his email", "contact_email", ["ashishg2204@gmail.com"]), T("email?", "contact_email", ["ashishg2204@gmail.com"]), T("phone number", "contact_phone", ["+91 70324 15999"]),
  T("can i call him", "contact_phone", ["+91"]), T("linkedin", "contact_linkedin", ["ashish-gattu"]), T("what's your linkedin", "contact_linkedin", ["linkedin.com/in/ashish-gattu"]),
  T("github profile", "contact_github", ["AshishGattu"]), T("github?", "contact_github", ["github.com/AshishGattu"]), T("where is he based", "location", ["Hyderabad"]),
  T("is he in hyderabad", "location", ["Yes", "Hyderabad"]), T("is he in bangalore?", "location", ["Hyderabad", "relocation"], { not: [NOYES] }), T("where do you live", "location", ["Hyderabad"]),
  T("how do I contact him", "contact", ["ashishg2204@gmail.com", "LinkedIn"]), T("how can i reach ashish", "contact", ["Phone"]), T("how do i hire him", "hire", ["ashishg2204@gmail.com", "Maaze"]),
  T("is he open to opportunities", "hire", ["doesn't state availability"]), T("can i get his resume", "resume_dl", ["Ashish_Gattu_Resume_2026.pdf", "Download Resume"]),
  T("download cv", "resume_dl", ["Ashish_Gattu_Resume_2026.pdf"]), T("send me the resume pdf", "resume_dl", ["⌘K"]),
  // out of scope
  T("what is his salary", ["out_of_scope", "not_stated"], ["ashishg2204@gmail.com"]), T("how old is he", ["out_of_scope", "not_stated"]), T("is he married", "out_of_scope"), T("who won the world cup", "out_of_scope"),
  T("write me a python script", "out_of_scope"), T("tell me a joke", "out_of_scope"), T("what is the capital of france", "out_of_scope"), T("what are his hobbies", ["out_of_scope", "not_stated"], ["doesn't list hobbies"]),
  T("expected ctc?", ["out_of_scope", "not_stated"], ["ashishg2204@gmail.com"]), T("what's the weather", "out_of_scope"),
  // multi-part
  T("what's his CGPA and where does he work?", "edu_cgpa+current_role", ["3.4", "Maaze"]), T("email and education", "contact_email+edu_overall", ["ashishg2204", "Woxsen"]),
  T("what are his skills and hackathon wins?", "skills_list+achievements", ["PyTorch", "National 3rd"]), T("tell me about the patent and his certifications", "patent+certs", ["Smart Stream", "UC Davis"]),
  T("where is he based? also what languages does he speak", "location+spoken", ["Hyderabad", "Telugu"]), T("his 10th marks and 12th marks", "edu_10+edu_12", ["94%", "90%"]),
  T("what did he do at srinishtha and maaze", "company", ["Srinishtha", "Maaze"]),
];

cases.push(

  // extra phrasings (written after first pass, to probe robustness)
  T("yo whats up", "greeting"), T("can u tell me abt ashish", "about"), T("so what's his deal", "about", [], { soft: true }),
  T("which company is he at", "current_role", ["Maaze"]), T("his employer", "current_role", ["Maaze"]), T("what is he doing these days", "current_role", ["Maaze"]),
  T("any internships?", "company", ["Srinishtha"]), T("hav u done any internship", "company", ["Srinishtha"]), T("list his jobs", "experience", ["Maaze"]),
  T("is he a fresher", "experience", ["Maaze"]), T("does he know pyTorch and tensorflow", "skill_check", ["PyTorch", "TensorFlow"]), T("tensorflow vs pytorch which does he know", "skill_check", ["PyTorch", "TensorFlow"]),
  T("what's ur tech stack", "skills_list", ["PyTorch"]), T("which cloud platforms has he used", "skills_list", ["Azure"]), T("can he work with transformers", "skill_check", ["Hugging Face"]),
  T("does he know machine learning", "skill_check", ["machine learning"]), T("has he done any object detection", "skill_check", ["YOLOv5"]), T("what has he done with generative ai", "skill_check", ["WealthMaps"]),
  T("has he built chatbots", "skill_check", ["Srinishtha"], { soft: true }), T("what's his cgpa out of 4", "edu_cgpa", ["3.4/4.0"]), T("how much did he get in 12th", "edu_12", ["90%"]),
  T("btech cgpa?", "edu_cgpa", ["3.4"]), T("what year does he finish college", "edu_grad", ["2026"]), T("what is he studying", "edu_major", ["AI & Machine Learning"]),
  T("did he get any prizes", "achievements", ["National 3rd"]), T("what competitions has he won", "achievements", ["Parquik"]), T("any publications or patents", "patent", ["Smart Stream"]),
  T("show hackathon certificates", "certs", ["Oriental Group Bhopal"]), T("does he speak telugu", "spoken", ["Telugu"]), T("languages?", "spoken", ["English", "Python"]),
  T("what's his mail id", "contact_email", ["ashishg2204"]), T("whatsapp number?", "contact_phone", ["70324"]), T("drop me his linkedin", "contact_linkedin", ["linkedin.com"]),
  T("is he based in india", "location", ["Hyderabad"]), T("will he relocate", "location", ["doesn't mention relocation"]), T("i want to hire him", "hire", ["ashishg2204"]),
  T("where can i download his resume", "resume_dl", ["Ashish_Gattu_Resume_2026.pdf"]), T("what's his religion", "out_of_scope"), T("do you like pizza", "out_of_scope"), T("which team does he support in ipl", "fallback", [], { soft: true })
);

const seqs = [
  { name: "cgpa then 12th", steps: [T("what's his CGPA?", "edu_cgpa", ["3.4"]), T("and his 12th?", "edu_12", ["90%"]), T("what about 10th", "edu_10", ["94%"])] },
  { name: "skill then other skill", steps: [T("does he know pytorch?", "skill_check", ["PyTorch"]), T("what about tensorflow?", "skill_check", ["TensorFlow"]), T("which project?", "where_used", [])] },
  { name: "where used", steps: [T("does he know opencv", "skill_check", ["OpenCV"]), T("which project?", "where_used", ["Fashion"])] },
  { name: "tell me more company", steps: [T("maaze?", "company", ["Maaze"]), T("tell me more", "more", ["Tech: Azure AI Document Intelligence"])] },
  { name: "tell me more project", steps: [T("tell me about hrops", "project_detail", ["HROps"]), T("more details", "more", ["covers everything"])] },
  { name: "projects by tech follow-up", steps: [T("any projects with pytorch", "projects_by_tech", ["Diffusion"]), T("what about opencv?", "projects_by_tech", ["Fashion"])] },
  { name: "company switch", steps: [T("what did he do at maaze", "company", ["Maaze"]), T("what about srinishtha?", "company", ["Srinishtha"])] },
  { name: "more with no context", steps: [T("tell me more", "more", ["resume assistant"])] },
  { name: "greeting then question", steps: [T("hi", "greeting"), T("his cgpa?", "edu_cgpa", ["3.4"]), T("thanks!", "thanks")] },
  { name: "contact chain", steps: [T("how can I reach him", "contact", ["Email"]), T("and linkedin?", "contact_linkedin", ["ashish-gattu"]), T("github?", "contact_github", ["AshishGattu"])] },
];


/* ------------------------------------------------------------------ */
/* HOLDOUT                                                             */
/* ------------------------------------------------------------------ */
const FALLBACK_RE = /couldn't find/i;
const NOT_STATED = ["not stated", "doesn't state", "doesn't mention", "isn't stated", "does not state", "doesn't say", "doesn't list", "not on his resume", "isn't on"];
// H(question, { has: [all of], any: [[one of], ...], not: [regex], fallbackOk })
const H = (q, o = {}) => ({ q, has: o.has || [], any: o.any || [], not: o.not || [], fallbackOk: !!o.fallbackOk, maxLen: o.maxLen || 1100 });
const PITCH = { any: [["AI & ML Engineer", "AI Engineer"], ["3rd", "patent"]], not: [/\+91/, FALLBACK_RE] };
const META = { any: [["assistant"]], has: ["Ashish"], not: [FALLBACK_RE] };

const probe = [
  H("so what's his deal", PITCH),
  H("give me a quick rundown of this guy", PITCH),
  H("what is he best at", { has: ["computer vision"], any: [["agentic", "multi-agent"], ["production", "Maaze"]] }),
  H("why should we hire him", { has: ["AI Engineer", "3rd", "patent", "ashishg2204@gmail.com"], any: [["multi-agent", "HROps"]] }),
  H("whats ur name", { has: ["assistant", "Ashish Gattu"] }),
  H("who are you", META),
  H("what kind of roles is he looking for", { any: [NOT_STATED, ["AI & ML Engineer"]], has: ["ashishg2204@gmail.com"], not: [/Srinishtha/] }),
  H("did he go abroad", { has: ["Ajman", "UAE", "2023"], not: [/Technology Club/, /COE MetaTech/] }),
  H("has he deployed anything to production", { has: ["Yes", "Document Extraction", "Video Analytics"] }),
  H("whats he currently working on", { has: ["Maaze"], not: [/^Yes/] }),
  H("what does the case study show", { has: ["Azure AI Document Intelligence", "GPT-5 mini", "JSON"], any: [["illustrative", "fictional"]], not: [/Woxsen/] }),
  H("what computer vision work has he done", { has: ["Parquik", "Video Analytics", "Fashion"], not: [/Smart Stream/] }),
  H("does he know deep learning", { has: ["Emotion S2S", "Diffusion"], any: [["YOLOv5", "Video Analytics"]] }),
  H("has he done any nlp", { has: ["CyberGPT", "HROps", "Document Extraction"] }),
  H("any multi-agent experience?", { has: ["HROps", "CyberGPT"] }),
  H("tell me about wealthmaps", { has: ["full-stack", "Llama", "3rd"] }),
  H("does he have cloud experience", { has: ["Azure", "Maaze"], not: [/Smart Stream[^.\n]*Azure/] }),
  H("where has he used azure", { has: ["Document Extraction"], not: [/Smart Stream/] }),
  H("what's his deal with iot", { has: ["Smart Stream", "Get-Fit"] }),
  H("tell me something interesting about him", PITCH),
  H("what makes him stand out", PITCH),
  H("summarise him in a line", { any: [["AI & ML Engineer"]], maxLen: 500 }),
  H("are you an AI?", META),
  H("how do you work", META),
  H("what can I ask you", { any: [["CGPA", "PyTorch", "Maaze"]] }),
  H("what's his salary expectation", { any: [[...NOT_STATED, "isn't something"]], has: ["ashishg2204@gmail.com"] }),
  H("is he willing to relocate", { has: ["Hyderabad"], any: [NOT_STATED], not: [/\byes\b/i] }),
  H("does he need visa sponsorship", { any: [[...NOT_STATED, "isn't something"]], not: [/\byes\b/i] }),
  H("what's his notice period", { any: [NOT_STATED], not: [/\byes\b/i] }),
  H("what's his gpa in percentage", { has: ["3.4"], any: [NOT_STATED] }),
  H("what are his hobbies", { any: [[...NOT_STATED, "isn't something"]], not: [/\byes\b/i] }),
  H("how old is he", { any: [[...NOT_STATED, "isn't something"]] }),
];

const paraphrase = [
  // recruiter-speak
  H("Can you give me a high-level overview of the candidate's profile?", { has: ["AI & ML Engineer"] }),
  H("What's the candidate's current employer and title?", { has: ["Maaze", "AI Engineer"] }),
  H("Does the candidate have hands-on experience with LLMs in a production setting?", { has: ["Yes", "Document Extraction"] }),
  H("What is his total years of experience?", { any: [["Dec 2024", "Jul 2026"]], not: [/\b\d+\+? years of experience\b/] }),
  H("Is he an immediate joiner?", { any: [NOT_STATED], has: ["ashishg2204@gmail.com"], not: [/\byes\b/i] }),
  H("What's his expected CTC?", { any: [[...NOT_STATED, "isn't something"]] }),
  H("Is the candidate open to relocating to Bangalore?", { has: ["Hyderabad"], not: [/\byes\b/i] }),
  H("Does he hold any patents?", { has: ["Smart Stream", "202641011870-A"] }),
  H("Any certifications relevant to ML?", { has: ["TensorFlow", "DeepLearning.AI"] }),
  H("What's his educational qualification?", { has: ["B.Tech", "Woxsen"] }),
  H("Has he led any teams or held leadership positions?", { any: [["Technology Club", "Event Manager", "Senior Executive"]] }),
  H("Could you share the candidate's LinkedIn profile?", { has: ["linkedin.com/in/ashish-gattu"] }),
  // very casual
  H("yo what does this dude do", { has: ["Maaze", "AI Engineer"] }),
  H("he any good w/ python?", { has: ["Python"] }),
  H("lol did he win stuff", { has: ["3rd"] }),
  H("wat school he go to", { any: [["Woxsen", "St. Andrews"]] }),
  H("ok but like what's he built", { has: ["HROps", "WealthMaps"] }),
  H("gimme his email", { has: ["ashishg2204@gmail.com"] }),
  H("ugh just tell me his number", { has: ["+91 70324 15999"] }),
  H("sup with his grades", { has: ["3.4"] }),
  H("is he legit good at ml or nah", { any: [["machine learning", "Machine Learning"]], not: [FALLBACK_RE] }),
  // indirect
  H("I'm hiring for a computer vision role — is he relevant?", { has: ["YOLOv5", "Parquik"], not: [/Smart Stream/] }),
  H("We're building RAG pipelines; has he touched that?", { has: ["CyberGPT", "Srinishtha"] }),
  H("Our stack is React and Node — would he fit in?", { has: ["React", "Node.js"] }),
  H("I'm curious whether he's ever worked with hardware", { has: ["Arduino"], any: [["Get-Fit", "Smart Stream"]] }),
  H("would he be comfortable with agent frameworks", { has: ["HROps"], any: [["LangChain", "Phidata"]] }),
  H("I need someone who can build chatbots", { any: [["RAG", "chatbot"]], has: ["Srinishtha"] }),
  // long-winded
  H("Hi there, I was looking through the portfolio and I wanted to know a little bit more about what exactly he does at his current company, if you don't mind", { has: ["Maaze", "Document Extraction"] }),
  H("So I've got a client looking for someone who knows their way around deep learning frameworks like PyTorch or TensorFlow, can you tell me whether he has used those", { has: ["PyTorch", "TensorFlow"] }),
  H("Before I set up an interview I want to double check his education details, specifically which university and what his grades were", { has: ["Woxsen", "3.4"] }),
  H("I was wondering, if it's not too much trouble, whether you could tell me what kinds of awards or recognition he has picked up over the years", { has: ["3rd", "Most Innovative"] }),
  // non-native English
  H("he is having knowledge in machine learning?", { any: [["machine learning", "Machine Learning"]] }),
  H("kindly share his contact details", { has: ["ashishg2204@gmail.com", "+91"] }),
  H("what is his qualification and from which college he passed", { has: ["B.Tech", "Woxsen"] }),
  H("he did any internship before?", { has: ["Srinishtha"] }),
  H("please tell about his project experiences", { has: ["HROps"] }),
  H("in which company he is working presently", { has: ["Maaze"] }),
  H("how much marks he got in 10th standard", { has: ["94%"] }),
  H("he is knowing azure or not", { has: ["Azure"] }),
  // one-word
  H("patent", { has: ["Smart Stream"] }),
  H("awards", { has: ["3rd"] }),
  H("skills", { has: ["PyTorch"] }),
  H("contact", { has: ["ashishg2204@gmail.com"] }),
  H("education", { has: ["Woxsen"] }),
  H("internship", { has: ["Srinishtha"] }),
  H("location", { has: ["Hyderabad"] }),
  H("certs", { has: ["TensorFlow"] }),
  H("yolov5", { has: ["Video Analytics"] }),
  H("frameworks", { has: ["PyTorch"] }),
  H("strengths", { has: ["computer vision"] }),
  H("background", { any: [["AI & ML Engineer", "Woxsen"]] }),
  // emoji / punctuation heavy
  H("🔥🔥 what's his best project??!!", { any: [["WealthMaps", "Document Extraction"]] }),
  H("does he know pytorch?!?! 🙏", { has: ["PyTorch", "Yes"] }),
  H("email??? 📧", { has: ["ashishg2204@gmail.com"] }),
  H("CGPA...?", { has: ["3.4"] }),
  H("hackathons!!! 🏆", { has: ["3rd"] }),
  H("where does he work 🤔", { has: ["Maaze"] }),
  H("...tensorflow?", { has: ["TensorFlow"] }),
  H("👋", { not: [/\+91/] , fallbackOk: true }),
  // interview-style
  H("walk me through his work experience", { has: ["Maaze", "Srinishtha"] }),
  H("walk me through the HROps project", { has: ["4 agents", "LangChain"] }),
  H("tell me about a time he worked on computer vision", { any: [["YOLOv5", "Parquik"]], not: [/Smart Stream/] }),
  H("what was his role at Srinishtha", { has: ["AI Intern"] }),
  H("describe his most complex project", { any: [["WealthMaps", "Document Extraction"]] }),
  H("how did he use YOLOv5", { has: ["Video Analytics"], any: [["person detection", "tracking"]] }),
  H("explain the insurance document project", { has: ["Azure AI Document Intelligence", "JSON"] }),
  // comparisons
  H("which is his strongest project", { any: [["WealthMaps", "Document Extraction"]] }),
  H("is he more into CV or NLP?", { has: ["computer vision"], any: [["NLP", "LLM"]] }),
  H("pytorch or tensorflow, which does he prefer", { has: ["PyTorch", "TensorFlow"] }),
  H("which hackathon did he do best in", { has: ["3rd", "WealthMaps"] }),
  // time questions
  H("when did he start at Maaze", { has: ["Jul 2026"] }),
  H("how many months did he intern at srinishtha", { has: ["10 months"] }),
  H("what year will he be done with his degree", { has: ["2026"] }),
  H("when did he join Srinishtha", { has: ["Dec 2024"] }),
  H("when did the internship end", { has: ["Sep 2025"] }),
  H("when did he file the patent", { has: ["2026"] }),
  H("when did he win the national 3rd place", { has: ["2024"] }),
  H("when was the ajman trip", { has: ["2023"] }),
  H("since when has he been at maaze", { has: ["Jul 2026"] }),
  H("when did he finish 12th", { any: [["2020-22", "2022"]] }),
  H("how long has he been working", { any: [["Dec 2024", "Jul 2026"]], not: [/\b\d+ years of experience\b/] }),
  H("what year did he start college", { has: ["2022"] }),
  // where
  H("where did he intern", { has: ["Srinishtha", "Hyderabad"] }),
  H("where did he win most innovative project", { has: ["Bhopal"] }),
  H("where did he do his schooling", { any: [["St. Andrews", "Narayana"]] }),
  H("where's he based", { has: ["Hyderabad"] }),
  // how many
  H("how many projects has he done", { any: [["9", "nine"]] }),
  H("how many hackathons has he placed in", { any: [["3", "three"]] }),
  H("how many agents does hrops have", { has: ["4"] }),
  H("how many languages does he speak", { any: [["4", "four"]], has: ["English"] }),
  H("how many branches did edusense support", { has: ["80+"] }),
  H("how many certifications does he have", { any: [["6", "six", "4 ", "four"]] }),
  // who
  H("who did he intern with", { has: ["Srinishtha"] }),
  H("who issued his tensorflow certificate", { has: ["DeepLearning.AI"] }),
  // negatives (no false "yes")
  H("has he ever worked with AWS?", { has: ["Azure"], not: [/\byes\b/i] }),
  H("is he a java developer", { not: [/\byes\b/i], any: [["UC San Diego", "Java isn't"]] }),
  H("does he have a PhD", { has: ["B.Tech"], not: [/\byes\b/i] }),
  H("did he work at Google", { has: ["Maaze"], not: [/\byes\b/i] }),
  H("is he certified in AWS", { not: [/\byes\b/i] }),
  H("does he speak japanese", { has: ["English"], not: [/\byes\b/i] }),
  H("has he published research papers", { has: ["patent"], not: [/\byes\b/i] }),
  H("does he have 5 years of experience", { any: [["Dec 2024", "Jul 2026"]], not: [/\byes\b/i] }),
  H("is he a senior engineer", { has: ["AI Engineer"], not: [/\byes\b/i] }),
  // meta
  H("is this chatgpt?", META),
  H("how does this chatbot work", META),
  H("what's your name, bot?", { has: ["assistant", "Ashish Gattu"] }),
  // vague / open-ended
  H("what's special about him", PITCH),
  H("give me the tl;dr on ashish", PITCH),
  H("sell me on this candidate", PITCH),
  H("what are his strengths", { has: ["computer vision"], any: [["agentic", "multi-agent"]] }),
  H("what's his superpower", { has: ["computer vision"] }),
  H("tell me anything cool about him", PITCH),
  // case study
  H("explain the case study section", { has: ["JSON"], any: [["Azure", "GPT-5 mini"]], not: [/Woxsen/] }),
  H("is the case study real client data", { any: [["illustrative", "fictional"]], not: [/\byes\b/i] }),
];

// HOLDOUT-2: written after the first holdout run (and before the fixes it prompted), never used for tuning.
const holdout2 = [
  H("what kinda engineer is he", { has: ["AI"], any: [["Maaze"]] }),
  H("quick q — is he still a student?", { any: [["2026", "Woxsen"]] }),
  H("bro what's his strongest skill", { has: ["computer vision"] }),
  H("tell me 3 things about ashish", PITCH),
  H("what's he like as an engineer", PITCH),
  H("whats this assistant", META),
  H("r u human", META),
  H("does he have experience with object detection?", { has: ["YOLOv5"], not: [/Smart Stream/] }),
  H("which of his projects use LLMs", { has: ["WealthMaps", "HROps", "CyberGPT"] }),
  H("anything with transformers / hugging face?", { has: ["Hugging Face"] }),
  H("is the patent granted", { has: ["202641011870-A"], not: [/\byes\b/i] }),
  H("is smart stream a computer vision project", { has: ["No"], not: [/\byes\b/i] }),
  H("does wealthmaps use react", { has: ["Yes", "React"] }),
  H("has he worked at amazon", { has: ["Maaze"], not: [/\byes\b/i] }),
  H("does he have an MBA", { has: ["B.Tech"], not: [/\byes\b/i] }),
  H("what is his expected stipend", { any: [NOT_STATED] }),
  H("where does he want to work next", { any: [NOT_STATED] }),
  H("can he work from our Bangalore office", { has: ["Hyderabad"], not: [/\byes\b/i] }),
  H("when did his internship start", { has: ["Dec 2024"] }),
  H("how long has he been at his current job", { has: ["Jul 2026"] }),
  H("in which year did he do his 10th", { any: [["2018-20", "2020"]] }),
  H("when was emotion s2s built", { any: [[...NOT_STATED, "doesn't give a date"]] }),
  H("where was the get-fit hackathon", { has: ["Kerala"] }),
  H("how many people did he manage", { not: [/\byes\b/i, /\b\d+ people\b/] , fallbackOk: true }),
  H("what does the document extraction thing do", { has: ["JSON"], any: [["Azure", "GPT-5 mini"]] }),
  H("explain the retail analytics project", { has: ["YOLOv5"], any: [["heatmap", "footfall", "dwell"]] }),
  H("does his cv work include the patent", { not: [/\byes\b/i] }),
  H("what deep learning has he done", { has: ["Diffusion", "Emotion S2S"] }),
  H("what's the case study about?", { has: ["JSON"], not: [/Woxsen/] }),
  H("i'd like to know his contact info pls", { has: ["ashishg2204@gmail.com"] }),
  H("👍 thanks!!", { not: [FALLBACK_RE] }),
  H("what are you", META),
];

const holdoutSeqs = [
  { name: "opencv then which project", steps: [H("does he know opencv", { has: ["OpenCV"] }), H("which projects?", { has: ["Fashion"] })] },
  { name: "maaze then when", steps: [H("what did he do at maaze", { has: ["Maaze"] }), H("when did he start there?", { has: ["Jul 2026"] })] },
  { name: "hrops then tech", steps: [H("tell me about hrops", { has: ["HROps"] }), H("what tech did he use for it", { has: ["LangChain"] })] },
  { name: "internship then how long", steps: [H("tell me about the internship", { has: ["Srinishtha"] }), H("how long was that", { has: ["10 months"] })] },
];

/* ------------------------------------------------------------------ */
/* Runner                                                              */
/* ------------------------------------------------------------------ */
const verbose = process.argv.includes("--verbose");
const only = process.argv.includes("--dev") ? "dev" : process.argv.includes("--holdout") ? "holdout" : null;

function gradeDev(tc, r) {
  const wantIntent = Array.isArray(tc.intent) ? tc.intent : [tc.intent];
  const errs = [];
  // "bm25:X" = BM25 picked topic X and X's template answered.
  if (!tc.soft && !wantIntent.includes(r.intent.replace(/^bm25:/, ""))) errs.push(`intent ${r.intent} != ${wantIntent.join("|")}`);
  for (const h of tc.has) if (!r.text.toLowerCase().includes(h.toLowerCase())) errs.push(`missing "${h}"`);
  for (const n of tc.not || []) if (n.test(r.text)) errs.push(`forbidden ${n}`);
  return errs;
}
function gradeHoldout(tc, r) {
  const t = r.text.toLowerCase();
  const errs = [];
  for (const h of tc.has) if (!t.includes(h.toLowerCase())) errs.push(`missing "${h}"`);
  for (const g of tc.any) if (!g.some((h) => t.includes(h.toLowerCase()))) errs.push(`missing one of [${g.join(" | ")}]`);
  for (const n of tc.not) if (n.test(r.text)) errs.push(`forbidden ${n}`);
  if (!tc.fallbackOk && FALLBACK_RE.test(r.text)) errs.push("fell back");
  if (r.text.length > tc.maxLen) errs.push(`too long (${r.text.length})`);
  return errs;
}

function runSet(name, singles, sequences, grade) {
  let pass = 0, total = 0;
  const fails = [];
  const check = (tc, r, label) => {
    total++;
    const errs = grade(tc, r);
    if (errs.length) fails.push({ label, q: tc.q, errs, text: r.text, intent: r.intent }); else pass++;
    if (verbose) console.log(`${errs.length ? "FAIL" : "ok  "} [${r.intent}] ${tc.q}\n     ${r.text.replace(/\n/g, "\n     ")}`);
  };
  for (const tc of singles) check(tc, respond(tc.q, {}), "single");
  for (const s of sequences) {
    let st = {};
    s.steps.forEach((tc, i) => { const r = respond(tc.q, st); st = r.state; check(tc, r, `seq:${s.name}#${i + 1}`); });
  }
  console.log(`\n== ${name}: ${pass}/${total} passed (${((100 * pass) / total).toFixed(1)}%)`);
  for (const f of fails) console.log(`  FAIL (${f.label}) [${f.intent}] "${f.q}"\n    ${f.errs.join("; ")}\n    -> ${f.text.slice(0, 260).replace(/\n/g, " / ")}`);
  return pass / total;
}

let devRate = 1;
if (only !== "holdout") devRate = runSet("DEV", cases, seqs, gradeDev);
if (only !== "dev") {
  runSet("HOLDOUT probe", probe, [], gradeHoldout);
  runSet("HOLDOUT paraphrase", paraphrase, holdoutSeqs, gradeHoldout);
  if (process.argv.includes("--holdout2") || !only) runSet("HOLDOUT-2 (fresh)", holdout2, [], gradeHoldout);
}
if (process.argv.includes("--samples")) for (const tc of probe) console.log(`\nQ: ${tc.q}\nA: ${respond(tc.q, {}).text}`);
if (devRate < 0.97) process.exitCode = 1;
