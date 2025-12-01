'use client';

import { motion } from 'framer-motion';
import type { TimelineId, MemoryMapState, NavigationEvent } from '../types/timeline.types';
import { TIMELINES, TIMELINE_ORDER } from '../constants/timelines';
import { getMemoryNodeColor } from '../utils/colorSystem';
import clsx from 'clsx';

const CONTAINER_SIZE = 256;
const ORBIT_RADIUS = 100; // Radius where nodes orbit
const ITEM_SIZE = 48;
const LINE_SIZE = 104;
const GAP_BETWEEN_LINES = 32;

interface MemoryMapProps {
  activeTimeline: TimelineId;
  memoryMap: MemoryMapState;
  onTimelineSelect?: (id: TimelineId) => void;
  navigationHistory: NavigationEvent[];
  compact?: boolean;
  onCenterClick?: () => void;
}

export function MemoryMap({
  activeTimeline,
  memoryMap,
  onTimelineSelect,
  navigationHistory,
  compact = false,
  onCenterClick,
}: MemoryMapProps) {
  if (compact) {
    return (
      <CompactMemoryMap
        activeTimeline={activeTimeline}
        memoryMap={memoryMap}
        onTimelineSelect={onTimelineSelect}
      />
    );
  }

  const center = CONTAINER_SIZE / 2;

  return (
    <div 
      className="relative"
      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
    >
      {/* Rotating gradient rings */}
      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 8 }, (_, index) => {
          const size = LINE_SIZE + index * GAP_BETWEEN_LINES;
          const rotation = -index * 16;

          return (
            <div
              key={`gradient-${index}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                top: center - size / 2,
                left: center - size / 2,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  padding: '1px',
                  background: 'conic-gradient(rgba(109,46,255,0) 6.7%,rgba(158,122,255,.35) 20.8%,rgba(254,139,187,.7) 34.9%,#ffbd7a 49.99%,rgba(255,189,122,0) 50%)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Static circular rings */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, index) => {
          const size = LINE_SIZE + index * GAP_BETWEEN_LINES;

          return (
            <div
              key={`circle-${index}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                top: center - size / 2,
                left: center - size / 2,
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  padding: '1px',
                  background: 'rgba(235, 235, 255, 0.06)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Timeline nodes - positioned absolutely from center */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center center' }}
      >
        {TIMELINE_ORDER.map((id, index) => {
          const isVisited = memoryMap.visitedTimelines.has(id);
          const isActive = id === activeTimeline;
          const timeline = TIMELINES[id];
          const totalTimelines = TIMELINE_ORDER.length;

          const angle = (index / totalTimelines) * 2 * Math.PI - Math.PI / 2; // Start from top
          const x = center + ORBIT_RADIUS * Math.cos(angle) - ITEM_SIZE / 2;
          const y = center + ORBIT_RADIUS * Math.sin(angle) - ITEM_SIZE / 2;

          return (
            <motion.button
              key={id}
              onClick={() => onTimelineSelect?.(id)}
              className={clsx(
                'absolute flex items-center justify-center rounded-full',
                'bg-[rgba(39,39,42,1)] border border-white/10',
                'bg-gradient-to-b from-white/5 to-transparent',
                isVisited ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                left: x,
                top: y,
              }}
              whileHover={isVisited ? { scale: 1.1 } : {}}
              whileTap={isVisited ? { scale: 0.95 } : {}}
            >
              {/* Counter-rotate to keep content upright */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                className="flex items-center justify-center"
              >
                <span
                  className={clsx(
                    'text-[12px] font-medium',
                    isActive ? 'text-white' : isVisited ? 'text-zinc-400' : 'text-zinc-600'
                  )}
                >
                  {timeline.name}
                </span>
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Center element */}
      {onCenterClick ? (
        <motion.button
          onClick={onCenterClick}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:bg-white/5 rounded-full"
          style={{ left: center, top: center }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="h-12 w-12 rounded-full border border-white/10 bg-[rgba(39,39,42,0.5)]" />
        </motion.button>
      ) : (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: center, top: center }}
        >
          <div className="h-12 w-12 rounded-full border border-white/10 bg-[rgba(39,39,42,0.5)]" />
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar
function CompactMemoryMap({
  activeTimeline,
  memoryMap,
  onTimelineSelect,
}: Omit<MemoryMapProps, 'navigationHistory' | 'compact'>) {
  return (
    <div className="flex items-center gap-3">
      {TIMELINE_ORDER.map((id) => {
        const timeline = TIMELINES[id];
        const isVisited = memoryMap.visitedTimelines.has(id);
        const isActive = id === activeTimeline;

        return (
          <motion.button
            key={id}
            onClick={() => onTimelineSelect?.(id)}
            className="group relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={clsx(
                'h-4 w-4 rounded-full transition-all',
                isActive && 'ring-2 ring-offset-1 ring-offset-black'
              )}
              style={{
                backgroundColor: getMemoryNodeColor(id, isVisited, isActive),
                '--tw-ring-color': timeline.color,
              } as React.CSSProperties}
            />
            
            {/* Tooltip */}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white">
                {timeline.name}
              </div>
            </div>
          </motion.button>
        );
      })}
      
      {/* Progress */}
      <div className="ml-2 text-xs text-zinc-500">
        {memoryMap.visitedTimelines.size}/4
      </div>
    </div>
  );
}

// Helper to get node position on the map
function getNodePosition(timelineId: TimelineId): { x: number; y: number } {
  const positions: Record<TimelineId, { x: number; y: number }> = {
    catch: { x: 50, y: 15 },   // North
    sky: { x: 85, y: 50 },     // East
    shared: { x: 50, y: 85 },  // South
    tangled: { x: 15, y: 50 }, // West
  };
  return positions[timelineId];
}

