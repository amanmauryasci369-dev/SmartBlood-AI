import React from 'react';
import { AIInsightCard } from '../../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Database, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

interface AIInsightsSectionProps {
  insights: AIInsightCard[];
  onExecuteAction?: (insight: AIInsightCard) => void;
}

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({
  insights,
  onExecuteAction,
}) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-rose-600/50',
          bg: 'bg-rose-950/20',
          badge: 'bg-rose-950 text-rose-300 border-rose-800',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
          titleColor: 'text-rose-200',
          btnBg: 'bg-rose-600 hover:bg-rose-500',
        };
      case 'WARNING':
        return {
          border: 'border-amber-600/50',
          bg: 'bg-amber-950/20',
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          titleColor: 'text-amber-200',
          btnBg: 'bg-amber-600 hover:bg-amber-500',
        };
      case 'ATTENTION':
        return {
          border: 'border-yellow-600/50',
          bg: 'bg-yellow-950/20',
          badge: 'bg-yellow-950 text-yellow-300 border-yellow-800',
          icon: <Info className="w-5 h-5 text-yellow-400 shrink-0" />,
          titleColor: 'text-yellow-200',
          btnBg: 'bg-yellow-600 hover:bg-yellow-500 text-black',
        };
      case 'OPPORTUNITY':
      default:
        return {
          border: 'border-emerald-600/50',
          bg: 'bg-emerald-950/20',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          icon: <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />,
          titleColor: 'text-emerald-200',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>AI Autonomous Insights & Optimization Opportunities</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time synthesis of multi-source demand, degradation, and emergency queues into categorized actionable decisions.
          </p>
        </div>
        <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800">
          {insights.length} Active Syntheses
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((card) => {
          const style = getSeverityStyle(card.severity);

          return (
            <div
              key={card.id}
              className={`glass-panel p-5 rounded-2xl border ${style.border} ${style.bg} space-y-3 transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {style.icon}
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                      {card.severity}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Conf: <strong className="text-slate-200">{card.confidence}</strong>
                </span>
              </div>

              <div>
                <h4 className={`text-sm font-bold ${style.titleColor}`}>
                  {card.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {card.explanation}
                </p>
              </div>

              {/* Recommended Action Box */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Recommended Action:
                </div>
                <div className="text-white font-medium">
                  {card.recommended_action}
                </div>
              </div>

              {/* Sources & Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                  <Database className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Sources: {card.data_sources_used.join(', ')}</span>
                </div>

                <button
                  onClick={() => onExecuteAction && onExecuteAction(card)}
                  className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 ${style.btnBg}`}
                >
                  <span>Act</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
