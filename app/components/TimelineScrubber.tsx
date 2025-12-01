'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import type { TimelineId } from '../types/timeline.types';
import { TIMELINES } from '../constants/timelines';
import { formatTime } from '../utils/videoUtils';
import clsx from 'clsx';

interface TimelineScrubberProps {
  activeTimeline: TimelineId;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onMuteToggle: () => void;
  onReset?: () => void;
  bufferedProgress?: number;
}

export function TimelineScrubber({
  activeTimeline,
  currentTime,
  duration,
  isPlaying,
  isMuted,
  onPlayPause,
  onSeek,
  onMuteToggle,
  onReset,
  bufferedProgress = 0,
}: TimelineScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const timeline = TIMELINES[activeTimeline];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      const newTime = (percentage / 100) * duration;
      
      onSeek(newTime);
    },
    [duration, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      
      const rect = progressRef.current.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (hoverX / rect.width) * 100));
      const time = (percentage / 100) * duration;
      
      setHoverTime(time);
    },
    [duration]
  );

  return (
    <div className="w-full space-y-3">
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="group relative h-1.5 cursor-pointer rounded-full bg-white/10"
        onClick={handleProgressClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* Buffered progress */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/20"
          style={{ width: `${bufferedProgress}%` }}
        />

        {/* Current progress */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: timeline.color,
            width: `${progress}%`,
          }}
          layout
        />

        {/* Hover indicator */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              left: `${(hoverTime / duration) * 100}%`,
            }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Scrubber handle */}
        <motion.div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            left: `${progress}%`,
            backgroundColor: timeline.color,
            boxShadow: `0 0 10px ${timeline.color}80`,
          }}
          whileHover={{ scale: 1.5 }}
          drag="x"
          dragConstraints={progressRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Play controls */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onPlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" fill="white" />
            )}
          </motion.button>

          <motion.button
            onClick={onMuteToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-zinc-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-zinc-400" />
            )}
          </motion.button>

          {onReset && (
            <motion.button
              onClick={onReset}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="h-4 w-4 text-zinc-400" />
            </motion.button>
          )}
        </div>

        {/* Center: Time display */}
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-white">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">{formatTime(duration)}</span>
        </div>

        {/* Right: Timeline indicator */}
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: timeline.color }}
          />
          <span className="text-sm text-zinc-400">{timeline.name}</span>
        </div>
      </div>
    </div>
  );
}

// Compact version for minimal UI
export function CompactScrubber({
  currentTime,
  duration,
  activeTimeline,
  isPlaying,
  onPlayPause,
  onSeek,
}: Pick<
  TimelineScrubberProps,
  'currentTime' | 'duration' | 'activeTimeline' | 'isPlaying' | 'onPlayPause' | 'onSeek'
>) {
  const progressRef = useRef<HTMLDivElement>(null);
  const timeline = TIMELINES[activeTimeline];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    onSeek((percentage / 100) * duration);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPlayPause}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-white" />
        ) : (
          <Play className="h-4 w-4 text-white" fill="white" />
        )}
      </button>

      <div
        ref={progressRef}
        className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/10"
        onClick={handleClick}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: timeline.color,
            width: `${progress}%`,
          }}
        />
      </div>

      <span className="font-mono text-xs text-zinc-500">
        {formatTime(currentTime)}
      </span>
    </div>
  );
}


