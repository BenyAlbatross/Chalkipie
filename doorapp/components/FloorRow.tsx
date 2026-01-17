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
      <div ref={ref} className="floor-row">
        {/* Floor number indicator on left */}
        <div className="absolute left-4 bottom-4 text-xl font-bold text-dark-gray bg-white/80 px-3 py-1 rounded border-2 border-black">
          {String(floor).padStart(2, '0')}
        </div>
        
        {/* Doors aligned to bottom with spacing */}
        <div className="flex gap-10 px-16 pb-6">
          {doors.map((door) => (
            <DoorTile key={door.id} door={door} onClick={() => onDoorClick(door)} />
          ))}
        </div>
      </div>
    );
  }
);

FloorRow.displayName = 'FloorRow';

export default FloorRow;

