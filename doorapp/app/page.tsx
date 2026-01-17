'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import LiftShaft from '@/components/LiftShaft';
import FloorRow from '@/components/FloorRow';
import DoorModal from '@/components/DoorModal';
import FloorPickerModal from '@/components/FloorPickerModal';
import AcademicTermSelector from '@/components/AcademicTermSelector';
import { 
  fetchAvailableTerms, 
  fetchDoorsForTerm
} from '@/lib/api';
import { Door, AcademicTerm } from '@/types/door';

export default function Home() {
  const [availableTerms, setAvailableTerms] = useState<AcademicTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);
  const [doors, setDoors] = useState<Door[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch terms on mount
  useEffect(() => {
    async function loadTerms() {
      try {
        const terms = await fetchAvailableTerms();
        setAvailableTerms(terms);
        if (terms.length > 0) {
          setSelectedTerm(terms[0]);
        }
      } catch (error) {
        console.error("Failed to load terms", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTerms();
  }, []);

  // Fetch doors when selectedTerm changes
  useEffect(() => {
    if (!selectedTerm) {
        setDoors([]);
        return;
    }
    
    async function loadDoors() {
      setIsLoading(true);
      try {
        const fetchedDoors = await fetchDoorsForTerm(selectedTerm);
        setDoors(fetchedDoors);
      } catch (error) {
        console.error("Failed to load doors", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDoors();
  }, [selectedTerm]);

  const availableFloors = useMemo(() => {
    const floors = new Set<number>();
    doors.forEach(door => floors.add(door.floor));
    return Array.from(floors).sort((a, b) => a - b);
  }, [doors]);

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // Update selectedFloor when availableFloors changes (e.g. after data fetch)
  useEffect(() => {
    if (availableFloors.length > 0) {
        // If no floor selected, or current selection is not in available floors (though we might want to keep it if possible?)
        // The original behavior was to reset to the first floor on term change.
        // We detect if we need to set a default floor.
        if (selectedFloor === null || !availableFloors.includes(selectedFloor)) {
            setSelectedFloor(availableFloors[0]);
        }
    } else {
        setSelectedFloor(null);
    }
  }, [availableFloors, selectedFloor]);


  const [previousFloor, setPreviousFloor] = useState<number | null>(null);
  const [isLiftMoving, setIsLiftMoving] = useState(false);
  const [liftDirection, setLiftDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [showFloorPicker, setShowFloorPicker] = useState(false);

  const floorRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const doorsByFloor = useMemo(() => {
    const doorsMap: { [floor: number]: Door[] } = {};
    
    availableFloors.forEach(floor => {
      doorsMap[floor] = doors.filter(d => d.floor === floor);
    });
    
    return doorsMap;
  }, [doors, availableFloors]);

  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);

  const handleTermChange = (term: AcademicTerm) => {
    if (selectedTerm?.academicYear === term.academicYear && selectedTerm?.semester === term.semester) return;
    
    setIsLoading(true);
    setDoors([]);
    setSelectedTerm(term);
    // Reset selection triggers effect to pick first floor when data arrives
    setSelectedFloor(null); 
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

  if (!selectedTerm && isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Fixed Header - independent of scrolling */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-black shadow-md">
        {selectedTerm && (
            <AcademicTermSelector
            terms={availableTerms}
            selectedTerm={selectedTerm}
            onTermChange={handleTermChange}
            />
        )}
      </div>

      {/* Main content area */}
      <main className="pt-24 min-h-screen">
        {/* Whitespace at top */}
        <div className="py-4"></div>

        {/* Hotel facade - lift and doors scroll together */}
        {availableFloors.length > 0 ? (
          <div className="px-8">
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
              {isLoading ? "Loading floors..." : "No floors available for this term"}
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