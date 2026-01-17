'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DoorView } from '@/contexts/DoorStateContext';

interface DoorActionButtonsProps {
  currentView: DoorView;
  onViewChange: (view: DoorView) => void;
  isLoading: boolean;
  hasError?: boolean;
}

export default function DoorActionButtons({
  currentView,
  onViewChange,
  isLoading,
  hasError
}: DoorActionButtonsProps) {
  
  const buttons: Array<{
    view: DoorView;
    label: string;
    icon: string;
    color: string;
  }> = [
    { view: 'doorchalk', label: 'Original', icon: '🖼️', color: 'bg-white' },
    { view: 'prettify', label: 'Beautify', icon: '✨', color: 'bg-pastel-pink' },
    { view: 'uglify', label: 'Uglify', icon: '👹', color: 'bg-pastel-green' },
    { view: 'sloppify', label: 'Sloppify', icon: '🌀', color: 'bg-gray-400' },
  ];

  return (
    <div className="flex gap-3 justify-center items-center">
      {buttons.map((button) => {
        const isActive = currentView === button.view;
        const isDisabled = isLoading;

        return (
          <motion.button
            key={button.view}
            onClick={() => onViewChange(button.view)}
            disabled={isDisabled}
            className={`
              relative px-6 py-3 rounded-lg font-bold text-base
              border-3 border-black shadow-md
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-pastel-yellow
              disabled:opacity-50 disabled:cursor-not-allowed
              ${button.color}
              ${isActive ? 'scale-105 shadow-lg' : 'hover:scale-105'}
            `}
            style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
          >
            {/* Active Indicator */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              )}
            </AnimatePresence>

            {/* Button Content */}
            <span className="flex items-center gap-2">
              <span className="text-xl">{button.icon}</span>
              <span>{button.label}</span>
            </span>
          </motion.button>
        );
      })}

      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="ml-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
