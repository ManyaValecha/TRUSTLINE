import { lazy as trustlineLazy, Suspense as TrustlineSuspense } from 'react';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { OfflineIndicator } from './components/layout/OfflineIndicator';







const LandingPage = trustlineLazy(() => import("./pages/LandingPage").then((m) => ({ default: m["LandingPage"] })));
const OnboardingPage = trustlineLazy(() => import("./pages/OnboardingPage").then((m) => ({ default: m["OnboardingPage"] })));
const DashboardPage = trustlineLazy(() => import("./pages/DashboardPage").then((m) => ({ default: m["DashboardPage"] })));
const FamilyPage = trustlineLazy(() => import("./pages/FamilyPage").then((m) => ({ default: m["FamilyPage"] })));
const HowItWorksPage = trustlineLazy(() => import("./pages/HowItWorksPage").then((m) => ({ default: m["HowItWorksPage"] })));
const SettingsPage = trustlineLazy(() => import("./pages/SettingsPage").then((m) => ({ default: m["SettingsPage"] })));
const EvaluationPage = trustlineLazy(() => import("./pages/EvaluationPage").then((m) => ({ default: m["EvaluationPage"] })));

const AppContent: React.FC = () => {
  const { activeTab, settings } = useApp();

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#090B16] text-[#F8FAFC] transition-all duration-200 ${
        settings.seniorMode ? 'text-[17px] leading-relaxed' : 'text-sm'
      }`}
    >
      <Header />
      
      <main className="flex-1 w-full">
        <TrustlineSuspense fallback={
          <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
              <p className="text-sm text-slate-300">Loading your TRUSTLINE experience...</p>
            </div>
          </div>
        }>

        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'onboarding' && <OnboardingPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'family' && <FamilyPage />}
        {activeTab === 'how-it-works' && <HowItWorksPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'evaluation' && <EvaluationPage />}
              </TrustlineSuspense>
      </main>

      <OfflineIndicator />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
