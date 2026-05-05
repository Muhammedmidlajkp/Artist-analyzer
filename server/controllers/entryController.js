import Entry from '../models/Entry.js';

// @desc    Get all entries
// @route   GET /api/entries
export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: entries });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Handle entry operations (Create, Update, Delete)
// @route   POST /api/entries
export const handleEntryAction = async (req, res) => {
  try {
    const { action, data } = req.body;
    const entries = Array.isArray(data) ? data : [data];

    if (action === 'delete') {
      const id = entries[0].recordId;
      await Entry.findOneAndDelete({ recordId: id });
      return res.json({ status: 'success', message: 'Entry deleted' });
    } 
    
    if (action === 'update') {
      const updated = entries[0];
      await Entry.findOneAndUpdate({ recordId: updated.recordId }, updated, { new: true });
      return res.json({ status: 'success', message: 'Entry updated' });
    }

    // Default: Create
    for (const entryData of entries) {
      if (!entryData.recordId) {
        entryData.recordId = 'ID-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      }
      const newEntry = new Entry(entryData);
      await newEntry.save();
    }

    res.json({ status: 'success', message: 'Entries stored successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
