import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FaAward, FaFingerprint, FaExternalLinkAlt, FaTimes } from "react-icons/fa";

// --- DATA CONFIGURATION ---

const certifications = [
  { 
    id: 1, 
    title: "Introduction to Web Development", 
    issuer: "University of California, Davis", 
    date: "April 2, 2025", 
    image: "/course1.jpeg" 
  },
  { 
    id: 2, 
    title: "Intro to TensorFlow for AI, ML, and DL", 
    issuer: "DeepLearning.AI", 
    date: "March 24, 2024", 
    image: "/course2.jpeg" 
  },
  { 
    id: 3, 
    title: "An Intuitive Introduction to Probability", 
    issuer: "University of Zurich", 
    date: "April 24, 2023", 
    image: "/course3.jpeg" 
  },
  { 
    id: 4, 
    title: "Object Oriented Programming in Java", 
    issuer: "University of California San Diego", 
    date: "April 19, 2023", 
    image: "/course4.jpeg" 
  },
  { 
    id: 5, 
    title: "Oriental Group Hackathon Certificate", 
    issuer: "Oriental Group of Institutes (Bhopal)", 
    date: "2024", 
    image: "/IMG_0299.jpg" 
  },
  { 
    id: 6, 
    title: "GDSC WOW Hackathon Certificate", 
    issuer: "Google Developer Student Clubs (Kerala)", 
    date: "2023", 
    image: "/IMG_0298.jpg" 
  }
];

