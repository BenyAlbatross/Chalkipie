'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type DoorView = 'doorchalk' | 'prettify' | 'uglify' | 'sloppify';

export interface DoorState {
  roomId: string;
  doorchalk: string; // Original image URL
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
  fetchDoorVersion: (roomId: string, action: 'prettify' | 'uglify' | 'sloppify') => Promise<void>;
  initializeDoor: (roomId: string, doorchalkUrl: string) => void;
}

const DoorStateContext = createContext<DoorStateContextType | undefined>(undefined);

export function DoorStateProvider({ children }: { children: ReactNode }) {
  const [doorStates, setDoorStates] = useState<Map<string, DoorState>>(new Map());

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

  const initializeDoor = useCallback((roomId: string, doorchalkUrl: string) => {
    setDoorStates(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(roomId)) {
        newMap.set(roomId, {
          roomId,
          doorchalk: doorchalkUrl,
          currentView: 'doorchalk',
          loading: false,
        });
      }
      return newMap;
    });
  }, []);

  const fetchDoorVersion = useCallback(async (
    roomId: string, 
    action: 'prettify' | 'uglify' | 'sloppify'
  ) => {
    const currentState = doorStates.get(roomId);
    if (!currentState) return;

    // Check if already fetched
    if (action === 'prettify' && currentState.prettifyImage) return;
    if (action === 'uglify' && currentState.uglifyImage) return;
    if (action === 'sloppify' && currentState.sloppifyText) return;

    // Set loading state
    setDoorState(roomId, { loading: true, error: undefined });

    try {
      const response = await fetch(`/api/render/${action}?room=${encodeURIComponent(roomId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${action} version`);
      }

      const data = await response.json();

      // Update state with fetched data
      const updates: Partial<DoorState> = { loading: false };
      
      if (action === 'prettify' && data.imageUrl) {
        updates.prettifyImage = data.imageUrl;
      } else if (action === 'uglify' && data.imageUrl) {
        updates.uglifyImage = data.imageUrl;
      } else if (action === 'sloppify' && data.text) {
        updates.sloppifyText = data.text;
      }

      setDoorState(roomId, updates);

    } catch (error) {
      console.error(`Error fetching ${action}:`, error);
      setDoorState(roomId, {
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load version'
      });
    }
  }, [doorStates, setDoorState]);

  const value: DoorStateContextType = {
    doorStates,
    getDoorState,
    setDoorState,
    setCurrentView,
    fetchDoorVersion,
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
