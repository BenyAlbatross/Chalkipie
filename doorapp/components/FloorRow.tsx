'use client';

import { Door } from '@/types/door';
import DoorTile from './DoorTile';
import { forwardRef } from 'react';

interface FloorRowProps {
  floor: number;
  doors: Door[];
  onDoorClick: (door: Door) => void;
}

const FloorRow = forwardRef<HTMLDivElement, FloorRowProps>(
  ({ floor, doors, onDoorClick }, ref) => {
    return (
      <div ref={ref} className="floor-row mb-6">
        {/* Floor header with sketch-style badge */}
        <div className="flex items-center gap-4 mb-4 px-4">
          <div className="floor-badge sketch-text bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50 font-bold px-5 py-2 rounded-md">
            Floor {floor}
          </div>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-900/40 to-transparent" style={{ 
            backgroundImage: 'repeating-linear-gradient(90deg, #78350f 0px, #78350f 8px, transparent 8px, transparent 12px)'
          }} />
        </div>

        {/* Horizontal scrolling door container */}
        <div 
          className="flex gap-6 px-4 overflow-x-auto pb-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#6d4c41 #efebe9',
          }}
        >
          {doors.map((door) => (
            <DoorTile key={door.id} door={door} onClick={() => onDoorClick(door)} />
          ))}
        </div>

        {/* Floor separator line */}
        <div className="mt-6 px-4 md:px-6">
          <div className="h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
);

FloorRow.displayName = 'FloorRow';

export default FloorRow;
