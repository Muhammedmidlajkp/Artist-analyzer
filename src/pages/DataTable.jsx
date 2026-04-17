import { useState, useEffect } from 'react';
import { Search, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { fetchDashboardData, updateEntry, deleteEntry } from '../services/api';
import Swal from 'sweetalert2';

const ARTISTS = ['Nihala', 'Irfana', 'Sandra', 'Fidha', 'Anagha', 'Outsourcing'];
const SOURCES = ['Social Media', 'Instagram', 'Reference', 'Other'];
const SATISFACTION_OPTIONS = ['Satisfied', 'Neutral', 'Not Satisfied'];
const ARTIST_REF_OPTIONS = ['Nihala', 'Irfana', 'Sandra', 'Fidha', 'Anagha'];

export default function DataTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'eventDate', direction: 'desc' });

  // Edit State
  const [editingRow, setEditingRow] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await fetchDashboardData();
      if (resp.status === 'success') {
        setData(resp.data);
      } else {
        setError(resp.message || 'Failed to fetch data from server.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during fetch.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: 'Are you sure you want to delete this record? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: 'var(--border-color)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)'
    });

    if (!result.isConfirmed) return;
    
    setActionLoading(true);
    try {
      await deleteEntry(recordId);
      // Optimistic update
      setData(prev => prev.filter(item => item.recordId !== recordId));
      // Re-fetch to confirm sync
      await loadData();
      
      Swal.fire({
        title: 'Deleted!',
        text: 'The record has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete record. Please check your connection.',
        icon: 'error',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        confirmButtonColor: 'var(--accent-primary)'
      });
      loadData(); // Revert to server state
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const pkg = parseFloat(editingRow.packagePrice) || 0;
      const extra = parseFloat(editingRow.extraCharges) || 0;
      const disc = parseFloat(editingRow.discount) || 0;
      editingRow.totalRevenue = (pkg + extra) - disc;

      await updateEntry(editingRow.recordId, editingRow);
      // Optimistic local update
      setData(prev => prev.map(item => item.recordId === editingRow.recordId ? editingRow : item));
      setEditingRow(null);
      // Re-fetch to confirm sync
      await loadData();

      Swal.fire({
        title: 'Updated!',
        text: 'The record has been successfully updated.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)'
      });
    } catch (err) {
      Swal.fire({
        title: 'Update Failed',
        text: 'Failed to update record. Please try again.',
        icon: 'error',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        confirmButtonColor: 'var(--accent-primary)'
      });
      loadData(); // Revert to server state
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="card">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Makeover Entries</h1>
          <p className="page-subtitle">View and search all submitted makeover records.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search any field..." 
            className="form-input" 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center" style={{ padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Loader2 className="spinner" size={24} style={{ marginRight: '0.5rem', borderWidth: '2px' }} /> 
          Loading data...
        </div>
      ) : error ? (
        <div className="text-danger" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('eventDate')} style={{ cursor: 'pointer' }}>Event Date ↕</th>
                <th onClick={() => handleSort('brideName')} style={{ cursor: 'pointer' }}>Bride Name ↕</th>
                <th onClick={() => handleSort('source')} style={{ cursor: 'pointer' }}>Source ↕</th>
                <th onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>Artist ↕</th>
                <th onClick={() => handleSort('packagePrice')} style={{ cursor: 'pointer' }}>Package ↕</th>
                <th onClick={() => handleSort('extraCharges')} style={{ cursor: 'pointer' }}>Extras ↕</th>
                <th onClick={() => handleSort('discount')} style={{ cursor: 'pointer' }}>Discount ↕</th>
                <th onClick={() => handleSort('totalRevenue')} style={{ cursor: 'pointer' }}>Total ↕</th>
                <th onClick={() => handleSort('satisfaction')} style={{ cursor: 'pointer' }}>Satisfaction ↕</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={row.recordId || i}>
                    <td>{row.eventDate || '-'}</td>
                    <td style={{ fontWeight: 500 }}>{row.brideName || '-'}</td>
                    <td><span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>{row.source || '-'}</span></td>
                    <td>{row.artist || '-'}</td>
                    <td>₹{Number(row.packagePrice || 0).toLocaleString()}</td>
                    <td>₹{Number(row.extraCharges || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--danger)' }}>-₹{Number(row.discount || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{Number(row.totalRevenue || 0).toLocaleString()}</td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '12px',
                        backgroundColor: row.satisfaction === 'Satisfied' ? 'rgba(16, 185, 129, 0.1)' : 
                                         row.satisfaction === 'Not Satisfied' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                        color: row.satisfaction === 'Satisfied' ? 'var(--success)' : 
                               row.satisfaction === 'Not Satisfied' ? 'var(--danger)' : 'var(--text-primary)'
                      }}>
                        {row.satisfaction || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          onClick={() => setEditingRow({...row})} 
                          className="btn-action-edit" 
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row.recordId)} 
                          className="btn-action-delete" 
                          title="Delete"
                          disabled={actionLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingRow && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Record</h2>
              <button onClick={() => setEditingRow(null)} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input 
                    type="date" 
                    value={editingRow.eventDate} 
                    onChange={e => setEditingRow({...editingRow, eventDate: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bride Name</label>
                  <input 
                    type="text" 
                    value={editingRow.brideName} 
                    onChange={e => setEditingRow({...editingRow, brideName: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select 
                    value={editingRow.source} 
                    onChange={e => setEditingRow({...editingRow, source: e.target.value})} 
                    className="form-select"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Artist</label>
                  <select 
                    value={editingRow.artist} 
                    onChange={e => setEditingRow({...editingRow, artist: e.target.value})} 
                    className="form-select"
                  >
                    {ARTISTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Package Price</label>
                  <input 
                    type="number" 
                    value={editingRow.packagePrice} 
                    onChange={e => setEditingRow({...editingRow, packagePrice: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Extra Charges</label>
                  <input 
                    type="number" 
                    value={editingRow.extraCharges} 
                    onChange={e => setEditingRow({...editingRow, extraCharges: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount</label>
                  <input 
                    type="number" 
                    value={editingRow.discount} 
                    onChange={e => setEditingRow({...editingRow, discount: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Satisfaction</label>
                  <select 
                    value={editingRow.satisfaction} 
                    onChange={e => setEditingRow({...editingRow, satisfaction: e.target.value})} 
                    className="form-select"
                  >
                    {SATISFACTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Issue Note</label>
                  <textarea 
                    value={editingRow.issueNote} 
                    onChange={e => setEditingRow({...editingRow, issueNote: e.target.value})} 
                    className="form-input"
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="spinner" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
                <button type="button" onClick={() => setEditingRow(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
