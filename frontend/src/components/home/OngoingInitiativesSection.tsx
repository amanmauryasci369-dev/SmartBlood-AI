import React from 'react';
import { 
  Target, 
  ArrowRight, 
  HeartHandshake, 
  Hospital, 
  Sparkles, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface OngoingInitiativesSectionProps {
  onNavigateToTab: (tab: any) => void;
}

export const OngoingInitiativesSection: React.FC<OngoingInitiativesSectionProps> = ({
  onNavigateToTab
}) => {
  const initiatives = [
    {
      id: 'voluntary',
      title: 'National Voluntary Blood Donation Initiative',
      desc: 'Pan-India community blood donor mobilization and periodic university drives.',
      icon: HeartHandshake,
      iconBg: 'bg-rose-100/70 text-rose-700',
      action: () => onNavigateToTab('donation-camps')
    },
    {
      id: 'exchange',
      title: 'Hospital Blood Exchange (FEFO)',
      desc: 'Peer-to-peer clinical inventory balancing preventing component spoilage.',
      icon: Hospital,
      iconBg: 'bg-amber-100/70 text-amber-700',
      action: () => onNavigateToTab('hospital-exchange')
    },
    {
      id: 'ai-engine',
      title: 'AI Shortage Prediction Engine',
      desc: 'Quantitative 72-hour algorithmic forecasting for critical trauma corridors.',
      icon: Sparkles,
      iconBg: 'bg-purple-100/70 text-purple-700',
      action: () => onNavigateToTab('ai-insights')
    },
    {
      id: 'safe-future',
      title: 'Safe Blood, Sustainable Future',
      desc: 'NBTC quality-certified cold chain testing and zero-wastage protocols.',
      icon: ShieldCheck,
      iconBg: 'bg-red-100/70 text-red-700',
      action: () => onNavigateToTab('about')
    }
  ];

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Ongoing Initiatives
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Building a healthier, stronger India
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('about')}
          className="text-xs font-bold text-[#9B001B] hover:text-[#7d0015] flex items-center gap-1 self-start sm:self-auto cursor-pointer group"
        >
          <span>View All Initiatives</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {initiatives.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.action}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-rose-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg} transition-transform group-hover:scale-110`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#9B001B] group-hover:translate-x-1 transition-all" />
              </div>

              <div className="pt-3.5 space-y-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-[#9B001B] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
