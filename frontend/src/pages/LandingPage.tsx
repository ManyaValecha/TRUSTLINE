import React, { lazy, Suspense, useState } from 'react';
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
  Smartphone,
  Trophy,
  Star,
  Zap,
  Globe
} from 'lucide-react';
import { ShieldLogo } from '../components/common/ShieldLogo';
import { useApp } from '../context/AppContext';

const ThreeCyberShield = lazy(() => import('../components/landing/ThreeCyberShield').then((module) => ({ default: module.ThreeCyberShield })));

export const LandingPage: React.FC = () => {
  const { setActiveTab, user } = useApp();
  const [heroVisualMode, setHeroVisualMode] = useState<'3d' | 'call'>('call');

  return (
    <div className="space-y-24 py-6 sm:py-10">

      {/* ══ AWARD SHOWCASE BANNER ══ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-yellow-500/25 bg-gradient-to-r from-[#1a1500]/80 via-[#120f00]/60 to-[#0f1020]/80 p-5 sm:p-6 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-black text-yellow-300 uppercase tracking-wider">Great Indian AI Internship Challenge · Gnani.ai</span>
            <span className="text-[11px] font-semibold text-yellow-600 border border-yellow-800/50 bg-yellow-950/50 px-2 py-0.5 rounded-full">4 Award Categories Targeted</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: <Globe className="w-5 h-5 text-orange-400" />,
                award: 'Main Character Award',
                sub: '#01 · Regional / Low-Resource Language',
                detail: 'Hindi, Tamil, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Telugu, Odia — 10+ Indian languages, Odia as a low-resource target.',
                color: 'border-orange-500/30 bg-orange-950/20',
                badge: 'bg-orange-950/60 text-orange-300',
              },
              {
                icon: <Zap className="w-5 h-5 text-cyan-400" />,
                award: 'Mixed Vibes Award',
                sub: '#02 · Code-Mixed Voice Experience',
                detail: 'Native Hinglish, Tanglish & Benglish synthetic scam clips — each with bilingual transcript, tactics breakdown, and 3 acoustic stress variants.',
                color: 'border-cyan-500/30 bg-cyan-950/20',
                badge: 'bg-cyan-950/60 text-cyan-300',
              },
              {
                icon: <Star className="w-5 h-5 text-violet-400" />,
                award: 'Solo Ninja Award',
                sub: '#07 · Best Solo Project',
                detail: 'Conceived, designed, coded, and deployed solo: React/Vite frontend, FastAPI backend, Gnani STT+TTS, Cohere analysis, Sarvam translation, Vercel CI.',
                color: 'border-violet-500/30 bg-violet-950/20',
                badge: 'bg-violet-950/60 text-violet-300',
              },
              {
                icon: <BrainCircuit className="w-5 h-5 text-emerald-400" />,
                award: 'Jugaad Genius Award',
                sub: '#06 · Most Creative Use of Gnani AI',
                detail: 'Repurposed speech recognition (designed for transcription) as a real-time behavioural coercion detector — an unexpected safety-first pivot.',
                color: 'border-emerald-500/30 bg-emerald-950/20',
                badge: 'bg-emerald-950/60 text-emerald-300',
              },
            ].map((a) => (
              <div key={a.award} className={`rounded-2xl border p-4 space-y-2 ${a.color}`}>
                <div className="flex items-center gap-2">
                  {a.icon}
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${a.badge}`}>{a.sub}</span>
                </div>
                <div className="text-sm font-extrabold text-white">{a.award}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{a.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              When you choose to submit a recording, TRUSTLINE can analyze its transcript for suspicious behavior and offer practical safety guidance.
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
                <span>Language choices depend on configured provider support</span>
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
                <Suspense fallback={<div className="aspect-square w-full animate-pulse rounded-3xl bg-violet-950/30" aria-label="Loading shield illustration" />}>
                  <ThreeCyberShield />
                </Suspense>
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
                        Illustrative Transcript Review
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      DEMO VISUAL
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
                        <span>SIMULATED AUDIO VISUAL</span>
                        <span className="text-violet-400">Illustrative only</span>
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
                          <span>EXAMPLE WARNING SIGNAL</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-rose-900/60 text-rose-200 rounded">
                          Sample content
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
                    <div className="text-xs font-bold text-white">Transcript Behavior Only</div>
                    <div className="text-[10px] text-slate-400">Strictly Behavioral Coercion Analysis</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* THREE TECHNOLOGY PROVIDER CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Configurable Analysis Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Speech, Context, and Safety Rules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Provider integrations can add transcription, contextual analysis, translation, and spoken guidance. Availability depends on backend configuration; the deterministic rules remain a separate signal source.
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
                The configured transcription integration converts submitted audio into text. Recognition quality varies with language, recording quality, and provider behavior; no accuracy figure has been measured here.
              </p>
            </div>
            <div className="pt-4 border-t border-violet-900/20 text-[11px] text-slate-500 font-mono">
              Gnani Prisma v3 &bull; Language hints available
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
                Can translate the safety guidance into a selected language when the provider is configured and the request succeeds. Availability and translation quality have not been independently evaluated.
              </p>
            </div>
            <div className="pt-4 border-t border-violet-900/20 text-[11px] text-slate-500 font-mono">
              Provider-dependent language output
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
              desc: 'Select a saved call recording or record through the browser after granting microphone permission and confirming the consent control.',
            },
            {
              step: '02',
              title: 'Speech Transcription',
              desc: 'The configured speech provider attempts to convert the submitted recording into a transcript.',
            },
            {
              step: '03',
              title: 'Manipulation Audit',
              desc: 'When configured, contextual AI and deterministic rules independently check for selected warning patterns in the transcript.',
            },
            {
              step: '04',
              title: 'Safety Directive',
              desc: 'See safety actions and, when configured, a translated warning. Provider failure leaves on-screen guidance available.',
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
              Patterns Included in Current Rules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              The current deterministic rules include patterns for these behaviors. Coverage is limited, so missed signals are possible.
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

      {/* DATA HANDLING */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Understand How Your Data Is Used
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
          TRUSTLINE only processes audio after you submit it. The backend forwards audio to Gnani for transcription and sends transcript text to Cohere; safety guidance may be sent to Sarvam. Reports are stored in this browser, and generated speech can remain on the backend filesystem.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-[#0D1022] border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">You Choose What to Submit</div>
            <div className="text-[11px] text-slate-400">Audio analysis starts only after you submit a recording.</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1022] border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">No Call Interception</div>
            <div className="text-[11px] text-slate-400">The app does not monitor ordinary cellular calls.</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1022] border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">Report History Is Local</div>
            <div className="text-[11px] text-slate-400">History includes transcripts in browser storage; clear it in Settings. Provider and server copies are not cleared there.</div>
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
