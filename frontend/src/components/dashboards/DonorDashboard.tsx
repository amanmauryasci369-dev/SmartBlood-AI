import React, { useState } from 'react';
import { Heart, ShieldCheck, Calendar, Bell, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [optInEmergency, setOptInEmergency] = useState<boolean>(true);
  const [scheduled, setScheduled] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      
      {/* Privacy Notice Banner (Rule 8) */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Privacy Assurance:</strong> Your contact number and personal identity are encrypted and pseudorandomly masked. Authorized transfusion centers contact you strictly through consent proxy tokens.
        </span>
      </div>

      {/* Donor Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blood-600 to-blood-800 border border-blood-500/40 flex items-center justify-center text-white shadow-lg shadow-blood-950/50">
            <Heart className="w-8 h-8 fill-current text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Priya Nair</h2>
              <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
                DONOR-DL-0004
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Contact Mask: <span className="font-mono text-slate-300">+91 ******2314</span> &bull; Preferred District: Central Delhi
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-blood-400 bg-blood-950/80 px-2 py-0.5 rounded border border-blood-900">
                Blood Group: O+ (Universal RBC Recipient Match)
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Eligible to Donate Now
              </span>
            </div>
          </div>
        </div>

        {/* Emergency On-Call Toggle */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-right">
          <div className="text-xs font-medium text-slate-300 mb-1">Emergency Rare/Surge On-Call Opt-In</div>
          <button
            onClick={() => setOptInEmergency(!optInEmergency)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              optInEmergency 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {optInEmergency ? 'Active On-Call (Alerts Enabled)' : 'Standby Mode'}
          </button>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <Award className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-white font-mono mt-1">4 Donations</div>
          <div className="text-xs text-slate-400">Total verified life-saving contributions</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <Heart className="w-6 h-6 text-blood-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-blood-400 font-mono mt-1">Up to 12 Lives</div>
          <div className="text-xs text-slate-400">Estimated medical transfusions supported</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">95 Days Ago</div>
          <div className="text-xs text-slate-400">Last donation at Delhi Red Cross Centre</div>
        </div>
      </div>

      {/* Book Next Donation Appointment */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blood-400" />
          <span>Schedule Blood Donation Session</span>
        </h3>
        <p className="text-xs text-slate-400">
          Book an expedited donation appointment at your nearest accredited regional transfusion center.
        </p>

        {scheduled ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Appointment confirmed for tomorrow at <strong>Delhi Red Cross Regional Transfusion Centre</strong> (10:30 AM).
            </span>
            <button
              onClick={() => setScheduled(false)}
              className="text-xs underline text-emerald-400 hover:text-emerald-300"
            >
              Reschedule
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <select className="w-full sm:w-auto flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
              <option>Delhi Red Cross Regional Transfusion Centre (Central Delhi) - Tomorrow 10:30 AM</option>
              <option>Safdarjung Regional Blood Centre (South Delhi) - Wednesday 02:00 PM</option>
              <option>AIIMS Apex Transfusion Medicine Unit - Saturday 11:00 AM</option>
            </select>
            <button
              onClick={() => setScheduled(true)}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white font-semibold text-xs transition-all shadow-md"
            >
              Confirm Appointment
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
