import React from 'react';
import { PhoneCall, ShieldCheck, Lock, ExternalLink, Heart } from 'lucide-react';
import { ShieldLogo } from '../common/ShieldLogo';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="w-full border-t border-violet-950/40 bg-[#060810] text-[#94A3B8] text-sm mt-16">
      {/* 1930 Emergency Helpline Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-rose-950/40 border-b border-rose-900/30 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-white font-bold text-xs sm:text-sm">
                Targeted by a cyber financial scam in India?
              </span>{' '}
              <span className="text-rose-300 text-xs sm:text-sm font-semibold">
                Dial <span className="underline font-mono font-bold text-white">1930</span> immediately
              </span>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition"
          >
            <span>Official Portal (cybercrime.gov.in)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <ShieldLogo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed">
              "Because trust should never be exploited."
            </p>
            <p className="text-xs text-slate-500">
              Your personal AI guardian against voice scams. Focused on conversational manipulation patterns and family safety.
            </p>
          </div>

          {/* Core Navigation */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Product</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-violet-300 transition cursor-pointer"
                >
                  Analyse a Call Recording
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('how-it-works');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-violet-300 transition cursor-pointer"
                >
                  How Behavioural Detection Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('family');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-violet-300 transition cursor-pointer"
                >
                  Family Safety Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-violet-300 transition cursor-pointer"
                >
                  Settings & Local Data
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Ethics */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy Principles</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Audio is processed only on explicit user upload or recording.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Submitted audio is sent to the transcription provider; transcripts and guidance may be sent to analysis and translation providers. Report history is stored in this browser. Provider and server retention depends on their policies.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Focuses on behavioural coercion tactics, not deepfakes.</span>
              </li>
            </ul>
          </div>

          {/* Provider Pipeline */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">AI Architecture</div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-[#0C1024] border border-violet-950/60">
                <span className="font-semibold text-violet-300">Gnani STT:</span> Multilingual Indian speech-to-text.
              </div>
              <div className="p-2 rounded-lg bg-[#0C1024] border border-violet-950/60">
                <span className="font-semibold text-cyan-300">Cohere AI:</span> Coercion pattern identification.
              </div>
              <div className="p-2 rounded-lg bg-[#0C1024] border border-violet-950/60">
                <span className="font-semibold text-emerald-300">Sarvam AI:</span> Indic language translation & advisory.
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Legal Notice */}
        <div className="pt-6 border-t border-slate-900/80 text-[11px] text-slate-500 space-y-2">
          <p>
            <strong className="text-slate-400">Important Safety Disclaimer:</strong> TRUSTLINE AI is an educational and protective assistance tool, not a judicial guarantee. Never share OTPs, UPI PINs, passwords, or initiate urgent fund transfers over the phone. When in doubt, hang up and verify with the official organisation directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <div>
              &copy; {new Date().getFullYear()} TRUSTLINE. All rights reserved.
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for senior citizens and family protection.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
