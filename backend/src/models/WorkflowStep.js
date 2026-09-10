import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: [true, 'Workflow reference is required']
    },
    stepName: {
      type: String,
      required: [true, 'Step name is required'],
      trim: true
    },
    stepOrder: {
      type: Number,
      required: [true, 'Step order is required'],
      min: [1, 'Step order must be at least 1']
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'skipped'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Index to ensure efficient ordering queries
workflowStepSchema.index({ workflow: 1, stepOrder: 1 });

const WorkflowStep = mongoose.model('WorkflowStep', workflowStepSchema);

export default WorkflowStep;
