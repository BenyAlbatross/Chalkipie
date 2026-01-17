'use client';

import Lift from './Lift';

interface LiftShaftProps {
  floors: number[];
  selectedFloor: number | null;
  onOpenFloorPicker: () => void;
  isMoving: boolean;
  direction: 'up' | 'down' | 'idle';
}

export default function LiftShaft({ 
  floors, 
  selectedFloor, 
  onOpenFloorPicker,
  isMoving,
  direction 
}: LiftShaftProps) {
  const FLOOR_HEIGHT = 450;
  const totalHeight = floors.length * FLOOR_HEIGHT;
  
  return (
    <div className="lift-shaft-container">
      {/* Elevator header - sticky at top of shaft - compact */}
      <div className="bg-light-gray border-b-3 border-black text-black text-center sticky top-24 z-10" style={{ height: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 12px' }}>
        <div className="text-xs uppercase tracking-wider font-medium">Lift</div>
        <div className="text-lg">⬍⬍⬍</div>
        {selectedFloor && (
          <div className="text-xs font-bold mt-1 text-black">
            Floor {String(selectedFloor).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Lift shaft inner - matches total floor height */}
      <div className="lift-shaft-inner relative bg-medium-gray/20" style={{ height: `${totalHeight}px`, minHeight: `${totalHeight}px` }}>
        {/* Floor level markers aligned with floor rows */}
        {floors.map((floor, index) => {
          // Floor 1 is at index 0 (bottom), Floor 20 is at index 19 (top)
          const fromBottom = index * FLOOR_HEIGHT;
          return (
            <div
              key={floor}
              className="absolute left-0 right-0 flex items-center justify-center border-b border-black/20"
              style={{ bottom: `${fromBottom}px`, height: '2px' }}
            >
              <span className="absolute left-2 bottom-2 text-xs font-bold text-dark-gray bg-white/80 px-1 rounded">
                {String(floor).padStart(2, '0')}
              </span>
            </div>
          );
        })}
        
        {/* Animated lift car */}
        {selectedFloor && (
          <Lift 
            currentFloor={selectedFloor} 
            totalFloors={floors.length}
            isMoving={isMoving}
            direction={direction}
          />
        )}
      </div>

      {/* Floor Picker Button at bottom - fixed to viewport */}
      <div className="fixed bottom-4 left-4 bg-light-gray border-2 border-black px-4 py-4 rounded-lg shadow-lg z-50" style={{ width: '172px' }}>
        <button
          onClick={onOpenFloorPicker}
          className="floor-picker-btn w-full py-3 px-4 rounded-lg font-bold text-sm transition-all"
        >
          Select Floor
        </button>
        {selectedFloor && (
          <div className="text-center mt-2 text-xs text-dark-gray">
            Floor {selectedFloor}
          </div>
        )}
      </div>
    </div>
  );
}

