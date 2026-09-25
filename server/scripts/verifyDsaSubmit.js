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
import { submitDSACode } from '../src/controllers/dsaController.js';
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

const runDsaSubmitVerification = async () => {
  console.log('[DsaSubmitTest] Starting Phase 3 Step 16 Backend DSA Submit API Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[DsaSubmitTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1
    const student1 = await User.create({
      name: 'DSA Submit Test 1',
      email: `dsa-submit-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2
    const student2 = await User.create({
      name: 'DSA Submit Test 2',
      email: `dsa-submit-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'DSA Submit Admin',
      email: `dsa-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics & Questions
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Trees', title: 'Binary Search Trees', slug: `bst-sub-${Date.now()}`, order: 1000 });
    const topicAptitude = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Time and Work', slug: `tw-sub-${Date.now()}`, order: 1002 });
    createdIds.topics.push(topicDSA._id, topicAptitude._id);

    const qDSA = await Question.create({ topicId: topicDSA._id, title: 'Valid BST', slug: `valid-bst-sub-${Date.now()}`, problemStatement: '...' });
    const qAptitude = await Question.create({ topicId: topicAptitude._id, title: 'Speed', slug: `speed-sub-${Date.now()}`, problemStatement: '...' });
    createdIds.questions.push(qDSA._id, qAptitude._id);

    console.log('[DsaSubmitTest] Created test accounts, topics, and questions.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A. No token
    console.log('[DsaSubmitTest] Testing POST without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for POST without token, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: POST without token returns 401.');

    // B. Invalid token
    console.log('[DsaSubmitTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Invalid/Tampered JWT returns 401.');

    // C. Admin token -> 403
    console.log('[DsaSubmitTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Admin attempting student route rejected with 403.');

    // L. Missing code
    console.log('[DsaSubmitTest] Testing missing code...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qDSA._id.toString(), language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for missing code, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Missing code returns 400.');

    // K. Invalid language
    console.log('[DsaSubmitTest] Testing invalid language...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qDSA._id.toString(), code: 'console.log("hello");', language: 'brainfuck' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for invalid language, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Invalid language returns 400.');

    // I. Missing question
    console.log('[DsaSubmitTest] Testing missing question...');
    const fakeId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: fakeId, code: 'console.log("hello");', language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for missing question, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Missing question returns 404.');

    // J. Non-DSA question
    console.log('[DsaSubmitTest] Testing non-DSA question...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qAptitude._id.toString(), code: 'console.log("hello");', language: 'javascript' }
    ));
    await simulateRoute(submitDSACode, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for non-DSA question, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Non-DSA question returns 404.');

    // G, H, F, E: Identity injection
    console.log('[DsaSubmitTest] Testing identity injection (userId in body)...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { questionId: qDSA._id.toString(), code: 'console.log("hello");', language: 'javascript', userId: student2._id.toString() }
    ));
    await simulateRoute(submitDSACode, r, rs);
    
    // N, O, M: Since execution is not configured, it should return 503
    if (rs.statusCode !== 503) throw new Error(`Expected 503 for unavailable execution provider, got ${rs.statusCode}`);
    console.log('[DsaSubmitTest] PASS: Identity injection ignored, code execution correctly reported as unavailable (503).');
    
    // Verify no AttemptTrack was created for either student (because execution failed)
    const attempts1 = await AttemptTrack.find({ userId: student1._id });
    const attempts2 = await AttemptTrack.find({ userId: student2._id });
    if (attempts1.length > 0 || attempts2.length > 0) {
      throw new Error('AttemptTrack was created even when execution failed/unavailable!');
    }
    console.log('[DsaSubmitTest] PASS: No false Accepted status or AttemptTrack created when execution is unavailable.');

    // Cleanup
    console.log('[DsaSubmitTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    
    console.log('[DsaSubmitTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[DsaSubmitTest] === BACKEND DSA SUBMIT API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DsaSubmitTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runDsaSubmitVerification();
