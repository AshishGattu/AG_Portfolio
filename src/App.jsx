import React, { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
// 1. IMPORT THE NAVBAR HERE
import NavBar from "./components/NavBar"; 
import Hero from "./components/Hero";
import About from "./components/About";
import ParallaxSection from "./components/ParallaxSection";
import Projects from "./components/Projects";
import ParticlesBackground from "./components/ParticlesBackground";
import Experience from "./components/Experience"; // <-- NEW
import Skills from "./components/Skills"; // <-- NEW
import Certifications from "./components/Certifications";
import Education from "./components/Education"; // <-- IMPORT
import Activities from "./components/Activities"; // <-- IMPORT
import Contact from "./components/Contact";

export default function App() {
  
  // Smooth Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <main className="text-white relative min-h-screen">
      
      {/* 2. PLACE THE NAVBAR HERE (Above everything else) */}
      <NavBar />

      {/* Global Background */}
      <ParticlesBackground />

      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <div id="hero">
            <Hero />
        </div>
        
        {/* Section 2: Parallax Vision */}
        <div id="vision"> 
            <ParallaxSection />
        </div>

        {/* Section 3: About */}
        <div id="about" className="relative z-20"> 
            <About />
        </div>

        {/* Section 4: Projects */}
        <div id="projects"> 
            <Projects /> 
        </div>

        <div id="experience">
           <Experience /> 
        </div>

        <div id="certifications"> 
           <Certifications /> 
        </div>

        {/* LIGHT ZONE Starts Here */}
        <div id="skills"> 
            <Skills /> 
        </div>

        <div id="education"> <Education /> </div>
        <div id="activities"> <Activities /> </div>
        <div id="contact"> <Contact /> </div>


      </div>
    </main>
  );
}