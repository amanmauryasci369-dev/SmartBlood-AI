import React from 'react';
import { 
  Heart, 
  Droplets, 
  Building2, 
  BarChart3, 
  AlertTriangle, 
  UserCheck, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface QuickActionCardsProps {
  onNavigateToTab: (tab: any) => void;
  onOpenSOSModal: () => void;
  onScrollToSearch: () => void;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = ({
  onNavigateToTab,
  onOpenSOSModal,
  onScrollToSearch
}) => {
  const cards = [
    {
      id: 'donate',
      title: 'Donate Blood',
      desc: 'Join the movement. Save lives.',
      icon: Heart,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      arrowColor: 'text-rose-600',
      action: () => onNavigateToTab('donation-camps')
    },
    {
      id: 'request',
      title: 'Request Blood',
      desc: 'Find available blood near you.',
      icon: Droplets,
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
      arrowColor: 'text-red-600',
      action: onScrollToSearch
    },
    {
      id: 'centers',
      title: 'Blood Centres',
      desc: 'Locate nearby blood centres.',
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      arrowColor: 'text-blue-600',
      action: () => onNavigateToTab('blood-centers')
    },
    {
      id: 'insights',
      title: 'AI Insights',
      desc: 'Predict, plan and save more lives.',
      icon: BarChart3,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      arrowColor: 'text-purple-600',
      action: () => onNavigateToTab('ai-insights')
    },
    {
      id: 'sos',
      title: 'Emergency SOS',
      desc: 'Get immediate assistance.',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      arrowColor: 'text-amber-600',
      action: onOpenSOSModal
    },
    {
      id: 'hospital',
      title: 'Hospital Desk',
      desc: 'For hospitals and medical staff.',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      arrowColor: 'text-emerald-600',
      action: () => onNavigateToTab('hospital-exchange')
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.action}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-rose-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-110`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`${card.arrowColor} opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>

            <div className="pt-3.5 space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-[#9B001B] transition-colors">
                {card.title}
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
};
