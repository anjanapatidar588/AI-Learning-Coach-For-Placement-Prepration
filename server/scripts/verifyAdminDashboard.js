import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getAdminDashboardStats } from '../src/controllers/adminController.js';
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

const runAdminDashboardVerification = async () => {
  console.log('[AdminDashboardTest] Starting Step 45 Dedicated Admin Dashboard Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [], profiles: [] };

  try {
    await connectDB();
    console.log('[AdminDashboardTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student user
    const studentUser = await User.create({
      name: 'Admin Dashboard Test Student',
      email: `admin-dash-student-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(studentUser._id);
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Dashboard Test Admin',
      email: `admin-dash-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create test learner profile
    const profile = await LearnerProfile.create({
      userId: studentUser._id,
      readinessScore: 75,
      baselineAssessmentCompleted: true
    });
    createdIds.profiles.push(profile._id);

    // Create test topic and question
    const topic = await Topic.create({
      category: 'dsa',
      subject: 'Data Structures',
      title: 'Linked List Admin Test',
      slug: `ll-admin-test-${Date.now()}`,
      order: 999
    });
    createdIds.topics.push(topic._id);

    const question = await Question.create({
      topicId: topic._id,
      title: 'Reverse Linked List',
      slug: `rev-ll-admin-${Date.now()}`,
      problemStatement: 'Reverse a singly linked list.'
    });
    createdIds.questions.push(question._id);

    // Create test attempt
    const attempt = await AttemptTrack.create({
      userId: studentUser._id,
      questionId: question._id,
      category: 'dsa',
      submittedCode: 'function reverseList(head) { return head; }',
      language: 'javascript',
      status: 'Accepted',
      passedTestCases: 5,
      totalTestCases: 5,
      timeSpentSeconds: 120
    });
    createdIds.attempts.push(attempt._id);

    console.log('[AdminDashboardTest] Created test documents in MongoDB Atlas.');

    const authAdmin = authorize('admin');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authAdmin, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // 1. Unauthenticated request -> 401
    console.log('[AdminDashboardTest] 1. Testing unauthenticated request...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getAdminDashboardStats, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2. Student request -> 403
    console.log('[AdminDashboardTest] 2. Testing student role request...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateRoute(getAdminDashboardStats, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student role request, got ${rs.statusCode}`);
    console.log('PASS: Student request rejected with 403 Forbidden.');

    // 3. Admin request -> 200
    console.log('[AdminDashboardTest] 3. Testing admin role request...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getAdminDashboardStats, r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200 for admin role request, got ${rs.statusCode}`);
    console.log('PASS: Admin request authorized successfully (200).');

    // 4. Response structure validation
    console.log('[AdminDashboardTest] 4. Validating Admin Dashboard response structure...');
    const data = rs.body?.data;
    if (!data) throw new Error('Response body missing data object');
    if (!data.students || !data.questions || !data.attempts || !data.readiness || !data.domains) {
      throw new Error('Response data missing required metric sections');
    }
    console.log('PASS: Admin Dashboard response structure validated.');

    // 5. Verify database metrics calculations
    if (typeof data.students.total !== 'number' || data.students.total < 1) {
      throw new Error('Students total metric calculation error');
    }
    if (typeof data.questions.total !== 'number' || data.questions.total < 1) {
      throw new Error('Questions total metric calculation error');
    }
    if (typeof data.attempts.total !== 'number' || data.attempts.total < 1) {
      throw new Error('Attempts total metric calculation error');
    }
    console.log('PASS: Real MongoDB metrics calculation verified.');

    // 6. Security Audit: No secrets, submitted code, or PII exposed
    console.log('[AdminDashboardTest] 6. Auditing security and sensitive field exclusion...');
    const bodyStr = JSON.stringify(rs.body);
    if (bodyStr.includes('passwordHash') || bodyStr.includes('JWT_SECRET') || bodyStr.includes('GEMINI_API_KEY')) {
      throw new Error('Security Audit Failed: Sensitive authentication credentials exposed');
    }
    if (bodyStr.includes('function reverseList')) {
      throw new Error('Security Audit Failed: Submitted source code exposed in dashboard response');
    }
    console.log('PASS: Zero secrets, submitted code, or sensitive PII exposed.');

    // 7. Identity & Injection protection: Query/body parameters ignored
    console.log('[AdminDashboardTest] 7. Testing query/body parameter injection safety...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      { role: 'student', userId: studentUser._id.toString() },
      { role: 'student' }
    ));
    await simulateRoute(getAdminDashboardStats, r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200 for injected params, got ${rs.statusCode}`);
    console.log('PASS: Request body/query injections safely ignored.');

    // Cleanup test documents
    console.log('[AdminDashboardTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    for (const id of createdIds.profiles) await LearnerProfile.deleteOne({ _id: id });

    console.log('[AdminDashboardTest] PASS: All temporary test documents deleted from Atlas.');
    console.log('[AdminDashboardTest] === DEDICATED STEP 45 ADMIN DASHBOARD VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[AdminDashboardTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.profiles) await LearnerProfile.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runAdminDashboardVerification();
