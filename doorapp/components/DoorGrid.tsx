'use client';

import { Door, AcademicTerm } from "@/types/door";
import DoorTile from "./DoorTile";

/**
 * DoorGrid Component
 * 
 * Displays a responsive grid of door tiles.
 * Handles the layout and spacing of doors in the main content area.
 * Now filters by academic term and floor.
 * 
 * FUTURE:
 * - Implement search functionality
 * - Implement pagination or infinite scroll for large datasets
 * - Fetch doors from Supabase with filters
 */

interface DoorGridProps {
  doors: Door[];
  onDoorClick: (door: Door) => void;
  selectedTerm: AcademicTerm;
  selectedFloor: number;
}

export default function DoorGrid({ 
  doors, 
  onDoorClick,
  selectedTerm,
  selectedFloor,
}: DoorGridProps) {
  return (
    <div className="w-full px-6 py-8">
      {/* Grid header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 chalk-title">
          Chalkipie Gallery
        </h1>
        <p className="text-slate-600 text-sm md:text-base chalk-text">
          {selectedTerm.displayName} · Floor {selectedFloor}
        </p>
      </div>

      {/* Responsive door grid */}
      {doors.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
          {doors.map((door) => (
            <DoorTile key={door.id} door={door} onClick={onDoorClick} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <svg 
              className="w-24 h-24 mx-auto mb-4 text-slate-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
              />
            </svg>
            <p className="text-slate-500 text-lg font-semibold mb-2 chalk-text">
              No doors on this floor
            </p>
            <p className="text-slate-400 text-sm chalk-text">
              Try selecting a different floor or academic term
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
