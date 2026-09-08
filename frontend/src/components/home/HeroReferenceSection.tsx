import React from 'react';
import { 
  Search, 
  Network, 
  MapPin, 
  Clock, 
  Activity, 
  Building2, 
  ShieldCheck, 
  Heart,
  Briefcase
} from 'lucide-react';

interface HeroReferenceSectionProps {
  onNavigateToTab: (tab: any) => void;
  onOpenSOSModal?: () => void;
  onScrollToSearch?: () => void;
}

export const HeroReferenceSection: React.FC<HeroReferenceSectionProps> = ({
  onNavigateToTab,
  onOpenSOSModal,
  onScrollToSearch
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/80 via-pink-50/30 to-white border border-rose-100/90 p-6 sm:p-10 lg:p-12 shadow-xs">
      
      {/* Background Subtle Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full max-w-2xl text-red-950 fill-current">
          <path d="M200 40C140 140 80 200 80 260C80 326.274 133.726 380 200 380C266.274 380 320 326.274 320 260C320 200 260 140 200 40Z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center relative z-10">
        
        {/* Left Column: Heading, Copy, Pills, Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200/60 text-rose-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>REAL-TIME BLOOD AVAILABILITY NETWORK</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Find the Blood You Need,<br />
            <span className="text-[#9B001B]">Faster.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
            Search available blood across the connected network and find eligible inventory near you with real-time transit awareness.
          </p>

          {/* Three Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200/70 shadow-2xs text-slate-800">
              <span className="p-1 rounded-md bg-rose-50 text-rose-700">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <span>50+ Connected Centers</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200/70 shadow-2xs text-slate-800">
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span>GIS Transit Contours</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200/70 shadow-2xs text-slate-800">
              <span className="p-1 rounded-md bg-amber-50 text-amber-700">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <span>Sub-Second Stock Lookup</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onScrollToSearch}
              className="px-6 py-3 rounded-xl bg-[#9B001B] hover:bg-[#800016] active:bg-[#680010] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-rose-950/20 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>FIND BLOOD &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('hospital-network')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-rose-50/70 active:bg-rose-100 text-[#9B001B] border border-[#9B001B] text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider shadow-2xs group"
            >
              <Network className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>VIEW NETWORK</span>
            </button>
          </div>

        </div>

        {/* Right Column: Hero Visual with 3D Blood Drop & Radar Orbit */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[360px] sm:min-h-[400px]">
          
          {/* Floating Badge Top Right */}
          <div className="absolute top-2 right-2 sm:right-6 z-20 bg-white/95 backdrop-blur-xs border border-rose-100 rounded-2xl px-3.5 py-2 shadow-sm flex items-center gap-2 animate-bounce [animation-duration:4s]">
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-red-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-900 leading-tight">12 Regional Hubs</div>
              <div className="text-[10px] text-slate-500 font-medium">Across India</div>
            </div>
          </div>

          {/* Concentric Radar Circles */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            
            {/* Outer radar ring */}
            <div className="absolute inset-0 rounded-full border border-rose-200/50 animate-ping [animation-duration:5s]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-rose-300/40" />
            <div className="absolute inset-10 rounded-full border border-rose-200/70" />
            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-rose-100/40 via-pink-50/20 to-transparent" />

            {/* Orbiting Badge: O+ (Top Left) */}
            <div className="absolute top-8 left-6 z-20 px-3 py-1 rounded-full bg-white border border-red-200 text-red-600 font-black text-xs shadow-md">
              O+
            </div>

            {/* Orbiting Badge: Medical Kit (Top Right) */}
            <div className="absolute top-12 right-8 z-20 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
              <Briefcase className="w-4 h-4" />
            </div>

            {/* Orbiting Badge: A- (Bottom Left) */}
            <div className="absolute bottom-16 left-4 z-20 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700 font-black text-xs shadow-md">
              A-
            </div>

            {/* Orbiting Badge: B+ (Bottom Right) */}
            <div className="absolute bottom-12 right-12 z-20 px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-600 font-black text-xs shadow-md">
              B+
            </div>

            {/* Central Glossy 3D Blood Drop */}
            <div className="relative z-10 w-28 h-36 sm:w-32 sm:h-40 flex items-center justify-center filter drop-shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg viewBox="0 0 100 130" className="w-full h-full">
                <defs>
                  {/* Blood drop gradient */}
                  <linearGradient id="dropGradient" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="45%" stopColor="#dc2626" />
                    <stop offset="85%" stopColor="#991b1b" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>

                  {/* 3D Highlight specular reflection */}
                  <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Drop Base */}
                <path
                  d="M50 8 C50 8 16 55 16 85 C16 104.882 31.118 121 50 121 C68.882 121 84 104.882 84 85 C84 55 50 8 50 8 Z"
                  fill="url(#dropGradient)"
                />

                {/* 3D Curved Specular Shine */}
                <path
                  d="M50 16 C50 16 28 55 28 78 C28 60 44 32 50 16 Z"
                  fill="url(#glossHighlight)"
                />

                {/* White ECG Pulse Line inside Drop */}
                <path
                  d="M30 85 H40 L45 74 L52 96 L58 82 L63 88 H70"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

          </div>

          {/* Floating Badge Bottom Right: Search Speed */}
          <div className="absolute bottom-2 right-2 sm:right-6 z-20 bg-white/95 backdrop-blur-xs border border-rose-100 rounded-2xl px-3.5 py-2 shadow-sm flex items-center gap-2 animate-bounce [animation-duration:5s]">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-900 leading-tight">Search Speed</div>
              <div className="text-[10px] text-slate-500 font-medium">&lt; 15 Seconds</div>
            </div>
          </div>

          {/* Decorative Calligraphy: Every Drop Counts */}
          <div className="hidden sm:block absolute -bottom-2 -right-2 z-10 select-none pointer-events-none">
            <div className="font-serif italic text-2xl text-rose-300/70 font-semibold tracking-wide flex items-center gap-1 transform rotate-[-6deg]">
              <span>Every Drop Counts</span>
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
