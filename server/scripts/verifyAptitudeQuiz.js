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
import Question from '../src/models/Question.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getAptitudeQuiz } from '../src/controllers/aptitudeController.js';
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

const runAptitudeQuizVerification = async () => {
  console.log('[AptitudeQuizTest] Starting Phase 3 Step 19 Backend Aptitude Quiz Fetch Verification...');
  const createdIds = { users: [], topics: [], questions: [] };

  try {
    await connectDB();
    console.log('[AptitudeQuizTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student
    const student1 = await User.create({
      name: 'Apt Quiz Student',
      email: `apt-quiz-student-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const studentToken = generateToken({ id: student1._id, role: student1.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'Apt Quiz Admin',
      email: `apt-quiz-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics
    const topicApt1 = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Percentages', slug: `perc-q-${Date.now()}`, order: 1000 });
    const topicAptEmpty = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Empty Topic', slug: `empty-q-${Date.now()}`, order: 1001 });
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Arrays', title: 'Two Pointers', slug: `tp-q-${Date.now()}`, order: 1002 });
    createdIds.topics.push(topicApt1._id, topicAptEmpty._id, topicDSA._id);

    // Create Questions
    const q1 = await Question.create({
      topicId: topicApt1._id,
      title: 'Successive Percentage',
      slug: `succ-perc-${Date.now()}`,
      difficulty: 'Easy',
      type: 'mcq',
      problemStatement: '20% increase then 10% decrease.',
      mcqOptions: [
        { optionId: 'A', text: '10% increase', isCorrect: false },
        { optionId: 'B', text: '8% increase', isCorrect: true }
      ],
      solutionExplanation: 'Test explanation',
      hints: ['Test hint'],
      testCases: [{ input: 'x', expectedOutput: 'y', isHidden: true }],
      solutionCode: { javascript: 'console.log("8%");' }
    });
    const qDSA = await Question.create({
      topicId: topicDSA._id,
      title: 'Two Sum',
      slug: `two-sum-${Date.now()}`,
      difficulty: 'Easy',
      type: 'coding',
      problemStatement: 'Sum to target'
    });
    createdIds.questions.push(q1._id, qDSA._id);

    console.log('[AptitudeQuizTest] Created test accounts, topics, and questions.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A. Authentication
    console.log('[AptitudeQuizTest] Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes({}, {}, {}, { topicId: topicApt1._id.toString() });
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    
    console.log('[AptitudeQuizTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, {}, {}, { topicId: topicApt1._id.toString() }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    
    console.log('[AptitudeQuizTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { topicId: topicApt1._id.toString() }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[AptitudeQuizTest] PASS: Auth/RBAC working correctly.');

    // B. Topic Validation
    console.log('[AptitudeQuizTest] Testing malformed topicId...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { topicId: 'malformed_id' }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for malformed topicId, got ${rs.statusCode}`);

    console.log('[AptitudeQuizTest] Testing non-existent topicId...');
    const fakeObjectId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { topicId: fakeObjectId }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for non-existent topicId, got ${rs.statusCode}`);

    console.log('[AptitudeQuizTest] Testing DSA topic passed to Aptitude endpoint...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { topicId: topicDSA._id.toString() }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for DSA topic on Aptitude endpoint, got ${rs.statusCode}`);
    console.log('[AptitudeQuizTest] PASS: Topic validation correct.');

    // C. Question Filtering & D. Sensitive Data Protection
    console.log('[AptitudeQuizTest] Testing valid Aptitude topic (filtering and sensitive data protection)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { topicId: topicApt1._id.toString() }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    const { topic: retTopic, questions: retQuestions } = rs.body.data;
    if (retTopic._id.toString() !== topicApt1._id.toString()) throw new Error('Returned incorrect topic information');
    if (!Array.isArray(retQuestions) || retQuestions.length !== 1) throw new Error('Expected 1 question returned for valid topic');
    
    const q1Ret = retQuestions[0];
    if (q1Ret._id.toString() !== q1._id.toString()) throw new Error('Returned wrong question id');
    
    // Check sensitive data exclusion
    if (q1Ret.solutionExplanation !== undefined) throw new Error('SECURITY FAILURE: solutionExplanation leaked!');
    if (q1Ret.solutionCode !== undefined) throw new Error('SECURITY FAILURE: solutionCode leaked!');
    if (q1Ret.hints !== undefined) throw new Error('SECURITY FAILURE: hints leaked!');
    if (q1Ret.testCases !== undefined) throw new Error('SECURITY FAILURE: testCases leaked!');
    
    // Check isCorrect stripped from mcqOptions
    if (!q1Ret.mcqOptions || !Array.isArray(q1Ret.mcqOptions)) throw new Error('mcqOptions missing or not array');
    q1Ret.mcqOptions.forEach(opt => {
      if (opt.isCorrect !== undefined) {
        throw new Error('SECURITY FAILURE: isCorrect leaked in mcqOptions!');
      }
    });
    console.log('[AptitudeQuizTest] PASS: Questions correctly filtered and sensitive data stripped.');

    // E. Empty Data
    console.log('[AptitudeQuizTest] Testing empty topic data...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, {}, {}, { topicId: topicAptEmpty._id.toString() }));
    await simulateRoute(getAptitudeQuiz, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200 for empty topic, got ${rs.statusCode}`);
    if (!Array.isArray(rs.body.data.questions) || rs.body.data.questions.length !== 0) {
      throw new Error('Expected empty array for empty topic');
    }
    console.log('[AptitudeQuizTest] PASS: Empty topic returns empty array.');

    console.log('[AptitudeQuizTest] === BACKEND APTITUDE QUIZ FETCH VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[AptitudeQuizTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[AptitudeQuizTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[AptitudeQuizTest] Cleanup complete.');
  }
};

runAptitudeQuizVerification();
