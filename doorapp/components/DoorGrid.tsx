'use client';

import { Door } from "@/types/door";
import DoorTile from "./DoorTile";

/**
 * DoorGrid Component
 * 
 * Displays a responsive grid of door tiles.
 * Handles the layout and spacing of doors in the main content area.
 * 
 * FUTURE:
 * - Implement filtering by semester
 * - Add search functionality
 * - Implement pagination or infinite scroll for large datasets
 * - Fetch doors from Supabase: const { data: doors } = await supabase.from('doors').select('*')
 */

interface DoorGridProps {
  doors: Door[];
  onDoorClick: (door: Door) => void;
}

export default function DoorGrid({ doors, onDoorClick }: DoorGridProps) {
  return (
    <div className="w-full px-6 py-8">
      {/* Grid header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 chalk-title">
          Chalkipie Gallery
        </h1>
        <p className="text-slate-600 text-sm md:text-base chalk-text">
          Click on any door to explore the art within
        </p>
      </div>

      {/* Responsive door grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
        {doors.map((door) => (
          <DoorTile key={door.id} door={door} onClick={onDoorClick} />
        ))}
      </div>

      {/* Empty state */}
      {doors.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg chalk-text">No doors available yet.</p>
          <p className="text-slate-400 text-sm mt-2 chalk-text">Check back soon for new additions!</p>
        </div>
      )}
    </div>
  );
}
