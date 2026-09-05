export interface Unit {
  id: string; unitNumber: string; address: string; monthlyRent: number;
  tenantName: string; isArchived: boolean; createdAt: string; updatedAt: string;
  maintenanceRequests?: MaintenanceRequest[]; rentPayments?: RentPayment[];
}
export interface MaintenanceRequest {
  id: string; unitId: string; description: string; priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'REPORTED' | 'TRIAGED' | 'SCHEDULED' | 'RESOLVED'; createdById: string;
  createdAt: string; updatedAt: string;
  unit?: { id: string; unitNumber: string; address?: string };
  createdBy?: { id: string; name: string };
  assignments?: MaintenanceAssignment[];
  events?: MaintenanceEvent[];
}
export interface MaintenanceAssignment {
  id: string; requestId: string; contractorId: string; assignedAt: string;
  contractor?: { id: string; name: string; email?: string };
}
export interface MaintenanceEvent {
  id: string; requestId: string; actorId: string; eventType: string;
  oldValue?: string; newValue?: string; note?: string; createdAt: string;
  actor?: { id: string; name: string };
}
export interface RentPayment {
  id: string; unitId: string; amount: number; paymentMonth: string;
  recordedById: string; createdAt: string;
}
export interface RentStatus {
  unitId: string; unitNumber: string; tenantName: string; monthlyRent: number;
  amountPaid: number; paymentMonth: string; status: string;
}
export interface Alert {
  unitId: string; unitNumber: string; tenantName: string; monthlyRent: number;
  amountPaid: number; paymentMonth: string;
}
export interface DashboardData {
  openMaintenanceRequests: number; overdueRentUnits: number; resolvedThisWeek: number;
  rentCollectedThisMonth: number;
  maintenanceByStatus: { status: string; count: number }[];
  maintenanceByContractor: { name: string; count: number }[];
  resolvedByWeek: { week: string; count: number }[];
}
export interface Pagination {
  page: number; pageSize: number; total: number; totalPages: number;
}
export interface ApiResponse<T> { data: T; }
export interface PaginatedResponse<T> { items: T[]; pagination: Pagination; }
