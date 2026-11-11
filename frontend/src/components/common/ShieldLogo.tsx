import React from 'react';

interface ShieldLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 72, text: 'text-4xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Custom Vector Shield Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
            <linearGradient id="cyanLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Shield Outer Outline with ambient glow */}
          <path
            d="M24 4C32 7.5 39 8 42 8.5C42.5 21 38 34.5 24 43C10 34.5 5.5 21 6 8.5C9 8 16 7.5 24 4Z"
            fill="#11152A"
            stroke="url(#shieldGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Internal Acoustic Wave Guardian Bars */}
          <line x1="24" y1="14" x2="24" y2="33" stroke="url(#shieldGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="19" y1="18" x2="19" y2="29" stroke="url(#cyanLine)" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="18" x2="29" y2="29" stroke="url(#cyanLine)" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="21" x2="14" y2="26" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          <line x1="34" y1="21" x2="34" y2="26" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

          {/* Core Trust Pulse Point */}
          <circle cx="24" cy="23.5" r="3" fill="#22D3EE" />
        </svg>

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-violet-600/20 blur-md rounded-full -z-10" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-wider text-white ${dim.text}`}>
              TRUST<span className="text-violet-400">LINE</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded">
              AI
            </span>
          </div>
          <span className={`text-[#94A3B8] font-medium tracking-tight ${dim.sub}`}>
            Voice Scam Protection
          </span>
        </div>
      )}
    </div>
  );
};
