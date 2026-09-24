import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
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
      this.body = JSON.parse(JSON.stringify(data));
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

const runDsaQuestionDetailVerification = async () => {
  console.log('[DsaQuestionDetailTest] Starting Phase 3 Backend DSA Question Detail API Verification...');
  const createdIds = { users: [], questions: [], topics: [] };

  try {
    await connectDB();
    console.log('[DsaQuestionDetailTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student
    const student = await User.create({
      name: 'DSA Q Detail Test Student',
      email: `dsa-q-det-test-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student._id);
    const studentToken = generateToken({ id: student._id, role: student.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'DSA Q Detail Admin',
      email: `dsa-q-det-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics
    const topicDsa = await Topic.create({ category: 'dsa', subject: 'Trees', title: 'Binary Search Trees', slug: `bst-q-det-${Date.now()}` });
    const topicAptitude = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Time and Work', slug: `tw-q-det-${Date.now()}` });
    createdIds.topics.push(topicDsa._id, topicAptitude._id);

    // Create Questions
    const qDsa = await Question.create({
      topicId: topicDsa._id, title: 'Valid BST Q', slug: `valid-bst-det-${Date.now()}`, difficulty: 'Medium', problemStatement: 'PS',
      solutionCode: { javascript: 'secret_solution' }, 
      solutionExplanation: 'secret_explanation',
      testCases: [
        { input: 'a', expectedOutput: 'b', isHidden: false },
        { input: 'c', expectedOutput: 'd', isHidden: true }
      ]
    });
    const qAptitude = await Question.create({
      topicId: topicAptitude._id, title: 'Pipes Q', slug: `pipes-det-${Date.now()}`, difficulty: 'Easy', problemStatement: 'PS',
      solutionCode: { javascript: 'secret4' }, testCases: [{ input: 'a', expectedOutput: 'b', isHidden: true }]
    });
    createdIds.questions.push(qDsa._id, qAptitude._id);

    console.log('[DsaQuestionDetailTest] Created test accounts and question data.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // B. No token
    console.log('[DsaQuestionDetailTest] Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes({}, {}, {}, { slug: qDsa.slug });
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[DsaQuestionDetailTest] PASS: GET without token returns 401.');

    // C. Invalid/tampered JWT
    console.log('[DsaQuestionDetailTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, {}, {}, { slug: qDsa.slug }));
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[DsaQuestionDetailTest] PASS: Invalid/Tampered JWT returns 401.');

    // D. Admin token
    console.log('[DsaQuestionDetailTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { slug: qDsa.slug }));
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[DsaQuestionDetailTest] PASS: Admin attempting student route rejected with 403.');

    // F. Non-existing slug
    console.log('[DsaQuestionDetailTest] Testing non-existing slug...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { slug: 'does-not-exist-ever' }));
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for missing slug, got ${rs.statusCode}`);
    console.log('[DsaQuestionDetailTest] PASS: Non-existing slug returns 404.');

    // G. Non-DSA question slug
    console.log('[DsaQuestionDetailTest] Testing non-DSA question slug...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { slug: qAptitude.slug }));
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for non-DSA slug, got ${rs.statusCode}`);
    console.log('[DsaQuestionDetailTest] PASS: Non-DSA question slug safely returns 404.');

    // A. Student with valid JWT -> 200, E. Existing DSA question is returned
    console.log('[DsaQuestionDetailTest] Testing valid student fetching valid DSA question detail...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { slug: qDsa.slug }));
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    const testQ = rs.body.data;
    if (testQ.slug !== qDsa.slug) throw new Error('Returned question slug mismatch');
    console.log('[DsaQuestionDetailTest] PASS: DSA question returned successfully.');

    // H. Response contains expected safe detail fields
    if (!testQ.problemStatement || !testQ.difficulty || !testQ.codeSnippets) {
      throw new Error('SECURITY FAILURE: Missing safe fields like problemStatement or difficulty or codeSnippets.');
    }
    console.log('[DsaQuestionDetailTest] PASS: Response contains expected safe detail fields.');

    // I. Response does NOT contain sensitive fields
    if (testQ.solutionCode !== undefined || testQ.solutionExplanation !== undefined || testQ.mcqOptions !== undefined || testQ.hints !== undefined) {
      console.log('testQ:', JSON.stringify(testQ, null, 2));
      throw new Error('SECURITY FAILURE: Sensitive/Unnecessary fields like solutionCode or solutionExplanation exposed.');
    }
    
    // Check test cases specifically (should only have the non-hidden one)
    if (testQ.testCases.length !== 1 || testQ.testCases[0].isHidden === true) {
      throw new Error('SECURITY FAILURE: Hidden test cases exposed.');
    }
    console.log('[DsaQuestionDetailTest] PASS: Response does NOT contain sensitive fields and strips hidden test cases.');

    // J. Topic relationship is correctly populated
    if (!testQ.topicId || !testQ.topicId.title || testQ.topicId.category !== 'dsa') {
      throw new Error('Topic relationship not populated correctly.');
    }
    console.log('[DsaQuestionDetailTest] PASS: Topic relationship is populated.');

    // L & M. Injection/Ownership bypass check
    console.log('[DsaQuestionDetailTest] Testing injection protection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}`, 'x-user-id': adminUser._id.toString() },
      { userId: adminUser._id.toString() },
      { userId: adminUser._id.toString() },
      { slug: qDsa.slug }
    ));
    await simulateRoute(getDSAQuestionBySlug, r, rs);
    if (rs.statusCode !== 200) throw new Error('Injection protection test failed.');
    console.log('[DsaQuestionDetailTest] PASS: Route safely ignores identity injection.');

    // N. Atlas persistence verification
    console.log('[DsaQuestionDetailTest] Atlas persistence verification...');
    const dbQuestions = await Question.countDocuments({ _id: { $in: createdIds.questions } });
    if (dbQuestions !== 2) throw new Error('Database persistence issue, questions not found in Atlas.');
    console.log('[DsaQuestionDetailTest] PASS: Atlas connectivity and persistence verified.');

    // O. Cleanup
    console.log('[DsaQuestionDetailTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    
    console.log('[DsaQuestionDetailTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[DsaQuestionDetailTest] === BACKEND DSA QUESTION DETAIL API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DsaQuestionDetailTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runDsaQuestionDetailVerification();
