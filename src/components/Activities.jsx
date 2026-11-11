import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaMapMarkerAlt, FaVideo, FaCrown, FaForward } from "react-icons/fa";
import { scrollToSection } from "../lib/scrollTo";
import { useMediaQuery } from "../lib/useMediaQuery";

// --- MATRIX RAIN (only runs while on screen, respects reduced motion) ---
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let drops = Array(Math.floor(width / 20)).fill(1);

    let rafId = null;
    let last = 0;
    let visible = false;

    const draw = (now) => {
      rafId = requestAnimationFrame(draw);
      // ~20fps is plenty for this effect and keeps scrolling smooth
      if (now - last < 50) return;
      last = now;
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ccff00";
      ctx.font = "14px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? "1" : "0";
        ctx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i] * 20 > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const start = () => { if (rafId == null && visible && !document.hidden) rafId = requestAnimationFrame(draw); };
    const stop = () => { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    observer.observe(canvas);

    const handleVisibility = () => (document.hidden ? stop() : start());
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      drops = Array(Math.floor(width / 20)).fill(1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0" />;
};

// --- EVENTS DATA ---
const events = [
  { 
    id: 1, 
    title: "Udhgam 1.0 & 2.0", 
    role: "Event Manager", 
    location: "Woxsen University", 
    badge: "Events Chief", 
    desc: "Laid the foundation for the woxsen major competitive coding event in 2025 & 2026.", 
    media: [
        { type: "image", orientation: "portrait", url: "/media/udhgam-1.webp" },
        { type: "image", orientation: "landscape", url: "/media/udhgam-2.webp" },
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
        { type: "image", orientation: "landscape", url: "/media/jd-1.webp" },
        { type: "image", orientation: "portrait",  url: "/media/jd-2.webp" },
        { type: "image", orientation: "portrait", url: "/media/jd-3.webp" },
    ]
  },
  { 
    id: 3, 
    title: "Code Relay", 
    role: "Organizer", 
    location: "Campus", 
    badge: "Tech Club Sr. Executive", 
    desc: "A high-speed relay coding competition emphasizing teamwork.", 
    media: [
        { type: "image", orientation: "portrait", url: "/media/coderelay-1.webp" },
        { type: "image", orientation: "landscape", url: "/media/coderelay-2.webp" }
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
        { type: "image", orientation: "landscape", url: "/media/nvidia-2.webp" },
        { type: "image", orientation: "portrait",  url: "/media/nvidia-1.webp" },
        { type: "image", orientation: "landscape", url: "/media/nvidia-3.webp" },
        { type: "image", orientation: "portrait",  url: "/media/nvidia-5.webp" },
        { type: "image", orientation: "landscape", url: "/media/nvidia-4.webp" },
        { type: "image", orientation: "landscape", url: "/media/nvidia-6.webp" },
    ]
  },
  { 
    id: 5, 
    title: "International Collaboration Summit", 
    role: "Core Team", 
    location: "Global", 
    badge: "Tech Club Sr. Executive", 
    desc: "Fostering global tech partnerships.", 
    media: [
        { type: "image", orientation: "landscape", url: "/media/icc-1.webp" },
        { type: "image", orientation: "landscape",  url: "/media/icc-2.webp" },
    ]
  },
  { 
    id: 6, 
    title: "Ajman University Winter Study Tour", 
    role: "International Scholar", 
    location: "UAE", 
    badge: null, 
    desc: "A 2023 week of immersion in Middle Eastern tech and business ecosystems.", 
    media: [
        { type: "image", orientation: "landscape", url: "/media/ajman-1.webp" },
        { type: "image", orientation: "landscape",  url: "/media/ajman-2.webp" },
        { type: "image", orientation: "landscape", url: "/media/ajman-3.webp" },
        { type: "image", orientation: "portrait", url: "/media/ajman-4.webp" },
        { type: "image", orientation: "landscape", url: "/media/ajman-5.webp" },
        { type: "image", orientation: "landscape",  url: "/media/ajman-6.webp" },
        { type: "image", orientation: "landscape", url: "/media/ajman-7.webp" },
    ]
  },
  { 
    id: 7, 
    title: "Mark XXIV National Hackathon", 
    role: "Organizer", 
    location: "Woxsen", 
    badge: null, 
    desc: "Organized the 24-hour MARK XXIV national coding marathon in 2023, handling event logistics.", 
    media: [
        { type: "video", orientation: "landscape", url: "/media/mark24.mp4", poster: "/media/mark24-poster.webp" },
        { type: "image", orientation: "portrait", url: "/media/mark24-1.webp" },
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
        { type: "image", orientation: "portrait", url: "/media/oriental-1.webp" },
        { type: "image", orientation: "portrait",  url: "/media/oriental-2.webp" },
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
        { type: "image", orientation: "portrait",  url: "/media/gdsc-1.webp" },
        { type: "image", orientation: "landscape", url: "/media/gdsc-2.webp" },
    ]
  },
];

const Activities = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    isDesktop ? <DesktopGallery /> : <MobileGallery />
  );
};

