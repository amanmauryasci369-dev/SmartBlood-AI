import React from 'react';

interface LifeLinkLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
}

export const LifeLinkLogo: React.FC<LifeLinkLogoProps> = ({
  size = 'md',
  showTagline = true,
  inverted = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* LifeLink Icon: Stylized Blood Drop with Connected Nodes & Healthcare Symbol */}
      <div
        className={`${iconSizes} rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md shadow-red-900/20 border border-red-500/40 shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-white"
          aria-hidden="true"
        >
          {/* Blood Drop Silhouette */}
          <path
            d="M16 4C16 4 8 13.5 8 19C8 23.4183 11.5817 27 16 27C20.4183 27 24 23.4183 24 19C24 13.5 16 4 16 4Z"
            fill="currentColor"
            opacity="0.95"
          />
          {/* Central Healthcare Cross / Network Core */}
          <rect x="14.75" y="14" width="2.5" height="10" rx="1.25" fill="#0f172a" />
          <rect x="11" y="17.75" width="10" height="2.5" rx="1.25" fill="#0f172a" />
          {/* Network Nodes (Connecting Hospitals, Blood Centers, Donors) */}
          <circle cx="16" cy="19" r="1.8" fill="#ffffff" />
          <circle cx="11.5" cy="14" r="1.3" fill="#38bdf8" />
          <circle cx="20.5" cy="14" r="1.3" fill="#38bdf8" />
          <circle cx="16" cy="24" r="1.3" fill="#38bdf8" />
          {/* Interconnecting Links */}
          <line x1="11.5" y1="14" x2="16" y2="19" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 1" />
          <line x1="20.5" y1="14" x2="16" y2="19" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 1" />
          <line x1="16" y1="19" x2="16" y2="24" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 1" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`${textSizes} font-black tracking-tight leading-none ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            Life<span className="text-red-600">Link</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
            NETWORK
          </span>
        </div>

        {showTagline && (
          <span
            className={`${taglineSizes} font-medium tracking-tight mt-0.5 ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Smart Hospital &amp; Blood Network
          </span>
        )}
      </div>
    </div>
  );
};
