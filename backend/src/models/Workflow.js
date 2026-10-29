import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema(
  {
    stepId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    stepOrder: {
      type: Number,
      required: [true, 'Step order is required'],
      min: [1, 'Step order must be at least 1']
    },
    stepType: {
      type: String,
      enum: [
        'create_task',
        'assign_task',
        'update_task_status',
        'update_task_details',
        'add_comment',
        'generate_text',
        'extract_tasks',
        'complete_workflow',
        'fail_workflow'
      ],
      required: [true, 'Step type is required']
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    onFailure: {
      type: String,
      enum: ['stop', 'continue'],
      default: 'stop'
    }
  },
  { _id: true }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'archived', 'inactive'],
      default: 'active',
      index: true
    },
    trigger: {
      type: {
        type: String,
        enum: ['manual', 'task_created', 'task_completed', 'document_uploaded', 'scheduled'],
        default: 'manual',
        index: true
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({})
      }
    },
    steps: {
      type: [workflowStepSchema],
      default: () => []
    },
    executionStats: {
      totalRuns: { type: Number, default: 0 },
      successRuns: { type: Number, default: 0 },
      failedRuns: { type: Number, default: 0 },
      lastRunAt: { type: Date, default: null },
      lastStatus: { type: String, default: null }
    },
    isScheduled: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

workflowSchema.index({ team: 1, status: 1 });
workflowSchema.index({ createdBy: 1, status: 1 });
workflowSchema.index({ 'trigger.type': 1, status: 1 });

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;

