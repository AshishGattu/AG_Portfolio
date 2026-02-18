import React, { useRef, useEffect, useState } from "react";

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const [backgroundColor, setBackgroundColor] = useState("rgba(5,5,5,1)");
  
  useEffect(() => {
    const canvas = canvasRef.current;
    
    const particleCount = 100; 
    const connectionDistance = 150;
    const mouseDistance = 200;

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    const updateColors = () => {
        const scroll = window.scrollY;
        const h = window.innerHeight;

        // 1. PROJECTS (Dark -> Light)
        const pInStart = h * 2.3;
        const pInEnd = h * 3.5;

        // 2. PROJECTS EXIT (Light -> Dark)
        const pOutStart = h * 6.0; 
        const pOutEnd = h * 8.2;

        // 3. SKILLS & EDUCATION (Dark -> Light)
        // Skills starts at ~10h (after expanded skills height).
        // Education starts at ~14h.
        // We fade to light at 9.2h and KEEP it light.
        const sInStart = h * 9.2; 
        const sInEnd = h * 10.2;

        // 4. ACTIVITIES ENTRY (Light -> Dark)
        // Education ends around 16.0h (due to height).
        // Activities starts. We fade to BLACK.
        const aOutStart = h * 14.5;
        const aOutEnd = h * 15.5;

        const cInStart = h * 18.0;

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

        const pR = 204 - (84 * isLight);  
        const pG = 255 - (205 * isLight); 
        const pB = 0 + (255 * isLight);   
        
        const lR = 150 * (1 - isLight);
        const lG = 150 * (1 - isLight);
        const lB = 255 * (1 - isLight);

        const bgR = 5 + (222 * isLight);
        const bgG = 5 + (222 * isLight);
        const bgB = 5 + (222 * isLight);
        
        setBackgroundColor(`rgb(${Math.round(bgR)}, ${Math.round(bgG)}, ${Math.round(bgB)})`);

        const alpha = isLight > 0.5 ? 1.0 : 0.9;

        return {
            particle: `rgba(${pR}, ${pG}, ${pB}, ${alpha})`,
            line: (distAlpha) => `rgba(${lR}, ${lG}, ${lB}, ${distAlpha * alpha})`
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
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseDistance) {
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
        const ctx = canvas.getContext("2d");
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

    const animate = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      const colors = updateColors();
      
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
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
        particle.update();
        particle.draw(colors);
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });
    window.addEventListener("mouseout", () => {
      mouse.x = null;
      mouse.y = null;
    });

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div 
        style={{ backgroundColor: backgroundColor, transition: 'background-color 0.1s linear' }}
        className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
    >
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ParticlesBackground;