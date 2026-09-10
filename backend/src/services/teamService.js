import Team from '../models/Team.js';
import { logAuditAction } from './auditService.js';

export const getAllTeams = async (query = {}) => {
  const filter = {};
  if (query.createdBy) filter.createdBy = query.createdBy;

  const teams = await Team.find(filter)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return teams;
};

export const getTeamById = async (id) => {
  const team = await Team.findById(id)
    .populate('createdBy', 'name email role')
    .lean();

  return team;
};

export const createTeam = async (teamData, actorId = null) => {
  const payload = {
    ...teamData,
    createdBy: teamData.createdBy || actorId
  };

  const team = await Team.create(payload);
  const populatedTeam = await Team.findById(team._id).populate('createdBy', 'name email role').lean();

  await logAuditAction({
    user: actorId || team.createdBy,
    action: 'TEAM_CREATED',
    entityType: 'Team',
    entityId: team._id,
    details: { name: team.name }
  });

  return populatedTeam;
};

export const updateTeam = async (id, updateData, actorId = null) => {
  const team = await Team.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  })
    .populate('createdBy', 'name email role')
    .lean();

  if (team) {
    await logAuditAction({
      user: actorId,
      action: 'TEAM_UPDATED',
      entityType: 'Team',
      entityId: id,
      details: { updatedFields: Object.keys(updateData) }
    });
  }

  return team;
};

export const deleteTeam = async (id, actorId = null) => {
  const team = await Team.findByIdAndDelete(id).lean();

  if (team) {
    await logAuditAction({
      user: actorId,
      action: 'TEAM_DELETED',
      entityType: 'Team',
      entityId: id,
      details: { name: team.name }
    });
  }

  return team;
};

export default {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};
