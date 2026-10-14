import { Ticket, DecayModelSummary } from './types';

const API_BASE = '';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function fetchTickets(params?: {
  department?: string;
  status?: string;
  severity?: number | string;
  neighborhood?: string;
}): Promise<Ticket[]> {
  const query = new URLSearchParams();
  if (params?.department && params.department !== 'ALL') query.append('department', params.department);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.severity && params.severity !== 'ALL') query.append('severity', String(params.severity));
  if (params?.neighborhood && params.neighborhood !== 'ALL') query.append('neighborhood', params.neighborhood);

  const res = await fetch(`${API_BASE}/api/tickets?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`);
  if (!res.ok) throw new Error('Ticket not found');
  return res.json();
}

export async function updateTicketStatus(id: string, updates: {
  status?: string;
  assignedCrew?: string;
  workOrderStatus?: string;
}): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
}

export async function submitMultimodalTriage(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/triage/multimodal`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit triage');
  }
  return res.json();
}

export async function submitBotMessage(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/triage/bot-simulator`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to submit bot message');
  return res.json();
}

export async function fetchDecayModel(): Promise<DecayModelSummary> {
  const res = await fetch(`${API_BASE}/api/infrastructure/decay-model`);
  if (!res.ok) throw new Error('Failed to fetch decay model');
  return res.json();
}

export async function queryCopilot(message: string): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/api/copilot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error('Copilot query failed');
  return res.json();
}

export async function fetchKeyConfig() {
  const res = await fetch(`${API_BASE}/api/config/keys`);
  if (!res.ok) throw new Error('Failed to fetch key configuration');
  return res.json();
}

export async function saveGeminiKey(geminiApiKey: string) {
  const res = await fetch(`${API_BASE}/api/config/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geminiApiKey })
  });
  if (!res.ok) throw new Error('Failed to save API key');
  return res.json();
}
