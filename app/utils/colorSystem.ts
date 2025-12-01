import { TimelineId } from '../types/timeline.types';
import { TIMELINES } from '../constants/timelines';

// Get the primary color for a timeline
export function getTimelineColor(timelineId: TimelineId): string {
  return TIMELINES[timelineId].color;
}

// Get the accent color for a timeline
export function getTimelineAccent(timelineId: TimelineId): string {
  return TIMELINES[timelineId].accentColor;
}

// Generate a gradient between two timeline colors for transitions
export function getTransitionGradient(from: TimelineId, to: TimelineId): string {
  const fromColor = TIMELINES[from].color;
  const toColor = TIMELINES[to].color;
  return `linear-gradient(135deg, ${fromColor}, ${toColor})`;
}

// Get CSS custom properties for a timeline
export function getTimelineCSSVars(timelineId: TimelineId): Record<string, string> {
  const timeline = TIMELINES[timelineId];
  return {
    '--timeline-color': timeline.color,
    '--timeline-accent': timeline.accentColor,
    '--timeline-color-10': `${timeline.color}1A`, // 10% opacity
    '--timeline-color-20': `${timeline.color}33`, // 20% opacity
    '--timeline-color-50': `${timeline.color}80`, // 50% opacity
  };
}

// Generate glow effect CSS
export function getTimelineGlow(timelineId: TimelineId, intensity: number = 0.5): string {
  const color = TIMELINES[timelineId].color;
  return `0 0 ${20 * intensity}px ${color}40, 0 0 ${40 * intensity}px ${color}20`;
}

// Get color for memory map node based on visit status
export function getMemoryNodeColor(
  timelineId: TimelineId,
  isVisited: boolean,
  isActive: boolean
): string {
  const color = TIMELINES[timelineId].color;
  
  if (isActive) {
    return color;
  }
  if (isVisited) {
    return `${color}99`; // 60% opacity
  }
  return `${color}33`; // 20% opacity - unvisited
}

// Generate border color with optional pulse for active state
export function getTimelineBorder(
  timelineId: TimelineId,
  isActive: boolean
): string {
  const color = TIMELINES[timelineId].color;
  return isActive ? color : `${color}40`;
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Interpolate between two colors
export function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
  
  return rgbToHex(r, g, b);
}

// Get contrasting text color (white or black) based on background
export function getContrastText(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#FFFFFF';
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#09090B' : '#FAFAFA';
}



