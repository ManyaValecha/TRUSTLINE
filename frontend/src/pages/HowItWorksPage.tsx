import React from 'react';
import {
  BrainCircuit,
  MessageSquare,
  Languages,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HowItWorksPage: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* Page Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-xs font-bold text-violet-300">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Transparent Technology Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          How Behavioral Scam Detection Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Why TRUSTLINE focuses strictly on conversational manipulation, psychological leverage, and credential extraction—not deepfakes or phone tapping.
        </p>
      </div>

      {/* CORE PHILOSOPHY: BEHAVIORAL VS DEEPFAKES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#131737] to-[#0E132A] border border-violet-500/30 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Why Behavioral Scam Detection?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Over 95% of financial phone scams succeed not through voice cloning or deepfakes, but through <strong>social engineering</strong>: fabricating legal arrest warrants, claiming bank cards are blocked, inducing blind panic, and forcing victims into hurried decisions.
          </p>
          <div className="space-y-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Detects credential theft commands (OTP, UPI PIN, Passwords).</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Flags false urgency windows ("within 10 minutes or arrest").</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Identifies intimidation tactics and illegal "digital arrest" claims.</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0D1E] border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            What TRUSTLINE Deliberately Avoids
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Many tools make reckless claims that create a false sense of security or violate fundamental personal privacy. TRUSTLINE operates with strict engineering honesty:
          </p>
          <div className="space-y-2 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>We do <strong>not</strong> claim to detect cloned voices or deepfakes.</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>We do <strong>not</strong> tap or monitor normal cellular phone calls.</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>We do <strong>not</strong> retain or sell private audio recordings.</span>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-MODEL STACK */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Technical Stack
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The Multi-Stage Processing Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0E132A] border border-violet-900/30 space-y-3">
            <div className="text-xs font-mono font-bold text-violet-400">STAGE 01 &bull; STT</div>
            <h3 className="text-lg font-bold text-white">Gnani Speech Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts user audio in WAV, MP3, or WebM format. Specifically trained on Indian accents, mixed vernacular vocabulary, telecom bandwidth, and regional English speech patterns.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E132A] border border-cyan-900/30 space-y-3">
            <div className="text-xs font-mono font-bold text-cyan-400">STAGE 02 &bull; LLM REASONING</div>
            <h3 className="text-lg font-bold text-white">Cohere AI & Rules</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applies specialized cyber deception prompts and semantic analysis to extract manipulative intent, threat vectors, coercion level, and specific evidence quotes from the speech transcript.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E132A] border border-emerald-900/30 space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400">STAGE 03 &bull; TRANSLATION</div>
            <h3 className="text-lg font-bold text-white">Sarvam Indic AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translates technical risk warnings into calming, clear, actionable advice across 10 Indian regional languages so that senior citizens can understand the exact danger in their mother tongue.
            </p>
          </div>
        </div>
      </div>

      {/* CTA TO DASHBOARD */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-violet-900/50 via-purple-900/40 to-indigo-900/50 border border-violet-500/40 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl font-black text-white">
          Ready to verify a recording?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Test any suspicious audio clip or benchmark sample now on your dashboard.
        </p>
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Open Protection Dashboard</span>
            <ArrowRight className="w-4 h-4 text-violet-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
