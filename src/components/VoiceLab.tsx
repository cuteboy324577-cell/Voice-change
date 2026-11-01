import React, { useState } from 'react';
import { 
  Volume2, Play, Pause, Mic, ShieldCheck, CheckCircle2, 
  Sliders, Sparkles, AlertCircle, FileCheck, Info
} from 'lucide-react';
import { TAMIL_VOICES } from '../data/sampleVideos';
import { VoiceModel } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { api } from '../services/api';

interface VoiceLabProps {
  isConsentVerified: boolean;
  onOpenConsentModal: () => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({
  isConsentVerified,
  onOpenConsentModal,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(88);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [customText, setCustomText] = useState('வணக்கம், தமிழ் டப்பிங் ஏஐ குரல் தளத்திற்கு உங்களை வரவேற்கிறோம்.');

  const handleAuditionVoice = async (voice: VoiceModel) => {
    if (playingVoiceId === voice.id) {
      audioSynthesizer.stop();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);

    try {
      // Call server voice preview API
      const res = await api.previewVoice(voice.name, customText || voice.sampleAudioTamil);
      
      await audioSynthesizer.playTamilSpeech(customText || voice.sampleAudioTamil, {
        audioBase64: res.audioBase64,
        rate: speedMultiplier,
        voiceName: voice.name,
        onEnd: () => setPlayingVoiceId(null),
      });
    } catch (e) {
      console.warn('Voice preview playback issue:', e);
      setPlayingVoiceId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
          <Mic className="w-3.5 h-3.5" />
          <span>Tamil Neural Speech & Voice Cloning Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Acoustic Voice Lab
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Audition certified native Tamil voice actors, calibrate vocal prosody, and manage legal speaker verification for voice timbre cloning.
        </p>
      </div>

      {/* Voice Customization & Test Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Interactive Tamil Speech Testbench</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter Tamil text to test voice synthesis..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Speed</span>
                <span className="font-mono tabular-nums">{speedMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Standard Tamil Voice Models Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Certified Standard Tamil AI Voices
          </h3>
          <span className="text-xs text-slate-500">Zero latency · Native Tamil prosody</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TAMIL_VOICES.map((voice) => {
            const isPlaying = playingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                        {voice.tamilName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {voice.name} <span className="text-purple-600 font-medium">({voice.tamilName})</span>
                        </h4>
                        <span className="text-xs text-slate-500">
                          {voice.gender === 'male' ? 'Male Voice' : 'Female Voice'} · {voice.geminiVoice} Engine
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAuditionVoice(voice)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600'
                      }`}
                      title={isPlaying ? 'Stop Preview' : 'Audition Voice'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {voice.description}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900">{voice.sampleAudioTamil}</p>
                    <p className="text-slate-400 italic text-[11px]">"{voice.sampleAudioText}"</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {voice.tone}
                  </span>
                  <span className="font-mono">24kHz Studio Master</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authorized Voice Cloning Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authorized Voice Cloning & Timbre Synthesis
              </h3>
              <p className="text-xs text-slate-500">
                Ethical AI verification requirement for speaker voice mimicry
              </p>
            </div>
          </div>

          <div>
            {isConsentVerified ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Consent Verified & Logged</span>
              </div>
            ) : (
              <button
                onClick={onOpenConsentModal}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Verify Speaker Consent</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Requirement Explanation */}
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-purple-900">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Voice Safeguard Policy Notice</span>
          </div>
          <p className="leading-relaxed">
            In compliance with international voice synthesis regulations and deepfake prevention standards, TamilDub AI strictly prohibits unauthorized voice cloning. Voice cloning is activated solely after explicit written/recorded consent and speaker biometric authentication are completed.
          </p>
        </div>

        {/* Cloning Calibration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Acoustic Timbre Similarity Target</span>
              <span className="font-mono tabular-nums text-purple-600 font-bold">{similarityThreshold}%</span>
            </div>
            <input
              type="range"
              min="75"
              max="98"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Higher values mirror subtle vocal resonances while maintaining natural Tamil pronunciation.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-700 block">Verification Audit Trail:</span>
            <div className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-600">ID Verification Standard:</span>
              <span className="font-medium text-slate-900">Government Photo ID / Verified Domain</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-600">Consent Audit Retention:</span>
              <span className="font-medium text-slate-900">Cryptographically Hashed Record</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
