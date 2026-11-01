import React from 'react';
import { 
  Languages, Mic, Headphones, Film, Sparkles, CheckCircle2, 
  Layers, Volume2, ShieldCheck, ArrowRight
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Multimodal Audio Demuxing & STT',
      description: 'Audio streams are isolated and processed through neural speech recognition, segmenting dialogue with millisecond precision and clustering multiple speakers.',
      icon: Mic,
    },
    {
      num: '02',
      title: 'Idiomatic Tamil Neural Translation',
      description: 'Beyond literal translation, our Gemini 3.8 context engine rewrites phrasing into authentic colloquial or formal Tamil, optimizing syllabic lengths for lip sync.',
      icon: Languages,
    },
    {
      num: '03',
      title: 'Speaker-Aware Voice Generation',
      description: 'Native Tamil vocal actors synthesize the dialogue with dynamic inflection, preserving pitch contour, or cloning the verified speaker with legal consent.',
      icon: Volume2,
    },
    {
      num: '04',
      title: 'Sidechain Ducking & Remuxing',
      description: 'Original dialogue is spectrally ducked while background ambient Foley and score are preserved, remuxing pristine H.264 video with synchronized Tamil audio.',
      icon: Film,
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Neural Pipeline</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How TamilDub AI Works
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            A 17-step automated pipeline built on state-of-the-art speech intelligence, contextual Tamil linguistics, and broadcast-grade audio mastering.
          </p>
        </div>

        {/* 4 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold font-mono text-purple-600">{s.num}</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 bg-purple-50/50 rounded-2xl border border-purple-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Zero Lip-Sync Drift</h4>
              <p className="text-xs text-slate-600 mt-1">
                Dynamic syllable matching ensures speech durations match original mouth movements without robotic unnatural stretching.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Ambient Sound Preservation</h4>
              <p className="text-xs text-slate-600 mt-1">
                Our vocal separator isolates human speech for replacement while leaving footsteps, background scores, and room ambience intact.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Ethical Voice Verification</h4>
              <p className="text-xs text-slate-600 mt-1">
                Deepfake prevention with verified creator authorization ensures trusted, copyright-compliant dubbing distribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
