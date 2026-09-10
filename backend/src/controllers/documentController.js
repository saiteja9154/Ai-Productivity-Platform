import documentService from '../services/documentService.js';

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getAllDocuments(req.query);
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
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
    const actorId = req.user?.id || null;
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

export const updateDocument = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const document = await documentService.updateDocument(req.params.id, req.body, actorId);
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
    const actorId = req.user?.id || null;
    const document = await documentService.deleteDocument(req.params.id, actorId);
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

export default {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};
