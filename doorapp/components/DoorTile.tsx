'use client';

import { Door } from "@/types/door";
import Image from "next/image";

/**
 * DoorTile Component
 * 
 * Represents a single door in the grid.
 * Features:
 * - Hand-drawn chalk aesthetic
 * - Hover state with subtle glow
 * - Click state for selection
 * - Minimal metadata display
 * 
 * FUTURE: 
 * - Will navigate to individual door page route (e.g., /door/[id])
 * - Or can be used with modal overlay for quick view
 */

interface DoorTileProps {
  door: Door;
  onClick: (door: Door) => void;
}

export default function DoorTile({ door, onClick }: DoorTileProps) {
  return (
    <div
      onClick={() => onClick(door)}
      className="door-tile group cursor-pointer relative bg-white border-3 border-slate-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
      style={{
        aspectRatio: '2/3', // Fixed aspect ratio for door shape
      }}
    >
      {/* Door image with chalk overlay effect */}
      <div className="relative w-full h-full">
        <Image
          src={door.imageUrl}
          alt={`Door ${door.doorNumber}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Chalk texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay pointer-events-none"></div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-yellow-200/20 mix-blend-screen pointer-events-none chalk-glow"></div>
      </div>

      {/* Metadata overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm p-2 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold chalk-text">#{door.doorNumber}</p>
            <p className="text-xs text-slate-300 chalk-text">{door.semester}</p>
          </div>
          <div className="text-right">
            <p className="text-xs italic text-slate-300 chalk-text truncate max-w-[100px]">
              {door.nameOfOwner}
            </p>
          </div>
        </div>
      </div>

      {/* Hand-drawn border effect */}
      <div className="absolute inset-0 border-2 border-slate-800 rounded-lg pointer-events-none sketch-border"></div>
    </div>
  );
}
