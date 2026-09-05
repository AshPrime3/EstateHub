import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { unitsApi } from '../api';
import { Unit } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

export default function UnitDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) unitsApi.getById(id).then((r) => { setUnit(r.data.data); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!unit) return <div className="text-center py-12 text-gray-500">Unit not found.</div>;

  return (
    <div>
      <Link to="/units" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">← Back to Units</Link>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Unit {unit.unitNumber}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${unit.isArchived ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700'}`}>
            {unit.isArchived ? 'Archived' : 'Active'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Address:</span> <span className="font-medium ml-2">{unit.address}</span></div>
          <div><span className="text-gray-500">Tenant:</span> <span className="font-medium ml-2">{unit.tenantName}</span></div>
          <div><span className="text-gray-500">Monthly Rent:</span> <span className="font-medium ml-2">{formatCurrency(Number(unit.monthlyRent))}</span></div>
        </div>
      </div>

      {unit.maintenanceRequests && unit.maintenanceRequests.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold mb-4">Maintenance Requests</h2>
          <div className="space-y-2">
            {unit.maintenanceRequests.map((r: any) => (
              <Link to={`/maintenance/${r.id}`} key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div>
                  <p className="font-medium text-sm">{r.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === 'RESOLVED' ? 'bg-green-50 text-green-700' : r.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' : r.status === 'TRIAGED' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {r.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${r.priority === 'HIGH' ? 'bg-red-50 text-red-700' : r.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {r.priority}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {unit.rentPayments && unit.rentPayments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Rent Payments</h2>
          <div className="space-y-2">
            {unit.rentPayments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <span>{formatDate(p.paymentMonth)}</span>
                <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
