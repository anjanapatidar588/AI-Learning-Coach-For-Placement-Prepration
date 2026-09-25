import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getCompanies } from '../src/controllers/companyController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, query = {}, body = {}) => {
  const req = { headers, query, body };
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return { req, res };
};

const runMiddleware = (middleware, req, res) => {
  return new Promise((resolve) => {
    middleware(req, res, () => resolve(true));
    setTimeout(() => resolve(false), 10);
  });
};

const runCompaniesVerification = async () => {
  console.log('[CompaniesTest] Starting Phase 3 Step 26 Backend Companies API Verification...');
  const createdIds = { users: [], companies: [] };

  try {
    await connectDB();
    console.log('[CompaniesTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create accounts
    const student1 = await User.create({ name: 'Company S1', email: `company-s1-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'Company Admin', email: `company-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
    createdIds.users.push(student1._id, adminUser._id);
    
    const student1Token = generateToken({ id: student1._id, role: student1.role });
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A/B/C. Authentication
    console.log('[CompaniesTest] Testing Authentication...');
    let { req: r, res: rs } = createMockReqRes({}, {}, {});
    await simulateRoute(getCompanies, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for missing token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, {}, {}));
    await simulateRoute(getCompanies, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for invalid token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}));
    await simulateRoute(getCompanies, r, rs);
    if (rs.statusCode !== 403) throw new Error('Expected 403 for Admin');
    console.log('[CompaniesTest] PASS: Auth/RBAC working correctly.');

    // I. Empty Array handling
    console.log('[CompaniesTest] Testing Empty Companies State...');
    // Backup existing companies and delete them temporarily
    const existingCompanies = await Company.find({}).lean();
    if (existingCompanies.length > 0) {
      await Company.deleteMany({});
    }
    
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }));
    await simulateRoute(getCompanies, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success || !Array.isArray(rs.body.data) || rs.body.data.length !== 0) {
      throw new Error('Expected empty array for no companies');
    }
    console.log('[CompaniesTest] PASS: Empty state handles gracefully.');

    // Restore existing or create mock for tests
    if (existingCompanies.length > 0) {
      await Company.insertMany(existingCompanies);
    }

    console.log('[CompaniesTest] Creating test companies...');
    
    // Create Companies (C, B, A to test sorting)
    const compC = await Company.create({ name: 'Zebra Tech', cutoffBenchmark: 80, syllabus: ['A'] });
    const compB = await Company.create({ name: 'Mango Corp', cutoffBenchmark: 70, syllabus: ['B'] });
    const compA = await Company.create({ name: 'Apple Inc', cutoffBenchmark: 90, syllabus: ['C'] });
    
    createdIds.companies.push(compC._id, compB._id, compA._id);
    console.log('[CompaniesTest] Created test documents.');

    // C/D/E/F/G/H. Authenticated Fetching
    console.log('[CompaniesTest] Testing Data Fetching...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }));
    await simulateRoute(getCompanies, r, rs);

    if (rs.statusCode !== 200 || !rs.body.success) throw new Error('Expected 200 success');
    if (!Array.isArray(rs.body.data)) throw new Error('Data should be an array');
    
    const data = rs.body.data;
    const testCompanies = data.filter(c => createdIds.companies.map(id => id.toString()).includes(c._id.toString()));
    
    if (testCompanies.length !== 3) throw new Error('Failed to fetch test companies');
    
    // H. Ordering is deterministic (ascending by name)
    if (testCompanies[0].name !== 'Apple Inc') throw new Error('Ordering failed: expected Apple Inc first');
    if (testCompanies[1].name !== 'Mango Corp') throw new Error('Ordering failed: expected Mango Corp second');
    if (testCompanies[2].name !== 'Zebra Tech') throw new Error('Ordering failed: expected Zebra Tech third');
    
    // G. Expected safe fields
    const sample = testCompanies[0];
    if (!sample._id || !sample.name || sample.cutoffBenchmark === undefined) throw new Error('Missing expected fields');
    if (sample.__v !== undefined) throw new Error('Leaked __v field');
    
    console.log('[CompaniesTest] PASS: Fetching, sorting, and safe projection working correctly.');

    // J. Unexpected query parameters
    console.log('[CompaniesTest] Testing Unexpected Query Parameters...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, { name: { $ne: 'Apple Inc' } }));
    await simulateRoute(getCompanies, r, rs);
    const dataInjected = rs.body.data.filter(c => createdIds.companies.map(id => id.toString()).includes(c._id.toString()));
    if (dataInjected.length !== 3) throw new Error('Query parameter injection was evaluated by MongoDB!');
    console.log('[CompaniesTest] PASS: Query parameters safely ignored.');

    console.log('[CompaniesTest] === BACKEND COMPANIES API VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[CompaniesTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[CompaniesTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.companies) await Company.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[CompaniesTest] Cleanup complete.');
  }
};

runCompaniesVerification();
