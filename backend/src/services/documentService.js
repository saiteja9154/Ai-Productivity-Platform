import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import { UPLOADS_DIR } from '../middleware/uploadMiddleware.js';
import { logAuditAction } from './auditService.js';

/**
 * Retrieve documents with server-side search, filtering, and pagination
 */
export const getAllDocuments = async (query = {}, requestingUser = null) => {
  const filter = {};

  // Team filter
  if (query.team) {
    filter.team = query.team;
  }

  // Owner / Uploader filter
  if (query.owner || query.uploadedBy) {
    const userId = query.owner || query.uploadedBy;
    filter.$or = [{ owner: userId }, { uploadedBy: userId }];
  }

  // Document Type filter (TEXT or FILE)
  if (query.documentType) {
    filter.documentType = query.documentType.toUpperCase();
  }

  // Server-side text search (title, description, or content)
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    const searchConditions = [
      { title: searchRegex },
      { description: searchRegex },
      { content: searchRegex },
      { originalFileName: searchRegex }
    ];

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  // Sorting
  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' || query.sortOrder === '1' ? 1 : -1;
  const sortOptions = { [sortField]: sortOrder };

  // Pagination
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .populate('uploadedBy', 'name email role')
      .populate('owner', 'name email role')
      .populate('team', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Document.countDocuments(filter)
  ]);

  // Attach pagination metadata onto array for backward compatibility
  documents.pagination = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1
  };

  return documents;
};

/**
 * Retrieve single document by ID
 */
export const getDocumentById = async (id) => {
  const document = await Document.findById(id)
    .populate('uploadedBy', 'name email role')
    .populate('owner', 'name email role')
    .populate('team', 'name')
    .lean();

  return document;
};

/**
 * Create a new text document
 */
export const createDocument = async (docData, actorId = null) => {
  const payload = {
    ...docData,
    documentType: 'TEXT',
    owner: docData.owner || docData.uploadedBy || actorId,
    uploadedBy: docData.uploadedBy || docData.owner || actorId
  };

  const document = await Document.create(payload);
  const populatedDoc = await Document.findById(document._id)
    .populate('uploadedBy', 'name email role')
    .populate('owner', 'name email role')
    .populate('team', 'name')
    .lean();

  await logAuditAction({
    user: actorId || document.owner,
    action: 'DOCUMENT_CREATED',
    entityType: 'Document',
    entityId: document._id,
    details: { title: document.title, documentType: 'TEXT' }
  });

  return populatedDoc;
};

/**
 * Upload a document file and store metadata
 */
export const uploadDocument = async (file, metaData = {}, actorId = null) => {
  if (!file) {
    const error = new Error('No file was provided for upload');
    error.statusCode = 400;
    throw error;
  }

  const title = metaData.title && metaData.title.trim()
    ? metaData.title.trim()
    : path.parse(file.originalname).name;

  const payload = {
    title,
    description: metaData.description ? metaData.description.trim() : '',
    documentType: 'FILE',
    originalFileName: file.originalname,
    storedFileName: file.filename,
    mimeType: file.mimetype,
    fileSize: file.size,
    owner: metaData.owner || actorId,
    uploadedBy: metaData.uploadedBy || actorId,
    team: metaData.team || null
  };

  const document = await Document.create(payload);

  // Set standard download URL
  document.fileUrl = `/api/documents/${document._id}/download`;
  await document.save();

  const populatedDoc = await Document.findById(document._id)
    .populate('uploadedBy', 'name email role')
    .populate('owner', 'name email role')
    .populate('team', 'name')
    .lean();

  await logAuditAction({
    user: actorId || document.owner,
    action: 'DOCUMENT_UPLOADED',
    entityType: 'Document',
    entityId: document._id,
    details: {
      title: document.title,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    }
  });

  return populatedDoc;
};

/**
 * Update document details with ownership check
 */
export const updateDocument = async (id, updateData, actorId = null, userRole = null) => {
  const existingDoc = await Document.findById(id);
  if (!existingDoc) return null;

  // Enforce ownership unless admin
  if (actorId && existingDoc.owner && userRole !== 'admin') {
    if (existingDoc.owner.toString() !== actorId.toString() &&
        existingDoc.uploadedBy?.toString() !== actorId.toString()) {
      const error = new Error('Forbidden: You are not authorized to edit this document.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Prevent mass-assignment tampering of storage attributes
  const safeUpdates = { ...updateData };
  delete safeUpdates.storedFileName;
  delete safeUpdates.fileSize;
  delete safeUpdates.mimeType;

  const document = await Document.findByIdAndUpdate(id, safeUpdates, {
    returnDocument: 'after',
    runValidators: true
  })
    .populate('uploadedBy', 'name email role')
    .populate('owner', 'name email role')
    .populate('team', 'name')
    .lean();

  if (document) {
    await logAuditAction({
      user: actorId,
      action: 'DOCUMENT_UPDATED',
      entityType: 'Document',
      entityId: id,
      details: { updatedFields: Object.keys(safeUpdates) }
    });
  }

  return document;
};

/**
 * Delete document and delete physical file from storage if present
 */
export const deleteDocument = async (id, actorId = null, userRole = null) => {
  const existingDoc = await Document.findById(id);
  if (!existingDoc) return null;

  // Enforce ownership unless admin
  if (actorId && existingDoc.owner && userRole !== 'admin') {
    if (existingDoc.owner.toString() !== actorId.toString() &&
        existingDoc.uploadedBy?.toString() !== actorId.toString()) {
      const error = new Error('Forbidden: You are not authorized to delete this document.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Delete physical file from disk if FILE type
  if (existingDoc.storedFileName) {
    const filePath = path.join(UPLOADS_DIR, existingDoc.storedFileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file from disk: ${filePath}`, err.message);
      }
    }
  }

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

/**
 * Retrieve file path and metadata for secure file download
 */
export const getDocumentDownloadInfo = async (id, actorId = null, userRole = null) => {
  const document = await Document.findById(id).lean();
  if (!document) {
    const error = new Error(`Document not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  if (document.documentType !== 'FILE' || !document.storedFileName) {
    const error = new Error('This document does not have an attached downloadable file');
    error.statusCode = 400;
    throw error;
  }

  // Resolve file on filesystem safely (prevent path traversal)
  const safeFileName = path.basename(document.storedFileName);
  const filePath = path.join(UPLOADS_DIR, safeFileName);

  if (!fs.existsSync(filePath)) {
    const error = new Error('The requested physical file was not found on the server');
    error.statusCode = 404;
    throw error;
  }

  return {
    filePath,
    mimeType: document.mimeType || 'application/octet-stream',
    fileName: document.originalFileName || safeFileName,
    fileSize: document.fileSize
  };
};

export default {
  getAllDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentDownloadInfo
};
