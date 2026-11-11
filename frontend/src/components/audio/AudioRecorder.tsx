import React, { useState } from 'react';
import { Mic, Square, Play, Pause, Trash2, AlertCircle, Volume2, ShieldAlert } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
  recordedBlob: Blob | null;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  recordedBlob,
}) => {
  const {
    status,
    duration,
    audioUrl,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const [hasPermissionConsent, setHasPermissionConsent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!hasPermissionConsent) {
      return;
    }
    try {
      await startRecording();
    } catch {
      // error handled in hook
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleClear = () => {
    clearRecording();
    onRecordingComplete(null);
    setIsPlaying(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Explicit Consent Checkbox prior to recording */}
      {status === 'idle' && !recordedBlob && !audioUrl && (
        <div className="p-4 rounded-xl bg-[#0B0E20] border border-violet-900/40 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasPermissionConsent}
              onChange={(e) => setHasPermissionConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-violet-700 bg-[#151936] text-violet-600 focus:ring-violet-500"
            />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Browser Microphone Consent:</span> I authorize TRUSTLINE to record this audio snippet strictly for behavioral scam analysis. I acknowledge that TRUSTLINE does NOT monitor cellular calls in the background.
            </div>
          </label>
        </div>
      )}

      {/* Recording State UI */}
      {status === 'idle' && !recordedBlob && !audioUrl && (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-violet-900/40 bg-[#0E132A]/70 text-center">
          <button
            type="button"
            onClick={handleStart}
            disabled={!hasPermissionConsent}
            className={`p-6 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
              hasPermissionConsent
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <div className="mt-4 text-sm font-bold text-white">
            {hasPermissionConsent ? 'Tap to Start Microphone Recording' : 'Accept Consent Above to Record'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Speak suspicious statements or test suspicious caller phrases.
          </p>
        </div>
      )}

      {/* Live Recording In-Progress */}
      {status === 'recording' && (
        <div className="p-6 rounded-2xl border-2 border-rose-500/50 bg-[#160D1A] space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Recording in progress
            </span>
          </div>

          {/* Timer Display */}
          <div className="text-4xl font-extrabold text-white font-mono tracking-wider">
            {formatTime(duration)}
          </div>

          {/* Animated Audio Waveform Levels */}
          <div className="flex items-center justify-center gap-1.5 h-12">
            {[0.2, 0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.9, 0.7].map((factor, idx) => {
              const heightMultiplier = Math.max(0.15, Math.min(1, (audioLevel || 0.3) * factor * 1.5));
              return (
                <div
                  key={idx}
                  className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-violet-400 transition-all duration-75"
                  style={{ height: `${Math.round(heightMultiplier * 44)}px` }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Recording Preview */}
      {(status === 'stopped' || audioUrl) && (
        <div className="p-5 rounded-2xl bg-[#0E132A] border border-violet-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-300">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Audio Capture Ready</div>
                <div className="text-xs text-slate-400">
                  Duration: {formatTime(duration)} &bull; Ready for analysis
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          </div>

          {audioUrl && (
            <div className="pt-2">
              <audio
                src={audioUrl}
                controls
                className="w-full h-9 rounded-lg"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-900/30 text-xs text-violet-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-violet-400" />
            <span>Click <strong>"Analyse Recording"</strong> below to send this clip to Gnani, Cohere, and Sarvam for behavioral analysis.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
