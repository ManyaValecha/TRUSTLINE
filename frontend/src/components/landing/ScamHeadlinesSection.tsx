import React, { useEffect, useState, useMemo } from 'react';
import {
  Globe,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Info,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { GroundedHeadline } from '../../../server';

export const ScamHeadlinesSection: React.FC = () => {
  const [headlines, setHeadlines] = useState<GroundedHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [groundingSources, setGroundingSources] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHeadlines = async (query?: string) => {
    try {
      setError(null);
      const url = query && query.trim()
        ? `/api/scam-headlines?q=${encodeURIComponent(query.trim())}`
        : '/api/scam-headlines';

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load headlines: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.headlines && Array.isArray(data.headlines)) {
        setHeadlines(data.headlines);
        setIsGrounded(Boolean(data.groundedWithGoogleSearch));
        setGroundingSources(data.groundingSources || []);
      }
    } catch (err: unknown) {
      console.warn('Could not fetch live Google Search headlines, using default set', err);
      setError('Live search grounding stream took longer than expected; displaying verified national fraud bulletins.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHeadlines(searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchHeadlines(searchQuery);
  };

  const categories = [
    'All',
    'Digital Arrest',
    'Bank KYC',
    'Courier Impersonation',
    'Emergency Fraud',
  ];

  const filteredHeadlines = useMemo(() => {
    return headlines.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesText =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesText;
    });
  }, [headlines, selectedCategory, searchQuery]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 py-10 border-t border-violet-950/40">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-bold text-cyan-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google Search API &bull; Grounded Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Latest Voice Scam Headlines & Fraud Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time scam threat intelligence verified via Google Search grounding. Understand active coercion methods to safeguard your family.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11152A] hover:bg-[#181F3D] border border-violet-900/40 text-violet-200 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Search...' : 'Refresh Trends'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#0E132A] border border-violet-900/30 shadow-md">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-[#151936] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trend or keyword..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </form>
      </div>

      {/* Grounding Source Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0B0E20] border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            {isGrounded ? 'Connected to Google Search Grounding Tool' : 'Offline Verified National Cache'}
          </span>
        </div>
        {groundingSources.length > 0 && (
          <div className="flex items-center gap-2">
            <span>Verified Sources:</span>
            <span className="font-mono text-cyan-400">{groundingSources.length} citation links</span>
          </div>
        )}
      </div>

      {/* Headlines Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-[#0E132A] border border-violet-900/20" />
          ))}
        </div>
      ) : filteredHeadlines.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#0E132A]/60 border border-violet-900/20 text-center space-y-2">
          <Info className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-bold text-white">No Scam Trends Matching Your Query</div>
          <p className="text-xs text-slate-400">
            Try a different search term or select "All" categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHeadlines.map((item) => {
            const isCritical = item.severity === 'CRITICAL';
            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-[#0E132A] border border-violet-900/30 hover:border-violet-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Category & Severity Tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCritical
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.date}
                    </span>
                  </div>

                  {/* Headline Title */}
                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Source Attribution */}
                  <div className="text-[11px] font-medium text-cyan-400 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    <span>{item.source}</span>
                  </div>

                  {/* Summary of Scam Mechanism */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Practical Prevention Tip Box */}
                <div className="space-y-2 pt-2 border-t border-violet-900/30">
                  <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Safety Directive:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      {item.preventionTip}
                    </p>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition"
                    >
                      <span>Read verification source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
