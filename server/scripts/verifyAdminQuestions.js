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
import {
  getAdminQuestions,
  getAdminQuestionById,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion
} from '../src/controllers/adminController.js';
import { getDSAQuestionBySlug } from '../src/controllers/dsaController.js';
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
  return new Promise(async (resolve) => {
    let resolved = false;
    const oldStatus = res.status.bind(res);
    const oldJson = res.json.bind(res);
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data) {
      this.body = data;
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
      return this;
    };
    try {
      await middleware(req, res, () => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      });
    } catch (e) {
      if (!resolved) resolve(false);
    }
  });
};


const runAdminQuestionsVerification = async () => {
  console.log('[AdminQuestionsTest] Starting Step 46 Dedicated Admin Question Management Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[AdminQuestionsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student user
    const studentUser = await User.create({
      name: 'Admin Questions Test Student',
      email: `admin-q-student-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(studentUser._id);
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Questions Test Admin',
      email: `admin-q-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create test topic
    const testTopic = await Topic.create({
      category: 'dsa',
      subject: 'Data Structures',
      title: 'Admin Q Test Topic',
      slug: `admin-q-test-topic-${Date.now()}`,
      order: 999
    });
    createdIds.topics.push(testTopic._id);

    // Create initial test question in DB
    const initialQuestion = await Question.create({
      topicId: testTopic._id,
      title: 'Initial Admin Test Problem',
      slug: `initial-admin-test-prob-${Date.now()}`,
      category: 'dsa',
      difficulty: 'Easy',
      type: 'coding',
      problemStatement: 'Return true if string is palindrome.',
      solutionCode: 'function isPalindrome(s) { return s === s.split("").reverse().join(""); }',
      solutionExplanation: 'Compare string to reverse',
      testCases: [
        { input: '"racecar"', expectedOutput: 'true', isHidden: false },
        { input: '"hello"', expectedOutput: 'false', isHidden: true }
      ],
      companyTags: ['Amazon', 'Google']
    });
    createdIds.questions.push(initialQuestion._id);

    const authAdmin = authorize('admin');

    const simulateAdminRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authAdmin, req, res);
      if (!a) return;
      await controller(req, res);
    };

    const simulateStudentRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const authStud = authorize('student');
      const a = await runMiddleware(authStud, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // 1. Unauthenticated request -> 401
    console.log('[AdminQuestionsTest] 1. Testing unauthenticated GET questions...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateAdminRoute(getAdminQuestions, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2. Student GET -> 403
    console.log('[AdminQuestionsTest] 2. Testing student role access to Admin endpoint...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateAdminRoute(getAdminQuestions, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student accessing admin route, got ${rs.statusCode}`);
    console.log('PASS: Student request to Admin questions rejected with 403.');

    // 3. Admin GET -> 200
    console.log('[AdminQuestionsTest] 3. Testing Admin GET questions...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateAdminRoute(getAdminQuestions, r, rs);
    if (rs.statusCode !== 200 || !rs.body?.success) {
      throw new Error(`Expected 200 for Admin GET questions, got ${rs.statusCode}`);
    }
    console.log('PASS: Admin GET questions returned 200.');

    // 4. Admin filtering works
    console.log('[AdminQuestionsTest] 4. Testing Admin question filters...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { category: 'dsa', difficulty: 'Easy', search: 'Initial Admin' }
    ));
    await simulateAdminRoute(getAdminQuestions, r, rs);
    const filteredQuestions = rs.body.data?.questions;
    if (rs.statusCode !== 200 || !Array.isArray(filteredQuestions) || filteredQuestions.length === 0) {
      throw new Error('Filtering failed to return matching questions');
    }
    console.log('PASS: Admin question filtering works as expected.');

    // 5. Admin pagination works
    console.log('[AdminQuestionsTest] 5. Testing Admin pagination...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { page: 1, limit: 1 }
    ));
    await simulateAdminRoute(getAdminQuestions, r, rs);
    const pag = rs.body.data?.pagination;
    if (rs.statusCode !== 200 || pag?.limit !== 1) {
      throw new Error('Pagination limit calculation failed');
    }
    console.log('PASS: Admin question pagination verified.');

    // 6. Admin question detail works
    console.log('[AdminQuestionsTest] 6. Testing GET question by ID...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { questionId: initialQuestion._id.toString() }
    ));
    await simulateAdminRoute(getAdminQuestionById, r, rs);
    if (rs.statusCode !== 200 || rs.body.data?.title !== initialQuestion.title) {
      throw new Error('GET question by ID failed');
    }
    // Admin response includes solutionCode
    if (!rs.body.data.solutionCode) {
      throw new Error('Admin GET detail should include solutionCode for editing');
    }
    console.log('PASS: Admin GET question detail verified.');

    // 7. Admin create valid question works
    console.log('[AdminQuestionsTest] 7. Testing Admin create question...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'New Valid Admin Created Question',
        category: 'dsa',
        topicId: testTopic._id.toString(),
        difficulty: 'Medium',
        type: 'coding',
        problemStatement: 'Calculate Fibonacci number.',
        solutionCode: 'function fib(n) { return n <= 1 ? n : fib(n-1)+fib(n-2); }',
        testCases: [{ input: '5', expectedOutput: '5', isHidden: false }]
      }
    ));
    await simulateAdminRoute(createAdminQuestion, r, rs);
    if (rs.statusCode !== 201 || !rs.body.data?._id) {
      throw new Error(`Admin create question failed with status ${rs.statusCode}: ${rs.body?.message}`);
    }
    const createdQId = rs.body.data._id;
    createdIds.questions.push(createdQId);
    console.log('PASS: Admin create question works (201).');

    // 8. Invalid category rejected
    console.log('[AdminQuestionsTest] 8. Testing invalid category rejection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Invalid Cat Problem',
        category: 'invalid_category_xyz',
        topicId: testTopic._id.toString(),
        difficulty: 'Easy',
        problemStatement: 'Testing invalid category.'
      }
    ));
    await simulateAdminRoute(createAdminQuestion, r, rs);
    if (rs.statusCode !== 400) {
      throw new Error(`Expected 400 for invalid category, got ${rs.statusCode}`);
    }
    console.log('PASS: Invalid category rejected with 400.');

    // 9. Invalid difficulty rejected
    console.log('[AdminQuestionsTest] 9. Testing invalid difficulty rejection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Invalid Diff Problem',
        category: 'dsa',
        topicId: testTopic._id.toString(),
        difficulty: 'SuperExtreme',
        problemStatement: 'Testing invalid difficulty.'
      }
    ));
    await simulateAdminRoute(createAdminQuestion, r, rs);
    if (rs.statusCode !== 400) {
      throw new Error(`Expected 400 for invalid difficulty, got ${rs.statusCode}`);
    }
    console.log('PASS: Invalid difficulty rejected with 400.');

    // 10. Invalid ObjectId rejected
    console.log('[AdminQuestionsTest] 10. Testing invalid ObjectId format...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { questionId: 'invalid-object-id-123' }
    ));
    await simulateAdminRoute(getAdminQuestionById, r, rs);
    if (rs.statusCode !== 400) {
      throw new Error(`Expected 400 for malformed ObjectId, got ${rs.statusCode}`);
    }
    console.log('PASS: Malformed ObjectId rejected with 400.');

    // 11. Malformed MCQ data rejected
    console.log('[AdminQuestionsTest] 11. Testing malformed MCQ option validation...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Malformed MCQ Question',
        category: 'aptitude',
        topicId: testTopic._id.toString(),
        difficulty: 'Easy',
        type: 'mcq',
        problemStatement: 'What is 2+2?',
        mcqOptions: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: false } // No correct option selected!
        ]
      }
    ));
    await simulateAdminRoute(createAdminQuestion, r, rs);
    if (rs.statusCode !== 400) {
      throw new Error(`Expected 400 for MCQ without correct option, got ${rs.statusCode}`);
    }
    console.log('PASS: Malformed MCQ data rejected with 400.');

    // 12. Admin edit works
    console.log('[AdminQuestionsTest] 12. Testing Admin edit question...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Updated Admin Question Title',
        difficulty: 'Hard'
      },
      {},
      { questionId: createdQId.toString() }
    ));
    await simulateAdminRoute(updateAdminQuestion, r, rs);
    if (rs.statusCode !== 200 || rs.body.data?.title !== 'Updated Admin Question Title') {
      throw new Error(`Admin update question failed with status ${rs.statusCode}`);
    }
    console.log('PASS: Admin edit question verified.');

    // 13. Student cannot create/edit/delete questions
    console.log('[AdminQuestionsTest] 13. Testing student attempt to create/edit/delete questions...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { title: 'Student Hacker Question', category: 'dsa', difficulty: 'Easy', problemStatement: 'Hack' }
    ));
    await simulateAdminRoute(createAdminQuestion, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student create, got ${rs.statusCode}`);

    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { title: 'Hacked Title' },
      {},
      { questionId: createdQId.toString() }
    ));
    await simulateAdminRoute(updateAdminQuestion, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student edit, got ${rs.statusCode}`);

    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      {},
      {},
      { questionId: createdQId.toString() }
    ));
    await simulateAdminRoute(deleteAdminQuestion, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student delete, got ${rs.statusCode}`);
    console.log('PASS: Student attempts to create/edit/delete strictly rejected with 403.');

    // 14 & 15. Safe Delete Behavior (Prevent deletion when AttemptTrack references exist)
    console.log('[AdminQuestionsTest] 14 & 15. Testing safe deletion prevention with AttemptTrack reference...');
    const attempt = await AttemptTrack.create({
      userId: studentUser._id,
      questionId: initialQuestion._id,
      category: 'dsa',
      submittedCode: 'test',
      language: 'javascript',
      status: 'Accepted'
    });
    createdIds.attempts.push(attempt._id);

    // Try deleting initialQuestion (which has an attempt)
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { questionId: initialQuestion._id.toString() }
    ));
    await simulateAdminRoute(deleteAdminQuestion, r, rs);
    if (rs.statusCode !== 400 || !rs.body.message?.includes('attempts')) {
      throw new Error(`Expected 400 deletion block when AttemptTrack references exist, got status ${rs.statusCode}`);
    }
    console.log('PASS: Deletion safely blocked when historical AttemptTrack references exist.');

    // Now delete createdQId (which has NO attempt)
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { questionId: createdQId.toString() }
    ));
    await simulateAdminRoute(deleteAdminQuestion, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) {
      throw new Error(`Expected 200 for safe question deletion, got ${rs.statusCode}`);
    }
    // Remove createdQId from createdIds list since it was deleted
    createdIds.questions = createdIds.questions.filter(id => id.toString() !== createdQId.toString());
    console.log('PASS: Safe question deletion without attempt references succeeded (200).');

    // 16. Request body role/userId override protection
    console.log('[AdminQuestionsTest] 16. Testing request body override protection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { role: 'admin', userId: adminUser._id.toString() }
    ));
    await simulateAdminRoute(getAdminQuestions, r, rs);
    if (rs.statusCode !== 403) {
      throw new Error('Security failure: Student bypassed authorization using body role injection');
    }
    console.log('PASS: Request body role/userId override prevented.');

    // 17. Student endpoint security regression test
    console.log('[AdminQuestionsTest] 17. Verifying student endpoints STILL hide sensitive solution data...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      {},
      {},
      { slug: initialQuestion.slug }
    ));
    await simulateStudentRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 200 || !rs.body.data) {
      throw new Error(`Student GET question by slug failed with status ${rs.statusCode}`);
    }
    const studentQData = rs.body.data;
    if (
      studentQData.solutionCode !== undefined ||
      studentQData.solutionExplanation !== undefined ||
      (studentQData.testCases && studentQData.testCases.some(tc => tc.isHidden))
    ) {
      throw new Error('SECURITY REGRESSION: Student endpoint exposed solutionCode, solutionExplanation, or hidden test cases!');
    }
    console.log('PASS: Student endpoint security projection verified (solution code, explanation & hidden test cases hidden).');

    // 18. Secrets & credentials exposure check
    console.log('[AdminQuestionsTest] 18. Checking response payloads for credential exposure...');
    const fullBodyStr = JSON.stringify(rs.body);
    if (fullBodyStr.includes('passwordHash') || fullBodyStr.includes('JWT_SECRET') || fullBodyStr.includes('GEMINI_API_KEY')) {
      throw new Error('SECURITY AUDIT FAILED: Credentials or sensitive fields exposed');
    }
    console.log('PASS: No secrets or credentials exposed.');

    // Clean up temporary test data
    console.log('[AdminQuestionsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.users) await User.deleteOne({ _id: id });

    console.log('[AdminQuestionsTest] PASS: All temporary test documents cleaned up.');
    console.log('[AdminQuestionsTest] === DEDICATED STEP 46 ADMIN QUESTION MANAGEMENT VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[AdminQuestionsTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runAdminQuestionsVerification();
