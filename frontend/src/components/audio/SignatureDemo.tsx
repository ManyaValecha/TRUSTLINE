import React, { useState } from 'react';
import { ArrowDownToLine, ArrowRight, LoaderCircle, Zap, ShieldCheck, Trophy, AlertTriangle } from 'lucide-react';

type SignatureClip = {
  id: string;
  name: string;
  label: string;
  flag: string;
  accentColor: string;
  borderColor: string;
  badgeColor: string;
  audio: string;
  noisyAudio: string;
  quietAudio: string;
  compressedAudio: string;
  filename: string;
  profile: string;
  target: string;
  transcript: string;
  romanized: string;
  tactics: string[];
};

const clips: SignatureClip[] = [
  {
    id: 'hi',
    name: 'Hinglish',
    label: 'Hindi + English',
    flag: '🇮🇳',
    accentColor: 'from-orange-500/20 to-green-500/10',
    borderColor: 'border-orange-500/40',
    badgeColor: 'bg-orange-950/60 text-orange-300 border-orange-700/50',
    audio: '/samples/trustline-synthetic-hinglish-call.mp3',
    noisyAudio: '/samples/trustline-synthetic-hinglish-call-telephony-10db.wav',
    quietAudio: '/samples/trustline-synthetic-hinglish-call-quiet-24db.wav',
    compressedAudio: '/samples/trustline-synthetic-hinglish-call-telephony-16kbps.mp3',
    filename: 'trustline-synthetic-hinglish-call.mp3',
    profile: 'hi-en',
    target: 'hi-IN',
    transcript:
      'Namaste, main aapke bank security team se bol raha hoon. Aapka account das minute mein block ho sakta hai. Verification ke liye apna OTP bata dijiye. Kisi ko mat batana.',
    romanized:
      "Hello, I'm speaking from your bank security team. Your account may be blocked in ten minutes. Share your OTP for verification. Don't tell anyone.",
    tactics: ['OTP Harvesting', 'Urgency / Time Pressure', 'Secrecy Command'],
  },
  {
    id: 'ta',
    name: 'Tanglish',
    label: 'Tamil + English',
    flag: '🌊',
    accentColor: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'border-cyan-500/40',
    badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50',
    audio: '/samples/trustline-synthetic-tanglish-call.mp3',
    noisyAudio: '/samples/trustline-synthetic-tanglish-call-telephony-10db.wav',
    quietAudio: '/samples/trustline-synthetic-tanglish-call-quiet-24db.wav',
    compressedAudio: '/samples/trustline-synthetic-tanglish-call-telephony-16kbps.mp3',
    filename: 'trustline-synthetic-tanglish-call.mp3',
    profile: 'ta-en',
    target: 'ta-IN',
    transcript:
      'வணக்கம், நான் உங்கள் bank security team-லிருந்து பேசுகிறேன். உங்கள் account பத்து நிமிடத்தில் block ஆகும். verification-க்காக OTP சொல்லுங்கள். யாரிடமும் சொல்ல வேண்டாம்.',
    romanized:
      "Hello, I am speaking from your bank security team. Your account will be blocked in ten minutes. Say your OTP for verification. Don't tell anyone.",
    tactics: ['Bank Impersonation', 'Account Block Threat', 'OTP Demand'],
  },
  {
    id: 'bn',
    name: 'Benglish',
    label: 'Bengali + English',
    flag: '🌸',
    accentColor: 'from-green-500/20 to-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
    audio: '/samples/trustline-synthetic-benglish-call.mp3',
    noisyAudio: '/samples/trustline-synthetic-benglish-call-telephony-10db.wav',
    quietAudio: '/samples/trustline-synthetic-benglish-call-quiet-24db.wav',
    compressedAudio: '/samples/trustline-synthetic-benglish-call-telephony-16kbps.mp3',
    filename: 'trustline-synthetic-benglish-call.mp3',
    profile: 'bn-en',
    target: 'bn-IN',
    transcript:
      'নমস্কার, আমি আপনার bank security team থেকে বলছি। আপনার account দশ মিনিটের মধ্যে block হবে। verification-এর জন্য OTP বলুন। কাউকে বলবেন না।',
    romanized:
      "Greetings, I am speaking from your bank security team. Your account will be blocked in ten minutes. Say your OTP for verification. Don't tell anyone.",
    tactics: ['Bank Impersonation', 'False Urgency', 'Credential Harvesting'],
  },
];

interface SignatureDemoProps {
  onSelect: (file: File, profile: string, targetLanguage: string) => void;
}

