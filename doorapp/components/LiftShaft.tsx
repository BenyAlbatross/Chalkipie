'use client';

import { useState } from 'react';

interface LiftShaftProps {
  floors: number[];
  selectedFloor: number | null;
  onFloorClick: (floor: number) => void;
}

export default function LiftShaft({ floors, selectedFloor, onFloorClick }: LiftShaftProps) {
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);

  return (
    <div className="sketch-lift fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-8 z-40">
      {/* Elevator header */}
      <div className="text-amber-100 text-center mb-8 sketch-title">
        <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Lift</div>
        <div className="text-2xl">↕</div>
      </div>

      {/* Floor buttons */}
      <div className="flex-1 flex flex-col-reverse justify-start gap-3 overflow-y-auto w-full px-3">
        {floors.map((floor) => {
          const isSelected = selectedFloor === floor;
          const isHovered = hoveredFloor === floor;

          return (
            <button
              key={floor}
              onClick={() => onFloorClick(floor)}
              onMouseEnter={() => setHoveredFloor(floor)}
              onMouseLeave={() => setHoveredFloor(null)}
              className="relative group"
            >
              {/* Floor button */}
              <div
                className={`
                  w-full aspect-square rounded-md font-bold text-sm
                  transition-all duration-300 flex items-center justify-center
                  border-2 sketch-text
                  ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 scale-110 shadow-lg border-amber-950'
                      : 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 hover:from-amber-200 hover:to-amber-300 hover:scale-105 border-amber-800/40'
                  }
                `}
              >
                {floor}
              </div>

              {/* Subtle glow when selected */}
              {isSelected && (
                <div className="absolute inset-0 rounded-md bg-amber-400 opacity-30 blur-sm animate-sketch-pulse" />
              )}

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-amber-950 text-amber-50 px-3 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-50 shadow-xl border-2 border-amber-800">
                  Floor {floor}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-amber-950" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Elevator indicator */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-400 shadow-md border-2 border-amber-900 animate-sketch-pulse" />
        <div className="text-amber-100 text-xs opacity-70 sketch-text">Active</div>
      </div>
    </div>
  );
}
