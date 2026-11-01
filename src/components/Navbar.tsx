import React from 'react';
import { Sparkles, Video, Mic, BarChart2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: 'studio' | 'editor' | 'voices' | 'dashboard' | 'admin' | 'pricing';
  setActiveTab: (tab: 'studio' | 'editor' | 'voices' | 'dashboard' | 'admin' | 'pricing') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onNewDubbing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onNewDubbing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          onClick={() => setActiveTab('studio')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
              TamilDub<span className="text-purple-600"> AI</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              Tamil Dubbing Engine
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 ${
              activeTab === 'studio' ? 'text-purple-600 font-semibold' : ''
            }`}
          >
            Dubbing Studio
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 ${
              activeTab === 'editor' ? 'text-purple-600 font-semibold' : ''
            }`}
          >
            Interactive Editor
          </button>
          <button
            onClick={() => setActiveTab('voices')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 ${
              activeTab === 'voices' ? 'text-purple-600 font-semibold' : ''
            }`}
          >
            Voice Lab
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 ${
              activeTab === 'dashboard' ? 'text-purple-600 font-semibold' : ''
            }`}
          >
            My Projects
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 ${
              activeTab === 'admin' ? 'text-purple-600 font-semibold' : ''
            }`}
          >
            Cluster & Admin
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors text-xs font-medium text-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-mono tabular-nums text-slate-500">
                {currentUser.creditsRemainingMinutes}m left
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-700 hover:text-purple-600 px-3 py-2 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onNewDubbing}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Video className="w-3.5 h-3.5" />
            <span>New Video</span>
          </button>
        </div>
      </div>
    </header>
  );
};
