import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const AnimatedBackground: React.FC = () => {
  const bgRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!bgRef.current) return;
    // Animate gradient background position
    gsap.to(bgRef.current, {
      backgroundPosition: "200% 0%",
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
    // Animate floating SVG shapes
    if (svgRef.current) {
      gsap.to(svgRef.current.querySelectorAll('ellipse'), {
        y: '+=30',
        repeat: -1,
        yoyo: true,
        duration: 6,
        stagger: 0.5,
        ease: "sine.inOut"
      });
      gsap.to(svgRef.current.querySelectorAll('ellipse'), {
        x: '+=20',
        repeat: -1,
        yoyo: true,
        duration: 8,
        stagger: 0.5,
        ease: "sine.inOut"
      });
    }
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 bg-[length:200%_200%] transition-all"
      style={{ pointerEvents: "none" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        <ellipse cx="300" cy="200" rx="120" ry="60" fill="#3b82f6" fillOpacity="0.15" />
        <ellipse cx="1200" cy="700" rx="180" ry="80" fill="#2563eb" fillOpacity="0.12" />
        <ellipse cx="900" cy="300" rx="100" ry="40" fill="#0ea5e9" fillOpacity="0.10" />
        <ellipse cx="600" cy="800" rx="140" ry="60" fill="#38bdf8" fillOpacity="0.13" />
      </svg>
    </div>
  );
};

export default AnimatedBackground; 