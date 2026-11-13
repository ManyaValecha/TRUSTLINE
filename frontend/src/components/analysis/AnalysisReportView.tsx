import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Share2,
  PhoneCall,
  Languages,
  BrainCircuit,
  Cpu,
  Layers,
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Users,
} from 'lucide-react';
import { AnalyzeAudioResponse, RiskLevel } from '../../types/api';
import { RiskBadge } from '../common/RiskBadge';
import { useApp } from '../../context/AppContext';

interface AnalysisReportViewProps {
  report: AnalyzeAudioResponse;
  fileName?: string;
  onReset: () => void;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({
  report,
  fileName = 'Call Recording',
  onReset,
}) => {
  const { settings, setActiveTab } = useApp();
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showFamilyExplanation, setShowFamilyExplanation] = useState(false);
  const [familyLanguage, setFamilyLanguage] = useState<'en' | 'hi'>('en');
  const [familyCopyStatus, setFamilyCopyStatus] = useState('');

  const { transcription, scam_analysis, translated_warning, target_language, ai_analysis, rule_analysis } = report;
  const riskLevel: RiskLevel = scam_analysis?.risk_level || 'LOW';
  const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  const isMedium = riskLevel === 'MEDIUM';
  const isLow = riskLevel === 'LOW';
  const evidenceItems: Array<{
    quote: string;
    category?: string;
    explanation?: string;
    source?: string;
    location?: string;
  }> = scam_analysis?.signals?.length
    ? scam_analysis.signals.map((signal) => ({
        quote: signal.evidence,
        category: signal.category,
        explanation: signal.explanation,
        source: signal.source,
        location: `Transcript characters ${signal.start + 1}–${signal.end}`,
      }))
    : (scam_analysis?.evidence ?? []).map((quote) => ({ quote }));
  const familyEvidence = evidenceItems[0]?.quote;
  const isFamilyEmergency = scam_analysis.detected_tactics.some((tactic) => tactic.toLowerCase().includes('family emergency'));
  const familyExplanation = familyLanguage === 'en'
    ? (isLow
      ? 'This check did not find a major warning sign in the transcript it received. It cannot confirm that the conversation is safe.'
      : `This conversation includes wording related to ${scam_analysis.detected_tactics.slice(0, 2).join(' and ').toLowerCase() || 'a suspicious request'}. This is a warning to verify, not proof that fraud happened.`)
    : (isLow
      ? 'जांच में बातचीत में कोई बड़ा चेतावनी संकेत नहीं मिला। इससे यह साबित नहीं होता कि बातचीत सुरक्षित है।'
      : 'बातचीत में कुछ बातें धोखाधड़ी की कोशिश जैसी लग सकती हैं। यह सावधानी की चेतावनी है, धोखाधड़ी का पक्का सबूत नहीं।');
  const familySteps = familyLanguage === 'en'
    ? ['Pause or end the call.', 'Do not share an OTP, PIN, password, or send money.', isFamilyEmergency ? 'Call your relative directly using a number you already trust.' : 'Call your bank using a number you already trust.']
    : ['रुकें या कॉल बंद करें।', 'ओटीपी, पिन, पासवर्ड न बताएं और पैसे न भेजें।', isFamilyEmergency ? 'पहले से भरोसेमंद नंबर पर अपने रिश्तेदार को सीधे फोन करें।' : 'पहले से भरोसेमंद नंबर पर अपने बैंक को फोन करें।'];
  const familyShareText = [
    `TRUSTLINE review — ${riskLevel} risk band`,
    familyExplanation,
    familyEvidence ? `Transcript excerpt: “${familyEvidence}”` : '',
    ...familySteps.map((step, index) => `${index + 1}. ${step}`),
  ].filter(Boolean).join('\n');

