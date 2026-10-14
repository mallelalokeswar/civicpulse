import React, { useState } from 'react';
import { 
  FileCheck2, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  Filter,
  Truck,
  FileText
} from 'lucide-react';
import { Ticket } from '../types';
import { updateTicketStatus } from '../api';

interface WorkOrdersViewProps {
  tickets: Ticket[];
  onTicketUpdated: (updated: Ticket) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({ tickets, onTicketUpdated }) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Departments list
  const departments = [
    'ALL',
    'Public Works & Streets',
    'Dept of Water & Sewage',
    'Power & Streetlighting',
    'Sanitation & Hazardous Waste',
    'Building Inspection & Safety'
  ];

  const filteredTickets = tickets.filter(t => {
    if (selectedDept !== 'ALL' && t.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL') {
      const woStatus = t.workOrder?.status || 'ASSIGNED';
      if (woStatus !== selectedStatus) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (ticket: Ticket, newStatus: 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setUpdatingId(ticket.id);
    try {
      const updated = await updateTicketStatus(ticket.id, {
        status: newStatus === 'COMPLETED' ? 'RESOLVED' : 'IN_PROGRESS',
        workOrderStatus: newStatus
      });
      onTicketUpdated(updated);
    } catch (err) {
      alert('Failed to update work order');
    } finally {
      setUpdatingId(null);
    }
  };

  // Aggregated Cost & SLA Metrics
  const totalCost = tickets.reduce((acc, t) => acc + (t.workOrder?.estimatedCost || 0), 0);
  const totalHours = tickets.reduce((acc, t) => acc + (t.workOrder?.estimatedHours || 0), 0);
  const activeOrdersCount = tickets.filter(t => t.status !== 'RESOLVED').length;
  const completedOrdersCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Metrics */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <FileCheck2 className="w-7 h-7 text-sky-400" />
              Autonomous Municipal Routing & Work Orders
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              AI-generated work orders routed automatically to municipal field crews with real-time equipment and cost modeling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Autonomous Routing SLA: 98.4%
            </span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Active Work Orders</span>
            <div className="text-2xl font-extrabold text-white mt-1">{activeOrdersCount}</div>
            <span className="text-[11px] text-amber-400 font-medium mt-1 block">In Field Queue</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Completed Repairs</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{completedOrdersCount}</div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">Verified Resolved</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Cost Forecast</span>
            <div className="text-2xl font-extrabold text-white mt-1">${totalCost.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">Materials + Labor + Gear</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Crew Allocation</span>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">{totalHours} hrs</div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">Planned Repair Work</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            Filter By:
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>Department: {d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Status: All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong>{filteredTickets.length}</strong> work orders
        </span>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => {
          const wo = ticket.workOrder;
          const isCritical = ticket.severity === 5;
          const isUpdating = updatingId === ticket.id;

          return (
            <div
              key={ticket.id}
              className={`rounded-2xl border bg-slate-900/90 p-6 space-y-5 transition-all shadow-lg hover:border-slate-700 ${
                isCritical ? 'border-rose-800/60 shadow-rose-950/20' : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                      {wo?.workOrderId || 'WO-PENDING'}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : ticket.severity === 4
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      Priority {ticket.severity} / 5
                    </span>
                    {ticket.duplicateCount > 1 && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                        +{ticket.duplicateCount - 1} duplicates
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{ticket.subcategory}</h3>
                  <p className="text-xs text-slate-400">{ticket.location.address}</p>
                </div>

                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                  wo?.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : wo?.status === 'IN_PROGRESS'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                }`}>
                  {wo?.status || 'ASSIGNED'}
                </span>
              </div>

              {/* Department & Crew Assignment */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Routing Department</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">{ticket.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dispatched Crew</span>
                  <span className="font-medium text-slate-200 mt-0.5 block">{wo?.assignedCrew}</span>
                </div>
              </div>

              {/* Cost & SLA Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Estimated Total Cost:
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    ${wo?.estimatedCost?.toLocaleString()}
                  </span>
                </div>

                {wo?.costBreakdown && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>Materials: <strong className="text-slate-200">${wo.costBreakdown.materials}</strong></div>
                    <div>Labor: <strong className="text-slate-200">${wo.costBreakdown.labor}</strong></div>
                    <div>Equipment: <strong className="text-slate-200">${wo.costBreakdown.equipment}</strong></div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Target Turnaround SLA:
                  </span>
                  <span className="font-bold text-amber-400">
                    {wo?.targetSLA} ({wo?.estimatedHours}h labor)
                  </span>
                </div>
              </div>

              {/* Equipment & Permits */}
              <div className="space-y-2 text-xs">
                {wo?.equipmentNeeded && wo.equipmentNeeded.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Equipment:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {wo.equipmentNeeded.map((eq, i) => (
                        <span key={i} className="text-[10px] bg-slate-950 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {wo?.permitsRequired && wo.permitsRequired.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Permits & Advisories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {wo.permitsRequired.map((p, i) => (
                        <span key={i} className="text-[10px] bg-sky-950/40 text-sky-300 px-2.5 py-1 rounded-md border border-sky-800/40">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 font-mono">
                  Reported: {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="flex items-center gap-2">
                  {wo?.status !== 'IN_PROGRESS' && wo?.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(ticket, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Dispatch Field Crew
                    </button>
                  )}

                  {wo?.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(ticket, 'COMPLETED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
