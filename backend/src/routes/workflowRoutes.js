import express from 'express';
import {
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

// Execution detail lookup
router.route('/executions/:executionId')
  .get(getExecutionById);

router.route('/:id')
  .get(validateWorkflowId, validate, getWorkflowById)
  .put(validateUpdateWorkflow, validate, updateWorkflow)
  .patch(validateUpdateWorkflow, validate, updateWorkflow)
  .delete(validateWorkflowId, validate, deleteWorkflow);

// Phase 6 Actions
router.route('/:id/activate')
  .post(validateWorkflowId, validate, activateWorkflow);

router.route('/:id/deactivate')
  .post(validateWorkflowId, validate, deactivateWorkflow);

router.route('/:id/run')
  .post(validateWorkflowId, validate, runWorkflow);

router.route('/:id/executions')
  .get(validateWorkflowId, validate, getWorkflowExecutions);

// Workflow Steps Sub-routes
router.route('/:id/steps')
  .get(validateWorkflowId, validate, getWorkflowSteps)
  .post(validateCreateWorkflowStep, validate, addWorkflowStep);

router.route('/:id/steps/:stepId')
  .put(validateUpdateWorkflowStep, validate, updateWorkflowStep)
  .delete(validateStepId, validate, deleteWorkflowStep);

export default router;

