import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  logoUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  hiringRounds: [{
    roundName: { type: String, required: true },
    roundType: { type: String, required: true },
    description: { type: String, default: '' }
  }],
  syllabus: [{ type: String }],
  cutoffBenchmark: { type: Number, default: 75, min: 0, max: 100 }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
