import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CitizenChannel } from './components/CitizenChannel';
import { HazardHeatmap } from './components/HazardHeatmap';
import { WorkOrdersView } from './components/WorkOrdersView';
import { DecayModelingView } from './components/DecayModelingView';
import { CopilotChat } from './components/CopilotChat';
import { ApiKeyModal } from './components/ApiKeyModal';
import { fetchTickets } from './api';
import { Ticket } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('citizen');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleTicketCreated = (newOrMasterTicket: Ticket) => {
    setTickets((prev) => {
      const existsIndex = prev.findIndex((t) => t.id === newOrMasterTicket.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newOrMasterTicket;
        return copy;
      } else {
        return [newOrMasterTicket, ...prev];
      }
    });

    if (newOrMasterTicket.duplicateCount > 1) {
      showToast(`Semantic clustering merged report into Master Ticket #${newOrMasterTicket.id}`, 'info');
    } else {
      showToast(`Autonomous triage complete: Ticket #${newOrMasterTicket.id} routed to ${newOrMasterTicket.department}`, 'success');
    }
  };

  const handleTicketUpdated = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast(`Work order #${updated.workOrder.workOrderId} updated to ${updated.workOrder.status}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-600/60 shadow-emerald-950/40'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 text-amber-200 border-amber-600/60 shadow-amber-950/40'
              : 'bg-sky-950/95 text-sky-200 border-sky-600/60 shadow-sky-950/40'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <Info className="w-4 h-4 text-sky-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tickets={tickets}
        onRefresh={loadTickets}
        isLoading={isLoading}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Active Tab View */}
      <main className="flex-1">
        {currentTab === 'citizen' && (
          <CitizenChannel
            onTicketCreated={handleTicketCreated}
            onViewHeatmap={() => setCurrentTab('heatmap')}
          />
        )}

        {currentTab === 'heatmap' && (
          <HazardHeatmap
            tickets={tickets}
            onTicketUpdated={handleTicketUpdated}
            onNavigateToWorkOrders={() => setCurrentTab('workorders')}
          />
        )}

        {currentTab === 'workorders' && (
          <WorkOrdersView
            tickets={tickets}
            onTicketUpdated={handleTicketUpdated}
          />
        )}

        {currentTab === 'decay' && (
          <DecayModelingView />
        )}

        {currentTab === 'copilot' && (
          <CopilotChat />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">CivicPulse</span>
            <span>•</span>
            <span>Autonomous Municipal Triage & Infrastructure Copilot</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Powered by Gemini 3.8 Flash (Multimodal Vision & Audio)</span>
            <span>•</span>
            <span>Leaflet GIS Engine</span>
            <span>•</span>
            <span>FastAPI / Node.js</span>
          </div>
        </div>
      </footer>

      {/* API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default App;
