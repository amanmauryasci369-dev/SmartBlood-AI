import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Lock
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { HospitalBloodRequest, HospitalRequestMessage } from '../../types';

export const HospitalCommunicationsPage: React.FC = () => {
  const [requests, setRequests] = useState<HospitalBloodRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<(HospitalBloodRequest & { messages: HospitalRequestMessage[] }) | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getHospitalRequests();
      setRequests(data);
      if (data.length > 0 && !selectedRequestId) {
        setSelectedRequestId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (reqId: number) => {
    try {
      const detail = await ApiService.getHospitalRequestDetail(reqId);
      setSelectedRequestDetail(detail);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequestId) {
      fetchMessages(selectedRequestId);
    }
  }, [selectedRequestId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRequestId) return;
    setSending(true);
    try {
      await ApiService.sendHospitalCommunication(
        selectedRequestId,
        selectedRequestDetail?.requesting_hospital_id || 1,
        messageText.trim()
      );
      setMessageText('');
      await fetchMessages(selectedRequestId);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterType === 'ACTIVE') return r.status !== 'FULFILLED' && r.status !== 'CANCELLED' && r.status !== 'REJECTED';
    if (filterType === 'COMPLETED') return r.status === 'FULFILLED' || r.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold tracking-wide uppercase">
              Clinical Coordination Center
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold flex items-center">
              <Lock className="w-3 h-3 mr-1 text-emerald-400" />
              Zero PII Exposure Channel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Hospital Communication & Audit Center
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Internal secure coordination channel between hospital blood bank departments for requisition logistics, cross-match confirmations, and custody handovers.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Messages</span>
        </button>
      </div>

      {/* Main Grid: Request Selector (Left) & Chat/Audit Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Requests List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Requisition Threads</h3>
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-0.5 rounded ${filterType === 'ALL' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('ACTIVE')}
                className={`px-2 py-0.5 rounded ${filterType === 'ACTIVE' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterType('COMPLETED')}
                className={`px-2 py-0.5 rounded ${filterType === 'COMPLETED' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
              >
                Done
              </button>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[500px]">
            {filteredRequests.map(r => {
              const isSelected = r.id === selectedRequestId;
              const isCritical = r.emergency_level === 'CRITICAL';

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-md'
                      : 'bg-slate-850/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{r.request_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {r.emergency_level}
                    </span>
                  </div>

                  <div className="mt-1.5 font-bold text-white text-sm">
                    {r.quantity} units {r.blood_group} {r.component.replace(/_/g, ' ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="truncate max-w-[140px]">{r.requesting_hospital_name}</span>
                    <span className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] font-semibold text-slate-300">
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Communication Thread & Audit Log (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/60 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          {selectedRequestDetail ? (
            <>
              {/* Thread Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded">
                        {selectedRequestDetail.request_id}
                      </span>
                      <span className="text-xs text-slate-400">Coordination Channel</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedRequestDetail.quantity} Units {selectedRequestDetail.blood_group} {selectedRequestDetail.component.replace(/_/g, ' ')}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="px-3 py-1 bg-slate-800 text-cyan-300 rounded-lg text-xs font-bold border border-slate-700">
                      Status: {selectedRequestDetail.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {selectedRequestDetail.requesting_hospital_name} → {selectedRequestDetail.target_hospital_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages & Status Log */}
              <div className="py-4 space-y-3 overflow-y-auto flex-1 max-h-[380px] pr-2">
                {selectedRequestDetail.messages && selectedRequestDetail.messages.length > 0 ? (
                  selectedRequestDetail.messages.map(m => {
                    const isStatus = m.message_type === 'STATUS_CHANGE';

                    if (isStatus) {
                      return (
                        <div key={m.id} className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-start space-x-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-semibold text-white">{m.sender_hospital_name}: </span>
                            <span>{m.message}</span>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-cyan-300">{m.sender_hospital_name}</span>
                          <span className="text-slate-500">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">{m.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-500 py-10">No messages logged in this requisition thread.</p>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type secure clinical dispatch coordination message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  disabled={sending}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-cyan-900/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 text-slate-600" />
              <span>Select a requisition on the left to view the communication thread</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
