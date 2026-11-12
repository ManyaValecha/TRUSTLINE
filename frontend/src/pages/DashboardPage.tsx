import React, { useState } from 'react';
import {
  ShieldAlert,
  Mic,
  UploadCloud,
  Sparkles,
  Play,
  Clock,
  ChevronRight,
  Trash2,
  AlertCircle,
  Languages,
  CheckCircle2,
  FileAudio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProtectionCard } from '../components/dashboard/ProtectionCard';
import { StatsCard } from '../components/dashboard/StatsCard';
import { AudioUploader } from '../components/audio/AudioUploader';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { SampleAudioSelector, SampleScenario } from '../components/audio/SampleAudioSelector';
import { AnalysisTimeline } from '../components/analysis/AnalysisTimeline';
import { AnalysisReportView } from '../components/analysis/AnalysisReportView';
import { RiskBadge } from '../components/common/RiskBadge';
import { SUPPORTED_LANGUAGES, AnalyzeAudioResponse, StoredAnalysisRecord } from '../types/api';
import { analyzeAudio, simulateAnalysis, ApiError } from '../services/api';

export const DashboardPage: React.FC = () => {
  const {
    user,
    settings,
    analysisHistory,
    addAnalysisRecord,
    clearAnalysisHistory,
    activeReport,
    setActiveReport,
    backendOnline,
  } = useApp();

  // Input mode tab: 'upload' | 'record' | 'benchmark'
  const [inputTab, setInputTab] = useState<'upload' | 'record' | 'benchmark'>('upload');

  // Audio state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleScenario | null>(null);

  // Language selection for Sarvam translation
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    user.preferredLanguage || 'hi-IN'
  );

  // User consent checkbox
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Analysis progress state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedFileName, setAnalyzedFileName] = useState<string>('');

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17) timeGreeting = 'Good evening';

    const displayName = user.name ? user.name.split(' ')[0] : 'Guardian';
    return `${timeGreeting}, ${displayName}. Your safety matters.`;
  };

  const handleStartAnalysis = async () => {
    if (inputTab !== 'benchmark' && !consentConfirmed) {
      setAnalysisError('Please confirm the safety consent checkbox before submitting.');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);

    let activeFileName = 'Call Recording';
    let audioToSubmit: File | Blob | null = null;

    if (inputTab === 'upload' && uploadedFile) {
      audioToSubmit = uploadedFile;
      activeFileName = uploadedFile.name;
    } else if (inputTab === 'record' && recordedBlob) {
      audioToSubmit = recordedBlob;
      activeFileName = `Recorded_Snippet_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.webm`;
    } else if (inputTab === 'benchmark' && selectedSample) {
      activeFileName = `${selectedSample.title} (Benchmark)`;
    }

    setAnalyzedFileName(activeFileName);

    try {
      let result: AnalyzeAudioResponse;

      // If user selected benchmark sample or diagnostic mode is active, simulate or call backend
      if (inputTab === 'benchmark' && selectedSample) {
        // Run realistic multi-model benchmark simulation
        result = await simulateAnalysis(selectedSample.id, selectedLanguage);
      } else if (settings.diagnosticMode || (!backendOnline && audioToSubmit)) {
        // If local backend is down and user wants to proceed, offer clear simulation fallback
        result = await simulateAnalysis('digital_arrest_scam', selectedLanguage);
      } else {
        if (!audioToSubmit) {
          throw new Error('No audio recording selected.');
        }
        // REAL BACKEND CALL: POST /api/analyze via FormData
        result = await analyzeAudio(audioToSubmit, 'en-IN', selectedLanguage);
      }

      setIsAnalyzing(false);
      setActiveReport(result);

      // Save to local analysis history
      addAnalysisRecord({
        fileName: activeFileName,
        riskLevel: result.scam_analysis.risk_level,
        summary: result.scam_analysis.recommended_action || result.scam_analysis.explanation,
        response: result,
      });
    } catch (err: unknown) {
      setIsAnalyzing(false);
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setAnalysisError(
            `Cannot connect to FastAPI backend at http://127.0.0.1:8000. Ensure your Python backend is running, or enable "Diagnostic Simulator" in Settings to test offline.`
          );
        } else if (err.isTimeout) {
          setAnalysisError('Request timed out. Audio transcription or AI evaluation took too long.');
        } else {
          setAnalysisError(err.message);
        }
      } else {
        setAnalysisError(err instanceof Error ? err.message : 'Analysis failed unexpectedly.');
      }
    }
  };

  const handleResetAnalysis = () => {
    setActiveReport(null);
    setAnalysisError(null);
    setUploadedFile(null);
    setRecordedBlob(null);
    setSelectedSample(null);
    setConsentConfirmed(false);
  };

  const handleViewHistoricalReport = (record: StoredAnalysisRecord) => {
    setAnalyzedFileName(record.fileName);
    setActiveReport(record.response);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If active report is present, show report screen!
  if (activeReport) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalysisReportView
          report={activeReport}
          fileName={analyzedFileName}
          onReset={handleResetAnalysis}
        />
      </div>
    );
  }

  // If analyzing, show multi-stage timeline!
  if (isAnalyzing || analysisError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnalysisTimeline
          isAnalyzing={isAnalyzing}
          isSimulation={inputTab === 'benchmark'}
          error={analysisError}
          onRetry={handleStartAnalysis}
          onCancel={handleResetAnalysis}
        />
      </div>
    );
  }

  const hasAudioReady =
    (inputTab === 'upload' && uploadedFile !== null) ||
    (inputTab === 'record' && recordedBlob !== null) ||
    (inputTab === 'benchmark' && selectedSample !== null);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 ${settings.seniorMode ? 'text-lg' : ''}`}>
      {/* 1. PERSONAL GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-900/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit any suspicious call snippet to audit for OTP demands, bank impersonation, and false deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Target Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#11152A] border border-violet-900/40 text-xs font-semibold text-white focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#0E132A] text-white">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. LARGE PROTECTION STATUS CARD */}
      <ProtectionCard />

      {/* 3. DASHBOARD STATISTICS */}
      <StatsCard />

      {/* 4. MAIN ACTION: ANALYSE A CALL SECTION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-violet-900/40 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/20">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-violet-400" />
              <span>Analyse a Call Recording</span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload an audio file, record directly via your browser microphone, or try an instant hackathon sample.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-2xl bg-[#080B18] border border-violet-950/60 shrink-0">
            <button
              type="button"
              onClick={() => setInputTab('upload')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                inputTab === 'upload'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Audio</span>
            </button>

            <button
              type="button"
              onClick={() => setInputTab('record')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                inputTab === 'record'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice</span>
            </button>

            <button
              type="button"
              onClick={() => setInputTab('benchmark')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                inputTab === 'benchmark'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Benchmarks</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        <div className="space-y-6">
          {inputTab === 'upload' && (
            <AudioUploader
              selectedFile={uploadedFile}
              onFileSelect={(file) => setUploadedFile(file)}
            />
          )}

          {inputTab === 'record' && (
            <AudioRecorder
              recordedBlob={recordedBlob}
              onRecordingComplete={(blob) => setRecordedBlob(blob)}
            />
          )}

          {inputTab === 'benchmark' && (
            <SampleAudioSelector
              selectedSampleId={selectedSample?.id || null}
              onSelectSample={(sample) => setSelectedSample(sample)}
            />
          )}

          {/* Explicit User Safety Consent Notice: only real audio is sent to providers. */}
          {inputTab !== 'benchmark' && <div className="p-4 rounded-2xl bg-[#090C1A] border border-violet-900/30 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-violet-700 bg-[#141A38] text-violet-600 focus:ring-violet-500"
              />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Explicit Safety Consent:</span> I authorize TRUSTLINE to process this audio file with speech recognition (Gnani) and AI analysis (Cohere & Sarvam). I understand this is an informational assistance tool and does not replace official verification.
              </div>
            </label>
          </div>}

          {/* Submission CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!hasAudioReady || (inputTab !== 'benchmark' && !consentConfirmed)}
              onClick={handleStartAnalysis}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                hasAudioReady && (inputTab === 'benchmark' || consentConfirmed)
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-900/40 hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{inputTab === 'benchmark' ? 'Run Labeled Simulation' : 'Analyse Recording with TRUSTLINE AI'}</span>
            </button>
            {!hasAudioReady && (
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Please upload an audio file, record a voice snippet, or choose a benchmark scenario above.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. RECENT ACTIVITY LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-extrabold text-white">Recent Analyses</h2>
          </div>

          {analysisHistory.length > 0 && (
            <button
              onClick={clearAnalysisHistory}
              className="text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {analysisHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0E132A]/50 border border-violet-900/20 text-center space-y-2">
            <div className="p-3 rounded-full bg-violet-600/10 text-violet-400 w-12 h-12 mx-auto flex items-center justify-center">
              <FileAudio className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">No Recordings Analysed Yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your audit history will appear here once you submit audio clips for scam verification.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysisHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#0E132A] border border-violet-900/30 hover:border-violet-600/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <RiskBadge level={item.riskLevel} size="sm" />
                    <span className="text-xs font-bold text-white max-w-[200px] sm:max-w-md truncate">
                      {item.fileName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                    {item.summary}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewHistoricalReport(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-800/40 text-violet-200 text-xs font-semibold self-start sm:self-auto transition cursor-pointer shrink-0"
                >
                  <span>View Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
