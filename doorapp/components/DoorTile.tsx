'use client';

import { Door } from '@/types/door';
import Image from 'next/image';
import { useEffect, useRef, memo } from 'react';
import rough from 'roughjs';

interface DoorTileProps {
  door: Door;
  onClick: (door: Door) => void;
  doorRef?: (el: HTMLButtonElement | null) => void;
}

export default function DoorTile({ door, onClick, doorRef }: DoorTileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doorbellCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rc = rough.canvas(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Rough wooden frame
      rc.line(4, 4, canvas.width - 4, 4, { stroke: '#5D4037', strokeWidth: 3, roughness: 2 });
      rc.line(4, 8, canvas.width - 4, 8, { stroke: '#8D6E63', strokeWidth: 1, roughness: 1 });
      rc.line(4, 4, 4, canvas.height, { stroke: '#5D4037', strokeWidth: 3, roughness: 2 });
      rc.line(canvas.width - 4, 4, canvas.width - 4, canvas.height, { stroke: '#5D4037', strokeWidth: 3, roughness: 2 });
    }
    
    // Doorbell
    if (doorbellCanvasRef.current) {
      const canvas = doorbellCanvasRef.current;
      const rc = rough.canvas(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      rc.circle(12, 12, 18, {
        fill: '#e0e0e0',
        fillStyle: 'dots',
        stroke: '#000',
        strokeWidth: 2,
        roughness: 1.5,
      });
      rc.circle(12, 12, 8, {
        fill: '#333',
        fillStyle: 'solid',
        stroke: 'none'
      });
    }
  }, []);

  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col items-center">
        {/* Room number */}
        <div className="mb-3 px-2 py-1 text-center text-xl font-bold text-black" style={{ fontFamily: 'var(--font-patrick-hand), cursive' }}>
          {roomNumber}
        </div>

        <button
          ref={doorRef}
          onClick={() => onClick(door)}
          className="door-tile group relative flex-shrink-0 focus:outline-none transition-all duration-300 hover:scale-105"
          style={{
            width: '160px',
            height: '280px',
            position: 'relative',
            background: 'white',
          }}
        >
          {/* Frame Canvas */}
          <canvas
            ref={canvasRef}
            width={160}
            height={280}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />

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
      
      {/* Doorbell */}
      <div style={{ marginBottom: '120px' }}>
        <canvas
          ref={doorbellCanvasRef}
          width={24}
          height={24}
          style={{ width: '24px', height: '24px' }}
        />
      </div>
    </div>
  );
});

export default DoorTile;
