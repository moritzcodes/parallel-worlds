'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import type { TimelineId, VideoRef } from '../types/timeline.types';
import { TIMELINES, TIMELINE_ORDER } from '../constants/timelines';

interface VideoSyncState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isBuffering: boolean;
  progress: number;
}

interface UseVideoSyncReturn {
  videoRefs: Record<TimelineId, React.RefObject<HTMLVideoElement | null>>;
  state: VideoSyncState;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  seekToProgress: (progress: number) => void;
  setActiveTimeline: (id: TimelineId) => void;
  activeTimeline: TimelineId;
  isVideoReady: (id: TimelineId) => boolean;
}

export function useVideoSync(initialTimeline: TimelineId = 'catch'): UseVideoSyncReturn {
  const [activeTimeline, setActiveTimelineState] = useState<TimelineId>(initialTimeline);
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

  const videoRefs: Record<TimelineId, React.RefObject<HTMLVideoElement | null>> = {
    catch: catchRef,
    sky: skyRef,
    shared: sharedRef,
    tangled: tangledRef,
  };

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

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
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

  const setActiveTimeline = useCallback((id: TimelineId) => {
    const currentVideo = getActiveVideo();
    const currentTime = currentVideo?.currentTime || 0;
    const wasPlaying = state.isPlaying;

    // Mute all videos first
    TIMELINE_ORDER.forEach((timelineId) => {
      const video = videoRefs[timelineId].current;
      if (video) {
        video.muted = true;
      }
    });

    setActiveTimelineState(id);

    // Unmute the new active video after state update
    setTimeout(() => {
      const newVideo = videoRefs[id].current;
      if (newVideo) {
        newVideo.muted = false;
        newVideo.currentTime = currentTime;
        if (wasPlaying) {
          newVideo.play().catch(console.error);
        }
      }
    }, 0);
  }, [getActiveVideo, state.isPlaying]);

  const isVideoReady = useCallback((id: TimelineId): boolean => {
    const video = videoRefs[id].current;
    return video ? video.readyState >= 3 : false;
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
  };
}

