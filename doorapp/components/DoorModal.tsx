'use client';

import { Door } from "@/types/door";
import Image from "next/image";
import { useEffect } from "react";

/**
 * DoorModal Component
 * 
 * Full-screen modal overlay displaying a larger view of the selected door
 * with action buttons (View, Listen, Download).
 * 
 * FUTURE:
 * - "View" button: Navigate to dedicated door page /door/[id]
 * - "Listen" button: Play audio/story associated with the door (fetch from Supabase storage)
 * - "Download" button: Download high-res image (with proper attribution/permissions)
 * - Add sharing functionality
 * - Display additional metadata (description, tags, etc.)
 */

interface DoorModalProps {
  door: Door | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DoorModal({ door, isOpen, onClose }: DoorModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !door) return null;

  // Placeholder handlers for action buttons
  const handleView = () => {
    console.log('View door:', door.id);
    // FUTURE: Navigate to /door/[id]
  };

  const handleListen = () => {
    console.log('Listen to door story:', door.id);
    // FUTURE: Play audio from Supabase storage
  };

  const handleDownload = () => {
    console.log('Download door image:', door.id);
    // FUTURE: Trigger download with proper attribution
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal container */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-slate-800 sketch-border animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center transition-colors chalk-element"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Image section */}
          <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-slate-100">
            <Image
              src={door.imageUrl}
              alt={`Door ${door.doorNumber}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* Chalk texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay pointer-events-none"></div>
          </div>

          {/* Content section */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            {/* Door metadata */}
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 chalk-title">
                Door #{door.doorNumber}
              </h2>
              
              <div className="space-y-2 text-slate-600">
                <p className="flex items-center gap-2 chalk-text">
                  <span className="font-semibold">Semester:</span>
                  <span>{door.semester}</span>
                </p>
                <p className="flex items-center gap-2 chalk-text">
                  <span className="font-semibold">Created by:</span>
                  <span className="italic">{door.nameOfOwner}</span>
                </p>
                <p className="flex items-center gap-2 chalk-text">
                  <span className="font-semibold">Date:</span>
                  <span>{new Date(door.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleView}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 chalk-button"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Full Details
                </span>
              </button>

              <button
                onClick={handleListen}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 chalk-button"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Listen to Story
                </span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 chalk-button"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </span>
              </button>
            </div>

            {/* Future integration note */}
            <p className="text-xs text-slate-400 mt-4 italic text-center">
              Actions are placeholders for MVP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
