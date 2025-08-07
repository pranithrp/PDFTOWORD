# PDF to Word Converter

A modern web application for converting PDF files to Microsoft Word documents with a beautiful dashboard interface.

## Features

- 🚀 **Drag & Drop Upload**: Easy file uploading with drag and drop support
- 📄 **PDF to Word Conversion**: Convert PDF files to .docx format
- 📊 **Dashboard Interface**: Clean and modern user interface
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 📈 **Conversion History**: Track your conversion history
- ⚡ **Fast Processing**: Quick file conversion with progress tracking
- 🔒 **Secure**: Files are processed securely and cleaned up automatically

## Technology Stack

### Frontend
- **Vite**: Fast build tool and development server
- **Vanilla JavaScript**: Modern ES6+ features
- **CSS3**: Custom CSS with CSS Grid and Flexbox
- **Responsive Design**: Mobile-first approach

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Multer**: File upload middleware
- **CORS**: Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pdf-to-word-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   
   For frontend development:
   ```bash
   npm run dev
   ```
   
   For backend development (in a new terminal):
   ```bash
   npm run dev:server
   ```

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
pdf-to-word-converter/
├── src/
│   ├── main.js          # Frontend JavaScript application
│   └── style.css        # Application styles
├── public/              # Static assets
├── server.js            # Backend Express server
├── index.html           # Main HTML file
├── package.json         # Project dependencies and scripts
└── README.md           # Project documentation
```

## API Endpoints

### POST /api/convert
Convert PDF files to Word documents.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Files to convert (field name: 'files')

**Response:**
```json
{
  "results": [
    {
      "originalName": "document.pdf",
      "convertedName": "document.docx",
      "size": 1048576,
      "downloadUrl": "/api/download/document.docx",
      "status": "success"
    }
  ]
}
```

### GET /api/download/:filename
Download converted Word documents.

### GET /api/health
Health check endpoint.

## Usage

1. **Upload Files**: Drag and drop PDF files or click to browse
2. **Configure Settings**: Choose output format and quality
3. **Convert**: Click the "Convert to Word" button
4. **Download**: Access converted files from the history section

## Features Overview

### Dashboard
- Clean, modern interface
- File upload with drag & drop
- Real-time progress tracking
- Conversion settings

### File Management
- Support for multiple file uploads
- File size validation (max 50MB)
- File type validation (PDF only)
- Individual file removal

### Conversion History
- Track all conversions
- Download converted files
- Clear history option
- Persistent storage

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a demonstration application. For production use, consider implementing additional security measures, error handling, and scalability features.
