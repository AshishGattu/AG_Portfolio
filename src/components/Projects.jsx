import React, { useRef } from "react";
import { motion, useTransform, useScroll } from "framer-motion";

const projects = [
  {
    id: 1,
    title: "HROps - AI HR Assistant",
    category: "Multi-Agent System",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop",
    tech: "Python, LangChain",
    year: "2025"
  },
  {
    id: 2,
    title: "WealthMaps",
    category: "Full Stack AI",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    tech: "Next.js, Llama 3",
    year: "2025"
  },
  {
    id: 3,
    title: "Parquik Smart Parking",
    category: "Computer Vision",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000&auto=format&fit=crop",
    tech: "OpenCV, IoT",
    year: "2024"
  },
  {
    id: 4,
    title: "SafeNet Guardian",
    category: "Cybersecurity AI",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    tech: "Keras, Wireshark",
    year: "2024"
  },
  {
    id: 5,
    title: "MediMind Assistant",
    category: "Healthcare NLP",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop",
    tech: "BERT, FastAPI",
    year: "2023"
  },
  {
    id: 6,
    title: "AgroTech Vision",
    category: "Smart Farming",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop",
    tech: "YOLOv8, AWS",
    year: "2023"
  },
  {
    id: 7,
    title: "UrbanFlow AI",
    category: "Urban Planning",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop",
    tech: "Reinforcement Learning",
    year: "2023"
  }
];

const Projects = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"] 
  });

  // --- ANIMATION CONTROLS ---
  
  // 1. Scale Effect (Entry AND Exit)
  // 0-10%: Zoom In
  // 10-80%: Stay Full Size
  // 80-100%: Zoom Out slightly (Transition to next page)
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0.85, 1, 1, 0.9]);
  
  // 2. Opacity Effect (Exit Only)
  // Fades out at the very end so the dark background takes over smoothly
  const opacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  // 3. Horizontal Scroll (Reverted to Standard)
  // Moves Left as you scroll Down
  const x = useTransform(scrollYProgress, [0, 1], ["15%", "-70%"]);

  // 4. Text Color Transition (For the Title)
  const textColor = useTransform(scrollYProgress, [0.1, 0.3], ["rgba(255,255,255,1)", "rgba(0,0,0,1)"]);

  return (
    <section ref={targetRef} className="relative h-[500vh]"> 
      <motion.div 
        style={{ opacity }} // Apply fade out here
        className="sticky top-0 flex h-screen items-center overflow-hidden"
      >
        
        {/* Title Block */}
        <motion.div style={{ color: textColor, scale }} className="absolute top-10 left-10 z-20 origin-top-left">
            <h2 className="text-4xl md:text-8xl font-bold tracking-tighter">
              SELECTED <span className="text-transparent" style={{ WebkitTextStroke: "1px currentColor" }}>WORKS</span>
            </h2>
            <p className="font-mono text-xs md:text-sm mt-4 tracking-widest uppercase opacity-70">
                / / Drag to Explore
            </p>
        </motion.div>

        {/* The Sliding Gallery */}
        <motion.div style={{ x, scale }} className="flex gap-24 pl-[10vw] pr-[10vw] items-center h-full">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </motion.div>

      </motion.div>
    </section>
  );
};

const ProjectCard = ({ project, index }) => {
  let alignClass = "self-center";
  if (index % 3 === 0) alignClass = "self-start mt-32";
  else if (index % 2 === 0) alignClass = "self-end mb-32";

  return (
    <div className={`relative group flex-shrink-0 ${alignClass}`}>
        <div className="relative h-[400px] w-[300px] md:h-[500px] md:w-[400px] overflow-hidden rounded-none shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <img 
                src={project.image} 
                alt={project.title} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <span className="text-[#ccff00] font-mono text-xs mb-2">{project.category}</span>
                <h3 className="text-3xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-300 text-sm font-mono">{project.tech}</p>
            </div>
        </div>
        
        {/* Number Styling */}
        <div className="absolute -top-10 -left-10 text-9xl font-bold text-black/20 pointer-events-none group-hover:text-black/40 transition-colors">
            0{project.id}
        </div>
    </div>
  );
};

export default Projects;