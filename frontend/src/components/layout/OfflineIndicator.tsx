import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex max-w-[min(92vw,38rem)] items-center gap-2.5 rounded-xl bg-amber-950/90 border border-amber-500/50 px-4 py-2 text-xs font-semibold text-amber-200 shadow-2xl backdrop-blur-md animate-bounce"
    >
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span><strong>Offline safety:</strong> Analysis needs internet. Never share an OTP/PIN or send money under pressure; verify through an official number you already trust.</span>
    </div>
  );
};
