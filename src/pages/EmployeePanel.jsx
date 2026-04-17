import { useState, useEffect } from 'react';
import { Save, ClipboardPaste, AlertCircle, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import { getPendingEntries, savePendingEntry, removePendingEntry, submitEntry, updatePendingEntry } from '../services/api';
import PendingDataModal from '../components/PendingDataModal';

const initialForm = {
  eventDate: '',
  brideName: '',
  source: '',
  referredBy: '',
  artistReference: '',
  artist: '',
  packagePrice: '',
  extraCharges: '',
  discount: '',
  totalRevenue: '',
  satisfaction: '',
  issueNote: ''
};

const ARTISTS = ['Nihala', 'Irfana', 'Sandra', 'Fidha', 'Anagha', 'Outsourcing'];
const SOURCES = ['Social Media', 'Instagram', 'Reference', 'Other'];
const SATISFACTION_OPTIONS = ['Satisfied', 'Neutral', 'Not Satisfied'];
const ARTIST_REF_OPTIONS = ['Nihala', 'Irfana', 'Sandra', 'Fidha', 'Anagha'];

export default function EmployeePanel() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pending entries state
  const [pendingEntries, setPendingEntries] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null);

  // Bulk Paste State
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState(null);
  const [bulkArtist, setBulkArtist] = useState('');
  const [bulkSource, setBulkSource] = useState('');

  useEffect(() => {
    const pending = getPendingEntries();
    setPendingEntries(pending);
    if (pending.length > 0) {
      setShowPendingModal(true);
    }
  }, []);

  const calculateTotal = (pkg, extra, disc) => {
    const p = parseFloat(pkg) || 0;
    const e = parseFloat(extra) || 0;
    const d = parseFloat(disc) || 0;
    return (p + e) - d;
  };

  const smartParseDate = (dateStr) => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    const date = new Date(clean);

    if (!isNaN(date.getTime())) {
      // Use local components to avoid timezone shifting
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // Manual fallback for "APRIL 26" format
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const parts = clean.toLowerCase().split(/[\s,]+/);

    let monthIdx = -1;
    let day = -1;
    let year = new Date().getFullYear();

    parts.forEach(p => {
      const mIdx = months.findIndex(m => p.startsWith(m));
      if (mIdx !== -1) monthIdx = mIdx;
      else if (!isNaN(parseInt(p))) {
        const val = parseInt(p);
        if (val > 1000) year = val;
        else if (day === -1) day = val;
      }
    });

    if (monthIdx !== -1 && day !== -1) {
      const d = new Date(year, monthIdx, day);
      // Ensure month/day are 2 digits
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = d.getDate().toString().padStart(2, '0');
      return `${d.getFullYear()}-${m}-${dayStr}`;
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = { ...formData, [name]: value };

    if (name === 'packagePrice' || name === 'extraCharges' || name === 'discount') {
      updatedForm.totalRevenue = calculateTotal(
        name === 'packagePrice' ? value : formData.packagePrice,
        name === 'extraCharges' ? value : formData.extraCharges,
        name === 'discount' ? value : formData.discount
      );
    }

    setFormData(updatedForm);
    // Clear error for this field
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (!pastedText) return;

    // Smart split: prioritise TABS or PIPES over commas
    let cols = [];
    if (pastedText.includes('\t')) cols = pastedText.split('\t');
    else if (pastedText.includes('|')) cols = pastedText.split('|');
    else cols = pastedText.split(',');

    cols = cols.map(s => s.trim());

    if (cols.length >= 2) {
      e.preventDefault();

      const parseNum = (str) => parseFloat(String(str).replace(/[^0-9.-]+/g, "")) || 0;

      const newForm = { ...formData };
      if (cols[0]) newForm.eventDate = smartParseDate(cols[0]) || cols[0];
      if (cols[1]) newForm.brideName = cols[1];
      if (cols[2]) newForm.source = cols[2];
      if (cols[3]) newForm.referredBy = cols[3];
      if (cols[4]) newForm.artistReference = cols[4];
      if (cols[5]) newForm.artist = cols[5];
      if (cols[6]) newForm.packagePrice = parseNum(cols[6]);
      if (cols[7]) newForm.extraCharges = parseNum(cols[7]);
      if (cols[8]) newForm.discount = parseNum(cols[8]);

      newForm.totalRevenue = calculateTotal(newForm.packagePrice, newForm.extraCharges, newForm.discount);

      setFormData(newForm);
      setErrors({});
    }
  };

  const isFormEmpty = () => {
    return !formData.eventDate && !formData.brideName && !formData.packagePrice;
  };

  const isFullyComplete = () => {
    return (
      formData.eventDate &&
      formData.brideName &&
      formData.source &&
      formData.artist &&
      formData.packagePrice !== '' &&
      formData.satisfaction &&
      (formData.satisfaction !== 'Not Satisfied' || formData.issueNote)
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.eventDate) newErrors.eventDate = 'Date is required';
    if (!formData.brideName) newErrors.brideName = 'Bride Name is required';
    if (!formData.source) newErrors.source = 'Source is required';
    if (!formData.artist) newErrors.artist = 'Artist is required';
    if (formData.packagePrice === '' || isNaN(formData.packagePrice)) newErrors.packagePrice = 'Valid Price is required';
    if (!formData.satisfaction) newErrors.satisfaction = 'Satisfaction is required for final submission';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToPending = (silent = false) => {
    if (currentEditingId) {
      updatePendingEntry(currentEditingId, formData);
    } else {
      savePendingEntry(formData);
    }
    setPendingEntries(getPendingEntries());
    setFormData(initialForm);
    setCurrentEditingId(null);
    setErrors({});
    if (!silent) {
      Swal.fire({
        title: 'Draft Saved',
        text: 'Entry saved as Draft in Pending list (incomplete data).',
        icon: 'info',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        confirmButtonColor: 'var(--accent-primary)'
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSuccess(false);

    if (isFormEmpty()) {
      Swal.fire({
        title: 'Empty Form',
        text: 'Please fill at least some details before submitting.',
        icon: 'warning',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        confirmButtonColor: 'var(--accent-primary)'
      });
      return;
    }

    const isComplete = isFullyComplete();

    if (isComplete) {
      setLoading(true);
      try {
        await submitEntry(formData);
        if (currentEditingId) {
          removePendingEntry(currentEditingId);
        }
        setSuccess(true);
        setFormData(initialForm);
        setCurrentEditingId(null);
        setPendingEntries(getPendingEntries());
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        Swal.fire({
          title: 'Connection Error',
          text: 'Failed to sync with Google Sheets. Saving to Pending instead.',
          icon: 'error',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          confirmButtonColor: 'var(--accent-primary)'
        });
        saveToPending(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Identify missing fields for the popup
      const required = [
        { key: 'eventDate', label: 'Event Date' },
        { key: 'brideName', label: 'Bride Name' },
        { key: 'source', label: 'Source' },
        { key: 'artist', label: 'Artist' },
        { key: 'packagePrice', label: 'Package Price' },
        { key: 'satisfaction', label: 'Satisfaction' }
      ];

      const missing = required
        .filter(f => !formData[f.key] || formData[f.key].toString().trim() === '')
        .map(f => f.label);

      if (missing.length > 0) {
        Swal.fire({
          title: 'Incomplete Entry',
          html: `The following fields are missing:<br/><strong>${missing.join(', ')}</strong><br/><br/>Saving this as a Draft in the "Pending" list.`,
          icon: 'info',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          confirmButtonColor: 'var(--accent-primary)'
        });
      }

      saveToPending(true); // silent true because we just showed a custom alert
    }
  };

  const handleClear = async () => {
    if (Object.values(formData).some(val => val !== '')) {
      const result = await Swal.fire({
        title: 'Clear Form?',
        text: 'This will reset all fields. Are you sure?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear it',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        confirmButtonColor: 'var(--danger)',
        cancelButtonColor: 'var(--border-color)'
      });

      if (result.isConfirmed) {
        setFormData(initialForm);
        setCurrentEditingId(null);
        setErrors({});
      }
    }
  };

  const loadPending = (entry) => {
    setFormData(entry);
    setCurrentEditingId(entry._id);
    setShowPendingModal(false);
    setErrors({});
  };

  const deletePending = (id) => {
    removePendingEntry(id);
    const newPending = getPendingEntries();
    setPendingEntries(newPending);
    if (newPending.length === 0) setShowPendingModal(false);
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) return;
    if (!bulkArtist || !bulkSource) {
      setBulkStatus({ type: 'error', message: 'Please select a shared Artist and Source first.' });
      return;
    }

    const rows = bulkText.trim().split("\n");
    const importedData = [];
    const currentErrors = [];

    const parseNum = (str) => parseFloat(String(str).replace(/[^0-9.-]+/g, "")) || 0;

    rows.forEach((row, index) => {
      if (!row.trim()) return;
      // Smart split: prioritise TABS or PIPES over commas
      let cols = [];
      if (row.includes('\t')) cols = row.split('\t');
      else if (row.includes('|')) cols = row.split('|');
      else cols = row.split(',');

      cols = cols.map(s => s.trim());

      const entry = {
        eventDate: smartParseDate(cols[0]) || cols[0],
        brideName: cols[1] || '',
        source: bulkSource,
        referredBy: '',
        artist: bulkArtist,
        artistReference: '',
        packagePrice: parseNum(cols[2]),
        extraCharges: parseNum(cols[3]),
        discount: parseNum(cols[4]),
      };

      entry.totalRevenue = (entry.packagePrice + entry.extraCharges) - entry.discount;

      // Validation check for mandatory fields
      if (!entry.eventDate || !entry.brideName) {
        currentErrors.push(`Row ${index + 1} is missing Date or Name.`);
        return;
      }

      importedData.push(entry);
    });

    if (importedData.length === 0) {
      setBulkStatus({ type: 'error', message: currentErrors.length > 0 ? currentErrors[0] : 'No valid data found.' });
      return;
    }

    setLoading(true);
    try {
      // Save all imported rows to Pending Data (Local Storage)
      const pendingResults = importedData.map(entry => savePendingEntry(entry));

      // Update the local list of pending entries
      setPendingEntries(getPendingEntries());

      // If exactly one row was imported, populate the main form for immediate review
      if (pendingResults.length === 1) {
        setFormData(pendingResults[0]);
        setCurrentEditingId(pendingResults[0]._id);
        setBulkStatus({ type: 'success', message: 'Data loaded into form for review!' });
      } else {
        setBulkStatus({ type: 'success', message: `${pendingResults.length} records added to "Pending" list for review.` });
      }

      setBulkText('');
      setTimeout(() => setBulkStatus(null), 5000);
    } catch (err) {
      setBulkStatus({ type: 'error', message: 'Failed to prepare data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const clearBulk = () => {
    setBulkText('');
    setBulkStatus(null);
  };

  return (
    <div className="card">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Add Data Entry</h1>
          <p className="page-subtitle">Record a new makeover event. You can paste a row directly from Excel.</p>
        </div>
        {pendingEntries.length > 0 && (
          <button onClick={() => setShowPendingModal(true)} className="btn btn-secondary" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}>
            <AlertCircle size={18} /> {pendingEntries.length} Pending
          </button>
        )}
      </div>

      {/* Bulk Paste Section */}
      <div className="card mb-6" style={{ border: '2px dashed var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <h3 className="mb-2" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Quick Data Import
        </h3>
        <p className="page-subtitle mb-4">Select a default Artist and Source, then paste your data for instant extraction.</p>
        <div className="mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Copy this prompt</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
            Extract data in this Format: <strong>event date | bride name | package price | extra charges | discount</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            * Date should be in <strong>mm/dd/yyyy</strong> format.
          </p>
        </div>

        <div className="grid-2 mb-4" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label required" style={{ fontSize: '0.8rem' }}>Default Artist</label>
            <select value={bulkArtist} onChange={(e) => setBulkArtist(e.target.value)} className="form-select" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
              <option value="">Select artist...</option>
              {ARTISTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required" style={{ fontSize: '0.8rem' }}>Default Source</label>
            <select value={bulkSource} onChange={(e) => setBulkSource(e.target.value)} className="form-select" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
              <option value="">Select source...</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {bulkStatus && (
          <div className={`mb-4 ${bulkStatus.type === 'success' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.875rem' }}>
            {bulkStatus.type === 'success' ? '✅ ' : '❌ '}{bulkStatus.message}
          </div>
        )}

        <textarea
          className="form-input mb-4"
          style={{ minHeight: '150px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
          placeholder="Paste columns from Excel/Sheets (Ctrl+V)...&#10;Format: Event Date | Bride Name | Package Price | Extra Charges | Discount (mm/dd/yyyy)"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        ></textarea>

        <div className="flex gap-2">
          <button className="btn btn-premium" onClick={handleBulkImport} disabled={loading || !bulkText.trim()}>
            {loading ? <div className="spinner"></div> : 'Prepare for Review'}
          </button>
          <button className="btn btn-secondary" onClick={clearBulk} disabled={loading || !bulkText.trim()}>
            Clear
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} onPaste={handlePaste}>
        <div className="grid-2">

          <div className="form-group">
            <label className="form-label required">Event Date</label>
            <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className={`form-input ${errors.eventDate ? 'error' : ''}`} />
            {errors.eventDate && <span className="error-text">{errors.eventDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Bride Name</label>
            <input type="text" name="brideName" placeholder="e.g. Jane Doe" value={formData.brideName} onChange={handleChange} className={`form-input ${errors.brideName ? 'error' : ''}`} />
            {errors.brideName && <span className="error-text">{errors.brideName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Source</label>
            <select name="source" value={formData.source} onChange={handleChange} className={`form-select ${errors.source ? 'error' : ''}`}>
              <option value="">Select source...</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.source && <span className="error-text">{errors.source}</span>}
          </div>

          {formData.source === 'Reference' && (
            <>
              <div className="form-group">
                <label className="form-label">Referred By</label>
                <input type="text" name="referredBy" placeholder="e.g. Mutual friend" value={formData.referredBy} onChange={handleChange} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Artist Reference</label>
                <select name="artistReference" value={formData.artistReference} onChange={handleChange} className="form-select">
                  <option value="">Select artist...</option>
                  {ARTIST_REF_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label required">Artist</label>
            <select name="artist" value={formData.artist} onChange={handleChange} className={`form-select ${errors.artist ? 'error' : ''}`}>
              <option value="">Select an artist...</option>
              {ARTISTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            {errors.artist && <span className="error-text">{errors.artist}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Package Price</label>
            <input type="number" name="packagePrice" placeholder="0" value={formData.packagePrice} onChange={handleChange} className={`form-input ${errors.packagePrice ? 'error' : ''}`} />
            {errors.packagePrice && <span className="error-text">{errors.packagePrice}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Extra Charges</label>
            <input type="number" name="extraCharges" placeholder="0" value={formData.extraCharges} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Discount</label>
            <input type="number" name="discount" placeholder="0" value={formData.discount} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Satisfaction</label>
            <select name="satisfaction" value={formData.satisfaction} onChange={handleChange} className="form-select">
              <option value="">Select satisfaction...</option>
              {SATISFACTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {formData.satisfaction === 'Not Satisfied' && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label required">Issue Note</label>
              <textarea
                name="issueNote"
                placeholder="Please describe the issue..."
                value={formData.issueNote}
                onChange={handleChange}
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Total Revenue (Auto-calculated)</label>
            <input type="number" name="totalRevenue" value={formData.totalRevenue} readOnly className="form-input" style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed', color: 'var(--accent-primary)', fontWeight: 'bold' }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button type="submit" className="btn btn-premium" disabled={loading}>
            {loading ? <div className="spinner"></div> : <><Save size={18} /> {currentEditingId ? 'Resubmit Entry' : 'Submit Entry'}</>}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCcw size={18} /> Clear Form
          </button>
        </div>
      </form>

      {success && (
        <div className="card mb-6 text-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
          ✅ Entry successfully submitted!
        </div>
      )}

      {showPendingModal && (
        <PendingDataModal
          entries={pendingEntries}
          onClose={() => setShowPendingModal(false)}
          onRestore={loadPending}
          onDelete={deletePending}
        />
      )}
    </div>
  );
}
