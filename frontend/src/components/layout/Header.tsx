import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Users,
  HelpCircle,
  Settings as SettingsIcon,
  Download,
  Menu,
  X,
  Server,
  RefreshCw,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { ShieldLogo } from '../common/ShieldLogo';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { getApiBaseUrl } from '../../services/api';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    backendOnline,
    backendError,
    checkBackend,
    settings,
    updateSettings,
  } = useApp();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendModalOpen, setBackendModalOpen] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleManualCheck = async () => {
    setIsCheckingBackend(true);
    await checkBackend();
    setIsCheckingBackend(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'dashboard', label: 'Protection', icon: Activity },
    { id: 'family', label: 'Family Safety', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-violet-900/20 bg-[#090B16]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNav(user.onboarded ? 'dashboard' : 'home')}
              className="focus:outline-none text-left cursor-pointer group"
              aria-label="TRUSTLINE Home"
            >
              <ShieldLogo size="md" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Senior Mode Toggle, Backend Status, PWA Install */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Senior Citizen / High Legibility Toggle */}
              <button
                onClick={() => updateSettings({ seniorMode: !settings.seniorMode })}
                title="Toggle High-Legibility Mode for Seniors"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  settings.seniorMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-[#11152A] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Senior View</span>
                {settings.seniorMode && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>

              {/* Backend Status Indicator */}
              <button
                onClick={() => setBackendModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  backendOnline
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
                }`}
                title="Click to check FastAPI backend connectivity"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendOnline === null
                      ? 'bg-slate-400 animate-pulse'
                      : backendOnline
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="hidden xl:inline">
                  {backendOnline === null
                    ? 'Checking API...'
                    : backendOnline
                    ? 'FastAPI Connected'
                    : 'Backend Offline'}
                </span>
                <span className="xl:hidden">API</span>
              </button>

              {/* In-App PWA Install Button */}
              {!isInstalled && isInstallable && (
                <button
                  onClick={install}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-violet-900/30 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install PWA</span>
                </button>
              )}

              {!isInstalled && isIOS && (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-[#11152A] hover:bg-[#1A203F] text-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install on iOS</span>
                </button>
              )}

              {/* Profile button / Sign in */}
              {user.onboarded ? (
                <button
                  onClick={() => handleNav('settings')}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#11152A] border border-violet-900/30 hover:border-violet-600/50 transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-600/40 text-violet-300 flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                    {user.name || 'Account'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => handleNav('onboarding')}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs font-bold transition cursor-pointer"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setBackendModalOpen(true)}
                className={`w-3 h-3 rounded-full ${
                  backendOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                aria-label="API Status"
              />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-[#11152A] text-slate-300 hover:text-white border border-slate-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-violet-900/30 bg-[#0D1022] px-4 pt-3 pb-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-left transition ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 text-violet-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-slate-400">Senior Legibility Mode</span>
                <button
                  onClick={() => updateSettings({ seniorMode: !settings.seniorMode })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                    settings.seniorMode
                      ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {settings.seniorMode ? 'Active' : 'Off'}
                </button>
              </div>

              {!isInstalled && isInstallable && (
                <button
                  onClick={() => {
                    install();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Install TRUSTLINE App</span>
                </button>
              )}

              {!isInstalled && isIOS && (
                <button
                  onClick={() => {
                    setShowIOSModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#11152A] border border-slate-700 text-slate-200 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Install on iPhone / iPad</span>
                </button>
              )}

              {!user.onboarded && (
                <button
                  onClick={() => handleNav('onboarding')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm text-center"
                >
                  Activate My Protection
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backend Status & Connection Modal */}
      {backendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E132A] border border-violet-900/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${backendOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">FastAPI Backend Status</h3>
                  <p className="text-xs text-slate-400">Speech & AI Behavioral Analysis Pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setBackendModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-xl border ${backendOnline ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-amber-950/30 border-amber-500/30'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                {backendOnline ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-emerald-300 text-sm">FastAPI Backend is Online</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-amber-300 text-sm">Cannot Connect to FastAPI Backend</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono break-all">
                Target Endpoint: {getApiBaseUrl()}
              </p>
              {backendError && (
                <p className="mt-2 text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-900/30">
                  {backendError}
                </p>
              )}
            </div>

            {/* Provider pipeline explanation */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Multi-Model Protection Pipeline
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#151B38] border border-violet-900/20">
                  <div className="text-[11px] font-bold text-violet-300">Gnani API</div>
                  <div className="text-[10px] text-slate-400">Indic Speech STT</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#151B38] border border-violet-900/20">
                  <div className="text-[11px] font-bold text-cyan-300">Cohere AI</div>
                  <div className="text-[10px] text-slate-400">Behavioral Scam LLM</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#151B38] border border-violet-900/20">
                  <div className="text-[11px] font-bold text-emerald-300">Sarvam AI</div>
                  <div className="text-[10px] text-slate-400">Indic Warning Translation</div>
                </div>
              </div>
            </div>

            {/* Instructions for starting backend if offline */}
            {!backendOnline && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-200">To start your local FastAPI server:</div>
                <pre className="p-2 rounded bg-black/60 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  uvicorn main:app --reload --port 8000
                </pre>
                <div className="text-[11px] text-slate-400">
                  Make sure CORS middleware is enabled in FastAPI with <code className="text-violet-300">allow_origins=["*"]</code> or your dev URL.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleManualCheck}
                disabled={isCheckingBackend}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                <span>{isCheckingBackend ? 'Pinging /health...' : 'Retry Health Check'}</span>
              </button>

              <button
                onClick={() => setBackendModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A203F] hover:bg-[#252E5A] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS PWA Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0E132A] border border-violet-900/40 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Install TRUSTLINE on iOS</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-violet-300">Share</strong> button (box with upward arrow) in the Safari toolbar.<br />
              2. Scroll down the actions sheet and tap <strong className="text-violet-300">Add to Home Screen</strong>.<br />
              3. Tap <strong className="text-violet-300">Add</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
