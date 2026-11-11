import React from "react";
import { motion } from "framer-motion";
import { FaGraduationCap, FaSchool, FaUniversity, FaLanguage } from "react-icons/fa";

const Education = () => {
  return (
    <section 
        // FIX: Background is now transparent
        className="relative min-h-[150vh] py-32 z-20 flex flex-col items-center bg-transparent text-black overflow-hidden"
    >
      
      {/* HEADER */}
      <div className="text-center mb-12 z-20 px-4 relative">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-black">
            <RiseWord delay={0}>ACADEMIC</RiseWord>{" "}
            <RiseWord delay={0.15} className="text-transparent" style={{ WebkitTextStroke: "2px black" }}>BACKBONE</RiseWord>
        </h2>
        <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="h-1.5 w-32 bg-black mx-auto origin-center"
        />
      </div>

      {/* CONTENT GRID */}
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        
        {/* LEFT COLUMN: EDUCATION LIST */}
        <div className="space-y-8">
            <EducationCard 
                icon={<FaUniversity />}
                year="2022 - 2026"
                title="Woxsen University"
                degree="B.Tech - AI & Machine Learning"
                score="CGPA: 3.4 / 4.0"
                desc="Specializing in Artificial Intelligence. Core coursework in Deep Learning, NLP, and Data Structures."
            />
            <EducationCard 
                icon={<FaSchool />}
                year="2020 - 2022"
                title="Narayana Junior College"
                degree="Higher Secondary (PCM)"
                score="Score: 90%"
                desc="Focused on Physics, Chemistry, and Mathematics. Excellence in analytical problem solving."
            />
            <EducationCard 
                icon={<FaGraduationCap />}
                year="2018 - 2020"
                title="St. Andrews School"
                degree="High School (CBSE)"
                score="Score: 94%"
                desc="Foundation in computer science and mathematics with distinction."
            />
        </div>

        {/* RIGHT COLUMN: LANGUAGES */}
        <div className="sticky top-32 h-fit">
             <div className="bg-[#f4f4f2]/95 border-2 border-black p-10 rounded-2xl ">
                <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-6">
                    <div className="p-4 bg-black text-white text-3xl rounded-lg"><FaLanguage /></div>
                    <div>
                        <h3 className="text-2xl font-bold uppercase">Languages</h3>
                        <p className="font-mono text-gray-600">Global Communication</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <LanguageItem lang="English" level="Fluent / Professional" progress="100%" />
                    <LanguageItem lang="Hindi" level="Fluent" progress="95%" />
                    <LanguageItem lang="Telugu" level="Fluent / Native" progress="100%" />
                    <LanguageItem lang="German" level="Beginner" progress="25%" />
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

// Word that rises out of a clipped line on enter (staggered via `delay`)
const RiseWord = ({ children, delay = 0, className = "", style }) => (
    <span className="inline-block overflow-hidden align-bottom pb-1">
        <motion.span
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block ${className}`}
            style={style}
        >
            {children}
        </motion.span>
    </span>
);

const EducationCard = ({ icon, year, title, degree, score, desc }) => (
    <div className="bg-[#f4f4f2]/95 border-2 border-black p-8 rounded-2xl  hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-black text-white text-2xl rounded-lg">{icon}</div>
            <span className="bg-black text-white px-3 py-1 text-xs font-mono rounded-full">{year}</span>
        </div>
        <h3 className="text-2xl font-bold text-black mb-1">{title}</h3>
        <p className="text-lg font-bold text-gray-800 mb-2">{degree}</p>
        <p className="font-mono text-sm text-black bg-white/80 inline-block px-2 py-1 rounded mb-4 border border-black">{score}</p>
        <p className="text-gray-700 leading-relaxed text-sm">{desc}</p>
    </div>
);

const LanguageItem = ({ lang, level, progress }) => (
    <div>
        <div className="flex justify-between mb-2">
            <span className="font-bold text-black">{lang}</span>
            <span className="text-sm text-gray-600 font-mono">{level}</span>
        </div>
        <div className="h-3 w-full border border-black rounded-full overflow-hidden p-[1px]">
            <div style={{ width: progress }} className="h-full bg-black rounded-full" />
        </div>
    </div>
);

export default Education;