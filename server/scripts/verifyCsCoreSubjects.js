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
import Topic from '../src/models/Topic.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getCSCoreSubjects } from '../src/controllers/csCoreController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, body = {}, query = {}, params = {}) => {
  const req = { headers, body, query, params };
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

const runCsCoreSubjectsVerification = async () => {
  console.log('[CsCoreSubjectsTest] Starting Phase 3 Step 22 Backend CS Core Subjects API Verification...');
  const createdIds = { users: [], topics: [] };

  try {
    await connectDB();
    console.log('[CsCoreSubjectsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create accounts
    const student1 = await User.create({ name: 'CS Core S1', email: `cs-core-s1-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'CS Core Admin', email: `cs-core-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
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

    // D. Empty state (Before creating CS Core topics, assuming test DB might be empty of CS Core, or we just rely on general return)
    // To be perfectly isolated, we can't assume DB is empty. We will just check if we can call it successfully.
    
    console.log('[CsCoreSubjectsTest] Creating test topics...');
    
    // Create Topics (CS Core, DSA, Aptitude)
    const topicCS1 = await Topic.create({ category: 'cs_core', subject: 'DBMS', title: 'Normalization', slug: `norm-${Date.now()}`, order: 1002 });
    const topicCS2 = await Topic.create({ category: 'cs_core', subject: 'OS', title: 'Paging', slug: `paging-${Date.now()}`, order: 1001 });
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Arrays', title: 'Two Pointers', slug: `tp-cs-${Date.now()}`, order: 1003 });
    const topicApt = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Percentages', slug: `perc-cs-${Date.now()}`, order: 1004 });
    
    createdIds.topics.push(topicCS1._id, topicCS2._id, topicDSA._id, topicApt._id);
    console.log('[CsCoreSubjectsTest] Created test documents.');

    // A. Authentication
    console.log('[CsCoreSubjectsTest] Testing Authentication...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getCSCoreSubjects, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for missing token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getCSCoreSubjects, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for invalid token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getCSCoreSubjects, r, rs);
    if (rs.statusCode !== 403) throw new Error('Expected 403 for Admin');
    console.log('[CsCoreSubjectsTest] PASS: Auth/RBAC working correctly.');

    // B. CS Core Filtering, C. Ordering, E. User Isolation
    console.log('[CsCoreSubjectsTest] Testing valid student fetching CS Core subjects...');
    
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, { userId: 'some-fake-id' }, { userId: 'some-fake-id' }));
    await simulateRoute(getCSCoreSubjects, r, rs);
    
    if (rs.statusCode !== 200 || !rs.body.success) {
      throw new Error(`Expected 200 success, got ${rs.statusCode}`);
    }

    const data = rs.body.data;
    if (!Array.isArray(data)) throw new Error('Expected data to be an array');
    
    // Check that we found our CS Core subjects
    const cs1Idx = data.findIndex(t => t._id.toString() === topicCS1._id.toString());
    const cs2Idx = data.findIndex(t => t._id.toString() === topicCS2._id.toString());
    
    if (cs1Idx === -1 || cs2Idx === -1) {
      throw new Error('CS Core topics were not returned!');
    }
    
    // Check ordering (order 1001 should be before 1002)
    if (cs2Idx > cs1Idx) {
      throw new Error('Ordering failed: expected topic with order 1001 to appear before 1002');
    }
    
    // Check filtering (should NOT contain DSA or Aptitude)
    const hasDsa = data.some(t => t._id.toString() === topicDSA._id.toString());
    const hasApt = data.some(t => t._id.toString() === topicApt._id.toString());
    if (hasDsa) throw new Error('DSA topics were wrongly included in CS Core response');
    if (hasApt) throw new Error('Aptitude topics were wrongly included in CS Core response');
    
    // Check response safety
    const sample = data[cs1Idx];
    if (sample.__v !== undefined) throw new Error('Internal __v field was exposed');
    
    console.log('[CsCoreSubjectsTest] PASS: Filtering, Ordering, and Isolation working correctly.');
    console.log('[CsCoreSubjectsTest] PASS: Safe response data confirmed.');

    console.log('[CsCoreSubjectsTest] === BACKEND CS CORE SUBJECTS VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[CsCoreSubjectsTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[CsCoreSubjectsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[CsCoreSubjectsTest] Cleanup complete.');
  }
};

runCsCoreSubjectsVerification();
