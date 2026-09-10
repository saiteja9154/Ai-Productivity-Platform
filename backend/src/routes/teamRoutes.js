import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/teamController.js';
import {
  validateCreateTeam,
  validateUpdateTeam,
  validateTeamId
} from '../validators/teamValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTeams)
  .post(validateCreateTeam, validate, createTeam);

router.route('/:id')
  .get(validateTeamId, validate, getTeamById)
  .put(validateUpdateTeam, validate, updateTeam)
  .delete(validateTeamId, validate, deleteTeam);

export default router;
