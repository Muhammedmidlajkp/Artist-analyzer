import { X, Trash2, Edit } from 'lucide-react';

export default function PendingDataModal({ entries, onClose, onRestore, onDelete }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="page-title" style={{ margin: 0, fontSize: '1.25rem' }}>Pending Data</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p className="text-secondary mb-4" style={{ fontSize: '0.875rem' }}>
          You have incomplete or unsaved entries.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
          {entries.map(entry => (
            <div key={entry._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{entry.brideName || 'Unnamed Bride'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {entry.eventDate || 'No Date'} | {entry.artist || 'No Artist'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem' }}
                  onClick={() => onRestore(entry)}
                  title="Edit & Resubmit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={() => onDelete(entry._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
