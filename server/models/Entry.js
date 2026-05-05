import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  eventDate: { type: String, required: true },
  brideName: { type: String, required: true },
  source: { type: String },
  referredBy: { type: String },
  artistReference: { type: String },
  artist: { type: String, required: true },
  packagePrice: { type: Number, default: 0 },
  extraCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  satisfaction: { type: String },
  issueNote: { type: String }
}, { timestamps: true });

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
