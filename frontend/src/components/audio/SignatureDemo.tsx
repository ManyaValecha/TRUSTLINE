import React, { useState } from 'react';
import { ArrowDownToLine, ArrowRight, LoaderCircle, Play, ShieldCheck } from 'lucide-react';

type SignatureClip = {
  id: string;
  name: string;
  label: string;
  audio: string;
  noisyAudio: string;
  filename: string;
  profile: string;
  target: string;
  transcript: string;
};

const clips: SignatureClip[] = [
  {
    id: 'hi', name: 'Hinglish', label: 'Hindi + English',
    audio: '/samples/trustline-synthetic-hinglish-call.mp3',
    noisyAudio: '/samples/trustline-synthetic-hinglish-call-telephony-10db.wav',
    filename: 'trustline-synthetic-hinglish-call.mp3', profile: 'hi-en', target: 'hi-IN',
    transcript: 'Namaste, main aapke bank security team se bol raha hoon. Aapka account das minute mein block ho sakta hai. Verification ke liye apna OTP bata dijiye. Kisi ko mat batana.',
  },
  {
    id: 'ta', name: 'Tanglish', label: 'Tamil + English',
    audio: '/samples/trustline-synthetic-tanglish-call.mp3',
    noisyAudio: '/samples/trustline-synthetic-tanglish-call-telephony-10db.wav',
    filename: 'trustline-synthetic-tanglish-call.mp3', profile: 'ta-en', target: 'ta-IN',
    transcript: 'வணக்கம், நான் உங்கள் bank security team-லிருந்து பேசுகிறேன். உங்கள் account பத்து நிமிடத்தில் block ஆகும். verification-க்காக OTP சொல்லுங்கள். யாரிடமும் சொல்ல வேண்டாம்.',
  },
  {
    id: 'bn', name: 'Benglish', label: 'Bengali + English',
    audio: '/samples/trustline-synthetic-benglish-call.mp3',
    noisyAudio: '/samples/trustline-synthetic-benglish-call-telephony-10db.wav',
    filename: 'trustline-synthetic-benglish-call.mp3', profile: 'bn-en', target: 'bn-IN',
    transcript: 'নমস্কার, আমি আপনার bank security team থেকে বলছি। আপনার account দশ মিনিটের মধ্যে block হবে। verification-এর জন্য OTP বলুন। কাউকে বলবেন না।',
  },
];

interface SignatureDemoProps {
  onSelect: (file: File, profile: string, targetLanguage: string) => void;
}

export const SignatureDemo: React.FC<SignatureDemoProps> = ({ onSelect }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClip = async (clip: SignatureClip, noisy = false) => {
    const url = noisy ? clip.noisyAudio : clip.audio;
    const filename = noisy ? clip.noisyAudio.split('/').pop()! : clip.filename;
    setLoading(`${clip.id}-${noisy ? 'noisy' : 'clean'}`);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not load demo audio (${response.status}).`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type || (noisy ? 'audio/wav' : 'audio/mpeg') });
      onSelect(file, clip.profile, clip.target);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load this demo clip.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section aria-labelledby="signature-demo-title" className="space-y-5 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-[#171432] via-[#101329] to-[#0E132A] p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-950/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-200"><ShieldCheck className="h-3.5 w-3.5" /> Signature demonstration</div>
          <h2 id="signature-demo-title" className="text-xl font-black text-white sm:text-2xl">One scam. Three languages. Zero confusion.</h2>
          <p className="text-[11px] font-semibold text-violet-200">A design objective for this demonstration, not a measured error-rate claim.</p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-300">Three fictional recordings express the same bank-impersonation, account-threat, and OTP-demand scenario. The text below is the authored reference script, not a transcription result. Select a clip to load it into the real provider flow; analysis starts only after you separately confirm audio-sharing consent.</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {clips.map((clip) => (
          <article key={clip.id} className="flex flex-col gap-3 rounded-2xl border border-slate-700/80 bg-[#090C19]/80 p-4">
            <div><h3 className="font-extrabold text-white">{clip.name}</h3><p className="text-[11px] text-slate-400">{clip.label}</p></div>
            <audio controls preload="none" src={clip.audio} aria-label={`Synthetic ${clip.name} scam scenario`} className="h-9 w-full" />
            <p lang={clip.id === 'ta' ? 'ta' : clip.id === 'bn' ? 'bn' : 'hi-Latn'} className="min-h-24 rounded-xl bg-black/20 p-3 text-xs leading-relaxed text-slate-200">“{clip.transcript}”</p>
            <p className="text-[10px] text-slate-500">Fictional Gnani-generated sample · not a real caller or validation case</p>
            <button type="button" disabled={loading !== null} onClick={() => void loadClip(clip)} className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-xs font-bold text-white hover:bg-violet-600 disabled:cursor-wait disabled:opacity-60">
              {loading === `${clip.id}-clean` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Use clean clip · then consent and analyse <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button type="button" disabled={loading !== null} onClick={() => void loadClip(clip, true)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-800/60 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-950/40 disabled:opacity-60">
              {loading === `${clip.id}-noisy` ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
              Load synthetic 8 kHz + 10 dB variant
            </button>
          </article>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-700/70 pt-4 text-[11px] text-slate-400">
        <span>Gnani Prisma v3: speech-to-text and detected language</span>
        <span>TRUSTLINE: evidence rules, risk synthesis, and uncertainty labels</span>
        <span>Gnani Timbre: spoken guidance where configured</span>
      </div>
    </section>
  );
};
