import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    documentType: {
      type: String,
      enum: ['TEXT', 'FILE'],
      default: 'TEXT',
      uppercase: true
    },
    originalFileName: {
      type: String,
      trim: true,
      default: ''
    },
    storedFileName: {
      type: String,
      trim: true,
      default: ''
    },
    mimeType: {
      type: String,
      trim: true,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    fileUrl: {
      type: String,
      default: '',
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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
    }
  },
  {
    timestamps: true
  }
);

// Synchronize owner and uploadedBy for full backward compatibility
documentSchema.pre('save', function () {
  if (this.owner && !this.uploadedBy) {
    this.uploadedBy = this.owner;
  } else if (this.uploadedBy && !this.owner) {
    this.owner = this.uploadedBy;
  }
});

// Indexes for query performance
documentSchema.index({ owner: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ team: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
