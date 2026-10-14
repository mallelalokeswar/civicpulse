import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Map, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { fetchKeyConfig, saveGeminiKey } from '../api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (message: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchKeyConfig()
        .then((data) => {
          setIsConfigured(data.geminiConfigured);
          setMaskedKey(data.geminiKeyMasked || '');
        })
        .catch((err) => console.error('Failed to load key config:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveGeminiKey(geminiKey);
      setIsConfigured(res.geminiConfigured);
      setMaskedKey(res.geminiKeyMasked || '');
      setGeminiKey('');
      onKeySaved(res.message);
      onClose();
    } catch (err: any) {
      alert(`Failed to save API key: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearKey = async () => {
    if (!window.confirm('Clear saved Gemini API key and return to standalone simulation mode?')) return;
    setIsSaving(true);
    try {
      const res = await saveGeminiKey('');
      setIsConfigured(false);
      setMaskedKey('');
      setGeminiKey('');
      onKeySaved('Gemini API key cleared. Simulation mode active.');
    } catch (err: any) {
      alert(`Failed to clear API key: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Key className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                API Key & Service Settings
              </h2>
              <p className="text-xs text-slate-400">Configure Google Gemini & Municipal GIS Map Services</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Map Tiles Status (Resolving the 'API KEY REQUIRED' notice) */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-400" />
              GIS Map Tiles: 100% Free & Unlocked
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
              No Key Needed
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The previous CartoDB watermark (<em className="text-amber-300">"API KEY REQUIRED"</em>) has been resolved by switching to <strong>OpenStreetMap</strong> and <strong>Esri Satellite Imagery</strong>. Full dark-mode GIS heatmaps now render without any third-party billing!
          </p>
        </div>

        {/* 2. Google Gemini API Key Input */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium underline"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Current Status Pill */}
            <div className="mb-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">Current Status:</span>
              {isConfigured ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-semibold">{maskedKey}</span>
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Live (gemini-3.8-flash)
                  </span>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  <AlertCircle className="w-3 h-3" />
                  Intelligent Simulation Fallback
                </span>
              )}
            </div>

            {/* Input Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={isConfigured ? 'Paste new key to update...' : 'AIzaSy...'}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Key is stored in <code className="text-slate-400">.env</code> and initialized directly into the <code className="text-emerald-400">@google/genai</code> client runtime.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {isConfigured ? (
              <button
                type="button"
                onClick={handleClearKey}
                disabled={isSaving}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium disabled:opacity-50"
              >
                Clear Key
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !geminiKey.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
