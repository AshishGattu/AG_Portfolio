import React, { useRef, useState } from "react";
import { motion, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const projects = [
  {
    id: 1,
    title: "Emotion S2S",
    category: "Voice AI & Neural Translation",
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1000&auto=format&fit=crop",
    tech: "Deep Learning, Audio Processing, Python",
    year: "2026",
    description: "An advanced Speech-to-Speech (S2S) translation architecture engineered to cross language barriers while strictly preserving the speaker's original vocal identity. Utilizing deep learning for voice cloning and emotional prosody retention, the model extracts acoustic features from the source audio and maps them to the translated output, ensuring the final synthesized voice retains the exact tone, pitch, and emotion of the original speaker."
  },
  {
    id: 2,
    title: "HROps",
    category: "Multi-Agent System",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop",
    tech: "LangChain, Node.js, React.js",
    year: "2025",
    description: "A comprehensive multi-agent AI ecosystem designed to autonomously orchestrate human resource operations. Built on a modern React and Node.js stack powered by LangChain, the architecture deploys specialized LLM-driven agents to handle manual HR overhead. This includes automated resume parsing and semantic screening, dynamic candidate communication, and rigorous onboarding compliance verification, effectively reducing administrative bottlenecks."
  },
  {
    id: 3,
    title: "CyberGPT 2",
    category: "Compliance AI & RAG",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    tech: "Phidata, Python, Qdrant, RAG",
    year: "2025",
    description: "An enterprise-grade governance and compliance verification engine utilizing a Multi-Agent architecture. The system ingests complex regulatory frameworks (RBI, ISO, TRM) and converts them into high-dimensional vector embeddings stored in Qdrant. By leveraging Retrieval-Augmented Generation (RAG) and semantic search, autonomous agents audit corporate controls against policy documents, surfacing compliance gaps through an interactive diagnostic chatbot."
  },
  {
    id: 4,
    title: "EduSense",
    category: "Full Stack Management",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
    tech: "React, Ruby, Roda, PostgreSQL",
    year: "2024",
    description: "A highly scalable Educational Management Information System (EMIS) engineered to centralize administration for massive institutional networks spanning over 80 branches. The robust backend, optimized with Ruby on Roda and PostgreSQL, ensures high-throughput data transactions for student records and faculty logistics, while the React frontend provides an intuitive, real-time dashboard for network-wide administrative oversight."
  },
  {
    id: 5,
    title: "Context-Aware Fashion Advisory",
    category: "Computer Vision & Deep Learning",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    tech: "CNNs, Reinforcement Learning, OpenCV",
    year: "2024",
    description: "An AI-driven recommendation platform that integrates deep learning, computer vision, and reinforcement learning to provide highly personalized outfit suggestions. The methodology leverages refined facial skin region extraction (via CelebA Masked datasets) for tone detection and body shape classification models. It utilizes a hybrid of content-based and collaborative filtering, continuously adapting its recommendations based on dynamic user feedback."
  },
  {
    id: 6,
    title: "Diffusion Model",
    category: "Generative AI",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop",
    tech: "PyTorch, U-Net, DDPM",
    year: "2024",
    description: "A generative image synthesis project implementing a Denoising Diffusion Probabilistic Model (DDPM) trained on an automotive dataset. The architecture utilizes a U-Net backbone to learn the underlying data distribution by simulating a forward diffusion process (iteratively adding Gaussian noise via downsampling). The model is then trained to reverse this process, upsampling and denoising to hallucinate high-fidelity, novel images of cars from pure random noise."
  },
  {
    id: 7,
    title: "Parquik",
    category: "Computer Vision",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000&auto=format&fit=crop",
    tech: "Python, OpenCV, Object Detection",
    year: "2023",
    description: "A real-time smart parking management solution built entirely on computer vision algorithms. Processing live CCTV video streams, the system dynamically maps parking lots by drawing persistent bounding boxes around designated slots. It evaluates pixel-level density and object presence to instantly determine spatial vacancy, providing a live data feed to users to optimize parking logistics and traffic flow."
  },
  {
    id: 8,
    title: "GET-FIT",
    category: "IoT & Embedded Systems",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
    tech: "Arduino Uno, Accelerometer, Gyroscope",
    year: "2023",
    description: "An embedded hardware fitness tracker designed for real-time biomechanical telemetry. Interfacing an Arduino Uno with an MPU6050 Accelerometer and Gyroscope module, the device captures high-frequency 6-axis spatial movement data. Custom algorithms process this kinetic data to accurately track exercise repetitions, evaluate user posture during specific workouts, and provide actionable feedback for form correction and progress tracking."
  }
];

const Projects = () => {
  const targetRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"] 
  });

  // --- ANIMATION CONTROLS ---
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0.85, 1, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  // FIX: Changed mapping so horizontal scroll waits until the screen locks at 20% scroll depth (0.2)
  const x = useTransform(scrollYProgress, [0.15, 1], ["10%", "-85%"]);
  const textColor = useTransform(scrollYProgress, [0.1, 0.3], ["rgba(255,255,255,1)", "rgba(0,0,0,1)"]);

  return (
    <section ref={targetRef} className="relative h-[500vh]"> 
      <motion.div 
        style={{ opacity }} 
        className="sticky top-0 flex h-screen items-center overflow-hidden"
      >
        
        {/* Title Block */}
        <motion.div style={{ color: textColor, scale }} className="absolute top-10 left-10 z-20 origin-top-left pointer-events-none">
            <h2 className="text-4xl md:text-8xl font-bold tracking-tighter">
              SELECTED <span className="text-transparent" style={{ WebkitTextStroke: "2px black" }}>WORKS</span>
            </h2>
            <p className="font-mono text-xs md:text-sm mt-4 tracking-widest uppercase opacity-70">
                / / Click cards to explore
            </p>
        </motion.div>

        {/* The Sliding Gallery */}
        <motion.div style={{ x, scale }} className="flex gap-16 md:gap-24 pl-[10vw] pr-[20vw] items-center h-full">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onClick={() => setSelectedProject(project)} />
          ))}
        </motion.div>
      </motion.div>

      {/* MODAL FOR PROJECT DETAILS */}
      <AnimatePresence>
        {selectedProject && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8" 
                onClick={() => setSelectedProject(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 50 }} 
                    className="relative max-w-5xl w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]" 
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Left: Image */}
                    <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                        <img 
                            src={selectedProject.image} 
                            alt={selectedProject.title} 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />
                    </div>

                    {/* Right: Content */}
                    <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[#ccff00] font-mono text-xs tracking-widest uppercase bg-[#ccff00]/10 px-3 py-1 rounded-full">
                                    {selectedProject.category}
                                </span>
                                <h3 className="text-4xl md:text-5xl font-bold text-white mt-4 tracking-tight">
                                    {selectedProject.title}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedProject(null)} 
                                className="text-gray-500 hover:text-[#ccff00] transition-colors p-2"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                            {selectedProject.tech.split(", ").map((t, i) => (
                                <span key={i} className="text-xs font-mono border border-white/20 text-gray-300 px-3 py-1 rounded">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <p className="text-gray-300 leading-relaxed text-lg font-light border-l-2 border-[#ccff00] pl-4">
                            {selectedProject.description}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ProjectCard = ({ project, index, onClick }) => {
  // Staggered layout logic
  let alignClass = "self-center";
  if (index % 3 === 0) alignClass = "self-start mt-32";
  else if (index % 2 === 0) alignClass = "self-end mb-32";

  return (
    <div 
        className={`relative group flex-shrink-0 cursor-pointer ${alignClass}`}
        onClick={onClick}
    >
        <div className="relative h-[400px] w-[300px] md:h-[500px] md:w-[380px] overflow-hidden rounded-xl shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(204,255,0,0.2)] border border-white/5 group-hover:border-[#ccff00]/50">
            {/* FIX: Removed grayscale classes from the image below */}
            <img 
                src={project.image} 
                alt={project.title} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <span className="text-[#ccff00] font-mono text-xs mb-2 tracking-widest">{project.category}</span>
                <h3 className="text-3xl font-bold text-white mb-2 leading-none">{project.title}</h3>
                <p className="text-gray-400 text-sm font-mono opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Click to read more ↗
                </p>
            </div>
        </div>
        
        {/* Number Styling */}
        <div className="absolute -top-8 -left-8 text-8xl md:text-9xl font-black text-white/5 pointer-events-none group-hover:text-[#ccff00]/20 transition-colors z-[-1]">
            0{project.id}
        </div>
    </div>
  );
};

export default Projects;