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
      lifelink: "Machine Learning (Random Forest) predicts 1d, 3d, 7d, and 30d demand curves with seasonal epidemic adjustments.",
    },
    {
      capability: "2. Shortage Prediction",
      eraktkosh: "Reacts only after a blood bank runs out of stock.",
      lifelink: "Quantitative Balance Equation (Stock + Inflow - Demand - Expiry Loss) flags critical shortages 72h in advance.",
    },
    {
      capability: "3. FEFO Expiry Analysis",
      eraktkosh: "Simple date display; high risk of blood component spoilage.",
      lifelink: "Automated 3-tier FEFO risk classifier suggests immediate priority rebalancing to prevent expiration.",
    },
    {
      capability: "4. AI Donor Matching",
      eraktkosh: "Static phone directory with public exposure of donor numbers.",
      lifelink: "Transparent multi-factor scoring (Compatibility + Eligibility + Proximity + Probability) with masked privacy tokens.",
    },
    {
      capability: "5. Inter-Facility Redistribution",
      eraktkosh: "No inter-facility redistribution recommendations.",
      lifelink: "Proactively identifies surplus facilities and routes units to nearby high-demand trauma centers.",
    },
    {
      capability: "6. GIS Spatial Accessibility",
      eraktkosh: "List-based text search without traffic or transit corridors.",
      lifelink: "Interactive OpenStreetMap GIS calculating real-time ambulance transit time and cold-chain compliance.",
    },
    {
      capability: "7. Anomaly Detection",
      eraktkosh: "No algorithmic anomaly detection.",
      lifelink: "Statistical & Isolation Forest detector flags rapid inventory drops, theft, or sudden epidemic surges.",
    },
    {
      capability: "8. Smart Alerts Stream",
      eraktkosh: "No real-time severity alerts.",
      lifelink: "Categorized priority alerts (Critical, Warning, Attention, Opportunity) notifying clinicians instantly.",
    },
    {
      capability: "9. Explainable AI (XAI)",
      eraktkosh: "Not applicable.",
      lifelink: "Every clinical decision-support recommendation includes explicit reasons, distance factors, and feature weights.",
    },
    {
      capability: "10. Multi-Source Integration",
      eraktkosh: "Single portal silo.",
      lifelink: "Pluggable DataSourceAdapter architecture combining e-RaktKosh feeds, LIS lab records, hospital HIS, and GIS.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Intelligent Hospital & Blood Resource Network</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About LifeLink
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          LifeLink is an intelligent hospital and blood-resource coordination platform designed to connect hospitals, blood centers, donors, and emergency requirements through a unified digital network.
        </p>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-xl mx-auto font-medium space-y-1">
          <p>
            <strong>Decision Support Architecture:</strong> LifeLink provides AI-powered decision support. Final medical, transfusion, and blood-allocation decisions remain with licensed medical professionals.
          </p>
          <p className="text-slate-500 text-[11px]">
            Data Notice: Demonstrating with e-RaktKosh-compatible prototype/demo data. Not an official government platform.
          </p>
        </div>
      </div>

      {/* Eight Key Goals of LifeLink */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-lg font-black text-slate-900">
            Eight Strategic Goals of LifeLink
          </h2>
          <p className="text-xs text-slate-500">
            Engineered to bridge clinical communication gaps and modernize transfusion logistics nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { num: "1", title: "Improve blood availability visibility", desc: "Real-time stock queries across physical lab reserves and connected registries." },
            { num: "2", title: "Reduce blood wastage", desc: "FEFO shelf-life prioritization and proactive surplus redistribution." },
            { num: "3", title: "Predict shortages earlier", desc: "Machine Learning models identifying supply deficits up to 72 hours in advance." },
            { num: "4", title: "Improve hospital coordination", desc: "Hospital-to-hospital (H2H) peer requisitions and cross-match communication." },
            { num: "5", title: "Support emergency response", desc: "Urgent multi-criteria triage routing for trauma centers and acute patient needs." },
            { num: "6", title: "Optimize blood inventory", desc: "Decay-aware stocking policies distinguishing confirmed from external feeds." },
            { num: "7", title: "Connect available resources", desc: "GIS mapping linking blood centers, hospitals, trauma beds, and donor pools." },
            { num: "8", title: "Provide AI-powered decision support", desc: "Transparent, explainable recommendation heuristics for medical authorities." },
          ].map((goal) => (
            <div key={goal.num} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                {goal.num}
              </div>
              <h4 className="text-xs font-bold text-slate-900">{goal.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{goal.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Strategic Architectural Matrix: Traditional Portals vs LifeLink Network
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How LifeLink's intelligence layer complements existing healthcare infrastructure.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-4 w-1/4">Capability Dimension</th>
                <th className="py-3 px-4 w-1/3 text-slate-500">Traditional Registry (e.g. e-RaktKosh)</th>
                <th className="py-3 px-4 w-5/12 text-red-700 font-bold bg-red-50/50">
                  LifeLink Intelligent Coordination Network
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
                      <span>{item.lifelink}</span>
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
