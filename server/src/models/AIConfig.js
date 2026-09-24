import mongoose from 'mongoose';

const aiConfigSchema = new mongoose.Schema({
  personaName: { type: String, required: true, unique: true },
  systemPrompt: { type: String, required: true },
  temperature: { type: Number, default: 0.7, min: 0, max: 2 },
  maxTokens: { type: Number, default: 1024, min: 1 },
  modelName: { type: String, default: 'gemini-2.5-flash' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('AIConfig', aiConfigSchema);
