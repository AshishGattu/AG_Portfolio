import React, { useRef, useEffect } from "react";

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const particleCount = window.innerWidth < 768 ? 45 : 100;
    const connectionDistance = 150;
    const mouseDistance = 200;
    const connectionDistanceSq = connectionDistance * connectionDistance;
    const mouseDistanceSq = mouseDistance * mouseDistance;

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    let rafId;
    let anchors = { P: null, S: null, A: null };

    // Cached live section positions (document coordinates); refreshed on resize / layout change.
    const readTop = (id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
    };
    const refreshAnchors = () => {
        anchors = { P: readTop("projects"), S: readTop("skills"), A: readTop("activities") };
    };

    const updateColors = () => {
        const scroll = window.scrollY;
        const h = window.innerHeight;
        const { P, S, A } = anchors;

        // 1. PROJECTS (Dark -> Light)
        const pInStart = P != null ? P - h : h * 2.3;
        const pInEnd = P != null ? P + 0.2 * h : h * 3.5;

        // 2. PROJECTS EXIT (Light -> Dark)
        const pOutStart = P != null ? P + 2.7 * h : h * 6.0;
        const pOutEnd = P != null ? P + 4.9 * h : h * 8.2;

        // 3. SKILLS & EDUCATION (Dark -> Light)
        // Skills starts at ~10h (after expanded skills height).
        // Education starts at ~14h.
        // We fade to light at 9.2h and KEEP it light.
        const sInStart = S != null ? S - 0.8 * h : h * 9.2;
        const sInEnd = S != null ? S + 0.2 * h : h * 10.2;

        // 4. ACTIVITIES ENTRY (Light -> Dark)
        // Education ends around 16.0h (due to height).
        // Activities starts. We fade to BLACK.
        const aOutStart = A != null ? A - h : h * 14.5;
        const aOutEnd = A != null ? A : h * 15.5;

        let isLight = 0; 

        if (scroll < pInStart) { isLight = 0; } 
        else if (scroll < pInEnd) { isLight = (scroll - pInStart) / (pInEnd - pInStart); } 
        else if (scroll < pOutStart) { isLight = 1; } 
        else if (scroll < pOutEnd) { isLight = 1 - ((scroll - pOutStart) / (pOutEnd - pOutStart)); } 
        else if (scroll < sInStart) { isLight = 0; } 
        else if (scroll < sInEnd) { isLight = (scroll - sInStart) / (sInEnd - sInStart); } 
        else if (scroll < aOutStart) { isLight = 1; } // Stay Light
        else if (scroll < aOutEnd) { isLight = 1 - ((scroll - aOutStart) / (aOutEnd - aOutStart)); } // Fade to Dark
        else { isLight = 0; } 

        isLight = Math.min(Math.max(isLight, 0), 1);

        // Particles: lime (#ccff00) -> near-black (#111). Lines: blue-grey -> black.
        const pR = 204 + (17 - 204) * isLight;
        const pG = 255 + (17 - 255) * isLight;
        const pB = 0 + (17 - 0) * isLight;

        const lR = 150 * (1 - isLight);
        const lG = 150 * (1 - isLight);
        const lB = 255 * (1 - isLight);

        const bgV = 5 + (222 * isLight);
        wrapper.style.backgroundColor = `rgb(${Math.round(bgV)}, ${Math.round(bgV)}, ${Math.round(bgV)})`;

        const alpha = isLight > 0.5 ? 1.0 : 0.9;

        return {
            particle: `rgba(${Math.round(pR)}, ${Math.round(pG)}, ${Math.round(pB)}, ${alpha})`,
            line: (distAlpha) => `rgba(${Math.round(lR)}, ${Math.round(lG)}, ${Math.round(lB)}, ${distAlpha * alpha})`
        };
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8; 
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 2 + 2; 
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseDistanceSq && distSq > 0) {
            const distance = Math.sqrt(distSq);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDistance - distance) / mouseDistance;
            const directionX = forceDirectionX * force * 2;
            const directionY = forceDirectionY * force * 2;

            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }

      draw(colors) {
        ctx.fillStyle = colors.particle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const frame = (move) => {
      ctx.clearRect(0, 0, width, height);
      const colors = updateColors();
      
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistanceSq) {
            const distance = Math.sqrt(distSq);
            ctx.strokeStyle = colors.line(1 - distance / connectionDistance);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        if (move) particle.update();
        particle.draw(colors);
      });
    };

    const animate = () => {
      frame(true);
      rafId = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      if (reducedMotion) return;
      cancelAnimationFrame(rafId);
      if (!document.hidden) rafId = requestAnimationFrame(animate);
    };

    // Reduced motion: single static frame, redrawn only when scroll/resize changes colours.
    let staticQueued = false;
    const queueStatic = () => {
      if (staticQueued) return;
      staticQueued = true;
      requestAnimationFrame(() => { staticQueued = false; frame(false); });
    };

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };
    const handleResize = () => {
      resize();
      refreshAnchors();
      if (reducedMotion) queueStatic();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("load", refreshAnchors);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    const resizeObserver = new ResizeObserver(refreshAnchors);
    resizeObserver.observe(document.body);

    init();
    refreshAnchors();
    if (reducedMotion) {
      frame(false);
      window.addEventListener("scroll", queueStatic, { passive: true });
    } else {
      animate();
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("scroll", queueStatic);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", refreshAnchors);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <div 
        ref={wrapperRef}
        style={{ backgroundColor: "rgb(5, 5, 5)" }}
        className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
    >
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ParticlesBackground;