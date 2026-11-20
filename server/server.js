import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Exact Password requested by User
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Alexozx@01';
const SECRET_TOKEN = 'admin_token_' + Buffer.from(ADMIN_PASSWORD).toString('base64');

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helper to initialize and read DB
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        meta: {
          appName: "ALEXO GBP Road & Map Pro Backend",
          createdAt: new Date().toISOString()
        },
        profiles: [],
        payments: [],
        leads: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.profiles) parsed.profiles = [];
    if (!parsed.payments) parsed.payments = [];
    if (!parsed.leads) parsed.leads = [];
    return parsed;
  } catch (err) {
    console.error("DB Read Error:", err);
    return { profiles: [] };
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("DB Write Error:", err);
    return false;
  }
}

// Auth Verification Middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: "ऑथेंटिकेशन टोकन आवश्यक है (Unauthorized)" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token !== SECRET_TOKEN) {
    return res.status(403).json({ success: false, error: "अमान्य टोकन या सत्र समाप्त (Forbidden)" });
  }

  next();
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    server: 'GBP Master Backend',
    time: new Date().toISOString() 
  });
});

// 2. Admin Login API (Strict password check: Alexozx@01)
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: "पासवर्ड दर्ज करें।" });
  }

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "सफलतापूर्वक लॉगिन हुआ! आपका स्वागत है।",
      token: SECRET_TOKEN,
      user: {
        role: "Master Admin",
        username: "Alexozx"
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      error: "गलत पासवर्ड! केवल अधिकृत एडमिन ही डेटा देख सकते हैं।"
    });
  }
});

// 3. Get All Profiles (Admin Only)
app.get('/api/admin/profiles', requireAdminAuth, (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    count: db.profiles.length,
    data: db.profiles
  });
});

// 4. Save / Create Profile (Public or Admin)
app.post('/api/profiles', (req, res) => {
  const profileData = req.body;
  if (!profileData || !profileData.businessName) {
    return res.status(400).json({ success: false, error: "बिज़नेस का नाम आवश्यक है।" });
  }

  const db = readDatabase();
  const id = profileData.id || 'gbp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

  const newEntry = {
    ...profileData,
    id,
    status: profileData.status || 'Pending Verification',
    createdAt: profileData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Check if updating existing
  const existingIndex = db.profiles.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    db.profiles[existingIndex] = newEntry;
  } else {
    db.profiles.unshift(newEntry);
  }

  writeDatabase(db);

  res.json({
    success: true,
    message: "प्रोफाइल सफलतापूर्वक मास्टर डेटाबेस में सुरक्षित हो गई।",
    id,
    data: newEntry
  });
});

// 4.1. Save Customer Payment / Recharge Order (Public)
app.post('/api/payments', (req, res) => {
  const paymentData = req.body;
  if (!paymentData || !paymentData.planId) {
    return res.status(400).json({ success: false, error: "प्लान विवरण आवश्यक है।" });
  }

  const db = readDatabase();
  const paymentId = 'pay_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

  const paymentRecord = {
    id: paymentId,
    planId: paymentData.planId,
    planName: paymentData.planName || 'ALEXO Starter',
    amount: paymentData.amount || 499,
    category: paymentData.category || 'Retail/Shop',
    utrNumber: paymentData.utrNumber || 'N/A',
    customerPhone: paymentData.customerPhone || 'N/A',
    customerName: paymentData.customerName || 'Customer',
    businessName: paymentData.businessName || 'Business Profile',
    formData: paymentData.formData || null,
    status: 'Pending Verification',
    createdAt: new Date().toISOString()
  };

  db.payments.unshift(paymentRecord);
  writeDatabase(db);

  console.log(`💰 New Payment Received: ${paymentRecord.businessName} - ₹${paymentRecord.amount} (UTR: ${paymentRecord.utrNumber})`);

  res.json({
    success: true,
    message: "पेमेंट विवरण सफलतापूर्वक एडमिन सर्वर पर प्राप्त हो गया।",
    id: paymentId,
    data: paymentRecord
  });
});

// 4.2. Get All Payments (Admin Only)
app.get('/api/admin/payments', requireAdminAuth, (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    count: db.payments.length,
    data: db.payments
  });
});

// 5. Update Status (Admin Only)
app.patch('/api/admin/profiles/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const db = readDatabase();
  const profile = db.profiles.find(p => p.id === id);

  if (!profile) {
    return res.status(404).json({ success: false, error: "प्रोफाइल नहीं मिली।" });
  }

  if (status) profile.status = status;
  if (notes !== undefined) profile.adminNotes = notes;
  profile.updatedAt = new Date().toISOString();

  writeDatabase(db);

  res.json({ success: true, message: "स्टेटस अपडेट हो गया।", profile });
});

// 6. Delete Profile (Admin Only)
app.delete('/api/admin/profiles/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const initialCount = db.profiles.length;
  db.profiles = db.profiles.filter(p => p.id !== id);

  if (db.profiles.length === initialCount) {
    return res.status(404).json({ success: false, error: "प्रोफाइल नहीं मिली।" });
  }

  writeDatabase(db);
  res.json({ success: true, message: "प्रोफाइल सफलतापूर्वक हटा दी गई।" });
});

// 7. Export All Data as CSV (Admin Only)
app.get('/api/admin/export/csv', requireAdminAuth, (req, res) => {
  const db = readDatabase();
  const headers = [
    "ID",
    "Business Name",
    "Category",
    "Phone",
    "Email",
    "City",
    "Address",
    "Road Name",
    "Latitude",
    "Longitude",
    "Road Entrance Lat",
    "Road Entrance Lng",
    "Status",
    "Created Date"
  ];

  const rows = db.profiles.map(p => [
    `"${p.id || ''}"`,
    `"${(p.businessName || '').replace(/"/g, '""')}"`,
    `"${(p.primaryCategory || '').replace(/"/g, '""')}"`,
    `"${(p.contactNumber || '').replace(/"/g, '""')}"`,
    `"${(p.email || '').replace(/"/g, '""')}"`,
    `"${(p.city || '').replace(/"/g, '""')}"`,
    `"${(p.addressLine1 || '').replace(/"/g, '""')}"`,
    `"${(p.roadName || '').replace(/"/g, '""')}"`,
    `"${p.latitude || ''}"`,
    `"${p.longitude || ''}"`,
    `"${p.roadEntranceLat || ''}"`,
    `"${p.roadEntranceLng || ''}"`,
    `"${p.status || 'Pending'}"`,
    `"${p.createdAt || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="gbp_master_data_export.csv"');
  res.status(200).send(csvContent);
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GBP Master Backend Server running on http://localhost:${PORT}`);
  console.log(`🔒 Admin Password Protection: Active`);
});
