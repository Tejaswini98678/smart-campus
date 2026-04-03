'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Login3DBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the parallax effect
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate offset from center (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      
      mouseX.set(x * 30); // Max 30px horizontal shift
      mouseY.set(y * 30); // Max 30px vertical shift
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]">
      {/* Dynamic Grid Texture */}
      <div 
        className="absolute inset-0 z-20 opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />
      
      {/* High-Fidelity 3D Visual with Enhanced Parallax */}
      <motion.div 
        style={{ 
          x: springX, 
          y: springY,
          scale: 1.1 // Larger scale for deeper immersive depth
        }}
        className="absolute inset-0 z-0 flex items-center justify-center opacity-40 mix-blend-screen"
      >
        <img 
          src="/v7_academic_bg.png" 
          alt="Smart Campus V7 Visualization"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617] z-10" />
      <div className="absolute inset-0 backdrop-blur-[2px] z-5 opacity-40" />
      
      {/* Vibrant Ambient Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/15 rounded-full blur-[120px] z-20 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-cyan-500/15 rounded-full blur-[120px] z-20" />
    </div>
  );
}
