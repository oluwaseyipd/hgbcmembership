import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize PostgreSQL pool connection
// Support standard Render DATABASE_URL or individual fallback configurations
const poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  poolConfig.ssl = { rejectUnauthorized: false };
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = parseInt(process.env.DB_PORT, 10) || 5432;
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'hgbcmembership';
  poolConfig.ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
}

const pool = new pg.Pool(poolConfig);


// Initialize database tables and seed if necessary
async function initDb() {
  try {
    // 1. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        dob VARCHAR(50) NULL,
        whatsapp VARCHAR(50) NULL,
        email VARCHAR(255) UNIQUE NULL,
        gender VARCHAR(20) NULL,
        joined_hgbc VARCHAR(50) NULL,
        age_range VARCHAR(50) NULL,
        born_again VARCHAR(20) NULL,
        baptized VARCHAR(20) NULL,
        baptist_from_home VARCHAR(20) NULL,
        home_church VARCHAR(255) NULL,
        salvation_xp TEXT NULL,
        home_address TEXT NULL,
        marital_status VARCHAR(20) NULL,
        guardian_name VARCHAR(255) NULL,
        guardian_phone VARCHAR(50) NULL,
        guardian_rel VARCHAR(100) NULL,
        guardian_loc VARCHAR(255) NULL,
        lautech_student VARCHAR(10) DEFAULT 'No',
        current_level VARCHAR(50) DEFAULT 'Not Applicable',
        hostel_address TEXT NULL,
        lautech_faculty VARCHAR(255) NULL,
        lautech_dept VARCHAR(255) NULL,
        discipleship_done TEXT NULL,
        comments TEXT NULL,
        submitted_at VARCHAR(100) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified/created successfully.');

    // 2. Seed default admin if empty
    const { rows: userRows } = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userRows[0].count, 10);

    if (userCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@hgbc.org';
      const adminPassword = process.env.ADMIN_PASSWORD || 'hgbcadmin123';
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, 'admin']
      );
      console.log('Seeded default admin user in PostgreSQL database:', adminEmail);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Trigger initial setup
initDb().catch(err => {
  console.error('CRITICAL: Failed to initialize PostgreSQL Database connection:', err);
});

