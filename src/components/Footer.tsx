import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'studio' | 'editor' | 'voices' | 'dashboard' | 'admin' | 'pricing') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900">TamilDub AI</span>
              <p className="text-xs text-slate-500">Every Language. One Tamil Voice.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <button onClick={() => onNavigate('studio')} className="hover:text-purple-600 transition-colors">
              Dubbing Studio
            </button>
            <button onClick={() => onNavigate('editor')} className="hover:text-purple-600 transition-colors">
              Interactive Editor
            </button>
            <button onClick={() => onNavigate('voices')} className="hover:text-purple-600 transition-colors">
              Voice Lab
            </button>
            <button onClick={() => onNavigate('pricing')} className="hover:text-purple-600 transition-colors">
              Pricing Plans
            </button>
            <button onClick={() => onNavigate('admin')} className="hover:text-purple-600 transition-colors">
              Cluster Status
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TamilDub AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Creator Authorization Policy</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Ethical Voice Consent</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
