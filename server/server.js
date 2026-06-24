import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hgbc_secret_key_2026_jwt';

// Middleware
app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ----------------- AUTH ROUTES -----------------

// Admin Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '8h'
    });

    res.json({ token, email: user.email, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// Verify token route
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ----------------- MEMBER REGISTRATION ROUTE -----------------

// Public Form Submission
app.post('/api/members', async (req, res) => {
  const data = req.body;

  // Simple validation for required fields
  if (!data.name || !data.phone) {
    return res.status(400).json({ error: 'Name and Phone number are required fields.' });
  }

  try {
    // If email is provided, verify uniqueness
    if (data.email) {
      const existing = await db.getMemberByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: 'A member with this email address already exists.' });
      }
    }

    const newMember = await db.addMember(data);
    res.status(201).json({ message: 'Registration submitted successfully!', memberId: newMember.id });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Server error storing registration details.' });
  }
});

// ----------------- ADMIN DASHBOARD MEMBERS CRUD -----------------

// Get Members (with paging, search, filtering)
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const listResult = await db.getMembersList(req.query);
    res.json(listResult);
  } catch (error) {
    console.error('Fetch members error:', error);
    res.status(500).json({ error: 'Server error retrieving members list.' });
  }
});

// CSV Export
app.get('/api/members/export', authenticateToken, async (req, res) => {
  try {
    const rows = await db.getAllMembersForExport();
    
    // Create CSV content headers
    const headers = [
      'ID', 'Name', 'Phone', 'Date of Birth', 'Whatsapp Number', 'Email', 'Gender',
      'Joined HGBC', 'Age-Range', 'Born Again', 'Baptized By Immersion', 'Baptist from Home',
      'Home Church Name', 'Salvation Experience', 'Home Address', 'Marital Status',
      'Guardian Name', 'Guardian Phone', 'Guardian Relationship', 'Guardian Location',
      'LAUTECH Student', 'Current Level', 'Hostel Address', 'Faculty', 'Discipleship Completed',
      'Department', 'Comments', 'Submitted At'
    ];

    let csvContent = headers.join(',') + '\n';

    rows.forEach(m => {
      const parsedDiscipleship = Array.isArray(m.discipleship_done) ? m.discipleship_done.join('; ') : '';

      const row = [
        m.id,
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${m.phone || ''}"`,
        `"${m.dob || ''}"`,
        `"${m.whatsapp || ''}"`,
        `"${m.email || ''}"`,
        `"${m.gender || ''}"`,
        `"${m.joined_hgbc || ''}"`,
        `"${m.age_range || ''}"`,
        `"${m.born_again || ''}"`,
        `"${m.baptized || ''}"`,
        `"${m.baptist_from_home || ''}"`,
        `"${(m.home_church || '').replace(/"/g, '""')}"`,
        `"${(m.salvation_xp || '').replace(/"/g, '""')}"`,
        `"${(m.home_address || '').replace(/"/g, '""')}"`,
        `"${m.marital_status || ''}"`,
        `"${(m.guardian_name || '').replace(/"/g, '""')}"`,
        `"${m.guardian_phone || ''}"`,
        `"${m.guardian_rel || ''}"`,
        `"${(m.guardian_loc || '').replace(/"/g, '""')}"`,
        `"${m.lautech_student || ''}"`,
        `"${m.current_level || ''}"`,
        `"${(m.hostel_address || '').replace(/"/g, '""')}"`,
        `"${m.lautech_faculty || ''}"`,
        `"${parsedDiscipleship.replace(/"/g, '""')}"`,
        `"${(m.lautech_dept || '').replace(/"/g, '""')}"`,
        `"${(m.comments || '').replace(/"/g, '""')}"`,
        `"${m.submitted_at || ''}"`
      ];

      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hgbc_members_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Server error generating CSV.' });
  }
});

// Get Single Member Profile
app.get('/api/members/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const member = await db.getMemberById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Get single member error:', error);
    res.status(500).json({ error: 'Server error retrieving member profile.' });
  }
});

// Update Member Profile
app.put('/api/members/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!data.name || !data.phone) {
    return res.status(400).json({ error: 'Name and Phone number are required.' });
  }

  try {
    const existing = await db.getMemberById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Verify email uniqueness if being changed
    if (data.email && data.email.toLowerCase() !== (existing.email || '').toLowerCase()) {
      const duplicate = await db.getMemberByEmail(data.email);
      if (duplicate) {
        return res.status(400).json({ error: 'Another member already has this email address.' });
      }
    }

    const updated = await db.updateMember(id, data);
    res.json({ message: 'Member profile updated successfully!', member: updated });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Server error updating member details.' });
  }
});

// Delete Member Profile
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.deleteMember(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member profile deleted successfully!' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Server error deleting member profile.' });
  }
});

// ----------------- DASHBOARD ANALYTICS STATS ROUTE -----------------

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats aggregation error:', error);
    res.status(500).json({ error: 'Server error aggregating statistics.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`HGBC Membership Server running on port ${PORT}`);
});
