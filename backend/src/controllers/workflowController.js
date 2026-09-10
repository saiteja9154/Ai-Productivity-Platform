import workflowService from '../services/workflowService.js';

export const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await workflowService.getAllWorkflows(req.query);
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
    const workflow = await workflowService.getWorkflowById(req.params.id);
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

// Workflow Steps
export const getWorkflowSteps = async (req, res, next) => {
  try {
    const steps = await workflowService.getWorkflowSteps(req.params.id);
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
  getWorkflowSteps,
  addWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep
};
