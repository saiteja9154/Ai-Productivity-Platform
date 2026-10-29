import Workflow from '../models/Workflow.js';
import WorkflowStep from '../models/WorkflowStep.js';
import WorkflowExecution from '../models/WorkflowExecution.js';
import { logAuditAction } from './auditService.js';
import { executeWorkflow } from './workflowEngine.js';

/**
 * Check if the user is authorized to manage or access the workflow
 */
const verifyWorkflowAccess = (workflow, actorId, userRole) => {
  if (userRole === 'admin') return true;
  if (!workflow.createdBy) return true; // public / unowned
  if (workflow.createdBy._id ? workflow.createdBy._id.toString() === actorId?.toString() : workflow.createdBy.toString() === actorId?.toString()) {
    return true;
  }
  const error = new Error('Unauthorized: You do not have permission to modify or execute this workflow');
  error.statusCode = 403;
  throw error;
};

export const getAllWorkflows = async (query = {}, requestingUser = null) => {
  const filter = {};
  if (query.status) {
    if (query.status === 'active') filter.status = 'active';
    else if (query.status === 'inactive') filter.status = { $in: ['inactive', 'draft', 'paused'] };
    else filter.status = query.status;
  }
  if (query.team) filter.team = query.team;
  if (query.createdBy) filter.createdBy = query.createdBy;

  // Search by name or description
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  // If requesting user is not admin, limit to their own workflows, unowned workflows, or their team
  const actorId = typeof requestingUser === 'string'
    ? requestingUser
    : (requestingUser?._id?.toString() || requestingUser?.id?.toString() || requestingUser?.userId?.toString());
  const userRole = requestingUser?.role;

  if (actorId && userRole !== 'admin') {
    const userCond = [
      { createdBy: actorId },
      { createdBy: null }
    ];
    if (requestingUser?.team) {
      userCond.push({ team: requestingUser.team });
    }
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: userCond }];
      delete filter.$or;
    } else {
      filter.$or = userCond;
    }
  }

  const workflows = await Workflow.find(filter)
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return workflows;
};

export const getWorkflowById = async (id, requestingUser = null) => {
  const workflow = await Workflow.findById(id)
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .lean();

  if (!workflow) return null;

  // If steps exist embedded on workflow, use them; otherwise fetch from WorkflowStep collection
  let steps = workflow.steps || [];
  if (steps.length === 0) {
    steps = await WorkflowStep.find({ workflow: id })
      .sort({ stepOrder: 1 })
      .lean();
  }

  return {
    ...workflow,
    steps
  };
};

export const createWorkflow = async (workflowData, actorId = null) => {
  const payload = {
    ...workflowData,
    createdBy: workflowData.createdBy || actorId,
    trigger: workflowData.trigger || { type: 'manual', config: {} },
    steps: workflowData.steps || []
  };

  if (payload.trigger?.type === 'scheduled') {
    payload.isScheduled = true;
  }

  const workflow = await Workflow.create(payload);
  const populatedWorkflow = await Workflow.findById(workflow._id)
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .lean();

  await logAuditAction({
    user: actorId || workflow.createdBy,
    action: 'WORKFLOW_CREATED',
    entityType: 'Workflow',
    entityId: workflow._id,
    details: { name: workflow.name, triggerType: workflow.trigger?.type, status: workflow.status }
  });

  return populatedWorkflow;
};

export const updateWorkflow = async (id, updateData, actorId = null, userRole = null) => {
  const existing = await Workflow.findById(id);
  if (!existing) return null;

  verifyWorkflowAccess(existing, actorId, userRole);

  const safeUpdate = { ...updateData };
  if (safeUpdate.trigger?.type) {
    safeUpdate.isScheduled = safeUpdate.trigger.type === 'scheduled';
  }

  const workflow = await Workflow.findByIdAndUpdate(id, safeUpdate, {
    returnDocument: 'after',
    runValidators: true
  })
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .lean();

  if (workflow) {
    await logAuditAction({
      user: actorId,
      action: 'WORKFLOW_UPDATED',
      entityType: 'Workflow',
      entityId: id,
      details: { updatedFields: Object.keys(updateData) }
    });

    return workflow;
  }

  return null;
};

export const deleteWorkflow = async (id, actorId = null, userRole = null) => {
  const existing = await Workflow.findById(id);
  if (!existing) return null;

  verifyWorkflowAccess(existing, actorId, userRole);

  const workflow = await Workflow.findByIdAndDelete(id).lean();

  if (workflow) {
    // Delete child steps & execution records
    await WorkflowStep.deleteMany({ workflow: id });
    await WorkflowExecution.deleteMany({ workflow: id });

    await logAuditAction({
      user: actorId,
      action: 'WORKFLOW_DELETED',
      entityType: 'Workflow',
      entityId: id,
      details: { name: workflow.name }
    });
  }

  return workflow;
};

