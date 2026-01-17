'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';

export type DoorView = 'chalk' | 'prettify' | 'uglify' | 'sloppify';
export type JobStatus = 'idle' | 'queued' | 'extracted' | 'completed' | 'failed';

/**
 * Response shape from /extract endpoint (200 OK - immediate completion)
 */
export interface ExtractResponse {
  status: string;
  scan_id: string;
  roomId: string;
  chalkImage: string;
  prettifyImage?: string;
  uglifyImage?: string;
  sloppifyText?: string;
  message?: string;
}

/**
 * Response shape from /scans/:scan_id endpoint (polling)
 */
export interface ScanStatusResponse {
  status: JobStatus;
  chalkImage?: string;
  prettifyImage?: string;
  uglifyImage?: string;
  sloppifyText?: string;
}

/**
 * Per-door state management
 */
export interface DoorState {
  roomId: string;
  scanId?: string;              // Job ID from async processing
  status: JobStatus;            // Current processing status
  chalkImage?: string;          // Default view from /extract
  prettifyImage?: string;
  uglifyImage?: string;
  sloppifyText?: string;
  currentView: DoorView;
  loading: boolean;
  error?: string;
}

interface DoorStateContextType {
  doorStates: Map<string, DoorState>;
  getDoorState: (roomId: string) => DoorState | undefined;
  setDoorState: (roomId: string, state: Partial<DoorState>) => void;
  setCurrentView: (roomId: string, view: DoorView) => void;
  extractDoor: (roomId: string, imageFile?: File, semester?: string) => Promise<void>;
  rehydrateDoor: (roomId: string) => Promise<void>;
  initializeDoor: (roomId: string, chalkImageUrl: string) => void;
}

const DoorStateContext = createContext<DoorStateContextType | undefined>(undefined);

