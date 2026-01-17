'use client';

import { Door } from '@/types/door';
import Image from 'next/image';
import { useEffect } from 'react';

interface DoorModalProps {
  door: Door;
  onClose: () => void;
}

export default function DoorModal({ door, onClose }: DoorModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="relative bg-amber-50 rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden animate-slide-up border-4 border-amber-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-md bg-amber-900/90 text-amber-50 hover:bg-amber-950 transition-colors border-2 border-amber-800"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Image section */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-amber-100 to-amber-200">
          <Image
            src={door.imageUrl}
            alt={`Door ${door.doorNumber}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>

        {/* Info section */}
        <div className="p-8 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-amber-950 mb-2 sketch-title">
                Door {door.doorNumber}
              </h2>
              {door.nameOfOwner && (
                <p className="text-lg text-amber-800 sketch-text">
                  Owner: <span className="font-semibold text-amber-950">{door.nameOfOwner}</span>
                </p>
              )}
            </div>
            <div className="floor-badge bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50 font-bold px-4 py-2 rounded-md shadow-lg">
              Floor {door.floor}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-amber-100 rounded-md border-2 border-amber-900/20">
            <div>
              <p className="text-sm text-amber-700 sketch-text">Academic Year</p>
              <p className="font-semibold text-amber-950">AY{door.academicYear}</p>
            </div>
            <div>
              <p className="text-sm text-amber-700 sketch-text">Semester</p>
              <p className="font-semibold text-amber-950">Semester {door.semester}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-amber-50 font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all border-2 border-amber-900/30">
              👁️ View
            </button>
            <button className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50 font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all border-2 border-amber-900/30">
              🎧 Listen
            </button>
            <button className="flex-1 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-amber-50 font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all border-2 border-amber-900/30">
              ⬇️ Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
