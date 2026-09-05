import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { DashboardData } from '../types';
import { formatCurrency } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { dashboardApi.get().then((r) => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!data) return <div className="text-center text-gray-500 py-12">Failed to load dashboard.</div>;

  const stats = [
    { label: 'Open Requests', value: data.openMaintenanceRequests, color: 'bg-blue-50 text-blue-700', icon: '🔧' },
    { label: 'Overdue Rent', value: data.overdueRentUnits, color: 'bg-red-50 text-red-700', icon: '⚠️' },
    { label: 'Resolved This Week', value: data.resolvedThisWeek, color: 'bg-green-50 text-green-700', icon: '✅' },
    { label: 'Rent Collected', value: formatCurrency(data.rentCollectedThisMonth), color: 'bg-indigo-50 text-indigo-700', icon: '💰' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color} border border-gray-100`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-sm font-medium opacity-80">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Maintenance by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.maintenanceByStatus.map((d) => ({ name: d.status, value: d.count }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {data.maintenanceByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Contractor breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Requests by Contractor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.maintenanceByContractor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 8-week trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Resolved Requests — Last 8 Weeks</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.resolvedByWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
