import { useState, useEffect } from 'react';
import { alertsApi } from '../api';
import { Alert } from '../types';
import { formatCurrency, getMonthLabel } from '../utils/format';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    alertsApi.get()
      .then(res => { setAlerts(res.data.data.alerts); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDismiss = async (unitId: string, paymentMonth: string) => {
    try {
      await alertsApi.dismiss(unitId, paymentMonth);
      load();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to dismiss alert.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Overdue Rent Alerts</h1>
        <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
          {alerts.length} Active {alerts.length === 1 ? 'Alert' : 'Alerts'}
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm mb-6 flex items-start gap-3">
        <span className="text-lg">ℹ️</span>
        <p>Alerts are generated automatically when a unit's rent is unpaid after the grace period for the current month. Dismissing an alert removes it for that specific month, but will not prevent alerts for future unpaid months.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-lg font-semibold text-gray-900">All caught up!</h2>
          <p className="text-gray-500 mt-1">There are no active overdue rent alerts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div key={`${alert.unitId}-${alert.paymentMonth}`} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-red-500 border border-y-gray-100 border-r-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">Unit {alert.unitNumber}</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{getMonthLabel(alert.paymentMonth)}</span>
              </div>
              
              <div className="space-y-1 text-sm mb-6 flex-1">
                <p><span className="text-gray-500">Tenant:</span> <span className="font-medium text-gray-900">{alert.tenantName}</span></p>
                <p><span className="text-gray-500">Rent:</span> <span className="font-medium text-gray-900">{formatCurrency(alert.monthlyRent)}</span></p>
                <p><span className="text-gray-500">Paid:</span> <span className="font-medium text-red-600">{formatCurrency(alert.amountPaid)}</span></p>
              </div>

              <button 
                onClick={() => handleDismiss(alert.unitId, alert.paymentMonth)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                Dismiss Alert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
