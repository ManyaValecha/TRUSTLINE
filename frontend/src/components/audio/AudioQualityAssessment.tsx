import React, { useEffect, useState } from 'react';
import { AlertTriangle, AudioLines, CircleHelp } from 'lucide-react';

type QualityResult = {
  duration: number;
  rmsDbfs: number;
  peakDbfs: number;
  clippedPercent: number;
  nearSilentPercent: number;
};

interface AudioQualityAssessmentProps {
  audio: Blob | null;
  filename?: string;
}

async function inspectWaveform(audio: Blob): Promise<QualityResult> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await audio.arrayBuffer());
    const stride = Math.max(1, Math.floor(decoded.sampleRate / 8000));
    let sumSquares = 0;
    let peak = 0;
    let count = 0;
    let clipped = 0;
    let nearSilent = 0;
    for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
      const samples = decoded.getChannelData(channel);
      for (let index = 0; index < samples.length; index += stride) {
        const magnitude = Math.abs(samples[index]);
        sumSquares += magnitude * magnitude;
        peak = Math.max(peak, magnitude);
        if (magnitude >= 0.999) clipped += 1;
        if (magnitude < 0.005) nearSilent += 1;
        count += 1;
      }
    }
    const rms = count ? Math.sqrt(sumSquares / count) : 0;
    const dbfs = (value: number) => value > 0 ? 20 * Math.log10(value) : -Infinity;
    return {
      duration: decoded.duration,
      rmsDbfs: dbfs(rms),
      peakDbfs: dbfs(peak),
      clippedPercent: count ? (clipped / count) * 100 : 0,
      nearSilentPercent: count ? (nearSilent / count) * 100 : 100,
    };
  } finally {
    await context.close();
  }
}

export const AudioQualityAssessment: React.FC<AudioQualityAssessmentProps> = ({ audio, filename }) => {
  const [result, setResult] = useState<QualityResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'unavailable'>('idle');

  useEffect(() => {
    let current = true;
    if (!audio) {
      setResult(null);
      setStatus('idle');
      return () => { current = false; };
    }
    setResult(null);
    setStatus('checking');
    inspectWaveform(audio)
      .then((quality) => {
        if (current) {
          setResult(quality);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (current) {
          setResult(null);
          setStatus('unavailable');
        }
      });
    return () => { current = false; };
  }, [audio]);

  if (!audio) return null;
  const warnings = result ? [
    result.rmsDbfs < -38 ? 'Overall signal level is very low; speech may be difficult to hear.' : '',
    result.clippedPercent > 0.5 ? 'Some samples are clipped; distortion may affect transcription.' : '',
    result.nearSilentPercent > 70 ? 'Most sampled audio is near-silent; check that the clip contains the intended speech.' : '',
    result.duration > 30 ? 'This clip exceeds the provider’s documented 30-second limit.' : '',
  ].filter(Boolean) : [];

  return (
    <section aria-live="polite" aria-label="Local audio signal check" className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-4">
      <div className="flex items-start gap-3">
        <AudioLines className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-xs font-bold text-cyan-100">Local audio signal check{filename ? ` · ${filename}` : ''}</h3>
          {status === 'checking' && <p className="text-xs text-slate-300">Reading audio waveform in this browser…</p>}
          {status === 'unavailable' && <p className="text-xs text-slate-300">This browser could not decode the file for a local signal check. The recording is unchanged.</p>}
          {result && <>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-300">
              <div><dt className="inline text-slate-500">Duration </dt><dd className="inline">{result.duration.toFixed(1)} s</dd></div>
              <div><dt className="inline text-slate-500">Level RMS </dt><dd className="inline">{Number.isFinite(result.rmsDbfs) ? `${result.rmsDbfs.toFixed(1)} dBFS` : 'silence'}</dd></div>
              <div><dt className="inline text-slate-500">Sampled peak </dt><dd className="inline">{Number.isFinite(result.peakDbfs) ? `${result.peakDbfs.toFixed(1)} dBFS` : 'silence'}</dd></div>
              <div><dt className="inline text-slate-500">Clipped samples </dt><dd className="inline">{result.clippedPercent.toFixed(2)}%</dd></div>
              <div><dt className="inline text-slate-500">Near-silent samples </dt><dd className="inline">{result.nearSilentPercent.toFixed(1)}%</dd></div>
            </dl>
            {warnings.length > 0 && <ul className="space-y-1 text-xs text-amber-200">{warnings.map((warning) => <li key={warning} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{warning}</li>)}</ul>}
            {warnings.length === 0 && <p className="text-xs text-emerald-200">No low-level, clipping, or long-silence warning from these basic checks.</p>}
          </>}
          <p className="flex gap-1.5 text-[10px] leading-relaxed text-slate-500"><CircleHelp className="mt-0.5 h-3 w-3 shrink-0" />Advisory waveform statistics only. They do not measure speech intelligibility, background noise, language accuracy, or scam risk and do not block analysis.</p>
        </div>
      </div>
    </section>
  );
};
