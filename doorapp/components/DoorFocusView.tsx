'use client';

import { Door } from '@/types/door';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ImageUploader from './ImageUploader';
import { fetchScanByRoomId } from '@/lib/api';

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
  const [isUploading, setIsUploading] = useState(false);
  const [viewingStyle, setViewingStyle] = useState<'normal' | 'pretty' | 'ugly' | 'slop' | null>(null);
  const [styleUrls, setStyleUrls] = useState<{pretty?: string, ugly?: string, slop?: string}>({});
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Preload styled images when modal opens
  useEffect(() => {
    const semesterCode = `${door.academicYear.replace('/', '')}${door.semester}0`;
    const compositeId = `${semesterCode}-${door.id.replace('gen-', '')}`;
    console.log('🎨 Fetching styled images for:', compositeId, 'semester:', door.semester);
    fetchScanByRoomId(compositeId).then(data => {
      if (data) {
        console.log('🎨 Received data:', data);
        const newStyleUrls: {pretty?: string, ugly?: string, slop?: string} = {};
        if (data.prettifyImage) newStyleUrls.pretty = data.prettifyImage;
        if (data.uglifyImage) newStyleUrls.ugly = data.uglifyImage;
        if (data.sloppifyText) newStyleUrls.slop = data.sloppifyText;
        console.log('🎨 Style URLs:', newStyleUrls);
        setStyleUrls(newStyleUrls);
        
        // Preload images in background and track when loaded
        if (newStyleUrls.pretty) {
          const img = new window.Image();
          img.onload = () => setLoadedImages(prev => new Set(prev).add(newStyleUrls.pretty!));
          img.src = newStyleUrls.pretty;
        }
        if (newStyleUrls.ugly) {
          const img = new window.Image();
          img.onload = () => setLoadedImages(prev => new Set(prev).add(newStyleUrls.ugly!));
          img.src = newStyleUrls.ugly;
        }
      }
    }).catch(e => console.error('Error preloading styled images:', e));
  }, [door.id]);

  // Polling for processed images or missing data
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      const semesterCode = `${door.academicYear.replace('/', '')}${door.semester}0`;
      const compositeId = `${semesterCode}-${door.id.replace('gen-', '')}`;
      try {
        const data = await fetchScanByRoomId(compositeId);

        if (data) {
          // Use chalkImage (processed_url) from backend
          const newUrl = data.chalkImage || data.original_url || '';

          // Update style URLs when available - only if they exist
          const newStyleUrls: {pretty?: string, ugly?: string, slop?: string} = {};
          if (data.prettifyImage) newStyleUrls.pretty = data.prettifyImage;
          if (data.uglifyImage) newStyleUrls.ugly = data.uglifyImage;
          if (data.sloppifyText) newStyleUrls.slop = data.sloppifyText;
          
          if (Object.keys(newStyleUrls).length > 0) {
            setStyleUrls(prev => ({...prev, ...newStyleUrls}));
          }

          if (newUrl && (newUrl !== door.imageUrl || data.status !== door.status)) {
            if (onUpdate) {
              onUpdate(door.id, {
                imageUrl: newUrl,
                status: data.status,
                style: data.style || 'normal'
              });
            }
          }
        }
      } catch (e) {
        // Silently ignore 404s for rooms that don't exist yet
        if (e instanceof Error && !e.message.includes('404')) {
          console.error('Error polling scan status:', e);
        }
      }
    };

    // Only poll if the door has an image URL (meaning upload happened)
    // Poll if queued, extracted (processing), or if viewing a style that needs fetching
    if (door.imageUrl && (door.status === 'queued' || door.status === 'extracted' || viewingStyle)) {
      intervalId = setInterval(checkStatus, 3000);
      checkStatus(); // Immediate check
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [door.status, door.id, door.imageUrl, onUpdate, viewingStyle]);

  // Close upload view
  const handleCloseUpload = () => setIsUploading(false);

  const handleUploadComplete = (url: string) => {
    if (onUpdate) {
      onUpdate(door.id, {
        imageUrl: url,
        status: 'queued' // Set to queued so backend starts processing all styles
      });
    }
    setTimeout(handleCloseUpload, 1500);
  };

  const handleStyleClick = (style: 'pretty' | 'ugly' | 'slop') => {
    const targetUrl = style === 'pretty' ? styleUrls.pretty : style === 'ugly' ? styleUrls.ugly : styleUrls.slop;
    
    if (!targetUrl) {
      // URL not available yet, just switch and show loading
      setViewingStyle(style);
      return;
    }
    
    // If already loaded, switch instantly
    if (loadedImages.has(targetUrl)) {
      setViewingStyle(style);
      return;
    }
    
    // Show transition loading while image loads
    setIsTransitioning(true);
    const img = new window.Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(targetUrl));
      setViewingStyle(style);
      setIsTransitioning(false);
    };
    img.onerror = () => {
      // On error, still switch but stop loading
      setViewingStyle(style);
      setIsTransitioning(false);
    };
    img.src = targetUrl;
  };

  const getCurrentImageUrl = () => {
    if (viewingStyle === 'pretty') return styleUrls.pretty;
    if (viewingStyle === 'ugly') return styleUrls.ugly;
    if (viewingStyle === 'slop') return styleUrls.slop;
    return door.imageUrl;
  };

  const isStyleLoading = () => {
    if (isTransitioning) return true;
    if (!viewingStyle) return false;
    if (viewingStyle === 'pretty') return !styleUrls.pretty && door.status !== 'failed';
    if (viewingStyle === 'ugly') return !styleUrls.ugly && door.status !== 'failed';
    if (viewingStyle === 'slop') return !styleUrls.slop && door.status !== 'failed';
    return false;
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
        className="fixed inset-0 z-[70] pointer-events-none flex flex-col items-center justify-center px-8 py-12"
      >
        <div className="flex flex-col items-center justify-center w-full max-w-2xl max-h-[calc(100vh-6rem)]">
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
              width: isUploading ? 'min(550px, 85vw)' : 'min(350px, 85vw)',
              height: isUploading ? 'auto' : 'min(60vh, calc(100vh - 28rem))',
              minHeight: isUploading ? '400px' : '350px',
              maxHeight: isUploading ? '70vh' : 'min(60vh, calc(100vh - 28rem))',
            }}
          >
            {isUploading ? (
              <div className="p-8 h-full flex flex-col bg-[#fdfbf7] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl" style={{ fontFamily: 'var(--font-patrick-hand), cursive' }}>Upload Your Masterpiece</h3>
                    <button onClick={handleCloseUpload} className="text-lg hover:underline font-bold text-red-600">Cancel</button>
                 </div>
                 <ImageUploader 
                    initialSemester={door.semester} 
                    academicYear={door.academicYear} 
                    doorId={door.id.replace('gen-', '')}
                    semesterCode={`${door.academicYear.replace('/', '')}${door.semester}0`}
                    onUploadSuccess={handleUploadComplete} 
                 />
              </div>
            ) : (
              <>
                <div className="absolute inset-0" style={{ padding: '8px' }}>
                  <div className="relative h-full w-full overflow-hidden border-2 border-dashed border-gray-300 rounded-sm bg-[#fdfbf7]">
                    {viewingStyle === 'slop' && styleUrls.slop ? (
                      <div className="w-full h-full overflow-y-auto p-6 bg-[#fffef8]">
                        <div className="prose prose-lg max-w-none font-handwritten text-lg leading-relaxed text-gray-800" style={{ fontFamily: 'var(--font-patrick-hand), cursive' }}>
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{styleUrls.slop}</ReactMarkdown>
                        </div>
                      </div>
                    ) : getCurrentImageUrl() ? (
                      <Image
                        src={getCurrentImageUrl()!}
                        alt={`Room ${roomNumber}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 85vw, 350px"
                        priority
                        quality={80}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-6xl mb-2 opacity-20">🎨</span>
                        <p className="font-handwritten text-lg opacity-40">No Artwork Yet</p>
                        <p className="text-[10px] opacity-20 mt-2 font-mono">{door.id}</p>
                      </div>
                    )}
                    
                    {((door.status === 'queued' || door.status === 'extracted') && !viewingStyle) && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="animate-spin text-4xl mb-3">🎨</div>
                        <p className="font-bold font-handwritten text-2xl mb-2">Creating Magic...</p>
                        <p className="text-sm opacity-90 mb-3">Processing your artwork</p>
                        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-pastel-yellow animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs opacity-70 mt-2">This may take 30-60 seconds</p>
                      </div>
                    )}

                    {isStyleLoading() && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="animate-spin text-4xl mb-3">
                          {viewingStyle === 'pretty' ? '✨' : viewingStyle === 'ugly' ? '🤪' : '📝'}
                        </div>
                        <p className="font-bold font-handwritten text-2xl mb-2">
                          {viewingStyle === 'pretty' ? 'Beautifying...' : 
                           viewingStyle === 'ugly' ? 'Uglifying...' : 
                           'Sloppifying...'}
                        </p>
                        <p className="text-sm opacity-90 mb-3">Generating your {viewingStyle} version</p>
                        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-pastel-pink animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs opacity-70 mt-2">This may take up to 30 seconds</p>
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
              className="mt-6 mb-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex gap-3 items-center justify-center flex-wrap px-4">
              <button
                onClick={() => setIsUploading(true)}
                className="px-6 py-2 bg-pastel-yellow border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
              >
                Upload Art
              </button>

              {door.imageUrl && (
                <>
                  <button
                    onClick={() => handleStyleClick('pretty')}
                    className={`px-6 py-2 border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${viewingStyle === 'pretty' ? 'bg-pastel-pink ring-4 ring-pink-400' : 'bg-pastel-pink'}`}
                    style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }}
                  >
                    Beautify ✨
                  </button>

                  <button
                    onClick={() => handleStyleClick('ugly')}
                    className={`px-6 py-2 border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${viewingStyle === 'ugly' ? 'bg-pastel-green ring-4 ring-green-400' : 'bg-pastel-green'}`}
                    style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
                  >
                    Uglify 🤪
                  </button>

                  <button
                    onClick={() => handleStyleClick('slop')}
                    className={`px-6 py-2 border-3 border-black font-bold text-xl text-black hover:scale-[1.05] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${viewingStyle === 'slop' ? 'bg-gray-200 ring-4 ring-gray-400' : 'bg-gray-200'}`}
                    style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }}
                  >
                    Sloppify 📝
                  </button>

                  {viewingStyle && (
                    <button
                      onClick={() => setViewingStyle(null)}
                      className="px-6 py-2 bg-pastel-blue border-3 border-black font-bold text-xl hover:scale-[1.05] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
                    >
                      Show Original
                    </button>
                  )}
                </>
              )}

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