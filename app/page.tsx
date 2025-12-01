'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SingleMonitor, MultiMonitor } from './components/monitor';
import { MemoryMap } from './components/MemoryMap';
import { ModeToggle } from './components/ModeToggle';
import { IntroTransition, SimpleTransition } from './components/TransitionEffect';
import { VideoGenerator, GeneratorButton } from './components/VideoGenerator';
import { useVideoSync } from './hooks/useVideoSync';
import { useTimelineNavigation } from './hooks/useTimelineNavigation';
import { useAudioManager } from './hooks/useAudioManager';
import type { ViewMode, TimelineId } from './types/timeline.types';
import { TIMELINES, KEYBOARD_SHORTCUTS } from './constants/timelines';

export default function ParallelWorldsViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'single' });
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  // Custom hooks
  const {
    videoRefs,
    state: videoState,
    play,
    pause,
    togglePlayPause,
    seek,
    setActiveTimeline: setActiveVideoTimeline,
    activeTimeline: videoActiveTimeline,
    setMuted: setVideoMuted,
  } = useVideoSync('catch');

  const {
    activeTimeline,
    previousTimeline,
    navigateToTimeline,
    memoryMap,
    navigationHistory,
    resetNavigation,
  } = useTimelineNavigation('catch', (event) => {
    // Handle navigation events
    setIsTransitioning(true);
    setActiveVideoTimeline(event.to);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  });

  const audioManager = useAudioManager();

  // Sync video mute state with audio manager
  useEffect(() => {
    setVideoMuted(audioManager.isMuted);
  }, [audioManager.isMuted, setVideoMuted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.playPause:
          e.preventDefault();
          togglePlayPause();
          break;
        case KEYBOARD_SHORTCUTS.toggleMute:
          e.preventDefault();
          audioManager.toggleMute();
          break;
        case KEYBOARD_SHORTCUTS.toggleView:
          e.preventDefault();
          setViewMode((prev) => ({
            type: prev.type === 'single' ? 'quad' : 'single',
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, audioManager]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (videoState.isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [videoState.isPlaying]);

  // Prefetch all videos on mount
  useEffect(() => {
    const prefetchVideos = Object.values(TIMELINES).map((timeline) => {
      const video = document.createElement('video');
      video.src = timeline.videoUrl;
      video.preload = 'auto';
      video.muted = true;
      video.style.display = 'none';
      document.body.appendChild(video);
      return video;
    });

    // Wait for all videos to be ready before completing intro
    let loadedCount = 0;
    const totalVideos = prefetchVideos.length;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalVideos) {
        setTimeout(() => {
          setIsIntroComplete(true);
        }, 500);
      }
    };

    prefetchVideos.forEach((video) => {
      if (video.readyState >= 3) {
        checkAllLoaded();
      } else {
        video.addEventListener('canplaythrough', checkAllLoaded, { once: true });
        video.addEventListener('error', checkAllLoaded, { once: true });
        video.load();
      }
    });

    // Fallback timeout
    const timer = setTimeout(() => {
      setIsIntroComplete(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
      prefetchVideos.forEach((video) => {
        video.removeEventListener('canplaythrough', checkAllLoaded);
        video.removeEventListener('error', checkAllLoaded);
        document.body.removeChild(video);
      });
    };
  }, []);

  // Auto-play videos when intro is complete and videos are ready
  useEffect(() => {
    if (isIntroComplete && !videoState.isPlaying) {
      const activeVideo = videoRefs[activeTimeline].current;
      if (activeVideo && activeVideo.readyState >= 3) {
        play();
      }
    }
  }, [isIntroComplete, activeTimeline, videoRefs, videoState.isPlaying, play]);

  const handleTimelineSelect = useCallback((id: TimelineId) => {
    navigateToTimeline(id);
  }, [navigateToTimeline]);

  const handleModeChange = useCallback((mode: ViewMode['type']) => {
    setViewMode({ type: mode });
  }, []);

  const handleReset = useCallback(() => {
    resetNavigation();
    seek(0);
  }, [resetNavigation, seek]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#09090B]">
      {/* Intro transition */}
      <IntroTransition isComplete={isIntroComplete} />

      {/* Background gradient */}
      <div 
        className="pointer-events-none absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${TIMELINES[activeTimeline].color}08 0%, transparent 70%)`,
        }}
      />

      {/* Main content */}
      <AnimatePresence>
        {isIntroComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex h-full flex-col"
          >
            {/* Header */}
            <motion.header
              initial={{ y: -20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: showControls ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 top-0 z-30 flex items-center justify-end p-4 md:p-6"
            >
              

              {/* Right controls */}
              <div className="flex items-center gap-3">
                <div className="h-6 w-px bg-white/10" />
                <ModeToggle
                  currentMode={viewMode.type}
                  onModeChange={handleModeChange}
                />
              </div>
            </motion.header>

            {/* Main viewport */}
            <main className="flex-1 p-4 pt-20 md:p-6 md:pt-24">
              <div className="relative flex h-full items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm p-4 md:p-8">
                <AnimatePresence mode="wait">
                  {viewMode.type === 'single' ? (
                    <motion.div
                      key="single-monitor"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="flex h-full w-full max-w-5xl items-center justify-center"
                    >
                      <SingleMonitor
                        videoRef={videoRefs[activeTimeline]}
                        timelineId={activeTimeline}
                        isPlaying={videoState.isPlaying}
                        isActive={true}
                        muted={audioManager.isMuted}
                        onPlayPause={togglePlayPause}
                        className="h-full w-full max-h-full"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="multi-monitor"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="h-full w-full max-w-7xl"
                    >
                      <MultiMonitor
                        videoRefs={videoRefs}
                        activeTimeline={activeTimeline}
                        isPlaying={videoState.isPlaying}
                        onTimelineSelect={handleTimelineSelect}
                        className="h-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>

            {/* Bottom controls */}
            <motion.footer
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: showControls ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0  right-16 z-30 p-4 md:p-6 pr-16"
            >
              <div className="flex items-end justify-end gap-4">
                {/* Memory map (desktop) */}
                <div className="hidden w-64 lg:block backdrop-blur-sm rounded-full overflow-hidden pr-16">
                  <MemoryMap
                    activeTimeline={activeTimeline}
                    memoryMap={memoryMap}
                    onTimelineSelect={handleTimelineSelect}
                    navigationHistory={navigationHistory}
                  />
                </div>
              </div>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition effects */}
      <SimpleTransition
        isActive={isTransitioning}
        color={TIMELINES[activeTimeline].color}
      />

      {/* Click to show controls overlay */}
      {!showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20"
          onClick={() => setShowControls(true)}
        />
      )}

      {/* Video generator modal */}
      <AnimatePresence>
        {showGenerator && (
          <VideoGenerator onClose={() => setShowGenerator(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
