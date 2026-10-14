export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export type TicketStatus = 'ROUTED' | 'ASSIGNED' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESOLVED';

export interface HazardMetrics {
  estimatedDimensions: string;
  riskRadiusMeters: number;
  trafficImpact: string;
  liabilityRisk: string;
}

export interface LocationInfo {
  address: string;
  lat: number;
  lng: number;
  neighborhood: string;
  landmark: string;
}

export interface WorkOrderInfo {
  workOrderId: string;
  status: 'ASSIGNED' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedCrew: string;
  estimatedCost: number;
  costBreakdown: {
    materials: number;
    labor: number;
    equipment: number;
  };
  estimatedHours: number;
  targetSLA: string;
  equipmentNeeded: string[];
  permitsRequired: string[];
}

export interface DuplicateReport {
  id: string;
  time: string;
  channel: string;
  reporter?: string;
  note?: string;
  imageUrl?: string;
}

export interface Ticket {
  id: string;
  timestamp: string;
  status: TicketStatus;
  category: string;
  subcategory: string;
  severity: SeverityLevel;
  severityReasoning: string;
  hazardMetrics: HazardMetrics;
  location: LocationInfo;
  reporter: {
    channel: string;
    citizenName: string;
    notes: string;
    language: string;
  };
  department: string;
  workOrder: WorkOrderInfo;
  duplicateCount: number;
  duplicateReports: DuplicateReport[];
  imageUrl?: string;
  audioTranscript?: string;
}

export interface DecayZone {
  neighborhood: string;
  center: [number, number];
  overallHealthScore: number;
  decayRiskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  factors: {
    infrastructureAgeYears: number;
    dailyTrafficVolume: number;
    drainageStressFactor: number;
    incidentVelocity7d: number;
  };
  projections: {
    thirtyDaysFailureRisk: string;
    ninetyDaysFailureRisk: string;
    oneEightyDaysFailureRisk: string;
  };
  recommendedAction: string;
  preventativeBudgetEst: number;
  reactiveCostAvoidanceEst: number;
}

export interface DecayModelSummary {
  timestamp: string;
  zones: DecayZone[];
  summary: {
    totalMonitoredZones: number;
    criticalZonesCount: number;
    highZonesCount: number;
    totalReactiveCostAvoidance: number;
    totalPreventativeBudgetNeeded: number;
  };
}
