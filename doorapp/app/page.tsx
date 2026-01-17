'use client';

import { useState } from "react";
import LiftShaft from "@/components/LiftShaft";
import DoorGrid from "@/components/DoorGrid";
import DoorModal from "@/components/DoorModal";
import { mockDoors } from "@/lib/mockData";
import { Door } from "@/types/door";

/**
 * Chalkipie Home Page
 * 
 * Main layout featuring:
 * - Fixed lift shaft on the left
 * - Scrollable door grid in the main area
 * - Modal overlay for door interactions
 * 
 * FUTURE Supabase integration:
 * - Fetch doors from Supabase on component mount
 * - Implement real-time subscriptions for new doors
 * - Add authentication and user-specific views
 */

export default function Home() {
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDoorClick = (door: Door) => {
    setSelectedDoor(door);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selectedDoor to allow exit animation
    setTimeout(() => setSelectedDoor(null), 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Fixed lift shaft on the left */}
      <LiftShaft />

      {/* Main content area - offset by lift shaft width */}
      <main className="ml-20 min-h-screen">
        <DoorGrid doors={mockDoors} onDoorClick={handleDoorClick} />
      </main>

      {/* Door modal overlay */}
      <DoorModal 
        door={selectedDoor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
