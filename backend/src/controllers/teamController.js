import teamService from '../services/teamService.js';

export const getTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams(req.query);
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: `Team not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const team = await teamService.createTeam(req.body, actorId);
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const team = await teamService.updateTeam(req.params.id, req.body, actorId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: `Team not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const team = await teamService.deleteTeam(req.params.id, actorId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: `Team not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};
