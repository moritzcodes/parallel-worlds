'use client';

import { motion } from 'framer-motion';
import { Maximize2, Grid2X2, Keyboard, Info } from 'lucide-react';
import type { ViewMode } from '../types/timeline.types';
import { KEYBOARD_SHORTCUTS } from '../constants/timelines';
import clsx from 'clsx';
import { useState } from 'react';

interface ModeToggleProps {
  currentMode: ViewMode['type'];
  onModeChange: (mode: ViewMode['type']) => void;
}

const MODES: { type: ViewMode['type']; Icon: typeof Maximize2; label: string }[] = [
  { type: 'single', Icon: Maximize2, label: 'Single View' },
  { type: 'quad', Icon: Grid2X2, label: 'Quad View' },
];

export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
      {MODES.map(({ type, Icon, label }) => (
        <motion.button
          key={type}
          onClick={() => onModeChange(type)}
          className={clsx(
            'relative flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            currentMode === type
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentMode === type && (
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-0 rounded-full bg-white/10"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <Icon className="relative h-4 w-4" />
          
          {/* Tooltip */}
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded bg-black/80 px-2 py-1 text-xs text-white">
              {label}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Keyboard shortcuts help dialog
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Space', action: 'Play/Pause' },
    { key: '↑', action: 'Navigate North' },
    { key: '→', action: 'Navigate East' },
    { key: '↓', action: 'Navigate South' },
    { key: '←', action: 'Navigate West' },
    { key: 'M', action: 'Toggle Mute' },
    { key: 'V', action: 'Toggle View Mode' },
    { key: 'F', action: 'Toggle Fullscreen' },
  ];

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Keyboard className="h-4 w-4" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </h3>

            <div className="space-y-2">
              {shortcuts.map(({ key, action }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-zinc-400">{action}</span>
                  <kbd className="rounded bg-white/10 px-2 py-1 font-mono text-xs text-white">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-lg bg-white/10 py-2 text-sm text-white transition-colors hover:bg-white/20"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

// Info panel about the project
export function ProjectInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Info className="h-4 w-4" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-xl font-semibold text-white">
              Parallel Worlds
            </h3>
            <p className="mb-4 text-sm text-zinc-400">
              An experimental interface for exploring multiple AI-generated video timelines.
            </p>

            <div className="mb-4 rounded-lg bg-white/5 p-4">
              <h4 className="mb-2 text-sm font-medium text-white">The Moment</h4>
              <p className="text-sm text-zinc-400">
                A child&apos;s grip loosens on a balloon string. In this instant,
                four parallel outcomes unfold simultaneously. Navigate between
                them to experience the branching paths of possibility.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <div className="mb-1 h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs text-emerald-400">The Catch</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <div className="mb-1 h-2 w-2 rounded-full bg-blue-500" />
                <p className="text-xs text-blue-400">Into the Sky</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <div className="mb-1 h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-xs text-amber-400">Shared Joy</p>
              </div>
              <div className="rounded-lg bg-pink-500/10 p-3">
                <div className="mb-1 h-2 w-2 rounded-full bg-pink-500" />
                <p className="text-xs text-pink-400">Tangled Fate</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-lg bg-white/10 py-2 text-sm text-white transition-colors hover:bg-white/20"
            >
              Start Exploring
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

