'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, X, Download, RefreshCw } from 'lucide-react';
import { useLumaGeneration, TIMELINE_PROMPTS, generateAllTimelines } from '../hooks/useLumaGeneration';
import type { TimelineId } from '../types/timeline.types';
import { TIMELINES, TIMELINE_ORDER } from '../constants/timelines';
import clsx from 'clsx';

interface VideoGeneratorProps {
  onClose?: () => void;
}

export function VideoGenerator({ onClose }: VideoGeneratorProps) {
  const { generate, generations, isGenerating } = useLumaGeneration();
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineId | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerateAll = () => {
    generateAllTimelines(generate);
  };

  const handleGenerateSingle = () => {
    if (selectedTimeline) {
      generate(customPrompt || TIMELINE_PROMPTS[selectedTimeline], selectedTimeline);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Video Generator</h2>
              <p className="text-sm text-zinc-400">Generate timeline videos with Luma AI</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timeline selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Select Timeline
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TIMELINE_ORDER.map((id) => {
                const timeline = TIMELINES[id];
                const generation = generations[id];
                const isSelected = selectedTimeline === id;

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedTimeline(id)}
                    className={clsx(
                      'relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                      isSelected
                        ? 'border-white/20 bg-white/10'
                        : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8'
                    )}
                  >
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: timeline.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{timeline.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{timeline.description}</p>
                    </div>

                    {/* Status indicator */}
                    {generation && (
                      <div className="flex-shrink-0">
                        {generation.state === 'queued' && (
                          <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                          </div>
                        )}
                        {generation.state === 'dreaming' && (
                          <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                        )}
                        {generation.state === 'completed' && (
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="h-3 w-3 text-emerald-400" />
                          </div>
                        )}
                        {generation.state === 'failed' && (
                          <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <X className="h-3 w-3 text-red-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom prompt */}
          <AnimatePresence>
            {selectedTimeline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="mb-2 block text-sm font-medium text-white">
                  Prompt (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={TIMELINE_PROMPTS[selectedTimeline]}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none resize-none h-24"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generation progress */}
          {Object.values(generations).some(g => g) && (
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <h3 className="mb-3 text-sm font-medium text-white">Generation Status</h3>
              <div className="space-y-2">
                {TIMELINE_ORDER.map((id) => {
                  const generation = generations[id];
                  if (!generation) return null;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: TIMELINES[id].color }}
                        />
                        <span className="text-sm text-white">{TIMELINES[id].name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'text-xs capitalize',
                          generation.state === 'completed' && 'text-emerald-400',
                          generation.state === 'failed' && 'text-red-400',
                          generation.state === 'dreaming' && 'text-blue-400',
                          generation.state === 'queued' && 'text-yellow-400'
                        )}>
                          {generation.state}
                        </span>
                        {generation.videoUrl && (
                          <a
                            href={generation.videoUrl}
                            download
                            className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 p-6">
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-4 w-4', isGenerating && 'animate-spin')} />
            Generate All
          </button>

          <button
            onClick={handleGenerateSingle}
            disabled={!selectedTimeline || isGenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Timeline
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Button to open generator
export function GeneratorButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-2 text-sm text-white transition-all hover:from-blue-500/30 hover:to-purple-500/30"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Sparkles className="h-4 w-4" />
      Generate Videos
    </motion.button>
  );
}

