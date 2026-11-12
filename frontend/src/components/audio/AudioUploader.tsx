import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, X, AlertCircle, Play, Pause } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onFileSelect,
  selectedFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const allowedFormats = ['.wav', '.mp3', '.m4a', '.aac', '.webm', '.ogg'];
  // Vercel Functions reject request bodies above 4.5 MB. Keep margin for
  // multipart overhead while retaining the local backend's 20 MiB limit.
  const maxSizeBytes = import.meta.env.PROD ? 4 * 1024 * 1024 : 20 * 1024 * 1024;
  const maxSizeLabel = import.meta.env.PROD ? '4 MiB' : '20 MiB';

  const validateAndSet = (file: File) => {
    setError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedFormats.includes(ext) && !file.type.startsWith('audio/')) {
      setError(`Unsupported audio format. Supported: ${allowedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the ${maxSizeLabel} limit.`);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSet(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.aac,.webm,.ogg"
        onChange={handleFileChange}
        className="hidden"
        id="audio-file-input"
      />

      {!selectedFile ? (
        <label
          htmlFor="audio-file-input"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? 'border-violet-400 bg-violet-950/40 scale-[1.01]'
              : 'border-violet-900/40 bg-[#0E132A]/70 hover:border-violet-500/50 hover:bg-[#111736]'
          }`}
        >
          <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 mb-3 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-sm font-bold text-white text-center">
            Click to upload or drag & drop call recording
          </div>
          <p className="mt-1 text-xs text-slate-400 text-center">
            WAV, MP3, M4A, AAC, WebM (Max {maxSizeLabel}, 60 seconds)
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/40 text-[11px] text-violet-300 font-medium">
            <span>Explicit user consent required before analysis</span>
          </div>
        </label>
      ) : (
        <div className="p-4 rounded-2xl bg-[#0E132A] border border-violet-500/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-500/20 text-violet-300">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white max-w-[200px] sm:max-w-md truncate">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || 'audio file'}
                </div>
              </div>
            </div>

            <button
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
              title="Remove audio file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Player preview */}
          {previewUrl && (
            <div className="p-3 rounded-xl bg-[#080B18] border border-violet-900/30 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <audio
                ref={audioRef}
                src={previewUrl}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-8"
                controls
              />
            </div>
          )}
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
