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
      {/* Spacer to match door grid header */}
      <div className="bg-transparent" style={{ height: '70px', flexShrink: 0, borderBottom: '3px solid black' }}>
         <div className="w-full h-full flex items-center justify-center">
             <span className="font-bold text-2xl rotate-2">LIFT</span>
         </div>
      </div>

      {/* Lift shaft inner */}
      <div className="lift-shaft-inner relative" style={{ height: `${totalHeight}px`, minHeight: `${totalHeight}px` }}>
        
        {/* Vertical Guide Rails (Hand drawn lines) */}
        <div className="absolute inset-y-0 left-4 w-1 bg-black/10" style={{ borderRadius: '2px' }}></div>
        <div className="absolute inset-y-0 right-4 w-1 bg-black/10" style={{ borderRadius: '2px' }}></div>

        {/* Floor markers */}
        {floors.map((floor, index) => {
          const fromBottom = index * FLOOR_HEIGHT;
          return (
            <div
              key={floor}
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{ bottom: `${fromBottom}px`, height: '0px' }}
            >
              {/* Floor Line Scribble */}
              <div className="w-full h-px bg-black/20 relative">
                 <svg 
                    className="absolute bottom-0 left-0 w-full h-3 opacity-30" 
                    preserveAspectRatio="none"
                    viewBox="0 0 100 5"
                 >
                    <path d="M0,2 Q25,5 50,2 T100,2" stroke="black" strokeWidth="1" fill="none" />
                 </svg>
              </div>

              {/* Floor Number Tag */}
              <div className="absolute left-2 bottom-2 z-0">
                  <div className="relative bg-white border-2 border-black px-2 py-1 rotate-[-2deg] shadow-sm rounded-sm">
                    <span className="text-sm font-bold text-black font-mono">
                        {String(floor).padStart(2, '0')}
                    </span>
                  </div>
              </div>
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

      {/* Floor Picker Button */}
      <div className="fixed bottom-4 z-50" style={{ left: '2rem', width: '180px' }}>
        <button
          onClick={onOpenFloorPicker}
          className="floor-picker-btn w-full py-3 px-4 shadow-lg text-lg"
        >
          Select Floor
        </button>
      </div>
    </div>
  );
}