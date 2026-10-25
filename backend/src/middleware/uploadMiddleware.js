import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads destination directory
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads/documents');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configurable maximum file size (default: 10MB)
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

// Permitted extensions and mime types
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.txt',
  '.md',
  '.csv',
  '.json',
  '.doc',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp'
]);

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const sanitizedExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeName = `doc_${Date.now()}_${randomHex}${sanitizedExt}`;
    cb(null, safeName);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Verify extension is in allowlist
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error(`Unsupported file extension: "${ext}". Permitted: PDF, TXT, MD, CSV, JSON, DOC, DOCX, PNG, JPG, WEBP`);
    error.statusCode = 400;
    return cb(error, false);
  }

  // 2. Verify MIME type is in allowlist
  if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    const error = new Error(`Unsupported MIME type: "${file.mimetype}". Permitted document formats only.`);
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
});

/**
 * Express middleware wrapper to catch Multer errors and return clean JSON 400 responses
 */
export const handleUpload = (req, res, next) => {
  const singleUpload = upload.single('file');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum permitted limit of ${MAX_FILE_SIZE_MB}MB.`
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'File upload validation failed'
      });
    }

    next();
  });
};

export default {
  upload,
  handleUpload,
  UPLOADS_DIR
};
