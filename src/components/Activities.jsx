import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaMapMarkerAlt, FaVideo, FaImages, FaCrown, FaForward } from "react-icons/fa";

// --- MATRIX RAIN (Optimized) ---
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const columns = Math.floor(width / 20);
    const drops = Array(columns).fill(1);
    
    // Throttled draw loop for better scroll performance
    let animationFrameId;
    
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#00FF41"; 
      ctx.font = "14px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? "1" : "0";
        ctx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i] * 20 > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      // Slow down animation slightly to save resources for scrolling
      setTimeout(() => {
        animationFrameId = requestAnimationFrame(draw);
      }, 50);
    };
    draw();

    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0" />;
};

// --- EVENTS DATA ---
const events = [
  { 
    id: 1, 
    title: "Udhgam 1.0 & 2.0", 
    role: "Organizer", 
    location: "Woxsen University", 
    badge: "Events Chief", 
    desc: "Laid the foundation for the woxsen major competitive coding event in 2025 & 2026.", 
    media: [
        { type: "image", orientation: "landscape", url: "/udhgam1.JPEG" },
        { type: "image", orientation: "portrait",  url: "/udhgam2.jpg" },
        { type: "image", orientation: "landscape", url: "/udhgam.jpeg" },
    ]
  },
  { 
    id: 2, 
    title: "Japanese Ind. Delegation", 
    role: "Student Delegate", 
    location: "Hyderabad", 
    badge: null, 
    desc: "Cultural and technical exchange with industry leaders from Japan.", 
    media: [
        { type: "image", orientation: "landscape", url: "/jd1.jpg" },
        { type: "image", orientation: "portrait",  url: "/jd2.jpg" },
        { type: "image", orientation: "landscape", url: "/jd3.jpeg" },
    ]
  },
  { 
    id: 3, 
    title: "Code Relay", 
    role: "Organizer", 
    location: "Campus", 
    badge: "Tech Club Chief", 
    desc: "A high-speed relay coding competition emphasizing teamwork.", 
    media: [
        { type: "image", orientation: "portrait", url: "/coder1.jpeg" },
        { type: "image", orientation: "landscape", url: "/coder2.jpeg" }
    ]
  },
  { 
    id: 4, 
    title: "Nvidia AI Summit", 
    role: "Attendee", 
    location: "Mumbai", 
    badge: null, 
    desc: "Exploring Generative AI frontiers with global experts.", 
    media: [
        { type: "image", orientation: "landscape", url: "/n2.JPG" },
        { type: "image", orientation: "portrait",  url: "/n1.JPG" },
        { type: "image", orientation: "landscape", url: "/n3.JPG" },
        { type: "image", orientation: "portrait",  url: "/n5.JPG" },
        { type: "image", orientation: "landscape", url: "/n4.JPG" },
        { type: "image", orientation: "landscape", url: "/n6.jpg" },
    ]
  },
  { 
    id: 5, 
    title: "International Collaboration Summit", 
    role: "Core Team", 
    location: "Global", 
    badge: "Tech Club Chief", 
    desc: "Fostering global tech partnerships.", 
    media: [
        { type: "image", orientation: "landscape", url: "/6b951540-f9f5-40d7-82d1-7be2343ee259.JPG" },
        { type: "image", orientation: "landscape",  url: "/20240926_120955_Original.jpg" },
    ]
  },
  { 
    id: 6, 
    title: "Ajman Winter Tour", 
    role: "International Scholar", 
    location: "UAE", 
    badge: null, 
    desc: "A week of immersion in Middle Eastern tech and business ecosystems.", 
    media: [
        { type: "image", orientation: "landscape", url: "/av8.JPG" },
        { type: "image", orientation: "landscape",  url: "/av7.JPG" },
        { type: "image", orientation: "landscape", url: "/av3.JPG" },
        { type: "image", orientation: "portrait", url: "/av10.jpg" },
        { type: "image", orientation: "landscape", url: "/av5.JPG" },
        { type: "image", orientation: "landscape",  url: "/av6.JPG" },
        { type: "image", orientation: "landscape", url: "/av4.JPG" },
        { type: "image", orientation: "portrait",  url: "/av9.jpg" },
        { type: "image", orientation: "landscape", url: "/av10.jpg" }
    ]
  },
  { 
    id: 7, 
    title: "Mark XXIV Hackathon", 
    role: "Organizer", 
    location: "Woxsen", 
    badge: null, 
    desc: "24-hour coding marathon logistics.", 
    media: [
        { type: "video", orientation: "landscape", url: "/mark1.mov" },
        { type: "image", orientation: "portrait", url: "/mark1.PNG" },
    ]
  },
  { 
    id: 8, 
    title: "Oriental Group Hackathon", 
    role: "Participant", 
    location: "Bhopal", 
    badge: null, 
    desc: "Competitive programming and rapid prototyping.", 
    media: [
        { type: "image", orientation: "portrait", url: "/b2.jpeg" },
        { type: "image", orientation: "portrait",  url: "/b1.jpeg" },
    ]
  },
  { 
    id: 9, 
    title: "GDSC WOW Hackathon", 
    role: "Participant", 
    location: "Kerala", 
    badge: null, 
    desc: "Google Developer Student Club's flagship regional event.", 
    media: [
        { type: "image", orientation: "portrait",  url: "/65ef6595-76bd-4c0c-8f07-3182480d336a.JPG" },
        { type: "image", orientation: "landscape", url: "/k2.jpg" },
    ]
  },
];

