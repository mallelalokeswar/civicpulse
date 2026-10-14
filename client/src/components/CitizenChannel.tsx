import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  Square, 
  MapPin, 
  Send, 
  Sparkles, 
  Upload, 
  Smartphone, 
  Languages, 
  Bot,
  Layers,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { submitMultimodalTriage, submitBotMessage } from '../api';
import { Ticket } from '../types';

interface CitizenChannelProps {
  onTicketCreated: (ticket: Ticket) => void;
  onViewHeatmap: () => void;
}

export const CitizenChannel: React.FC<CitizenChannelProps> = ({ onTicketCreated, onViewHeatmap }) => {
  const [activeChannelMode, setActiveChannelMode] = useState<'web' | 'bot'>('web');

  // Web Form State
  const [citizenName, setCitizenName] = useState('Sarah Jenkins');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('742 Evergreen Terrace, North Crossway');
  const [lat, setLat] = useState('37.7749');
  const [lng, setLng] = useState('-122.4194');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Submission & Triage State
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageProgressStep, setTriageProgressStep] = useState<number>(0);
  const [triageResult, setTriageResult] = useState<any>(null);

  // Bot Simulator State
  const [botPlatform, setBotPlatform] = useState<'WhatsApp' | 'Telegram'>('WhatsApp');
  const [botMessages, setBotMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; image?: string }>>([
    {
      sender: 'bot',
      text: `👋 Welcome to CivicPulse Autonomous Municipal Bot!\nSnap a photo or drop a voice note in any language. Our Gemini 3.8 Flash multimodal engine will triage and dispatch city emergency crews autonomously.`,
      time: '10:00 AM'
    }
  ]);
  const [botInputText, setBotInputText] = useState('');
  const [botMediaFile, setBotMediaFile] = useState<File | null>(null);
  const [botMediaPreview, setBotMediaPreview] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Quick Preset Scenarios for Rapid Demo
  const presets = [
    {
      title: 'Pothole on Main Arterial',
      category: 'Roads',
      notes: 'Huge 18cm pothole right in the wheel path near metro bus stop. Cars swerving dangerously.',
      address: '742 Evergreen Terrace, North Crossway',
      lat: '37.7749',
      lng: '-122.4194',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Water Main Rupture & Flooding',
      category: 'Water',
      notes: 'Pressurized water is bubbling through the road asphalt, flooding the sidewalk and basement steps!',
      address: '1420 Harbor View Blvd, Pier 9',
      lat: '37.7833',
      lng: '-122.4167',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Downed Streetlight & Sparks',
      category: 'Electric',
      notes: 'Delivery truck smashed into the pole. Live 240V wire hanging near student pedestrian crosswalk.',
      address: '318 University Ave & 4th Street',
      lat: '37.7690',
      lng: '-122.4467',
      image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Chemical Drums Illegal Dump',
      category: 'Waste',
      notes: 'Four 55-gallon solvent barrels dumped in back alley behind freight tracks. Strong chemical smell.',
      address: '890 Ironwood Rail Way',
      lat: '37.7580',
      lng: '-122.3920',
      image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setNotes(preset.notes);
    setAddress(preset.address);
    setLat(preset.lat);
    setLng(preset.lng);
    setImagePreview(preset.image);
    setImageFile(null); // Will use URL or simulated attachment
  };

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or unsupported:', err);
      alert('Microphone access is not available or blocked in this browser. You can still type notes or use preset scenarios!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Live Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Live Sensor)`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Fallback demo coordinates
          setLat('37.7749');
          setLng('-122.4194');
        }
      );
    }
  };

  // Handle Web Triage Submission
  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriaging(true);
    setTriageProgressStep(1);

    const formData = new FormData();
    formData.append('citizenName', citizenName);
    formData.append('notes', notes);
    formData.append('address', address);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('channel', 'Web Multimodal App');
    formData.append('language', selectedLanguage);

    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (audioBlob) {
      formData.append('audio', audioBlob, 'citizen_voice_note.webm');
    }

    try {
      // Simulate visual pipeline steps for UI feedback
      setTimeout(() => setTriageProgressStep(2), 600);
      setTimeout(() => setTriageProgressStep(3), 1300);

      const result = await submitMultimodalTriage(formData);
      setTriageProgressStep(4);
      setTriageResult(result);

      if (result.ticket) {
        onTicketCreated(result.ticket);
      } else if (result.masterTicket) {
        onTicketCreated(result.masterTicket);
      }
    } catch (err: any) {
      alert(`Triage failed: ${err.message}`);
    } finally {
      setIsTriaging(false);
    }
  };

  // Bot Simulator Send
  const handleBotSend = async () => {
    if (!botInputText.trim() && !botMediaFile) return;

    const userText = botInputText;
    const mediaPreview = botMediaPreview;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    setBotMessages(prev => [
      ...prev,
      { sender: 'user', text: userText, time: nowTime, image: mediaPreview || undefined }
    ]);

    setBotInputText('');
    setBotMediaFile(null);
    setBotMediaPreview(null);
    setIsBotThinking(true);

    const formData = new FormData();
    formData.append('channel', `${botPlatform} Bot`);
    formData.append('userPhone', '+1 (555) 392-1084');
    formData.append('textMessage', userText);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (botMediaFile) {
      formData.append('media', botMediaFile);
    }

    try {
      const data = await submitBotMessage(formData);
      setBotMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      if (data.ticket) {
        onTicketCreated(data.ticket);
      }
    } catch (err: any) {
      setBotMessages(prev => [
        ...prev,
        { sender: 'bot', text: `⚠️ Autonomous triage failed to process message: ${err.message}`, time: nowTime }
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Channel Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-emerald-400" />
            Multimodal Citizen Ingestion Channel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Citizens file hazard reports in any language via photos, video clips, or audio voice memos with zero tedious bureaucracy.
          </p>
        </div>

        {/* Mode Toggle: Web Portal vs WhatsApp/Telegram Bot Simulator */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveChannelMode('web')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeChannelMode === 'web'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Web Portal Channel
          </button>
          <button
            onClick={() => setActiveChannelMode('bot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeChannelMode === 'bot'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            WhatsApp / Telegram Bot
          </button>
        </div>
      </div>

      {activeChannelMode === 'web' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Demo Presets */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Scenario Presets (1-Click Test)
                </span>
                <span className="text-[11px] text-slate-500">Auto-fills realistic hazard evidence</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left transition-all group"
                  >
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">{p.category}</span>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1 mt-0.5">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Ingestion Form */}
            <form onSubmit={handleSubmitTriage} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              {/* Visual Evidence (Photo / Video) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  1. Visual Evidence (Photo / Video)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 transition-all bg-slate-950/50 flex flex-col items-center justify-center relative min-h-[160px]">
                  {imagePreview ? (
                    <div className="w-full relative group">
                      <img 
                        src={imagePreview} 
                        alt="Hazard preview" 
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute top-2 right-2 bg-slate-950/80 hover:bg-rose-900 text-white text-xs px-2.5 py-1 rounded-md border border-slate-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Drag and drop hazard photo/video, or click to browse</p>
                      <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP, MP4</p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Memo Recording (Multilingual) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-sky-400" />
                    2. Voice Memo (Any Language)
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-slate-500" />
                    Auto-transcribed & translated by Gemini
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-semibold transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      Record Voice Note
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      Stop Recording ({recordingSeconds}s)
                    </button>
                  )}

                  {audioUrl && (
                    <div className="flex-1 flex items-center gap-2">
                      <audio src={audioUrl} controls className="h-8 w-full max-w-xs" />
                      <button
                        type="button"
                        onClick={() => { setAudioUrl(null); setAudioBlob(null); }}
                        className="text-xs text-slate-500 hover:text-rose-400"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {!audioUrl && !isRecording && (
                    <span className="text-xs text-slate-500 italic">No audio recorded yet (optional)</span>
                  )}
                </div>
              </div>

              {/* Notes / Written Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  3. Description or Additional Context
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the condition, landmark cues, depth, or safety danger..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Geolocation & Landmark Extraction */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    4. Incident Location / GPS
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <MapPin className="w-3 h-3" />
                    Extract Live GPS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address or intersection"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={`${lat}, ${lng}`}
                      readOnly
                      title="Coordinates"
                      className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Reporter Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Citizen / Reporter Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Preferred Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="zh">中文 (Mandarin)</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="fr">Français (French)</option>
                  </select>
                </div>
              </div>

              {/* Submit Triage Button */}
              <button
                type="submit"
                disabled={isTriaging}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isTriaging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Gemini 3.8 Flash Multimodal Triage in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Autonomous AI Triage & Route Work Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Live Triage Pipeline & Results Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Triage Pipeline Stepper */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Autonomous Triage Architecture
              </h2>

              <div className="space-y-3">
                {[
                  { step: 1, label: 'Multimodal Ingestion', desc: 'Audio transcription & visual defect boundary extraction' },
                  { step: 2, label: 'Gemini Hazard Classification', desc: 'Severity rating (1–5), liability & physical metrics' },
                  { step: 3, label: 'Spatial & Semantic Clustering', desc: 'Deduplication within 75m buffer to prevent ticket spam' },
                  { step: 4, label: 'Autonomous Municipal Routing', desc: 'Dispatches crew, estimates repair cost, assigns SLA' }
                ].map((s) => {
                  const isDone = triageProgressStep >= s.step;
                  const isCurrent = triageProgressStep === s.step && isTriaging;
                  return (
                    <div 
                      key={s.step} 
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                          : isDone 
                          ? 'bg-slate-950/80 border-slate-800 text-slate-300' 
                          : 'bg-slate-950/30 border-slate-800/40 text-slate-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        isCurrent 
                          ? 'bg-emerald-500 text-slate-950 animate-pulse' 
                          : isDone 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-800 text-slate-600'
                      }`}>
                        {isDone ? '✓' : s.step}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          {s.label}
                          {isCurrent && <span className="text-[10px] text-emerald-400 font-mono animate-pulse">Running...</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Triage Result Card */}
            {triageResult ? (
              <div className="bg-slate-900 rounded-2xl border border-emerald-500/50 p-6 space-y-4 shadow-xl shadow-emerald-950/30 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${triageResult.action === 'DUPLICATE_MERGED' ? 'bg-sky-400' : 'bg-emerald-400'} animate-pulse`}></span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {triageResult.action === 'DUPLICATE_MERGED' ? 'Duplicate Merged' : 'New Ticket Triaged'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {triageResult.ticket ? `#${triageResult.ticket.id}` : `#${triageResult.masterTicketId}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {triageResult.message}
                </div>

                {/* Extracted Details */}
                {(() => {
                  const t = triageResult.ticket || triageResult.masterTicket;
                  if (!t) return null;
                  return (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hazard Category:</span>
                        <span className="font-semibold text-white">{t.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Defect Subcategory:</span>
                        <span className="font-medium text-slate-200">{t.subcategory}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Priority Severity:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full ${
                          t.severity === 5 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                            : t.severity === 4 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          Level {t.severity} / 5
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Autonomous Routing:</span>
                        <span className="font-semibold text-emerald-400">{t.department}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Crew:</span>
                        <span className="font-mono text-slate-200">{t.workOrder?.assignedCrew}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Estimated Cost:</span>
                        <span className="font-bold text-white">${t.workOrder?.estimatedCost?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target SLA:</span>
                        <span className="font-bold text-amber-400">{t.workOrder?.targetSLA}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={onViewHeatmap}
                          className="w-full py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          View on City Engineering Heatmap
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 text-center text-slate-500 space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-medium">No active triage submission</p>
                <p className="text-[11px] text-slate-600">Submit a photo or voice note from the left panel to trigger the autonomous triage pipeline.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mode B: WhatsApp / Telegram Bot Simulator */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[650px]">
            {/* Phone Top Bar */}
            <div className={`p-4 flex items-center justify-between border-b ${
              botPlatform === 'WhatsApp' ? 'bg-emerald-950/80 border-emerald-800/50' : 'bg-sky-950/80 border-sky-800/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                  botPlatform === 'WhatsApp' ? 'bg-emerald-600' : 'bg-sky-500'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    CivicPulse Autonomous Bot
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-[11px] text-slate-400">Municipal AI Gateway • Always Online</div>
                </div>
              </div>

              {/* Bot Channel Switcher */}
              <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setBotPlatform('WhatsApp')}
                  className={`px-2.5 py-1 rounded font-medium ${botPlatform === 'WhatsApp' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setBotPlatform('Telegram')}
                  className={`px-2.5 py-1 rounded font-medium ${botPlatform === 'Telegram' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
                >
                  Telegram
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/70">
              {botMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="User media" className="w-full h-36 object-cover rounded-lg mb-2" />
                    )}
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isBotThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 max-w-[70%]">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-slate-400 ml-1">Gemini Multimodal Triage analyzing...</span>
                </div>
              )}
            </div>

            {/* Media Attachment Preview if chosen */}
            {botMediaPreview && (
              <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={botMediaPreview} alt="Attached" className="w-8 h-8 object-cover rounded" />
                  <span className="text-xs text-slate-300">Hazard media attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setBotMediaFile(null); setBotMediaPreview(null); }}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Bot Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors" title="Attach Photo">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setBotMediaFile(f);
                      setBotMediaPreview(URL.createObjectURL(f));
                    }
                  }}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={botInputText}
                onChange={(e) => setBotInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBotSend()}
                placeholder={`Type or send photo (e.g., 'Severe water leak on Pier 9')...`}
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={handleBotSend}
                disabled={isBotThinking || (!botInputText.trim() && !botMediaFile)}
                className={`p-2 rounded-xl text-white transition-all disabled:opacity-40 ${
                  botPlatform === 'WhatsApp' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-500 hover:bg-sky-400'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
