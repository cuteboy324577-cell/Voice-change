import React, { useState, useRef } from 'react';
import { 
  Youtube, Upload, Play, CheckCircle2, AlertCircle, Sparkles, 
  Layers, Volume2, Shield, Languages, FileVideo, ArrowRight
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, PRESET_SAMPLE_JOBS, TAMIL_VOICES } from '../data/sampleVideos';
import { LanguageCode } from '../types';

interface HeroInputProps {
  onStartDubbing: (data: {
    title: string;
    sourceType: 'youtube' | 'upload';
    sourceUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    sourceLanguage: LanguageCode;
    isVoiceCloningRequested: boolean;
    consentVerified: boolean;
    selectedVoiceId: string;
  }) => void;
  onSelectSampleJob: (jobId: string) => void;
  onOpenConsentModal: () => void;
  isConsentVerified: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  onStartDubbing,
  onSelectSampleJob,
  onOpenConsentModal,
  isConsentVerified,
}) => {
  const [inputTab, setInputTab] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('auto');
  const [selectedVoice, setSelectedVoice] = useState<string>('karthik');
  const [voiceCloningEnabled, setVoiceCloningEnabled] = useState(false);
  const [isAuthorizedChecked, setIsAuthorizedChecked] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSizeMb, setUploadedFileSizeMb] = useState<number | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 500MB)
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 500) {
      setErrorMessage('File size exceeds the 500MB limit. Please upload a smaller video clip.');
      return;
    }

    setUploadedFileName(file.name);
    setUploadedFileSizeMb(Number(sizeMb.toFixed(1)));
    const objectUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(objectUrl);
    setErrorMessage(null);
  };

  const handleStart = () => {
    setErrorMessage(null);

    if (inputTab === 'youtube') {
      if (!youtubeUrl.trim()) {
        setErrorMessage('Please enter a valid authorized YouTube video URL.');
        return;
      }
      if (!isAuthorizedChecked) {
        setErrorMessage('Please confirm you have authorization or creator rights to dub this video.');
        return;
      }

      onStartDubbing({
        title: 'YouTube Dubbing: ' + (youtubeUrl.includes('v=') ? youtubeUrl.split('v=')[1].slice(0, 8) : 'Online Video'),
        sourceType: 'youtube',
        sourceUrl: youtubeUrl,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: '/src/assets/images/hero_tamildub_studio_1793513514432.jpg',
        sourceLanguage: sourceLang,
        isVoiceCloningRequested: voiceCloningEnabled,
        consentVerified: isConsentVerified,
        selectedVoiceId: selectedVoice,
      });
    } else {
      if (!uploadedVideoUrl) {
        setErrorMessage('Please select an MP4 or WebM video file to upload.');
        return;
      }

      onStartDubbing({
        title: uploadedFileName || 'Custom Uploaded Video',
        sourceType: 'upload',
        videoUrl: uploadedVideoUrl,
        thumbnailUrl: '/src/assets/images/video_sample_thumbnail_1793513513794.jpg',
        sourceLanguage: sourceLang,
        isVoiceCloningRequested: voiceCloningEnabled,
        consentVerified: isConsentVerified,
        selectedVoiceId: selectedVoice,
      });
    }
  };

  return (
    <div className="w-full bg-slate-50 py-12 md:py-16 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Title & Tagline */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Tamil Video Dubbing Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Every Language. <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">One Tamil Voice.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            Automatically transcribe, translate, diarize speakers, and synthesize natural Tamil speech with frame-accurate lip-sync synchronization.
          </p>
        </div>

        {/* Main Input Card - White UI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          {/* Source Tabs: YouTube vs File Upload */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-6 max-w-md mx-auto">
            <button
              onClick={() => { setInputTab('youtube'); setErrorMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                inputTab === 'youtube'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-600" />
              <span>Authorized YouTube URL</span>
            </button>
            <button
              onClick={() => { setInputTab('upload'); setErrorMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                inputTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Upload Video (MP4)</span>
            </button>
          </div>

          {/* YouTube Input Box */}
          {inputTab === 'youtube' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  YouTube Video Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Creator Authorization Confirmation */}
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3.5 flex items-start gap-3">
                <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                    <input
                      type="checkbox"
                      checked={isAuthorizedChecked}
                      onChange={(e) => setIsAuthorizedChecked(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>I confirm I am authorized by the content owner or have rights to translate & dub this video source.</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* Video File Upload Box */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50/60 rounded-xl p-8 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {uploadedFileName ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{uploadedFileName}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">{uploadedFileSizeMb} MB · Ready for processing</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drag and drop your video file here, or <span className="text-purple-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Supports MP4, WebM (up to 500MB duration up to 10 mins)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration Grid: Source Language, Target Tamil Voice, Cloning */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
            {/* 1. Source Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-purple-600" />
                <span>Source Language</span>
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Target Voice Actor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Primary Tamil Voice</span>
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TAMIL_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.tamilName}) — {v.gender === 'male' ? 'Male' : 'Female'}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Authorized Voice Cloning Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Voice Timbre Cloning</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!isConsentVerified) {
                      onOpenConsentModal();
                    } else {
                      setVoiceCloningEnabled(!voiceCloningEnabled);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${
                    voiceCloningEnabled
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{voiceCloningEnabled ? 'Cloning Enabled' : 'Standard AI Voice'}</span>
                  {isConsentVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button: Start Dubbing */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-semibold text-slate-700">17-Step Pipeline</span>
              <span>·</span>
              <span>Whisper STT</span>
              <span>·</span>
              <span>Neural Tamil TTS</span>
              <span>·</span>
              <span>Foley Mixing</span>
            </div>

            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start AI Dubbing Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pre-configured Demo Showcases for Instant One-Click Testing */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Or Try Pre-Authorized Studio Samples
            </h3>
            <span className="text-xs text-slate-400">Instant Preview & Editor Access</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_SAMPLE_JOBS.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectSampleJob(job.id)}
                className="group bg-white hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer flex items-center gap-4 shadow-sm"
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={job.thumbnailUrl}
                    alt={job.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white drop-shadow" />
                  </div>
                  <span className="absolute bottom-1 right-1 px-1 bg-black/70 text-white text-[9px] font-mono rounded">
                    0:{job.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="uppercase font-semibold text-purple-600">{job.sourceLanguage}</span>
                    <span>→</span>
                    <span className="text-slate-700 font-medium">Tamil (தமிழ்)</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{job.segments.length} lines</span>
                  </div>
                </div>

                <div className="shrink-0 text-slate-400 group-hover:text-purple-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
