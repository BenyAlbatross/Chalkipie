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
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="modal-content relative rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-pastel-pink border-2 border-black hover:bg-pastel-yellow transition-all"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Image section */}
        <div className="relative w-full aspect-[4/3] bg-light-gray">
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
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">
                Room {String(door.floor).padStart(2, '0')}-{String(door.doorNumber).padStart(3, '0')}
              </h2>
              {door.nameOfOwner && (
                <p className="text-lg text-dark-gray font-medium">
                  Owner: <span className="font-bold text-black">{door.nameOfOwner}</span>
                </p>
              )}
            </div>
            <div className="bg-pastel-blue text-black font-bold px-5 py-2 rounded-lg border-2 border-black">
              Floor {door.floor}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-light-gray rounded-lg border-2 border-black">
            <div>
              <p className="text-sm text-dark-gray font-medium">Academic Year</p>
              <p className="font-bold text-black text-lg">AY{door.academicYear}</p>
            </div>
            <div>
              <p className="text-sm text-dark-gray font-medium">Semester</p>
              <p className="font-bold text-black text-lg">Semester {door.semester}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button className="btn-primary flex-1 py-3 px-6 rounded-lg font-medium">
              👁️ View
            </button>
            <button className="btn-primary flex-1 py-3 px-6 rounded-lg font-medium">
              🎧 Listen
            </button>
            <button className="btn-secondary flex-1 py-3 px-6 rounded-lg font-medium">
              ⬇️ Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
