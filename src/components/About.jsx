import React from "react";
import { motion } from "framer-motion";
import { FaGraduationCap, FaCode, FaBrain, FaAward } from "react-icons/fa";

const About = () => {
  return (
    <section className="min-h-screen py-20 px-6 relative z-10 flex items-center justify-center bg-transparent">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* COLUMN 1: The Bio & Story */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* New Heading */}
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
            IMPACT
          </h2>
          
          {/* Your Specific Content */}
          <div className="relative border-l-2 border-[#ccff00] pl-6 py-2">
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
              <span className="text-white font-bold">AI & ML Engineer</span> with a strong foundation in Deep Learning, Computer Vision and Agentic AI, building production systems: an LLM-powered insurance document-extraction platform on Azure and real-time video analytics for US retail stores. Hands-on with full-stack web development, RAG chatbots and multi-agent architectures; national 3rd-place hackathon finish and a published patent. Focused on building reliable, <span className="text-[#ccff00]">production-grade AI systems</span> that solve real business problems.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <StatCard icon={<FaAward />} title="Publications" value="1" />
            <StatCard icon={<FaCode />} title="Hackathons" value="3" />
            <StatCard icon={<FaBrain />} title="Experience" value="2" />
            <StatCard icon={<FaGraduationCap />} title="CGPA" value="3.4/4.0" />
          </div>
        </motion.div>

        {/* COLUMN 2: Experience Highlight (Replaces Tech Arsenal) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative flex justify-center md:justify-end"
        >
          {/* Glass Card for Role */}
          <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-[#ccff00]/50 transition-all duration-500">
            
            {/* Decoration: Glowing blob */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ccff00]/20 rounded-full blur-[60px] -z-10 group-hover:bg-[#ccff00]/30 transition-all"></div>

            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-mono text-gray-400 tracking-widest uppercase border-b border-gray-700 pb-2">Latest Role</h3>
                <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
            </div>

            <h4 className="text-3xl font-bold text-white mb-2">
              AI Engineer
            </h4>
            <h5 className="text-xl text-[#ccff00] mb-6 font-mono">
              @ Maaze Underwriting Solutions
            </h5>

            <ul className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <li className="flex gap-3">
                    <span className="text-[#ccff00] mt-1">▹</span>
                    <span>Built an Azure-based platform using <strong>Azure AI Document Intelligence</strong> and GPT-5 mini to extract insurance documents into structured JSON.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-[#ccff00] mt-1">▹</span>
                    <span>Added an <strong>LLM assistant</strong> that answers user questions about ingested documents.</span>
                </li>
                <li className="flex gap-3">
                    <span className="text-[#ccff00] mt-1">▹</span>
                    <span>Delivered <strong>real-time YOLOv5 video analytics</strong> for US retail stores: heatmaps, dwell time and footfall.</span>
                </li>
            </ul>

            {/* Decorative Code Snippet Background */}
            <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none font-mono text-[10px] text-right p-4">
                def init_agent(self):<br/>
                &nbsp;&nbsp;return Agent(<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;role="AI",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;goal="Automate"<br/>
                &nbsp;&nbsp;)
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

// Helper Component for the Stats
const StatCard = ({ icon, title, value }) => (
  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-[#ccff00]/40 transition-all group hover:-translate-y-1">
    <div className="flex items-center gap-4 mb-2">
        <div className="text-[#ccff00] text-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{title}</div>
    </div>
    <div className="text-3xl font-bold text-white group-hover:text-[#ccff00] transition-colors">{value}</div>
  </div>
);

export default About;