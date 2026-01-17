'use client';

import { useEffect, useRef, useState } from 'react';
import { Door } from '@/types/door';

interface FancyPantsGuyProps {
  floors: number[];
  doorsByFloor: { [floor: number]: Door[] };
  selectedFloor: number | null;
  onFloorChange: (floor: number) => void;
  isLiftMoving: boolean;
}

const FLOOR_HEIGHT = 450;
const HEADER_HEIGHT = 70;

// Increased scale for larger character
const SCALE_FACTOR = 2.5; 
const CHARACTER_WIDTH = 30 * SCALE_FACTOR; 
const CHARACTER_HEIGHT = 80 * SCALE_FACTOR; 
// Adjust feet offset to match new height
const FEET_VISUAL_OFFSET = 62 * SCALE_FACTOR;

const GRAVITY = 1.2;
const JUMP_FORCE = -30;
const DOUBLE_JUMP_FORCE = -24;
const MOVE_SPEED = 12;
const FRICTION = 0.82;
const ACCELERATION = 2;

export default function FancyPantsGuy({ floors, doorsByFloor, selectedFloor, onFloorChange, isLiftMoving }: FancyPantsGuyProps) {
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
    runFrame: 0,
    lastFloorChangeTime: 0,
    isRiding: false, 
    visible: true,
    previousFloor: -1,
    lastScrollUpdate: 0,
    smoothScrollY: 0,
    smoothScrollX: 0,
    liftStartY: 0,
    liftTargetY: 0,
    liftStartTime: 0,
  });
  
  // Track if the floor change was initiated by the character (jumping/falling)
  const isManualTransition = useRef(false);

  const keys = useRef({
    left: false, right: false, up: false, down: false, jumpPressed: false, downPressed: false
  });

  const characterRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLElement | null>(null);
  const containerOffsetRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(5000);

  // Cubic Bezier (0.4, 0, 0.2, 1) solver for accurate sync
  const cubicBezier = (t: number, p1x: number, p1y: number, p2x: number, p2y: number) => {
      const cx = 3 * p1x;
      const bx = 3 * (p2x - p1x) - cx;
      const ax = 1 - cx - bx;
      const cy = 3 * p1y;
      const by = 3 * (p2y - p1y) - cy;
      const ay = 1 - cy - by;
      
      const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
      const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
      const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

      // Solve for x = t using Newton-Raphson
      let x = t;
      for (let i = 0; i < 8; i++) {
          const x2 = sampleCurveX(x) - t;
          if (Math.abs(x2) < 1e-5) return sampleCurveY(x);
          const d2 = sampleCurveDerivativeX(x);
          if (Math.abs(d2) < 1e-5) break;
          x = x - x2 / d2;
      }
      return sampleCurveY(x);
  };
  
  const materialEase = (t: number) => cubicBezier(t, 0.4, 0, 0.2, 1);

  // Init environment
  useEffect(() => {
    if (characterRef.current) {
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

  // Init Position & Arrival sync
  useEffect(() => {
    if (selectedFloor !== null) {
      const sortedFloors = [...floors].sort((a, b) => a - b);
      const index = sortedFloors.indexOf(selectedFloor);
      
      if (index !== -1) {
        const floorIndexFromTop = sortedFloors.length - 1 - index;
        const groundY = HEADER_HEIGHT + (floorIndexFromTop + 1) * FLOOR_HEIGHT;
        
        if (state.current.currentFloor === -1) {
             // Initial spawn
             state.current.x = 200;
             state.current.y = groundY - FEET_VISUAL_OFFSET;
             state.current.currentFloor = selectedFloor;
             state.current.isGrounded = true;
             state.current.visible = true;
        } else if (isLiftMoving) {
             // Lift started moving to a new floor
             
             // Check if this was a manual jump/fall transition
             if (isManualTransition.current) {
                 // Character is moving physically, DO NOT board the lift.
                 // Just update the logical floor so he knows where he is landing.
                 state.current.currentFloor = selectedFloor;
             } else {
                 // Page/UI selection -> Force Boarding
                 // If we are already riding (jumped in), keep riding.
                 // FORCE BOARDING: If NOT riding and outside shaft (UI selection), snap in.
                 if (!state.current.isRiding) {
                     state.current.isRiding = true;
                     state.current.visible = false;
                     
                     // Only snap if outside
                     if (state.current.x >= -20) {
                         state.current.x = -80; 
                     }
                 }
                 
                 state.current.liftStartY = state.current.y;
                 state.current.liftTargetY = groundY - FEET_VISUAL_OFFSET;
                 state.current.liftStartTime = Date.now();
                 state.current.currentFloor = selectedFloor;
             }
        } else {
             // Lift finished moving
             isManualTransition.current = false; // Reset flag
             
             // Lift finished moving or external update
             if (state.current.isRiding) {
                 // Ensure we snap to exact position at end
                 state.current.y = groundY - FEET_VISUAL_OFFSET;
                 state.current.vy = 0;
                 state.current.isGrounded = true;
                 
                 // Small buffer before showing guy again to allow physics to stabilize
                 setTimeout(() => {
                     state.current.isRiding = false;
                     state.current.visible = true;
                     // Keep him in shaft but grounded
                     state.current.x = -80; 
                 }, 100);
             } else {
                 // Just update floor logical tracking
                 state.current.currentFloor = selectedFloor;
             }
        }
      }
    }
  }, [selectedFloor, floors, isLiftMoving]);

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
        case 'ArrowDown': case 's': case 'S': 
          if (!keys.current.down) keys.current.downPressed = true;
          keys.current.down = true; 
          break;
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
      const now = Date.now();

      const isInLiftShaft = s.x < -20;
      
      // VISIBILITY SYNC
      if (characterRef.current) {
          characterRef.current.style.opacity = s.visible ? '1' : '0';
          
          const controls = characterRef.current.querySelector('.lift-controls') as HTMLElement;
          if (controls) {
              controls.style.opacity = (isInLiftShaft && !isLiftMoving && s.visible) ? '1' : '0';
          }
      }

      // PHYSICS FREEZE / LIFT ANIMATION
      if (s.isRiding) {
           // Smoothly center X position to -80 instead of hard lock
           s.x += (-80 - s.x) * 0.1;
           s.vx = 0;
           
           if (s.liftStartTime > 0) {
               const elapsed = now - s.liftStartTime;
               const duration = 800; // Match Lift transition
               
               if (elapsed < duration) {
                   const progress = elapsed / duration;
                   // Use approximated bezier or ease
                   const ease = materialEase(progress); 
                   s.y = s.liftStartY + (s.liftTargetY - s.liftStartY) * ease;
               } else {
                   s.y = s.liftTargetY;
               }
           }
           // Continue to render loop to update camera
      } else {
          // PHYSICS (Normal)
          if (k.left) { s.vx -= ACCELERATION; s.facingRight = false; }
          if (k.right) { s.vx += ACCELERATION; s.facingRight = true; }
          
          s.vx = Math.max(Math.min(s.vx, MOVE_SPEED), -MOVE_SPEED);
          if (!k.left && !k.right) s.vx *= FRICTION; else s.vx *= 0.95;
          if (Math.abs(s.vx) < 0.1) s.vx = 0;

          // ... (Rest of controls and physics) ...
      }

      if (!s.isRiding) {
          // CONTROLS
          if (isInLiftShaft) {
              if (now - s.lastFloorChangeTime > 500) { 
                  if (k.jumpPressed) {
                      const sortedFloors = [...floors].sort((a, b) => a - b);
                      const currentIndex = sortedFloors.indexOf(s.currentFloor);
                      if (currentIndex < sortedFloors.length - 1) {
                          const nextFloor = sortedFloors[currentIndex + 1];
                          // Trigger floor change via prop - let the useEffect handle the transition setup
                          onFloorChange(nextFloor);
                      }
                      k.jumpPressed = false; 
                  } else if (k.downPressed) {
                      const sortedFloors = [...floors].sort((a, b) => a - b);
                      const currentIndex = sortedFloors.indexOf(s.currentFloor);
                      if (currentIndex > 0) {
                          const prevFloor = sortedFloors[currentIndex - 1];
                          onFloorChange(prevFloor);
                      }
                      k.downPressed = false;
                  }
              }
          } else {
              if (k.jumpPressed) {
                if (s.isGrounded) { s.vy = JUMP_FORCE; s.isGrounded = false; s.jumps = 1; }
                else if (s.jumps < 2) { s.vy = DOUBLE_JUMP_FORCE; s.jumps = 2; }
                k.jumpPressed = false; 
              }
              if (k.down && s.isGrounded) { s.ignoreCollisionTimer = 10; s.isGrounded = false; s.vy = 8; }
              k.downPressed = false;
          }

          s.vy += GRAVITY;
          s.x += s.vx;
          s.y += s.vy;
      }

      // BOUNDARIES & COLLISION (Only when not riding)
      if (!s.isRiding) {
          if (s.x < -140) { s.x = -140; s.vx = 0; }
          const maxRight = containerWidthRef.current - CHARACTER_WIDTH - 20;
          if (s.x > maxRight) { s.x = maxRight; s.vx = 0; }

          const minY = 0; 
          if (s.y < minY) { s.y = minY; s.vy = 0; }
          const totalLevelHeight = HEADER_HEIGHT + (floors.length * FLOOR_HEIGHT);
          const hardFloorY = totalLevelHeight - FEET_VISUAL_OFFSET;
          if (s.y > hardFloorY) { s.y = hardFloorY; s.vy = 0; s.isGrounded = true; s.jumps = 0; }
          
          // COLLISION
          if (s.ignoreCollisionTimer > 0) {
            s.ignoreCollisionTimer--;
          } else if (s.vy >= 0) { 
            const feetY = s.y + FEET_VISUAL_OFFSET;
            const relativeFeetY = feetY - HEADER_HEIGHT;
            const prevRelativeFeetY = (feetY - s.vy) - HEADER_HEIGHT;
            const nextFloorLineRelative = Math.ceil(prevRelativeFeetY / FLOOR_HEIGHT) * FLOOR_HEIGHT;
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
                        if (!isInLiftShaft) {
                            isManualTransition.current = true;
                            onFloorChange(landedFloor);
                            // Optimistically update currentFloor to prevent spamming onFloorChange
                            // while waiting for React to update the prop
                            s.currentFloor = landedFloor;
                        } else {
                            s.currentFloor = landedFloor;
                        }
                    }
                }
                } else {
                    s.isGrounded = false;
                }
            }
          } else {
            s.isGrounded = false;
          }
      }
      
      // Proximity detection removed - doors now open via direct click
      
      // RENDER
      if (characterRef.current) {
        characterRef.current.style.transform = `translate(${s.x}px, ${s.y}px)`;
        
        // Vertical Scrolling: Center on Fancy Pants Guy
        // Allow tracking when riding (s.isRiding)
        // We removed !isLiftMoving check to rely on s.isRiding logic
        if (s.visible || s.isRiding) { 
            const absoluteCharY = containerOffsetRef.current + s.y + (CHARACTER_HEIGHT / 2);
            const headerHeight = 96; 
            const viewportHeight = window.innerHeight;
            
            // The center of the visible area is half-way between the header bottom and viewport bottom
            // CHANGE THIS VALUE to adjust character screen position:
            // Positive = Character is LOWER on screen
            // Negative = Character is HIGHER on screen
            const verticalScreenBias = 100; 
            
            const visibleCenterOffset = ((viewportHeight + headerHeight) / 2) + verticalScreenBias;
            const targetScrollY = absoluteCharY - visibleCenterOffset;
            
            if (Math.abs(window.scrollY - targetScrollY) > 1) {
                // When riding, we might want to be perfectly sync, so behavior: 'auto' is good.
                // Or if s.isRiding, force exact scroll to avoid jitter?
                // The physics loop runs ~60fps, window.scrollTo 'auto' is instant.
                // This should match the frame.
                window.scrollTo({ top: targetScrollY, behavior: 'auto' });
            }
        }
        
        // Horizontal Scrolling: Follow Fancy Pants Guy
        const container = characterRef.current.closest('.hotel-facade');
        if (container) {
            const containerWidth = container.clientWidth;
            // Removed LiftShaft offset as requested
            const targetScrollX = s.x - (containerWidth / 2) + (CHARACTER_WIDTH / 2);
            
            if (targetScrollX > 0 && Math.abs(container.scrollLeft - targetScrollX) > 5) {
                container.scrollLeft += (targetScrollX - container.scrollLeft) * 0.1;
            } else if (targetScrollX <= 0) {
                container.scrollLeft = 0;
            }
        }

        const stick = stickRef.current;
        if (stick) {
            const forceIdle = isInLiftShaft && (Math.abs(s.vx) < 1);
            if (!forceIdle && Math.abs(s.vx) > 0.5 && s.isGrounded) {
                stick.classList.add('is-running');
                stick.classList.remove('is-jumping', 'is-falling', 'is-idle');
                stick.style.transform = `scale(${SCALE_FACTOR}) scaleX(${s.facingRight ? 1 : -1})`;
            } else if (!forceIdle && !s.isGrounded) {
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
  }, [floors, onFloorChange, isLiftMoving, doorsByFloor]);

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
          transition: transform 0.1s;
          transform-origin: 50% 0;
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
        
        .lift-controls {
            transition: opacity 0.2s;
        }
        .lift-arrow {
            animation: bounce 1s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Lift Controls Indicator */}
      <div className="lift-controls absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-0 pointer-events-none">
          <div className="bg-white/90 border-2 border-black rounded px-2 py-1 shadow-sm">
             <div className="lift-arrow text-black font-bold text-lg leading-none">↑</div>
             <div className="lift-arrow text-black font-bold text-lg leading-none" style={{ animationDelay: '0.5s' }}>↓</div>
          </div>
      </div>

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