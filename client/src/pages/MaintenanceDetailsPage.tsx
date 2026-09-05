import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { maintenanceApi } from '../api';
import { MaintenanceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/format';

const STATUS_COLORS: Record<string, string> = { REPORTED: 'bg-gray-100 text-gray-700', TRIAGED: 'bg-yellow-50 text-yellow-700', SCHEDULED: 'bg-blue-50 text-blue-700', RESOLVED: 'bg-green-50 text-green-700' };
const PRIORITY_COLORS: Record<string, string> = { LOW: 'bg-gray-100 text-gray-600', MEDIUM: 'bg-orange-50 text-orange-700', HIGH: 'bg-red-50 text-red-700' };

export default function MaintenanceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState<any[]>([]);
  const [noteText, setNoteText] = useState('');
  const [assignContractorId, setAssignContractorId] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    if (!id) return;
    setLoading(true);
    maintenanceApi.getById(id)
      .then((r) => { setRequest(r.data.data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.message || 'Failed to load request.'); setLoading(false); });
  };

  useEffect(() => {
    load();
    if (user?.role === 'PROPERTY_MANAGER') {
      maintenanceApi.getContractors().then((r) => setContractors(r.data.data)).catch(() => {});
    }
  }, [id, user]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    try {
      await maintenanceApi.updateStatus(id, status);
      load();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to update status.'); }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;
    try {
      await maintenanceApi.addNote(id, noteText);
      setNoteText('');
      load();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to add note.'); }
  };

  const handleAssignContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !assignContractorId) return;
    try {
      await maintenanceApi.assignContractor(id, assignContractorId);
      setAssignContractorId('');
      load();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to assign contractor.'); }
  };

  const handleRemoveContractor = async (contractorId: string) => {
    if (!id || !confirm('Remove this contractor?')) return;
    try {
      await maintenanceApi.removeContractor(id, contractorId);
      load();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to remove contractor.'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!request) return <div className="text-center py-12 text-gray-500">{error || 'Request not found.'}</div>;

  return (
    <div>
      <Link to="/maintenance" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">← Back to Requests</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Request from Unit {request.unit?.unitNumber}</h1>
                <p className="text-gray-600">{request.description}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[request.status]}`}>{request.status}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[request.priority]}`}>{request.priority} PRIORITY</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
              Reported by {request.createdBy?.name} on {formatDateTime(request.createdAt)}
            </div>

            {/* Status Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 mr-2 self-center">Update Status:</span>
              {request.status === 'REPORTED' && (
                <button onClick={() => handleUpdateStatus('TRIAGED')} className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded hover:bg-yellow-200">Mark as Triaged</button>
              )}
              {request.status === 'TRIAGED' && (
                <button onClick={() => handleUpdateStatus('SCHEDULED')} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded hover:bg-blue-200">Mark as Scheduled</button>
              )}
              {request.status === 'SCHEDULED' && (
                <button onClick={() => handleUpdateStatus('RESOLVED')} className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded hover:bg-green-200">Mark as Resolved</button>
              )}
              {request.status === 'RESOLVED' && (
                <button onClick={() => handleUpdateStatus('TRIAGED')} className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded hover:bg-gray-200">Reopen (Triaged)</button>
              )}
            </div>
          </div>

          {/* Audit Trail / Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Activity & Notes</h3>
            <div className="space-y-4 mb-6">
              {request.events?.map((event: any) => (
                <div key={event.id} className="flex gap-4">
                  <div className="mt-1">
                    {event.eventType === 'NOTE_ADDED' ? '💬' : '📝'}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between text-gray-500 mb-1 text-xs">
                      <span className="font-medium text-gray-900">{event.actor?.name}</span>
                      <span>{formatDateTime(event.createdAt)}</span>
                    </div>
                    {event.eventType === 'CREATED' && <p>Created the request.</p>}
                    {event.eventType === 'STATUS_CHANGED' && <p>Changed status from <span className="font-medium">{event.oldValue}</span> to <span className="font-medium">{event.newValue}</span>.</p>}
                    {event.eventType === 'CONTRACTOR_ASSIGNED' && <p>Assigned contractor <span className="font-medium">{event.newValue}</span>.</p>}
                    {event.eventType === 'CONTRACTOR_UNASSIGNED' && <p>Removed contractor <span className="font-medium">{event.oldValue}</span>.</p>}
                    {event.eventType === 'NOTE_ADDED' && <p className="text-gray-800 mt-1 whitespace-pre-wrap">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
              <input 
                type="text" 
                placeholder="Add a note..." 
                value={noteText} 
                onChange={(e) => setNoteText(e.target.value)} 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <button type="submit" disabled={!noteText.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Post</button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Contractors</h3>
            
            {request.assignments && request.assignments.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {request.assignments.map((assignment: any) => (
                  <li key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">{assignment.contractor?.name}</span>
                    {user?.role === 'PROPERTY_MANAGER' && (
                      <button onClick={() => handleRemoveContractor(assignment.contractorId)} className="text-red-600 hover:text-red-800 text-xs font-bold">✕</button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No contractors assigned.</p>
            )}

            {user?.role === 'PROPERTY_MANAGER' && (
              <form onSubmit={handleAssignContractor} className="flex gap-2">
                <select 
                  value={assignContractorId} 
                  onChange={(e) => setAssignContractorId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Contractor</option>
                  {contractors.filter(c => !request.assignments?.find((a: any) => a.contractorId === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="submit" disabled={!assignContractorId} className="px-3 py-2 bg-gray-100 text-gray-800 font-medium text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50">Assign</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
