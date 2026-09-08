import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-emerald-500/10 border-b border-amber-500/30 backdrop-blur-md px-4 py-2 text-xs md:text-sm text-slate-200 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap text-center md:text-left justify-center md:justify-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEMO MODE
          </span>

          <span className="text-slate-300">
            <strong className="text-white font-medium">Verified Facility Data & Simulated Demo Stock:</strong> Blood-centre directory is sourced from official public registries (e-RaktKosh / Delhi DSACS). Stock balances are simulated for algorithm evaluation.
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            24 Official Delhi-NCR Centres Verified
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs">
          <a
            href="https://eraktkosh.mohfw.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium"
          >
            e-RaktKosh <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://dsacs.delhi.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium"
          >
            Delhi DSACS <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs py-0.5 px-1.5 rounded hover:bg-white/5 transition-colors"
            title="Toggle data governance details"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Policy</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/10 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Master Facility Data (Factual)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Facility names, addresses, emergency phone lines, regional classifications, and license numbers are extracted strictly from gazetted Delhi State AIDS Control Society (DSACS) directories and e-RaktKosh. No medical centers or contacts are fabricated.
            </p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulated Demonstration Inventory
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Due to patient confidentiality and lack of public real-time write-access to live blood bank databases, unit balances and batch expiry dates are modeled in conformance with DGHS/CDSCO shelf-life rules to demonstrate FEFO dispatch prioritization.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
