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
          padding: 12,
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
          className="absolute left-16 top-8 text-3xl font-bold text-black px-4 py-2"
          style={{ fontFamily: 'Roboto, sans-serif', zIndex: 20 }}
        >
          Level {String(floor).padStart(2, '0')}
        </div>
        
        {/* Doors aligned to bottom with spacing - always 20 doors */}
        <div className="flex gap-10 px-16">
          {Array.from({ length: 20 }, (_, index) => {
            const door = doors[index];
            if (door) {
              return <DoorTile key={door.id} door={door} onClick={() => onDoorClick(door)} />;
            } else {
              // Placeholder door
              return (
                <div 
                  key={`placeholder-${floor}-${index}`}
                  className="flex-shrink-0"
                  style={{ width: '160px', height: '280px' }}
                />
              );
            }
          })}
        </div>
      </div>
    );
  }
);

FloorRow.displayName = 'FloorRow';

export default FloorRow;

