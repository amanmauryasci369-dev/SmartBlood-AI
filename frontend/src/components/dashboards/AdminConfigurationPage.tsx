import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  TrendingDown, 
  Database,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { SystemConfigItem } from '../../types';

export const AdminConfigurationPage: React.FC = () => {
  const [configs, setConfigs] = useState<Record<string, SystemConfigItem>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getSystemConfigurations();
      setConfigs(data);
      const initialVals: Record<string, string> = {};
      Object.entries(data).forEach(([k, item]) => {
        initialVals[k] = item.value;
      });
      setFormValues(initialVals);
    } catch (err: any) {
      setError(err.message || 'Failed to load system configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = Object.entries(formValues).map(([key, value]) => ({
        key,
        value,
        description: configs[key]?.description
      }));
      await ApiService.updateSystemConfigurations(payload);
      setSavedSuccess(true);
      await fetchConfigs();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update administrative configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading && Object.keys(configs).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-slate-400 font-medium">Loading system operational thresholds and algorithm configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold tracking-wide uppercase">
              System Administration
            </span>
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold tracking-wide">
              Dynamic Operational Parameters
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            System & Decision Engine Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Configure operational safety thresholds, FEFO triage windows, and shortage alert sensitivity without hard-coded constants.
          </p>
        </div>

        <button
          onClick={fetchConfigs}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition self-start sm:self-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Configuration updated successfully! New thresholds are actively evaluated across all decision support modules.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-medium flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Threshold Category: Expiry & Shelf-Life Management */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Shelf-Life & FEFO Expiry Thresholds</h3>
            </div>
            <span className="text-xs text-slate-400">Step 2, 4 & 18</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expiry Warning */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-white block">Expiry Warning Window</label>
                  <span className="text-xs text-slate-400">Triggers APPROACHING_EXPIRY status</span>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-mono font-bold rounded-lg text-sm">
                  {formValues['EXPIRY_WARNING_DAYS'] || '7'} Days
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="14"
                value={formValues['EXPIRY_WARNING_DAYS'] || '7'}
                onChange={e => handleChange('EXPIRY_WARNING_DAYS', e.target.value)}
                className="w-full accent-amber-400"
              />
              <p className="text-[11px] text-slate-500">
                Inventory batches within this number of days until expiry are flagged for elective scheduling.
              </p>
            </div>

            {/* Expiry Critical */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-white block">Expiry Critical Window</label>
                  <span className="text-xs text-slate-400">Triggers HIGH_EXPIRY_RISK status</span>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 font-mono font-bold rounded-lg text-sm">
                  {formValues['EXPIRY_CRITICAL_DAYS'] || '3'} Days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={formValues['EXPIRY_CRITICAL_DAYS'] || '3'}
                onChange={e => handleChange('EXPIRY_CRITICAL_DAYS', e.target.value)}
                className="w-full accent-red-400"
              />
              <p className="text-[11px] text-slate-500">
                Units within this window are prioritized for emergency cross-matching or inter-facility transfer.
              </p>
            </div>
          </div>
        </div>

        {/* Threshold Category: Inventory Freshness & Stale Detection */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Inventory Freshness & Stale Audit Window</h3>
            </div>
            <span className="text-xs text-slate-400">Step 11 & 18</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-white block">Inventory Stale Cutoff</label>
                  <span className="text-xs text-slate-400">Hours without lab verification</span>
                </div>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 font-mono font-bold rounded-lg text-sm">
                  {formValues['INVENTORY_STALE_HOURS'] || '24'} Hours
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="72"
                step="6"
                value={formValues['INVENTORY_STALE_HOURS'] || '24'}
                onChange={e => handleChange('INVENTORY_STALE_HOURS', e.target.value)}
                className="w-full accent-cyan-400"
              />
              <p className="text-[11px] text-slate-500">
                Blood inventories unverified by clinical staff after this elapsed period revert to REPORTED_AVAILABILITY status.
              </p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-white block">Minimum Safety Stock Level</label>
                  <span className="text-xs text-slate-400">Per blood group reserve</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-mono font-bold rounded-lg text-sm">
                  {formValues['MIN_SAFETY_STOCK_UNITS'] || '5'} Units
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={formValues['MIN_SAFETY_STOCK_UNITS'] || '5'}
                onChange={e => handleChange('MIN_SAFETY_STOCK_UNITS', e.target.value)}
                className="w-full accent-emerald-400"
              />
              <p className="text-[11px] text-slate-500">
                Minimum certified compatible units that must be reserved before deficit alerts escalate.
              </p>
            </div>
          </div>
        </div>

        {/* Threshold Category: Predictive ML & Shortage Safety Multipliers */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Shortage Buffer Multipliers & Wastage Sensitivity</h3>
            </div>
            <span className="text-xs text-slate-400">Step 8 & 18</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-white block">Shortage Buffer Multiplier</label>
                  <span className="text-xs text-slate-400">Applied to 7-day demand forecast</span>
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 font-mono font-bold rounded-lg text-sm">
                  {formValues['SHORTAGE_THRESHOLD_MULTIPLIER'] || '1.2'}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={formValues['SHORTAGE_THRESHOLD_MULTIPLIER'] || '1.2'}
                onChange={e => handleChange('SHORTAGE_THRESHOLD_MULTIPLIER', e.target.value)}
                className="w-full accent-purple-400"
              />
              <p className="text-[11px] text-slate-500">
                Multiplied with Scikit-Learn forecasted demand to calculate clinical safety margin for trauma centers.
              </p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-white block">Wastage Risk Alert Cutoff</label>
                  <span className="text-xs text-slate-400">Probability threshold for advisories</span>
                </div>
                <span className="px-3 py-1 bg-rose-500/20 text-rose-400 font-mono font-bold rounded-lg text-sm">
                  {Math.round(Number(formValues['WASTAGE_RISK_THRESHOLD'] || 0.15) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={formValues['WASTAGE_RISK_THRESHOLD'] || '0.15'}
                onChange={e => handleChange('WASTAGE_RISK_THRESHOLD', e.target.value)}
                className="w-full accent-rose-400"
              />
              <p className="text-[11px] text-slate-500">
                Proactive redistribution advisories are escalated when spoilage probability surpasses this value.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end space-x-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md sticky bottom-4">
          <button
            type="button"
            onClick={fetchConfigs}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-cyan-900/30"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Persisting Configurations...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
