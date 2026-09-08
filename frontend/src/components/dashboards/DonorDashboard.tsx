import React, { useState } from 'react';
import { Heart, ShieldCheck, Calendar, Bell, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [optInEmergency, setOptInEmergency] = useState<boolean>(true);
  const [scheduled, setScheduled] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Ethical Privacy Assurance:</strong> Your contact number and personal identity are encrypted and pseudorandomly masked. Authorized transfusion centers contact you strictly through consent proxy tokens without public disclosure.
        </span>
      </div>

      {/* Donor Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-red-600 to-red-800 text-white flex items-center justify-center shadow-md shadow-red-900/20 shrink-0">
            <Heart className="w-8 h-8 fill-current text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Priya Nair</h2>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                DONOR-DL-0004
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted Mask: <span className="font-mono text-slate-700 font-bold">+91 ******2314</span> &bull; Region: Central Delhi
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                Blood Group: O+ (Universal RBC Recipient Match)
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Eligible to Donate Now</span>
              </span>
            </div>
          </div>
        </div>

        {/* Emergency On-Call Toggle */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-right self-stretch md:self-auto">
          <div className="text-xs font-bold text-slate-700 mb-1.5">Emergency Surge On-Call Opt-In</div>
          <button
            onClick={() => setOptInEmergency(!optInEmergency)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              optInEmergency 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {optInEmergency ? 'Active On-Call (Alerts Enabled)' : 'Standby Mode'}
          </button>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="health-card p-5 text-center">
          <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">4 Donations</div>
          <div className="text-xs text-slate-500">Total verified life-saving contributions</div>
        </div>

        <div className="health-card p-5 text-center">
          <Heart className="w-6 h-6 text-red-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-red-600 font-mono mt-1">Up to 12 Lives</div>
          <div className="text-xs text-slate-500">Estimated medical transfusions supported</div>
        </div>

        <div className="health-card p-5 text-center">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">95 Days Ago</div>
          <div className="text-xs text-slate-500">Last donation at Delhi Red Cross Centre</div>
        </div>
      </div>

      {/* Book Next Donation Appointment */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-600" />
          <span>Schedule Voluntary Blood Donation</span>
        </h3>
        <p className="text-xs text-slate-500">
          Book an expedited donation appointment at your nearest accredited regional transfusion center.
        </p>

        {scheduled ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Appointment confirmed for tomorrow at <strong>Delhi Red Cross Regional Transfusion Centre</strong> (10:30 AM).
            </span>
            <button
              onClick={() => setScheduled(false)}
              className="text-xs underline text-emerald-700 font-bold cursor-pointer"
            >
              Reschedule
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <select className="w-full sm:w-auto flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium cursor-pointer">
              <option>Delhi Red Cross Regional Transfusion Centre (Central Delhi) - Tomorrow 10:30 AM</option>
              <option>Safdarjung Regional Blood Centre (South Delhi) - Wednesday 02:00 PM</option>
              <option>AIIMS Apex Transfusion Medicine Unit - Saturday 11:00 AM</option>
            </select>
            <button
              onClick={() => setScheduled(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Confirm Appointment
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
