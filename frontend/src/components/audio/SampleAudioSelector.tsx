import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface SampleScenario {
  id: 'bank_kyc_scam' | 'courier_threat_scam' | 'safe_hospital_call';
  title: string;
  category: 'High-Risk Scam' | 'Extortion Scam' | 'Legitimate Call';
  expectedRisk: 'HIGH' | 'LOW';
  description: string;
  transcriptSnippet: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'bank_kyc_scam',
    title: 'Bank KYC Deactivation & Urgent OTP Demand',
    category: 'High-Risk Scam',
    expectedRisk: 'HIGH',
    description: 'Impersonates SBI Fraud Dept, claims account will be frozen in 10 minutes, demands SMS OTP.',
    transcriptSnippet:
      '"Your net banking is suspended due to unverified KYC. Give me the 6-digit OTP code received on SMS right now..."',
  },
  {
    id: 'courier_threat_scam',
    title: 'Customs Contraband & Digital Arrest Threat',
    category: 'Extortion Scam',
    expectedRisk: 'HIGH',
    description: 'Fabricates illegal package seizure at airport, claims CBI warrant, extorts urgent UPI payment.',
    transcriptSnippet:
      '"Package seized with contraband. A CBI warrant has been issued against your Aadhaar. Transfer 25,000 via UPI..."',
  },
  {
    id: 'safe_hospital_call',
    title: 'Apollo Clinic Routine Appointment Confirmation',
    category: 'Legitimate Call',
    expectedRisk: 'LOW',
    description: 'Routine healthcare confirmation with Dr. Verma. No advance payment or credentials asked.',
    transcriptSnippet:
      '"Calling from City Apollo Clinic to confirm your routine checkup tomorrow at 10:30 AM with Dr. Verma..."',
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
            Hackathon / Benchmark Scenarios
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Instant test without external audio file
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
                  {isSelected ? 'Selected' : 'Use this benchmark'}
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
