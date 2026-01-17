'use client';

import { Door } from '@/types/door';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoorZoomOverlayProps {
  door: Door;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function DoorZoomOverlay({ 
  door, 
  onClose, 
  onPrevious, 
  onNext,
  hasPrevious,
  hasNext 
}: DoorZoomOverlayProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Arrow key navigation
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleArrowKeys);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  // Disable scrolling while overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleAction = (action: string) => {
    setSelectedAction(action);
    // Placeholder for future backend integration
    console.log(`Action: ${action} on door ${door.id}`);
    setTimeout(() => setSelectedAction(null), 1000);
  };

  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Blurred/Dimmed Background */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Navigation Arrows */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-white/90 border-3 border-black rounded-full flex items-center justify-center hover:bg-pastel-blue transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow"
            aria-label="Previous door"
            style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
          >
            <span className="text-3xl">←</span>
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-white/90 border-3 border-black rounded-full flex items-center justify-center hover:bg-pastel-blue transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow"
            aria-label="Next door"
            style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
          >
            <span className="text-3xl">→</span>
          </button>
        )}

        {/* Zoomed Door Content */}
        <motion.div
          className="relative z-10 max-w-3xl w-full mx-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-pastel-pink border-3 border-black hover:bg-pastel-yellow transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow"
            aria-label="Close"
            style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
          >
            <span className="text-2xl font-bold">✕</span>
          </button>

          {/* Door Image Container */}
          <div className="bg-white border-4 border-black rounded-lg overflow-hidden shadow-2xl">
            {/* Room Number Header */}
            <div className="bg-pastel-blue border-b-3 border-black px-6 py-4" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
              <h2 className="text-3xl font-bold text-black">Room {roomNumber}</h2>
              {door.nameOfOwner && (
                <p className="text-lg text-dark-gray mt-1">
                  Owner: <span className="font-bold text-black">{door.nameOfOwner}</span>
                </p>
              )}
            </div>

            {/* Door Image */}
            <div className="relative w-full aspect-[3/4] bg-light-gray">
              <Image
                src={door.imageUrl}
                alt={`Room ${roomNumber}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-white border-t-3 border-black">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAction('beautify')}
                  className="px-8 py-4 bg-pastel-pink border-3 border-black rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-4 focus:ring-pastel-yellow disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
                  disabled={selectedAction !== null}
                >
                  {selectedAction === 'beautify' ? '✨ Beautifying...' : '✨ Beautify'}
                </button>

                <button
                  onClick={() => handleAction('uglify')}
                  className="px-8 py-4 bg-pastel-green border-3 border-black rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-4 focus:ring-pastel-yellow disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
                  disabled={selectedAction !== null}
                >
                  {selectedAction === 'uglify' ? '👹 Uglifying...' : '👹 Uglify'}
                </button>

                <button
                  onClick={() => handleAction('sloppify')}
                  className="px-8 py-4 bg-gray-400 border-3 border-black rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-4 focus:ring-pastel-yellow disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
                  disabled={selectedAction !== null}
                >
                  {selectedAction === 'sloppify' ? '🌀 Sloppifying...' : '🌀 Sloppify'}
                </button>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-light-gray rounded-lg border-2 border-black" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                <div>
                  <p className="text-sm text-dark-gray font-medium">Academic Year</p>
                  <p className="font-bold text-black text-lg">AY{door.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-gray font-medium">Semester</p>
                  <p className="font-bold text-black text-lg">Semester {door.semester}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Hint */}
          <div className="text-center mt-4 text-white/80 text-sm" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
            Use ← → arrow keys to navigate between doors
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
