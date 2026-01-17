'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import LiftShaft from '@/components/LiftShaft';
import FloorRow from '@/components/FloorRow';
import DoorModal from '@/components/DoorModal';
import AcademicTermSelector from '@/components/AcademicTermSelector';
import { 
  getAvailableTerms, 
  getAvailableFloorsForTerm,
  getDoorsForTermAndFloor 
} from '@/lib/mockData';
import { Door, AcademicTerm } from '@/types/door';

export default function Home() {
  const availableTerms = useMemo(() => getAvailableTerms(), []);

  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>(
    availableTerms[0]
  );

  const availableFloors = useMemo(
    () => getAvailableFloorsForTerm(selectedTerm),
    [selectedTerm]
  );

  const [selectedFloor, setSelectedFloor] = useState<number | null>(
    availableFloors[0] ?? null
  );

  const floorRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const doorsByFloor = useMemo(() => {
    const doorsMap: { [floor: number]: Door[] } = {};
    
    availableFloors.forEach(floor => {
      doorsMap[floor] = getDoorsForTermAndFloor(selectedTerm, floor);
    });
    
    return doorsMap;
  }, [selectedTerm, availableFloors]);

  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);

  const handleTermChange = (term: AcademicTerm) => {
    setSelectedTerm(term);
    const newAvailableFloors = getAvailableFloorsForTerm(term);
    setSelectedFloor(newAvailableFloors[0] ?? null);
  };

  const handleFloorClick = (floor: number) => {
    setSelectedFloor(floor);
    const floorElement = floorRefs.current[floor];
    if (floorElement) {
      floorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const floor of availableFloors) {
        const element = floorRefs.current[floor];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setSelectedFloor(floor);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [availableFloors]);

  const handleDoorClick = (door: Door) => {
    setSelectedDoor(door);
  };

  const handleCloseModal = () => {
    setSelectedDoor(null);
  };

  return (
    <div className="min-h-screen">
      {/* Academic term selector - top bar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <AcademicTermSelector
          terms={availableTerms}
          selectedTerm={selectedTerm}
          onTermChange={handleTermChange}
        />
      </div>

      {/* Fixed lift shaft on the left */}
      <LiftShaft 
        floors={availableFloors}
        selectedFloor={selectedFloor}
        onFloorClick={handleFloorClick}
      />

      {/* Main content area - offset by lift shaft width and top bar */}
      <main className="ml-20 pt-20 min-h-screen pb-16">
        {/* Page header */}
        <div className="w-full px-6 py-8 mb-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-amber-950 mb-3 tracking-tight sketch-title">
              📖 Door Gallery
            </h1>
            <p className="text-amber-800 text-base md:text-lg font-semibold sketch-text">
              {selectedTerm.displayName} · {availableFloors.length} {availableFloors.length === 1 ? 'Floor' : 'Floors'}
            </p>
            <p className="text-amber-700 text-sm mt-2 sketch-text">
              Click any door to view · Use the lift to navigate floors
            </p>
          </div>
        </div>

        {/* Floor rows - displayed from highest to lowest */}
        {availableFloors.length > 0 ? (
          <div className="space-y-6">
            {[...availableFloors].sort((a, b) => b - a).map((floor) => (
              <FloorRow
                key={floor}
                ref={(el) => {
                  floorRefs.current[floor] = el;
                }}
                floor={floor}
                doors={doorsByFloor[floor] || []}
                onDoorClick={handleDoorClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <p className="text-amber-700 text-lg sketch-text">
              No floors available for this term
            </p>
          </div>
        )}
      </main>

      {/* Door modal overlay */}
      {selectedDoor && (
        <DoorModal 
          door={selectedDoor}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
