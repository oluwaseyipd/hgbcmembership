import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const membersFile = path.resolve(__dirname, 'members.json');
const usersFile = path.resolve(__dirname, 'users.json');

// Initialize database files
function initDb() {
  if (!fs.existsSync(membersFile)) {
    fs.writeFileSync(membersFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }

  // Seed default admin if empty
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hgbc.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'hgbcadmin123';

  const existingAdmin = users.find(u => u.email === adminEmail);
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    users.push({
      id: 1,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      created_at: new Date().toISOString()
    });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('Seeded default admin user in JSON database:', adminEmail);
  }
}

// Helper to read/write members
function readMembers() {
  try {
    return JSON.parse(fs.readFileSync(membersFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeMembers(data) {
  fs.writeFileSync(membersFile, JSON.stringify(data, null, 2));
}

// Helper to read/write users
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// Initialize on start
initDb();

// DB Queries interface
export const db = {
  // Authentication
  getUserByEmail: async (email) => {
    const users = readUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Members CRUD
  getMemberById: async (id) => {
    const members = readMembers();
    return members.find(m => m.id === parseInt(id));
  },

  getMemberByEmail: async (email) => {
    if (!email) return null;
    const members = readMembers();
    return members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
  },

  addMember: async (data) => {
    const members = readMembers();
    const nextId = members.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;
    
    const newMember = {
      id: nextId,
      name: data.name,
      phone: data.phone,
      dob: data.dob || '',
      whatsapp: data.whatsapp || '',
      email: data.email || null,
      gender: data.gender || '',
      joined_hgbc: data.joined_hgbc || '',
      age_range: data.age_range || '',
      born_again: data.born_again || '',
      baptized: data.baptized || '',
      baptist_from_home: data.baptist_from_home || '',
      home_church: data.home_church || '',
      salvation_xp: data.salvation_xp || '',
      home_address: data.home_address || '',
      marital_status: data.marital_status || '',
      guardian_name: data.guardian_name || '',
      guardian_phone: data.guardian_phone || '',
      guardian_rel: data.guardian_rel || '',
      guardian_loc: data.guardian_loc || '',
      lautech_student: data.lautech_student || 'No',
      current_level: data.current_level || 'Not Applicable',
      hostel_address: data.hostel_address || '',
      lautech_faculty: data.lautech_faculty || '',
      discipleship_done: Array.isArray(data.discipleship_done) ? data.discipleship_done : [],
      lautech_dept: data.lautech_dept || '',
      comments: data.comments || '',
      submitted_at: new Date().toISOString()
    };

    members.push(newMember);
    writeMembers(members);
    return newMember;
  },

  updateMember: async (id, data) => {
    const members = readMembers();
    const index = members.findIndex(m => m.id === parseInt(id));
    if (index === -1) return null;

    const existing = members[index];
    const updatedMember = {
      ...existing,
      name: data.name ?? existing.name,
      phone: data.phone ?? existing.phone,
      dob: data.dob ?? existing.dob,
      whatsapp: data.whatsapp ?? existing.whatsapp,
      email: data.email ?? existing.email,
      gender: data.gender ?? existing.gender,
      joined_hgbc: data.joined_hgbc ?? existing.joined_hgbc,
      age_range: data.age_range ?? existing.age_range,
      born_again: data.born_again ?? existing.born_again,
      baptized: data.baptized ?? existing.baptized,
      baptist_from_home: data.baptist_from_home ?? existing.baptist_from_home,
      home_church: data.home_church ?? existing.home_church,
      salvation_xp: data.salvation_xp ?? existing.salvation_xp,
      home_address: data.home_address ?? existing.home_address,
      marital_status: data.marital_status ?? existing.marital_status,
      guardian_name: data.guardian_name ?? existing.guardian_name,
      guardian_phone: data.guardian_phone ?? existing.guardian_phone,
      guardian_rel: data.guardian_rel ?? existing.guardian_rel,
      guardian_loc: data.guardian_loc ?? existing.guardian_loc,
      lautech_student: data.lautech_student ?? existing.lautech_student,
      current_level: data.current_level ?? existing.current_level,
      hostel_address: data.hostel_address ?? existing.hostel_address,
      lautech_faculty: data.lautech_faculty ?? existing.lautech_faculty,
      discipleship_done: Array.isArray(data.discipleship_done) ? data.discipleship_done : existing.discipleship_done,
      lautech_dept: data.lautech_dept ?? existing.lautech_dept,
      comments: data.comments ?? existing.comments,
      updated_at: new Date().toISOString()
    };

    members[index] = updatedMember;
    writeMembers(members);
    return updatedMember;
  },

  deleteMember: async (id) => {
    const members = readMembers();
    const index = members.findIndex(m => m.id === parseInt(id));
    if (index === -1) return false;

    members.splice(index, 1);
    writeMembers(members);
    return true;
  },

  getAllMembersForExport: async () => {
    return readMembers();
  },

  getMembersList: async (filters = {}) => {
    let members = readMembers();

    // 1. Searching
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      members = members.filter(m => 
        (m.name && m.name.toLowerCase().includes(searchLower)) ||
        (m.email && m.email.toLowerCase().includes(searchLower)) ||
        (m.phone && m.phone.includes(searchLower))
      );
    }

    // 2. Filtering
    if (filters.gender) {
      members = members.filter(m => m.gender === filters.gender);
    }
    if (filters.ageRange) {
      members = members.filter(m => m.age_range === filters.ageRange);
    }
    if (filters.bornAgain) {
      members = members.filter(m => m.born_again === filters.bornAgain);
    }
    if (filters.lautechStudent) {
      members = members.filter(m => m.lautech_student === filters.lautechStudent);
    }
    if (filters.faculty) {
      members = members.filter(m => m.lautech_faculty === filters.faculty);
    }
    if (filters.maritalStatus) {
      members = members.filter(m => m.marital_status === filters.maritalStatus);
    }

    // 3. Sorting
    const sortBy = filters.sortBy || 'name';
    const isDesc = filters.order === 'desc';
    
    members.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });

    // 4. Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const totalItems = members.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedMembers = members.slice(startIndex, startIndex + limit);

    return {
      members: paginatedMembers,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages,
        limit
      }
    };
  },

  getStats: async () => {
    const members = readMembers();
    const totalMembers = members.length;

    // Gender stats
    const genderCounts = {};
    members.forEach(m => {
      const g = m.gender || 'Unknown';
      genderCounts[g] = (genderCounts[g] || 0) + 1;
    });
    const gender = Object.keys(genderCounts).map(g => ({ gender: g, count: genderCounts[g] }));

    // Age-Range stats
    const ageCounts = {};
    members.forEach(m => {
      const ar = m.age_range || 'Unknown';
      ageCounts[ar] = (ageCounts[ar] || 0) + 1;
    });
    const ageRange = Object.keys(ageCounts).map(ar => ({ age_range: ar, count: ageCounts[ar] }));

    // LAUTECH student stats
    const studentCounts = {};
    members.forEach(m => {
      const s = m.lautech_student || 'No';
      studentCounts[s] = (studentCounts[s] || 0) + 1;
    });
    const lautechStudent = Object.keys(studentCounts).map(s => ({ lautech_student: s, count: studentCounts[s] }));

    // Marital Status stats
    const maritalCounts = {};
    members.forEach(m => {
      const ms = m.marital_status || 'Unknown';
      maritalCounts[ms] = (maritalCounts[ms] || 0) + 1;
    });
    const maritalStatus = Object.keys(maritalCounts).map(ms => ({ marital_status: ms, count: maritalCounts[ms] }));

    // Born-Again stats
    const bornAgainCounts = {};
    members.forEach(m => {
      const ba = m.born_again || 'No';
      bornAgainCounts[ba] = (bornAgainCounts[ba] || 0) + 1;
    });
    const bornAgain = Object.keys(bornAgainCounts).map(ba => ({ born_again: ba, count: bornAgainCounts[ba] }));

    // Faculty stats
    const facultyCounts = {};
    members.forEach(m => {
      if (m.lautech_student === 'Yes' && m.lautech_faculty) {
        facultyCounts[m.lautech_faculty] = (facultyCounts[m.lautech_faculty] || 0) + 1;
      }
    });
    const faculty = Object.keys(facultyCounts).map(f => ({ lautech_faculty: f, count: facultyCounts[f] }));

    // Level stats
    const levelCounts = {};
    members.forEach(m => {
      if (m.lautech_student === 'Yes' && m.current_level && m.current_level !== 'Not Applicable') {
        levelCounts[m.current_level] = (levelCounts[m.current_level] || 0) + 1;
      }
    });
    const currentLevel = Object.keys(levelCounts).map(l => ({ current_level: l, count: levelCounts[l] }));

    // Discipleship stats
    const discipleshipCounts = {};
    members.forEach(m => {
      if (Array.isArray(m.discipleship_done)) {
        m.discipleship_done.forEach(d => {
          discipleshipCounts[d] = (discipleshipCounts[d] || 0) + 1;
        });
      }
    });
    const discipleship = Object.keys(discipleshipCounts).map(d => ({ name: d, count: discipleshipCounts[d] }));

    // Monthly registrations trend
    const monthlyTrend = {};
    members.forEach(m => {
      if (m.submitted_at) {
        try {
          const date = new Date(m.submitted_at);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + 1;
        } catch (e) {}
      }
    });
    const trend = Object.keys(monthlyTrend).map(month => ({ month, count: monthlyTrend[month] }));

    return {
      totalMembers,
      gender,
      ageRange,
      lautechStudent,
      bornAgain,
      maritalStatus,
      faculty,
      currentLevel,
      discipleship,
      trend
    };
  }
};