export const activateWorkflow = async (id, actorId = null, userRole = null) => {
  const existing = await Workflow.findById(id);
  if (!existing) return null;

  verifyWorkflowAccess(existing, actorId, userRole);

  existing.status = 'active';
  await existing.save();

  await logAuditAction({
    user: actorId,
    action: 'WORKFLOW_ACTIVATED',
    entityType: 'Workflow',
    entityId: id,
    details: { name: existing.name }
  });

  return existing;
};

export const deactivateWorkflow = async (id, actorId = null, userRole = null) => {
  const existing = await Workflow.findById(id);
  if (!existing) return null;

  verifyWorkflowAccess(existing, actorId, userRole);

  existing.status = 'paused';
  await existing.save();

  await logAuditAction({
    user: actorId,
    action: 'WORKFLOW_DEACTIVATED',
    entityType: 'Workflow',
    entityId: id,
    details: { name: existing.name }
  });

  return existing;
};

export const runWorkflow = async (id, actorId = null, userRole = null) => {
  const workflow = await Workflow.findById(id);
  if (!workflow) return null;

  verifyWorkflowAccess(workflow, actorId, userRole);

  // If status is inactive/draft, temporarily allow manual run or activate
  if (workflow.status !== 'active') {
    workflow.status = 'active';
    await workflow.save();
  }

  const execution = await executeWorkflow(
    id,
    {
      triggerType: 'manual',
      payload: { manualTriggeredBy: actorId, timestamp: new Date() }
    },
    actorId
  );

  return execution;
};

// Workflow Executions
export const getWorkflowExecutions = async (workflowId, query = {}, actorId = null, userRole = null) => {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) return null;

  verifyWorkflowAccess(workflow, actorId, userRole);

  const filter = { workflow: workflowId };
  if (query.status) {
    filter.status = query.status;
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [executions, total] = await Promise.all([
    WorkflowExecution.find(filter)
      .populate('triggeredBy', 'name email role')
      .populate('createdTasks', 'title status priority')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WorkflowExecution.countDocuments(filter)
  ]);

  return {
    executions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getExecutionById = async (executionId, actorId = null, userRole = null) => {
  const execution = await WorkflowExecution.findById(executionId)
    .populate('workflow', 'name description status trigger createdBy')
    .populate('triggeredBy', 'name email role')
    .populate('createdTasks', 'title description status priority dueDate')
    .lean();

  if (!execution) return null;

  if (execution.workflow) {
    verifyWorkflowAccess(execution.workflow, actorId, userRole);
  }

  return execution;
};

// Workflow Steps Management (Child Collection Backward Compatibility)
export const getWorkflowSteps = async (workflowId) => {
  const steps = await WorkflowStep.find({ workflow: workflowId })
    .sort({ stepOrder: 1 })
    .lean();

  return steps;
};

export const addWorkflowStep = async (workflowId, stepData, actorId = null) => {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) return null;

  const step = await WorkflowStep.create({
    ...stepData,
    workflow: workflowId
  });

  // Also add to workflow.steps array
  workflow.steps.push({
    stepId: step._id.toString(),
    stepOrder: step.stepOrder,
    stepType: stepData.stepType || 'create_task',
    name: step.stepName,
    config: stepData.config || {},
    onFailure: stepData.onFailure || 'stop'
  });
  await workflow.save();

  await logAuditAction({
    user: actorId,
    action: 'WORKFLOW_STEP_CREATED',
    entityType: 'WorkflowStep',
    entityId: step._id,
    details: { workflowId, stepName: step.stepName, stepOrder: step.stepOrder }
  });

  return step;
};

export const updateWorkflowStep = async (workflowId, stepId, updateData, actorId = null) => {
  const step = await WorkflowStep.findOneAndUpdate(
    { _id: stepId, workflow: workflowId },
    updateData,
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (step) {
    await logAuditAction({
      user: actorId,
      action: 'WORKFLOW_STEP_UPDATED',
      entityType: 'WorkflowStep',
      entityId: stepId,
      details: { workflowId, updatedFields: Object.keys(updateData) }
    });
  }

  return step;
};

export const deleteWorkflowStep = async (workflowId, stepId, actorId = null) => {
  const step = await WorkflowStep.findOneAndDelete({
    _id: stepId,
    workflow: workflowId
  }).lean();

  if (step) {
    await Workflow.findByIdAndUpdate(workflowId, {
      $pull: { steps: { stepId: stepId.toString() } }
    });

    await logAuditAction({
      user: actorId,
      action: 'WORKFLOW_STEP_DELETED',
      entityType: 'WorkflowStep',
      entityId: stepId,
      details: { workflowId, stepName: step.stepName }
    });
  }

  return step;
};

export default {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  runWorkflow,
  getWorkflowExecutions,
  getExecutionById,
  getWorkflowSteps,
  addWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep
};
