import mongoose from 'mongoose';

const executionStepSchema = new mongoose.Schema(
  {
    stepId: {
      type: String,
      required: true
    },
    stepOrder: {
      type: Number,
      required: true
    },
    stepType: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
      default: 'pending'
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { _id: true }
);

const workflowExecutionSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: [true, 'Workflow reference is required'],
      index: true
    },
    workflowName: {
      type: String,
      trim: true,
      default: ''
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    triggerType: {
      type: String,
      enum: ['manual', 'task_created', 'task_completed', 'document_uploaded', 'scheduled'],
      required: [true, 'Trigger type is required'],
      index: true
    },
    triggerEventId: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    steps: {
      type: [executionStepSchema],
      default: () => []
    },
    createdTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    error: {
      type: String,
      default: null
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
        message: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
workflowExecutionSchema.index({ workflow: 1, createdAt: -1 });
workflowExecutionSchema.index({ status: 1, createdAt: -1 });
workflowExecutionSchema.index(
  { workflow: 1, triggerEventId: 1 },
  { unique: true, partialFilterExpression: { triggerEventId: { $type: 'string', $gt: '' } } }
);

// Virtual alias for backward compatibility with stepResults
workflowExecutionSchema.virtual('stepResults').get(function () {
  return this.steps;
});

workflowExecutionSchema.set('toJSON', { virtuals: true });
workflowExecutionSchema.set('toObject', { virtuals: true });

const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);

export default WorkflowExecution;