  const handleCopyTranscript = () => {
    if (!transcription?.transcript) return;
    navigator.clipboard.writeText(transcription.transcript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleCopySummary = () => {
    const summaryText = `TRUSTLINE SAFETY AUDIT
Risk band: ${riskLevel}
Recommended Action: ${scam_analysis?.recommended_action || 'N/A'}
Warning: ${translated_warning || scam_analysis?.explanation || 'N/A'}
`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyFamilyExplanation = async () => {
    try {
      await navigator.clipboard.writeText(familyShareText);
      setFamilyCopyStatus('Copied. Choose a trusted app and recipient to share it yourself.');
    } catch {
      setFamilyCopyStatus('Clipboard access is unavailable. Select and copy the preview text manually.');
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${settings.seniorMode ? 'text-lg' : ''}`}>
      {report.simulation && (
        <div role="status" className="rounded-2xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          <strong>Simulation only.</strong> This example uses prewritten demo content; no uploaded audio was transcribed and no AI provider was contacted.
        </div>
      )}
      {scam_analysis?.uncertainty && (
        <div role="status" className="rounded-2xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          <strong>Incomplete analysis.</strong> {scam_analysis.uncertainty} Use caution and verify requests independently.
        </div>
      )}
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11152A] hover:bg-[#181F3D] border border-violet-900/30 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyse Another Recording</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-800/40 text-violet-200 text-xs font-semibold transition cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Summary Copied' : 'Share Safety Summary'}</span>
          </button>
          <button
            type="button"
            aria-expanded={showFamilyExplanation}
            aria-controls="family-explanation"
            onClick={() => setShowFamilyExplanation((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-800/50 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-900/40"
          >
            <Users className="h-3.5 w-3.5" /> Explain it to my family
          </button>
        </div>
      </div>

      {showFamilyExplanation && (
        <section id="family-explanation" aria-labelledby="family-explanation-title" className="space-y-4 rounded-3xl border border-cyan-800/40 bg-gradient-to-br from-[#0E1A2A] to-[#10142B] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="family-explanation-title" className="text-xl font-extrabold text-white">Explain it to my family</h2>
              <p className="mt-1 text-xs text-slate-300">Simple guidance that keeps the same risk band and evidence. It does not add a new fraud claim.</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <span>Language</span>
              <select value={familyLanguage} onChange={(event) => { setFamilyLanguage(event.target.value as 'en' | 'hi'); setFamilyCopyStatus(''); }} className="rounded-lg border border-slate-700 bg-[#080B18] px-2 py-1.5 text-white">
                <option value="en">Simple English</option>
                <option value="hi">सरल हिंदी</option>
              </select>
            </label>
          </div>
          <div className="rounded-2xl border border-slate-700/70 bg-black/20 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-200">{familyLanguage === 'en' ? 'What may be happening' : 'क्या हो सकता है'}</div>
            <p className="text-base leading-relaxed text-white">{familyExplanation}</p>
          </div>
          {familyEvidence && <blockquote className="rounded-xl border-l-2 border-amber-400 bg-black/20 px-4 py-3 text-sm text-amber-100">“{familyEvidence}”</blockquote>}
          <div>
            <h3 className="mb-2 text-sm font-bold text-white">{familyLanguage === 'en' ? 'Three steps to take now' : 'अभी ये तीन कदम उठाएं'}</h3>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-200">{familySteps.map((step) => <li key={step}>{step}</li>)}</ol>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-700 bg-[#090C19] p-4">
            <label htmlFor="family-share-preview" className="text-xs font-bold uppercase tracking-wide text-slate-300">Share preview</label>
            <textarea id="family-share-preview" readOnly value={familyShareText} rows={5} className="w-full resize-y rounded-xl border border-slate-700 bg-black/30 p-3 text-sm leading-relaxed text-slate-100" />
            <p className="text-xs text-slate-400">This preview includes one transcript excerpt when available. Nothing is sent automatically; the message is copied only when you choose the button.</p>
            <button type="button" onClick={handleCopyFamilyExplanation} className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600">Copy preview</button>
            {familyCopyStatus && <p role="status" className="text-xs text-cyan-200">{familyCopyStatus}</p>}
          </div>
        </section>
      )}

      {/* CRITICAL HIGH RISK BANNER */}
      {isHigh && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900/90 to-red-950 border-2 border-rose-500 shadow-[0_0_50px_-10px_rgba(239,68,68,0.5)] animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-600 text-white shrink-0 shadow-lg shadow-rose-950">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-black/60 border border-rose-400/60 text-rose-200 font-extrabold text-xs tracking-widest uppercase">
                  HIGH RISK INDICATORS
                </span>
                <span className="text-xs text-rose-200 font-semibold">
                  High-risk indicators found in the analyzed transcript
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                PAUSE. DO NOT SHARE CREDENTIALS OR SEND MONEY UNDER PRESSURE.
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/90 font-medium leading-relaxed">
                End the call and verify through a trusted, independently obtained number before acting. This risk warning is not proof that fraud occurred.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MEDIUM RISK BANNER */}
      {isMedium && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-amber-900/80 to-yellow-950 border-2 border-amber-500/70 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-600 text-white shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-black/50 border border-amber-400/50 text-amber-200 font-bold text-xs uppercase">
                Caution Advised
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Be Careful. Verify Before Taking Any Action.
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Suspicious conversational indicators detected. Do not click links or send funds without independent verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOW RISK BANNER */}
      {isLow && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-teal-950 border-2 border-emerald-500/70 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-black/50 border border-emerald-400/50 text-emerald-200 font-bold text-xs uppercase">
                No Indicators Found
              </span>
              <h2 className="text-xl font-extrabold text-white">
                No Major Scam Indicators Detected.
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                No major indicators were identified in this analysis. This does not prove the conversation is safe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Assessment Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-violet-900/40 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-violet-900/30">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
              Risk Assessment
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge level={riskLevel} size="lg" />
              <div className="text-xs font-semibold text-slate-300">
                Risk interpretation:{' '}
                <span className={scam_analysis?.is_scam_likely ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {scam_analysis?.is_scam_likely ? 'Suspicious indicators found' : 'No strong indicators found'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400">File Analysed</div>
            <div className="text-xs font-mono font-semibold text-white max-w-[200px] truncate">
              {fileName}
            </div>
          </div>
        </div>

        {/* Recommended Action Box */}
        {scam_analysis?.recommended_action && (
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isHigh
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
              : isMedium
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-100'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm tracking-wide uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>Recommended Immediate Action</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">
              {scam_analysis.recommended_action}
            </p>
          </div>
        )}

        {/* Translated Warning Box (Sarvam Indic Translation) */}
        {translated_warning && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Languages className="w-4 h-4" />
                <span>Regional Language Safety Advisory ({report.simulation ? 'sample text' : 'Sarvam AI'})</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-indigo-300 border border-indigo-800/40">
                {report.translated_warning_language || target_language || 'hi-IN'}
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              "{translated_warning}"
            </p>
          </div>
        )}

        {/* Detected Manipulation Tactics & Evidence */}
        {scam_analysis?.detected_tactics && scam_analysis.detected_tactics.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Identified Manipulation Tactics ({scam_analysis.detected_tactics.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scam_analysis.detected_tactics.map((tactic, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#141A38] border border-rose-900/30 flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span className="text-xs font-semibold text-slate-200">{tactic}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript Evidence Quotes */}
        {evidenceItems.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Evidence Extracted from Audio</span>
            </div>

            <div className="space-y-2">
              {evidenceItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-amber-900/30 space-y-1.5"
                >
                  {item.category && <div className="flex flex-wrap items-center gap-2 text-[10px] text-amber-300 font-semibold uppercase tracking-wide">
                    <span>{item.category}</span><span>·</span><span>{item.source === 'cohere' ? 'Contextual AI' : 'Deterministic rule'}</span><span>·</span><span>{item.location}</span>
                  </div>}
                  <blockquote className="text-xs text-amber-100/90 font-mono italic">“{item.quote}”</blockquote>
                  {item.explanation && <p className="text-xs text-slate-300">{item.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Behavioral Explanation */}
        {scam_analysis?.explanation && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Behavioral & Psychological Analysis</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#111633] p-4 rounded-xl border border-violet-900/20">
              {scam_analysis.explanation}
            </p>
          </div>
        )}

        {/* Full Speech Transcript Section */}
        {transcription?.transcript && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <FileText className="w-4 h-4 text-violet-400" />
                <span>Full Speech Transcript ({transcription.provider || 'Gnani'})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  {copiedTranscript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullTranscript(!showFullTranscript)}
                  className="text-slate-400 hover:text-white"
                >
                  {showFullTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showFullTranscript && (
              <div className="p-4 rounded-2xl bg-[#090C1B] border border-violet-900/30 text-xs sm:text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {transcription.transcript}
              </div>
            )}
          </div>
        )}

        {/* Optional AI & Heuristic Rule Analysis (Backend Extension) */}
        {!report.simulation && (ai_analysis || rule_analysis) && (
          <div className="pt-2 border-t border-violet-900/20">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Detailed Provider Telemetry (AI & Rules Diagnostics)</span>
              </div>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                {ai_analysis && (
                  <div className="p-3.5 rounded-xl bg-[#121735] border border-cyan-900/30 text-xs space-y-2">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Cohere AI Analysis</span>
                    </div>
                    {ai_analysis.confidence_score !== undefined && (
                      <div className="text-slate-300">
                        Confidence: {(ai_analysis.confidence_score * 100).toFixed(0)}%
                      </div>
                    )}
                    {ai_analysis.sentiment && (
                      <div className="text-slate-300">
                        Tone / Atmosphere: {ai_analysis.sentiment}
                      </div>
                    )}
                    {ai_analysis.coercion_score !== undefined && (
                      <div className="text-slate-300">
                        Coercion Intensity: {ai_analysis.coercion_score}/10
                      </div>
                    )}
                  </div>
                )}

                {rule_analysis && (
                  <div className="p-3.5 rounded-xl bg-[#121735] border border-indigo-900/30 text-xs space-y-2">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Deterministic Rule Engine</span>
                    </div>
                    {rule_analysis.rules_triggered && (
                      <div className="space-y-1">
                        <span className="text-slate-400">Triggered Rules:</span>
                        <div className="flex flex-wrap gap-1">
                          {rule_analysis.rules_triggered.map((rule, rIdx) => (
                            <span key={rIdx} className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-indigo-300">
                              {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Provider Attribution Badges */}
        {!report.simulation && <div className="pt-4 border-t border-violet-900/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase font-bold text-slate-500">Pipeline status:</span>
            <span className="px-2 py-0.5 rounded bg-[#151936] text-violet-300 border border-violet-900/40 text-[11px]">
              Transcription {report.provider_status?.transcription || 'complete'}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151936] text-cyan-300 border border-cyan-900/40 text-[11px]">
              Context {report.provider_status?.contextual_analysis || 'complete'}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151936] text-emerald-300 border border-emerald-900/40 text-[11px]">
              Translation {report.provider_status?.translation || 'complete'}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151936] text-indigo-300 border border-indigo-900/40 text-[11px]">
              Speech {report.provider_status?.spoken_guidance || (report.spoken_warning?.success ? 'complete' : 'unavailable')}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Req ID: {transcription?.request_id || 'LOCAL-AUDIT'}
          </div>
        </div>}
        {!report.simulation && report.spoken_warning?.success && report.spoken_warning.audio_url && (
          <div className="pt-3">
            <div className="mb-2 text-xs font-semibold text-slate-300">Listen to the safety warning</div>
            <audio controls preload="none" className="w-full" src={report.spoken_warning.audio_url}>
              Your browser does not support audio playback.
            </audio>
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-[#090C19] border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-violet-400 shrink-0" />
          <span>Assistance Tool Notice</span>
        </div>
        <p className="leading-relaxed">
          AI analysis is an assistance tool, not a guarantee. When in doubt, disconnect and independently contact the organisation using its official contact details. For financial cyber fraud in India, immediately dial <strong className="text-rose-400">1930</strong>.
        </p>
      </div>
    </div>
  );
};
