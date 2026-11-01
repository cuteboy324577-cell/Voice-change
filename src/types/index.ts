export type LanguageCode = 
  | 'en' | 'hi' | 'ja' | 'ko' | 'zh' | 'fr' | 'de' | 'es' | 'ar' | 'ru' | 'it' | 'ta' | 'auto';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface SpeakerProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  tamilVoiceName: string; // e.g. "Karthik", "Meenakshi", "Selvan", "Priya"
  avatarUrl?: string;
  isCloned?: boolean;
  consentVerified?: boolean;
  similarityScore?: number; // 0 - 100
  pitchAdjust?: number; // -5 to +5
  speedMultiplier?: number; // 0.8 to 1.3
}

export interface TranscriptSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  speakerId: string;
  speakerName: string;
  originalText: string;
  tamilText: string;
  romanizedTamil?: string; // English phonetic transcription
  audioUrl?: string; // generated Tamil audio wav/base64
  isRegenerating?: boolean;
  confidenceScore?: number;
  emotion?: 'neutral' | 'enthusiastic' | 'serious' | 'calm' | 'dramatic';
}

export interface PipelineStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface DubbingJob {
  id: string;
  userId: string;
  title: string;
  sourceType: 'youtube' | 'upload';
  sourceUrl?: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  fileSizeMb?: number;
  sourceLanguage: LanguageCode;
  targetLanguage: 'ta';
  status: JobStatus;
  progress: number; // 0 - 100
  currentStepIndex: number; // 0 - 16 (17 steps)
  steps: PipelineStep[];
  speakers: SpeakerProfile[];
  segments: TranscriptSegment[];
  outputVideoUrl?: string;
  outputAudioUrl?: string;
  subtitlesSrt?: string;
  subtitlesVtt?: string;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
  isVoiceCloningRequested?: boolean;
  consentVerified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'creator';
  plan: 'free' | 'creator' | 'pro' | 'enterprise';
  creditsRemainingMinutes: number;
  totalDubbedMinutes: number;
  avatarUrl: string;
}

export interface VoiceModel {
  id: string;
  name: string;
  tamilName: string;
  gender: 'male' | 'female';
  tone: string;
  sampleAudioText: string;
  sampleAudioTamil: string;
  geminiVoice: string; // Puck, Charon, Kore, Fenrir, Zephyr
  isPremium?: boolean;
  description: string;
}
