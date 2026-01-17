'use client';

import { motion } from 'framer-motion';

interface LiftProps {
  currentFloor: number;
  totalFloors: number;
  isMoving: boolean;
  direction: 'up' | 'down' | 'idle';
}

/**
 * Hand-Drawn Lift Component
 */
export default function Lift({ currentFloor, totalFloors, isMoving, direction }: LiftProps) {
  const FLOOR_HEIGHT = 450;
  const LIFT_HEIGHT = FLOOR_HEIGHT * 0.8; 
  
  const floorIndex = currentFloor - 1;
  const targetPosition = floorIndex * FLOOR_HEIGHT;

  // Use negative translateY to move UP from bottom: 0
  const targetY = -targetPosition;

  return (
    <motion.div
      className="absolute left-2 right-2 z-10"
      style={{
        height: `${LIFT_HEIGHT}px`,
        bottom: 0, // Anchor to bottom
        willChange: 'transform', // Hint for browser optimization
      }}
      initial={{ y: targetY }}
      animate={{
        y: targetY,
      }}
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Hand-drawn Box SVG Container */}
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="absolute inset-0 overflow-visible" // Removed drop-shadow-md
      >
        {/* Main Box Outline - intentionally slightly messy */}
        <path 
          d="M2,2 L98,3 L99,98 L3,97 Z" 
          fill="white" 
          stroke="black" 
          strokeWidth="3" 
          strokeLinejoin="round"
        />
        
        {/* Inner detail lines/shading */}
        <path 
          d="M5,5 L95,6 L94,94 L6,93 Z" 
          fill="none" 
          stroke="rgba(0,0,0,0.1)" 
          strokeWidth="1" 
        />
        
        {/* Cables at top */}
        <path d="M40,2 L40,-500" stroke="black" strokeWidth="2" />
        <path d="M60,2 L60,-500" stroke="black" strokeWidth="2" />
      </svg>

      {/* Lift Content */}
      <div className="relative h-full w-full p-4 flex flex-col items-center justify-center">
        
        {/* Windows */}
        <div className="w-full h-1/2 grid grid-cols-2 gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
             <div key={i} className="relative">
                <svg width="100%" height="100%" viewBox="0 0 40 40" preserveAspectRatio="none">
                  <path 
                     d="M2,2 L38,3 L39,38 L1,37 Z" 
                     fill="#ffffba" 
                     fillOpacity="0.5" 
                     stroke="black" 
                     strokeWidth="2"
                  />
                  {/* Reflection mark */}
                  <path d="M10,10 L15,25" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                </svg>
             </div>
          ))}
        </div>

        {/* Floor Indicator Display */}
        <div className="relative">
             <svg width="60" height="30" viewBox="0 0 60 30" className="absolute -inset-2">
                 <path d="M0,0 L60,2 L58,28 L2,30 Z" fill="black" />
             </svg>
             <div className="relative z-10 text-white font-bold text-xl flex items-center justify-center gap-1 font-mono">
                {isMoving && direction === 'up' && <span className="animate-bounce">↑</span>}
                {isMoving && direction === 'down' && <span className="animate-bounce">↓</span>}
                <span>{String(currentFloor).padStart(2, '0')}</span>
             </div>
        </div>

      </div>
    </motion.div>
  );
}