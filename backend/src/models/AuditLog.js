import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['User', 'Team', 'Document', 'Task', 'Workflow', 'WorkflowStep']
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Entity ID is required']
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
