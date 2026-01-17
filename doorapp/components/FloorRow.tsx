'use client';

import { Door } from '@/types/door';
import DoorTile from './DoorTile';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { annotate } from 'rough-notation';

interface FloorRowProps {
  floor: number;
  doors: Door[];
  onDoorClick: (door: Door) => void;
}

const FloorRow = forwardRef<HTMLDivElement, FloorRowProps>(
  ({ floor, doors, onDoorClick }, ref) => {
    const headerRef = useRef<HTMLDivElement>(null);
    const rowRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      if (headerRef.current && isHovered) {
        const annotation = annotate(headerRef.current, {
          type: 'circle',
          color: '#a8d8ea',
          strokeWidth: 2,
          padding: 8,
        });
        annotation.show();
        return () => annotation.remove();
      }
    }, [isHovered]);

    return (
      <div 
        ref={(el) => {
          rowRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
        className="floor-row"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floor header on top-left */}
        <div 
          ref={headerRef}
          className="absolute left-8 top-4 text-2xl font-bold text-black px-4 py-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Level {String(floor).padStart(2, '0')}
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