export function DoorStateProvider({ children }: { children: ReactNode }) {
  const [doorStates, setDoorStates] = useState<Map<string, DoorState>>(new Map());
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup all polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach((interval) => clearInterval(interval));
      pollingIntervals.current.clear();
    };
  }, []);

  const getDoorState = useCallback((roomId: string) => {
    return doorStates.get(roomId);
  }, [doorStates]);

  const setDoorState = useCallback((roomId: string, partialState: Partial<DoorState>) => {
    setDoorStates(prev => {
      const newMap = new Map(prev);
      const existingState = newMap.get(roomId);
      if (existingState) {
        newMap.set(roomId, { ...existingState, ...partialState });
      }
      return newMap;
    });
  }, []);

  const setCurrentView = useCallback((roomId: string, view: DoorView) => {
    setDoorState(roomId, { currentView: view });
  }, [setDoorState]);

  const initializeDoor = useCallback((roomId: string, chalkImageUrl: string) => {
    setDoorStates(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(roomId)) {
        newMap.set(roomId, {
          roomId,
          chalkImage: chalkImageUrl,
          currentView: 'chalk',
          loading: false,
          status: 'idle',
        });
      }
      return newMap;
    });
  }, []);

  /**
   * Poll job status for async extraction
   */
  const pollJobStatus = useCallback((roomId: string, scanId: string) => {
    // Clear any existing polling interval for this door
    const existingInterval = pollingIntervals.current.get(roomId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const poll = async () => {
      try {
        const response = await fetch(`https://chalk-pyserver.onrender.com/scans/${scanId}`);
        
        if (!response.ok) {
          throw new Error(`Polling failed: ${response.statusText}`);
        }

        const data: ScanStatusResponse = await response.json();
        
        console.log(`[Polling] Room ${roomId}, Status: ${data.status}`, data);

        setDoorStates(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(roomId);
          
          if (existing) {
            const updatedState: DoorState = {
              ...existing,
              status: data.status,
              chalkImage: data.chalkImage || existing.chalkImage,
              prettifyImage: data.prettifyImage || existing.prettifyImage,
              uglifyImage: data.uglifyImage || existing.uglifyImage,
              sloppifyText: data.sloppifyText || existing.sloppifyText,
            };
            
            console.log(`[Polling] Updated state for ${roomId}:`, updatedState);

            // Stop polling on completion or failure
            if (data.status === 'completed' || data.status === 'failed') {
              const interval = pollingIntervals.current.get(roomId);
              if (interval) {
                clearInterval(interval);
                pollingIntervals.current.delete(roomId);
              }
              updatedState.loading = false;
              
              if (data.status === 'failed') {
                updatedState.error = 'Extraction failed';
              }
            }

            newMap.set(roomId, updatedState);
          }
          
          return newMap;
        });
      } catch (error) {
        console.error(`Error polling scan ${scanId}:`, error);
        
        // Stop polling on error
        const interval = pollingIntervals.current.get(roomId);
        if (interval) {
          clearInterval(interval);
          pollingIntervals.current.delete(roomId);
        }

        setDoorStates(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(roomId);
          if (existing) {
            newMap.set(roomId, {
              ...existing,
              loading: false,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Polling failed',
            });
          }
          return newMap;
        });
      }
    };

    // Start polling every 3 seconds
    const interval = setInterval(poll, 3000);
    pollingIntervals.current.set(roomId, interval);
    
    // Poll immediately
    poll();
  }, []);

  /**
   * Rehydrate door data from backend using just roomId (for page refresh)
   * This leverages backend idempotency - POST /extract with only roomId
   */
  const rehydrateDoor = useCallback(async (roomId: string) => {
    try {
      const formData = new FormData();
      formData.append('roomId', roomId);
      // NO image file - backend will return existing data if available

      const response = await fetch('https://chalk-pyserver.onrender.com/extract', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        // Data exists - populate state
        const data: ExtractResponse = await response.json();
        setDoorStates(prev => {
          const newMap = new Map(prev);
          newMap.set(roomId, {
            roomId,
            scanId: data.scan_id,
            status: 'completed',
            chalkImage: data.chalkImage,
            prettifyImage: data.prettifyImage,
            uglifyImage: data.uglifyImage,
            sloppifyText: data.sloppifyText,
            currentView: 'chalk',
            loading: false,
          });
          return newMap;
        });
      } else if (response.status === 400) {
        // Room doesn't exist yet - that's fine, user hasn't uploaded
        console.log(`No existing data for room ${roomId}`);
      }
    } catch (error) {
      console.error(`Error rehydrating door ${roomId}:`, error);
    }
  }, []);

  /**
   * Call /extract endpoint to get all door representations
   * Handles both immediate (200) and async (202) responses
   */
  const extractDoor = useCallback(async (roomId: string, imageFile?: File, semester?: string) => {
    // Check if already completed
    const currentState = doorStates.get(roomId);
    if (currentState?.status === 'completed') {
      console.log(`Door ${roomId} already extracted, skipping`);
      return;
    }

    // If no image file provided, try rehydration instead
    if (!imageFile) {
      return rehydrateDoor(roomId);
    }

    // Set loading state
    setDoorStates(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(roomId);
      if (existing) {
        newMap.set(roomId, { ...existing, loading: true, error: undefined, status: 'queued' });
      } else {
        newMap.set(roomId, {
          roomId,
          currentView: 'chalk',
          loading: true,
          status: 'queued',
        });
      }
      return newMap;
    });

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('roomId', roomId);
      
      // Add semester if provided
      if (semester) {
        formData.append('semester', semester);
      }

      const response = await fetch('https://chalk-pyserver.onrender.com/extract', {
        method: 'POST',
        body: formData,
      });

      const data: ExtractResponse = await response.json();

      if (response.status === 200) {
        // Immediate completion (cache hit)
        setDoorStates(prev => {
          const newMap = new Map(prev);
          newMap.set(roomId, {
            roomId,
            scanId: data.scan_id,
            status: 'completed',
            chalkImage: data.chalkImage,
            prettifyImage: data.prettifyImage,
            uglifyImage: data.uglifyImage,
            sloppifyText: data.sloppifyText,
            currentView: 'chalk',
            loading: false,
          });
          return newMap;
        });
      } else if (response.status === 202) {
        // Async job started - begin polling
        setDoorStates(prev => {
          const newMap = new Map(prev);
          newMap.set(roomId, {
            roomId,
            scanId: data.scan_id,
            status: 'queued',
            currentView: 'chalk',
            loading: true,
          });
          return newMap;
        });

        // Start polling
        pollJobStatus(roomId, data.scan_id);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error) {
      console.error(`Error extracting door ${roomId}:`, error);
      setDoorStates(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(roomId);
        if (existing) {
          newMap.set(roomId, {
            ...existing,
            loading: false,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Failed to extract door',
          });
        }
        return newMap;
      });
    }
  }, [doorStates, pollJobStatus]);

  const value: DoorStateContextType = {
    doorStates,
    getDoorState,
    setDoorState,
    setCurrentView,
    extractDoor,
    rehydrateDoor,
    initializeDoor,
  };

  return (
    <DoorStateContext.Provider value={value}>
      {children}
    </DoorStateContext.Provider>
  );
}

export function useDoorState() {
  const context = useContext(DoorStateContext);
  if (!context) {
    throw new Error('useDoorState must be used within DoorStateProvider');
  }
  return context;
}
