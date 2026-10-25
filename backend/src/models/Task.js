import mongoose from 'mongoose';

const VALID_STATUSES = ['todo', 'in-progress', 'completed', 'pending', 'TODO', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'todo'
    },
    priority: {
      type: String,
      enum: VALID_PRIORITIES,
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    deadline: {
      type: Date,
      default: null
    },
    relatedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Synchronize aliases (assignee <-> assignedTo, deadline <-> dueDate) and normalize status/priority
taskSchema.pre('save', function () {
  // Sync assignee and assignedTo
  if (this.assignee && !this.assignedTo) {
    this.assignedTo = this.assignee;
  } else if (this.assignedTo && !this.assignee) {
    this.assignee = this.assignedTo;
  }

  // Sync deadline and dueDate
  if (this.deadline && !this.dueDate) {
    this.dueDate = this.deadline;
  } else if (this.dueDate && !this.deadline) {
    this.deadline = this.dueDate;
  }

  // Normalize status
  if (this.status) {
    const s = this.status.toLowerCase().replace('_', '-');
    if (s === 'pending') this.status = 'todo';
    else this.status = s;
  }

  // Normalize priority
  if (this.priority) {
    this.priority = this.priority.toLowerCase();
  }
});

// Indexes for query performance
taskSchema.index({ team: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
