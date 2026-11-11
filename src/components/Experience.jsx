import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaLaptopCode } from "react-icons/fa";

const experiences = [
  {
    id: 1,
    role: "AI Engineer",
    company: "Maaze Underwriting Solutions",
    date: "Jul 2026 - Present",
    description: "Building production AI systems across document intelligence and computer vision.",
    highlights: [
      "Insurance Document Extraction Platform: a web platform on Azure AI Document Intelligence and GPT-5 mini that ingests varied-layout insurance documents via HTTP and email, maps the extracted text to structured JSON aligned with form-specific schemas per insurance form type, and includes an LLM assistant that answers user questions about the ingested documents.",
      "Real-Time Retail Video Analytics (US Store Franchise): real-time person detection and tracking with YOLOv5 on in-store camera footage, generating crowd-density heatmaps and delivering store analytics including dwell time, fulfilment time and total footfall in/out."
    ],
    tech: ["Azure AI Document Intelligence", "Azure OpenAI (GPT-5 mini)", "YOLOv5", "Object Tracking", "Python"]
  },
  {
    id: 2,
    role: "AI Intern",
    company: "Srinishtha Technologies",
    date: "Dec 2024 - Sep 2025",
    location: "Hyderabad, India",
    description: "Developed the UI and backend for a scalable EdTech platform supporting 80+ branches across Telangana, and built RAG-based conversational AI chatbots for E-Commerce that automate customer interactions end-to-end. Also built automation tools for client projects that replaced manual, repetitive steps in day-to-day operations.",
    tech: ["RAG", "LLMs", "React", "Node.js", "Automation"]
  }
];

const CELL = 16;

// Cursor-driven "crowd-density heatmap": gaussian splats into a low-res grid, decayed per frame.
function HeatCanvas({ sectionRef }) {
  const canvasRef = useRef(null);
  const [enabled] = React.useState(() =>
    typeof window !== "undefined" &&
    !window.matchMedia("(hover: none)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const off = document.createElement("canvas");
    const octx = off.getContext("2d");
    let cols = 0, rows = 0, heat, img, raf = 0, visible = false;

    const resize = () => {
      const r = section.getBoundingClientRect();
      cols = Math.max(1, Math.ceil(r.width / CELL));
      rows = Math.max(1, Math.ceil(r.height / CELL));
      canvas.width = r.width; canvas.height = r.height;
      off.width = cols; off.height = rows;
      heat = new Float32Array(cols * rows);
      img = octx.createImageData(cols, rows);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    const splat = (cx, cy) => {
      const R = 4;
      for (let y = Math.max(0, cy - R); y <= Math.min(rows - 1, cy + R); y++) {
        for (let x = Math.max(0, cx - R); x <= Math.min(cols - 1, cx + R); x++) {
          const d2 = (x - cx) ** 2 + (y - cy) ** 2;
          heat[y * cols + x] = Math.min(1.5, heat[y * cols + x] + 0.12 * Math.exp(-d2 / 6));
        }
      }
    };

    const frame = () => {
      raf = 0;
      let any = false;
      const d = img.data;
      for (let i = 0; i < heat.length; i++) {
        let h = heat[i] * 0.965;
        if (h < 0.01) h = 0;
        heat[i] = h;
        const o = i * 4;
        if (h === 0) { d[o + 3] = 0; continue; }
        any = true;
        const t = Math.min(1, h);
        // transparent -> lime -> white at peak
        const w = Math.max(0, (t - 0.7) / 0.3);
        d[o] = 204 + 51 * w; d[o + 1] = 255; d[o + 2] = 255 * w;
        d[o + 3] = Math.min(255, t * 340);
      }
      octx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 0.35;
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      if (any && visible) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };

    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      splat(Math.floor((e.clientX - r.left) / CELL), Math.floor((e.clientY - r.top) / CELL));
      kick();
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(section);
    section.addEventListener("pointermove", onMove);
    return () => {
      section.removeEventListener("pointermove", onMove);
      io.disconnect(); ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, sectionRef]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true" />
      <div className="absolute bottom-3 right-4 z-0 font-mono text-[10px] text-white/30 pointer-events-none select-none hidden md:block">
        {"// footfall heatmap — move your cursor"}
      </div>
    </>
  );
}

const Experience = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  
  // 1. Background Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // 2. HEADER FLY-THROUGH LOGIC (Robust Fix)
  const { scrollYProgress: headerProgress } = useScroll({
    target: headerRef,
    // "start end" = When header top hits screen bottom
    // "end start" = When header bottom hits screen top
    offset: ["start end", "end start"] 
  });

  // LOGIC MAP:
  // 0.0 - 0.5 : Entering (Bottom to Center)
  // 0.5       : Locked in Center
  // 0.5 - 1.0 : Exiting (Center to Top)

  // Scale: Huge (2.0) -> Normal (1.0) -> Huge (2.0)
  const headerScale = useTransform(headerProgress, [0.1, 0.5, 0.8], [1.75, 1, 1.75]);
  
  // Opacity: Invisible (0) -> Visible (1) -> Invisible (0)
  const headerOpacity = useTransform(headerProgress, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]);
  
  // Y: Move up slightly on exit to enhance the "fly through" feel
  const headerY = useTransform(headerProgress, [0.5, 1], [0, -100]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[120vh] pt-10 pb-32 flex flex-col items-center justify-center overflow-hidden"
    >
      
      <HeatCanvas sectionRef={containerRef} />

      {/* --- SIDE PILLARS --- */}
      <motion.div style={{ y: bgY, opacity: 0.1 }} className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none select-none z-0 w-32">
        <h1 className="text-[15vh] font-black text-transparent leading-none -rotate-90 whitespace-nowrap tracking-widest" style={{ WebkitTextStroke: "2px white" }}>WORK</h1>
      </motion.div>

      <motion.div style={{ y: bgY, opacity: 0.1 }} className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none select-none z-0 w-32">
        <h1 className="text-[15vh] font-black text-transparent leading-none rotate-90 whitespace-nowrap tracking-widest" style={{ WebkitTextStroke: "2px white" }}>HISTORY</h1>
      </motion.div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 w-full max-w-4xl px-6">
        
        {/* Animated Header */}
        <div ref={headerRef} className="mb-12 text-center z-0">
            <motion.div style={{ scale: headerScale, opacity: headerOpacity, y: headerY }}>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                    PROFESSIONAL <span className="text-[#ccff00]">JOURNEY</span>
                </h2>
                <div className="h-1 w-24 bg-[#ccff00] mx-auto rounded-full shadow-[0_0_20px_#ccff00]" />
            </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative z-10 border-l-2 border-white/10 ml-4 md:ml-12 space-y-16">
            {experiences.map((exp, index) => (
                <ExperienceCard key={exp.id} exp={exp} index={index} />
            ))}
        </div>

      </div>
    </section>
  );
};

