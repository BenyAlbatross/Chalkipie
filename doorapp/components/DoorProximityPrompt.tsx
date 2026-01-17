'use client';

import { Door } from '@/types/door';

interface DoorProximityPromptProps {
  door: Door;
  characterX: number;
  characterY: number;
  onOpen: () => void;
}

export default function DoorProximityPrompt({ door, characterX, characterY, onOpen }: DoorProximityPromptProps) {
  return (
    <div 
      className="door-proximity-prompt absolute z-40 pointer-events-auto"
      style={{
        left: `${characterX}px`,
        top: `${characterY - 80}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        onClick={onOpen}
        className="bg-white border-2 border-black px-4 py-2 rounded-lg shadow-lg hover:bg-pastel-yellow transition-colors animate-bounce-subtle"
        style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
      >
        <span className="text-sm font-medium">Press <kbd className="px-2 py-1 bg-pastel-blue border border-black rounded text-xs">E</kbd> to Open Door</span>
      </button>
    </div>
  );
}
