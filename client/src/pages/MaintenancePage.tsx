import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { maintenanceApi, unitsApi } from '../api';
import { MaintenanceRequest, Unit } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS: Record<string, string> = { REPORTED: 'bg-gray-100 text-gray-700', TRIAGED: 'bg-yellow-50 text-yellow-700', SCHEDULED: 'bg-blue-50 text-blue-700', RESOLVED: 'bg-green-50 text-green-700' };
const PRIORITY_COLORS: Record<string, string> = { LOW: 'bg-gray-100 text-gray-600', MEDIUM: 'bg-orange-50 text-orange-700', HIGH: 'bg-red-50 text-red-700' };

export default function MaintenancePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', unitId: '', page: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ unitId: '', description: '', priority: 'MEDIUM' });
  const [createError, setCreateError] = useState('');

  const load = () => {
    setLoading(true);
    const params: any = { page: filters.page, pageSize: filters.pageSize };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.unitId) params.unitId = filters.unitId;
    maintenanceApi.list(params).then((r) => { setItems(r.data.items); setTotal(r.data.pagination.total); setTotalPages(r.data.pagination.totalPages); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, [filters]);
  useEffect(() => { if (user?.role === 'PROPERTY_MANAGER') unitsApi.list().then((r) => setUnits(r.data.data)).catch(() => {}); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateError('');
    try { await maintenanceApi.create(createForm); setShowCreate(false); setCreateForm({ unitId: '', description: '', priority: 'MEDIUM' }); load(); }
    catch (err: any) { setCreateError(err.response?.data?.message || 'Failed to create request.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{user?.role === 'MAINTENANCE_CONTRACTOR' ? 'My Requests' : 'Maintenance Requests'}</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New Request</button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Maintenance Request</h3>
          {createError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{createError}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <select value={createForm.unitId} onChange={(e) => setCreateForm({ ...createForm, unitId: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber} — {u.address}</option>)}
            </select>
            <textarea placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input placeholder="Search description..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
            <option value="">All Statuses</option><option value="REPORTED">Reported</option><option value="TRIAGED">Triaged</option><option value="SCHEDULED">Scheduled</option><option value="RESOLVED">Resolved</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
            <option value="">All Priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
          </select>
          {user?.role === 'PROPERTY_MANAGER' && (
            <select value={filters.unitId} onChange={(e) => setFilters({ ...filters, unitId: e.target.value, page: 1 })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
              <option value="">All Units</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div> : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{user?.role === 'MAINTENANCE_CONTRACTOR' ? 'You currently have no assigned maintenance requests.' : 'No maintenance requests found. Try changing your filters.'}</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Unit</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Priority</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Contractors</th>
              </tr></thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{r.unit?.unitNumber}</td>
                    <td className="px-6 py-4"><Link to={`/maintenance/${r.id}`} className="text-blue-600 hover:underline">{r.description.substring(0, 50)}{r.description.length > 50 ? '...' : ''}</Link></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[r.priority]}`}>{r.priority}</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                    <td className="px-6 py-4 text-xs text-gray-600">{r.assignments?.map((a) => a.contractor?.name).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Showing {(filters.page - 1) * filters.pageSize + 1}–{Math.min(filters.page * filters.pageSize, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setFilters({ ...filters, page: p })} className={`px-3 py-1 border rounded ${filters.page === p ? 'bg-blue-600 text-white' : ''}`}>{p}</button>
              ))}
              <button disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