const ExperienceCard = ({ exp, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.2 }}
            className="relative pl-8 md:pl-12"
        >
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#ccff00] shadow-[0_0_15px_#ccff00] z-20">
                <div className="absolute inset-0 bg-white opacity-50 rounded-full animate-ping" />
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00]/0 via-[#ccff00]/5 to-[#ccff00]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-white group-hover:text-[#ccff00] transition-colors">{exp.role}</h3>
                        <h4 className="text-xl text-gray-400 mt-1 flex items-center gap-2"><FaBriefcase className="text-sm text-[#ccff00]" /> {exp.company}</h4>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right">
                        <div className="text-[#ccff00] font-mono text-sm flex items-center gap-2 md:justify-end bg-[#ccff00]/10 px-3 py-1 rounded-full w-fit md:w-auto"><FaCalendarAlt /> {exp.date}</div>
                        {exp.location && (
                            <div className="text-gray-500 text-sm flex items-center gap-2 md:justify-end mt-2"><FaMapMarkerAlt /> {exp.location}</div>
                        )}
                    </div>
                </div>

                <p className={`text-gray-300 leading-relaxed text-lg ${exp.highlights ? "mb-4" : "mb-8"}`}>{exp.description}</p>

                {exp.highlights && (
                    <ul className="space-y-4 text-gray-300 text-base leading-relaxed mb-8">
                        {exp.highlights.map((h, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-[#ccff00] mt-1">▹</span>
                                <span>{h}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-wrap gap-3">
                    {exp.tech.map((tag, i) => (
                        <span key={i} className="px-4 py-2 rounded-lg bg-black/50 text-white text-xs font-mono border border-white/10 flex items-center gap-2 group-hover:border-[#ccff00]/30 transition-colors">
                            <FaLaptopCode className="text-[#ccff00]" /> {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default Experience;