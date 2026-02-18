import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaCode, FaBrain, FaGlobe, FaTools, FaDatabase } from "react-icons/fa";

const skillCategories = [
  { id: 1, title: "Languages", icon: <FaCode />, description: "The syntactic foundation of my engineering.", skills: ["Python", "Java", "Javascript", "HTML5",] },
  { id: 2, title: "AI & Machine Learning", icon: <FaBrain />, description: "Building the neural engines of tomorrow.", skills: ["TensorFlow", "PyTorch", "Keras", "OpenCV", "LangChain", "Scikit-learn", "Pandas", "NumPy", "RAG", "LLMs"] },
  { id: 3, title: "Full Stack Web", icon: <FaGlobe />, description: "Crafting scalable, interactive digital experiences.", skills: ["React.js", "Node.js", "Tailwind & Emotion CSS"] },
  { id: 4, title: "Tools & Cloud", icon: <FaTools />, description: "The infrastructure that powers deployment.", skills: ["Git", "Vercel", "Firebase", "Postman"] },
  { id: 5, title: "Core Concepts", icon: <FaDatabase />, description: "The theoretical backbone of computer science.", skills: ["Data Structures", "Algorithms", "OOP", "DBMS", "OS", "Computer Networks", "System Design"] }
];

const Skills = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"]
  });

  // FIX: Increased height to 400vh for slower scroll
  // FIX: Changed x to -95% to ensure the last card is fully revealed
  const x = useTransform(scrollYProgress, [0, 0.1, 1], ["1%", "1%", "-100%"]);
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const textColor = useTransform(scrollYProgress, [0, 0.3], ["#ffffff", "#000000"]);
  const strokeColor = useTransform(scrollYProgress, [0, 0.3], ["#ffffff", "#000000"]);
  const subTextColor = useTransform(scrollYProgress, [0, 0.3], ["#a3a3a3", "#4b5563"]);

  return (
    <section ref={targetRef} className="relative h-[400vh] z-20">
      
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        
        {/* Header */}
        <motion.div 
            style={{ opacity, color: textColor }}
            className="absolute top-10 left-4 md:left-20 z-20 max-w-sm"
        >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-2">
              TECHNICAL <br /> 
              <motion.span style={{ WebkitTextStrokeColor: strokeColor, color: "transparent", WebkitTextStrokeWidth: "2px" }}>
                ARSENAL
              </motion.span>
            </h2>
            <motion.div style={{ backgroundColor: textColor }} className="h-2 w-20 mb-4" />
            <motion.p style={{ color: subTextColor }} className="font-mono text-sm uppercase tracking-widest font-bold">
                / / Categorized Proficiency
            </motion.p>
        </motion.div>

        {/* Sliding Track */}
        <motion.div style={{ x }} className="flex gap-8 pl-[5vw] items-center mt-48 md:mt-32">
            <div className="w-[10vw] md:w-[5vw] flex-shrink-0" />
            {skillCategories.map((category) => (
                <SkillCard key={category.id} category={category} />
            ))}
        </motion.div>

      </div>
    </section>
  );
};

const SkillCard = ({ category }) => {
  return (
    <div className="w-[75vw] md:w-[35vw] h-[55vh] bg-[#0a0a0a] border border-[#ccff00]/30 p-8 md:p-10 flex flex-col justify-between flex-shrink-0 hover:border-[#ccff00] hover:shadow-[0_0_30px_rgba(204,255,0,0.2)] transition-all duration-300 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/0 via-[#ccff00]/5 to-[#ccff00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div>
            <div className="text-4xl md:text-5xl text-[#ccff00] mb-6">{category.icon}</div>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase leading-none tracking-wider">{category.title}</h3>
            <p className="text-gray-400 font-mono text-sm md:text-sm border-l-2 border-[#ccff00] pl-4 leading-relaxed">{category.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-8 relative z-10">
            {category.skills.map((skill, index) => (
                <motion.span key={index} whileHover={{ scale: 1.05, backgroundColor: "#ccff00", color: "#000" }} className="px-3 py-1.5 border border-[#ccff00]/30 rounded-lg text-xs md:text-sm font-mono text-[#ccff00] cursor-default transition-colors bg-black/50">
                    {skill}
                </motion.span>
            ))}
        </div>
        <div className="absolute top-2 right-4 text-5xl font-black text-[#ccff00]/5 pointer-events-none -z-10 group-hover:text-[#ccff00]/10 transition-colors">0{category.id}</div>
    </div>
  );
};

export default Skills;