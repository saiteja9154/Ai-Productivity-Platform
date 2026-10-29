/**
 * Workflow Execution Engine
 * 
 * Executes ordered workflow steps with step-failure policies,
 * event deduplication, anti-recursion safeguards, and detailed execution history.
 */

import mongoose from 'mongoose';
import Workflow from '../models/Workflow.js';
import WorkflowExecution from '../models/WorkflowExecution.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { logAuditAction } from './auditService.js';
import aiService from './aiService.js';

// Execution call stack tracker to prevent recursive trigger loops in a single process
const ACTIVE_EXECUTION_STACK = new Set();

/**
 * Execute an active workflow by ID
 * @param {string|ObjectId} workflowId 
 * @param {Object} triggerContext { triggerType, triggerEventId, payload }
 * @param {string|ObjectId} actorId 
 */
export const executeWorkflow = async (workflowId, triggerContext = {}, actorId = null) => {
  const {
    triggerType = 'manual',
    triggerEventId = null,
    payload = {}
  } = triggerContext;

  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    throw new Error(`Workflow not found with id: ${workflowId}`);
  }

  if (workflow.status !== 'active') {
    return {
      skipped: true,
      reason: `Workflow is currently '${workflow.status}', not 'active'`
    };
  }

  // Idempotency & Deduplication check
  if (triggerEventId) {
    const existing = await WorkflowExecution.findOne({
      workflow: workflow._id,
      triggerEventId
    });
    if (existing) {
      return {
        skipped: true,
        reason: `Trigger event '${triggerEventId}' has already been processed for workflow '${workflow.name}'`,
        executionId: existing._id
      };
    }
  }

  // Prevent recursion / loop
  const executionKey = `${workflowId}:${triggerEventId || Date.now()}`;
  if (ACTIVE_EXECUTION_STACK.has(workflowId.toString())) {
    return {
      skipped: true,
      reason: `Recursive loop detected for workflow '${workflow.name}'. Execution aborted to preserve stability.`
    };
  }

  ACTIVE_EXECUTION_STACK.add(workflowId.toString());

  const startTime = new Date();
  const execution = new WorkflowExecution({
    workflow: workflow._id,
    workflowName: workflow.name,
    triggeredBy: actorId || workflow.createdBy,
    triggerType,
    triggerEventId,
    status: 'running',
    startTime,
    steps: [],
    createdTasks: [],
    logs: [
      {
        timestamp: new Date(),
        level: 'info',
        message: `Workflow "${workflow.name}" started via ${triggerType} trigger.`
      }
    ]
  });

  await execution.save();

  // Execution Context State passed across steps
  const context = {
    triggerPayload: payload,
    createdTasks: [],
    lastCreatedTask: null,
    stepResults: new Map(),
    variables: {}
  };

  let executionFailed = false;
  let failureReason = null;

  // Sort steps by stepOrder ascending
  const sortedSteps = [...(workflow.steps || [])].sort((a, b) => a.stepOrder - b.stepOrder);

  try {
    for (const step of sortedSteps) {
      const stepStartTime = new Date();
      const stepId = step.stepId || step._id?.toString() || new mongoose.Types.ObjectId().toString();

      execution.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Executing step ${step.stepOrder}: "${step.name || step.stepType}"`
      });

      let stepOutput = null;
      let stepError = null;

      try {
        stepOutput = await executeStepAction(step, context, workflow, execution, actorId);
      } catch (err) {
        stepError = err.message || 'Unknown step execution error';
      }

      const stepCompletedTime = new Date();
      const isSuccess = !stepError;

      execution.steps.push({
        stepId,
        stepOrder: step.stepOrder,
        stepType: step.stepType,
        name: step.name || step.stepType,
        status: isSuccess ? 'completed' : 'failed',
        output: stepOutput,
        error: stepError,
        startedAt: stepStartTime,
        completedAt: stepCompletedTime
      });

      if (!isSuccess) {
        execution.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Step ${step.stepOrder} failed: ${stepError}`
        });

        // Check step failure policy
        if (step.onFailure !== 'continue') {
          executionFailed = true;
          failureReason = `Failed at step ${step.stepOrder} (${step.name || step.stepType}): ${stepError}`;
          break;
        } else {
          execution.logs.push({
            timestamp: new Date(),
            level: 'warn',
            message: `Continuing workflow per step failure policy ('continue').`
          });
        }
      } else {
        context.stepResults.set(stepId, stepOutput);
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: `Step ${step.stepOrder} completed successfully.`
        });
      }
    }
  } catch (outerErr) {
    executionFailed = true;
    failureReason = outerErr.message || 'Unexpected engine exception';
  } finally {
    ACTIVE_EXECUTION_STACK.delete(workflowId.toString());
  }

  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();

  execution.status = executionFailed ? 'failed' : 'completed';
  execution.endTime = endTime;
  execution.durationMs = durationMs;
  execution.error = failureReason;

  await execution.save();

  // Update Workflow aggregate statistics
  workflow.executionStats = workflow.executionStats || {};
  workflow.executionStats.totalRuns = (workflow.executionStats.totalRuns || 0) + 1;
  if (executionFailed) {
    workflow.executionStats.failedRuns = (workflow.executionStats.failedRuns || 0) + 1;
  } else {
    workflow.executionStats.successRuns = (workflow.executionStats.successRuns || 0) + 1;
  }
  workflow.executionStats.lastRunAt = endTime;
  workflow.executionStats.lastStatus = execution.status;
  await workflow.save();

  // Log audit action
  await logAuditAction({
    user: actorId || workflow.createdBy,
    action: executionFailed ? 'WORKFLOW_EXECUTION_FAILED' : 'WORKFLOW_EXECUTION_COMPLETED',
    entityType: 'WorkflowExecution',
    entityId: execution._id,
    details: {
      workflowId: workflow._id,
      workflowName: workflow.name,
      status: execution.status,
      durationMs
    }
  });

  return execution;
};

