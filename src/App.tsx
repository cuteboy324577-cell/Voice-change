/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { DubbingEditor } from './components/DubbingEditor';
import { VoiceLab } from './components/VoiceLab';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HowItWorks } from './components/HowItWorks';
import { PricingSection } from './components/PricingSection';
import { PipelineTrackerModal } from './components/PipelineTrackerModal';
import { ConsentVerificationModal } from './components/ConsentVerificationModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { DubbingJob, User } from './types';
import { PRESET_SAMPLE_JOBS } from './data/sampleVideos';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'editor' | 'voices' | 'dashboard' | 'admin' | 'pricing'>('studio');
  const [jobs, setJobs] = useState<DubbingJob[]>(PRESET_SAMPLE_JOBS);
  const [activeJobId, setActiveJobId] = useState<string>(PRESET_SAMPLE_JOBS[0].id);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-demo-1',
    name: 'Kavin Raj',
    email: 'kavin@tamildub.ai',
    role: 'creator',
    plan: 'pro',
    creditsRemainingMinutes: 185,
    totalDubbedMinutes: 420,
    avatarUrl: '/src/assets/images/voice_studio_microphone_1793513514300.jpg',
  });

  // Modal states
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [processingJob, setProcessingJob] = useState<DubbingJob | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isConsentVerified, setIsConsentVerified] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Poll server jobs on load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const serverJobs = await api.getJobs();
        if (serverJobs && serverJobs.length > 0) {
          setJobs(serverJobs);
        }
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn('Using client-cached state:', err);
      }
    };
    loadInitialData();
  }, []);

  // Poll processing job if modal is active
  useEffect(() => {
    if (!isPipelineModalOpen || !processingJob || processingJob.status === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.getJobStatus(processingJob.id);
        setProcessingJob(updated);
        setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));

        if (updated.status === 'completed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isPipelineModalOpen, processingJob]);

  // Handle starting a new dubbing pipeline
  const handleStartDubbing = async (params: any) => {
    try {
      const newJob = await api.startJob(params);
      setJobs((prev) => [newJob, ...prev]);
      setProcessingJob(newJob);
      setIsPipelineModalOpen(true);
    } catch (err) {
      console.error('Failed to initiate dubbing job:', err);
    }
  };

  const handleSelectSampleJob = (jobId: string) => {
    setActiveJobId(jobId);
    setActiveTab('editor');
  };

  const handleOpenEditor = (jobId: string) => {
    setActiveJobId(jobId);
    setActiveTab('editor');
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (activeJobId === jobId && jobs.length > 1) {
      const remaining = jobs.filter((j) => j.id !== jobId);
      setActiveJobId(remaining[0].id);
    }
  };

  const handleUpdateJob = (updatedJob: DubbingJob) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const currentActiveJob = jobs.find((j) => j.id === activeJobId) || jobs[0] || PRESET_SAMPLE_JOBS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNewDubbing={() => {
          setActiveTab('studio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'studio' && (
          <div>
            <HeroInput
              onStartDubbing={handleStartDubbing}
              onSelectSampleJob={handleSelectSampleJob}
              onOpenConsentModal={() => setIsConsentModalOpen(true)}
              isConsentVerified={isConsentVerified}
            />
            <HowItWorks />
            <PricingSection onSelectPlan={() => setIsAuthModalOpen(true)} />
          </div>
        )}

        {activeTab === 'editor' && (
          <DubbingEditor
            job={currentActiveJob}
            onUpdateJob={handleUpdateJob}
            onBackToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'voices' && (
          <VoiceLab
            isConsentVerified={isConsentVerified}
            onOpenConsentModal={() => setIsConsentModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            jobs={jobs}
            onOpenEditor={handleOpenEditor}
            onDeleteJob={handleDeleteJob}
            onNewDubbing={() => setActiveTab('studio')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'pricing' && (
          <div className="py-8">
            <PricingSection onSelectPlan={() => setIsAuthModalOpen(true)} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* 17-Step Live Progress Modal */}
      <PipelineTrackerModal
        isOpen={isPipelineModalOpen}
        job={processingJob}
        onClose={() => setIsPipelineModalOpen(false)}
        onOpenEditor={handleOpenEditor}
      />

      {/* Consent Verification Modal */}
      <ConsentVerificationModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConsentVerified={() => setIsConsentVerified(true)}
      />

      {/* Sign-in / Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
