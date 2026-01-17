'use client';

import { Door } from '@/types/door';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ImageUploader from './ImageUploader';
import { supabase } from '@/lib/supabaseClient';

interface DoorFocusViewProps {
  door: Door;
  doorElement: HTMLElement | null;
  onClose: () => void;
  onUpdate?: (doorId: string, updates: Partial<Door>) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function DoorFocusView({ 
  door, 
  doorElement,
  onClose, 
  onUpdate,
  onPrevious, 
  onNext,
  hasPrevious,
  hasNext 
}: DoorFocusViewProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [doorPosition, setDoorPosition] = useState({ x: 0, y: 0, width: 160, height: 280 });

  // Measure door element position and size
  useEffect(() => {
    if (doorElement) {
      const rect = doorElement.getBoundingClientRect();
      setDoorPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [doorElement]);

  // Polling for processed images or missing data
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      const compositeId = door.id.replace('gen-', '');
      try {
        const { data, error } = await supabase
          .from('door_chalks')
          .select('*')
          .eq('id', compositeId)
          .single();

        if (!error && data) {
          const newUrl = data.processed_url || data.original_url || data.image_url;
          if (newUrl && (newUrl !== door.imageUrl || data.status !== door.status)) {
            if (onUpdate) {
              onUpdate(door.id, {
                imageUrl: newUrl,
                status: data.status,
                style: data.style
              });
            }
          }
        }
      } catch (e) {
        // ignore
      }
    };

    // Poll if processing OR if image is missing (to catch initial data loads)
    if (door.status === 'extracted' || door.status === 'processing' || !door.imageUrl) {
      intervalId = setInterval(checkStatus, 3000);
      checkStatus(); // Immediate check
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [door.status, door.id, door.imageUrl, onUpdate]);

  // Close upload view
  const handleCloseUpload = () => setIsUploading(false);

  const handleUploadComplete = (url: string) => {
    if (onUpdate) {
      onUpdate(door.id, {
        imageUrl: url,
        status: 'completed'
      });
    }
    setTimeout(handleCloseUpload, 1500);
  };

  const handleAction = async (actionStyle: string) => {
    setSelectedAction(actionStyle);
    
    const styleMap: { [key: string]: string } = {
      'beautify': 'pretty',
      'uglify': 'ugly',
      'sloppify': 'aislop'
    };
    
    const dbStyle = styleMap[actionStyle] || actionStyle;
    const compositeId = door.id.replace('gen-', '');

    try {
      if (onUpdate) {
        onUpdate(door.id, { status: 'extracted' });
      }

      const response = await fetch('/api/chalk/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: compositeId, 
          style: dbStyle 
        }),
      });

      if (!response.ok) throw new Error('Failed to start processing');
    } catch (error) {
      console.error('Action error:', error);
      if (onUpdate) onUpdate(door.id, { status: 'failed' });
    } finally {
      setTimeout(() => setSelectedAction(null), 2000);
    }
  };

  const roomNumber = `${String(door.floor).padStart(2, '0')}-${String(door.doorNumber % 1000).padStart(3, '0')}`;
  const [direction, setDirection] = useState(0); 

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
        onClick={onClose}
      />

      <motion.div
        key={door.id}
        initial={{ 
          x: direction > 0 ? 1000 : direction < 0 ? -1000 : 0,
          opacity: direction === 0 ? 0 : 1,
          scale: direction === 0 ? 0.8 : 1,
        }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ 
          x: direction > 0 ? -1000 : direction < 0 ? 1000 : 0,
          opacity: 0,
          scale: 0.8,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[70] pointer-events-none flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center w-full max-w-2xl">
          <div 
            className="mb-6 px-8 py-3 text-center font-bold text-black bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]"
            style={{ 
                fontFamily: 'var(--font-caveat-brush), cursive', 
                fontSize: '3rem',
                borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' 
            }}
          >
            {roomNumber}
          </div>

          <div 
            className="relative bg-[#fdfbf7] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] pointer-events-auto overflow-hidden transition-all duration-300 border-4 border-black"
            style={{ 
              width: isUploading ? '550px' : `${Math.max(doorPosition.width * 1.5, 320)}px`,
              height: isUploading ? 'auto' : `${Math.max(doorPosition.height * 1.5, 480)}px`,
              minHeight: isUploading ? '400px' : '480px',
            }}
          >
            {isUploading ? (
              <div className="p-8 h-full flex flex-col bg-[#fdfbf7]">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl" style={{ fontFamily: 'var(--font-patrick-hand), cursive' }}>Upload Your Masterpiece</h3>
                    <button onClick={handleCloseUpload} className="text-lg hover:underline font-bold text-red-600">Cancel</button>
                 </div>
                 <ImageUploader 
                    initialSemester={door.semester} 
                    academicYear={door.academicYear} 
                    doorId={door.id.replace('gen-', '')} 
                    onUploadSuccess={handleUploadComplete} 
                 />
              </div>
            ) : (
              <>
                <div className="absolute inset-0" style={{ padding: '8px' }}>
                  <div className="relative h-full w-full overflow-hidden border-2 border-dashed border-gray-300 rounded-sm bg-white">
                    {door.imageUrl ? (
                      <Image
                        src={door.imageUrl}
                        alt={`Room ${roomNumber}`}
                        fill
                        className="object-cover"
                        sizes="240px"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-6xl mb-2 opacity-20">🎨</span>
                        <p className="font-handwritten text-lg opacity-40">No Artwork Yet</p>
                        <p className="text-[10px] opacity-20 mt-2 font-mono">{door.id}</p>
                      </div>
                    )}
                    
                    {(door.status === 'extracted' || door.status === 'processing') && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="animate-spin text-3xl mb-2">🎨</div>
                        <p className="font-bold font-handwritten text-xl">Creating Magic...</p>
                        <p className="text-xs opacity-80">This will take a few seconds</p>
                      </div>
                    )}
                  </div>
                </div>

                {door.nameOfOwner && (
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 border-2 border-black text-black px-2 py-1 transform rotate-1 z-30 font-bold text-sm shadow-sm">
                    {door.nameOfOwner}
                  </div>
                )}
              </>
            )}
          </div>

          {!isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.1 }}
              className="mt-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex gap-4 items-center justify-center flex-wrap">
              <button
                onClick={() => setIsUploading(true)}
                className="px-6 py-2 bg-pastel-yellow border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
              >
                Upload Art
              </button>

              <button
                onClick={() => handleAction('beautify')}
                className="px-6 py-2 bg-pastel-pink border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }}
                disabled={selectedAction !== null}
              >
                {selectedAction === 'beautify' ? 'Beautifying...' : 'Beautify'}
              </button>

              <button
                onClick={() => handleAction('uglify')}
                className="px-6 py-2 bg-pastel-green border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
                disabled={selectedAction !== null}
              >
                {selectedAction === 'uglify' ? 'Uglifying...' : 'Uglify'}
              </button>

              <button
                onClick={() => handleAction('sloppify')}
                className="px-6 py-2 bg-gray-200 border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }}
                disabled={selectedAction !== null}
              >
                {selectedAction === 'sloppify' ? 'Sloppifying...' : 'Sloppify'}
              </button>

              <button
                onClick={onClose}
                className="w-10 h-10 bg-white border-3 border-black font-bold text-xl hover:scale-110 transition-transform flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {!isUploading && hasPrevious && onPrevious && (
        <motion.button
          key="prev-arrow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={() => { setDirection(-1); onPrevious(); }}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-[80] w-14 h-14 bg-white/95 border-3 border-black rounded-full flex items-center justify-center hover:bg-pastel-blue hover:scale-110 shadow-lg pointer-events-auto"
        >
          <span className="text-2xl font-bold">←</span>
        </motion.button>
      )}

      {!isUploading && hasNext && onNext && (
        <motion.button
          key="next-arrow"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onClick={() => { setDirection(1); onNext(); }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[80] w-14 h-14 bg-white/95 border-3 border-black rounded-full flex items-center justify-center hover:bg-pastel-blue hover:scale-110 shadow-lg pointer-events-auto"
        >
          <span className="text-2xl font-bold">→</span>
        </motion.button>
      )}

      <motion.div 
        key="hint"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-sm text-white bg-black/70 px-4 py-2 rounded-full border border-white/30 pointer-events-none"
      >
        Use ← → to navigate • ESC to close
      </motion.div>
    </AnimatePresence>
  );
}