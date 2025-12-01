'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import type { TimelineId, AudioState } from '../types/timeline.types';
import { TIMELINES } from '../constants/timelines';

interface UseAudioManagerReturn {
  playTransition: () => void;
  playTimelineSignature: (timelineId: TimelineId) => void;
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

  // Audio instance refs
  const ambientRef = useRef<Howl | null>(null);
  const transitionRef = useRef<Howl | null>(null);
  const signatureRefs = useRef<Record<TimelineId, Howl | null>>({
    catch: null,
    sky: null,
    shared: null,
    tangled: null,
  });

  // Initialize ambient audio
  useEffect(() => {
    ambientRef.current = new Howl({
      src: ['/audio/ambient.mp3'],
      loop: true,
      volume: audioState.ambient ? audioState.masterVolume * 0.3 : 0,
      autoplay: false,
    });

    transitionRef.current = new Howl({
      src: ['/audio/transition.mp3'],
      volume: audioState.masterVolume * 0.5,
    });

    // Initialize timeline signatures
    Object.entries(TIMELINES).forEach(([id, timeline]) => {
      if (timeline.audioSignature) {
        signatureRefs.current[id as TimelineId] = new Howl({
          src: [timeline.audioSignature],
          volume: audioState.masterVolume * 0.4,
        });
      }
    });

    return () => {
      ambientRef.current?.unload();
      transitionRef.current?.unload();
      Object.values(signatureRefs.current).forEach((howl) => howl?.unload());
    };
  }, []);

  // Update volumes when master volume changes
  useEffect(() => {
    Howler.volume(isMuted ? 0 : audioState.masterVolume);
  }, [audioState.masterVolume, isMuted]);

  const playTransition = useCallback(() => {
    if (audioState.transitions && transitionRef.current) {
      transitionRef.current.play();
    }
  }, [audioState.transitions]);

  const playTimelineSignature = useCallback((timelineId: TimelineId) => {
    if (audioState.signatures && signatureRefs.current[timelineId]) {
      signatureRefs.current[timelineId]?.play();
    }
  }, [audioState.signatures]);

  const setAmbientVolume = useCallback((volume: number) => {
    if (ambientRef.current) {
      ambientRef.current.volume(volume);
    }
  }, []);

  const toggleAmbient = useCallback(() => {
    setAudioState((prev) => {
      const newAmbient = !prev.ambient;
      if (ambientRef.current) {
        if (newAmbient) {
          ambientRef.current.play();
          ambientRef.current.volume(prev.masterVolume * 0.3);
        } else {
          ambientRef.current.pause();
        }
      }
      return { ...prev, ambient: newAmbient };
    });
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

