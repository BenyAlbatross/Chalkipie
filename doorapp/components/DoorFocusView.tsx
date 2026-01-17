'use client';

import { Door } from '@/types/door';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ImageUploader from './ImageUploader';

interface DoorFocusViewProps {
  door: Door;
  doorElement: HTMLElement | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function DoorFocusView({ 
  door, 
  doorElement,
  onClose, 
  onPrevious, 
  onNext,
  hasPrevious,
  hasNext 
}: DoorFocusViewProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [doorPosition, setDoorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // ... (Keep existing useEffects)

  // Calculate centered position - bottom of door at 50vh
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const scaledHeight = doorPosition.height * 1.5;
  const doorBottomY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  
  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;
  const [direction, setDirection] = useState(0); // Track navigation direction for carousel

  // Close upload view
  const handleCloseUpload = () => setIsUploading(false);

  const handleAction = (action: string) => {
    setSelectedAction(action);
    // Placeholder for future backend integration
    console.log(`Action: ${action} on door ${door.id}`);
    setTimeout(() => {
      setSelectedAction(null);
      // onClose(); // Removing automatic close to let user see effect or perform multiple actions
    }, 1000);
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {/* Dimmed Background Overlay */}
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Centered Door Container - carousel animation */}
      <motion.div
        key={door.id}
        initial={{ 
          x: direction > 0 ? 1000 : direction < 0 ? -1000 : 0,
          opacity: direction === 0 ? 0 : 1,
          scale: direction === 0 ? 0.8 : 1,
        }}
        animate={{ 
          x: 0,
          opacity: 1,
          scale: 1,
        }}
        exit={{ 
          x: direction > 0 ? -1000 : direction < 0 ? 1000 : 0,
          opacity: 0,
          scale: 0.8,
        }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center w-full max-w-2xl">
          {/* Room number above door - centered */}
          <div 
            className="mb-6 px-2 py-1 text-center font-bold text-white"
            style={{ fontFamily: 'var(--font-patrick-hand), cursive', fontSize: '3rem' }}
          >
            {roomNumber}
          </div>

          {/* Door Preview OR Upload Form */}
          <div 
            className="relative bg-white shadow-2xl pointer-events-auto rounded-lg overflow-hidden transition-all duration-300"
            style={{ 
              width: isUploading ? '500px' : `${doorPosition.width * 1.5}px`,
              height: isUploading ? 'auto' : `${doorPosition.height * 1.5}px`,
              minHeight: isUploading ? '400px' : 'auto',
            }}
          >
            {isUploading ? (
              <div className="p-6 h-full flex flex-col bg-white">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Upload Art</h3>
                    <button onClick={handleCloseUpload} className="text-sm underline">Cancel</button>
                 </div>
                 <ImageUploader 
                    doorId={`${door.floor}${String(door.doorNumber % 1000).padStart(3, '0')}`} 
                    initialSemester={door.semester} 
                    academicYear={door.academicYear}
                    onUploadSuccess={() => setTimeout(handleCloseUpload, 1500)} 
                 />
              </div>
            ) : (
              <>
                {/* Image Content */}
                <div className="absolute inset-0" style={{ padding: '8px' }}>
                  <div className="relative h-full w-full overflow-hidden border-2 border-dashed border-gray-300 rounded-sm">
                    <Image
                      src={door.imageUrl}
                      alt={`Room ${roomNumber}`}
                      fill
                      className="object-cover"
                      sizes="240px"
                      priority
                    />
                  </div>
                </div>

                {/* Owner name overlay */}
                {door.nameOfOwner && (
                  <div 
                    className="absolute bottom-2 left-2 right-2 bg-white/95 border-2 border-black text-black px-2 py-1 transform rotate-1 z-30 font-bold text-sm shadow-sm" 
                    style={{ fontFamily: 'var(--font-patrick-hand)' }}
                  >
                    {door.nameOfOwner}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons - Hide when uploading */}
          {!isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.1 }}
              className="mt-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex gap-3 items-center justify-center flex-wrap">
              <button
                onClick={() => setIsUploading(true)}
                className="px-6 py-3 bg-pastel-yellow border-3 border-black rounded-lg font-bold text-base hover:scale-110 hover:bg-pastel-orange transition-transform shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-pink"
                style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
              >
                🎨 Upload Art
              </button>

              <button
                onClick={() => handleAction('beautify')}
                className="px-6 py-3 bg-pastel-pink border-3 border-black rounded-lg font-bold text-base hover:scale-110 transition-transform shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
                disabled={selectedAction !== null}
              >
                {selectedAction === 'beautify' ? '✨ Beautifying...' : '✨ Beautify'}
              </button>

              <button
                onClick={() => handleAction('uglify')}
                className="px-6 py-3 bg-pastel-green border-3 border-black rounded-lg font-bold text-base hover:scale-110 transition-transform shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
                disabled={selectedAction !== null}
              >
                {selectedAction === 'uglify' ? '👹 Uglifying...' : '👹 Uglify'}
              </button>

              <button
                onClick={() => handleAction('sloppify')}
                className="px-6 py-3 bg-gray-400 border-3 border-black rounded-lg font-bold text-base hover:scale-110 transition-transform shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
                disabled={selectedAction !== null}
              >
                {selectedAction === 'sloppify' ? '🌀 Sloppifying...' : '🌀 Sloppify'}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-4 py-3 bg-white border-3 border-black rounded-lg font-bold text-base hover:scale-110 hover:bg-pastel-pink transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow"
                style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
              >
                ✕
              </button>
            </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Navigation Arrows - Only show when NOT uploading */}
      {!isUploading && hasPrevious && onPrevious && (
        <motion.button
          key="prev-arrow"
          // ... (Rest of component)
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={() => {
            setDirection(-1);
            onPrevious();
          }}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 bg-white/95 border-2 border-black rounded-full flex items-center justify-center hover:bg-pastel-blue hover:scale-110 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow pointer-events-auto"
          aria-label="Previous door"
          style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
        >
          <span className="text-2xl font-bold">←</span>
        </motion.button>
      )}

      {hasNext && onNext && (
        <motion.button
          key="next-arrow"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onClick={() => {
            setDirection(1);
            onNext();
          }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 bg-white/95 border-2 border-black rounded-full flex items-center justify-center hover:bg-pastel-blue hover:scale-110 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-pastel-yellow pointer-events-auto"
          aria-label="Next door"
          style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
        >
          <span className="text-2xl font-bold">→</span>
        </motion.button>
      )}

      {/* Hint Text */}
      <motion.div 
        key="hint"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-sm text-white bg-black/70 px-4 py-2 rounded-full border border-white/30 pointer-events-none"
        style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
      >
        Use ← → to navigate • ESC to close
      </motion.div>
    </AnimatePresence>
  );
}
