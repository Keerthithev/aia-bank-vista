import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const AnimatedBackground: React.FC = () => {
  const bgRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        backgroundPosition: "200% 0%",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
    // Animate floating circles
    circlesRef.current.forEach((circle, i) => {
      if (circle) {
        gsap.to(circle, {
          y: gsap.utils.random(-30, 30),
          x: gsap.utils.random(-30, 30),
          scale: gsap.utils.random(0.9, 1.2),
          duration: gsap.utils.random(4, 7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5
        });
      }
    });
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 bg-[length:200%_200%] transition-all overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          ref={el => (circlesRef.current[i] = el)}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${80 + i * 20}px`,
            height: `${80 + i * 20}px`,
            left: `${10 + i * 15}%`,
            top: `${10 + i * 12}%`,
            background: `radial-gradient(circle at 30% 30%, #60a5fa 60%, #2563eb 100%)`,
            filter: "blur(2px)"
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground; 