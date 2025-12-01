'use client';

import { useCallback, useState } from 'react';
import type { AudioState } from '../types/timeline.types';

interface UseAudioManagerReturn {
  playTransition: () => void;
  playTimelineSignature: (timelineId: string) => void;
  setAmbientVolume: (volume: number) => void;
  toggleAmbient: () => void;
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  audioState: AudioState;
  isMuted: boolean;
}

export function useAudioManager(): UseAudioManagerReturn {
  const [audioState, setAudioState] = useState<AudioState>({
    ambient: true,
    transitions: true,
    signatures: true,
    masterVolume: 0.7,
  });
  const [isMuted, setIsMuted] = useState(false);

  // No-op functions since videos have native audio
  const playTransition = useCallback(() => {
    // Videos handle transitions natively
  }, []);

  const playTimelineSignature = useCallback((_timelineId: string) => {
    // Videos handle audio natively
  }, []);

  const setAmbientVolume = useCallback((_volume: number) => {
    // Not needed for native video audio
  }, []);

  const toggleAmbient = useCallback(() => {
    // Not needed for native video audio
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setAudioState((prev) => ({ ...prev, masterVolume: volume }));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    playTransition,
    playTimelineSignature,
    setAmbientVolume,
    toggleAmbient,
    setMasterVolume,
    toggleMute,
    audioState,
    isMuted,
  };
}

