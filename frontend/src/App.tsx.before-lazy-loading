/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FamilyPage } from './pages/FamilyPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SettingsPage } from './pages/SettingsPage';

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
        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'onboarding' && <OnboardingPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'family' && <FamilyPage />}
        {activeTab === 'how-it-works' && <HowItWorksPage />}
        {activeTab === 'settings' && <SettingsPage />}
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
