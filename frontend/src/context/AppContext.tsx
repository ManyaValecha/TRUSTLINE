import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { UserProfile, FamilyContact, AppSettings } from '../types/user';
import { AnalyzeAudioResponse, StoredAnalysisRecord } from '../types/api';
import { checkBackendHealth, getApiBaseUrl } from '../services/api';

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  familyContacts: FamilyContact[];
  addFamilyContact: (contact: Omit<FamilyContact, 'id' | 'addedAt'>) => void;
  removeFamilyContact: (id: string) => void;
  analysisHistory: StoredAnalysisRecord[];
  addAnalysisRecord: (record: Omit<StoredAnalysisRecord, 'id' | 'timestamp'>) => StoredAnalysisRecord;
  clearAnalysisHistory: () => void;
  activeReport: AnalyzeAudioResponse | null;
  setActiveReport: (report: AnalyzeAudioResponse | null) => void;
  backendOnline: boolean | null;
  backendError: string | null;
  checkBackend: () => Promise<boolean>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetAllData: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  phone: '',
  preferredLanguage: 'hi-IN',
  onboarded: false,
  createdAt: Date.now(),
};

const DEFAULT_SETTINGS: AppSettings = {
  protectionActive: true,
  seniorMode: false,
  cloudAudioRetention: false,
  soundEffects: true,
  apiUrlOverride: '',
  diagnosticMode: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from localStorage safely
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('trustline_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('trustline_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [familyContacts, setFamilyContacts] = useState<FamilyContact[]>(() => {
    try {
      const saved = localStorage.getItem('trustline_family');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [analysisHistory, setAnalysisHistory] = useState<StoredAnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem('trustline_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeReport, setActiveReport] = useState<AnalyzeAudioResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    return user.onboarded ? 'dashboard' : 'home';
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trustline_profile', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save profile to storage', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('trustline_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to storage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('trustline_family', JSON.stringify(familyContacts));
    } catch (e) {
      console.warn('Failed to save family contacts to storage', e);
    }
  }, [familyContacts]);

  useEffect(() => {
    try {
      localStorage.setItem('trustline_history', JSON.stringify(analysisHistory));
    } catch (e) {
      console.warn('Failed to save history to storage', e);
    }
  }, [analysisHistory]);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.apiUrlOverride !== undefined) {
        localStorage.setItem('trustline_api_url', updates.apiUrlOverride);
      }
      return next;
    });
  }, []);

  const addFamilyContact = useCallback((contact: Omit<FamilyContact, 'id' | 'addedAt'>) => {
    const newContact: FamilyContact = {
      ...contact,
      id: 'fam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      addedAt: Date.now(),
    };
    setFamilyContacts((prev) => [newContact, ...prev]);
  }, []);

  const removeFamilyContact = useCallback((id: string) => {
    setFamilyContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addAnalysisRecord = useCallback(
    (record: Omit<StoredAnalysisRecord, 'id' | 'timestamp'>): StoredAnalysisRecord => {
      const newRecord: StoredAnalysisRecord = {
        ...record,
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
      };
      setAnalysisHistory((prev) => [newRecord, ...prev].slice(0, 30)); // retain up to 30 recent analyses
      return newRecord;
    },
    []
  );

  const clearAnalysisHistory = useCallback(() => {
    setAnalysisHistory([]);
    try {
      localStorage.removeItem('trustline_history');
    } catch {}
  }, []);

  const resetAllData = useCallback(() => {
    setUser(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    setFamilyContacts([]);
    setAnalysisHistory([]);
    setActiveReport(null);
    try {
      localStorage.clear();
    } catch {}
    setActiveTab('home');
  }, []);

  // Backend health verification
  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      setBackendError(null);
      await checkBackendHealth(5000);
      setBackendOnline(true);
      return true;
    } catch (err: unknown) {
      setBackendOnline(false);
      setBackendError(err instanceof Error ? err.message : 'Backend unreachable');
      return false;
    }
  }, []);

  // Run initial health check on mount
  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        settings,
        updateSettings,
        familyContacts,
        addFamilyContact,
        removeFamilyContact,
        analysisHistory,
        addAnalysisRecord,
        clearAnalysisHistory,
        activeReport,
        setActiveReport,
        backendOnline,
        backendError,
        checkBackend,
        activeTab,
        setActiveTab,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
