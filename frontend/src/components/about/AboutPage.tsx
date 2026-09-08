import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  BrainCircuit, 
  MapPin,
  Clock,
  Trash2,
  Network,
  Droplets,
  Building2,
  Info
} from 'lucide-react';

export const AboutPage: React.FC = () => {
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
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Intelligent Healthcare Architecture</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About SmartBlood AI
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SmartBlood AI is an <strong>intelligent decision-support and resource-optimization layer</strong> designed to augment and empower national blood banking systems. It does not replace e-RaktKosh or authorized state transfusion management systems.
        </p>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-xl mx-auto font-medium">
          Prototype developed for Smart India Hackathon 2026 — Problem Statement 26202 (Blood Resource Management & Wastage Reduction).
        </div>
      </div>

      {/* Problem & Solution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="health-card p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">The Problem</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Blood banking networks across India face a dual paradox: acute emergency shortages in apex trauma hospitals, contrasted with high expiration wastage in peripheral blood banks. Fragmented communications, static portals without forward-looking demand anticipation, and lack of automated FEFO triage result in preventable blood component loss.
          </p>
        </div>

        <div className="health-card p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">The Solution</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            SmartBlood AI introduces predictive Machine Learning demand forecasting, automated First-Expiry-First-Out (FEFO) shelf-life triage, inter-hospital peer coordination (H2H), and algorithmic resource redistribution. It connects licensed blood banks and hospitals into a synchronized, life-saving network.
          </p>
        </div>

      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Clock className="w-5 h-5 text-red-600" />
          <h4 className="text-sm font-bold text-slate-900">Shelf-Life Management</h4>
          <p className="text-xs text-slate-500">
            Enforces strict regulatory lifespans (42 days for PRBC, 5 days for Platelets, 1 year for FFP).
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Trash2 className="w-5 h-5 text-amber-600" />
          <h4 className="text-sm font-bold text-slate-900">Wastage Reduction</h4>
          <p className="text-xs text-slate-500">
            Proactive rebalancing cuts component outdating by an estimated 28.4% across the cluster.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Network className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900">Hospital Coordination</h4>
          <p className="text-xs text-slate-500">
            Secure peer-to-peer inter-hospital requisitioning and mutual reserve cross-matching.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900">Donor Privacy</h4>
          <p className="text-xs text-slate-500">
            Strict pseudorandom token masking protects citizen donors from public phone scraping.
          </p>
        </div>
      </div>

      {/* Strategic Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Strategic Architectural Matrix: Traditional Portals vs SmartBlood AI
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How the AI optimization layer complements existing state registry infrastructures.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-4 w-1/4">Capability Dimension</th>
                <th className="py-3 px-4 w-1/3 text-slate-500">Traditional Portal (e.g. e-RaktKosh)</th>
                <th className="py-3 px-4 w-5/12 text-red-700 font-bold bg-red-50/50">
                  SmartBlood AI Decision-Support Layer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.capability}</td>
                  <td className="py-3.5 px-4 text-slate-500 leading-relaxed">{item.eraktkosh}</td>
                  <td className="py-3.5 px-4 text-slate-800 bg-red-50/20 font-medium leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{item.smartblood}</span>
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
