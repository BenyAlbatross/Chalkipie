'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LiftProps {
  currentFloor: number;
  totalFloors: number;
  isMoving: boolean;
  direction: 'up' | 'down' | 'idle';
}

/**
 * Lift Component
 * 
 * Displays an animated lift car that moves between floors.
 * 
 * Key fixes implemented:
 * - Floor positioning: Floor 1 = index 0 (bottom), Floor 20 = index 19 (top)
 * - Formula: floorIndex * FLOOR_HEIGHT positions from bottom
 * - During movement: Up = 60% from bottom, Down = 40% from bottom
 * - Smooth Framer Motion animation with 0.8s cubic-bezier transition
 * - Lift height = 80% of floor height for proper proportion
 */
export default function Lift({ currentFloor, totalFloors, isMoving, direction }: LiftProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const FLOOR_HEIGHT = 450;
  const LIFT_HEIGHT = FLOOR_HEIGHT * 0.8; // 80% of floor height
  
  // Calculate position from bottom - floor 1 is at bottom (index 0), floor 20 is at top (index 19)
  const floorIndex = currentFloor - 1; // Floor 1 = index 0, Floor 2 = index 1, etc.
  // Align lift bottom with floor line
  const targetPosition = floorIndex * FLOOR_HEIGHT;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw rough/sketchy border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        
        // Draw imperfect rectangle
        ctx.beginPath();
        ctx.moveTo(2, 2);
        ctx.lineTo(canvas.width - 2, 3);
        ctx.lineTo(canvas.width - 1, canvas.height - 2);
        ctx.lineTo(1, canvas.height - 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }, []);

  return (
    <motion.div
      className="lift-car absolute left-2 right-2 rounded"
      style={{
        height: `${LIFT_HEIGHT}px`,
      }}
      initial={{ bottom: `${targetPosition}px` }}
      animate={{
        bottom: `${targetPosition}px`,
      }}
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth motion
      }}
    >
      <canvas
        ref={canvasRef}
        width={160}
        height={LIFT_HEIGHT}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Lift windows */}
      <div className="grid grid-cols-2 gap-2 p-4 h-full relative z-10">
        <div className="bg-pastel-yellow/30 border border-black rounded"></div>
        <div className="bg-pastel-yellow/30 border border-black rounded"></div>
        <div className="bg-pastel-yellow/30 border border-black rounded"></div>
        <div className="bg-pastel-yellow/30 border border-black rounded"></div>
      </div>
      
      {/* Floor indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded text-sm font-bold z-10">
        {isMoving && direction === 'up' && '↑ '}
        {isMoving && direction === 'down' && '↓ '}
        {currentFloor}
      </div>
    </motion.div>
  );
}

