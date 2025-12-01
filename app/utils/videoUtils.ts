import type { TimelineId, VideoRef } from '../types/timeline.types';
import { TIMELINES } from '../constants/timelines';

// Format time as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format time as MM:SS.ms for precision display
export function formatTimePrecise(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

// Calculate progress percentage
export function calculateProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}

// Get video source URL with optional timestamp
export function getVideoUrl(timelineId: TimelineId, startTime?: number): string {
  const baseUrl = TIMELINES[timelineId].videoUrl;
  if (startTime !== undefined && startTime > 0) {
    return `${baseUrl}#t=${startTime}`;
  }
  return baseUrl;
}

// Preload video
export async function preloadVideo(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = url;
    
    video.oncanplaythrough = () => {
      resolve();
    };
    
    video.onerror = () => {
      reject(new Error(`Failed to preload video: ${url}`));
    };
  });
}

// Preload all timeline videos
export async function preloadAllTimelines(): Promise<void> {
  const urls = Object.values(TIMELINES).map((t) => t.videoUrl);
  await Promise.all(urls.map(preloadVideo));
}

// Sync multiple video elements to the same timestamp
export function syncVideos(
  videos: VideoRef[],
  targetTime: number,
  tolerance: number = 0.1
): void {
  videos.forEach(({ element }) => {
    if (element && Math.abs(element.currentTime - targetTime) > tolerance) {
      element.currentTime = targetTime;
    }
  });
}

// Check if video is ready to play
export function isVideoReady(video: HTMLVideoElement): boolean {
  return video.readyState >= 3; // HAVE_FUTURE_DATA or higher
}

// Get video metadata
export function getVideoMetadata(video: HTMLVideoElement) {
  return {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    currentTime: video.currentTime,
    buffered: video.buffered.length > 0
      ? {
          start: video.buffered.start(0),
          end: video.buffered.end(video.buffered.length - 1),
        }
      : null,
  };
}

// Calculate buffered percentage
export function getBufferedPercentage(video: HTMLVideoElement): number {
  if (video.buffered.length === 0) return 0;
  const bufferedEnd = video.buffered.end(video.buffered.length - 1);
  return (bufferedEnd / video.duration) * 100;
}

// Smooth seek with optional callback
export function smoothSeek(
  video: HTMLVideoElement,
  targetTime: number,
  onComplete?: () => void
): void {
  video.currentTime = targetTime;
  
  if (onComplete) {
    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked);
      onComplete();
    };
    video.addEventListener('seeked', handleSeeked);
  }
}

// Create video thumbnail at specific time
export async function createVideoThumbnail(
  videoUrl: string,
  time: number,
  width: number = 160,
  height: number = 90
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    
    video.onloadeddata = () => {
      video.currentTime = time;
    };
    
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
}

// Check if browser supports specific video format
export function supportsVideoFormat(mimeType: string): boolean {
  const video = document.createElement('video');
  return video.canPlayType(mimeType) !== '';
}

// Get optimal video source based on browser support
export function getOptimalVideoSource(timelineId: TimelineId): string {
  // For now, just return MP4. Could be extended to support WebM, etc.
  return TIMELINES[timelineId].videoUrl;
}


