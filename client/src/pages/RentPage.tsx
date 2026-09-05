import { useState, useEffect } from 'react';
import { rentApi, unitsApi } from '../api';
import { RentStatus, Unit } from '../types';
import { formatCurrency, getCurrentMonthStr, getMonthLabel } from '../utils/format';

export default function RentPage() {
  const [rentStatus, setRentStatus] = useState<RentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  
  // Single Record Form State
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [singleForm, setSingleForm] = useState({ unitId: '', amount: '', paymentMonth: getCurrentMonthStr() });
  
  // Bulk Upload State
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [bulkMonth, setBulkMonth] = useState(getCurrentMonthStr());
  const [bulkResults, setBulkResults] = useState<any[]>([]);

  const load = () => {
    setLoading(true);
    rentApi.getStatus(selectedMonth)
      .then((r) => { setRentStatus(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedMonth]);
  useEffect(() => { unitsApi.list().then((r) => setUnits(r.data.data)).catch(() => {}); }, []);

  const handleSingleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rentApi.record({
        unitId: singleForm.unitId,
        amount: parseFloat(singleForm.amount),
        paymentMonth: singleForm.paymentMonth
      });
      setShowSingleForm(false);
      setSingleForm({ unitId: '', amount: '', paymentMonth: getCurrentMonthStr() });
      if (singleForm.paymentMonth === selectedMonth) load();
      else setSelectedMonth(singleForm.paymentMonth);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to record rent.'); }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkResults([]);
    try {
      // Parse basic CSV format: unitNumber,amount
      const lines = bulkData.trim().split('\n');
      const payments = lines.map(line => {
        const [unitIdentifier, amountStr] = line.split(',');
        return { unitIdentifier: unitIdentifier.trim(), amount: parseFloat(amountStr?.trim() || '0') };
      }).filter(p => p.unitIdentifier && !isNaN(p.amount));

      if (payments.length === 0) { alert('Invalid data format. Expected: UnitNumber,Amount'); return; }

      const res = await rentApi.bulkRecord({ paymentMonth: bulkMonth, payments });
      setBulkResults(res.data.results);
      if (bulkMonth === selectedMonth) load();
      else setSelectedMonth(bulkMonth);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to process bulk upload.'); }
  };

  const handleExportCSV = async () => {
    try {
      const res = await rentApi.exportCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rent-roll-${selectedMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) { alert('Failed to export CSV.'); }
  };

  const statusColors: Record<string, string> = { MATCHED: 'bg-green-100 text-green-800', UNDERPAID: 'bg-yellow-100 text-yellow-800', OVERPAID: 'bg-blue-100 text-blue-800', UNPAID: 'bg-red-100 text-red-800' };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rent Management</h1>
        <div className="flex gap-2 flex-wrap">
          <input 
            type="date" 
            value={selectedMonth} 
            onChange={(e) => {
              // Ensure we just grab YYYY-MM-01
              const d = new Date(e.target.value);
              if (!isNaN(d.getTime())) {
                const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0');
                setSelectedMonth(`${y}-${m}-01`);
              }
            }} 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button onClick={() => { setShowSingleForm(!showSingleForm); setShowBulkForm(false); }} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition">Record Payment</button>
          <button onClick={() => { setShowBulkForm(!showBulkForm); setShowSingleForm(false); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">Bulk Import</button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Export CSV</button>
        </div>
      </div>

      {showSingleForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-4">Record Single Payment</h3>
          <form onSubmit={handleSingleRecord} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit</label>
              <select value={singleForm.unitId} onChange={(e) => setSingleForm({ ...singleForm, unitId: e.target.value })} required className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]">
                <option value="">Select Unit</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber} - {u.tenantName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount</label>
              <input type="number" placeholder="Amount" value={singleForm.amount} onChange={(e) => setSingleForm({ ...singleForm, amount: e.target.value })} required className="w-32 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Payment Month</label>
              <input type="date" value={singleForm.paymentMonth} onChange={(e) => setSingleForm({ ...singleForm, paymentMonth: e.target.value })} required className="w-40 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save</button>
            <button type="button" onClick={() => setShowSingleForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
          </form>
        </div>
      )}

      {showBulkForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Import Payments</h3>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Payment Month</label>
              <input type="date" value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} required className="w-40 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Paste CSV Data (UnitNumber,Amount)</label>
              <textarea 
                placeholder="101,25000&#10;102,22000" 
                value={bulkData} 
                onChange={(e) => setBulkData(e.target.value)} 
                required 
                rows={5} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Process</button>
              <button type="button" onClick={() => { setShowBulkForm(false); setBulkResults([]); }} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>

          {bulkResults.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h4 className="font-semibold mb-2">Results</h4>
              <ul className="space-y-1 text-sm">
                {bulkResults.map((res, i) => (
                  <li key={i} className={`p-2 rounded ${res.error ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-800'}`}>
                    Unit {res.unitIdentifier}: {res.amount} — <span className="font-medium">{res.classification}</span>
                    {res.error && <span className="ml-2 text-red-600">({res.error})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4 text-gray-800">Rent Roll for {getMonthLabel(selectedMonth)}</h2>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Unit</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Tenant</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Monthly Rent</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Amount Paid</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {rentStatus.map((r) => (
                <tr key={r.unitId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{r.unitNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{r.tenantName}</td>
                  <td className="px-6 py-4">{formatCurrency(r.monthlyRent)}</td>
                  <td className="px-6 py-4 font-medium">{r.amountPaid > 0 ? formatCurrency(r.amountPaid) : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[r.status]}`}>{r.status}</span>
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
