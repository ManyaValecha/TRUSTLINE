import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../../types/api';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    LOW: {
      label: 'LOW RISK',
      sublabel: 'Safe conversational pattern',
      icon: ShieldCheck,
      badgeClass: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]',
      dotColor: 'bg-emerald-400',
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      sublabel: 'Suspicious elements detected',
      icon: AlertTriangle,
      badgeClass: 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
      dotColor: 'bg-amber-400',
    },
    HIGH: {
      label: 'HIGH RISK ALERT',
      sublabel: 'Potential voice scam detected',
      icon: ShieldAlert,
      badgeClass: 'bg-rose-950/80 border-rose-500/70 text-rose-300 shadow-[0_0_20px_-2px_rgba(239,68,68,0.4)]',
      dotColor: 'bg-rose-500 animate-pulse',
    },
  };

  const current = configs[level] || configs.LOW;
  const Icon = current.icon;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-2',
    lg: 'px-4 py-2 text-base font-semibold gap-2.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full border ${current.badgeClass} ${sizeStyles[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dotColor}`} />
      {showIcon && <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      <span>{current.label}</span>
    </span>
  );
};
