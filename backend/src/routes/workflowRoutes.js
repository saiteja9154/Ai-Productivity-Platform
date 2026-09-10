import express from 'express';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowSteps,
  addWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep
} from '../controllers/workflowController.js';
import {
  validateCreateWorkflow,
  validateUpdateWorkflow,
  validateWorkflowId,
  validateCreateWorkflowStep,
  validateUpdateWorkflowStep,
  validateStepId
} from '../validators/workflowValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getWorkflows)
  .post(validateCreateWorkflow, validate, createWorkflow);

router.route('/:id')
  .get(validateWorkflowId, validate, getWorkflowById)
  .put(validateUpdateWorkflow, validate, updateWorkflow)
  .delete(validateWorkflowId, validate, deleteWorkflow);

// Workflow Steps Sub-routes
router.route('/:id/steps')
  .get(validateWorkflowId, validate, getWorkflowSteps)
  .post(validateCreateWorkflowStep, validate, addWorkflowStep);

router.route('/:id/steps/:stepId')
  .put(validateUpdateWorkflowStep, validate, updateWorkflowStep)
  .delete(validateStepId, validate, deleteWorkflowStep);

export default router;
