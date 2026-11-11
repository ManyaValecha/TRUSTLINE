export interface UserProfile {
  name: string;
  phone: string;
  preferredLanguage: string; // e.g. "hi-IN" or "en-IN"
  onboarded: boolean;
  createdAt: number;
}

export interface FamilyContact {
  id: string;
  name: string;
  relationship: 'Parent' | 'Child' | 'Spouse' | 'Sibling' | 'Guardian' | 'Other';
  phone: string;
  notifyOnHighRisk: boolean;
  notifyOnMediumRisk: boolean;
  addedAt: number;
}

export interface AppSettings {
  protectionActive: boolean;
  seniorMode: boolean; // Extra readable typography, higher contrast
  cloudAudioRetention: boolean; // default false (Privacy-first)
  soundEffects: boolean;
  apiUrlOverride: string; // custom backend URL if different from env
  diagnosticMode: boolean; // Allows simulating responses when local backend is unreachable
}
