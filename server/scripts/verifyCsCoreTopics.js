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
import { getCSCoreTopics } from '../src/controllers/csCoreController.js';
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

const runCsCoreTopicsVerification = async () => {
  console.log('[CsCoreTopicsTest] Starting Phase 3 Step 23 Backend CS Core Topics API Verification...');
  const createdIds = { users: [], topics: [] };

  try {
    await connectDB();
    console.log('[CsCoreTopicsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create accounts
    const student1 = await User.create({ name: 'CS Topics S1', email: `cs-topics-s1-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'CS Topics Admin', email: `cs-topics-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
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

    console.log('[CsCoreTopicsTest] Creating test topics...');
    
    // Create Topics (CS Core DBMS, CS Core OS, DSA, Aptitude)
    const topicDBMS1 = await Topic.create({ category: 'cs_core', subject: 'DBMS', title: 'Normalization', slug: `norm-cs-${Date.now()}`, order: 1002 });
    const topicDBMS2 = await Topic.create({ category: 'cs_core', subject: 'DBMS', title: 'ACID', slug: `acid-cs-${Date.now()}`, order: 1001 });
    const topicOS = await Topic.create({ category: 'cs_core', subject: 'OS', title: 'Paging', slug: `paging-cs-${Date.now()}`, order: 1003 });
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'DBMS', title: 'Two Pointers', slug: `tp-cs-${Date.now()}`, order: 1004 });
    const topicApt = await Topic.create({ category: 'aptitude', subject: 'DBMS', title: 'Percentages', slug: `perc-cs-${Date.now()}`, order: 1005 });
    
    createdIds.topics.push(topicDBMS1._id, topicDBMS2._id, topicOS._id, topicDSA._id, topicApt._id);
    console.log('[CsCoreTopicsTest] Created test documents.');

    // A/B/C. Authentication
    console.log('[CsCoreTopicsTest] Testing Authentication...');
    let { req: r, res: rs } = createMockReqRes({}, {}, {}, { subjectId: 'DBMS' });
    await simulateRoute(getCSCoreTopics, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for missing token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, {}, {}, { subjectId: 'DBMS' }));
    await simulateRoute(getCSCoreTopics, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for invalid token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { subjectId: 'DBMS' }));
    await simulateRoute(getCSCoreTopics, r, rs);
    if (rs.statusCode !== 403) throw new Error('Expected 403 for Admin');
    console.log('[CsCoreTopicsTest] PASS: Auth/RBAC working correctly.');

    // E. Malformed subjectId (empty or undefined somehow, though Express handles it, testing the validation line)
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, {}, { subjectId: '' }));
    await simulateRoute(getCSCoreTopics, r, rs);
    if (rs.statusCode !== 400) throw new Error('Expected 400 for empty subjectId');
    console.log('[CsCoreTopicsTest] PASS: Malformed subjectId returns 400.');

    // F/G/H/I/J. Valid student fetching CS Core topics
    console.log('[CsCoreTopicsTest] Testing valid student fetching CS Core topics for DBMS...');
    
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, {}, { subjectId: 'DBMS' }));
    await simulateRoute(getCSCoreTopics, r, rs);
    
    if (rs.statusCode !== 200 || !rs.body.success) {
      throw new Error(`Expected 200 success, got ${rs.statusCode}`);
    }

    const data = rs.body.data;
    if (!Array.isArray(data)) throw new Error('Expected data to be an array');
    
    // Check that we found our DBMS CS Core topics
    const dbms1Idx = data.findIndex(t => t._id.toString() === topicDBMS1._id.toString());
    const dbms2Idx = data.findIndex(t => t._id.toString() === topicDBMS2._id.toString());
    
    if (dbms1Idx === -1 || dbms2Idx === -1) {
      throw new Error('CS Core DBMS topics were not returned!');
    }
    
    // Check ordering (order 1001 should be before 1002)
    if (dbms2Idx > dbms1Idx) {
      throw new Error('Ordering failed: expected topic with order 1001 to appear before 1002');
    }
    
    // Check filtering (should NOT contain OS, DSA, or Aptitude topics even if they share subject="DBMS")
    const hasOS = data.some(t => t._id.toString() === topicOS._id.toString());
    const hasDsa = data.some(t => t._id.toString() === topicDSA._id.toString());
    const hasApt = data.some(t => t._id.toString() === topicApt._id.toString());
    if (hasOS) throw new Error('Topics from a different subject (OS) were wrongly included');
    if (hasDsa) throw new Error('DSA topics were wrongly included in CS Core response');
    if (hasApt) throw new Error('Aptitude topics were wrongly included in CS Core response');
    
    // Check response safety (M)
    const sample = data[dbms1Idx];
    if (sample.__v !== undefined) throw new Error('Internal __v field was exposed');
    
    console.log('[CsCoreTopicsTest] PASS: Filtering by category/subject, Ordering, and Isolation working correctly.');
    console.log('[CsCoreTopicsTest] PASS: Safe response data confirmed.');

    // K. Empty Topic List
    console.log('[CsCoreTopicsTest] Testing empty topic list...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, {}, { subjectId: 'NonExistentSubject123' }));
    await simulateRoute(getCSCoreTopics, r, rs);
    if (rs.statusCode !== 200 || !Array.isArray(rs.body.data) || rs.body.data.length !== 0) {
      throw new Error('Expected empty array for non-existent subject');
    }
    console.log('[CsCoreTopicsTest] PASS: Empty topic list handled safely.');

    // L. User ID Injection
    console.log('[CsCoreTopicsTest] Testing UserId injection...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { userId: 'injected_id' }, { subjectId: 'DBMS' }));
    await simulateRoute(getCSCoreTopics, r, rs);
    if (rs.statusCode !== 200) throw new Error('Failed to handle userId injection request properly');
    console.log('[CsCoreTopicsTest] PASS: UserId injection ignored safely.');

    console.log('[CsCoreTopicsTest] === BACKEND CS CORE TOPICS VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[CsCoreTopicsTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[CsCoreTopicsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[CsCoreTopicsTest] Cleanup complete.');
  }
};

runCsCoreTopicsVerification();
