import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  AlertTriangle, 
  Filter, 
  MapPin, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Wrench, 
  Users, 
  Layers
} from 'lucide-react';
import { Ticket } from '../types';
import { updateTicketStatus } from '../api';

interface HazardHeatmapProps {
  tickets: Ticket[];
  onTicketUpdated: (updated: Ticket) => void;
  onNavigateToWorkOrders: () => void;
}

export const HazardHeatmap: React.FC<HazardHeatmapProps> = ({
  tickets,
  onTicketUpdated,
  onNavigateToWorkOrders
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [mapStyle, setMapStyle] = useState<'dark' | 'street' | 'satellite'>('dark');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Selected Ticket Drawer
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && t.severity !== parseInt(selectedSeverity)) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 13,
        zoomControl: false
      });

      // OpenStreetMap Tiles (100% Free, Zero Watermark, No API Key Required)
      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, []);

  // Update Map Tile Layer & CSS filter when style changes
  useEffect(() => {
    if (!tileLayerRef.current || !mapContainerRef.current) return;

    mapContainerRef.current.className = `w-full h-full ${
      mapStyle === 'dark' ? 'dark-map' : mapStyle === 'satellite' ? 'satellite-map' : 'street-map'
    }`;

    if (mapStyle === 'satellite') {
      tileLayerRef.current.setUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    } else {
      tileLayerRef.current.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    }
  }, [mapStyle]);

  // Update Markers when Filtered Tickets change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredTickets.forEach((ticket) => {
      // Create custom pulsing icon according to severity
      const isCritical = ticket.severity === 5;
      const isSevere = ticket.severity === 4;
      const colorClass = isCritical ? 'bg-rose-500' : isSevere ? 'bg-amber-500' : 'bg-emerald-500';
      const ringClass = isCritical ? 'border-rose-400 animate-ping' : isSevere ? 'border-amber-400' : 'border-emerald-400';

      const customIcon = L.divIcon({
        className: 'custom-hazard-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isCritical ? `<span class="absolute w-8 h-8 rounded-full border-2 ${ringClass} opacity-75"></span>` : ''}
            <div class="w-6 h-6 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-slate-950">
              ${ticket.severity}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([ticket.location.lat, ticket.location.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedTicket(ticket);
        map.panTo([ticket.location.lat, ticket.location.lng], { animate: true });
      });

      // Bind simple tooltip
      marker.bindTooltip(`
        <div class="font-sans text-xs">
          <strong>#${ticket.id} (${ticket.category})</strong><br/>
          Priority: Level ${ticket.severity} / 5<br/>
          ${ticket.location.address}
        </div>
      `, { direction: 'top', offset: [0, -10] });

      marker.addTo(markersLayer);
    });
  }, [filteredTickets]);

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateTicketStatus(selectedTicket.id, {
        status: newStatus,
        workOrderStatus: newStatus === 'RESOLVED' ? 'COMPLETED' : 'IN_PROGRESS'
      });
      setSelectedTicket(updated);
      onTicketUpdated(updated);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const categories = [
    'ALL',
    'Road Degradation',
    'Water & Sewage',
    'Electrical & Lighting',
    'Sanitation & Waste',
    'Sidewalk & Accessibility'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Filter & Legend Bar */}
      <div className="bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Filters:
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Severity: All Levels</option>
            <option value="5">P5 - Imminent Emergency</option>
            <option value="4">P4 - Severe Hazard</option>
            <option value="3">P3 - Moderate Defect</option>
            <option value="2">P2 - Minor Accessibility</option>
            <option value="1">P1 - Cosmetic</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Status: All</option>
            <option value="ROUTED">Routed</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-200">{filteredTickets.length}</strong> active hazards
          </span>
        </div>

        {/* Map Tile Style Picker (Free, No Key Required) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyle === 'dark' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark GIS
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('street')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyle === 'street' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Street View
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyle === 'satellite' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Severity Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span>
            <span className="text-slate-400">P5 Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-400">P4 Severe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">P1–P3 Normal</span>
          </div>
        </div>
      </div>

      {/* Main Map Container & Slide-over Drawer */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[680px]">
        {/* Leaflet Map Target */}
        <div ref={mapContainerRef} className="w-full h-full dark-map" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
          <div className="bg-slate-950/90 backdrop-blur border border-slate-800 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 text-slate-300 shadow-lg">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Smart City Municipal GIS Layer</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono font-bold">Autonomous GPS Triage</span>
          </div>
        </div>

        {/* Slide-over Ticket Detail Drawer */}
        {selectedTicket && (
          <div className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-[500] p-6 overflow-y-auto space-y-5 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedTicket.severity === 5
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedTicket.severity === 4
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    Priority Level {selectedTicket.severity} / 5
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">#{selectedTicket.id}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedTicket.subcategory}</h3>
                <p className="text-xs text-emerald-400 font-medium">{selectedTicket.category}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo / Visual Evidence */}
            {selectedTicket.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 relative group">
                <img
                  src={selectedTicket.imageUrl}
                  alt={selectedTicket.subcategory}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] text-slate-300 font-mono">
                  GPS: {selectedTicket.location.lat.toFixed(4)}, {selectedTicket.location.lng.toFixed(4)}
                </div>
              </div>
            )}

            {/* AI Engineering Justification */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Gemini Engineering Assessment
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedTicket.severityReasoning}</p>
            </div>

            {/* Physical Hazard Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Estimated Size</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedTicket.hazardMetrics?.estimatedDimensions || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Hazard Radius</span>
                <span className="font-semibold text-amber-400 mt-0.5 block">{selectedTicket.hazardMetrics?.riskRadiusMeters || 10} meters</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Traffic Disruption</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedTicket.hazardMetrics?.trafficImpact || 'Standard'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Municipal Liability</span>
                <span className="font-semibold text-rose-400 mt-0.5 block">{selectedTicket.hazardMetrics?.liabilityRisk || 'Medium'}</span>
              </div>
            </div>

            {/* Location & Landmark */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-white">{selectedTicket.location.address}</span>
              </div>
              <div className="text-[11px] text-slate-500 pl-5">
                Neighborhood: {selectedTicket.location.neighborhood} • {selectedTicket.location.landmark}
              </div>
            </div>

            {/* Work Order & SLA */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  Autonomous Work Order
                </span>
                <span className="text-xs font-mono font-bold text-sky-400">{selectedTicket.workOrder?.workOrderId}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Department:</span>
                  <span className="font-semibold text-emerald-400">{selectedTicket.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Crew:</span>
                  <span className="font-medium text-slate-200">{selectedTicket.workOrder?.assignedCrew}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Repair Cost Estimate:</span>
                  <span className="font-bold text-white">${selectedTicket.workOrder?.estimatedCost?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Turnaround SLA:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedTicket.workOrder?.targetSLA}
                  </span>
                </div>
              </div>

              {/* Equipment Needed Tags */}
              {selectedTicket.workOrder?.equipmentNeeded && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">Dispatched Equipment:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTicket.workOrder.equipmentNeeded.map((eq, i) => (
                      <span key={i} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Deduplicated Duplicate Reports */}
            {selectedTicket.duplicateCount > 1 && (
              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-sky-300 font-semibold">
                  <span>Deduplicated Citizen Reports</span>
                  <span className="bg-sky-500/20 px-2 py-0.5 rounded-full text-[10px]">
                    {selectedTicket.duplicateCount} merged calls
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Semantic clustering automatically merged redundant reports to prevent departmental backlog spam.
                </p>
              </div>
            )}

            {/* Municipal Action Buttons */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedTicket.status === 'IN_PROGRESS'}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  Dispatch Crew
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedTicket.status === 'RESOLVED'}
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              </div>

              <button
                type="button"
                onClick={onNavigateToWorkOrders}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View in Work Orders Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