const Activities = () => {
  const targetRef = useRef(null);
  
  // High scroll height for slow movement
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // --- OPTIMIZED ANIMATIONS ---
  
  // Portal Text: Fades out quickly
  const portalScale = useTransform(scrollYProgress, [0, 0.1], [1, 50]);
  const portalOpacity = useTransform(scrollYProgress, [0.05, 0.1], [1, 0]);
  
  // Gallery Visibility:
  const galleryOpacity = useTransform(scrollYProgress, [0.05, 0.1], [0, 1]);
  const galleryBlur = useTransform(scrollYProgress, [0.05, 0.1], ["10px", "0px"]);

  // Horizontal Scroll:
  // Starts after the entrance animation is complete
  const x = useTransform(scrollYProgress, [0.1, 1], ["0%", "-100%"]);

  const handleSkip = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      // Small timeout ensures the browser finds the element if it was lazy loaded
      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 10);
    }
  };

  return (
    <section ref={targetRef} className="relative h-[2200vh] bg-black">
      
      <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-black perspective-1000">
        
        <MatrixRain />

        <motion.button
            onClick={handleSkip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 right-8 z-[1000] flex items-center gap-2 text-[#00FF41] font-mono text-xs uppercase tracking-widest border border-[#00FF41]/30 px-6 py-3 rounded-full hover:bg-[#00FF41] hover:text-black transition-all bg-black/80 backdrop-blur-md cursor-pointer"
        >
            Skip Gallery <FaForward />
        </motion.button>
        
        {/* PORTAL TEXT */}
        <motion.div 
            style={{ scale: portalScale, opacity: portalOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
        >
             <h2 className="text-[12vw] font-black text-white leading-none tracking-tighter shadow-2xl drop-shadow-[0_0_25px_rgba(0,255,65,0.5)]">
                BEYOND
            </h2>
            <h2 className="text-[12vw] font-black text-transparent leading-none tracking-tighter" style={{ WebkitTextStroke: "2px white" }}>
                THE CODE
            </h2>
        </motion.div>

        {/* HORIZONTAL TRACK */}
        <motion.div 
            style={{ x, opacity: galleryOpacity, filter: galleryBlur }}
            className="flex items-center h-full pl-[25vw] pr-[10vw] gap-32 relative z-20 will-change-transform"
        >
            {events.map((event, index) => (
                <EventCluster key={event.id} event={event} index={index} />
            ))}
        </motion.div>
      </div>
    </section>
  );
};

const EventCluster = ({ event, index }) => {
    return (
        <div className="flex flex-row items-center gap-16 flex-shrink-0">
            <div className="w-[450px] flex-shrink-0 z-30 flex flex-col justify-center relative border-l-4 border-[#00FF41]/50 pl-8 py-10 bg-black/80 backdrop-blur-md rounded-r-2xl border-y border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <span className="text-9xl font-black text-[#00FF41]/10 absolute -top-16 -left-10 -z-10 select-none">0{index + 1}</span>
                {event.badge && (
                    <div className="inline-flex items-center gap-2 bg-[#00FF41] text-black px-4 py-1 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(0,255,65,0.6)] w-fit rounded-sm">
                        <FaCrown /> {event.badge}
                    </div>
                )}
                <h3 className="text-5xl font-black text-white uppercase leading-[0.9] mb-4 drop-shadow-xl">{event.title}</h3>
                <div className="flex items-center gap-3 text-gray-400 text-sm mb-4 font-mono"><FaMapMarkerAlt className="text-[#00FF41]" /> {event.location}</div>
                <p className="text-white font-mono text-sm mb-6 border-l-2 border-[#00FF41] pl-4 py-1">{event.role}</p>
                <p className="text-gray-300 text-base leading-relaxed">{event.desc}</p>
            </div>
            <div className="flex items-center gap-8">
                {event.media.map((item, i) => <ScatterCard key={i} item={item} index={i} />)}
            </div>
        </div>
    )
}

const ScatterCard = ({ item, index }) => {
    const yOffset = Math.sin(index * 132) * 150; 
    const rotate = (index % 2 === 0 ? 3 : -3) + (Math.sin(index) * 4);
    const width = item.orientation === "landscape" ? "w-[450px]" : "w-[320px]";
    const aspectRatio = item.orientation === "landscape" ? "aspect-video" : "aspect-[3/4]";
    return (
        <motion.div
            className={`relative flex-shrink-0 ${width} ${aspectRatio} bg-[#111] border border-white/20 p-2 shadow-2xl group cursor-pointer`}
            style={{ y: yOffset, rotate: rotate, marginTop: index % 2 === 0 ? "0px" : "80px", zIndex: 10 }}
            // Hover animation: Scales up, straightens, glows green, brings to front
            whileHover={{ scale: 1.25, rotate: 0, zIndex: 1000, borderColor: "#00FF41", boxShadow: "0px 0px 50px rgba(0, 255, 65, 0.3)", transition: { duration: 0.3, type: "spring" }}}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "200px" }}
        >
            {/* Removed grayscale class here */}
            <div className="w-full h-full overflow-hidden relative bg-gray-900">
                {item.type === 'video' ? (
                     <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                        <FaVideo className="text-white/50 text-5xl z-10" />
                        {item.url ? (
                             <video 
                                src={item.url} 
                                className="absolute inset-0 w-full h-full object-cover opacity-80" 
                                muted 
                                loop 
                                onMouseOver={e => e.target.play()} 
                                onMouseOut={e => e.target.pause()}
                             />
                        ) : null}
                    </div>
                ) : (
                    <img src={item.url || "https://placehold.co/600x400/000000/FFF?text=Image"} alt="Event Media" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            </div>
        </motion.div>
    );
};

export default Activities;