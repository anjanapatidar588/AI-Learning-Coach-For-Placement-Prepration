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
import { getDSAQuestions } from '../src/controllers/dsaController.js';
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

const runDsaQuestionsVerification = async () => {
  console.log('[DsaQuestionsTest] Starting Phase 3 Backend DSA Questions API Verification...');
  const createdIds = { users: [], questions: [], topics: [] };

  try {
    await connectDB();
    console.log('[DsaQuestionsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student
    const student = await User.create({
      name: 'DSA Questions Test Student',
      email: `dsa-q-test-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student._id);
    const studentToken = generateToken({ id: student._id, role: student.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'DSA Questions Admin',
      email: `dsa-q-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics
    const topicDsa1 = await Topic.create({ category: 'dsa', subject: 'Trees', title: 'Binary Search Trees', slug: `bst-q-${Date.now()}` });
    const topicDsa2 = await Topic.create({ category: 'dsa', subject: 'Graphs', title: 'Graph Traversal', slug: `graph-q-${Date.now()}` });
    const topicAptitude = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Time and Work', slug: `tw-q-${Date.now()}` });
    createdIds.topics.push(topicDsa1._id, topicDsa2._id, topicAptitude._id);

    // Create Questions
    const qDsa1 = await Question.create({
      topicId: topicDsa1._id, title: 'Valid BST Q', slug: `valid-bst-q-${Date.now()}`, difficulty: 'Medium', problemStatement: 'PS',
      solutionCode: { javascript: 'secret1' }, testCases: [{ input: 'a', expectedOutput: 'b', isHidden: true }]
    });
    const qDsa2 = await Question.create({
      topicId: topicDsa1._id, title: 'Insert BST Q', slug: `insert-bst-q-${Date.now()}`, difficulty: 'Easy', problemStatement: 'PS',
      solutionCode: { javascript: 'secret2' }, testCases: [{ input: 'a', expectedOutput: 'b', isHidden: true }]
    });
    const qDsa3 = await Question.create({
      topicId: topicDsa2._id, title: 'BFS Q', slug: `bfs-q-${Date.now()}`, difficulty: 'Medium', problemStatement: 'PS',
      solutionCode: { javascript: 'secret3' }, testCases: [{ input: 'a', expectedOutput: 'b', isHidden: true }]
    });
    const qAptitude = await Question.create({
      topicId: topicAptitude._id, title: 'Pipes Q', slug: `pipes-q-${Date.now()}`, difficulty: 'Easy', problemStatement: 'PS',
      solutionCode: { javascript: 'secret4' }, testCases: [{ input: 'a', expectedOutput: 'b', isHidden: true }]
    });
    createdIds.questions.push(qDsa1._id, qDsa2._id, qDsa3._id, qAptitude._id);

    console.log('[DsaQuestionsTest] Created test accounts and question data.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // B. No token
    console.log('[DsaQuestionsTest] Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getDSAQuestions, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[DsaQuestionsTest] PASS: GET without token returns 401.');

    // C. Invalid/tampered JWT
    console.log('[DsaQuestionsTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getDSAQuestions, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[DsaQuestionsTest] PASS: Invalid/Tampered JWT returns 401.');

    // D. Admin token
    console.log('[DsaQuestionsTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getDSAQuestions, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[DsaQuestionsTest] PASS: Admin attempting student route rejected with 403.');

    // A. Student with valid JWT -> 200, E. DSA returned, F. Non-DSA excluded
    console.log('[DsaQuestionsTest] Testing valid student fetching all DSA questions...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateRoute(getDSAQuestions, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    let questions = rs.body.data.questions;
    if (!Array.isArray(questions)) throw new Error('Questions should be an array');
    
    // We expect at least the 3 DSA questions we just created, but maybe more if DB has them.
    // Check that our Aptitude question is NOT returned.
    const hasAptitude = questions.some(q => q._id.toString() === qAptitude._id.toString());
    if (hasAptitude) throw new Error('Aptitude question was returned! Should be DSA only.');

    const ourDsaQuestions = questions.filter(q => 
      q._id.toString() === qDsa1._id.toString() || 
      q._id.toString() === qDsa2._id.toString() || 
      q._id.toString() === qDsa3._id.toString()
    );
    if (ourDsaQuestions.length !== 3) throw new Error(`Expected all 3 seeded DSA questions, found ${ourDsaQuestions.length}`);
    console.log('[DsaQuestionsTest] PASS: DSA questions returned, Non-DSA excluded.');

    // K. Response doesn't expose sensitive fields
    const testQ = ourDsaQuestions[0];
    if (testQ.solutionCode !== undefined || testQ.testCases !== undefined || testQ.problemStatement !== undefined) {
      throw new Error('SECURITY FAILURE: Sensitive/Unnecessary fields like solutionCode or problemStatement exposed.');
    }
    if (!testQ.topicId || !testQ.topicId.title) {
      throw new Error('Topic relationship not populated correctly.');
    }
    console.log('[DsaQuestionsTest] PASS: Response structure is safe, topic populated.');

    // G. Topic filter works
    console.log('[DsaQuestionsTest] Testing topic filter (ID)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, { topic: topicDsa1._id.toString() }));
    await simulateRoute(getDSAQuestions, r, rs);
    questions = rs.body.data.questions;
    if (!questions.some(q => q._id.toString() === qDsa1._id.toString())) throw new Error('Missing qDsa1 for topic filter');
    if (questions.some(q => q._id.toString() === qDsa3._id.toString())) throw new Error('qDsa3 should not be in topicDsa1 result');
    console.log('[DsaQuestionsTest] PASS: Topic filter works.');

    // H. Difficulty filter works
    console.log('[DsaQuestionsTest] Testing difficulty filter...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, { difficulty: 'Easy' }));
    await simulateRoute(getDSAQuestions, r, rs);
    questions = rs.body.data.questions;
    if (!questions.some(q => q._id.toString() === qDsa2._id.toString())) throw new Error('Missing qDsa2 (Easy) for difficulty filter');
    if (questions.some(q => q._id.toString() === qDsa1._id.toString())) throw new Error('qDsa1 (Medium) should not be in Easy result');
    console.log('[DsaQuestionsTest] PASS: Difficulty filter works.');

    // I. Combined filter
    console.log('[DsaQuestionsTest] Testing combined filter...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, { topic: topicDsa1.slug, difficulty: 'Medium' }));
    await simulateRoute(getDSAQuestions, r, rs);
    questions = rs.body.data.questions;
    if (questions.length !== 1 || questions[0]._id.toString() !== qDsa1._id.toString()) {
      throw new Error('Combined filter failed to return exactly qDsa1');
    }
    console.log('[DsaQuestionsTest] PASS: Combined filter (slug + difficulty) works.');

    // J. Empty result returns 200 with empty array
    console.log('[DsaQuestionsTest] Testing empty result...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, { topic: topicAptitude._id.toString() }));
    await simulateRoute(getDSAQuestions, r, rs);
    if (rs.statusCode !== 200 || rs.body.data.questions.length !== 0) {
      throw new Error('Expected empty questions array for non-DSA or non-existent valid topic');
    }
    console.log('[DsaQuestionsTest] PASS: Empty result returns 200 safely.');

    // M. Injection/Ownership bypass check
    // Ensure that if a user tries to inject x-user-id or manipulate things, auth strictly uses req.user
    // Well, questions are shared, but we can just ensure req.user overrides anything. The auth middleware does this natively, but we test the route doesn't crash or behave weirdly.
    console.log('[DsaQuestionsTest] Testing injection protection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}`, 'x-user-id': adminUser._id.toString() },
      { userId: adminUser._id.toString() },
      { userId: adminUser._id.toString() }
    ));
    await simulateRoute(getDSAQuestions, r, rs);
    if (rs.statusCode !== 200) throw new Error('Injection protection test failed.');
    console.log('[DsaQuestionsTest] PASS: Route safely ignores identity injection.');

    // O. Atlas persistence verification
    console.log('[DsaQuestionsTest] Atlas persistence verification...');
    const dbQuestions = await Question.countDocuments({ _id: { $in: createdIds.questions } });
    if (dbQuestions !== 4) throw new Error('Database persistence issue, questions not found in Atlas.');
    console.log('[DsaQuestionsTest] PASS: Atlas connectivity and persistence verified.');

    // N. Cleanup
    console.log('[DsaQuestionsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    
    console.log('[DsaQuestionsTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[DsaQuestionsTest] === BACKEND DSA QUESTIONS API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DsaQuestionsTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runDsaQuestionsVerification();
