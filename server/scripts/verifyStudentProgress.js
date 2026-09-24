import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getProgressMetrics } from '../src/controllers/studentController.js';
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

const runProgressVerification = async () => {
  console.log('[ProgressTest] Starting Phase 3 Step 10 Backend Student Progress API Verification...');
  const createdIds = { users: [], questions: [], attempts: [] };

  try {
    await connectDB();
    console.log('[ProgressTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1 (No attempts)
    const student1 = await User.create({
      name: 'Progress Test 1',
      email: `progress-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (With attempts)
    const student2 = await User.create({
      name: 'Progress Test 2',
      email: `progress-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'Progress Admin',
      email: `progress-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    const q1Id = new mongoose.Types.ObjectId();

    // Create attempts for Student 2
    // DSA: 2 attempts, 1 accepted, 1 failed. Time: 10 + 20. Hints: 1 + 2.
    const a1 = await AttemptTrack.create({ userId: student2._id, questionId: q1Id, category: 'dsa', status: 'Accepted', timeSpentSeconds: 10, hintsUsedCount: 1 });
    const a2 = await AttemptTrack.create({ userId: student2._id, questionId: q1Id, category: 'dsa', status: 'Wrong Answer', timeSpentSeconds: 20, hintsUsedCount: 2 });
    
    // Aptitude: 1 attempt, accepted. Time: 5. Hints: 0
    const a3 = await AttemptTrack.create({ userId: student2._id, questionId: q1Id, category: 'aptitude', status: 'Accepted', timeSpentSeconds: 5, hintsUsedCount: 0 });
    
    // CS Core: 1 attempt, failed. Time: 15. Hints: 0
    const a4 = await AttemptTrack.create({ userId: student2._id, questionId: q1Id, category: 'cs_core', status: 'Time Limit Exceeded', timeSpentSeconds: 15, hintsUsedCount: 0 });

    createdIds.attempts.push(a1._id, a2._id, a3._id, a4._id);

    console.log('[ProgressTest] Created test accounts and attempt data.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // I. No token
    console.log('[ProgressTest] I. Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getProgressMetrics, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[ProgressTest] PASS: GET without token returns 401.');

    // J. Invalid JWT
    console.log('[ProgressTest] J. Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getProgressMetrics, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[ProgressTest] PASS: Invalid/Tampered JWT returns 401.');

    // K. Admin token
    console.log('[ProgressTest] K. Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getProgressMetrics, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[ProgressTest] PASS: Admin attempting student route rejected with 403.');

    // A. Valid student with no attempts
    console.log('[ProgressTest] A. Testing valid student with no attempts (Student 1)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getProgressMetrics, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    if (rs.body.data.overall.totalAttempts !== 0) throw new Error(`Expected 0 overall attempts, got ${rs.body.data.overall.totalAttempts}`);
    if (rs.body.data.recentActivity.length !== 0) throw new Error('Expected empty recent activity');
    console.log('[ProgressTest] PASS: Endpoint returns safe empty analytics correctly.');

    // B, C, D, E, F, G, H. Valid student with seeded attempt data
    console.log('[ProgressTest] B/C/D/E/F/G/H. Testing seeded progress calculation (Student 2)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getProgressMetrics, r, rs);
    
    const d = rs.body.data;
    if (d.overall.totalAttempts !== 4) throw new Error(`Overall total expected 4, got ${d.overall.totalAttempts}`);
    if (d.overall.passedAttempts !== 2) throw new Error(`Overall passed expected 2, got ${d.overall.passedAttempts}`);
    if (d.overall.accuracy !== 50) throw new Error(`Overall accuracy expected 50, got ${d.overall.accuracy}`);
    if (d.overall.totalTimeSpentSeconds !== 50) throw new Error(`Overall time expected 50, got ${d.overall.totalTimeSpentSeconds}`);
    
    if (d.dsa.totalAttempts !== 2) throw new Error('DSA total expected 2');
    if (d.dsa.passedAttempts !== 1) throw new Error('DSA passed expected 1');
    if (d.dsa.accuracy !== 50) throw new Error('DSA accuracy expected 50');
    
    if (d.aptitude.totalAttempts !== 1) throw new Error('Aptitude total expected 1');
    if (d.aptitude.accuracy !== 100) throw new Error('Aptitude accuracy expected 100');
    
    if (d.csCore.totalAttempts !== 1) throw new Error('CS Core total expected 1');
    if (d.csCore.accuracy !== 0) throw new Error('CS Core accuracy expected 0');
    
    if (d.recentActivity.length !== 4) throw new Error('Recent activity expected 4 items');
    
    console.log('[ProgressTest] PASS: DSA, Aptitude, CS Core, accuracy, pass/fail counts, and recent performance calculated correctly.');

    // L, M. Injection and Scoping
    console.log('[ProgressTest] L/M. Testing identity injection and data scoping...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() }, // body
      { userId: student2._id.toString() }, // query
      { userId: student2._id.toString() }  // params
    ));
    await simulateRoute(getProgressMetrics, r, rs);
    if (rs.body.data.overall.totalAttempts !== 0) throw new Error('SECURITY FAILURE: Identity injection succeeded, Student 1 read Student 2 progress!');
    console.log('[ProgressTest] PASS: userId injection ignored, Student A cannot read Student B progress.');

    // N. Atlas persistence verification (Implied by above reads from created data, but let's confirm DB state)
    console.log('[ProgressTest] N. Atlas persistence verification...');
    const dbAttempts = await AttemptTrack.countDocuments({ userId: student2._id });
    if (dbAttempts !== 4) throw new Error('Database persistence issue, attempts not found in Atlas.');
    console.log('[ProgressTest] PASS: Atlas connectivity and persistence verified.');

    // O. Cleanup
    console.log('[ProgressTest] O. Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    
    console.log('[ProgressTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[ProgressTest] === BACKEND STUDENT PROGRESS API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[ProgressTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runProgressVerification();
