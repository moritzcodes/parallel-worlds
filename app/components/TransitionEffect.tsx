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

// TV Channel Zapping Transition - mimics old CRT channel switching
export function ZappingTransition({
  isActive,
  fromColor,
  toColor,
  className = '',
}: {
  isActive: boolean;
  fromColor: string;
  toColor: string;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-lg ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
        >
          {/* Static noise/snow effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.6, 0.9, 0.3, 0] }}
            transition={{ duration: 0.35, times: [0, 0.1, 0.2, 0.3, 0.6, 1] }}
          />

          {/* Horizontal scan line sweep */}
          <motion.div
            className="absolute left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${toColor}, white, ${toColor}, transparent)`,
              boxShadow: `0 0 20px ${toColor}, 0 0 40px ${toColor}`,
            }}
            initial={{ top: '50%', scaleY: 20, opacity: 1 }}
            animate={{ 
              top: ['50%', '0%', '100%', '50%'],
              scaleY: [20, 1, 1, 20],
              opacity: [1, 1, 1, 0],
            }}
            transition={{ duration: 0.35, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
          />

          {/* Color fringing / RGB separation effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: `${fromColor}40`, mixBlendMode: 'screen' }}
              animate={{ x: [-10, 10, 0] }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              className="absolute inset-0"
              style={{ background: `${toColor}40`, mixBlendMode: 'screen' }}
              animate={{ x: [10, -10, 0] }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>

          {/* Flash of white/color */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${toColor}60, white, ${toColor}60)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.15, times: [0, 0.3, 1] }}
          />

          {/* Horizontal glitch bars */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.25 }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 left-0 right-0"
                style={{
                  top: `${10 + i * 12}%`,
                  background: `linear-gradient(90deg, transparent 0%, ${i % 2 === 0 ? fromColor : toColor}80 ${Math.random() * 30 + 10}%, ${i % 2 === 0 ? toColor : fromColor}80 ${Math.random() * 30 + 60}%, transparent 100%)`,
                }}
                animate={{
                  x: [0, (i % 2 === 0 ? 1 : -1) * (Math.random() * 100 + 50), 0],
                  scaleX: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.2,
                  delay: i * 0.02,
                }}
              />
            ))}
          </motion.div>

          {/* CRT turn-off/on collapse effect */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ scaleY: 0 }}
            animate={{ 
              scaleY: [0, 1, 1, 0],
              scaleX: [1, 1, 0.002, 1],
            }}
            transition={{ 
              duration: 0.4,
              times: [0, 0.2, 0.5, 1],
              ease: [0.4, 0, 0.2, 1],
            }}
          />

          {/* Center bright line during collapse */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${toColor}, white, ${toColor}, transparent)`,
              boxShadow: `0 0 30px ${toColor}, 0 0 60px white`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: [0, 0, 1, 1, 0],
              scaleX: [0, 0, 1, 1, 0],
            }}
            transition={{ 
              duration: 0.4,
              times: [0, 0.2, 0.35, 0.65, 1],
            }}
          />
        </motion.div>
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