// --- DESKTOP: scroll-driven horizontal gallery ---
const DesktopGallery = () => {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Portal text intro
  const portalScale = useTransform(scrollYProgress, [0, 0.08], [1, 50]);
  const portalOpacity = useTransform(scrollYProgress, [0.04, 0.08], [1, 0]);

  // Gallery visibility
  const galleryOpacity = useTransform(scrollYProgress, [0.04, 0.08], [0, 1]);

  // Horizontal scroll starts after the entrance animation
  const x = useTransform(scrollYProgress, [0.08, 1], ["0%", "-100%"]);

  return (
    <section ref={targetRef} className="relative h-[900vh] bg-black">

      <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-black perspective-1000">

        <MatrixRain />

        <motion.button
            onClick={() => scrollToSection("contact")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 right-8 z-[1000] flex items-center gap-2 text-[#ccff00] font-mono text-xs uppercase tracking-widest border border-[#ccff00]/30 px-6 py-3 rounded-full hover:bg-[#ccff00] hover:text-black transition-all bg-black/80 backdrop-blur-md cursor-pointer"
        >
            Skip Gallery <FaForward />
        </motion.button>

        {/* PORTAL TEXT */}
        <motion.div
            style={{ scale: portalScale, opacity: portalOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
        >
             <h2 className="text-[12vw] font-black text-white leading-none tracking-tighter shadow-2xl drop-shadow-[0_0_25px_rgba(204,255,0,0.5)]">
                BEYOND
            </h2>
            <h2 className="text-[12vw] font-black text-transparent leading-none tracking-tighter" style={{ WebkitTextStroke: "2px white" }}>
                THE CODE
            </h2>
        </motion.div>

        {/* HORIZONTAL TRACK */}
        <motion.div
            style={{ x, opacity: galleryOpacity }}
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

// --- MOBILE: simple vertical layout, swipeable photo rows ---
const MobileGallery = () => (
  <section className="relative bg-black py-16 overflow-hidden">
    <MatrixRain />
    <div className="relative z-10">
      <div className="px-6 mb-12">
        <h2 className="text-6xl font-black text-white leading-none tracking-tighter drop-shadow-[0_0_25px_rgba(204,255,0,0.5)]">BEYOND</h2>
        <h2 className="text-6xl font-black text-transparent leading-none tracking-tighter" style={{ WebkitTextStroke: "2px white" }}>THE CODE</h2>
      </div>
      <div className="flex flex-col gap-16">
        {events.map((event, index) => (
          <div key={event.id} className="flex flex-col gap-6">
            <div className="mx-6">
              <EventPanel event={event} index={index} className="w-full" />
            </div>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4" data-lenis-prevent-touch>
              {event.media.map((item, i) => (
                <div key={i} className={`snap-center shrink-0 ${item.orientation === "landscape" ? "w-[80vw] aspect-video" : "w-[60vw] aspect-[3/4]"} bg-[#111] border border-white/20 p-2`}>
                  <MediaItem item={item} alt={`${event.title} photo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const EventPanel = ({ event, index, className = "w-[85vw] md:w-[450px] flex-shrink-0" }) => (
    <div className={`${className} z-30 flex flex-col justify-center relative border-l-4 border-[#ccff00]/50 pl-8 py-10 pr-4 bg-black/80 rounded-r-2xl border-y border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
        <span className="text-9xl font-black text-[#ccff00]/10 absolute -top-16 -left-10 -z-10 select-none">0{index + 1}</span>
        {event.badge && (
            <div className="inline-flex items-center gap-2 bg-[#ccff00] text-black px-4 py-1 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(204,255,0,0.6)] w-fit rounded-sm">
                <FaCrown /> {event.badge}
            </div>
        )}
        <h3 className="text-3xl md:text-5xl font-black text-white uppercase leading-[0.9] mb-4 drop-shadow-xl">{event.title}</h3>
        <div className="flex items-center gap-3 text-gray-400 text-sm mb-4 font-mono"><FaMapMarkerAlt className="text-[#ccff00]" /> {event.location}</div>
        <p className="text-white font-mono text-sm mb-6 border-l-2 border-[#ccff00] pl-4 py-1">{event.role}</p>
        <p className="text-gray-300 text-base leading-relaxed">{event.desc}</p>
    </div>
);

const EventCluster = ({ event, index }) => {
    return (
        <div className="flex flex-row items-center gap-16 flex-shrink-0">
            <EventPanel event={event} index={index} />
            <div className="flex items-center gap-8">
                {event.media.map((item, i) => <ScatterCard key={i} item={item} index={i} alt={`${event.title} photo ${i + 1}`} />)}
            </div>
        </div>
    )
}

// Image or video. Video: plays on hover (mouse) or while in view (touch).
const MediaItem = ({ item, alt }) => {
    const videoRef = useRef(null);
    const isTouch = useMediaQuery("(hover: none)", false);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || !isTouch) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) v.play().catch(() => {});
            else v.pause();
        }, { threshold: 0.5 });
        observer.observe(v);
        return () => observer.disconnect();
    }, [isTouch]);

    return (
        <div className="w-full h-full overflow-hidden relative bg-gray-900">
            {item.type === "video" ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                    <FaVideo className="text-white/50 text-5xl z-10 pointer-events-none" />
                    <video
                        ref={videoRef}
                        src={item.url}
                        poster={item.poster}
                        preload="none"
                        aria-label={alt}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => { if (!isTouch) e.currentTarget.play().catch(() => {}); }}
                        onMouseOut={(e) => { if (!isTouch) e.currentTarget.pause(); }}
                    />
                </div>
            ) : (
                <img src={item.url} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        </div>
    );
};

const ScatterCard = ({ item, index, alt }) => {
    const yOffset = Math.sin(index * 132) * 150;
    const rotate = (index % 2 === 0 ? 3 : -3) + (Math.sin(index) * 4);
    const width = item.orientation === "landscape" ? "w-[80vw] md:w-[450px]" : "w-[60vw] md:w-[320px]";
    const aspectRatio = item.orientation === "landscape" ? "aspect-video" : "aspect-[3/4]";
    return (
        <motion.div
            className={`relative flex-shrink-0 ${width} ${aspectRatio} bg-[#111] border border-white/20 p-2 shadow-2xl group cursor-pointer`}
            style={{ y: yOffset, rotate: rotate, marginTop: index % 2 === 0 ? "0px" : "80px", zIndex: 10 }}
            // Hover animation: Scales up, straightens, glows lime, brings to front
            whileHover={{ scale: 1.25, rotate: 0, zIndex: 1000, borderColor: "#ccff00", boxShadow: "0px 0px 50px rgba(204, 255, 0, 0.3)", transition: { duration: 0.3, type: "spring" }}}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "200px" }}
        >
            <MediaItem item={item} alt={alt} />
        </motion.div>
    );
};

export default Activities;
