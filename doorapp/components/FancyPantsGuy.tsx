'use client';

import { useEffect, useRef, useState } from 'react';

interface FancyPantsGuyProps {
  floors: number[];
  selectedFloor: number | null;
  onFloorChange: (floor: number) => void;
}

const FLOOR_HEIGHT = 450;
const HEADER_HEIGHT = 70;

// Scaling factor for size increase
const SCALE_FACTOR = 1.8; 

// Original dimensions * scale
const CHARACTER_WIDTH = 30 * SCALE_FACTOR; 
const CHARACTER_HEIGHT = 80 * SCALE_FACTOR; 

// Original feet offset (62) * scale
const FEET_VISUAL_OFFSET = 62 * SCALE_FACTOR;

// PHYSICS CONSTANTS
const GRAVITY = 1.2;
const JUMP_FORCE = -28;
const DOUBLE_JUMP_FORCE = -22;
const MOVE_SPEED = 12;
const FRICTION = 0.82;
const ACCELERATION = 2;

export default function FancyPantsGuy({ floors, selectedFloor, onFloorChange }: FancyPantsGuyProps) {
  const state = useRef({
    x: 100,
    y: 0,
    vx: 0,
    vy: 0,
    isGrounded: false,
    jumps: 0,
    facingRight: true,
    ignoreCollisionTimer: 0,
    currentFloor: -1,
  });

  const keys = useRef({
    left: false, right: false, up: false, down: false, jumpPressed: false,
  });

  const characterRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLElement | null>(null); // Cache stick element
  const containerOffsetRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(5000);

  // Init environment
  useEffect(() => {
    if (characterRef.current) {
        // Cache stick element
        stickRef.current = characterRef.current.querySelector('.stick');

        const parent = characterRef.current.offsetParent as HTMLElement;
        if (parent) {
            let el: HTMLElement | null = parent;
            let top = 0;
            while (el) {
                top += el.offsetTop;
                el = el.offsetParent as HTMLElement;
            }
            containerOffsetRef.current = top;
            containerWidthRef.current = parent.scrollWidth;
            const resizeObserver = new ResizeObserver(() => {
               containerWidthRef.current = parent.scrollWidth;
            });
            resizeObserver.observe(parent);
            return () => resizeObserver.disconnect();
        }
    }
  }, []);

  // Init Position
  useEffect(() => {
    if (selectedFloor !== null && state.current.currentFloor === -1) {
      const sortedFloors = [...floors].sort((a, b) => a - b);
      const index = sortedFloors.indexOf(selectedFloor);
      if (index !== -1) {
        const floorIndexFromTop = sortedFloors.length - 1 - index;
        const groundY = HEADER_HEIGHT + (floorIndexFromTop + 1) * FLOOR_HEIGHT;
        state.current.y = groundY - FEET_VISUAL_OFFSET;
        state.current.x = 200; 
        state.current.currentFloor = selectedFloor;
      }
    }
  }, [selectedFloor, floors]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      switch(e.key) {
        case 'ArrowLeft': case 'a': case 'A': keys.current.left = true; break;
        case 'ArrowRight': case 'd': case 'D': keys.current.right = true; break;
        case 'ArrowUp': case 'w': case 'W': case ' ':
          if (!keys.current.up) keys.current.jumpPressed = true;
          keys.current.up = true;
          break;
        case 'ArrowDown': case 's': case 'S': keys.current.down = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowLeft': case 'a': case 'A': keys.current.left = false; break;
        case 'ArrowRight': case 'd': case 'D': keys.current.right = false; break;
        case 'ArrowUp': case 'w': case 'W': case ' ': keys.current.up = false; break;
        case 'ArrowDown': case 's': case 'S': keys.current.down = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    let animationFrameId: number;
    
    const update = () => {
      const s = state.current;
      const k = keys.current;

      // PHYSICS
      if (k.left) { s.vx -= ACCELERATION; s.facingRight = false; }
      if (k.right) { s.vx += ACCELERATION; s.facingRight = true; }
      
      s.vx = Math.max(Math.min(s.vx, MOVE_SPEED), -MOVE_SPEED);
      if (!k.left && !k.right) s.vx *= FRICTION; else s.vx *= 0.95;
      if (Math.abs(s.vx) < 0.1) s.vx = 0;

      if (k.jumpPressed) {
        if (s.isGrounded) { s.vy = JUMP_FORCE; s.isGrounded = false; s.jumps = 1; }
        else if (s.jumps < 2) { s.vy = DOUBLE_JUMP_FORCE; s.jumps = 2; }
        k.jumpPressed = false; 
      }

      if (k.down && s.isGrounded) { s.ignoreCollisionTimer = 10; s.isGrounded = false; s.vy = 8; }

      s.vy += GRAVITY;
      s.x += s.vx;
      s.y += s.vy;

      // HORIZONTAL BOUNDARIES
      if (s.x < 20) { s.x = 20; s.vx = 0; }
      const maxRight = containerWidthRef.current - CHARACTER_WIDTH - 20;
      if (s.x > maxRight) { s.x = maxRight; s.vx = 0; }

      // VERTICAL HARD LIMITS (Optimization & Safety)
      // Top Limit (Ceiling) - Prevent flying infinitely up
      const minY = 0; // Top of container
      if (s.y < minY) {
          s.y = minY;
          s.vy = 0;
      }
      
      // Bottom Limit (Hard Floor) - Prevent falling forever
      // Total height is Header + Floors
      const totalLevelHeight = HEADER_HEIGHT + (floors.length * FLOOR_HEIGHT);
      const hardFloorY = totalLevelHeight - FEET_VISUAL_OFFSET;
      
      if (s.y > hardFloorY) {
          s.y = hardFloorY;
          s.vy = 0;
          s.isGrounded = true;
          s.jumps = 0;
          // Snap to bottom floor index if we hit rock bottom
          // Index 0 is top floor. Index N-1 is bottom floor.
          // Bottom floor number is ... sortedFloors[0] (Floor 1).
          // We need to trigger floor change if we weren't on it.
          // But regular collision should handle it before we hit hard limit usually.
      }
      
      // PLATFORM COLLISION
      if (s.ignoreCollisionTimer > 0) {
        s.ignoreCollisionTimer--;
      } else if (s.vy >= 0) { 
        const feetY = s.y + FEET_VISUAL_OFFSET;
        const relativeFeetY = feetY - HEADER_HEIGHT;
        const prevRelativeFeetY = (feetY - s.vy) - HEADER_HEIGHT;
        
        // Find the "Next" floor line we might be crossing
        // Lines are at intervals of 450.
        // If we are at 440, next line is 450.
        // If we are at 460, we crossed 450.
        const nextFloorLineRelative = Math.ceil(prevRelativeFeetY / FLOOR_HEIGHT) * FLOOR_HEIGHT;
        
        // Ensure this line is actually within the level!
        // Max relative line is (floors.length) * FLOOR_HEIGHT.
        const maxRelativeLine = floors.length * FLOOR_HEIGHT;

        if (nextFloorLineRelative <= maxRelativeLine) {
            if (prevRelativeFeetY <= nextFloorLineRelative && relativeFeetY >= nextFloorLineRelative) {
            s.y = nextFloorLineRelative + HEADER_HEIGHT - FEET_VISUAL_OFFSET;
            s.vy = 0;
            s.isGrounded = true;
            s.jumps = 0;

            const sortedFloors = [...floors].sort((a, b) => a - b);
            const indexFromTop = Math.round(nextFloorLineRelative / FLOOR_HEIGHT); 
            const rowIndex = Math.max(0, indexFromTop - 1);
            
            if (rowIndex < sortedFloors.length) {
                const landedFloor = sortedFloors[sortedFloors.length - 1 - rowIndex];
                if (landedFloor !== s.currentFloor && landedFloor) {
                    s.currentFloor = landedFloor;
                    onFloorChange(landedFloor);
                }
            }
            } else {
                s.isGrounded = false;
            }
        }
      } else {
        s.isGrounded = false;
      }
      
      // RENDER
      if (characterRef.current) {
        characterRef.current.style.transform = `translate(${s.x}px, ${s.y}px)`;
        
        // Camera Lock (Vertical)
        const absoluteCharY = containerOffsetRef.current + s.y + (CHARACTER_HEIGHT / 2);
        const targetScrollY = absoluteCharY - (window.innerHeight / 2);
        if (Math.abs(window.scrollY - targetScrollY) > 2) {
             window.scrollTo({ top: targetScrollY, behavior: 'auto' });
        }
        
        // Camera Lock (Horizontal) - Optimized: only query closest once or use cached width
        // The container scroll requires element reference.
        // Using `characterRef.current.parentElement?.parentElement` usually works if structure is static.
        // Or keep `closest` if not causing lag.
        const container = characterRef.current.closest('.hotel-facade');
        if (container) {
            const containerWidth = container.clientWidth;
            const targetScrollX = s.x - (containerWidth / 2) + (CHARACTER_WIDTH / 2);
            if (Math.abs(container.scrollLeft - targetScrollX) > 5) {
                container.scrollLeft += (targetScrollX - container.scrollLeft) * 0.1;
            }
        }

        // Animation State Update (Using cached stickRef)
        const stick = stickRef.current;
        if (stick) {
            if (Math.abs(s.vx) > 0.5 && s.isGrounded) {
                stick.classList.add('is-running');
                stick.classList.remove('is-jumping', 'is-falling', 'is-idle');
                stick.style.transform = `scale(${SCALE_FACTOR}) scaleX(${s.facingRight ? 1 : -1})`;
            } else if (!s.isGrounded) {
                stick.classList.add(s.vy < 0 ? 'is-jumping' : 'is-falling');
                stick.classList.remove('is-running', 'is-idle');
                stick.style.transform = `scale(${SCALE_FACTOR}) scaleX(${s.facingRight ? 1 : -1})`;
            } else {
                stick.classList.add('is-idle');
                stick.classList.remove('is-running', 'is-jumping', 'is-falling');
                stick.style.transform = `scale(${SCALE_FACTOR}) scaleX(${s.facingRight ? 1 : -1})`;
            }
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [floors, onFloorChange]);

  return (
    <div 
      ref={characterRef}
      className="fancy-pants-guy absolute top-0 left-0 pointer-events-none z-50 will-change-transform"
      style={{ width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT }}
    >
      <style>{`
        .fancy-pants-guy .stick {
          position: absolute;
          width: 6px;
          height: 30px;
          background: #333;
          border-radius: 3px;
          transition: transform 0.1s; /* Faster update for scale/direction */
          transform-origin: 50% 0; /* Important for scaling */
        }
        .fancy-pants-guy .stick div {
          position: absolute;
          background: #333;
          border-radius: 2px;
          transform-origin: 50% 0%;
        }
        .fancy-pants-guy .head {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          transform: translate(-3px, -14px);
        }
        .fancy-pants-guy .arm {
          width: 4px;
          height: 14px;
          top: 1px;
          left: 1px;
        }
        .fancy-pants-guy .arm .bottom {
          width: 4px;
          height: 12px;
          bottom: -10px;
          left: 0;
        }
        .fancy-pants-guy .leg {
          width: 4px;
          height: 20px;
          bottom: -19px;
          left: 1px;
        }
        .fancy-pants-guy .leg .bottom {
          width: 4px;
          height: 15px;
          bottom: -13px;
          left: 0;
        }
        
        .fancy-pants-guy .left { z-index: -1; }
        .fancy-pants-guy .right { z-index: 1; }

        .is-running .arm.left { animation: run 0.8s linear infinite; }
        .is-running .arm.left .bottom { animation: arm-bottom 0.4s linear infinite; }
        .is-running .arm.right { animation: run 0.8s linear infinite 0.4s; }
        .is-running .arm.right .bottom { animation: arm-bottom 0.4s linear infinite 0.4s; }
        
        .is-running .leg.left { animation: run 0.4s linear infinite; }
        .is-running .leg.left .bottom { animation: leg-bottom 0.4s linear infinite; }
        .is-running .leg.right { animation: run 0.4s linear infinite 0.2s; }
        .is-running .leg.right .bottom { animation: leg-bottom 0.4s linear infinite 0.2s; }

        .is-jumping .arm.left, .is-jumping .arm.right { transform: rotate(160deg); }
        .is-jumping .leg { transform: rotate(30deg); }
        .is-jumping .leg .bottom { transform: rotate(60deg); }
        
        .is-falling .arm.left, .is-falling .arm.right { transform: rotate(170deg); }
        .is-falling .leg { transform: rotate(10deg); }

        @keyframes run {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(60deg); }
          75% { transform: rotate(-60deg); }
        }
        @keyframes arm-bottom {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-90deg); }
        }
        @keyframes leg-bottom {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(120deg); }
        }
      `}</style>

      <div className="stick is-idle">
        <div className="head"></div>
        <div className="arm left"><div className="bottom"></div></div>
        <div className="arm right"><div className="bottom"></div></div>
        <div className="leg left"><div className="bottom"></div></div>
        <div className="leg right"><div className="bottom"></div></div>
      </div>
    </div>
  );
}