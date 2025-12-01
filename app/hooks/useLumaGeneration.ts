'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { TimelineId } from '../types/timeline.types';

interface LumaGeneration {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  failure_reason?: string;
  created_at: string;
  assets?: {
    video?: string;
  };
}

interface GenerationProgress {
  timelineId: TimelineId;
  generationId: string;
  state: LumaGeneration['state'];
  videoUrl?: string;
  error?: string;
}

interface UseLumaGenerationReturn {
  generate: (prompt: string, timelineId: TimelineId) => Promise<void>;
  checkStatus: (generationId: string, timelineId: TimelineId) => Promise<LumaGeneration>;
  generations: Record<TimelineId, GenerationProgress | null>;
  isGenerating: boolean;
}

const TIMELINE_PROMPTS: Record<TimelineId, string> = {
  catch: `A cinematic shot of a child's red balloon slipping from their hand in a park. A kind stranger nearby notices and reaches out, catching the balloon string just in time. The child's face lights up with relief and gratitude. Golden hour lighting, soft focus background, 4K quality.`,
  sky: `A cinematic shot of a child's red balloon slipping from their hand and floating upward into a bright blue sky. The balloon becomes smaller and smaller, a tiny red dot against white clouds. The child watches with bittersweet wonder. Golden hour lighting, 4K quality.`,
  shared: `A cinematic shot of a child's red balloon slipping from their hand in a park. Another young child nearby catches the drifting balloon, and the two children share a moment of connection, leading to an unexpected friendship forming. Warm, joyful lighting, 4K quality.`,
  tangled: `A cinematic shot of a child's red balloon slipping from their hand. The balloon's string catches on a street performer's juggling props, creating a colorful chain reaction of chaos. The performer incorporates the balloon into their act as onlookers laugh. Whimsical lighting, 4K quality.`,
};

export function useLumaGeneration(): UseLumaGenerationReturn {
  const [generations, setGenerations] = useState<Record<TimelineId, GenerationProgress | null>>({
    catch: null,
    sky: null,
    shared: null,
    tangled: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (prompt: string, timelineId: TimelineId) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || TIMELINE_PROMPTS[timelineId],
          aspect_ratio: '16:9',
          loop: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start generation');
      }

      const data: LumaGeneration = await response.json();

      setGenerations((prev) => ({
        ...prev,
        [timelineId]: {
          timelineId,
          generationId: data.id,
          state: data.state,
        },
      }));

      toast.success(`Started generating "${timelineId}" timeline`);

      // Start polling for status
      pollStatus(data.id, timelineId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      toast.error(message);
      
      setGenerations((prev) => ({
        ...prev,
        [timelineId]: {
          timelineId,
          generationId: '',
          state: 'failed',
          error: message,
        },
      }));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const checkStatus = useCallback(async (generationId: string, timelineId: TimelineId) => {
    try {
      const response = await fetch(`/api/generate-video?id=${generationId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check status');
      }

      const data: LumaGeneration = await response.json();

      setGenerations((prev) => ({
        ...prev,
        [timelineId]: {
          timelineId,
          generationId: data.id,
          state: data.state,
          videoUrl: data.assets?.video,
          error: data.failure_reason,
        },
      }));

      if (data.state === 'completed' && data.assets?.video) {
        toast.success(`"${timelineId}" timeline is ready!`);
      } else if (data.state === 'failed') {
        toast.error(`Generation failed: ${data.failure_reason}`);
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Status check failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const pollStatus = useCallback(async (generationId: string, timelineId: TimelineId) => {
    const maxAttempts = 60; // 5 minutes with 5 second intervals
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        toast.error('Generation timed out');
        return;
      }

      try {
        const response = await fetch(`/api/generate-video?id=${generationId}`);
        const data: LumaGeneration = await response.json();

        setGenerations((prev) => ({
          ...prev,
          [timelineId]: {
            timelineId,
            generationId: data.id,
            state: data.state,
            videoUrl: data.assets?.video,
            error: data.failure_reason,
          },
        }));

        if (data.state === 'completed') {
          toast.success(`"${timelineId}" timeline is ready!`);
          return;
        }

        if (data.state === 'failed') {
          toast.error(`Generation failed: ${data.failure_reason}`);
          return;
        }

        // Continue polling
        attempts++;
        setTimeout(poll, 5000);
      } catch (error) {
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  }, []);

  return {
    generate,
    checkStatus,
    generations,
    isGenerating,
  };
}

// Generate all timelines at once
export function generateAllTimelines(
  generate: (prompt: string, timelineId: TimelineId) => Promise<void>
) {
  const timelineIds: TimelineId[] = ['catch', 'sky', 'shared', 'tangled'];
  
  timelineIds.forEach((id, index) => {
    // Stagger the requests to avoid rate limiting
    setTimeout(() => {
      generate(TIMELINE_PROMPTS[id], id);
    }, index * 2000);
  });
}

// Export prompts for manual use
export { TIMELINE_PROMPTS };

