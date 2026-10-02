import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { alertsApi } from '../../api';

interface NavLink {
  to: string;
  label: string;
  icon: string;
  badge?: boolean;
}

const managerLinks: NavLink[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/units', label: 'Units', icon: '🏠' },
  { to: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { to: '/rent', label: 'Rent', icon: '💰' },
  { to: '/alerts', label: 'Alerts', icon: '🔔', badge: true },
];

const contractorLinks: NavLink[] = [
  { to: '/my-requests', label: 'My Requests', icon: '🔧' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === 'PROPERTY_MANAGER' ? managerLinks : contractorLinks;

  useEffect(() => {
    if (user?.role === 'PROPERTY_MANAGER') {
      alertsApi.getCount().then((r) => setAlertCount(r.data.data.count)).catch(() => {});
    }
  }, [user, location.pathname]);

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-lg p-2 border border-gray-200">
        <span className="text-xl">{collapsed ? '✕' : '☰'}</span>
      </button>

      {/* Overlay */}
      {collapsed && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setCollapsed(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">🏢 EstateHub</h1>
          <p className="text-xs text-gray-500 mt-1">{user?.role === 'PROPERTY_MANAGER' ? 'Property Manager' : 'Contractor'}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link key={link.to} to={link.to} onClick={() => setCollapsed(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
                {link.badge && alertCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{alertCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">{user?.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
