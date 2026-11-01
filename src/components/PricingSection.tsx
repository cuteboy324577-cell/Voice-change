import React from 'react';
import { Check, Sparkles, Zap, Shield, Video } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Free Creator',
      audience: 'For independent creators testing Tamil dubbing',
      price: '$0',
      period: 'forever',
      features: [
        '15 minutes of video dubbing per month',
        'Standard Tamil AI voices (Karthik & Meenakshi)',
        '720p HD MP4 video export',
        'SRT Subtitle generation (தமிழ்)',
        'Community support',
      ],
      isPopular: false,
      cta: 'Get Started Free',
    },
    {
      name: 'Pro Studio',
      audience: 'For YouTube channels and content educators',
      price: '$29',
      period: 'per month',
      features: [
        '180 minutes of video dubbing per month',
        'All 4 Certified Tamil voices + custom prosody',
        '1080p & 4K Ultra-HD MP4 export',
        'Authorized Voice Timbre Cloning verification',
        'Sidechain background audio ducking control',
        'SRT + VTT Bilingual subtitles',
        'Priority GPU Celery rendering queue',
      ],
      isPopular: true,
      cta: 'Upgrade to Pro Studio',
    },
    {
      name: 'Enterprise Media',
      audience: 'For production houses, OTT networks, and agencies',
      price: '$149',
      period: 'per month',
      features: [
        'Unlimited video dubbing minutes',
        'Multi-speaker diarization (up to 12 speakers)',
        'Enterprise API & Webhook integration',
        'Custom fine-tuned Tamil dialect models',
        'Dedicated GPU instance & SLAs',
        'Legal compliance & consent audit archiving',
        '24/7 dedicated audio engineer support',
      ],
      isPopular: false,
      cta: 'Contact Enterprise',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent SaaS Plans</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Plans for Every Creator and Studio
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Scale your reach across 80+ million Tamil speakers worldwide with transparent minute-based pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all bg-white border ${
                p.isPopular
                  ? 'border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500 relative'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                  MOST POPULAR FOR CREATORS
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.audience}</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {p.price}
                  </span>
                  <span className="text-xs font-medium text-slate-500 ml-1.5">/ {p.period}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {p.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => onSelectPlan(p.name)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    p.isPopular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
