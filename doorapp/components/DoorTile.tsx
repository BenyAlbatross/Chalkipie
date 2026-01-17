'use client';

import { Door } from '@/types/door';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface DoorTileProps {
  door: Door;
  onClick: (door: Door) => void;
}

export default function DoorTile({ door, onClick }: DoorTileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doorbellCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rc = rough.canvas(canvas);
      
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw rough border on top and sides only (no bottom) in brown
      // Top line
      rc.line(4, 4, canvas.width - 4, 4, {
        stroke: '#6B4423',
        strokeWidth: 2,
        roughness: 1.5,
        bowing: 1,
      });
      // Left line
      rc.line(4, 4, 4, canvas.height, {
        stroke: '#6B4423',
        strokeWidth: 2,
        roughness: 1.5,
        bowing: 1,
      });
      // Right line  
      rc.line(canvas.width - 4, 4, canvas.width - 4, canvas.height, {
        stroke: '#6B4423',
        strokeWidth: 2,
        roughness: 1.5,
        bowing: 1,
      });
    }
    
    // Draw doorbell with roughjs
    if (doorbellCanvasRef.current) {
      const canvas = doorbellCanvasRef.current;
      const rc = rough.canvas(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw filled circle for doorbell
      rc.circle(12, 12, 20, {
        fill: '#D4AF37',
        fillStyle: 'solid',
        stroke: '#B8860B',
        strokeWidth: 2,
        roughness: 1.2,
      });
    }
  }, []);

  // Format room number as XX-YYY
  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col items-center">
        {/* Room number above door - using Geist */}
        <div className="mb-3 px-2 py-1 text-center text-lg font-medium text-black" style={{ fontFamily: 'var(--font-geist-sans), sans-serif', fontWeight: 500 }}>
          {roomNumber}
        </div>

        {/* Door window */}
        <button
          onClick={() => onClick(door)}
          className="door-tile group relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-pastel-blue"
          style={{
            width: '160px',
            height: '280px',
            position: 'relative',
          }}
        >
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
              zIndex: 10,
            }}
          />

          {/* Window image area with minimal padding for border */}
          <div className="absolute inset-0" style={{ padding: '6px 6px 0px 6px' }}>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={door.imageUrl}
                alt={`Room ${roomNumber}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                sizes="160px"
                style={{ objectPosition: 'center bottom' }}
              />
            </div>
          </div>

        {/* Owner name on hover */}
        {door.nameOfOwner && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate z-20">
            {door.nameOfOwner}
          </div>
        )}
      </button>
      </div>
      
      {/* Doorbell on the right - roughjs circle */}
      <div style={{ marginBottom: '112px' }}>
        <canvas
          ref={doorbellCanvasRef}
          width={24}
          height={24}
          style={{
            width: '24px',
            height: '24px',
          }}
        />
      </div>
    </div>
  );
}

