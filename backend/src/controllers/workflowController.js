import workflowService from '../services/workflowService.js';

export const getWorkflows = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflows = await workflowService.getAllWorkflows(req.query, actorId);
    res.status(200).json({
      success: true,
      count: workflows.length,
      data: workflows
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkflowById = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflow = await workflowService.getWorkflowById(req.params.id, actorId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: `Workflow not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkflow = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflow = await workflowService.createWorkflow(req.body, actorId);
    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkflow = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflow = await workflowService.updateWorkflow(req.params.id, req.body, actorId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: `Workflow not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Workflow updated successfully',
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflow = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflow = await workflowService.deleteWorkflow(req.params.id, actorId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: `Workflow not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const activateWorkflow = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflow = await workflowService.activateWorkflow(req.params.id, actorId);
    res.status(200).json({
      success: true,
      message: 'Workflow activated successfully',
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateWorkflow = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const workflow = await workflowService.deactivateWorkflow(req.params.id, actorId);
    res.status(200).json({
      success: true,
      message: 'Workflow deactivated successfully',
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

export const runWorkflow = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const result = await workflowService.runWorkflow(req.params.id, actorId, req.body);
    res.status(200).json({
      success: true,
      message: 'Workflow executed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkflowExecutions = async (req, res, next) => {
  try {
    const actorId = req.user?.id || req.user?._id?.toString() || null;
    const userRole = req.user?.role || null;
    const result = await workflowService.getWorkflowExecutions(req.params.id, req.query, actorId, userRole);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Workflow not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      count: result.executions?.length || 0,
      data: result.executions || [],
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionById = async (req, res, next) => {
  try {
    const actorId = req.user?.id || req.user?._id?.toString() || null;
    const userRole = req.user?.role || null;
    const execution = await workflowService.getExecutionById(req.params.executionId, actorId, userRole);
    if (!execution) {
      return res.status(404).json({
        success: false,
        message: `Execution not found with id: ${req.params.executionId}`
      });
    }
    res.status(200).json({
      success: true,
      data: execution
    });
  } catch (error) {
    next(error);
  }
};

// Workflow Steps
export const getWorkflowSteps = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const steps = await workflowService.getWorkflowSteps(req.params.id, actorId);
    res.status(200).json({
      success: true,
      count: steps.length,
      data: steps
    });
  } catch (error) {
    next(error);
  }
};

export const addWorkflowStep = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const step = await workflowService.addWorkflowStep(req.params.id, req.body, actorId);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: `Workflow not found with id: ${req.params.id}`
      });
    }
    res.status(201).json({
      success: true,
      message: 'Workflow step created successfully',
      data: step
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkflowStep = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const step = await workflowService.updateWorkflowStep(
      req.params.id,
      req.params.stepId,
      req.body,
      actorId
    );
    if (!step) {
      return res.status(404).json({
        success: false,
        message: `Workflow step not found with id: ${req.params.stepId}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Workflow step updated successfully',
      data: step
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflowStep = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const step = await workflowService.deleteWorkflowStep(
      req.params.id,
      req.params.stepId,
      actorId
    );
    if (!step) {
      return res.status(404).json({
        success: false,
        message: `Workflow step not found with id: ${req.params.stepId}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Workflow step deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getWorkflows,
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

