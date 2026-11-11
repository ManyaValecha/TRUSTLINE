import React, { useState } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  Lock,
  ArrowRight,
  Sparkles,
  Languages,
  BrainCircuit,
  MessageSquare,
  Users,
  EyeOff,
  AlertTriangle,
  FileCheck2,
  PhoneOff,
  CheckCircle2,
  ChevronRight,
  Box,
  Smartphone
} from 'lucide-react';
import { ShieldLogo } from '../components/common/ShieldLogo';
import { useApp } from '../context/AppContext';
import { ThreeCyberShield } from '../components/landing/ThreeCyberShield';
import { ScamHeadlinesSection } from '../components/landing/ScamHeadlinesSection';

export const LandingPage: React.FC = () => {
  const { setActiveTab, user } = useApp();
  const [heroVisualMode, setHeroVisualMode] = useState<'3d' | 'call'>('3d');

  return (
    <div className="space-y-24 py-6 sm:py-10">
      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-xs font-bold text-violet-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Behavioral Voice Scam Guardian</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              One suspicious call can change everything.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400">
                Be one step ahead.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              TRUSTLINE uses AI to analyse suspicious conversations, identify manipulation tactics, and help protect you and your family from voice scams.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setActiveTab(user.onboarded ? 'dashboard' : 'onboarding')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-violet-900/40 hover:shadow-violet-900/60 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Activate My Protection</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('how-it-works')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#11152A] hover:bg-[#1A203F] border border-violet-900/40 text-slate-200 font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore How It Works</span>
                <ChevronRight className="w-4 h-4 text-violet-400" />
              </button>
            </div>

            {/* Trust reassurance pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 pt-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero background eavesdropping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Audio processed only with consent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>10 Indian regional languages</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Cyber Shield or Live Call Audit Illustration */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Visualizer Mode Toggle */}
            <div className="mb-3 flex items-center p-1 rounded-2xl bg-[#0e132a] border border-violet-900/40 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setHeroVisualMode('3d')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  heroVisualMode === '3d'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Cyber Shield</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroVisualMode('call')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  heroVisualMode === 'call'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Call Inspector</span>
              </button>
            </div>

            {heroVisualMode === '3d' ? (
              <div className="w-full max-w-md">
                <ThreeCyberShield />
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                {/* Device Mockup Graphic with Live-Looking Illustrative Risk Inspection */}
                <div className="relative p-6 rounded-3xl bg-[#0E132A] border border-violet-500/30 shadow-2xl shadow-violet-950/50 backdrop-blur-xl">
                  {/* Simulated Phone Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-violet-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-extrabold text-rose-300 uppercase tracking-widest">
                        Incoming Call Analysis
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      AI GUARDIAN LIVE
                    </span>
                  </div>

                  {/* Caller Information Simulation */}
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Caller ID claim</div>
                        <div className="text-sm font-bold text-white">"State Bank Risk Prevention"</div>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400">
                        <PhoneCall className="w-4 h-4 animate-bounce" />
                      </div>
                    </div>

                    {/* Simulated Acoustic Waveform */}
                    <div className="p-3 rounded-xl bg-[#080B18] border border-violet-950/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>VOICE STREAM</span>
                        <span className="text-violet-400">Gnani STT: en-IN</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 h-8 px-1">
                        {[40, 75, 95, 60, 30, 85, 100, 70, 45, 90, 65, 80, 50, 95, 30, 70].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-violet-600 to-cyan-400 rounded-full"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Detected Coercion Callout */}
                    <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>COERCION TACTIC DETECTED</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-rose-900/60 text-rose-200 rounded">
                          Cohere AI
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-100 font-mono leading-tight">
                        "Give me the 6-digit OTP code received on SMS right now..."
                      </p>
                    </div>

                    {/* Recommended Action Pill */}
                    <div className="p-3 rounded-xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Advisory: Disconnect Call</span>
                      </div>
                      <span className="text-[10px] text-violet-300 font-semibold">Dial 1930</span>
                    </div>
                  </div>

                  {/* Subtle caption noting illustration */}
                  <div className="pt-2 text-center text-[10px] text-slate-500 italic">
                    Illustrative UI representation of behavioral scam inspection.
                  </div>
                </div>

                {/* Floating Shield Badge */}
                <div className="absolute -bottom-5 -left-5 p-3 rounded-2xl bg-[#111634] border border-cyan-500/40 shadow-xl flex items-center gap-3 backdrop-blur-md">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Zero Deepfake Guesswork</div>
                    <div className="text-[10px] text-slate-400">Strictly Behavioral Coercion Analysis</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LATEST VOICE SCAM HEADLINES & FRAUD TRENDS (Powered by Google Search Grounding) */}
      <ScamHeadlinesSection />

      {/* THREE TECHNOLOGY PROVIDER CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Enterprise AI Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Powered by Leading Indian & Global AI Systems
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A purpose-built multi-model pipeline tailored specifically to Indian linguistic nuances and common financial coercion tactics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gnani */}
          <div className="p-6 rounded-3xl bg-[#0E132A] border border-violet-900/30 hover:border-violet-600/50 transition-all duration-300 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                  Provider 01 &bull; Speech to Text
                </div>
                <h3 className="text-lg font-bold text-white">Gnani Conversational STT</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specialized in recognizing Indian English, regional accents, mixed phrasing (Hinglish/Tanglish), and low-bandwidth telecom voice audio with high precision.
              </p>
            </div>
            <div className="pt-4 border-t border-violet-900/20 text-[11px] text-slate-500 font-mono">
              STT Engine &bull; Accent Adaptive
            </div>
          </div>

          {/* Card 2: Cohere */}
          <div className="p-6 rounded-3xl bg-[#0E132A] border border-violet-900/30 hover:border-cyan-600/50 transition-all duration-300 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Provider 02 &bull; Behavioral Reasoning
                </div>
                <h3 className="text-lg font-bold text-white">Cohere Coercion Intelligence</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyzes conversational transcripts for psychological leverage, false legal deadlines, isolation commands ("stay on line"), and credential harvesting.
              </p>
            </div>
            <div className="pt-4 border-t border-violet-900/20 text-[11px] text-slate-500 font-mono">
              Scam Heuristics &bull; Context Modeling
            </div>
          </div>

          {/* Card 3: Sarvam */}
          <div className="p-6 rounded-3xl bg-[#0E132A] border border-violet-900/30 hover:border-emerald-600/50 transition-all duration-300 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <Languages className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Provider 03 &bull; Indic Translation
                </div>
                <h3 className="text-lg font-bold text-white">Sarvam Indic Safety Translation</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transforms complex cybersecurity threat assessments into clear, reassuring, and immediate warning advisories in 10 official Indian languages.
              </p>
            </div>
            <div className="pt-4 border-t border-violet-900/20 text-[11px] text-slate-500 font-mono">
              10 Indian Languages &bull; Reassuring Tone
            </div>
          </div>
        </div>
      </section>

      {/* HOW TRUSTLINE WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Simple 4-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How TRUSTLINE Protects You
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Designed to be effortless for elderly parents, families, and everyday mobile users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload or Record',
              desc: 'Select a saved call recording or speak into your browser microphone with explicit consent.',
            },
            {
              step: '02',
              title: 'Speech Transcription',
              desc: 'Gnani STT translates the conversational voice frequencies into structured textual dialogue.',
            },
            {
              step: '03',
              title: 'Manipulation Audit',
              desc: 'Cohere AI and TRUSTLINE rules scan for OTP extraction, fake authority, and payment coercion.',
            },
            {
              step: '04',
              title: 'Safety Directive',
              desc: 'Receive immediate actionable advice and translated warnings in your regional mother tongue.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#0D1126] border border-violet-900/30 space-y-3 relative">
              <span className="text-3xl font-black text-violet-500/30 font-mono">{item.step}</span>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KEY PROTECTION FEATURES */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#111532] via-[#0E132A] to-[#0A0D1E] border border-violet-900/40 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400">
              Core Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Targeted Scam Modalities Identified
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Scammers rely on psychological triggers rather than technical exploits. TRUSTLINE recognizes the signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Bank KYC & OTP Harvesting',
                desc: 'Threats of immediate debit card deactivation to harvest SMS OTP codes or UPI pins.',
              },
              {
                title: 'Digital Arrest & Extortion',
                desc: 'Fabricated police or customs arrest warrants extorting money via urgent UPI deposits.',
              },
              {
                title: 'Urgent Courier / Parcel Panics',
                desc: 'False claims of seized contraband parcels demanding security clearing charges.',
              },
              {
                title: 'Remote-Access Software',
                desc: 'Deceptive instructions to install screen-sharing software (AnyDesk, TeamViewer).',
              },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/30 border border-violet-900/30 space-y-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div className="text-sm font-bold text-white">{f.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY-FIRST PROMISE */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Our Privacy-First Covenant
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
          We believe true cybersecurity starts with user autonomy. TRUSTLINE does not monitor phone calls in the background, does not share audio recordings, and enforces zero-retention defaults.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-[#0D1022] border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">Explicit User Action Only</div>
            <div className="text-[11px] text-slate-400">Audio is analysed only when you click "Analyse".</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1022] border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">No Silent Wiretapping</div>
            <div className="text-[11px] text-slate-400">We never claim to tap regular cellular phone calls.</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1022] border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">Local-First Storage</div>
            <div className="text-[11px] text-slate-400">Settings and history stay entirely in your browser.</div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-violet-900/60 via-purple-900/50 to-indigo-900/60 border border-violet-500/40 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Protect Yourself and Your Family Today
          </h2>
          <p className="text-sm text-violet-200 max-w-xl mx-auto">
            Take seconds to verify any suspicious call recording before money or private passwords leave your hands.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab(user.onboarded ? 'dashboard' : 'onboarding')}
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-base shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 text-violet-600" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
