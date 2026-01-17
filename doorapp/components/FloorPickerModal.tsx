'use client';

import { useEffect, useRef } from 'react';

interface FloorPickerModalProps {
  floors: number[];
  currentFloor: number | null;
  onSelectFloor: (floor: number) => void;
  onClose: () => void;
}

export default function FloorPickerModal({
  floors,
  currentFloor,
  onSelectFloor,
  onClose,
}: FloorPickerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw rough border around modal
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      }
    }
  }, []);

  const handleFloorSelect = (floor: number) => {
    onSelectFloor(floor);
    onClose();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="modal-content relative rounded-lg shadow-2xl max-w-lg w-full mx-4 p-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={550}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-pastel-pink border-2 border-black hover:bg-pastel-yellow transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Select Floor
        </h2>

        <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
          {[...floors].reverse().map((floor) => {
            const isCurrentFloor = currentFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => handleFloorSelect(floor)}
                className={`py-3 px-4 rounded-lg font-bold text-base border-2 border-black transition-all ${
                  isCurrentFloor
                    ? 'bg-pastel-green shadow-lg scale-105'
                    : 'bg-white hover:bg-pastel-blue hover:shadow-md'
                }`}
                style={{
                  boxShadow: isCurrentFloor
                    ? '0 4px 12px rgba(0, 0, 0, 0.2)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                {floor}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-dark-gray text-center mt-6">
          {currentFloor ? `Current: Floor ${currentFloor}` : 'No floor selected'}
        </p>
      </div>
    </div>
  );
}
