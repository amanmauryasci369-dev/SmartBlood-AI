import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Droplets, 
  Search, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Clock, 
  Building2, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin,
  Calendar,
  Share2,
  TrendingDown
} from 'lucide-react';

interface HomeHeroSliderProps {
  onNavigateToTab: (tab: any) => void;
  onOpenSOSModal?: () => void;
  onScrollToSearch?: () => void;
}

export const HomeHeroSlider: React.FC<HomeHeroSliderProps> = ({
  onNavigateToTab,
  onOpenSOSModal,
  onScrollToSearch
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const slidesCount = 3;

  const nextSlide = useCallback(() => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slidesCount);
  }, [slidesCount]);

  const prevSlide = useCallback(() => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  }, [slidesCount]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  // Autoplay every 5.5 seconds, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  return (
    <section 
      aria-label="LifeLink Blood Management Highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-rose-50/40 to-red-50/60 border border-red-100 shadow-sm p-6 sm:p-10 lg:p-12 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      {/* Decorative background ambient glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#800020 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* =====================================================================
          SLIDE 1: BLOOD DONATION
          ===================================================================== */}
      {currentSlide === 0 && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fadeIn">
          {/* Left Column: 55-60% width */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-900 text-xs font-black tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <Droplets className="w-3.5 h-3.5 text-red-600" />
              <span>National Voluntary Blood Donation Initiative</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Donate Blood. <br className="hidden sm:inline" />
                <span className="text-[#800020]">Give Hope.</span> Save Lives.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                One donation can help save lives. Join the movement for a healthier, stronger community across India's verified blood network.
              </p>
            </div>

            {/* Feature Indicators */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-red-100 text-slate-700 text-xs font-bold shadow-2xs">
                <Heart className="w-3.5 h-3.5 text-red-600 fill-red-500/20" />
                <span>1 Unit Saves Up to 3 Lives</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-red-100 text-slate-700 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Voluntary & Safe</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-red-100 text-slate-700 text-xs font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick 15-Minute Process</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('donation-camps')}
                className="px-6 py-3.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-md shadow-red-950/20 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <span>Take Pledge</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('donors')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-red-50 text-slate-800 hover:text-red-900 text-xs sm:text-sm font-bold tracking-wide uppercase border border-slate-200 hover:border-red-200 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <Heart className="w-4 h-4 text-red-600" />
                <span>Learn More</span>
              </button>
            </div>
          </div>

          {/* Right Column: 40-45% width motion graphic visual */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
              {/* Radial Backdrop Rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500/10 via-rose-300/10 to-transparent border border-red-200/50" />
              <div className="absolute inset-6 rounded-full border border-dashed border-red-300/40 animate-spin" style={{ animationDuration: '40s' }} />

              {/* Main Vector Motion Graphic Illustration */}
              <svg 
                viewBox="0 0 360 360" 
                className="w-full h-full drop-shadow-xl select-none"
                aria-label="Illustration of Blood Donation, Bag, and Lifeline"
              >
                <defs>
                  <linearGradient id="bloodBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fef2f2" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="bloodLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="60%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#800020" />
                  </linearGradient>
                  <linearGradient id="dropGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff7b89" />
                    <stop offset="50%" stopColor="#e11d48" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Hanging Grommet / Blood Bag Top */}
                <path d="M140,50 L220,50 C226,50 230,54 230,60 L230,75 L130,75 L130,60 C130,54 134,50 140,50 Z" fill="#cbd5e1" />
                <circle cx="180" cy="62" r="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />

                {/* Blood Bag Body */}
                <rect x="110" y="75" width="140" height="200" rx="24" fill="url(#bloodBagGrad)" stroke="#fca5a5" strokeWidth="3" />

                {/* Liquid Inside Bag */}
                <path 
                  d="M112,140 Q145,135 180,140 T248,140 L248,252 C248,264 238,273 226,273 L134,273 C122,273 112,264 112,252 Z" 
                  fill="url(#bloodLiquidGrad)"
                />

                {/* Level Measurement Lines */}
                <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.6">
                  <line x1="125" y1="120" x2="145" y2="120" />
                  <text x="150" y="123" fontSize="9" fill="#64748b" fontWeight="bold">450 ml</text>
                  <line x1="125" y1="150" x2="140" y2="150" />
                  <text x="150" y="153" fontSize="9" fill="#fecaca" fontWeight="bold">300 ml</text>
                  <line x1="125" y1="180" x2="140" y2="180" />
                  <text x="150" y="183" fontSize="9" fill="#fecaca" fontWeight="bold">150 ml</text>
                </g>

                {/* Blood Bag Tube */}
                <path 
                  d="M180,273 C180,310 140,325 100,315 C70,305 60,260 85,220" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                />
                <circle cx="85" cy="220" r="5" fill="#800020" />

                {/* Large 3D Blood Droplet in Foreground */}
                <g filter="url(#softGlow)">
                  <path 
                    d="M260,195 C260,150 205,105 205,105 C205,105 150,150 150,195 C150,228 175,255 205,255 C235,255 260,228 260,195 Z" 
                    fill="url(#dropGloss)" 
                    opacity="0.95"
                  />
                  {/* Glossy Curved Highlight */}
                  <path 
                    d="M175,185 C175,160 195,135 195,135 C195,135 182,155 182,185 C182,198 188,208 192,212 C182,205 175,195 175,185 Z" 
                    fill="#ffffff" 
                    opacity="0.6"
                  />
                  {/* ECG Heartbeat Line on Droplet */}
                  <path 
                    d="M170,195 L190,195 L195,180 L203,212 L212,175 L218,203 L225,195 L240,195" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </g>

                {/* Floating Red Blood Cells */}
                <ellipse cx="65" cy="115" rx="14" ry="10" fill="#f87171" transform="rotate(-20 65 115)" opacity="0.85" />
                <ellipse cx="75" cy="180" rx="10" ry="7" fill="#dc2626" transform="rotate(15 75 180)" opacity="0.7" />
                <ellipse cx="295" cy="120" rx="12" ry="9" fill="#ef4444" transform="rotate(30 295 120)" opacity="0.8" />
                <ellipse cx="290" cy="245" rx="15" ry="11" fill="#f87171" transform="rotate(-10 290 245)" opacity="0.75" />

                {/* Medical Plus Crosses */}
                <g fill="#fca5a5" opacity="0.7">
                  <path d="M50,75 h4 v12 h-4 z M46,79 h12 v4 h-12 z" />
                  <path d="M295,70 h4 v14 h-4 z M290,75 h14 v4 h-14 z" />
                  <path d="M245,295 h3 v10 h-3 z M241.5,298.5 h10 v3 h-10 z" />
                </g>
              </svg>

              {/* Floating Stat Card: Bottom Left */}
              <div className="absolute -bottom-2 -left-3 sm:left-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-red-100 shadow-md flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Impact</div>
                  <div className="text-xs font-black text-slate-900">3 Lives / Unit</div>
                </div>
              </div>

              {/* Floating Badge: Top Right */}
              <div className="absolute -top-1 -right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-100 shadow-md flex items-center gap-1.5 text-xs text-emerald-800 font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Voluntary Pledge</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SLIDE 2: FIND BLOOD
          ===================================================================== */}
      {currentSlide === 1 && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fadeIn">
          {/* Left Column: 55-60% */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-black tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Blood Availability Network</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Find the Blood You Need, <br className="hidden sm:inline" />
                <span className="text-[#800020]">Faster.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                Search available blood across the connected network and find eligible inventory near you with real-time transit awareness.
              </p>
            </div>

            {/* Feature Indicators */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-100 text-slate-700 text-xs font-bold shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>50+ Connected Centers</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-100 text-slate-700 text-xs font-bold shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>GIS Transit Contours</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-100 text-slate-700 text-xs font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Sub-Second Stock Lookup</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onScrollToSearch) onScrollToSearch();
                  else onNavigateToTab('find-blood');
                }}
                className="px-6 py-3.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-md shadow-red-950/20 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <span>Find Blood</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('hospital-network')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-red-50 text-slate-800 hover:text-red-900 text-xs sm:text-sm font-bold tracking-wide uppercase border border-slate-200 hover:border-red-200 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <Network className="w-4 h-4 text-blue-600" />
                <span>View Network</span>
              </button>
            </div>
          </div>

          {/* Right Column: Motion Graphic Illustration */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
              {/* Radial Backdrop Rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/10 via-red-300/10 to-transparent border border-blue-200/50" />
              <div className="absolute inset-6 rounded-full border border-dashed border-blue-300/40 animate-spin" style={{ animationDuration: '50s' }} />

              {/* Vector Motion Graphic: Search, Network & Blood Groups */}
              <svg 
                viewBox="0 0 360 360" 
                className="w-full h-full drop-shadow-xl select-none"
                aria-label="Illustration of Blood Search & Network Connectivity"
              >
                <defs>
                  <linearGradient id="radarPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Radar Grid Circles */}
                <circle cx="180" cy="180" r="140" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                <circle cx="180" cy="180" r="105" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="180" cy="180" r="70" fill="url(#radarPulse)" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Connecting Network Lines */}
                <line x1="180" y1="180" x2="90" y2="90" stroke="#fca5a5" strokeWidth="2.5" strokeDasharray="4 4" />
                <line x1="180" y1="180" x2="270" y2="85" stroke="#93c5fd" strokeWidth="2.5" strokeDasharray="4 4" />
                <line x1="180" y1="180" x2="80" y2="250" stroke="#86efac" strokeWidth="2.5" strokeDasharray="4 4" />
                <line x1="180" y1="180" x2="280" y2="260" stroke="#fca5a5" strokeWidth="2.5" strokeDasharray="4 4" />

                {/* Center Node: Search Scanner with Magnifier */}
                <g transform="translate(180 180)">
                  <circle cx="0" cy="0" r="32" fill="#800020" />
                  <circle cx="0" cy="0" r="26" fill="#ffffff" />
                  <circle cx="-4" cy="-4" r="11" fill="none" stroke="#800020" strokeWidth="3" />
                  <line x1="4" y1="4" x2="14" y2="14" stroke="#800020" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="-4" cy="-4" r="4" fill="#ef4444" />
                </g>

                {/* Node 1 (Top Left): O+ Universal Red Cells */}
                <g transform="translate(90 90)">
                  <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#ef4444" strokeWidth="2.5" />
                  <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#800020">O+</text>
                  <circle cx="18" cy="-18" r="5" fill="#22c55e" />
                </g>

                {/* Node 2 (Top Right): Hospital Node */}
                <g transform="translate(270 85)">
                  <rect x="-24" y="-24" width="48" height="48" rx="14" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                  {/* Hospital Icon graphic */}
                  <rect x="-14" y="-12" width="28" height="26" rx="4" fill="#eff6ff" />
                  <path d="M-4,-7 h8 v16 h-8 z M-9,-2 h18 v6 h-18 z" fill="#2563eb" />
                  <circle cx="20" cy="-20" r="5" fill="#22c55e" />
                </g>

                {/* Node 3 (Bottom Left): A- Group */}
                <g transform="translate(80 250)">
                  <circle cx="0" cy="0" r="24" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                  <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#c2410c">A-</text>
                  <circle cx="16" cy="-16" r="4.5" fill="#22c55e" />
                </g>

                {/* Node 4 (Bottom Right): B+ Group */}
                <g transform="translate(280 260)">
                  <circle cx="0" cy="0" r="24" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                  <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#800020">B+</text>
                  <circle cx="16" cy="-16" r="4.5" fill="#22c55e" />
                </g>

                {/* Pulse Blip on Scan Line */}
                <circle cx="135" cy="135" r="4" fill="#ef4444" />
                <circle cx="230" cy="220" r="5" fill="#3b82f6" />
              </svg>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-blue-100 shadow-md flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Search Speed</div>
                  <div className="text-xs font-black text-slate-900">&lt; 15 Seconds</div>
                </div>
              </div>

              {/* Floating Badge Top */}
              <div className="absolute -top-1 -right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-blue-100 shadow-md flex items-center gap-1.5 text-xs text-blue-800 font-black">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>12 Regional Hubs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SLIDE 3: SMART HOSPITAL EXCHANGE (FEFO)
          ===================================================================== */}
      {currentSlide === 2 && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fadeIn">
          {/* Left Column: 55-60% */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-black tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>FEFO Wastage-Reduction Protocol</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Use Blood Before It <br className="hidden sm:inline" />
                <span className="text-[#800020]">Goes to Waste.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                LifeLink connects participating hospitals and prioritizes eligible blood units nearing expiration to support smarter inventory utilization.
              </p>
            </div>

            {/* Feature Indicators */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-200 text-slate-700 text-xs font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>First Expired, First Out (FEFO)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-200 text-slate-700 text-xs font-bold shadow-2xs">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reduces Shelf Wastage</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-200 text-slate-700 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Peer H2H Coordination</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('hospital-exchange')}
                className="px-6 py-3.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-md shadow-red-950/20 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <span>Hospital Exchange</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab('wastage-analytics')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-red-50 text-slate-800 hover:text-red-900 text-xs sm:text-sm font-bold tracking-wide uppercase border border-slate-200 hover:border-red-200 transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Compliance Disclaimer Notice */}
            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              * Decision support advisory for inventory optimization. Clinical transfusion decisions remain exclusively with authorized healthcare professionals.
            </p>
          </div>

          {/* Right Column: Motion Graphic Illustration */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
              {/* Radial Backdrop Rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/10 via-red-300/10 to-transparent border border-amber-200/50" />
              <div className="absolute inset-6 rounded-full border border-dashed border-amber-300/40 animate-spin" style={{ animationDuration: '45s' }} />

              {/* Vector Motion Graphic: H2H FEFO Protocol */}
              <svg 
                viewBox="0 0 360 360" 
                className="w-full h-full drop-shadow-xl select-none"
                aria-label="Illustration of Hospital-to-Hospital FEFO Allocation"
              >
                <defs>
                  <linearGradient id="fefoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Flow Arc Lines between Hospitals */}
                <path 
                  d="M80,100 C80,240 280,240 280,100" 
                  fill="none" 
                  stroke="url(#fefoGradient)" 
                  strokeWidth="3.5" 
                  strokeDasharray="6 6"
                />

                {/* Hospital A Card (Top Left) */}
                <g transform="translate(45 65)">
                  <rect width="90" height="60" rx="14" fill="#ffffff" stroke="#fca5a5" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))" />
                  <rect x="10" y="10" width="22" height="22" rx="6" fill="#fee2e2" />
                  <path d="M18,15 h6 v12 h-6 z M15,18 h12 v6 h-12 z" fill="#dc2626" />
                  <text x="38" y="24" fontSize="10" fontWeight="900" fill="#1e293b">Hospital A</text>
                  <text x="12" y="48" fontSize="8" fontWeight="bold" fill="#64748b">Excess Stock</text>
                </g>

                {/* Hospital B Card (Top Right) */}
                <g transform="translate(225 65)">
                  <rect width="90" height="60" rx="14" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))" />
                  <rect x="10" y="10" width="22" height="22" rx="6" fill="#dbeafe" />
                  <path d="M18,15 h6 v12 h-6 z M15,18 h12 v6 h-12 z" fill="#2563eb" />
                  <text x="38" y="24" fontSize="10" fontWeight="900" fill="#1e293b">Hospital B</text>
                  <text x="12" y="48" fontSize="8" fontWeight="bold" fill="#2563eb">Trauma Demand</text>
                </g>

                {/* Central FEFO Exchange Hub */}
                <g transform="translate(180 230)">
                  {/* Central Node Circle */}
                  <circle cx="0" cy="0" r="42" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" filter="drop-shadow(0 4px 8px rgba(245,158,11,0.15))" />
                  <circle cx="0" cy="0" r="32" fill="#fffbeb" />

                  {/* Hourglass / Expiration Icon */}
                  <path d="M-10,-14 h20 L10,-12 L2,-2 L10,8 L10,14 h-20 L-10,8 L-2,-2 L-10,-12 Z" fill="#d97706" />
                  <circle cx="0" cy="4" r="2.5" fill="#ef4444" />

                  {/* Badge Label */}
                  <rect x="-35" y="48" width="70" height="18" rx="6" fill="#800020" />
                  <text x="0" y="60" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">FEFO PROTOCOL</text>
                </g>

                {/* Prioritized Unit Card 1: Critical Expiry (0-2d) */}
                <g transform="translate(100 150)">
                  <rect width="70" height="34" rx="8" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                  <circle cx="12" cy="17" r="4" fill="#ef4444" />
                  <text x="22" y="15" fontSize="8" fontWeight="900" fill="#800020">BL-1001</text>
                  <text x="22" y="26" fontSize="7" fontWeight="bold" fill="#dc2626">Expires 2d ⚡</text>
                </g>

                {/* Prioritized Unit Card 2: Expiring Soon (3-7d) */}
                <g transform="translate(195 150)">
                  <rect width="70" height="34" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="12" cy="17" r="4" fill="#f59e0b" />
                  <text x="22" y="15" fontSize="8" fontWeight="900" fill="#78350f">BL-1002</text>
                  <text x="22" y="26" fontSize="7" fontWeight="bold" fill="#d97706">Expires 5d ⏱</text>
                </g>

                {/* Animated Arrow Indicators along the arc */}
                <polygon points="175,270 185,274 185,266" fill="#10b981" />
              </svg>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-200 shadow-md flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Wastage Goal</div>
                  <div className="text-xs font-black text-slate-900">Zero Discard</div>
                </div>
              </div>

              {/* Floating Badge Top */}
              <div className="absolute -top-1 -right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-100 shadow-md flex items-center gap-1.5 text-xs text-emerald-800 font-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Auto-Prioritized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SLIDER CONTROLS & PAGINATION
          ===================================================================== */}
      <div className="mt-8 pt-4 border-t border-red-100/60 flex items-center justify-between gap-4">
        {/* Slide Indicators / Dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Slide Selector">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={currentSlide === idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx 
                  ? 'w-8 bg-[#800020]' 
                  : 'w-2.5 bg-red-200 hover:bg-red-300'
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-slate-400 ml-2">
            0{currentSlide + 1} / 0{slidesCount}
          </span>
        </div>

        {/* Previous / Next Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-9 h-9 rounded-full bg-white hover:bg-red-50 text-slate-700 hover:text-red-900 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-9 h-9 rounded-full bg-white hover:bg-red-50 text-slate-700 hover:text-red-900 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
