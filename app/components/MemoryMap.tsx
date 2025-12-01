'use client';

import { motion } from 'framer-motion';
import type { TimelineId, MemoryMapState, NavigationEvent } from '../types/timeline.types';
import { TIMELINES, TIMELINE_ORDER } from '../constants/timelines';
import { getMemoryNodeColor, getTimelineGlow } from '../utils/colorSystem';
import clsx from 'clsx';

interface MemoryMapProps {
  activeTimeline: TimelineId;
  memoryMap: MemoryMapState;
  onTimelineSelect?: (id: TimelineId) => void;
  navigationHistory: NavigationEvent[];
  compact?: boolean;
}

export function MemoryMap({
  activeTimeline,
  memoryMap,
  onTimelineSelect,
  navigationHistory,
  compact = false,
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

  return (
    <div className="relative rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Memory Map</h3>
          <p className="text-xs text-zinc-500">
            {memoryMap.visitedTimelines.size} of 4 timelines explored
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${memoryMap.explorationPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-medium text-zinc-400">
            {Math.round(memoryMap.explorationPercentage)}%
          </span>
        </div>
      </div>

      {/* Map visualization */}
      <div className="relative h-48">
        {/* Connection lines */}
        <svg className="absolute inset-0 h-full w-full">
          {/* Draw connections based on navigation history */}
          {navigationHistory.map((event, index) => {
            const fromPos = getNodePosition(event.from);
            const toPos = getNodePosition(event.to);
            
            return (
              <motion.line
                key={`${event.from}-${event.to}-${index}`}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke={TIMELINES[event.to].color}
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            );
          })}
          
          {/* Default connection web */}
          {TIMELINE_ORDER.map((id, i) => {
            const nextId = TIMELINE_ORDER[(i + 1) % TIMELINE_ORDER.length];
            const fromPos = getNodePosition(id);
            const toPos = getNodePosition(nextId);
            
            return (
              <line
                key={`default-${id}-${nextId}`}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke="white"
                strokeWidth="1"
                strokeOpacity="0.1"
              />
            );
          })}
        </svg>

        {/* Timeline nodes */}
        {TIMELINE_ORDER.map((id) => {
          const timeline = TIMELINES[id];
          const isVisited = memoryMap.visitedTimelines.has(id);
          const isActive = id === activeTimeline;
          const position = getNodePosition(id);

          return (
            <motion.button
              key={id}
              onClick={() => onTimelineSelect?.(id)}
              className={clsx(
                'absolute flex flex-col items-center gap-2 -translate-x-1/2 -translate-y-1/2',
                isVisited ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              whileHover={isVisited ? { scale: 1.1 } : {}}
              whileTap={isVisited ? { scale: 0.95 } : {}}
            >
              {/* Node */}
              <motion.div
                className={clsx(
                  'relative h-8 w-8 rounded-full transition-all',
                  isActive && 'ring-2 ring-offset-2 ring-offset-black'
                )}
                style={{
                  backgroundColor: getMemoryNodeColor(id, isVisited, isActive),
                  boxShadow: isActive ? getTimelineGlow(id) : 'none',
                  '--tw-ring-color': isActive ? timeline.color : 'transparent',
                } as React.CSSProperties}
                animate={isActive ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Inner glow for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: timeline.color }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={clsx(
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-white' : isVisited ? 'text-zinc-400' : 'text-zinc-600'
                )}
              >
                {timeline.name}
              </span>
            </motion.button>
          );
        })}

        {/* Center decision point */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white"
            animate={{
              boxShadow: [
                '0 0 10px rgba(255,255,255,0.2)',
                '0 0 20px rgba(255,255,255,0.4)',
                '0 0 10px rgba(255,255,255,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎈
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white" />
          <span className="text-xs text-zinc-500">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/60" />
          <span className="text-xs text-zinc-500">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/20" />
          <span className="text-xs text-zinc-500">Unexplored</span>
        </div>
      </div>
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

