const PENDING_STORAGE_KEY = 'makeover_pending_data';
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

// --- Local Storage for Pending Data ---

export const getPendingEntries = () => {
  try {
    const data = localStorage.getItem(PENDING_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read pending entries', err);
    return [];
  }
};

export const savePendingEntry = (entry) => {
  const current = getPendingEntries();
  const entryWithId = { 
    ...entry, 
    _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    recordId: 'ID-' + Date.now() + '-' + Math.floor(Math.random() * 1000) 
  };
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify([...current, entryWithId]));
  return entryWithId;
};

export const removePendingEntry = (id) => {
  const current = getPendingEntries();
  const updated = current.filter(entry => entry._id !== id);
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(updated));
};

export const updatePendingEntry = (id, updatedEntry) => {
  const current = getPendingEntries();
  const updated = current.map(entry => entry._id === id ? { ...entry, ...updatedEntry } : entry);
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(updated));
};

// --- Google Apps Script API ---

const MOCK_DELAY = 1000;
let mockData = [
  { recordId: '1', eventDate: '2023-11-01', brideName: 'Sarah Jenkins', source: 'Instagram', referredBy: '', artistReference: '', artist: 'Nihala', packagePrice: 1500, extraCharges: 200, discount: 50, totalRevenue: 1650, satisfaction: 'Satisfied', issueNote: '' },
  { recordId: '2', eventDate: '2023-11-05', brideName: 'Emily Stone', source: 'Reference', referredBy: 'Jane Doe', artistReference: '', artist: 'Irfana', packagePrice: 2000, extraCharges: 0, discount: 0, totalRevenue: 2000, satisfaction: 'Neutral', issueNote: '' },
  { recordId: '3', eventDate: '2023-11-10', brideName: 'Jessica Alba', source: 'Instagram', referredBy: '', artistReference: '', artist: 'Sandra', packagePrice: 1800, extraCharges: 100, discount: 100, totalRevenue: 1800, satisfaction: 'Not Satisfied', issueNote: 'Delayed arrival' },
];

export const fetchDashboardData = async () => {
  if (!APPS_SCRIPT_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'success', data: mockData });
      }, MOCK_DELAY);
    });
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const submitEntry = async (data, action = 'create') => {
  if (!APPS_SCRIPT_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const entries = Array.isArray(data) ? data : [data];
        
        if (action === 'delete') {
          const id = entries[0].recordId;
          mockData = mockData.filter(m => m.recordId !== id);
        } else if (action === 'update') {
          const updated = entries[0];
          mockData = mockData.map(m => m.recordId === updated.recordId ? { ...m, ...updated } : m);
        } else {
          // create
          entries.forEach(e => {
            if (!e.recordId) e.recordId = 'ID-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
          });
          mockData.push(...entries);
        }
        resolve({ status: 'success', data });
      }, MOCK_DELAY);
    });
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, data }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error submitting data:", error);
    throw error;
  }
};

export const updateEntry = (id, data) => {
  return submitEntry({ ...data, recordId: id }, 'update');
};

export const deleteEntry = (id) => {
  return submitEntry({ recordId: id }, 'delete');
};
