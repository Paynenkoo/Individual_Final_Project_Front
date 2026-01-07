import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    
    
    userId: { type: String, required: true, index: true },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

noteSchema.index({ createdAt: -1 });
noteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
