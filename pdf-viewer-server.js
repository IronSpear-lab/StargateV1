const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 5000;

// Skapa uploads-mapp om den inte finns
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurera filuppladdningshanterare
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Skapa unikt filnamn med tidsstämpel och originalnamn
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pdf-' + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Acceptera endast PDF-filer
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Endast PDF-filer är tillåtna!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Middleware
app.use(bodyParser.json({ limit: '15mb' })); // Öka gränsen för JSON-payload
app.use(bodyParser.urlencoded({ extended: true, limit: '15mb' }));
app.use(session({
  secret: 'pdf-viewer-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Intern temporär databas för användare när backenden inte är tillgänglig
const users = [
  { id: 1, username: 'projectleader@example.com', password: '123456', name: 'Project Leader' }
];

// In-memory PDF storage
const pdfFiles = [
  { 
    id: 'pdf_1747231245129',
    filename: 'Namnlös PDF',
    description: 'Automatiskt sparad PDF',
    versionNumber: 1,
    uploadedBy: 'Du',
    uploaded: '14 maj 2025 16:00',
    fileUrl: '/uploads/test.pdf'
  },
  { 
    id: 'pdf_1747231513094',
    filename: 'AAAAExempel på ritningar',
    description: '--',
    versionNumber: 1,
    uploadedBy: 'Du',
    uploaded: '14 maj 2025 17:21',
    fileUrl: '/uploads/test.pdf'
  },
  { 
    id: 'pdf_1747232594208',
    filename: 'BEAM Guidelines 2.0 (1)',
    description: '--',
    versionNumber: 1,
    uploadedBy: 'Du',
    uploaded: '14 maj 2025 17:20',
    fileUrl: '/uploads/test.pdf'
  }
];

// Basic authentication middleware
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Lagra användarinformation i session
    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.status(200).json({ success: true, user: { username: user.username, name: user.name } });
  } else {
    res.status(401).json({ success: false, message: 'Ogiltiga inloggningsuppgifter' });
  }
});

// Get current user
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ username: req.session.user.username, name: req.session.user.name });
  } else {
    res.status(401).json({ message: 'Inte inloggad' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ success: true });
});

// PDF List endpoint
app.get('/api/pdf/list', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Inte inloggad' });
  }
  
  res.status(200).json(pdfFiles);
});

// Ladda upp en PDF-fil
app.post('/api/pdf/upload', upload.single('file'), (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Inte inloggad' });
  }
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Ingen fil uppladdad' });
    }
    
    // Skapa en referens till den uppladdade filen
    const fileInfo = {
      id: 'pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      originalFilename: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.session.user.username,
      uploaded: new Date().toLocaleString('sv-SE'),
      serverPath: '/uploads/' + req.file.filename
    };
    
    console.log('PDF uppladdad:', fileInfo.filename);
    
    res.status(200).json({ 
      success: true, 
      file: fileInfo 
    });
  } catch (error) {
    console.error('Fel vid filuppladdning:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Spara metadata för en PDF
app.post('/api/pdf/save', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Inte inloggad' });
  }
  
  const pdfData = req.body;
  console.log('Sparar PDF-metadata:', pdfData.id);
  
  // Generera nytt ID om det inte finns
  if (!pdfData.id) {
    pdfData.id = 'pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }
  
  // Lägg till uppladdarinformation
  pdfData.uploadedBy = req.session.user.username;
  pdfData.uploaded = new Date().toLocaleString('sv-SE');
  
  // Kontrollera om PDF:en redan finns - uppdatera i så fall
  const existingIndex = pdfFiles.findIndex(p => p.id === pdfData.id);
  if (existingIndex !== -1) {
    pdfFiles[existingIndex] = { ...pdfFiles[existingIndex], ...pdfData };
  } else {
    pdfFiles.push(pdfData);
  }
  
  res.status(200).json({ success: true, pdf: pdfData });
});

// Hämta en specifik PDF
app.get('/api/pdf/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Inte inloggad' });
  }
  
  const id = req.params.id;
  const pdf = pdfFiles.find(p => p.id === id);
  
  if (!pdf) {
    return res.status(404).json({ message: 'PDF hittades inte' });
  }
  
  res.status(200).json(pdf);
});

// För att testa och se om proxyn fungerar - vi skickar fortfarande vissa anrop till backend
app.use('/api/backend', createProxyMiddleware({
  target: 'http://0.0.0.0:8001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/backend': '/api', 
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'Proxy error',
      message: 'Could not connect to backend server'
    });
  }
}));

// Route for the basic PDF viewer
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'simple-pdf-viewer.html'));
});

// Route for the simple PDF viewer (keeping backward compatibility)
app.get('/simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'simple-pdf-viewer.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`PDF Viewer server running at http://0.0.0.0:${port}`);
    console.log(`Simple PDF Viewer: http://0.0.0.0:${port}/simple`);
});