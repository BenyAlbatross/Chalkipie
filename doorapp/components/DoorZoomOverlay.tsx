'use client';

import { Door } from '@/types/door';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDoorState, DoorView } from '@/contexts/DoorStateContext';
import DoorActionButtons from './DoorActionButtons';

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
  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;
  const roomId = `${door.floor}${String(door.doorNumber % 1000).padStart(3, '0')}`; // Format: 1002
  const { getDoorState, initializeDoor, setCurrentView, rehydrateDoor } = useDoorState();
  
  // Initialize door state and attempt to fetch existing data
  useEffect(() => {
    initializeDoor(roomId, door.imageUrl);
    // Try to rehydrate data from backend (in case it exists)
    rehydrateDoor(roomId);
  }, [roomId, door.imageUrl, initializeDoor, rehydrateDoor]);

  const doorState = getDoorState(roomId);
  const currentView = doorState?.currentView || 'chalk';
  const isLoading = doorState?.loading || false;

  // Handle view change - NO backend calls, just toggle state
  const handleViewChange = (view: DoorView) => {
    if (view === currentView || !doorState) return;
    
    // Check if the requested view is available
    const isViewAvailable = () => {
      switch (view) {
        case 'chalk':
          return !!doorState.chalkImage || doorState.status === 'extracted' || doorState.status === 'completed';
        case 'prettify':
          return !!doorState.prettifyImage || doorState.status === 'completed';
        case 'uglify':
          return !!doorState.uglifyImage || doorState.status === 'completed';
        case 'sloppify':
          return !!doorState.sloppifyText || doorState.status === 'completed';
        default:
          return false;
      }
    };
    
    // Only switch if view is available
    if (isViewAvailable()) {
      setCurrentView(roomId, view);
    }
  };

  // Get the current image URL based on view
  const getCurrentImageUrl = (): string => {
    if (!doorState) return door.imageUrl;

    let imageUrl: string;
    switch (currentView) {
      case 'prettify':
        imageUrl = doorState.prettifyImage || doorState.chalkImage || door.imageUrl;
        break;
      case 'uglify':
        imageUrl = doorState.uglifyImage || doorState.chalkImage || door.imageUrl;
        break;
      case 'chalk':
      default:
        imageUrl = doorState.chalkImage || door.imageUrl;
        break;
    }
    
    console.log(`[DoorZoomOverlay] Room ${roomId} (Display: ${roomNumber}), View: ${currentView}, URL: ${imageUrl}`);
    console.log(`[DoorZoomOverlay] DoorState:`, doorState);
    return imageUrl;
  };

  const currentImageUrl = getCurrentImageUrl();
  const showSloppifyText = currentView === 'sloppify' && doorState?.sloppifyText;

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

        {/* Zoomed Door Content - Centered and Scaled */}
        <motion.div
          className="relative z-10 max-w-4xl w-full mx-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
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

            {/* Door Image Card - Persistent */}
            <div className="relative w-full aspect-[3/4] bg-light-gray overflow-hidden">
              {/* Buffering Overlay - Show while waiting for 200 OK after 202 */}
              {(doorState?.status === 'queued' || doorState?.status === 'extracted') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30"
                >
                  <div className="text-center bg-white/95 px-8 py-6 rounded-lg border-3 border-black shadow-xl">
                    <div className="w-12 h-12 border-4 border-pastel-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-base font-bold text-black" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                      {doorState.status === 'queued' ? 'Processing...' : 'Generating variations...'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Loading State - First time with no image */}
              {doorState?.loading && !currentImageUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pastel-blue/30 to-pastel-yellow/30 z-20"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-bold text-black" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                      Processing image...
                    </p>
                    <p className="text-sm text-dark-gray mt-2" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                      This may take up to 30 seconds
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Image Card - Stays persistent, only URL changes */}
              <div className="absolute inset-0 bg-white">
                {currentImageUrl && (
                  <Image
                    key={currentImageUrl}
                    src={currentImageUrl}
                    alt={`Room ${roomNumber}`}
                    fill
                    className="object-contain transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority
                    unoptimized
                  />
                )}
              </div>

              {/* Sloppify Text Overlay */}
              {showSloppifyText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center p-8"
                >
                  <div className="bg-white border-4 border-black rounded-lg p-8 max-w-md shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-center" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                      Sloppified Description
                    </h3>
                    <p className="text-lg leading-relaxed text-center" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                      {doorState?.sloppifyText}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {doorState?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-4 right-4 bg-pastel-pink border-2 border-black rounded-lg px-4 py-2 shadow-lg z-40"
                >
                  <p className="text-sm font-medium text-black" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                    ⚠️ {doorState.error}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-white border-t-3 border-black">
              <DoorActionButtons
                currentView={currentView}
                onViewChange={handleViewChange}
                isLoading={isLoading}
                hasError={!!doorState?.error}
                status={doorState?.status}
                hasChalkImage={!!doorState?.chalkImage}
                hasPrettifyImage={!!doorState?.prettifyImage}
                hasUglifyImage={!!doorState?.uglifyImage}
                hasSloppifyText={!!doorState?.sloppifyText}
              />

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
