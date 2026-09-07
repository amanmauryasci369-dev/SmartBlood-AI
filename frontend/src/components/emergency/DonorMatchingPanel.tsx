import React, { useEffect, useState } from 'react';
import { BloodGroup, DonorMatchItem } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Users, 
  ShieldCheck, 
  Heart, 
  Send, 
  Navigation, 
  CheckCircle2, 
  Sparkles,
  Percent
} from 'lucide-react';

interface DonorMatchingPanelProps {
  bloodGroup?: BloodGroup;
}

export const DonorMatchingPanel: React.FC<DonorMatchingPanelProps> = ({
  bloodGroup = 'O-',
}) => {
  const [matches, setMatches] = useState<DonorMatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifiedMap, setNotifiedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/v1/intel/donor-matches?blood_group=${bloodGroup}`)
      .then((r) => r.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error('Failed to load donor matches:', err))
      .finally(() => setLoading(false));
  }, [bloodGroup]);

  const handleNotifyDonor = (donorId: number) => {
    setNotifiedMap((prev) => ({ ...prev, [donorId]: true }));
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blood-400" />
            <span>Transparent AI Donor Matching ({bloodGroup} Compatible)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Multi-factor objective ranking: Compatibility (30%) + Eligibility (25%) + Proximity (20%) + Response Probability (25%).
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Donor PII Privacy Masking Active</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">
          Evaluating compatible donor registry...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Donor Tag</th>
                <th className="py-2.5 px-3">Group</th>
                <th className="py-2.5 px-3">Proximity</th>
                <th className="py-2.5 px-3">Eligibility</th>
                <th className="py-2.5 px-3">Resp. Prob</th>
                <th className="py-2.5 px-3">Match Score</th>
                <th className="py-2.5 px-3 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {matches.slice(0, 7).map((donor) => {
                const isNotified = notifiedMap[donor.donor_id];
                return (
                  <tr key={donor.donor_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      #{donor.rank}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                      {donor.public_donor_tag}
                    </td>
                    <td className="py-2.5 px-3 font-bold font-mono text-blood-400">
                      {donor.blood_group}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {donor.distance_km} km
                    </td>
                    <td className="py-2.5 px-3">
                      {donor.is_eligible ? (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                          Eligible
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-950 px-2 py-0.5 rounded border border-amber-900">
                          Cool-off Window
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">
                      {(donor.response_probability * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-purple-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>{donor.overall_match_score}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isNotified ? (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Notified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleNotifyDonor(donor.donor_id)}
                          className="px-2.5 py-1 rounded bg-blood-600 hover:bg-blood-500 text-white font-semibold text-[11px] transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>Alert On-Call</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
