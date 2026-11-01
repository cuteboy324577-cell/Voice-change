import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Video, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { DubbingJob } from '../types';

interface PipelineTrackerModalProps {
  job: DubbingJob | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditor: (jobId: string) => void;
}

export const PipelineTrackerModal: React.FC<PipelineTrackerModalProps> = ({
  job,
  isOpen,
  onClose,
  onOpenEditor,
}) => {
  if (!isOpen || !job) return null;

  const isCompleted = job.status === 'completed' || job.progress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                17-Step AI Dubbing Pipeline
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                {job.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-700 flex items-center gap-1.5">
              {isCompleted ? (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Rendering Complete
                </span>
              ) : (
                <span className="text-purple-600 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Step {job.currentStepIndex + 1} of 17
                </span>
              )}
            </span>
            <span className="font-mono tabular-nums text-slate-900 font-bold">{job.progress}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {job.steps.map((step, idx) => {
            const isDone = step.status === 'completed' || idx < job.currentStepIndex;
            const isCurrent = idx === job.currentStepIndex && !isCompleted;

            return (
              <div
                key={step.stepNumber}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-purple-50/60 border-purple-200'
                    : isDone
                    ? 'bg-white border-slate-100'
                    : 'bg-slate-50/40 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        STEP {step.stepNumber}: {step.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{step.description}</p>
                  </div>
                </div>

                {isDone && (
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                    {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : '0.8s'}
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[11px] font-semibold text-purple-600 animate-pulse shrink-0">
                    Processing
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isCompleted ? 'Video ready for editing and download.' : 'Processing runs on GPU accelerated workers.'}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {isCompleted && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditor(job.id);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Open in Dubbing Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
