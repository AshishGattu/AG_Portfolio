import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaArrowUp } from "react-icons/fa";

const Contact = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <section id="contact" className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-black/80 to-transparent z-50 py-20 text-white overflow-hidden border-t border-white/10">

      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-20">

        {/* LEFT: PHOTO */}
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
        >
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/10 relative z-10 shadow-2xl">
                <img
                    src="/IMG_7731.jpg"
                    alt="Ashish Gattu"
                    // Added 'object-top' to align the image to the top
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700"
                />
            </div>
            <div className="absolute inset-0 -m-6 border border-dashed border-white/20 rounded-full animate-spin-slow pointer-events-none" />
        </motion.div>

        {/* RIGHT: CONTACT INFO */}
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
        >
            <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-7xl md:text-9xl font-black tracking-tighter mb-4"
            >
                LET'S <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>TALK</span>
            </motion.h2>

            <p className="text-gray-400 text-xl mb-10 max-w-lg leading-relaxed">
                Whether you have a project in mind, a question about my work, or just want to connect—I'm always open to discussing new opportunities.
            </p>

            {/* CONTACT DETAILS */}
            <div className="flex flex-col gap-6">
                <a href="mailto:ashishg2204@gmail.com" className="flex items-center gap-6 text-3xl font-bold hover:text-[#ccff00] transition-colors group">
                    <span className="p-4 bg-white/5 border border-white/10 rounded-full group-hover:bg-[#ccff00] group-hover:text-black transition-all group-hover:scale-110"><FaEnvelope /></span>
                    ashishg2204@gmail.com
                </a>
                <a href="tel:+917032415999" className="flex items-center gap-6 text-3xl font-bold hover:text-[#ccff00] transition-colors group">
                    <span className="p-4 bg-white/5 border border-white/10 rounded-full group-hover:bg-[#ccff00] group-hover:text-black transition-all group-hover:scale-110"><FaPhone /></span>
                    +91 7032415999
                </a>
            </div>

            {/* SOCIAL LINKS */}
            <div className="flex gap-8 mt-20 justify-center md:justify-start">
                <SocialLink href="https://github.com/AshishGattu" icon={<FaGithub />} />
                <SocialLink href="https://linkedin.com/in/ashishgattu" icon={<FaLinkedin />} />
            </div>

            <p className="mt-16 text-gray-600 text-sm font-mono">
                © 2026 Ashish Gattu. All Rights Reserved.
            </p>
        </motion.div>

      </div>

      {/* GO TO TOP BUTTON */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        whileHover={{ scale: 1.1, backgroundColor: "#ccff00", color: "#000" }}
        className="absolute bottom-10 right-10 p-4 bg-white/10 border border-white/20 rounded-full text-white transition-all z-50 cursor-pointer"
      >
        <FaArrowUp size={20} />
      </motion.button>

    </section>
  );
};

const SocialLink = ({ href, icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-4xl text-gray-500 hover:text-white hover:scale-110 transition-all"
    >
        {icon}
    </a>
);

export default Contact;