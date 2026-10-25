import path from 'path';
import documentService from '../services/documentService.js';

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getAllDocuments(req.query, req.user);
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      pagination: documents.pagination || null
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: `Document not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
    const document = await documentService.createDocument(req.body, actorId);
    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
    const document = await documentService.uploadDocument(req.file, req.body, actorId);
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
    const userRole = req.user?.role || null;
    const document = await documentService.updateDocument(req.params.id, req.body, actorId, userRole);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: `Document not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
    const userRole = req.user?.role || null;
    const document = await documentService.deleteDocument(req.params.id, actorId, userRole);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: `Document not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
    const userRole = req.user?.role || null;
    const fileInfo = await documentService.getDocumentDownloadInfo(req.params.id, actorId, userRole);

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.download(fileInfo.filePath, fileInfo.fileName, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument
};
