import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Languages,
  Lock,
  Server,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../types/api';
import { getApiBaseUrl } from '../services/api';

export const SettingsPage: React.FC = () => {
  const {
    user,
    updateUser,
    settings,
    updateSettings,
    backendOnline,
    backendError,
    checkBackend,
    clearAnalysisHistory,
    resetAllData,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [language, setLanguage] = useState(user.preferredLanguage);
  const [apiUrl, setApiUrl] = useState(settings.apiUrlOverride || getApiBaseUrl());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      phone: phone.trim(),
      preferredLanguage: language,
    });
    updateSettings({
      apiUrlOverride: apiUrl.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestBackend = async () => {
    setIsPinging(true);
    if (apiUrl.trim()) {
      localStorage.setItem('trustline_api_url', apiUrl.trim());
    }
    await checkBackend();
    setIsPinging(false);
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 ${settings.seniorMode ? 'text-lg' : ''}`}>
      {/* Title */}
      <div className="border-b border-violet-900/20 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-violet-400" />
          <span>Settings & Privacy Controls</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal safety preferences, regional language, and FastAPI backend connectivity.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* SECTION 1: PROFILE & LANGUAGE */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-violet-900/40 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-violet-400" />
          <span>Guardian Profile & Language</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-violet-400" />
              <span>Preferred Language for Safety Warnings (Sarvam AI Translation)</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0E132A] text-white">
                  {lang.name} &bull; {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Update Preferences
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: ACCESSIBILITY & AUDIO PRIVACY */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-violet-900/40 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <span>Accessibility & Audio Privacy</span>
        </h2>

        <div className="space-y-4 divide-y divide-violet-900/20">
          {/* Senior Mode Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Senior Citizen High-Legibility Mode</span>
              </div>
              <p className="text-xs text-slate-400">
                Increases text font size, button targets, and visual contrast for easy reading by elderly parents.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.seniorMode}
              onClick={() => updateSettings({ seniorMode: !settings.seniorMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                settings.seniorMode ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${
                  settings.seniorMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cloud Audio Retention */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cloud Audio Retention (Always Disabled by Default)</span>
              </div>
              <p className="text-xs text-slate-400">
                TRUSTLINE destroys temporary audio buffers immediately upon report generation.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-900/40 text-xs font-bold font-mono">
              ZERO-RETENTION
            </span>
          </div>

          {/* Offline / Diagnostic Simulator Mode */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Diagnostic Benchmark Simulator</span>
              </div>
              <p className="text-xs text-slate-400">
                Enables testing of full Gnani+Cohere+Sarvam workflow when local FastAPI server is not currently running.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.diagnosticMode}
              onClick={() => updateSettings({ diagnosticMode: !settings.diagnosticMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                settings.diagnosticMode ? 'bg-cyan-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${
                  settings.diagnosticMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: FASTAPI BACKEND CONFIGURATION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-violet-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-400" />
            <span>FastAPI Backend Connection</span>
          </h2>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
            backendOnline
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{backendOnline ? 'Connected (200 OK)' : 'Unreachable'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">FastAPI Base URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleTestBackend}
                disabled={isPinging}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#151936] hover:bg-[#1E254F] border border-violet-900/40 text-violet-200 text-xs font-bold transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging /health...' : 'Test Connection'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Default fallback: http://127.0.0.1:8000 &bull; Configurable via VITE_API_BASE_URL
            </p>
          </div>

          {backendError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{backendError}</span>
            </div>
          )}

          {/* Quick instructions for running FastAPI */}
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-200">Local FastAPI Backend Startup:</div>
            <pre className="p-2.5 rounded-lg bg-[#090C1A] text-emerald-400 font-mono text-[11px] overflow-x-auto">
              uvicorn main:app --reload --port 8000
            </pre>
            <p className="text-[11px] text-slate-400">
              Ensure CORS is enabled in your Python script with <code className="text-violet-300">CORSMiddleware</code> to accept requests from your AI Studio dev server URL.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: DATA RESET */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0E132A] border border-rose-950/40 space-y-4">
        <h2 className="text-lg font-bold text-rose-300 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <span>Local Storage & Data Wipe</span>
        </h2>
        <p className="text-xs text-slate-400">
          Clear cached analysis summaries, reset your family contacts, or restore the app to factory onboarding state.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={clearAnalysisHistory}
            className="px-4 py-2 rounded-xl bg-[#1A1122] hover:bg-[#251532] border border-rose-900/40 text-rose-300 text-xs font-semibold transition cursor-pointer"
          >
            Clear Analysis History Only
          </button>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-600/50 text-rose-200 text-xs font-bold transition cursor-pointer"
            >
              Reset Entire Application
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300">Confirm complete reset?</span>
              <button
                type="button"
                onClick={resetAllData}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer"
              >
                Yes, Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
