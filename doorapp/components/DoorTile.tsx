'use client';

import { Door } from '@/types/door';
import Image from 'next/image';
import { memo } from 'react';

interface DoorTileProps {
  door: Door;
  onClick: (door: Door) => void;
}

// Pre-calculated "messy" paths to simulate hand-drawn sketch look
// We use multiple passes with slight variations to create the "sketchy" feel
const FRAME_PASS_1 = "M5,4 L154,6 L157,276 L4,277 L5,4";
const FRAME_PASS_2 = "M4,5 L157,4 L155,278 L6,275 L4,5";
const SKETCH_SCRATCH = "M10,8 L150,10 M152,15 L154,270 M150,274 L8,272 M5,270 L7,12";

const DoorTile = memo(function DoorTile({ door, onClick }: DoorTileProps) {
  // ...
  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col items-center">
        {/* Room number */}
        <div className="mb-3 px-2 py-1 text-center text-xl font-bold text-black" style={{ fontFamily: 'var(--font-patrick-hand), cursive' }}>
          {roomNumber}
        </div>

        <button
          onClick={() => onClick(door)}
          className="door-tile group relative flex-shrink-0 focus:outline-none"
          style={{
            width: '160px',
            height: '280px',
            position: 'relative',
            background: 'white',
          }}
        >
          {/* OPTIMIZED: SVG Frame with hand-drawn feel */}
          <svg
            width="160"
            height="280"
            viewBox="0 0 160 280"
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
            style={{ overflow: 'visible' }}
          >
             {/* Pass 1: Dark Brown Frame */}
             <path d={FRAME_PASS_1} fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
             {/* Pass 2: Slightly offset second stroke */}
             <path d={FRAME_PASS_2} fill="none" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
             {/* Inner sketchy scratches */}
             <path d={SKETCH_SCRATCH} fill="none" stroke="#8D6E63" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          </svg>

          {/* Image Content */}
          <div className="absolute inset-0" style={{ padding: '8px' }}>
            <div className="relative h-full w-full overflow-hidden border-2 border-dashed border-gray-300 rounded-sm">
              <Image
                src={door.imageUrl}
                alt={`Room ${roomNumber}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 filter group-hover:sepia-[.3]"
                sizes="160px"
              />
            </div>
          </div>

          {/* Owner Overlay */}
          {door.nameOfOwner && (
            <div className="absolute bottom-2 left-2 right-2 bg-white/95 border-2 border-black text-black px-2 py-1 transform rotate-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 font-bold text-sm shadow-sm" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
              {door.nameOfOwner}
            </div>
          )}
        </button>
      </div>
      
      {/* OPTIMIZED: SVG Doorbell with hand-drawn feel */}
      <div style={{ marginBottom: '120px' }}>
         <svg width="24" height="24" viewBox="0 0 24 24">
             {/* Messy circle background */}
             <circle cx="12" cy="12" r="10" fill="#e0e0e0" opacity="0.6" />
             <path 
                d="M12,2 C18,2 22,6 22,12 C22,18 18,22 12,22 C6,22 2,18 2,12 C2,6 6,2 12,2" 
                fill="none" 
                stroke="black" 
                strokeWidth="1.5" 
                strokeDasharray="2,3"
                opacity="0.8"
             />
             <path 
                d="M12,4 C16,4 20,8 20,12 C20,16 16,20 12,20 C8,20 4,16 4,12 C4,8 8,4 12,4" 
                fill="none" 
                stroke="#555" 
                strokeWidth="1" 
                opacity="0.5"
             />
             {/* Button */}
             <circle cx="12" cy="12" r="5" fill="#333" />
         </svg>
      </div>
    </div>
  );
});

export default DoorTile;
