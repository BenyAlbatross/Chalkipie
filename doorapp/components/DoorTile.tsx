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

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rc = rough.canvas(canvas);
      
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw rough rectangle border
      rc.rectangle(2, 2, canvas.width - 4, canvas.height - 4, {
        stroke: '#000000',
        strokeWidth: 2,
        roughness: 1.5,
        bowing: 1,
      });
    }
  }, []);

  // Format room number as XX-YYY
  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;

  return (
    <div className="flex flex-col items-center">
      {/* Room number above door - using Caveat Brush */}
      <div className="room-number mb-3 px-2 py-1 text-center">
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

        {/* Window image area */}
        <div className="relative h-full w-full overflow-hidden p-2">
          <div className="relative h-full w-full overflow-hidden border border-black/30">
            <Image
              src={door.imageUrl}
              alt={`Room ${roomNumber}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="160px"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-pastel-blue/0 via-pastel-blue/0 to-pastel-blue/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
  );
}

