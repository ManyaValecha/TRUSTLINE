import React, { useState } from 'react';
import { User, Phone, Languages, ShieldCheck, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../types/api';
import { ShieldLogo } from '../components/common/ShieldLogo';

export const OnboardingPage: React.FC = () => {
  const { user, updateUser, setActiveTab } = useApp();

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [language, setLanguage] = useState(user.preferredLanguage || 'hi-IN');
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    updateUser({
      name: name.trim(),
      phone: phone.trim(),
      preferredLanguage: language,
      onboarded: true,
    });

    setShowWelcome(true);
  };

  const handleContinueToDashboard = () => {
    setActiveTab('dashboard');
  };

  if (showWelcome) {
    const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language);

    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 animate-in fade-in duration-300">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#121634] via-[#0E132A] to-[#0A0D1E] border border-violet-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
              Personalized Protection Activated
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome to TRUSTLINE, {name}!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Your preferred safety language is set to{' '}
              <strong className="text-violet-300">{selectedLangObj?.name} ({selectedLangObj?.nativeName})</strong>. Translation availability depends on configured services.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090C1B] border border-violet-900/30 text-left space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Registered Guardian Contact:</span>
              <span className="text-white font-mono font-medium">{phone}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Safety Language:</span>
              <span className="text-white font-medium">{selectedLangObj?.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Audio Privacy:</span>
              <span className="text-emerald-400 font-semibold">Zero-Cloud Retention</span>
            </div>
          </div>

          <button
            onClick={handleContinueToDashboard}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-violet-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Protection Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0E132A] border border-violet-900/40 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <ShieldLogo size="lg" className="justify-center mb-3" />
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Activate Your Scam Guardian
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Set up your preferences so TRUSTLINE can translate warnings and tailor advice for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-3 rounded-xl bg-[#090C1A] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 transition"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-violet-400" />
              <span>Mobile Phone Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-3 rounded-xl bg-[#090C1A] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 transition font-mono"
              required
            />
            <p className="text-[11px] text-slate-500">
              Used strictly for identification and future emergency family alerts.
            </p>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-violet-400" />
              <span>Preferred Language for Safety Warnings</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#090C1A] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 transition cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0E132A] text-white">
                  {lang.name} &bull; {lang.nativeName}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Sarvam AI will translate scam advisories into this language.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-violet-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Complete Setup & Start Protection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500">
          By activating, you confirm that audio is analysed strictly with explicit consent.
        </div>
      </div>
    </div>
  );
};
