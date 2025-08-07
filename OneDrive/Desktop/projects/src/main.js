import './style.css'

// Application State
class PDFConverterApp {
  constructor() {
    this.files = [];
    this.currentSection = 'dashboard';
    this.conversionHistory = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderHistory();
    this.updateConvertButton();
    this.initTrackingBot();
    this.renderRecentDownloads();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.getAttribute('href').substring(1);
        this.switchSection(section);
      });
    });

    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    });

    // Click to upload
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
    });

    // Convert button
    document.getElementById('convertBtn').addEventListener('click', () => {
      this.convertFiles();
    });

    // Clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
      this.clearHistory();
    });
  }

  switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[href="#${section}"]`).classList.add('active');

    // Show/hide sections
    document.querySelectorAll('section').forEach(sec => {
      sec.classList.add('hidden');
    });
    document.getElementById(section).classList.remove('hidden');

    this.currentSection = section;

    // Refresh history if switching to history section
    if (section === 'history') {
      this.renderHistory();
    }
  }

  handleFiles(files) {
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        this.showNotification('Only PDF files are supported', 'error');
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        this.showNotification('File size must be less than 50MB', 'error');
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const fileObj = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: this.formatFileSize(file.size),
        status: 'pending'
      };
      this.files.push(fileObj);
    });

    this.renderFileList();
    this.updateConvertButton();
  }

  renderFileList() {
    const fileItems = document.getElementById('fileItems');
    const fileList = document.querySelector('.file-list');

    if (this.files.length === 0) {
      fileList.style.display = 'none';
      return;
    }

    fileList.style.display = 'block';
    fileItems.innerHTML = this.files.map(file => `
      <div class="file-item" data-id="${file.id}">
        <div class="file-info-section">
          <div class="file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="file-details">
            <h4>${file.name}</h4>
            <p>${file.size} • PDF Document</p>
          </div>
        </div>
        <div class="file-actions">
          <button class="btn-small btn-danger" onclick="app.removeFile('${file.id}')">
            Remove
          </button>
        </div>
      </div>
    `).join('');
  }

  removeFile(fileId) {
    this.files = this.files.filter(file => file.id !== fileId);
    this.renderFileList();
    this.updateConvertButton();
  }

  updateConvertButton() {
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = this.files.length === 0;
  }

  async convertFiles() {
    if (this.files.length === 0) return;

    const modal = document.getElementById('progressModal');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Show progress modal
    modal.classList.add('active');

    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      this.files.forEach(file => {
        formData.append('files', file.file);
      });

      // Show initial progress
      progressFill.style.width = '10%';
      progressText.textContent = 'Uploading files...';

      // Send files to backend API
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      progressFill.style.width = '50%';
      progressText.textContent = 'Converting files...';

      const result = await response.json();

      progressFill.style.width = '100%';
      progressText.textContent = 'Conversion completed!';

      // Process results
      result.results.forEach(fileResult => {
        if (fileResult.status === 'success') {
          this.conversionHistory.unshift({
            id: Date.now() + Math.random(),
            fileName: fileResult.originalName,
            convertedName: fileResult.convertedName,
            originalSize: this.formatFileSize(fileResult.size),
            convertedAt: new Date().toISOString(),
            status: 'success',
            downloadUrl: fileResult.downloadUrl
          });
        } else {
          this.conversionHistory.unshift({
            id: Date.now() + Math.random(),
            fileName: fileResult.originalName,
            convertedAt: new Date().toISOString(),
            status: 'error',
            error: fileResult.error
          });
        }
      });

      // Save history to localStorage
      localStorage.setItem('conversionHistory', JSON.stringify(this.conversionHistory));

      // Clear current files
      this.files = [];
      this.renderFileList();
      this.updateConvertButton();
      this.renderRecentDownloads(); // Refresh recent downloads

      // Show success message
      setTimeout(() => {
        modal.classList.remove('active');
        this.showNotification('Files converted successfully!', 'success');
      }, 1000);

    } catch (error) {
      console.error('Conversion error:', error);
      modal.classList.remove('active');
      this.showNotification(`Conversion failed: ${error.message}`, 'error');
    }
  }

  renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (this.conversionHistory.length === 0) {
      historyList.innerHTML = `
        <div class="history-item">
          <div class="history-info">
            <p>No conversion history yet. Upload and convert your first PDF file!</p>
          </div>
        </div>
      `;
      return;
    }

    historyList.innerHTML = this.conversionHistory.map(item => `
      <div class="history-item">
        <div class="history-info">
          <div>
            <h4>${item.fileName}</h4>
            <p>Converted on ${new Date(item.convertedAt).toLocaleDateString()} at ${new Date(item.convertedAt).toLocaleTimeString()}</p>
            <p>Original size: ${item.originalSize}</p>
          </div>
          <span class="status-badge status-${item.status}">${item.status}</span>
        </div>
        <div class="history-actions">
          ${item.status === 'success' ? `
            <button class="download-btn" onclick="app.downloadFile('${item.id}')">
              Download
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  downloadFile(historyId) {
    const historyItem = this.conversionHistory.find(item => item.id == historyId);
    if (historyItem && historyItem.downloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = historyItem.downloadUrl;
      link.download = historyItem.convertedName || historyItem.fileName.replace('.pdf', '.docx');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showNotification('Download started!', 'success');
    } else {
      this.showNotification('Download not available', 'error');
    }
  }

  clearHistory() {
    this.conversionHistory = [];
    localStorage.removeItem('conversionHistory');
    this.renderHistory();
    this.renderRecentDownloads(); // Refresh recent downloads
    this.showNotification('History cleared successfully', 'success');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Add styles for notifications
    if (!document.getElementById('notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1001;
          min-width: 300px;
          padding: 1rem;
          border-radius: 12px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        .notification.show {
          transform: translateX(0);
        }
        .notification-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border-left: 4px solid #10b981;
        }
        .notification-error {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-left: 4px solid #ef4444;
        }
        .notification-info {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border-left: 4px solid #3b82f6;
        }
        .notification-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notification-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: inherit;
          margin-left: 1rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        .notification-close:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Close notification
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  initTrackingBot() {
    const bot = document.getElementById('trackingBot');
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');
    
    // Get bot's fixed position
    const botRect = bot.getBoundingClientRect();
    const botCenterX = botRect.left + botRect.width / 2;
    const botCenterY = botRect.top + botRect.height / 2;
    
    // Track mouse movement and move pupils accordingly
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate angle from bot center to mouse
      const deltaX = mouseX - botCenterX;
      const deltaY = mouseY - botCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      
      // Calculate pupil movement (limited range)
      const maxDistance = 3; // Maximum pupil movement in pixels
      const pupilX = Math.cos(angle) * maxDistance;
      const pupilY = Math.sin(angle) * maxDistance;
      
      // Apply movement to both pupils
      leftPupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
      rightPupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
      
      // Add slight rotation to the bot based on cursor position
      const rotationAngle = (deltaX / window.innerWidth) * 10; // Max 10 degrees
      bot.style.transform = `rotate(${rotationAngle}deg)`;
    });

    // Add fun interactions when hovering over the bot area
    const checkHover = (e) => {
      const rect = bot.getBoundingClientRect();
      const isHovering = e.clientX >= rect.left && e.clientX <= rect.right && 
                        e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (isHovering) {
        bot.style.transform += ' scale(1.1)';
        bot.style.filter = 'brightness(1.2) saturate(1.5)';
      } else {
        bot.style.filter = 'brightness(1) saturate(1)';
      }
    };

    document.addEventListener('mousemove', checkHover);

    // Random bot expressions
    const expressions = ['🤖', '😊', '🚀', '✨', '💫', '⭐', '🔥', '👀', '🎯'];
    let currentExpression = 0;
    
    setInterval(() => {
      currentExpression = (currentExpression + 1) % expressions.length;
      const expression = expressions[currentExpression];
      
      // Update the bot's expression
      const style = document.createElement('style');
      style.textContent = `.tracking-bot::before { content: "${expression}" !important; }`;
      document.head.appendChild(style);
      
      // Remove the old style after a short delay
      setTimeout(() => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 100);
    }, 4000);

    // Add click interaction
    bot.style.pointerEvents = 'auto';
    bot.addEventListener('click', () => {
      // Fun click animation
      bot.style.animation = 'none';
      bot.offsetHeight; // Trigger reflow
      bot.style.animation = 'bot-bounce 0.6s ease';
      
      this.showNotification('Hey there! 👋 I\'m your PDF conversion assistant!', 'info');
    });
  }

  renderRecentDownloads() {
    const recentDownloadsSection = document.getElementById('recentDownloads');
    const downloadsGrid = document.getElementById('downloadsGrid');
    
    // Get recent successful conversions (last 6)
    const recentSuccessful = this.conversionHistory
      .filter(item => item.status === 'success')
      .slice(0, 6);
    
    if (recentSuccessful.length === 0) {
      recentDownloadsSection.style.display = 'none';
      return;
    }
    
    recentDownloadsSection.style.display = 'block';
    
    downloadsGrid.innerHTML = recentSuccessful.map(item => `
      <div class="download-card">
        <div class="download-card-header">
          <div class="download-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="download-card-info">
            <h4 title="${item.fileName}">${item.fileName}</h4>
            <p>${new Date(item.convertedAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div class="download-card-actions">
          <button class="download-card-btn" onclick="app.downloadFile('${item.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>
      </div>
    `).join('');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize the application
const app = new PDFConverterApp();

// Make app globally available for event handlers
window.app = app;