/**
 * Execute a single step action
 */
async function executeStepAction(step, context, workflow, execution, actorId) {
  const { stepType, config = {} } = step;

  switch (stepType) {
    case 'create_task': {
      const titleTemplate = config.title || 'Automated Workflow Task';
      // Basic interpolation from trigger payload
      const title = interpolateText(titleTemplate, context);
      const descTemplate = config.description || 'Generated automatically by workflow.';
      const description = interpolateText(descTemplate, context);
      const priority = config.priority || 'medium';
      const status = config.status || 'todo';
      const assignedTo = config.assignedTo || config.assignee || null;

      // Validate assignee if provided
      if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        const userExists = await User.exists({ _id: assignedTo });
        if (!userExists) {
          throw new Error(`Assignee user id ${assignedTo} does not exist`);
        }
      }

      const newTask = await Task.create({
        title,
        description,
        status,
        priority,
        assignedTo: assignedTo || null,
        assignee: assignedTo || null,
        createdBy: actorId || workflow.createdBy,
        team: workflow.team || null,
        sourceWorkflow: workflow._id,
        sourceExecution: execution._id
      });

      context.createdTasks.push(newTask);
      context.lastCreatedTask = newTask;
      execution.createdTasks.push(newTask._id);

      return {
        taskId: newTask._id,
        title: newTask.title,
        status: newTask.status,
        priority: newTask.priority
      };
    }

    case 'assign_task': {
      const targetTaskId = config.taskId || (context.lastCreatedTask ? context.lastCreatedTask._id : null);
      if (!targetTaskId) {
        throw new Error('Target task ID is required for assign_task action');
      }

      const newAssignee = config.assignedTo || config.assignee;
      if (!newAssignee) {
        throw new Error('Assignee user ID is required');
      }

      const user = await User.findById(newAssignee);
      if (!user) {
        throw new Error(`User with ID ${newAssignee} not found`);
      }

      const updated = await Task.findByIdAndUpdate(
        targetTaskId,
        { assignedTo: user._id, assignee: user._id },
        { returnDocument: 'after' }
      );

      return {
        taskId: targetTaskId,
        assignedTo: user.name,
        email: user.email
      };
    }

    case 'update_task_status': {
      const targetTaskId = config.taskId || (context.lastCreatedTask ? context.lastCreatedTask._id : null);
      if (!targetTaskId) {
        throw new Error('Target task ID is required for update_task_status action');
      }

      const newStatus = config.status || 'completed';
      const updated = await Task.findByIdAndUpdate(
        targetTaskId,
        { status: newStatus },
        { returnDocument: 'after' }
      );

      return {
        taskId: targetTaskId,
        status: updated?.status || newStatus
      };
    }

    case 'update_task_details': {
      const targetTaskId = config.taskId || (context.lastCreatedTask ? context.lastCreatedTask._id : null);
      if (!targetTaskId) {
        throw new Error('Target task ID is required for update_task_details action');
      }

      const updatePayload = {};
      if (config.title) updatePayload.title = interpolateText(config.title, context);
      if (config.description) updatePayload.description = interpolateText(config.description, context);
      if (config.priority) updatePayload.priority = config.priority;
      if (config.dueDate) updatePayload.dueDate = new Date(config.dueDate);

      const updated = await Task.findByIdAndUpdate(targetTaskId, updatePayload, { returnDocument: 'after' });
      return {
        taskId: targetTaskId,
        updatedFields: Object.keys(updatePayload)
      };
    }

    case 'add_comment': {
      const message = interpolateText(config.message || 'Workflow executed automated action.', context);
      await logAuditAction({
        user: actorId || workflow.createdBy,
        action: 'WORKFLOW_COMMENT',
        entityType: 'Workflow',
        entityId: workflow._id,
        details: { message, executionId: execution._id }
      });
      return { commentLogged: true, message };
    }

    case 'generate_text': {
      const template = config.template || config.text || 'Workflow step executed successfully.';
      const supportedTypes = ['sprint_goal', 'retrospective_template', 'task_spec'];
      if (supportedTypes.includes(template)) {
        const prompt = interpolateText(config.prompt || 'Sprint Goal', context);
        const generated = await aiService.generateContent(template, { theme: prompt });
        return {
          template,
          title: generated.title,
          content: generated.content
        };
      }
      const rendered = interpolateText(template, context);
      return {
        text: rendered,
        template
      };
    }

    case 'extract_tasks': {
      const textToExtract = interpolateText(config.text || context.triggerPayload?.content || '', context);
      const result = await aiService.extractTasks(textToExtract);
      context.variables.extractedTasks = result.tasks;
      return {
        extractedCount: result.count,
        tasks: result.tasks.map(t => ({ title: t.title, priority: t.priority, assignee: t.assigneeName }))
      };
    }

    case 'complete_workflow': {
      return { message: 'Workflow marked as explicitly completed.' };
    }

    case 'fail_workflow': {
      throw new Error(config.reason || 'Workflow explicitly aborted by fail_workflow step.');
    }

    default:
      throw new Error(`Unsupported workflow step type: '${stepType}'`);
  }
}

