'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import LiftShaft from '@/components/LiftShaft';
import FloorRow from '@/components/FloorRow';
import DoorFocusView from '@/components/DoorFocusView';
import FloorPickerModal from '@/components/FloorPickerModal';
import AcademicTermSelector from '@/components/AcademicTermSelector';
import { 
  fetchAvailableTerms, 
  fetchDoorsForTerm
} from '@/lib/api';
import { Door, AcademicTerm } from '@/types/door';
import FancyPantsGuy from '@/components/FancyPantsGuy';

export default function Home() {
  const [availableTerms, setAvailableTerms] = useState<AcademicTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);
  const [doors, setDoors] = useState<Door[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Door interaction state
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  
  // Door element refs for positioning focus view
  const doorElementRefs = useRef<{ [doorId: string]: HTMLButtonElement | null }>({});

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
      if (!selectedTerm) return;
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
  const [previousFloor, setPreviousFloor] = useState<number | null>(null);
  const [isLiftMoving, setIsLiftMoving] = useState(false);
  const [liftDirection, setLiftDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [showFloorPicker, setShowFloorPicker] = useState(false);
  const floorRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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


  const doorsByFloor = useMemo(() => {
    const doorsMap: { [floor: number]: Door[] } = {};
    
    availableFloors.forEach(floor => {
      doorsMap[floor] = doors.filter(d => d.floor === floor);
    });
    
    return doorsMap;
  }, [doors, availableFloors]);

  // Door ref callback
  const handleDoorRef = (doorId: string, el: HTMLButtonElement | null) => {
    doorElementRefs.current[doorId] = el;
  };

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
    // Since availableFloors might not be contiguous or start at 1/20, we check existence or clamp to min/max of available.
    // However, the character logic sends actual valid floor numbers.
    // Just safe guard:
    if (!availableFloors.includes(floor)) return;

    // Determine direction
    const direction = floor > selectedFloor ? 'up' : floor < selectedFloor ? 'down' : 'idle';
    
    setPreviousFloor(selectedFloor);
    setLiftDirection(direction);
    setIsLiftMoving(true);

    setSelectedFloor(floor);

    // Complete lift movement
    setTimeout(() => {
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
  
  // Door navigation in zoom view
  const handleNavigateToPreviousDoor = () => {
    if (!selectedDoor || !selectedFloor) return;
    
    const currentFloorDoors = doorsByFloor[selectedFloor] || [];
    const currentIndex = currentFloorDoors.findIndex(d => d.id === selectedDoor.id);
    
    if (currentIndex > 0) {
      setSelectedDoor(currentFloorDoors[currentIndex - 1]);
    }
  };
  
  const handleNavigateToNextDoor = () => {
    if (!selectedDoor || !selectedFloor) return;
    
    const currentFloorDoors = doorsByFloor[selectedFloor] || [];
    const currentIndex = currentFloorDoors.findIndex(d => d.id === selectedDoor.id);
    
    if (currentIndex >= 0 && currentIndex < currentFloorDoors.length - 1) {
      setSelectedDoor(currentFloorDoors[currentIndex + 1]);
    }
  };
  
  const hasPreviousDoor = () => {
    if (!selectedDoor || !selectedFloor) return false;
    const currentFloorDoors = doorsByFloor[selectedFloor] || [];
    const currentIndex = currentFloorDoors.findIndex(d => d.id === selectedDoor.id);
    return currentIndex > 0;
  };
  
  const hasNextDoor = () => {
    if (!selectedDoor || !selectedFloor) return false;
    const currentFloorDoors = doorsByFloor[selectedFloor] || [];
    const currentIndex = currentFloorDoors.findIndex(d => d.id === selectedDoor.id);
    return currentIndex >= 0 && currentIndex < currentFloorDoors.length - 1;
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
                <div className="flex-1 relative">
                  {/* Character Overlay */}
                  <FancyPantsGuy 
                    floors={availableFloors}
                    doorsByFloor={doorsByFloor}
                    selectedFloor={selectedFloor}
                    onFloorChange={handleFloorSelect}
                    isLiftMoving={isLiftMoving}
                  />
                  
                  {/* Spacer to match lift shaft header height */}
                  <div className="bg-white border-b-2 border-black" style={{ height: '70px' }}></div>
                  
                  <div className="flex flex-col-reverse">
                    {availableFloors.map((floor) => {
                      // VIRTUALIZATION: Only render floors close to the selected one
                      // If selectedFloor is null, render everything (fallback)
                      // Range: Current floor +/- 2
                      const isVisible = selectedFloor === null || Math.abs(floor - selectedFloor) <= 2;
                      
                      if (isVisible) {
                          return (
                              <FloorRow
                                key={floor}
                                ref={(el) => {
                                  floorRefs.current[floor] = el;
                                }}
                                floor={floor}
                                doors={doorsByFloor[floor] || []}
                                onDoorClick={handleDoorClick}
                                isActive={selectedFloor === floor}
                              />
                          );
                      } else {
                          // Render placeholder to maintain scroll height
                          return (
                              <div 
                                key={floor}
                                style={{ height: '450px' }} 
                                ref={(el) => {
                                  // Keep ref if needed for scroll calculations, though content is empty
                                  floorRefs.current[floor] = el;
                                }}
                              />
                          );
                      }
                    })}
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

      {/* Door Focus View - In-place zoom with action buttons */}
      {selectedDoor && (
        <DoorFocusView 
          door={selectedDoor}
          doorElement={doorElementRefs.current[selectedDoor.id] || null}
          onClose={handleCloseModal}
          onPrevious={handleNavigateToPreviousDoor}
          onNext={handleNavigateToNextDoor}
          hasPrevious={hasPreviousDoor()}
          hasNext={hasNextDoor()}
        />
      )}
    </div>
  );
}

