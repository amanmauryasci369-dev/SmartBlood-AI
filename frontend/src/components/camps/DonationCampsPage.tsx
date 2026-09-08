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
      
      {/* 1. Be a Hero, Donate Blood Hero Card (Screen 6 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Heading & 4 Steps */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M12 2.5C12 2.5 6 9.5 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 9.5 12 2.5 12 2.5Z" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Be a Hero, Donate Blood
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  One donation can save up to 3 lives.
                </p>
              </div>
            </div>

            {/* 4-Step Process Strip (Screen 6 in Reference) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-xs font-bold text-slate-800">Register</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-xs font-bold text-slate-800">Check Eligibility</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-xs font-bold text-slate-800">Book Appointment</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <span className="text-xs font-bold text-slate-800">Donate &amp; Save Lives</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowRegModal(mockCamps[0])}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
              >
                Register as Donor
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('donation-camps-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right: Artwork */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4">
            <div className="w-28 h-36 flex items-center justify-center relative filter drop-shadow-md">
              <svg viewBox="0 0 100 130" className="w-full h-full">
                <defs>
                  <linearGradient id="campDropGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 8 C50 8 16 55 16 85 C16 104.882 31.118 121 50 121 C68.882 121 84 104.882 84 85 C84 55 50 8 50 8 Z"
                  fill="url(#campDropGrad)"
                />
                <path d="M50 16 C50 16 28 55 28 78 C28 60 44 32 50 16 Z" fill="white" opacity="0.4" />
              </svg>
            </div>
            <div className="mt-3">
              <div className="font-serif italic text-sm text-[#9B001B] font-bold">
                Donate Today
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Be Someone's Tomorrow ❤️
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Upcoming Camps Filter & Header */}
      <div id="donation-camps-list" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Upcoming Scheduled Camps &amp; Mobile Drives
          </h2>
          <p className="text-xs text-slate-500">
            Pre-register for expedited donor check-in at verified regional drives
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
