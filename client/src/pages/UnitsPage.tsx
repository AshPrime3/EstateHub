import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { unitsApi } from '../api';
import { Unit } from '../types';
import { formatCurrency } from '../utils/format';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [form, setForm] = useState({ unitNumber: '', address: '', monthlyRent: '', tenantName: '' });
  const [error, setError] = useState('');

  const load = () => { setLoading(true); unitsApi.list(showArchived).then((r) => { setUnits(r.data.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, [showArchived]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const data = { ...form, monthlyRent: parseFloat(form.monthlyRent) };
      if (editUnit) { await unitsApi.update(editUnit.id, data); }
      else { await unitsApi.create(data); }
      setShowForm(false); setEditUnit(null); setForm({ unitNumber: '', address: '', monthlyRent: '', tenantName: '' }); load();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save unit.'); }
  };

  const handleArchive = async (id: string) => { if (confirm('Archive this unit?')) { await unitsApi.archive(id); load(); } };
  const handleRestore = async (id: string) => { await unitsApi.restore(id); load(); };

  const openEdit = (u: Unit) => {
    setEditUnit(u); setForm({ unitNumber: u.unitNumber, address: u.address, monthlyRent: String(u.monthlyRent), tenantName: u.tenantName }); setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Units</h1>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="rounded" />
            Show archived
          </label>
          <button onClick={() => { setShowForm(true); setEditUnit(null); setForm({ unitNumber: '', address: '', monthlyRent: '', tenantName: '' }); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Add Unit</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editUnit ? 'Edit Unit' : 'New Unit'}</h3>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Unit Number" value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input placeholder="Monthly Rent" type="number" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input placeholder="Tenant Name" value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditUnit(null); }} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : units.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No units found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Unit</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Address</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Tenant</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Rent</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
            </tr></thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{u.unitNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{u.address}</td>
                  <td className="px-6 py-4">{u.tenantName}</td>
                  <td className="px-6 py-4">{formatCurrency(Number(u.monthlyRent))}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isArchived ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700'}`}>
                      {u.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link to={`/units/${u.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</Link>
                      <button onClick={() => openEdit(u)} className="text-gray-600 hover:text-gray-800 text-xs font-medium">Edit</button>
                      {u.isArchived ? (
                        <button onClick={() => handleRestore(u.id)} className="text-green-600 hover:text-green-800 text-xs font-medium">Restore</button>
                      ) : (
                        <button onClick={() => handleArchive(u.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Archive</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