const publications = [
  { 
    id: 1, 
    title: "Smart Stream: IoT-Based Real-Time Water Consumption Monitoring and Management System", 
    appNumber: "202641011870 A", 
    date: "Feb 13, 2026",
    role: "Inventor (3rd Author)",
    description: "An IoT-based system for real-time monitoring and management of water consumption at an appliance level. The system utilizes flow, pressure, and temperature sensors to transmit data to a cloud server, where AI analyzes consumption patterns to suggest optimized usage goals. Capable of operating in both online and offline modes via Wi-Fi or Bluetooth mesh." 
  }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const Certifications = () => {
  const [activeTab, setActiveTab] = useState("certs"); 
  const [selectedCert, setSelectedCert] = useState(null); 
  const headerRef = useRef(null);

  // HEADER ANIMATION
  const { scrollYProgress: headerProgress } = useScroll({
    target: headerRef,
    offset: ["start end", "end start"] 
  });
  
  const headerScale = useTransform(headerProgress, [0.1, 0.5, 0.8], [1.75, 1, 1.75]);
  const headerOpacity = useTransform(headerProgress, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]);
  const headerBlur = useTransform(headerProgress, [0.1, 0.5, 0.8], ["10px", "0px", "10px"]);
  const headerY = useTransform(headerProgress, [0.5, 1], [0, -50]);

  return (
    <section className="min-h-screen py-24 relative z-20 flex flex-col items-center bg-transparent">
      
      {/* HEADER */}
      <div ref={headerRef} className="text-center mb-16 z-20 px-4 perspective-1000 relative">
        <motion.div style={{ scale: headerScale, opacity: headerOpacity, filter: headerBlur, y: headerY }}>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8">
                CREDENTIALS <span className="text-[#ccff00]">ARCHIVE</span>
            </h2>
        </motion.div>
        
        {/* TAB SWITCHER */}
        <div className="relative inline-flex bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-md">
            <motion.div 
                className="absolute top-1.5 bottom-1.5 bg-[#ccff00] rounded-full shadow-[0_0_15px_#ccff00]"
                layoutId="activeTab"
                initial={false}
                animate={{ 
                    x: activeTab === "certs" ? 0 : "100%", 
                    width: "50%" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
                onClick={() => setActiveTab("certs")} 
                className={`relative z-10 w-40 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-widest transition-colors duration-200 ${activeTab === "certs" ? "text-black" : "text-gray-400 hover:text-white"}`}
            >
                CERTIFICATIONS
            </button>
            <button 
                onClick={() => setActiveTab("pubs")} 
                className={`relative z-10 w-40 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-widest transition-colors duration-200 ${activeTab === "pubs" ? "text-black" : "text-gray-400 hover:text-white"}`}
            >
                PUBLICATIONS
            </button>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="w-full max-w-6xl px-6 min-h-[600px] z-10">
        <AnimatePresence mode="wait">
            
            {/* --- CERTIFICATIONS TAB --- */}
            {activeTab === "certs" ? (
                <motion.div 
                    key="certs" 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible" 
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {certifications.map((cert) => (
                        <motion.div 
                            key={cert.id} 
                            variants={itemVariants} 
                            className="group relative bg-[#0a0a0a] border border-white/10 p-6 rounded-xl hover:border-[#ccff00]/50 transition-all hover:bg-white/5 flex flex-col md:flex-row items-center md:items-start gap-6 overflow-hidden cursor-pointer"
                            onClick={() => setSelectedCert(cert)}
                        >
                             <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00]/0 via-[#ccff00]/5 to-[#ccff00]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            
                            <div className="w-16 h-16 bg-[#ccff00]/10 rounded-lg flex items-center justify-center text-[#ccff00] text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                <FaAward />
                            </div>
                            
                            <div className="flex-grow text-center md:text-left z-10">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#ccff00] transition-colors">{cert.title}</h3>
                                <p className="text-gray-400 text-sm font-mono mb-1">{cert.issuer}</p>
                                <p className="text-gray-500 text-xs mb-4">{cert.date}</p>
                                
                                <span className="inline-flex items-center gap-2 text-[#ccff00] text-xs font-mono uppercase tracking-wider group-hover:underline underline-offset-4">
                                    View Certificate <FaExternalLinkAlt size={10} />
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                
                /* --- PUBLICATIONS TAB --- */
                <motion.div 
                    key="pubs" 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible" 
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }} 
                    className="grid grid-cols-1 gap-6"
                >
                    {publications.map((pub) => (
                        <motion.div 
                            key={pub.id} 
                            variants={itemVariants} 
                            className="group relative bg-[#0a0a0a] border border-white/10 p-8 rounded-xl hover:border-[#ccff00]/50 transition-all hover:bg-white/5"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    <div className="p-2 bg-[#ccff00]/10 rounded text-[#ccff00]">
                                        <FaFingerprint size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-mono text-xs text-[#ccff00] tracking-widest">PATENT APPLICATION NUMBER</span>
                                        <span className="block font-bold text-white text-lg">{pub.appNumber}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-gray-400 text-xs font-mono">PUBLISHED</span>
                                    <span className="block text-white text-sm">{pub.date}</span>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-[#ccff00] transition-colors">
                                {pub.title}
                            </h3>
                            
                            <div className="mb-4 inline-block bg-white/10 px-3 py-1 rounded text-xs font-mono text-gray-300">
                                {pub.role}
                            </div>
                            
                            <p className="text-gray-400 leading-relaxed text-sm md:text-base border-l-2 border-[#ccff00]/30 pl-4">
                                {pub.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* CERTIFICATE MODAL (TRANSPARENT BACKGROUND) */}
      <AnimatePresence>
        {selectedCert && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4" 
                onClick={() => setSelectedCert(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }} 
                    className="relative max-w-7xl w-full flex flex-col items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button & Title Floating above */}
                    <div className="absolute -top-12 left-0 right-0 flex justify-between items-center text-white w-full px-2">
                         <div className="text-left">
                            <h3 className="font-bold text-lg">{selectedCert.title}</h3>
                            <p className="text-gray-400 text-xs font-mono">{selectedCert.issuer}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedCert(null)} 
                            className="p-2 text-white/70 hover:text-[#ccff00] transition-all hover:scale-110"
                        >
                            <FaTimes size={30} />
                        </button>
                    </div>

                    {/* Image (Floating freely without a card) */}
                    <img 
                        src={selectedCert.image} 
                        alt={selectedCert.title} 
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
                    />
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Certifications;