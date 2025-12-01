'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineId } from '../types/timeline.types';
import { TIMELINES } from '../constants/timelines';

interface TransitionEffectProps {
  isActive: boolean;
  fromTimeline: TimelineId | null;
  toTimeline: TimelineId;
  type?: 'crossfade' | 'swipe' | 'zoom' | 'morph';
}

export function TransitionEffect({
  isActive,
  fromTimeline,
  toTimeline,
  type = 'crossfade',
}: TransitionEffectProps) {
  const toColor = TIMELINES[toTimeline].color;
  const fromColor = fromTimeline ? TIMELINES[fromTimeline].color : toColor;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {type === 'crossfade' && (
            <CrossfadeTransition fromColor={fromColor} toColor={toColor} />
          )}
          {type === 'swipe' && (
            <SwipeTransition toColor={toColor} />
          )}
          {type === 'zoom' && (
            <ZoomTransition toColor={toColor} />
          )}
          {type === 'morph' && (
            <MorphTransition fromColor={fromColor} toColor={toColor} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CrossfadeTransition({
  fromColor,
  toColor,
}: {
  fromColor: string;
  toColor: string;
}) {
  return (
    <>
      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          background: `linear-gradient(135deg, ${fromColor}60, ${toColor}60)`,
        }}
      />

      {/* Particle effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? fromColor : toColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 0.6,
              delay: Math.random() * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </>
  );
}

function SwipeTransition({ toColor }: { toColor: string }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: `linear-gradient(90deg, transparent, ${toColor}80, transparent)`,
      }}
    />
  );
}

function ZoomTransition({ toColor }: { toColor: string }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-full"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{
          width: '200vmax',
          height: '200vmax',
          opacity: [1, 0.8, 0],
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          backgroundColor: toColor,
        }}
      />
    </motion.div>
  );
}

function MorphTransition({
  fromColor,
  toColor,
}: {
  fromColor: string;
  toColor: string;
}) {
  return (
    <>
      {/* Morphing blob */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="blur-3xl"
          initial={{
            width: 100,
            height: 100,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            backgroundColor: fromColor,
          }}
          animate={{
            width: [100, 300, 100],
            height: [100, 300, 100],
            borderRadius: [
              '30% 70% 70% 30% / 30% 30% 70% 70%',
              '70% 30% 30% 70% / 70% 70% 30% 30%',
              '30% 70% 70% 30% / 30% 30% 70% 70%',
            ],
            backgroundColor: [fromColor, toColor, toColor],
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.6 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full"
            style={{
              top: `${i * 10}%`,
              background: `linear-gradient(90deg, transparent, ${toColor}, transparent)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{
              duration: 0.4,
              delay: i * 0.03,
            }}
          />
        ))}
      </motion.div>
    </>
  );
}

// Simpler transition for better performance
export function SimpleTransition({
  isActive,
  color,
}: {
  isActive: boolean;
  color: string;
}) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(circle at center, ${color}40, transparent)`,
          }}
        />
      )}
    </AnimatePresence>
  );
}

// Loading/intro transition
export function IntroTransition({
  isComplete,
  onComplete,
}: {
  isComplete: boolean;
  onComplete?: () => void;
}) {
  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          onAnimationComplete={onComplete}
        >
          {/* Simple black and white progress bar */}
          <div className="h-1 w-64 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

