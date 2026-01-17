'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import LiftShaft from '@/components/LiftShaft';
import FloorRow from '@/components/FloorRow';
import DoorModal from '@/components/DoorModal';
import FloorPickerModal from '@/components/FloorPickerModal';
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

  const [previousFloor, setPreviousFloor] = useState<number | null>(null);
  const [isLiftMoving, setIsLiftMoving] = useState(false);
  const [liftDirection, setLiftDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [showFloorPicker, setShowFloorPicker] = useState(false);

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

  const handleFloorSelect = (floor: number) => {
    if (selectedFloor === null) {
      setSelectedFloor(floor);
      return;
    }

    // Clamp floor to valid range
    const clampedFloor = Math.max(1, Math.min(20, floor));
    
    // Determine direction
    const direction = clampedFloor > selectedFloor ? 'up' : clampedFloor < selectedFloor ? 'down' : 'idle';
    
    setPreviousFloor(selectedFloor);
    setLiftDirection(direction);
    setIsLiftMoving(true);

    // Start viewport scroll immediately with lift animation
    const floorElement = floorRefs.current[clampedFloor];
    if (floorElement) {
      const floorRect = floorElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const absoluteFloorTop = floorRect.top + window.scrollY;
      
      // Center the floor in the viewport with slower scroll
      const targetScrollPosition = absoluteFloorTop - (viewportHeight / 2) + (floorRect.height / 2);
      
      window.scrollTo({
        top: targetScrollPosition,
        behavior: 'smooth'
      });
    }

    // Complete lift movement
    setTimeout(() => {
      setSelectedFloor(clampedFloor);
      setIsLiftMoving(false);
      setLiftDirection('idle');
    }, 800); // Match transition duration
  };

  const handleDoorClick = (door: Door) => {
    setSelectedDoor(door);
  };

  const handleCloseModal = () => {
    setSelectedDoor(null);
  };

  return (
    <div className="min-h-screen">
      {/* Fixed Header - independent of scrolling */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-black shadow-md">
        <AcademicTermSelector
          terms={availableTerms}
          selectedTerm={selectedTerm}
          onTermChange={handleTermChange}
        />
      </div>

      {/* Main content area */}
      <main className="pt-24 min-h-screen">
        {/* Whitespace at top */}
        <div className="py-4"></div>

        {/* Hotel facade - lift and doors scroll together */}
        {availableFloors.length > 0 ? (
          <div className="px-8 mb-8">
            <div className="hotel-facade rounded-lg overflow-x-auto">
              <div className="flex gap-0 min-w-max">
                {/* Lift shaft - scrolls with doors */}
                <LiftShaft 
                  floors={availableFloors}
                  selectedFloor={selectedFloor}
                  onOpenFloorPicker={() => setShowFloorPicker(true)}
                  isMoving={isLiftMoving}
                  direction={liftDirection}
                />

                {/* Door grid - scrolls with lift */}
                <div className="flex-1">
                  {/* Spacer to match lift shaft header height */}
                  <div className="bg-white border-b-2 border-black" style={{ height: '70px' }}></div>
                  
                  <div className="flex flex-col-reverse">
                    {availableFloors.map((floor) => (
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <p className="text-dark-gray text-lg font-medium">
              No floors available for this term
            </p>
          </div>
        )}
      </main>

      {/* Floor Picker Modal */}
      {showFloorPicker && (
        <FloorPickerModal
          floors={availableFloors}
          currentFloor={selectedFloor}
          onSelectFloor={handleFloorSelect}
          onClose={() => setShowFloorPicker(false)}
        />
      )}

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
