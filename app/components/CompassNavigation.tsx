'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import type { TimelineId, TimelinePosition } from '../types/timeline.types';
import { TIMELINES, NAVIGATION_MAP } from '../constants/timelines';
import clsx from 'clsx';

interface CompassNavigationProps {
  activeTimeline: TimelineId;
  onNavigate: (direction: TimelinePosition) => void;
  canNavigate: (direction: TimelinePosition) => boolean;
  getTimelineInDirection: (direction: TimelinePosition) => TimelineId;
  disabled?: boolean;
}

const DIRECTIONS: { position: TimelinePosition; Icon: typeof ChevronUp; angle: number }[] = [
  { position: 'north', Icon: ChevronUp, angle: 0 },
  { position: 'east', Icon: ChevronRight, angle: 90 },
  { position: 'south', Icon: ChevronDown, angle: 180 },
  { position: 'west', Icon: ChevronLeft, angle: 270 },
];

export function CompassNavigation({
  activeTimeline,
  onNavigate,
  canNavigate,
  getTimelineInDirection,
  disabled = false,
}: CompassNavigationProps) {
  return (
    <div className="relative">
      {/* Center indicator */}
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center"
        animate={{ rotate: 0 }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-white/10" />
        
        {/* Inner glow */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${TIMELINES[activeTimeline].color}30, transparent)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute h-4 w-4 rounded-full"
          style={{ backgroundColor: TIMELINES[activeTimeline].color }}
          layoutId="compass-center"
        />

        {/* Direction buttons */}
        {DIRECTIONS.map(({ position, Icon, angle }) => {
          const targetTimeline = getTimelineInDirection(position);
          const isNavigable = canNavigate(position);
          const timeline = TIMELINES[targetTimeline];

          return (
            <CompassButton
              key={position}
              position={position}
              angle={angle}
              Icon={Icon}
              timeline={timeline}
              isNavigable={isNavigable}
              disabled={disabled}
              onClick={() => isNavigable && onNavigate(position)}
            />
          );
        })}
      </motion.div>

      {/* Direction labels */}
      <div className="absolute -inset-12">
        {DIRECTIONS.map(({ position, angle }) => {
          const targetTimeline = getTimelineInDirection(position);
          const isNavigable = canNavigate(position);
          const timeline = TIMELINES[targetTimeline];

          const positionStyles = {
            north: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full',
            east: 'right-0 top-1/2 translate-x-full -translate-y-1/2',
            south: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full',
            west: 'left-0 top-1/2 -translate-x-full -translate-y-1/2',
          };

          return (
            <AnimatePresence key={position} mode="wait">
              {isNavigable && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={clsx(
                    'absolute whitespace-nowrap px-2 py-1 text-xs',
                    positionStyles[position]
                  )}
                >
                  <span
                    className="font-medium"
                    style={{ color: timeline.color }}
                  >
                    {timeline.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}

interface CompassButtonProps {
  position: TimelinePosition;
  angle: number;
  Icon: typeof ChevronUp;
  timeline: (typeof TIMELINES)[TimelineId];
  isNavigable: boolean;
  disabled: boolean;
  onClick: () => void;
}

function CompassButton({
  position,
  angle,
  Icon,
  timeline,
  isNavigable,
  disabled,
  onClick,
}: CompassButtonProps) {
  const positionStyles = {
    north: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    east: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
    south: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    west: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || !isNavigable}
      className={clsx(
        'absolute flex h-8 w-8 items-center justify-center rounded-full transition-all',
        positionStyles[position],
        isNavigable
          ? 'bg-white/10 hover:bg-white/20'
          : 'bg-white/5 cursor-not-allowed opacity-30'
      )}
      whileHover={isNavigable ? { scale: 1.2 } : {}}
      whileTap={isNavigable ? { scale: 0.9 } : {}}
      style={{
        borderColor: isNavigable ? timeline.color : 'transparent',
        borderWidth: isNavigable ? 2 : 0,
      }}
    >
      <Icon
        className="h-4 w-4"
        style={{ color: isNavigable ? timeline.color : '#71717A' }}
      />
      
      {/* Pulse effect for navigable directions */}
      {isNavigable && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ borderColor: timeline.color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  );
}

// Compact compass for mobile/small screens
export function CompactCompass({
  activeTimeline,
  onNavigate,
  canNavigate,
  getTimelineInDirection,
}: CompassNavigationProps) {
  return (
    <div className="flex gap-2">
      {DIRECTIONS.map(({ position, Icon }) => {
        const targetTimeline = getTimelineInDirection(position);
        const isNavigable = canNavigate(position);
        const timeline = TIMELINES[targetTimeline];

        return (
          <motion.button
            key={position}
            onClick={() => isNavigable && onNavigate(position)}
            disabled={!isNavigable}
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isNavigable
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 opacity-30'
            )}
            whileHover={isNavigable ? { scale: 1.1 } : {}}
            whileTap={isNavigable ? { scale: 0.95 } : {}}
          >
            <Icon
              className="h-5 w-5"
              style={{ color: isNavigable ? timeline.color : '#71717A' }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}


