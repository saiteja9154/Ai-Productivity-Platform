import aiService from '../services/aiService.js';
import Document from '../models/Document.js';
import Task from '../models/Task.js';

export const chat = async (req, res, next) => {
  try {
    const { message, question, context } = req.body;
    const query = message || question || '';
    const result = await aiService.answerQuestion(query, context);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const summarize = async (req, res, next) => {
  try {
    const { text, documentId, options } = req.body;
    let contentToSummarize = text;

    if (documentId) {
      const doc = await Document.findById(documentId);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Authorization check: user must be owner or have access
      const actorId = req.user?.id || req.user?._id?.toString();
      const isOwner = doc.owner && doc.owner.toString() === actorId;
      const isUploader = doc.uploadedBy && doc.uploadedBy.toString() === actorId;
      const isAdmin = req.user?.role === 'admin';

      if (!isOwner && !isUploader && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this document'
        });
      }

      if (doc.documentType === 'FILE') {
        return res.status(400).json({
          success: false,
          message: 'Direct summarization of binary file assets is not supported. Please summarize plain-text notes or provide text content directly.'
        });
      }

      contentToSummarize = doc.content || doc.description || '';
      if (!contentToSummarize.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Document contains no readable text content to summarize.'
        });
      }
    }

    if (!contentToSummarize || typeof contentToSummarize !== 'string' || !contentToSummarize.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text content or a valid documentId is required for summarization'
      });
    }

    const result = await aiService.summarizeDocument(contentToSummarize, options);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const extractTasks = async (req, res, next) => {
  try {
    const { text, options } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text content is required for task extraction'
      });
    }

    const result = await aiService.extractTasks(text, options);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const processMeetingNotes = async (req, res, next) => {
  try {
    const text = req.body.text || req.body.meetingNotes;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meeting notes text is required'
      });
    }

    const result = await aiService.processMeetingNotes(text, req.body.options);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const confirmMeetingTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty array of tasks is required for confirmation'
      });
    }

    const actorId = req.user?.id || req.user?._id;
    const createdTasks = [];

    for (const item of tasks) {
      if (!item.title || !item.title.trim()) continue;

      const newTask = await Task.create({
        title: item.title.trim(),
        description: item.description || 'Extracted from meeting notes',
        priority: ['low', 'medium', 'high', 'urgent'].includes(item.priority) ? item.priority : 'medium',
        status: ['todo', 'in-progress', 'completed'].includes(item.status) ? item.status : 'todo',
        dueDate: item.dueDate ? new Date(item.dueDate) : null,
        assignedTo: item.assignedTo || null,
        createdBy: actorId,
        tags: ['meeting-notes', 'extracted-ai']
      });

      createdTasks.push(newTask);
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdTasks.length} tasks from notes`,
      count: createdTasks.length,
      data: createdTasks
    });
  } catch (error) {
    next(error);
  }
};

export const generateEmail = async (req, res, next) => {
  try {
    const { templateType, context } = req.body;
    const result = await aiService.generateEmail(templateType, context);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const generateContent = async (req, res, next) => {
  try {
    const { contentType, params } = req.body;
    const result = await aiService.generateContent(contentType, params);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  chat,
  summarize,
  extractTasks,
  processMeetingNotes,
  confirmMeetingTasks,
  generateEmail,
  generateContent
};