/**
 * Text interpolation helper for templates (e.g. {{trigger.title}} or {{lastTask.title}})
 */
function interpolateText(template, context) {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    if (key === 'trigger.title') return context.triggerPayload?.title || 'Untitled';
    if (key === 'trigger.name') return context.triggerPayload?.name || context.triggerPayload?.title || 'Item';
    if (key === 'trigger.id') return context.triggerPayload?._id?.toString() || '';
    if (key === 'lastTask.title') return context.lastCreatedTask?.title || 'Task';
    return match;
  });
}

/**
 * Event-Driven Trigger Dispatcher
 * Finds all active workflows matching the event type and executes them safely.
 */
export const triggerWorkflows = async (triggerType, eventPayload = {}, actorId = null) => {
  // Check if the event was originated by an automated workflow to prevent recursive loops
  if (eventPayload.sourceExecution) {
    return { dispatched: 0, reason: 'Skipped: Event originated from an automated workflow execution' };
  }

  // Find all active workflows configured for this triggerType
  const matchingWorkflows = await Workflow.find({
    status: 'active',
    'trigger.type': triggerType
  }).lean();

  if (!matchingWorkflows || matchingWorkflows.length === 0) {
    return { dispatched: 0, reason: `No active workflows found for trigger '${triggerType}'` };
  }

  const results = [];
  for (const wf of matchingWorkflows) {
    // Generate a deterministic event ID to prevent duplicate executions for the same event
    const eventId = `${triggerType}:${eventPayload._id || Date.now()}`;
    try {
      const res = await executeWorkflow(
        wf._id,
        {
          triggerType,
          triggerEventId: eventId,
          payload: eventPayload
        },
        actorId
      );
      results.push({ workflowId: wf._id, name: wf.name, result: res });
    } catch (err) {
      results.push({ workflowId: wf._id, name: wf.name, error: err.message });
    }
  }

  return { dispatched: results.length, results };
};

export default {
  executeWorkflow,
  triggerWorkflows
};
