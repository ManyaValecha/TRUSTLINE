import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export interface SampleScenario {
  id: 'digital_arrest_scam' | 'legitimate_bank_call' | 'family_emergency_scam';
  title: string;
  category: 'High-Risk Scam' | 'Legitimate Call';
  expectedRisk: 'HIGH' | 'LOW';
  description: string;
  transcriptSnippet: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'digital_arrest_scam',
    title: 'Digital Arrest and OTP Demand',
    category: 'High-Risk Scam',
    expectedRisk: 'HIGH',
    description: 'A caller impersonates a bank and police authority, threatens account action, demands an OTP, and asks for secrecy.',
    transcriptSnippet:
      '"Give me the 6-digit OTP now or your account will be frozen. Do not tell anyone; this is an active police case."',
  },
  {
    id: 'legitimate_bank_call',
    title: 'Legitimate Bank Security Call',
    category: 'Legitimate Call',
    expectedRisk: 'LOW',
    description: 'A bank representative reminds the customer never to share an OTP and asks them to call the official number on their card.',
    transcriptSnippet:
      '"We will never ask for your OTP or PIN. Please call the customer service number printed on your card if you need help."',
  },
  {
    id: 'family_emergency_scam',
    title: 'Family Emergency Impersonation',
    category: 'High-Risk Scam',
    expectedRisk: 'HIGH',
    description: 'A caller claims a relative is in danger, demands an immediate transfer, and pressures the listener not to verify.',
    transcriptSnippet:
      '"Your son has been detained. Send money now and do not call him; there is no time to check."',
  },
];

interface SampleAudioSelectorProps {
  onSelectSample: (sample: SampleScenario) => void;
  selectedSampleId: string | null;
}

export const SampleAudioSelector: React.FC<SampleAudioSelectorProps> = ({
  onSelectSample,
  selectedSampleId,
}) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Demo scenarios · simulated
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Prewritten examples only; no audio or provider is used
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_SCENARIOS.map((sample) => {
          const isSelected = selectedSampleId === sample.id;
          const isHigh = sample.expectedRisk === 'HIGH';

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-violet-950/60 border-violet-500 shadow-lg shadow-violet-950/50 scale-[1.02]'
                  : 'bg-[#0E132A] border-violet-900/30 hover:border-violet-700/60 hover:bg-[#121835]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHigh
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {sample.category}
                  </span>
                  {isHigh ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                <div className="text-xs font-bold text-white mb-1 leading-snug">
                  {sample.title}
                </div>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  {sample.description}
                </p>
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800/60 text-[10px] text-slate-300 italic font-mono mb-3 line-clamp-2">
                  {sample.transcriptSnippet}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                <span className={isSelected ? 'text-violet-300 font-bold' : 'text-slate-400'}>
                  {isSelected ? 'Selected' : 'View simulation'}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
