'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  TimelineId,
  TimelinePosition,
  NavigationEvent,
  MemoryMapState,
} from '../types/timeline.types';
import { NAVIGATION_MAP, KEYBOARD_SHORTCUTS, TIMELINES } from '../constants/timelines';

interface UseTimelineNavigationReturn {
  activeTimeline: TimelineId;
  previousTimeline: TimelineId | null;
  navigateTo: (direction: TimelinePosition) => void;
  navigateToTimeline: (timelineId: TimelineId) => void;
  memoryMap: MemoryMapState;
  navigationHistory: NavigationEvent[];
  canNavigate: (direction: TimelinePosition) => boolean;
  getTimelineInDirection: (direction: TimelinePosition) => TimelineId;
  resetNavigation: () => void;
}

export function useTimelineNavigation(
  initialTimeline: TimelineId = 'catch',
  onNavigate?: (event: NavigationEvent) => void
): UseTimelineNavigationReturn {
  const [activeTimeline, setActiveTimeline] = useState<TimelineId>(initialTimeline);
  const [previousTimeline, setPreviousTimeline] = useState<TimelineId | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<NavigationEvent[]>([]);
  const [memoryMap, setMemoryMap] = useState<MemoryMapState>({
    visitedTimelines: new Set<TimelineId>([initialTimeline]),
    currentPath: [],
    explorationPercentage: 25, // Starting with one timeline = 25%
  });

  const getTimelineInDirection = useCallback(
    (direction: TimelinePosition): TimelineId => {
      return NAVIGATION_MAP[activeTimeline][direction];
    },
    [activeTimeline]
  );

  const canNavigate = useCallback(
    (direction: TimelinePosition): boolean => {
      const targetTimeline = getTimelineInDirection(direction);
      return targetTimeline !== activeTimeline;
    },
    [activeTimeline, getTimelineInDirection]
  );

  const navigateTo = useCallback(
    (direction: TimelinePosition) => {
      const targetTimeline = getTimelineInDirection(direction);
      
      if (targetTimeline === activeTimeline) {
        return; // Already on this timeline
      }

      const navEvent: NavigationEvent = {
        from: activeTimeline,
        to: targetTimeline,
        timestamp: Date.now(),
        direction,
      };

      setPreviousTimeline(activeTimeline);
      setActiveTimeline(targetTimeline);
      setNavigationHistory((prev) => [...prev, navEvent]);

      // Update memory map
      setMemoryMap((prev) => {
        const newVisited = new Set(prev.visitedTimelines);
        newVisited.add(targetTimeline);
        
        return {
          visitedTimelines: newVisited,
          currentPath: [...prev.currentPath, navEvent],
          explorationPercentage: (newVisited.size / 4) * 100,
        };
      });

      onNavigate?.(navEvent);
    },
    [activeTimeline, getTimelineInDirection, onNavigate]
  );

  const navigateToTimeline = useCallback(
    (timelineId: TimelineId) => {
      if (timelineId === activeTimeline) return;

      // Find direction for this timeline
      const directions: TimelinePosition[] = ['north', 'east', 'south', 'west'];
      const direction = directions.find(
        (d) => NAVIGATION_MAP[activeTimeline][d] === timelineId
      ) || 'north';

      navigateTo(direction);
    },
    [activeTimeline, navigateTo]
  );

  const resetNavigation = useCallback(() => {
    setActiveTimeline(initialTimeline);
    setPreviousTimeline(null);
    setNavigationHistory([]);
    setMemoryMap({
      visitedTimelines: new Set<TimelineId>([initialTimeline]),
      currentPath: [],
      explorationPercentage: 25,
    });
  }, [initialTimeline]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.navigateNorth:
          e.preventDefault();
          navigateTo('north');
          break;
        case KEYBOARD_SHORTCUTS.navigateEast:
          e.preventDefault();
          navigateTo('east');
          break;
        case KEYBOARD_SHORTCUTS.navigateSouth:
          e.preventDefault();
          navigateTo('south');
          break;
        case KEYBOARD_SHORTCUTS.navigateWest:
          e.preventDefault();
          navigateTo('west');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo]);

  return {
    activeTimeline,
    previousTimeline,
    navigateTo,
    navigateToTimeline,
    memoryMap,
    navigationHistory,
    canNavigate,
    getTimelineInDirection,
    resetNavigation,
  };
}



