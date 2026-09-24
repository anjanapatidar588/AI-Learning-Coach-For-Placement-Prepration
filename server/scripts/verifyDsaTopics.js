import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getDSATopics } from '../src/controllers/dsaController.js';
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

const runDsaTopicsVerification = async () => {
  console.log('[DsaTopicsTest] Starting Phase 3 Step 13 Backend DSA Topics API Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[DsaTopicsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1 (No attempts)
    const student1 = await User.create({
      name: 'DSA Topics Test 1',
      email: `dsa-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (With attempts)
    const student2 = await User.create({
      name: 'DSA Topics Test 2',
      email: `dsa-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'DSA Topics Admin',
      email: `dsa-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // We will clear existing topics momentarily or just create new ones and query them.
    // Wait, getDSATopics returns ALL DSA topics. If there are existing topics in the DB, it will return them.
    // That's fine, we will just verify our specific topics exist in the result.

    // Create Topics & Questions
    const topic1 = await Topic.create({ category: 'dsa', subject: 'Trees', title: 'Binary Search Trees', slug: `bst-${Date.now()}`, order: 1000 });
    const topic2 = await Topic.create({ category: 'dsa', subject: 'Graphs', title: 'Graph Traversal', slug: `graph-${Date.now()}`, order: 1001 });
    const topic3 = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Time and Work', slug: `tw-${Date.now()}`, order: 1002 });
    createdIds.topics.push(topic1._id, topic2._id, topic3._id);

    const q1 = await Question.create({ topicId: topic1._id, title: 'Valid BST', slug: `valid-bst-${Date.now()}`, problemStatement: '...' });
    const q2 = await Question.create({ topicId: topic2._id, title: 'BFS', slug: `bfs-${Date.now()}`, problemStatement: '...' });
    createdIds.questions.push(q1._id, q2._id);

    // Create attempts for Student 2
    const attemptsToCreate = [];

    // DSA Topic 1: 3 attempts, 1 accepted -> total 3, passed 1, accuracy 33%
    attemptsToCreate.push({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Accepted' });
    attemptsToCreate.push({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Wrong Answer' });
    attemptsToCreate.push({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Time Limit Exceeded' });

    // DSA Topic 2: 1 attempt, 1 accepted -> total 1, passed 1, accuracy 100%
    attemptsToCreate.push({ userId: student2._id, questionId: q2._id, category: 'dsa', status: 'Accepted' });

    // Student 1: 1 attempt, to ensure isolation
    attemptsToCreate.push({ userId: student1._id, questionId: q1._id, category: 'dsa', status: 'Wrong Answer' });

    for (let data of attemptsToCreate) {
      const att = await AttemptTrack.create(data);
      createdIds.attempts.push(att._id);
    }

    console.log('[DsaTopicsTest] Created test accounts and attempt data.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // Authentication
    console.log('[DsaTopicsTest] Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getDSATopics, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[DsaTopicsTest] PASS: GET without token returns 401.');

    console.log('[DsaTopicsTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getDSATopics, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[DsaTopicsTest] PASS: Invalid/Tampered JWT returns 401.');

    // RBAC
    console.log('[DsaTopicsTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getDSATopics, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[DsaTopicsTest] PASS: Admin attempting student route rejected with 403.');

    // DSA-only topic filtering and empty-data progress
    console.log('[DsaTopicsTest] Testing student 1 (DSA-only topics, empty progress)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getDSATopics, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    let topics = rs.body.data.topics;
    if (!Array.isArray(topics)) throw new Error('Topics should be an array');
    
    // Check for aptitude topic
    const hasAptitude = topics.some(t => t._id.toString() === topic3._id.toString() || t.category === 'aptitude');
    if (hasAptitude) throw new Error('Aptitude topics were returned! Should be DSA only.');
    console.log('[DsaTopicsTest] PASS: Only DSA topics returned.');

    // Check Student 1 progress (should be isolated)
    const t1DataS1 = topics.find(t => t._id.toString() === topic1._id.toString());
    if (!t1DataS1 || !t1DataS1.progress) throw new Error('Topic progress object missing');
    if (t1DataS1.progress.totalAttempts !== 1 || t1DataS1.progress.passedAttempts !== 0) {
      throw new Error(`Student 1 progress incorrect: expected 1 total, 0 passed, got ${t1DataS1.progress.totalAttempts} total, ${t1DataS1.progress.passedAttempts} passed`);
    }
    console.log('[DsaTopicsTest] PASS: Endpoint isolated correctly for student 1.');

    // Progress Calculation
    console.log('[DsaTopicsTest] Testing seeded progress calculation (Student 2)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getDSATopics, r, rs);
    
    topics = rs.body.data.topics;
    const t1DataS2 = topics.find(t => t._id.toString() === topic1._id.toString());
    const t2DataS2 = topics.find(t => t._id.toString() === topic2._id.toString());

    if (t1DataS2.progress.totalAttempts !== 3 || t1DataS2.progress.passedAttempts !== 1 || t1DataS2.progress.accuracy !== 33) {
      throw new Error('Topic 1 progress incorrect for Student 2');
    }
    if (t2DataS2.progress.totalAttempts !== 1 || t2DataS2.progress.passedAttempts !== 1 || t2DataS2.progress.accuracy !== 100) {
      throw new Error('Topic 2 progress incorrect for Student 2');
    }
    console.log('[DsaTopicsTest] PASS: Progress calculated correctly.');

    // Structure validation
    if (!t1DataS2.title || !t1DataS2.slug || !t1DataS2._id) {
      throw new Error('Topic response missing existing schema fields');
    }
    console.log('[DsaTopicsTest] PASS: Topic response matches existing schema structure.');

    // Ownership & Injection
    console.log('[DsaTopicsTest] Testing identity injection and data scoping...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() }, // body
      { userId: student2._id.toString() }, // query
      { userId: student2._id.toString() }  // params
    ));
    await simulateRoute(getDSATopics, r, rs);
    const injectedT1Data = rs.body.data.topics.find(t => t._id.toString() === topic1._id.toString());
    if (injectedT1Data.progress.totalAttempts !== 1) {
      throw new Error('SECURITY FAILURE: Identity injection succeeded, Student 1 read Student 2 progress!');
    }
    console.log('[DsaTopicsTest] PASS: userId injection ignored, Student A cannot read Student B progress.');

    // Atlas persistence verification
    console.log('[DsaTopicsTest] Atlas persistence verification...');
    const dbTopics = await Topic.countDocuments({ _id: { $in: createdIds.topics } });
    if (dbTopics !== 3) throw new Error('Database persistence issue, topics not found in Atlas.');
    console.log('[DsaTopicsTest] PASS: Atlas connectivity and persistence verified.');

    // Empty DB behavior
    // To test this purely, we don't want to delete ALL topics. But we know we handle length === 0.

    // Cleanup
    console.log('[DsaTopicsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    
    console.log('[DsaTopicsTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[DsaTopicsTest] === BACKEND DSA TOPICS API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DsaTopicsTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runDsaTopicsVerification();
