import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Configure multer for file uploads (using temp directory for serverless)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(tmpdir(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PDF to Word Converter API is running' });
});

// Upload and convert PDF files
app.post('/api/convert', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];

    for (const file of req.files) {
      try {
        // Simulate conversion process
        await simulateConversion(file);
        
        const convertedFile = {
          originalName: file.originalname,
          convertedName: file.originalname.replace('.pdf', '.docx'),
          size: file.size,
          downloadUrl: `/api/download/${file.filename.replace('.pdf', '.docx')}`,
          status: 'success'
        };

        results.push(convertedFile);

        // Clean up uploaded PDF file after conversion
        fs.unlinkSync(file.path);

      } catch (error) {
        console.error(`Error converting ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          status: 'error',
          error: error.message
        });

        // Clean up file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({ results });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download converted files
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(tmpdir(), 'converted', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ error: 'Only PDF files are allowed!' });
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// Simulate PDF to Word conversion (replace with actual conversion logic)
async function simulateConversion(file) {
  return new Promise((resolve, reject) => {
    // Simulate processing time
    const processingTime = Math.min(5000, Math.max(1000, file.size / 1000));
    
    setTimeout(() => {
      // Create converted directory if it doesn't exist
      const convertedDir = path.join(tmpdir(), 'converted');
      if (!fs.existsSync(convertedDir)) {
        fs.mkdirSync(convertedDir, { recursive: true });
      }

      // Create a dummy Word file (in real implementation, this would be the actual conversion)
      const convertedFileName = file.filename.replace('.pdf', '.docx');
      const convertedFilePath = path.join(convertedDir, convertedFileName);
      
      // Create a simple Word document placeholder
      const wordContent = `This is a converted Word document from ${file.originalname}\n\n` +
                         `Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
                         `Conversion completed at: ${new Date().toISOString()}\n\n` +
                         `Note: This is a demo conversion. In a real implementation, ` +
                         `the actual PDF content would be extracted and converted to Word format.`;
      
      fs.writeFileSync(convertedFilePath, wordContent);
      resolve({ success: true });
    }, processingTime);
  });
}

export default app;
