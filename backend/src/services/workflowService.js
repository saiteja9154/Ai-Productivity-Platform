import Workflow from '../models/Workflow.js';
import WorkflowStep from '../models/WorkflowStep.js';
import { logAuditAction } from './auditService.js';

export const getAllWorkflows = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.team) filter.team = query.team;
  if (query.createdBy) filter.createdBy = query.createdBy;

  const workflows = await Workflow.find(filter)
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return workflows;
};

export const getWorkflowById = async (id) => {
  const workflow = await Workflow.findById(id)
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .lean();

  if (!workflow) return null;

  const steps = await WorkflowStep.find({ workflow: id })
    .sort({ stepOrder: 1 })
    .lean();

  return {
    ...workflow,
    steps
  };
};

export const createWorkflow = async (workflowData, actorId = null) => {
  const payload = {
    ...workflowData,
    createdBy: workflowData.createdBy || actorId
  };

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
    details: { name: workflow.name, status: workflow.status }
  });

  return {
    ...populatedWorkflow,
    steps: []
  };
};

export const updateWorkflow = async (id, updateData, actorId = null) => {
  const workflow = await Workflow.findByIdAndUpdate(id, updateData, {
    new: true,
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

    const steps = await WorkflowStep.find({ workflow: id }).sort({ stepOrder: 1 }).lean();
    return { ...workflow, steps };
  }

  return null;
};

export const deleteWorkflow = async (id, actorId = null) => {
  const workflow = await Workflow.findByIdAndDelete(id).lean();

  if (workflow) {
    // Delete all child steps for this workflow
    await WorkflowStep.deleteMany({ workflow: id });

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

// Workflow Steps Management
export const getWorkflowSteps = async (workflowId) => {
  const steps = await WorkflowStep.find({ workflow: workflowId })
    .sort({ stepOrder: 1 })
    .lean();

  return steps;
};

export const addWorkflowStep = async (workflowId, stepData, actorId = null) => {
  const workflowExists = await Workflow.exists({ _id: workflowId });
  if (!workflowExists) return null;

  const step = await WorkflowStep.create({
    ...stepData,
    workflow: workflowId
  });

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
    { new: true, runValidators: true }
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
  getWorkflowSteps,
  addWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep
};
