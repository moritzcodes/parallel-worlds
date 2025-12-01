'use client';

import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import type { TimelineId, VideoRef } from '../types/timeline.types';
import { TIMELINES, TIMELINE_ORDER } from '../constants/timelines';

interface VideoSyncState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isBuffering: boolean;
  progress: number;
}

interface SetActiveTimelineOptions {
  startFromBeginning?: boolean;
}

interface UseVideoSyncReturn {
  videoRefs: Record<TimelineId, React.RefObject<HTMLVideoElement | null>>;
  state: VideoSyncState;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  seekToProgress: (progress: number) => void;
  setActiveTimeline: (id: TimelineId, options?: SetActiveTimelineOptions) => void;
  activeTimeline: TimelineId;
  isVideoReady: (id: TimelineId) => boolean;
  setMuted: (muted: boolean) => void;
  onVideoEnded: (callback: (timelineId: TimelineId) => void) => () => void;
}

export function useVideoSync(initialTimeline: TimelineId = 'catch'): UseVideoSyncReturn {
  const [activeTimeline, setActiveTimelineState] = useState<TimelineId>(initialTimeline);
  const [isGloballyMuted, setIsGloballyMuted] = useState(false);
  const [state, setState] = useState<VideoSyncState>({
    currentTime: 0,
    duration: TIMELINES[initialTimeline].duration,
    isPlaying: false,
    isBuffering: false,
    progress: 0,
  });

  // Create refs for all timeline videos
  const catchRef = useRef<HTMLVideoElement>(null);
  const skyRef = useRef<HTMLVideoElement>(null);
  const sharedRef = useRef<HTMLVideoElement>(null);
  const tangledRef = useRef<HTMLVideoElement>(null);

  // Ref to store video ended callbacks
  const endedCallbacksRef = useRef<Set<(timelineId: TimelineId) => void>>(new Set());

  const videoRefs: Record<TimelineId, React.RefObject<HTMLVideoElement | null>> = useMemo(() => ({
    catch: catchRef,
    sky: skyRef,
    shared: sharedRef,
    tangled: tangledRef,
  }), []);

  const getActiveVideo = useCallback((): HTMLVideoElement | null => {
    return videoRefs[activeTimeline].current;
  }, [activeTimeline]);

  // Update time state from active video
  useEffect(() => {
    const video = getActiveVideo();
    if (!video) return;

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        progress: video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0,
      }));
    };

    const handleDurationChange = () => {
      setState((prev) => ({
        ...prev,
        duration: video.duration || TIMELINES[activeTimeline].duration,
      }));
    };

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleWaiting = () => {
      setState((prev) => ({ ...prev, isBuffering: true }));
    };

    const handlePlaying = () => {
      setState((prev) => ({ ...prev, isBuffering: false }));
    };

    const handleEnded = () => {
      // Call all registered ended callbacks
      endedCallbacksRef.current.forEach((callback) => {
        callback(activeTimeline);
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeTimeline, getActiveVideo]);

  // Sync all videos to the same time
  const syncAllVideos = useCallback((targetTime: number) => {
    TIMELINE_ORDER.forEach((id) => {
      const video = videoRefs[id].current;
      if (video && Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
      }
    });
  }, []);

  const play = useCallback(() => {
    const video = getActiveVideo();
    if (video) {
      video.play().catch(console.error);
      // Also play other videos muted for sync
      TIMELINE_ORDER.forEach((id) => {
        if (id !== activeTimeline) {
          const otherVideo = videoRefs[id].current;
          if (otherVideo) {
            otherVideo.muted = true;
            otherVideo.play().catch(console.error);
          }
        }
      });
    }
  }, [activeTimeline, getActiveVideo]);

  const pause = useCallback(() => {
    TIMELINE_ORDER.forEach((id) => {
      const video = videoRefs[id].current;
      if (video) {
        video.pause();
      }
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    syncAllVideos(time);
  }, [syncAllVideos]);

  const seekToProgress = useCallback((progress: number) => {
    const video = getActiveVideo();
    if (video) {
      const targetTime = (progress / 100) * video.duration;
      syncAllVideos(targetTime);
    }
  }, [getActiveVideo, syncAllVideos]);

  const setActiveTimeline = useCallback((id: TimelineId, options?: { startFromBeginning?: boolean }) => {
    const currentVideo = getActiveVideo();
    const currentTime = options?.startFromBeginning ? 0 : (currentVideo?.currentTime || 0);
    const wasPlaying = state.isPlaying;

    // Mute all videos first
    TIMELINE_ORDER.forEach((timelineId) => {
      const video = videoRefs[timelineId].current;
      if (video) {
        video.muted = true;
      }
    });

    setActiveTimelineState(id);

    // Unmute the new active video after state update (unless globally muted)
    const newVideo = videoRefs[id].current;
    if (newVideo) {
      newVideo.muted = isGloballyMuted;
      newVideo.currentTime = currentTime;
      
      if (wasPlaying) {
        // Wait for the video to be ready before playing
        const handleCanPlay = () => {
          newVideo.play().catch(() => {
            // Retry once after a short delay if it fails
            setTimeout(() => newVideo.play().catch(console.error), 100);
          });
          newVideo.removeEventListener('canplay', handleCanPlay);
        };
        
        if (newVideo.readyState >= 3) {
          newVideo.play().catch(console.error);
        } else {
          newVideo.addEventListener('canplay', handleCanPlay, { once: true });
        }
      }
    }
  }, [getActiveVideo, state.isPlaying, isGloballyMuted, videoRefs]);

  const isVideoReady = useCallback((id: TimelineId): boolean => {
    const video = videoRefs[id].current;
    return video ? video.readyState >= 3 : false;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsGloballyMuted(muted);
    TIMELINE_ORDER.forEach((id) => {
      const video = videoRefs[id].current;
      if (video) {
        if (muted) {
          video.muted = true;
        } else {
          // Unmute only the active timeline, keep others muted
          video.muted = id !== activeTimeline;
        }
      }
    });
  }, [activeTimeline, videoRefs]);

  // Register callback for when video ends
  const onVideoEnded = useCallback((callback: (timelineId: TimelineId) => void) => {
    endedCallbacksRef.current.add(callback);
    // Return cleanup function
    return () => {
      endedCallbacksRef.current.delete(callback);
    };
  }, []);

  return {
    videoRefs,
    state,
    play,
    pause,
    togglePlayPause,
    seek,
    seekToProgress,
    setActiveTimeline,
    activeTimeline,
    isVideoReady,
    setMuted,
    onVideoEnded,
  };
}

