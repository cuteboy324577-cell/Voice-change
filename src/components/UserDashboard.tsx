import React, { useState } from 'react';
import { 
  Video, Play, CheckCircle2, Clock, AlertTriangle, Download, 
  Trash2, User, CreditCard, ExternalLink, ArrowRight, Filter
} from 'lucide-react';
import { DubbingJob, User as UserType } from '../types';

interface UserDashboardProps {
  currentUser: UserType | null;
  jobs: DubbingJob[];
  onOpenEditor: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onNewDubbing: () => void;
  onOpenAuth: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  jobs,
  onOpenEditor,
  onDeleteJob,
  onNewDubbing,
  onOpenAuth,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Profile & Metrics Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-purple-500/20">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentUser?.name || 'Creator Studio'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 uppercase">
                  {currentUser?.plan || 'PRO'} Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || 'creator@tamildub.ai'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Credits Remaining
              </span>
              <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                {currentUser?.creditsRemainingMinutes || 185} <span className="text-xs font-normal text-slate-500">mins</span>
              </span>
            </div>

            <div className="pl-6">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Dubbed
              </span>
              <span className="text-xl font-bold text-purple-600 font-mono tabular-nums">
                {currentUser?.totalDubbedMinutes || 420} <span className="text-xs font-normal text-slate-500">mins</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects & Jobs Section */}
      <div className="space-y-4">
        {/* Controls Bar: Filters & New Video Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Dubbing Projects & History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your dubbed videos, subtitles, and exported tracks
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {(['all', 'completed', 'processing', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={onNewDubbing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>New Dubbing</span>
            </button>
          </div>
        </div>

        {/* Jobs List / Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No videos in this view</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start a new dubbing project by submitting an authorized YouTube video URL or uploading an MP4 file.
              </p>
              <button
                onClick={onNewDubbing}
                className="mt-2 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg"
              >
                Create First Dubbing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredJobs.map((job) => {
                const isCompleted = job.status === 'completed';
                const isProcessing = job.status === 'processing';

                return (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-inner">
                        <img
                          src={job.thumbnailUrl}
                          alt={job.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/80 text-white text-[9px] font-mono rounded">
                          0:{job.duration}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-md">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-purple-600 uppercase">
                            {job.sourceLanguage} → Tamil
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{job.segments.length} lines</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{job.fileSizeMb} MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge & Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : isProcessing ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Step {job.currentStepIndex + 1}/17
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}

                      <button
                        onClick={() => onOpenEditor(job.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                      >
                        <span>Open Editor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
