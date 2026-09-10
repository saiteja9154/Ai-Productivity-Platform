import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Document content is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    fileUrl: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
