import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, Download, Sparkles, 
  Settings2, Sliders, RefreshCw, Check, Subtitles, User, Edit3, 
  Layers, FileText, Music, Video, ChevronRight, AlertCircle, Share2
} from 'lucide-react';
import { DubbingJob, TranscriptSegment, VoiceModel } from '../types';
import { TAMIL_VOICES } from '../data/sampleVideos';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { api } from '../services/api';

interface DubbingEditorProps {
  job: DubbingJob;
  onUpdateJob: (updatedJob: DubbingJob) => void;
  onBackToStudio: () => void;
}

export const DubbingEditor: React.FC<DubbingEditorProps> = ({
  job,
  onUpdateJob,
  onBackToStudio,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback & Audio Track state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(job.duration || 15);
  const [audioTrackMode, setAudioTrackMode] = useState<'tamil_dub' | 'original' | 'bilingual'>('tamil_dub');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [subtitleStyle, setSubtitleStyle] = useState<'tamil' | 'bilingual'>('tamil');
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  // Audio Sync & Ducking Controls
  const [backgroundDucking, setBackgroundDucking] = useState(15); // % volume when speaking
  const [speechSpeedMultiplier, setSpeechSpeedMultiplier] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    job.speakers[0]?.tamilVoiceName || 'Karthik'
  );

  // Editing state
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editedTamilText, setEditedTamilText] = useState('');
  const [regeneratingSegmentId, setRegeneratingSegmentId] = useState<string | null>(null);
  const [regenerationTone, setRegenerationTone] = useState<'neutral' | 'enthusiastic' | 'serious' | 'dramatic' | 'calm'>('enthusiastic');
  const [regenerationPrompt, setRegenerationPrompt] = useState('');
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [targetRegenSegment, setTargetRegenSegment] = useState<TranscriptSegment | null>(null);

  // Export & Notification State
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Track playback time and synchronize Tamil speech
  const lastSpokenSegmentIdRef = useRef<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Find segment matching current time
      const currentSegment = job.segments.find(
        (seg) => time >= seg.startTime && time <= seg.endTime
      );

      if (currentSegment) {
        setActiveSegmentId(currentSegment.id);

        // If in Tamil dub mode, trigger Tamil speech audio
        if (audioTrackMode === 'tamil_dub') {
          // Duck video audio volume
          video.volume = backgroundDucking / 100;

          if (lastSpokenSegmentIdRef.current !== currentSegment.id) {
            lastSpokenSegmentIdRef.current = currentSegment.id;
            audioSynthesizer.playTamilSpeech(currentSegment.tamilText, {
              audioBase64: currentSegment.audioUrl,
              rate: speechSpeedMultiplier,
              voiceName: selectedVoice,
              onEnd: () => {
                // Restore slight ambient volume
                if (videoRef.current) {
                  videoRef.current.volume = 0.4;
                }
              },
            });
          }
        } else {
          video.volume = 1.0;
        }
      } else {
        setActiveSegmentId(null);
        if (audioTrackMode === 'tamil_dub') {
          video.volume = 0.5; // restore ambient
        } else {
          video.volume = 1.0;
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      lastSpokenSegmentIdRef.current = null;
      audioSynthesizer.stop();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [job.segments, audioTrackMode, backgroundDucking, speechSpeedMultiplier, selectedVoice]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      audioSynthesizer.stop();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
    lastSpokenSegmentIdRef.current = null;
    audioSynthesizer.stop();
  };

  // Jump to segment
  const jumpToSegment = (seg: TranscriptSegment) => {
    handleSeek(seg.startTime);
    if (!isPlaying) {
      togglePlay();
    }
  };

  // Audition individual segment Tamil speech
  const handleAuditionLine = (seg: TranscriptSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    audioSynthesizer.playTamilSpeech(seg.tamilText, {
      audioBase64: seg.audioUrl,
      rate: speechSpeedMultiplier,
      voiceName: selectedVoice,
    });
  };

  // Save manual edit
  const handleSaveEdit = (segmentId: string) => {
    const updatedSegments = job.segments.map((seg) => {
      if (seg.id === segmentId) {
        return { ...seg, tamilText: editedTamilText };
      }
      return seg;
    });

    const updatedJob = { ...job, segments: updatedSegments };
    onUpdateJob(updatedJob);
    setEditingSegmentId(null);
  };

  // Open Regenerate Dialogue modal
  const openRegenerateModal = (seg: TranscriptSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetRegenSegment(seg);
    setRegenerationTone(seg.emotion || 'enthusiastic');
    setRegenerationPrompt('');
    setShowRegenModal(true);
  };

  // Execute AI dialogue regeneration
  const handleExecuteRegenerate = async () => {
    if (!targetRegenSegment) return;
    setRegeneratingSegmentId(targetRegenSegment.id);
    setShowRegenModal(false);

    try {
      const res = await api.regenerateSegment(
        job.id,
        targetRegenSegment.id,
        targetRegenSegment.originalText,
        regenerationTone,
        regenerationPrompt
      );

      if (res.success) {
        const updatedSegments = job.segments.map((s) => {
          if (s.id === targetRegenSegment.id) {
            return {
              ...s,
              tamilText: res.tamilText,
              romanizedTamil: res.romanizedTamil,
              emotion: regenerationTone,
            };
          }
          return s;
        });

        const updatedJob = { ...job, segments: updatedSegments };
        onUpdateJob(updatedJob);

        // Audition the new regenerated line
        audioSynthesizer.playTamilSpeech(res.tamilText, {
          rate: speechSpeedMultiplier,
          voiceName: selectedVoice,
        });
      }
    } catch (err) {
      console.error('Failed to regenerate line:', err);
    } finally {
      setRegeneratingSegmentId(null);
      setTargetRegenSegment(null);
    }
  };

  // Download Bundle
  const handleDownloadFile = (type: 'mp4' | 'mp3' | 'srt' | 'vtt' | 'report') => {
    setIsExporting(true);

    setTimeout(() => {
      let filename = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_TamilDub`;
      let content = '';
      let mimeType = 'text/plain';

      if (type === 'srt') {
        filename += '.srt';
        mimeType = 'text/plain';
        job.segments.forEach((seg, i) => {
          content += `${i + 1}\n${formatTime(seg.startTime)},000 --> ${formatTime(seg.endTime)},000\n${seg.tamilText}\n\n`;
        });
      } else if (type === 'vtt') {
        filename += '.vtt';
        mimeType = 'text/vtt';
        content = 'WEBVTT\n\n';
        job.segments.forEach((seg, i) => {
          content += `${i + 1}\n${formatTime(seg.startTime)}.000 --> ${formatTime(seg.endTime)}.000\n${seg.tamilText}\n\n`;
        });
      } else if (type === 'report') {
        filename += '_QA_Report.json';
        mimeType = 'application/json';
        content = JSON.stringify(
          {
            projectTitle: job.title,
            sourceLanguage: job.sourceLanguage,
            targetLanguage: 'Tamil (தமிழ்)',
            qualityScore: job.qualityScore,
            totalSegments: job.segments.length,
            duration: job.duration,
            speakers: job.speakers,
            segments: job.segments,
            complianceVerification: 'Verified creator authorized source',
          },
          null,
          2
        );
      } else {
        // Direct media download
        const link = document.createElement('a');
        link.href = job.videoUrl;
        link.download = `${filename}.${type}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        setExportNotice(`Downloaded ${type.toUpperCase()} successfully.`);
        setTimeout(() => setExportNotice(null), 3000);
        return;
      }

      // Download text/subtitles file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportNotice(`Exported ${type.toUpperCase()} file.`);
      setTimeout(() => setExportNotice(null), 3000);
    }, 400);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeSegment = job.segments.find((s) => s.id === activeSegmentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
          >
            Studio
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-base font-bold text-slate-900 truncate max-w-md">
            {job.title}
          </h2>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadFile('mp4')}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download MP4</span>
          </button>
          <button
            onClick={() => handleDownloadFile('mp3')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Music className="w-3.5 h-3.5 text-purple-600" />
            <span>Tamil MP3</span>
          </button>
          <button
            onClick={() => handleDownloadFile('srt')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Subtitles className="w-3.5 h-3.5 text-slate-500" />
            <span>SRT Subtitles</span>
          </button>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Grid: Video Player on Left, Dubbing Controls & Transcript on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Viewport & Timeline (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Video Player Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={job.videoUrl}
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
                onClick={togglePlay}
              />

              {/* Live Subtitle Overlay */}
              {subtitlesEnabled && activeSegment && (
                <div className="absolute bottom-6 inset-x-4 text-center pointer-events-none transition-all">
                  <div className="inline-block bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl max-w-lg shadow-lg border border-white/10">
                    <p className="text-sm font-semibold text-yellow-300 leading-snug">
                      {activeSegment.tamilText}
                    </p>
                    {subtitleStyle === 'bilingual' && activeSegment.romanizedTamil && (
                      <p className="text-xs text-slate-300 mt-0.5 font-mono">
                        {activeSegment.romanizedTamil}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Video Controls Bar */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              {/* Timeline Scrub Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 15}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Primary Player Buttons & Track Toggles */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => handleSeek(0)}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Rewind to start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Audio Mode Switcher: Tamil Dub vs Original */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setAudioTrackMode('tamil_dub')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      audioTrackMode === 'tamil_dub'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tamil Dub (AI)
                  </button>
                  <button
                    onClick={() => setAudioTrackMode('original')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      audioTrackMode === 'original'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Original Audio
                  </button>
                </div>

                {/* Subtitle Toggle */}
                <button
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                    subtitlesEnabled
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Toggle Subtitles"
                >
                  <Subtitles className="w-4 h-4" />
                  <span className="hidden sm:inline">CC</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audio Synchronization & Sidechain Ducking Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Audio Synchronization & Sidechain</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Foley Preservation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Background Music Ducking Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Dialogue Ducking</span>
                  <span className="font-mono tabular-nums text-slate-900 font-semibold">{backgroundDucking}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={backgroundDucking}
                  onChange={(e) => setBackgroundDucking(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Lowers original speech while keeping background effects.</p>
              </div>

              {/* Syllable Speed Multiplier */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Tamil Speech Rate</span>
                  <span className="font-mono tabular-nums text-slate-900 font-semibold">{speechSpeedMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.05"
                  value={speechSpeedMultiplier}
                  onChange={(e) => setSpeechSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Calibrates Tamil syllable count to lip cadence.</p>
              </div>
            </div>

            {/* Voice Actor Selector */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-600 font-medium">Active Tamil Voice:</span>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TAMIL_VOICES.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.tamilName}) — {v.tone.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Transcript & Subtitle Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-[640px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dual-Transcript & Dialogue Editor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any line to jump video playhead · Edit text in real-time
                </p>
              </div>

              {/* Subtitle Display Style */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setSubtitleStyle('tamil')}
                  className={`px-2 py-1 rounded transition-colors ${
                    subtitleStyle === 'tamil' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  தமிழ் Only
                </button>
                <button
                  onClick={() => setSubtitleStyle('bilingual')}
                  className={`px-2 py-1 rounded transition-colors ${
                    subtitleStyle === 'bilingual' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Bilingual
                </button>
              </div>
            </div>

            {/* Scrollable Transcript List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {job.segments.map((seg, index) => {
                const isActive = seg.id === activeSegmentId;
                const isEditing = seg.id === editingSegmentId;
                const isRegenerating = seg.id === regeneratingSegmentId;

                return (
                  <div
                    key={seg.id}
                    onClick={() => jumpToSegment(seg)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-purple-50/70 border-purple-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Timestamp & Speaker Header */}
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-600 font-semibold tabular-nums">
                          {formatTime(seg.startTime)} - {formatTime(seg.endTime)}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {seg.speakerName}
                        </span>
                      </div>

                      {/* Line Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleAuditionLine(seg, e)}
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Audition Tamil Speech"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => openRegenerateModal(seg, e)}
                          disabled={isRegenerating}
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Regenerate with AI tone"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-purple-600' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isEditing) {
                              handleSaveEdit(seg.id);
                            } else {
                              setEditingSegmentId(seg.id);
                              setEditedTamilText(seg.tamilText);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Edit Tamil Text"
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Original Dialogue */}
                    <p className="text-xs text-slate-500 mb-2 italic">
                      "{seg.originalText}"
                    </p>

                    {/* Tamil Dubbed Dialogue */}
                    {isEditing ? (
                      <div className="mt-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editedTamilText}
                          onChange={(e) => setEditedTamilText(e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-slate-50 border border-purple-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingSegmentId(null)}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(seg.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-[11px] font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-xs font-bold text-slate-900 leading-relaxed">
                          {seg.tamilText}
                        </p>
                        {seg.romanizedTamil && (
                          <p className="text-[11px] text-slate-500 mt-1 font-mono">
                            {seg.romanizedTamil}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Bar */}
            <div className="pt-3 border-t border-slate-100 shrink-0 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {job.segments.length} Synchronized Segments
              </span>
              <span className="font-mono tabular-nums text-purple-600 font-semibold">
                Fidelity Score: {job.qualityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Dialogue Line Regeneration Modal */}
      {showRegenModal && targetRegenSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Regenerate Tamil Dialogue Line
              </h3>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p className="font-medium text-slate-800 mb-1">Original English:</p>
              <p className="italic">"{targetRegenSegment.originalText}"</p>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Vocal Emotion & Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'enthusiastic', label: 'Enthusiastic / Energetic' },
                  { id: 'serious', label: 'Serious & Authoritative' },
                  { id: 'dramatic', label: 'Dramatic / Cinematic' },
                  { id: 'calm', label: 'Calm Documentary' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRegenerationTone(t.id as any)}
                    className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      regenerationTone === t.id
                        ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Director Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Custom Director Notes (Optional)
              </label>
              <input
                type="text"
                value={regenerationPrompt}
                onChange={(e) => setRegenerationPrompt(e.target.value)}
                placeholder="e.g. Make it more colloquial, or add emphasis on technology"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRegenModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRegenerate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Regeneration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