// DB Queries interface
export const db = {
  // Authentication
  getUserByEmail: async (email) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length === 0) return null;
    return rows[0];
  },

  // Members CRUD
  getMemberById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const m = rows[0];
    let discipleship_done = [];
    try {
      if (m.discipleship_done) {
        discipleship_done = JSON.parse(m.discipleship_done);
      }
    } catch (e) {}
    return { ...m, discipleship_done };
  },

  getMemberByEmail: async (email) => {
    if (!email) return null;
    const { rows } = await pool.query('SELECT * FROM members WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length === 0) return null;
    const m = rows[0];
    let discipleship_done = [];
    try {
      if (m.discipleship_done) {
        discipleship_done = JSON.parse(m.discipleship_done);
      }
    } catch (e) {}
    return { ...m, discipleship_done };
  },

  addMember: async (data) => {
    const discipleshipStr = Array.isArray(data.discipleship_done) ? JSON.stringify(data.discipleship_done) : '[]';
    const { rows } = await pool.query(
      `INSERT INTO members (
        name, phone, dob, whatsapp, email, gender, joined_hgbc, age_range, born_again,
        baptized, baptist_from_home, home_church, salvation_xp, home_address, marital_status,
        guardian_name, guardian_phone, guardian_rel, guardian_loc, lautech_student, current_level,
        hostel_address, lautech_faculty, discipleship_done, lautech_dept, comments, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) RETURNING id`,
      [
        data.name, data.phone, data.dob || '', data.whatsapp || '', data.email || null, data.gender || '', data.joined_hgbc || '', data.age_range || '', data.born_again || '',
        data.baptized || '', data.baptist_from_home || '', data.home_church || '', data.salvation_xp || '', data.home_address || '', data.marital_status || '',
        data.guardian_name || '', data.guardian_phone || '', data.guardian_rel || '', data.guardian_loc || '', data.lautech_student || 'No', data.current_level || 'Not Applicable',
        data.hostel_address || '', data.lautech_faculty || '', discipleshipStr, data.lautech_dept || '', data.comments || '', new Date().toISOString()
      ]
    );
    const insertId = rows[0].id;
    return { id: insertId, ...data };
  },

  updateMember: async (id, data) => {
    const { rows: existingRows } = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    if (existingRows.length === 0) return null;
    const existing = existingRows[0];

    const discipleshipStr = Array.isArray(data.discipleship_done) 
      ? JSON.stringify(data.discipleship_done) 
      : (data.discipleship_done ?? existing.discipleship_done);

    await pool.query(
      `UPDATE members SET
        name = $1, phone = $2, dob = $3, whatsapp = $4, email = $5, gender = $6, joined_hgbc = $7, age_range = $8, born_again = $9,
        baptized = $10, baptist_from_home = $11, home_church = $12, salvation_xp = $13, home_address = $14, marital_status = $15,
        guardian_name = $16, guardian_phone = $17, guardian_rel = $18, guardian_loc = $19, lautech_student = $20, current_level = $21,
        hostel_address = $22, lautech_faculty = $23, discipleship_done = $24, lautech_dept = $25, comments = $26, updated_at = CURRENT_TIMESTAMP
      WHERE id = $27`,
      [
        data.name ?? existing.name,
        data.phone ?? existing.phone,
        data.dob ?? existing.dob,
        data.whatsapp ?? existing.whatsapp,
        data.email ?? existing.email,
        data.gender ?? existing.gender,
        data.joined_hgbc ?? existing.joined_hgbc,
        data.age_range ?? existing.age_range,
        data.born_again ?? existing.born_again,
        data.baptized ?? existing.baptized,
        data.baptist_from_home ?? existing.baptist_from_home,
        data.home_church ?? existing.home_church,
        data.salvation_xp ?? existing.salvation_xp,
        data.home_address ?? existing.home_address,
        data.marital_status ?? existing.marital_status,
        data.guardian_name ?? existing.guardian_name,
        data.guardian_phone ?? existing.guardian_phone,
        data.guardian_rel ?? existing.guardian_rel,
        data.guardian_loc ?? existing.guardian_loc,
        data.lautech_student ?? existing.lautech_student,
        data.current_level ?? existing.current_level,
        data.hostel_address ?? existing.hostel_address,
        data.lautech_faculty ?? existing.lautech_faculty,
        discipleshipStr,
        data.lautech_dept ?? existing.lautech_dept,
        data.comments ?? existing.comments,
        id
      ]
    );

    const { rows: updatedRows } = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    const m = updatedRows[0];
    let discipleship_done = [];
    try {
      if (m.discipleship_done) {
        discipleship_done = JSON.parse(m.discipleship_done);
      }
    } catch (e) {}
    return { ...m, discipleship_done };
  },

  deleteMember: async (id) => {
    const result = await pool.query('DELETE FROM members WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  getAllMembersForExport: async () => {
    const { rows } = await pool.query('SELECT * FROM members ORDER BY name ASC');
    return rows.map(r => {
      let discipleship_done = [];
      try {
        if (r.discipleship_done) {
          discipleship_done = JSON.parse(r.discipleship_done);
        }
      } catch (e) {}
      return { ...r, discipleship_done };
    });
  },

  getMembersList: async (filters = {}) => {
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // 1. Searching
    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      query += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(email) LIKE LOWER($${paramIndex + 1}) OR phone LIKE $${paramIndex + 2})`;
      params.push(searchVal, searchVal, searchVal);
      paramIndex += 3;
    }

    // 2. Filtering
    if (filters.gender) {
      query += ` AND gender = $${paramIndex++}`;
      params.push(filters.gender);
    }
    if (filters.ageRange) {
      query += ` AND age_range = $${paramIndex++}`;
      params.push(filters.ageRange);
    }
    if (filters.bornAgain) {
      query += ` AND born_again = $${paramIndex++}`;
      params.push(filters.bornAgain);
    }
    if (filters.lautechStudent) {
      query += ` AND lautech_student = $${paramIndex++}`;
      params.push(filters.lautechStudent);
    }
    if (filters.faculty) {
      query += ` AND lautech_faculty = $${paramIndex++}`;
      params.push(filters.faculty);
    }
    if (filters.maritalStatus) {
      query += ` AND marital_status = $${paramIndex++}`;
      params.push(filters.maritalStatus);
    }

    // 3. Sorting
    const allowedSortBy = [
      'id', 'name', 'phone', 'dob', 'whatsapp', 'email', 'gender', 'joined_hgbc', 'age_range', 'born_again',
      'baptized', 'baptist_from_home', 'home_church', 'marital_status', 'lautech_student', 'current_level',
      'lautech_faculty', 'lautech_dept', 'submitted_at'
    ];
    let sortBy = filters.sortBy || 'name';
    if (!allowedSortBy.includes(sortBy)) {
      sortBy = 'name';
    }
    const order = filters.order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortBy} ${order}`;

    // Get total count first for pagination metadata
    let countQuery = 'SELECT COUNT(*) as total FROM members WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;
    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      countQuery += ` AND (LOWER(name) LIKE LOWER($${countParamIndex}) OR LOWER(email) LIKE LOWER($${countParamIndex + 1}) OR phone LIKE $${countParamIndex + 2})`;
      countParams.push(searchVal, searchVal, searchVal);
      countParamIndex += 3;
    }
    if (filters.gender) {
      countQuery += ` AND gender = $${countParamIndex++}`;
      countParams.push(filters.gender);
    }
    if (filters.ageRange) {
      countQuery += ` AND age_range = $${countParamIndex++}`;
      countParams.push(filters.ageRange);
    }
    if (filters.bornAgain) {
      countQuery += ` AND born_again = $${countParamIndex++}`;
      countParams.push(filters.bornAgain);
    }
    if (filters.lautechStudent) {
      countQuery += ` AND lautech_student = $${countParamIndex++}`;
      countParams.push(filters.lautechStudent);
    }
    if (filters.faculty) {
      countQuery += ` AND lautech_faculty = $${countParamIndex++}`;
      countParams.push(filters.faculty);
    }
    if (filters.maritalStatus) {
      countQuery += ` AND marital_status = $${countParamIndex++}`;
      countParams.push(filters.maritalStatus);
    }

    const { rows: countResult } = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult[0].total, 10);

    // 4. Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, startIndex);

    const { rows } = await pool.query(query, params);

    // Parse discipleship_done
    const members = rows.map(r => {
      let discipleship_done = [];
      try {
        if (r.discipleship_done) {
          discipleship_done = JSON.parse(r.discipleship_done);
        }
      } catch (e) {
        if (typeof r.discipleship_done === 'string') {
          discipleship_done = r.discipleship_done.split(';').map(x => x.trim()).filter(Boolean);
        }
      }
      return {
        ...r,
        discipleship_done
      };
    });

    return {
      members,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages,
        limit
      }
    };
  },

  getStats: async () => {
    const { rows: members } = await pool.query('SELECT * FROM members');
    
    // Parse discipleship_done for stats processing
    const parsedMembers = members.map(m => {
      let discipleship_done = [];
      try {
        if (m.discipleship_done) {
          discipleship_done = JSON.parse(m.discipleship_done);
        }
      } catch (e) {}
      return { ...m, discipleship_done };
    });

    const totalMembers = parsedMembers.length;

    // Gender stats
    const genderCounts = {};
    parsedMembers.forEach(m => {
      const g = m.gender || 'Unknown';
      genderCounts[g] = (genderCounts[g] || 0) + 1;
    });
    const gender = Object.keys(genderCounts).map(g => ({ gender: g, count: genderCounts[g] }));

    // Age-Range stats
    const ageCounts = {};
    parsedMembers.forEach(m => {
      const ar = m.age_range || 'Unknown';
      ageCounts[ar] = (ageCounts[ar] || 0) + 1;
    });
    const ageRange = Object.keys(ageCounts).map(ar => ({ age_range: ar, count: ageCounts[ar] }));

    // LAUTECH student stats
    const studentCounts = {};
    parsedMembers.forEach(m => {
      const s = m.lautech_student || 'No';
      studentCounts[s] = (studentCounts[s] || 0) + 1;
    });
    const lautechStudent = Object.keys(studentCounts).map(s => ({ lautech_student: s, count: studentCounts[s] }));

    // Marital Status stats
    const maritalCounts = {};
    parsedMembers.forEach(m => {
      const ms = m.marital_status || 'Unknown';
      maritalCounts[ms] = (maritalCounts[ms] || 0) + 1;
    });
    const maritalStatus = Object.keys(maritalCounts).map(ms => ({ marital_status: ms, count: maritalCounts[ms] }));

    // Born-Again stats
    const bornAgainCounts = {};
    parsedMembers.forEach(m => {
      const ba = m.born_again || 'No';
      bornAgainCounts[ba] = (bornAgainCounts[ba] || 0) + 1;
    });
    const bornAgain = Object.keys(bornAgainCounts).map(ba => ({ born_again: ba, count: bornAgainCounts[ba] }));

    // Faculty stats
    const facultyCounts = {};
    parsedMembers.forEach(m => {
      if (m.lautech_student === 'Yes' && m.lautech_faculty) {
        facultyCounts[m.lautech_faculty] = (facultyCounts[m.lautech_faculty] || 0) + 1;
      }
    });
    const faculty = Object.keys(facultyCounts).map(f => ({ lautech_faculty: f, count: facultyCounts[f] }));

    // Level stats
    const levelCounts = {};
    parsedMembers.forEach(m => {
      if (m.lautech_student === 'Yes' && m.current_level && m.current_level !== 'Not Applicable') {
        levelCounts[m.current_level] = (levelCounts[m.current_level] || 0) + 1;
      }
    });
    const currentLevel = Object.keys(levelCounts).map(l => ({ current_level: l, count: levelCounts[l] }));

    // Discipleship stats
    const discipleshipCounts = {};
    parsedMembers.forEach(m => {
      if (Array.isArray(m.discipleship_done)) {
        m.discipleship_done.forEach(d => {
          discipleshipCounts[d] = (discipleshipCounts[d] || 0) + 1;
        });
      }
    });
    const discipleship = Object.keys(discipleshipCounts).map(d => ({ name: d, count: discipleshipCounts[d] }));

    // Monthly registrations trend
    const monthlyTrend = {};
    parsedMembers.forEach(m => {
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
