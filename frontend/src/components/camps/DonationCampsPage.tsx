import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Users, 
  CheckCircle2, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

interface CampItem {
  id: number;
  name: string;
  organizer: string;
  district: string;
  state: string;
  address: string;
  date: string;
  time: string;
  available_slots: number;
  contact: string;
  category: 'Community Center' | 'Hospital Premises' | 'College Campus' | 'Corporate Park';
}

export const DonationCampsPage: React.FC = () => {
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [registeredCampId, setRegisteredCampId] = useState<number | null>(null);
  const [showRegModal, setShowRegModal] = useState<CampItem | null>(null);
  const [donorName, setDonorName] = useState<string>('Priya Nair');
  const [donorPhone, setDonorPhone] = useState<string>('+91 98765 43210');
  const [donorGroup, setDonorGroup] = useState<string>('O+');

  const mockCamps: CampItem[] = [
    {
      id: 1,
      name: 'Central Delhi Red Cross Mega Donation Drive',
      organizer: 'Delhi Red Cross Blood Bank',
      district: 'Central Delhi',
      state: 'Delhi',
      address: 'Red Cross Bhawan, 1 Red Cross Road, New Delhi',
      date: 'Tomorrow, Sept 9, 2026',
      time: '09:00 AM - 04:00 PM',
      available_slots: 42,
      contact: '011-23716441',
      category: 'Community Center'
    },
    {
      id: 2,
      name: 'AIIMS Annual Voluntary Transfusion Camp',
      organizer: 'AIIMS Main Blood Bank',
      district: 'South Delhi',
      state: 'Delhi',
      address: 'Auditorium Foyer, AIIMS Campus, Ansari Nagar East',
      date: 'Sept 11, 2026',
      time: '10:00 AM - 05:00 PM',
      available_slots: 65,
      contact: '011-26588500',
      category: 'Hospital Premises'
    },
    {
      id: 3,
      name: 'Safdarjung Youth Life-Saving Blood Drive',
      organizer: 'Safdarjung Hospital Blood Bank',
      district: 'South West Delhi',
      state: 'Delhi',
      address: 'OPD Complex Ground Floor, Safdarjung Enclave',
      date: 'Sept 13, 2026',
      time: '09:30 AM - 03:30 PM',
      available_slots: 28,
      contact: '011-26165060',
      category: 'Hospital Premises'
    },
    {
      id: 4,
      name: 'Connaught Place Civic Awareness Camp',
      organizer: 'Rotary Blood Bank Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      address: 'Central Park Amphitheatre, Connaught Place',
      date: 'Sept 15, 2026',
      time: '10:00 AM - 06:00 PM',
      available_slots: 50,
      contact: '011-26802111',
      category: 'Community Center'
    }
  ];

  const filteredCamps = mockCamps.filter((c) => {
    if (districtFilter !== 'ALL' && c.district !== districtFilter) return false;
    return true;
  });

  const handleRegisterConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRegModal) {
      setRegisteredCampId(showRegModal.id);
      setShowRegModal(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Voluntary Blood Drives</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Blood Donation Camps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover scheduled community and mobile donation camps across regional centers. Pre-register for expedited donation.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 text-xs self-start md:self-auto">
          <span className="font-bold text-slate-600">District:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            <option value="Central Delhi">Central Delhi</option>
            <option value="South Delhi">South Delhi</option>
            <option value="South West Delhi">South West Delhi</option>
            <option value="New Delhi">New Delhi</option>
          </select>
        </div>
      </div>

      {registeredCampId && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Slot successfully booked! Confirmation token generated under masked privacy protocol.
          </span>
          <button
            onClick={() => setRegisteredCampId(null)}
            className="text-xs text-emerald-700 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Camps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCamps.map((camp) => {
          const isRegistered = registeredCampId === camp.id;

          return (
            <div
              key={camp.id}
              className="health-card p-6 space-y-4 border border-slate-200 hover:border-slate-300 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {camp.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {camp.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Organized by: <strong>{camp.organizer}</strong></span>
                </p>

                <p className="text-xs text-slate-500 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{camp.address}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Date</span>
                  <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-red-600" />
                    <span>{camp.date}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Timing</span>
                  <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>{camp.time}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Available Slots</span>
                  <strong className="text-emerald-700 font-bold mt-0.5 block">
                    {camp.available_slots} Slots
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">Helpline: {camp.contact}</span>

                {isRegistered ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registered</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setShowRegModal(camp)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Register Slot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Pre-Register for Blood Drive</h3>
                <p className="text-[11px] text-slate-500">{showRegModal.name}</p>
              </div>
              <button onClick={() => setShowRegModal(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
            </div>

            <form onSubmit={handleRegisterConfirm} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Donor Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={donorGroup}
                  onChange={(e) => setDonorGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-red-600"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact (Masked Consent Token)</label>
                <input
                  type="text"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 italic">
                * Consent note: Donor phone numbers are stored as encrypted tokens and are never exposed publicly.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
