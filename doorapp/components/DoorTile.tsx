'use client';

import { Door } from '@/types/door';
import Image from 'next/image';

interface DoorTileProps {
  door: Door;
  onClick: (door: Door) => void;
}

export default function DoorTile({ door, onClick }: DoorTileProps) {
  return (
    <button
      onClick={() => onClick(door)}
      className="door-tile group relative flex-shrink-0 rounded-md focus:outline-none focus:ring-4 focus:ring-amber-800/50"
      style={{
        width: '180px',
        height: '280px',
      }}
    >
      {/* Door panel divisions */}
      <div className="door-panel" />
      
      {/* Door image area */}
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <Image
          src={door.imageUrl}
          alt={`Door ${door.doorNumber}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="200px"
        />

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Door knob */}
      <div className="door-knob" />

      {/* Door number badge - at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-bold px-3 py-1 rounded-sm shadow-md text-sm border-2 border-amber-900/20">
        {door.doorNumber}
      </div>

      {/* Owner name on hover - at bottom */}
      {door.nameOfOwner && (
        <div className="absolute bottom-3 left-2 right-2 bg-amber-50/95 backdrop-blur-sm text-amber-900 px-2 py-1 rounded-sm text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate border border-amber-900/20">
          {door.nameOfOwner}
        </div>
      )}
    </button>
  );
}
