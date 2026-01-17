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

      {/* Floor Picker Button - fixed to viewport but full-width in shaft */}
      <div className="fixed bottom-4 z-50" style={{ left: '2rem', width: '180px' }}>
        <button
          onClick={onOpenFloorPicker}
          className="floor-picker-btn w-full py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-lg"
        >
          Select Floor
        </button>
      </div>
    </div>
  );
}