export const SignatureDemo: React.FC<SignatureDemoProps> = ({ onSelect }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClip = async (
    clip: SignatureClip,
    variant: 'clean' | 'noisy' | 'quiet' | 'compressed' = 'clean'
  ) => {
    const url =
      variant === 'noisy'
        ? clip.noisyAudio
        : variant === 'quiet'
        ? clip.quietAudio
        : variant === 'compressed'
        ? clip.compressedAudio
        : clip.audio;
    const filename = variant === 'clean' ? clip.filename : url.split('/').pop()!;
    setLoading(`${clip.id}-${variant}`);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not load demo audio (${response.status}).`);
      const blob = await response.blob();
      const fallbackType = filename.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
      const file = new File([blob], filename, { type: blob.type || fallbackType });
      onSelect(file, clip.profile, clip.target);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Could not load this demo clip.'
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <section
      aria-labelledby="signature-demo-title"
      className="space-y-5 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-[#171432] via-[#101329] to-[#0E132A] p-5 sm:p-7"
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-950/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Signature Demonstration
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-yellow-300">
              <Trophy className="h-3 w-3" /> Mixed Vibes Award Target
            </div>
          </div>
          <h2
            id="signature-demo-title"
            className="text-xl font-black text-white sm:text-2xl"
          >
            One scam. Three code-mixed voices.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Hinglish · Tanglish · Benglish.
            </span>
          </h2>
          <p className="text-[11px] font-semibold text-violet-200">
            Design objective for this demo — not a measured error-rate claim.
          </p>
          <p className="max-w-3xl text-xs leading-relaxed text-slate-300">
            The same OTP-demand, bank-impersonation scam rendered in India's three most common
            code-mixed speech patterns. Gnani Prisma v3 handles each with dedicated code-switch
            profiles. Load any clip into the real analysis pipeline below.
          </p>
        </div>
      </div>

      {/* ── Clips Grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {clips.map((clip) => (
          <article
            key={clip.id}
            className={`flex flex-col gap-3 rounded-2xl border ${clip.borderColor} bg-gradient-to-b ${clip.accentColor} bg-[#090C19]/80 p-4`}
          >
            {/* Language header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{clip.flag}</span>
                  <h3 className="font-extrabold text-white">{clip.name}</h3>
                </div>
                <p className="text-[11px] text-slate-400">{clip.label} · Code-switched speech</p>
              </div>
              <span
                className={`rounded-full border px-2 py-1 text-[9px] font-bold ${clip.badgeColor}`}
              >
                STT: {clip.profile}
              </span>
            </div>

            {/* Audio player */}
            <audio
              controls
              preload="none"
              src={clip.audio}
              aria-label={`Synthetic ${clip.name} scam scenario`}
              className="h-9 w-full"
            />

            {/* Bilingual transcript */}
            <div className="space-y-2 rounded-xl bg-black/30 p-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Native Script
              </div>
              <p
                lang={clip.id === 'ta' ? 'ta' : clip.id === 'bn' ? 'bn' : 'hi-Latn'}
                className="text-xs font-medium leading-relaxed text-slate-200"
              >
                "{clip.transcript}"
              </p>
              <div className="border-t border-slate-700/50 pt-2">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  English Meaning
                </div>
                <p className="text-[11px] italic leading-relaxed text-slate-400">
                  "{clip.romanized}"
                </p>
              </div>
            </div>

            {/* Scam tactics */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-400">
                <AlertTriangle className="h-3 w-3" /> Scam Tactics Detected
              </div>
              <div className="flex flex-wrap gap-1">
                {clip.tactics.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-rose-800/50 bg-rose-950/60 px-2 py-0.5 text-[9px] font-semibold text-rose-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Fictional Gnani-generated sample · not a real caller or validation case
            </p>

            {/* Primary CTA */}
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void loadClip(clip)}
              className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-xs font-bold text-white hover:bg-violet-600 disabled:cursor-wait disabled:opacity-60"
            >
              {loading === `${clip.id}-clean` ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Load into real pipeline <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Stress-test variants */}
            <div className="grid grid-cols-1 gap-1.5">
              {(
                [
                  ['noisy', '📞 Telephony sim · 8 kHz + 10 dB noise'],
                  ['quiet', '🔇 Low-level · −24 dB'],
                  ['compressed', '📱 Compressed · 8 kHz · 16 kbps MP3'],
                ] as const
              ).map(([variant, label]) => (
                <button
                  key={variant}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => void loadClip(clip, variant)}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-cyan-800/60 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-950/40 disabled:opacity-60"
                >
                  {loading === `${clip.id}-${variant}` ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-700/70 pt-4 text-[11px] text-slate-400">
        <span>🎙️ Gnani Prisma v3: code-mixed STT with language-hint profiles</span>
        <span>🧠 TRUSTLINE rules engine + Cohere behavioural coercion analysis</span>
        <span>🔊 Gnani Timbre v3: spoken warning in target language</span>
      </div>
    </section>
  );
};
