import Document from '../models/Document.js';
import { logAuditAction } from './auditService.js';

export const getAllDocuments = async (query = {}) => {
  const filter = {};
  if (query.team) filter.team = query.team;
  if (query.uploadedBy) filter.uploadedBy = query.uploadedBy;

  const documents = await Document.find(filter)
    .populate('uploadedBy', 'name email role')
    .populate('team', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return documents;
};

export const getDocumentById = async (id) => {
  const document = await Document.findById(id)
    .populate('uploadedBy', 'name email role')
    .populate('team', 'name')
    .lean();

  return document;
};

export const createDocument = async (docData, actorId = null) => {
  const payload = {
    ...docData,
    uploadedBy: docData.uploadedBy || actorId
  };

  const document = await Document.create(payload);
  const populatedDoc = await Document.findById(document._id)
    .populate('uploadedBy', 'name email role')
    .populate('team', 'name')
    .lean();

  await logAuditAction({
    user: actorId || document.uploadedBy,
    action: 'DOCUMENT_CREATED',
    entityType: 'Document',
    entityId: document._id,
    details: { title: document.title }
  });

  return populatedDoc;
};

export const updateDocument = async (id, updateData, actorId = null) => {
  const document = await Document.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  })
    .populate('uploadedBy', 'name email role')
    .populate('team', 'name')
    .lean();

  if (document) {
    await logAuditAction({
      user: actorId,
      action: 'DOCUMENT_UPDATED',
      entityType: 'Document',
      entityId: id,
      details: { updatedFields: Object.keys(updateData) }
    });
  }

  return document;
};

export const deleteDocument = async (id, actorId = null) => {
  const document = await Document.findByIdAndDelete(id).lean();

  if (document) {
    await logAuditAction({
      user: actorId,
      action: 'DOCUMENT_DELETED',
      entityType: 'Document',
      entityId: id,
      details: { title: document.title }
    });
  }

  return document;
};

export default {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};
