import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  AlertTriangle, 
  DollarSign, 
  TrendingDown, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { queryCopilot } from '../api';

export const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: `👋 Greetings! I am your **CivicPulse Municipal Engineering Copilot**, powered by **Gemini 3.8 Flash**.\n\nI analyze real-time citizen multimodal reports, sensor telemetry, and predictive infrastructure decay models to assist public works engineers, emergency dispatchers, and city managers.\n\nHow can I assist your municipal team today?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: 'Priority 5 Emergencies', icon: AlertTriangle, prompt: 'Which active hazards present imminent life-safety or municipal tort liability this week?' },
    { label: 'Infrastructure ROI & Savings', icon: DollarSign, prompt: 'Calculate our citywide preventative maintenance ROI and total reactive emergency cost avoidance.' },
    { label: 'Roadways & Pothole Clusters', icon: TrendingDown, prompt: 'Summarize the status of potholes, road degradation, and duplicate report clustering in Downtown Core.' },
    { label: 'City Council Memo', icon: FileText, prompt: 'Draft a concise municipal budget memo requesting emergency funds for the Harbor & Riverside corridor.' }
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await queryCopilot(textToSend);
      const assistantMsg = {
        sender: 'assistant' as const,
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ Copilot encountered an error querying the model: ${err.message}. Please check your backend connection.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Bot className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Municipal Engineering Copilot</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural language decision support for public works schedules, council briefings, and repair logistics.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {quickPrompts.map((qp, i) => {
          const Icon = qp.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span>{qp.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-slate-200 line-clamp-2 leading-relaxed">
                {qp.prompt}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Thread */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950/60">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-5 py-3.5 text-xs leading-relaxed whitespace-pre-line shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-normal'
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`text-[10px] text-slate-500 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span className="ml-1 text-slate-300">Consulting Gemini 3.8 Flash municipal engineering engine...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the Municipal Copilot (e.g. 'How should we reallocate pothole repair crews for rain season?')..."
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
