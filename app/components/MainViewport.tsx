'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineId, ViewMode } from '../types/timeline.types';
import { TIMELINES, TIMELINE_ORDER } from '../constants/timelines';
import { getTimelineCSSVars, getTimelineGlow } from '../utils/colorSystem';
import clsx from 'clsx';

interface MainViewportProps {
  activeTimeline: TimelineId;
  previousTimeline: TimelineId | null;
  viewMode: ViewMode;
  isPlaying: boolean;
  onTimelineSelect?: (id: TimelineId) => void;
  videoRefs: Record<TimelineId, React.RefObject<HTMLVideoElement | null>>;
  isTransitioning?: boolean;
}

export function MainViewport({
  activeTimeline,
  previousTimeline,
  viewMode,
  isPlaying,
  onTimelineSelect,
  videoRefs,
  isTransitioning = false,
}: MainViewportProps) {
  const [loadedVideos, setLoadedVideos] = useState<Set<TimelineId>>(new Set());

  const handleVideoLoad = (id: TimelineId) => {
    setLoadedVideos((prev) => new Set(prev).add(id));
  };

  // Single timeline view
  if (viewMode.type === 'single') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
        <AnimatePresence mode="sync">
          {TIMELINE_ORDER.map((id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: id === activeTimeline ? 1 : 0,
                scale: id === activeTimeline ? 1 : 1.05,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={clsx(
                'absolute inset-0',
                id !== activeTimeline && 'pointer-events-none'
              )}
            >
              <VideoElement
                ref={videoRefs[id]}
                timeline={TIMELINES[id]}
                isActive={id === activeTimeline}
                isPlaying={isPlaying && id === activeTimeline}
                onLoad={() => handleVideoLoad(id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Timeline indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-6 left-6 z-20"
        >
          <TimelineIndicator timeline={TIMELINES[activeTimeline]} />
        </motion.div>

        {/* Transition overlay */}
        <AnimatePresence>
          {isTransitioning && previousTimeline && (
            <TransitionOverlay
              from={previousTimeline}
              to={activeTimeline}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Quad view - show all timelines
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2 p-2">
      {TIMELINE_ORDER.map((id) => (
        <motion.div
          key={id}
          layoutId={`timeline-${id}`}
          onClick={() => onTimelineSelect?.(id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            'relative cursor-pointer overflow-hidden rounded-xl bg-black transition-all',
            id === activeTimeline && 'ring-2 ring-white/30'
          )}
          style={getTimelineCSSVars(id)}
        >
          <VideoElement
            ref={videoRefs[id]}
            timeline={TIMELINES[id]}
            isActive={id === activeTimeline}
            isPlaying={isPlaying}
            onLoad={() => handleVideoLoad(id)}
            muted={id !== activeTimeline}
          />
          
          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4"
          >
            <div className="space-y-1">
              <div
                className="h-1 w-8 rounded-full"
                style={{ backgroundColor: TIMELINES[id].color }}
              />
              <p className="text-sm font-medium text-white">
                {TIMELINES[id].name}
              </p>
            </div>
          </motion.div>

          {/* Active indicator */}
          {id === activeTimeline && (
            <motion.div
              layoutId="active-border"
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                boxShadow: getTimelineGlow(id, 0.5),
                border: `2px solid ${TIMELINES[id].color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Video element component
interface VideoElementProps {
  timeline: (typeof TIMELINES)[TimelineId];
  isActive: boolean;
  isPlaying: boolean;
  onLoad?: () => void;
  muted?: boolean;
}

const VideoElement = forwardRef<HTMLVideoElement, VideoElementProps>(
  ({ timeline, isActive, isPlaying, onLoad, muted = false }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    return (
      <div className="relative h-full w-full">
        {/* Placeholder/Loading state */}
        {!isLoaded && !hasError && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${timeline.color}20, ${timeline.color}05)`,
            }}
          >
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${timeline.color} transparent transparent transparent` }}
                />
                <span className="text-sm text-zinc-500">Loading {timeline.name}...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center">
              <div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${timeline.color}20` }}
              >
                <span className="text-2xl">🎬</span>
              </div>
              <p className="text-sm text-zinc-400">Video coming soon</p>
              <p className="mt-1 text-xs text-zinc-600">{timeline.name}</p>
            </div>
          </div>
        )}

        {/* Video */}
        <video
          ref={ref}
          src={timeline.videoUrl}
          className={clsx(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loop
          playsInline
          muted={muted || !isActive}
          onLoadedData={handleLoad}
          onError={() => setHasError(true)}
        />

        {/* Subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>
    );
  }
);

VideoElement.displayName = 'VideoElement';

// Timeline indicator badge
function TimelineIndicator({ timeline }: { timeline: (typeof TIMELINES)[TimelineId] }) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 backdrop-blur-xl">
      <motion.div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: timeline.color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div>
        <h3 className="text-sm font-semibold text-white">{timeline.name}</h3>
        <p className="text-xs text-zinc-400">{timeline.description}</p>
      </div>
    </div>
  );
}

// Transition overlay for timeline switches
function TransitionOverlay({
  from,
  to,
}: {
  from: TimelineId;
  to: TimelineId;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        background: `linear-gradient(135deg, ${TIMELINES[from].color}40, ${TIMELINES[to].color}40)`,
      }}
    />
  );
}
