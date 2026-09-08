import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight,
  Database,
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  MapPin
} from 'lucide-react';

export const WhySmartBloodPage: React.FC = () => {
  const comparisonItems = [
    {
      capability: "1. Demand Forecasting",
      eraktkosh: "Static historical records only; no predictive horizon.",
      smartblood: "Machine Learning (Random Forest) predicts 1d, 3d, 7d, and 30d demand curves with seasonal epidemic adjustments.",
    },
    {
      capability: "2. Shortage Prediction",
      eraktkosh: "Reacts only after a blood bank runs out of stock.",
      smartblood: "Quantitative Balance Equation (Stock + Inflow - Demand - Expiry Loss) flags critical shortages 72h in advance.",
    },
    {
      capability: "3. FEFO Expiry Analysis",
      eraktkosh: "Simple date display; high risk of blood component spoilage.",
      smartblood: "Automated 3-tier FEFO risk classifier suggests immediate priority rebalancing to prevent expiration.",
    },
    {
      capability: "4. AI Donor Matching",
      eraktkosh: "Static phone directory with public exposure of donor numbers.",
      smartblood: "Transparent multi-factor scoring (Compatibility + Eligibility + Proximity + Probability) with masked privacy tokens.",
    },
    {
      capability: "5. Inter-Facility Redistribution",
      eraktkosh: "No inter-facility redistribution recommendations.",
      smartblood: "Proactively identifies surplus facilities and routes units to nearby high-demand trauma centers.",
    },
    {
      capability: "6. GIS Spatial Accessibility",
      eraktkosh: "List-based text search without traffic or transit corridors.",
      smartblood: "Interactive OpenStreetMap GIS calculating real-time ambulance transit time and cold-chain compliance.",
    },
    {
      capability: "7. Anomaly Detection",
      eraktkosh: "No algorithmic anomaly detection.",
      smartblood: "Statistical & Isolation Forest detector flags rapid inventory drops, theft, or sudden epidemic surges.",
    },
    {
      capability: "8. Smart Alerts Stream",
      eraktkosh: "No real-time severity alerts.",
      smartblood: "Categorized priority alerts (Critical, Warning, Attention, Opportunity) notifying clinicians instantly.",
    },
    {
      capability: "9. Explainable AI (XAI)",
      eraktkosh: "Not applicable.",
      smartblood: "Every clinical decision-support recommendation includes explicit reasons, distance factors, and feature weights.",
    },
    {
      capability: "10. Multi-Source Integration",
      eraktkosh: "Single portal silo.",
      smartblood: "Pluggable DataSourceAdapter architecture combining e-RaktKosh feeds, LIS lab records, hospital HIS, and GIS.",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-950/80 text-blood-400 border border-blood-800/60 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Strategic Architectural Advantage</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Why LifeLink?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          LifeLink forms an <strong>intelligent decision-support and resource-coordination network</strong> connecting hospitals, blood centers, donors, and emergency requirements.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[11px] tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-5 w-1/4">Capability Dimension</th>
                <th className="py-4 px-5 w-1/3 text-slate-400">Traditional Registry (e.g. e-RaktKosh)</th>
                <th className="py-4 px-5 w-5/12 text-blood-400 font-bold bg-blood-950/30">
                  LifeLink Coordination Network
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {comparisonItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white">
                    {item.capability}
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <span>{item.eraktkosh}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-200 leading-relaxed bg-blood-950/10">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{item.smartblood}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
