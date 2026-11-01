import { DubbingJob, User } from '../types';

export interface StartJobParams {
  title: string;
  sourceType: 'youtube' | 'upload';
  sourceUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  sourceLanguage: string;
  isVoiceCloningRequested: boolean;
  consentVerified: boolean;
  speakersConfig?: any[];
}

export const api = {
  // Jobs
  async getJobs(): Promise<DubbingJob[]> {
    const res = await fetch('/api/dubbing/jobs');
    const data = await res.json();
    return data.jobs || [];
  },

  async getJobStatus(jobId: string): Promise<DubbingJob> {
    const res = await fetch(`/api/dubbing/status/${jobId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch status');
    return data.job;
  },

  async startJob(params: StartJobParams): Promise<DubbingJob> {
    const res = await fetch('/api/dubbing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to start dubbing job');
    return data.job;
  },

  async translateText(text: string, sourceLanguage?: string, tone?: string) {
    const res = await fetch('/api/dubbing/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLanguage, tone }),
    });
    return res.json();
  },

  async regenerateSegment(jobId: string, segmentId: string, originalText: string, tone?: string, customPrompt?: string) {
    const res = await fetch('/api/dubbing/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, segmentId, originalText, tone, customPrompt }),
    });
    return res.json();
  },

  async previewVoice(voiceName: string, text: string) {
    const res = await fetch('/api/dubbing/voice-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceName, text }),
    });
    return res.json();
  },

  async verifyConsent(speakerName: string, consentGranted: boolean) {
    const res = await fetch('/api/dubbing/consent-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speakerName, consentGranted }),
    });
    return res.json();
  },

  async getDownloadBundle(jobId: string) {
    const res = await fetch(`/api/dubbing/download/${jobId}`);
    return res.json();
  },

  async getAdminMetrics() {
    const res = await fetch('/api/admin/metrics');
    return res.json();
  },

  async login(email: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },
};
