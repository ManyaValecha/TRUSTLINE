import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Database, FlaskConical } from 'lucide-react';

type MetricSet = {
  n: number;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  false_positive_rate: number | null;
  false_negative_rate: number | null;
  confusion_matrix: Record<string, number>;
  confidence_intervals_95_wilson: Record<string, [number, number] | null>;
};

type EvaluationData = {
  dataset: {
    name: string;
    version: string;
    records: number;
    scenario_families: number;
    languages: Record<string, number>;
    label_counts: Record<string, number>;
    provenance: string;
    split_config: { name: string; held_out_families: string[] };
  };
  evaluation: {
    timestamp_utc: string;
    rule_version: string;
    overall: MetricSet;
    held_out_test: MetricSet;
    per_language: Record<string, MetricSet>;
    per_scam_category: Record<string, { n: number; recall: number | null; expected_signal_recall: number | null }>;
    latency_ms: { mean: number; median: number; p95: number };
    detector_failures: number;
    uncertainty_rate: number | null;
  };
  ablations: Record<string, { status: string; reason?: string }>;
  limitations: string[];
};

const pct = (value: number | null | undefined) => value == null ? 'Unavailable' : `${(value * 100).toFixed(1)}%`;
const ci = (value: [number, number] | null | undefined) => value == null ? 'Unavailable' : `${pct(value[0])}–${pct(value[1])}`;

export const EvaluationPage: React.FC = () => {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/evaluation-results.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('No generated benchmark report is available in this build.');
        return response.json() as Promise<EvaluationData>;
      })
      .then((report) => { if (active) setData(report); })
      .catch((fetchError: unknown) => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : 'Could not load evaluation results.');
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="evaluation-title">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-200">
          <FlaskConical className="h-3.5 w-3.5" /> Reproducible evaluation
        </div>
        <h1 id="evaluation-title" className="text-3xl font-black tracking-tight text-white sm:text-4xl">What the current rules detect</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300">Results below are loaded from the generated benchmark artifact. This synthetic text pilot measures rule behavior on authored examples; it does not estimate real-world scam detection performance.</p>
      </header>

      {error && (
        <div role="status" className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-5 text-sm text-amber-100">
          <AlertTriangle className="mr-2 inline h-4 w-4" />{error} Run <code>PYTHONPATH=.. python -m evaluation.run_benchmark</code> from <code>backend/</code> and rebuild the frontend.
        </div>
      )}

      {data && <>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Overall rules-only results">
          {[
            ['Accuracy', pct(data.evaluation.overall.accuracy), 'accuracy'],
            ['Precision', pct(data.evaluation.overall.precision), 'precision'],
            ['Recall', pct(data.evaluation.overall.recall), 'recall'],
            ['F1', pct(data.evaluation.overall.f1), 'f1'],
          ].map(([label, value, key]) => (
            <article key={label} className="rounded-2xl border border-violet-900/40 bg-[#0E132A] p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-xs text-slate-500">Rules only · N={data.evaluation.overall.n} · {key === 'f1' ? '95% CI not computed' : `95% Wilson CI ${ci(data.evaluation.overall.confidence_intervals_95_wilson[key])}`}</div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-violet-900/40 bg-[#0E132A] p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><BarChart3 className="h-5 w-5 text-cyan-300" /> Error profile</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.evaluation.overall.confusion_matrix).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-black/25 p-3">
                  <div className="text-xs capitalize text-slate-400">{key.replaceAll('_', ' ')}</div>
                  <div className="mt-1 text-2xl font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="text-amber-200">False positive rate: {pct(data.evaluation.overall.false_positive_rate)}</span>
              <span className="text-rose-200">False negative rate: {pct(data.evaluation.overall.false_negative_rate)}</span>
            </div>
          </article>

          <article className="rounded-2xl border border-violet-900/40 bg-[#0E132A] p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><Database className="h-5 w-5 text-violet-300" /> Corpus and run</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-400">Records</dt><dd className="font-bold text-white">{data.dataset.records}</dd></div>
              <div><dt className="text-slate-400">Scenario families</dt><dd className="font-bold text-white">{data.dataset.scenario_families}</dd></div>
              <div><dt className="text-slate-400">Held-out families</dt><dd className="font-bold text-white">{data.dataset.split_config.held_out_families.length} · N={data.evaluation.held_out_test.n}</dd></div>
              <div><dt className="text-slate-400">Rule version</dt><dd className="font-mono text-xs text-white">{data.evaluation.rule_version}</dd></div>
              <div className="col-span-2"><dt className="text-slate-400">Generated</dt><dd className="text-xs text-white">{new Date(data.evaluation.timestamp_utc).toLocaleString()}</dd></div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">{data.dataset.provenance} Languages: {Object.entries(data.dataset.languages).map(([language, count]) => `${language} ${count}`).join(' · ')}. Uncertain result rate: {pct(data.evaluation.uncertainty_rate)}.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-violet-900/40 bg-[#0E132A] p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Performance by language</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400"><tr><th className="py-2">Language</th><th>N</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
              <tbody>{Object.entries(data.evaluation.per_language).map(([language, metrics]) => (
                <tr key={language} className="border-t border-slate-800 text-slate-200"><th className="py-3 font-semibold">{language}</th><td>{metrics.n}</td><td>{pct(metrics.accuracy)}</td><td>{pct(metrics.precision)}</td><td>{pct(metrics.recall)}</td><td>{pct(metrics.f1)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-violet-900/40 bg-[#0E132A] p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Scam-category signal recall</h2>
            <div className="space-y-3">{Object.entries(data.evaluation.per_scam_category).map(([category, metrics]) => (
              <div key={category}>
                <div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-slate-300">{category}</span><span className="text-slate-400">{pct(metrics.expected_signal_recall)} · n={metrics.n}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(0, Math.min(100, (metrics.expected_signal_recall ?? 0) * 100))}%` }} /></div>
              </div>
            ))}</div>
          </article>
          <article className="rounded-2xl border border-violet-900/40 bg-[#0E132A] p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Component ablations</h2>
            <div className="space-y-3">{Object.entries(data.ablations).map(([name, item]) => (
              <div key={name} className="flex items-start gap-3 rounded-xl bg-black/20 p-3">
                {item.status === 'measured' ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />}
                <div><div className="text-sm font-semibold capitalize text-white">{name.replaceAll('_', ' ')}</div><p className="text-xs text-slate-400">{item.status === 'measured' ? 'Measured in this report.' : item.reason}</p></div>
              </div>
            ))}</div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">Local rules latency: mean {data.evaluation.latency_ms.mean.toFixed(4)} ms, p95 {data.evaluation.latency_ms.p95.toFixed(4)} ms per transcript. This is an in-process synthetic-text measurement, not end-to-end latency.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
          <h2 className="mb-2 text-sm font-bold text-amber-100">Limits of this result</h2>
          <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-50/80">{data.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </>}
    </main>
  );
};
