// Timeline Types for Parallel Worlds Viewer

export type TimelineId = 'catch' | 'sky' | 'shared' | 'tangled';

export type TimelinePosition = 'north' | 'east' | 'south' | 'west';

export interface Timeline {
  id: TimelineId;
  name: string;
  description: string;
  position: TimelinePosition;
  color: string;
  accentColor: string;
  videoUrl: string;
  audioSignature?: string;
  duration: number; // in seconds
}

export interface TimelineState {
  activeTimeline: TimelineId;
  previousTimeline: TimelineId | null;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}

export interface NavigationEvent {
  from: TimelineId;
  to: TimelineId;
  timestamp: number;
  direction: TimelinePosition;
}

export interface TransitionConfig {
  duration: number;
  easing: string;
  type: 'crossfade' | 'swipe' | 'zoom' | 'morph';
}

export interface ViewMode {
  type: 'single' | 'quad' | 'memory-map';
  focusedTimeline?: TimelineId;
}

export interface MemoryMapState {
  visitedTimelines: Set<TimelineId>;
  currentPath: NavigationEvent[];
  explorationPercentage: number;
}

export interface VideoRef {
  element: HTMLVideoElement | null;
  isReady: boolean;
  isBuffering: boolean;
}

export interface AudioState {
  ambient: boolean;
  transitions: boolean;
  signatures: boolean;
  masterVolume: number;
}

// Decision point where timelines diverge
export interface DecisionPoint {
  timestamp: number;
  description: string;
  divergingTimelines: TimelineId[];
}

// User preferences stored in localStorage
export interface UserPreferences {
  preferredViewMode: ViewMode['type'];
  audioSettings: AudioState;
  autoplayEnabled: boolean;
  showNavigationHints: boolean;
  reducedMotion: boolean;
}

