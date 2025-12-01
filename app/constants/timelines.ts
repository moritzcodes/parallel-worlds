import type { Timeline, TimelineId, TransitionConfig, DecisionPoint } from '../types/timeline.types';

// The four parallel timelines diverging from the balloon moment
export const TIMELINES: Record<TimelineId, Timeline> = {
  catch: {
    id: 'catch',
    name: 'The Catch',
    description: 'A stranger reaches out and catches the balloon string just in time',
    position: 'north',
    color: '#10B981', // Emerald green - hope, intervention
    accentColor: '#34D399',
    videoUrl: '/videos/catch.mp4',
    audioSignature: '/audio/timeline-signatures/catch.mp3',
    duration: 15,
  },
  sky: {
    id: 'sky',
    name: 'Into the Sky',
    description: 'The balloon drifts upward, becoming a tiny red dot against the clouds',
    position: 'east',
    color: '#3B82F6', // Blue - sky, freedom, melancholy
    accentColor: '#60A5FA',
    videoUrl: '/videos/sky.mp4',
    audioSignature: '/audio/timeline-signatures/sky.mp3',
    duration: 15,
  },
  shared: {
    id: 'shared',
    name: 'Shared Joy',
    description: 'Another child catches the balloon, creating an unexpected friendship',
    position: 'south',
    color: '#F59E0B', // Amber - warmth, connection
    accentColor: '#FBBF24',
    videoUrl: '/videos/shared.mp4',
    audioSignature: '/audio/timeline-signatures/shared.mp3',
    duration: 15,
  },
  tangled: {
    id: 'tangled',
    name: 'Tangled Fate',
    description: 'The string catches on a street performer\'s props, creating chaos',
    position: 'west',
    color: '#EC4899', // Pink - chaos, unexpected
    accentColor: '#F472B6',
    videoUrl: '/videos/tangled.mp4',
    audioSignature: '/audio/timeline-signatures/tangled.mp3',
    duration: 15,
  },
};

// Navigation mappings - which timeline is in which direction from each other
export const NAVIGATION_MAP: Record<TimelineId, Record<'north' | 'east' | 'south' | 'west', TimelineId>> = {
  catch: {
    north: 'catch', // Self - staying on current timeline
    east: 'sky',
    south: 'shared',
    west: 'tangled',
  },
  sky: {
    north: 'catch',
    east: 'sky',
    south: 'tangled',
    west: 'shared',
  },
  shared: {
    north: 'catch',
    east: 'tangled',
    south: 'shared',
    west: 'sky',
  },
  tangled: {
    north: 'catch',
    east: 'shared',
    south: 'sky',
    west: 'tangled',
  },
};

// Default transition configuration
export const DEFAULT_TRANSITION: TransitionConfig = {
  duration: 0.6,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  type: 'crossfade',
};

// The moment of divergence
export const DECISION_POINT: DecisionPoint = {
  timestamp: 0,
  description: "The child's grip loosens on the balloon string...",
  divergingTimelines: ['catch', 'sky', 'shared', 'tangled'],
};

// Timeline order for quad view
export const TIMELINE_ORDER: TimelineId[] = ['catch', 'sky', 'shared', 'tangled'];

// Color system for UI elements
export const UI_COLORS = {
  background: {
    primary: '#09090B', // Near black
    secondary: '#18181B',
    tertiary: '#27272A',
  },
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    muted: '#71717A',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.2)',
  },
  glass: {
    background: 'rgba(9, 9, 11, 0.8)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  playPause: ' ',
  navigateNorth: 'ArrowUp',
  navigateEast: 'ArrowRight',
  navigateSouth: 'ArrowDown',
  navigateWest: 'ArrowLeft',
  toggleMute: 'm',
  toggleView: 'v',
  toggleFullscreen: 'f',
};

