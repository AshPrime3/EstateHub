import client from './client';

export const authApi = {
  login: (email: string, password: string) => client.post('/auth/login', { email, password }),
  getMe: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
};

export const unitsApi = {
  list: (includeArchived = false) => client.get(`/units?includeArchived=${includeArchived}`),
  getById: (id: string) => client.get(`/units/${id}`),
  create: (data: any) => client.post('/units', data),
  update: (id: string, data: any) => client.patch(`/units/${id}`, data),
  archive: (id: string) => client.post(`/units/${id}/archive`),
  restore: (id: string) => client.post(`/units/${id}/restore`),
};

export const maintenanceApi = {
  list: (params: any) => client.get('/maintenance', { params }),
  getById: (id: string) => client.get(`/maintenance/${id}`),
  create: (data: any) => client.post('/maintenance', data),
  update: (id: string, data: any) => client.patch(`/maintenance/${id}`, data),
  updateStatus: (id: string, status: string) => client.post(`/maintenance/${id}/status`, { status }),
  assignContractor: (id: string, contractorId: string) => client.post(`/maintenance/${id}/contractors`, { contractorId }),
  removeContractor: (id: string, contractorId: string) => client.delete(`/maintenance/${id}/contractors/${contractorId}`),
  addNote: (id: string, note: string) => client.post(`/maintenance/${id}/notes`, { note }),
  getContractors: () => client.get('/maintenance/contractors'),
};

export const rentApi = {
  getStatus: (month?: string) => client.get('/rent', { params: month ? { month } : {} }),
  record: (data: any) => client.post('/rent', data),
  bulkRecord: (data: any) => client.post('/rent/bulk', data),
  exportCSV: () => client.get('/rent/export', { responseType: 'blob' }),
};

export const dashboardApi = {
  get: () => client.get('/dashboard'),
};

export const alertsApi = {
  get: () => client.get('/alerts'),
  getCount: () => client.get('/alerts/count'),
  dismiss: (unitId: string, paymentMonth: string) => client.post(`/alerts/${unitId}/dismiss`, { paymentMonth }),
};
