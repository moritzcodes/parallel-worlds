'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainViewport } from './components/MainViewport';
import { CompassNavigation, CompactCompass } from './components/CompassNavigation';
import { MemoryMap } from './components/MemoryMap';
import { TimelineScrubber } from './components/TimelineScrubber';
import { ModeToggle, KeyboardShortcutsHelp, ProjectInfo } from './components/ModeToggle';
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
  } = useVideoSync('catch');

  const {
    activeTimeline,
    previousTimeline,
    navigateTo,
    navigateToTimeline,
    memoryMap,
    navigationHistory,
    canNavigate,
    getTimelineInDirection,
    resetNavigation,
  } = useTimelineNavigation('catch', (event) => {
    // Handle navigation events
    setIsTransitioning(true);
    setActiveVideoTimeline(event.to);
    audioManager.playTransition();
    audioManager.playTimelineSignature(event.to);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  });

  const audioManager = useAudioManager();

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
            type: prev.type === 'single' ? 'quad' : prev.type === 'quad' ? 'memory-map' : 'single',
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

  // Complete intro after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroComplete(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleTimelineSelect = useCallback((id: TimelineId) => {
    if (viewMode.type === 'quad') {
      navigateToTimeline(id);
      setViewMode({ type: 'single', focusedTimeline: id });
    } else {
      navigateToTimeline(id);
    }
  }, [viewMode.type, navigateToTimeline]);

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
              className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-4 md:p-6"
            >
              {/* Logo / Title */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-2xl"
                  animate={{
                    y: [0, -3, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  🎈
                </motion.div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Parallel Worlds</h1>
                  <p className="text-xs text-zinc-500">Multi-timeline navigation</p>
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                <MemoryMap
                  activeTimeline={activeTimeline}
                  memoryMap={memoryMap}
                  onTimelineSelect={handleTimelineSelect}
                  navigationHistory={navigationHistory}
                  compact
                />
                <div className="h-6 w-px bg-white/10" />
                <GeneratorButton onClick={() => setShowGenerator(true)} />
                <div className="h-6 w-px bg-white/10" />
                <ModeToggle
                  currentMode={viewMode.type}
                  onModeChange={handleModeChange}
                />
                <KeyboardShortcutsHelp />
                <ProjectInfo />
              </div>
            </motion.header>

            {/* Main viewport */}
            <main className="flex-1 p-4 pt-20 md:p-6 md:pt-24">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
                <MainViewport
                  activeTimeline={activeTimeline}
                  previousTimeline={previousTimeline}
                  viewMode={viewMode}
                  isPlaying={videoState.isPlaying}
                  onTimelineSelect={handleTimelineSelect}
                  videoRefs={videoRefs}
                  isTransitioning={isTransitioning}
                />
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
              className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6"
            >
              <div className="flex items-end justify-between gap-4">
                {/* Compass navigation */}
                <div className="hidden md:block">
                  <CompassNavigation
                    activeTimeline={activeTimeline}
                    onNavigate={navigateTo}
                    canNavigate={canNavigate}
                    getTimelineInDirection={getTimelineInDirection}
                    disabled={isTransitioning}
                  />
                </div>
                <div className="md:hidden">
                  <CompactCompass
                    activeTimeline={activeTimeline}
                    onNavigate={navigateTo}
                    canNavigate={canNavigate}
                    getTimelineInDirection={getTimelineInDirection}
                    disabled={isTransitioning}
                  />
                </div>

                {/* Timeline scrubber */}
                <div className="flex-1 max-w-2xl rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
                  <TimelineScrubber
                    activeTimeline={activeTimeline}
                    currentTime={videoState.currentTime}
                    duration={videoState.duration}
                    isPlaying={videoState.isPlaying}
                    isMuted={audioManager.isMuted}
                    onPlayPause={togglePlayPause}
                    onSeek={seek}
                    onMuteToggle={audioManager.toggleMute}
                    onReset={handleReset}
                  />
                </div>

                {/* Memory map (desktop) */}
                <div className="hidden w-64 lg:block">
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
