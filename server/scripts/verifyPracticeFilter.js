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
import { filterPracticeQuestions } from '../src/controllers/practiceController.js';
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

const runPracticeFilterVerification = async () => {
  console.log('[PracticeFilterTest] Starting Phase 3 Step 25 Backend Practice Filter Verification...');
  const createdIds = { users: [], topics: [], questions: [] };

  try {
    await connectDB();
    console.log('[PracticeFilterTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create accounts
    const student1 = await User.create({ name: 'Practice S1', email: `practice-s1-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'Practice Admin', email: `practice-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
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

    console.log('[PracticeFilterTest] Creating test topics and questions...');
    
    // Create Topics
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Arrays', title: 'Two Pointers', slug: `tp-dsa-${Date.now()}` });
    const topicApt = await Topic.create({ category: 'aptitude', subject: 'Math', title: 'Percentages', slug: `perc-apt-${Date.now()}` });
    const topicCS = await Topic.create({ category: 'cs_core', subject: 'DBMS', title: 'Normalization', slug: `norm-cs-${Date.now()}` });
    createdIds.topics.push(topicDSA._id, topicApt._id, topicCS._id);
    
    // Create Questions
    const qDSA1 = await Question.create({
      topicId: topicDSA._id, title: 'DSA Q1 UniqueTitleXYZ', slug: `dsa-q1-${Date.now()}`, type: 'coding', difficulty: 'Easy', problemStatement: 'Solve Two Pointers',
      solutionCode: { javascript: 'secret_dsa' }
    });
    const qDSA2 = await Question.create({
      topicId: topicDSA._id, title: 'DSA Q2', slug: `dsa-q2-${Date.now()}`, type: 'coding', difficulty: 'Medium', problemStatement: 'Advanced Pointers SearchTarget'
    });
    
    const qApt = await Question.create({
      topicId: topicApt._id, title: 'Apt Q1', slug: `apt-q1-${Date.now()}`, type: 'mcq', difficulty: 'Medium', problemStatement: 'Solve Percentages',
      mcqOptions: [ { optionId: 'A', text: '50%', isCorrect: true }, { optionId: 'B', text: '10%', isCorrect: false } ]
    });

    const qCS = await Question.create({
      topicId: topicCS._id, title: 'CS Q1', slug: `cs-q1-${Date.now()}`, type: 'mcq', difficulty: 'Hard', problemStatement: 'Solve Normalization SearchTarget',
      mcqOptions: [ { optionId: 'A', text: '1NF', isCorrect: true } ]
    });

    createdIds.questions.push(qDSA1._id, qDSA2._id, qApt._id, qCS._id);
    console.log('[PracticeFilterTest] Created test documents.');

    // A/B/C. Authentication
    console.log('[PracticeFilterTest] Testing Authentication...');
    let { req: r, res: rs } = createMockReqRes({}, {}, {});
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for missing token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, {}, {}));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for invalid token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 403) throw new Error('Expected 403 for Admin');
    console.log('[PracticeFilterTest] PASS: Auth/RBAC working correctly.');

    // I. Unsupported Category
    console.log('[PracticeFilterTest] Testing Category Safety...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { category: 'invalid_cat' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 400) throw new Error('Expected 400 for invalid category');
    console.log('[PracticeFilterTest] PASS: Invalid category returns 400.');

    // F. category=dsa
    console.log('[PracticeFilterTest] Testing Category Filters...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { category: 'dsa' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (!rs.body.data || rs.body.data.length === 0) throw new Error('DSA category returned no results');
    if (!rs.body.data.every(q => q.topicId.category === 'dsa')) throw new Error('DSA category returned non-DSA results');
    
    // G. category=aptitude
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { category: 'aptitude' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (!rs.body.data.every(q => q.topicId.category === 'aptitude')) throw new Error('Aptitude category returned non-Aptitude results');
    console.log('[PracticeFilterTest] PASS: Category filtering isolates correctly.');

    // J. topicId filtering
    console.log('[PracticeFilterTest] Testing Topic Filtering...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { topicId: topicDSA._id.toString() }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (!rs.body.data.every(q => q.topicId._id.toString() === topicDSA._id.toString())) throw new Error('TopicId filtering failed');
    
    // K/L/P. Malformed, Nonexistent, Mismatched
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { topicId: 'malformed' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 400) throw new Error('Expected 400 for malformed topicId');
    
    const fakeId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { topicId: fakeId }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 404) throw new Error('Expected 404 for nonexistent topicId');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { topicId: topicDSA._id.toString(), category: 'aptitude' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 400) throw new Error('Expected 400 for mismatched topicId and category');
    console.log('[PracticeFilterTest] PASS: Topic validation handled safely.');

    // M. Difficulty
    console.log('[PracticeFilterTest] Testing Difficulty Filtering...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { difficulty: 'Medium' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (!rs.body.data.some(q => q.difficulty === 'Medium') || rs.body.data.some(q => q.difficulty !== 'Medium')) {
      throw new Error('Difficulty filtering failed');
    }
    
    // N. Type
    console.log('[PracticeFilterTest] Testing Type Filtering...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { type: 'mcq' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.body.data.some(q => q.type !== 'mcq' && q.type !== 'MCQ')) throw new Error('Type filtering failed');
    
    // Q. Search
    console.log('[PracticeFilterTest] Testing Search Filtering...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { search: 'SearchTarget' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.body.data.length !== 2) throw new Error('Search failed, should match 2 items (DSA Q2, CS Q1)');

    // O. Combined Filters
    console.log('[PracticeFilterTest] Testing Combined Filters...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { category: 'dsa', difficulty: 'Medium' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.body.data.length !== 1 || rs.body.data[0].difficulty !== 'Medium' || rs.body.data[0].topicId.category !== 'dsa') {
      throw new Error('Combined filters failed');
    }

    // U/V. Response Safety
    console.log('[PracticeFilterTest] Testing Response Safety...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { topicId: topicDSA._id.toString() }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    const jsonStr = JSON.stringify(rs.body.data);
    if (jsonStr.includes('secret_dsa')) throw new Error('Solution code leaked!');
    
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { topicId: topicApt._id.toString() }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    const mcqJson = JSON.stringify(rs.body.data);
    if (mcqJson.includes('isCorrect')) throw new Error('MCQ isCorrect field leaked!');
    console.log('[PracticeFilterTest] PASS: Sensitive data (solutions, isCorrect) is not exposed.');

    // R. Empty result
    console.log('[PracticeFilterTest] Testing Empty Results...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { difficulty: 'Hard', type: 'coding' }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.body.data.length !== 0) throw new Error('Expected empty array');

    // T. Injection
    console.log('[PracticeFilterTest] Testing UserId Injection...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {}, { userId: adminUser._id.toString() }));
    await simulateRoute(filterPracticeQuestions, r, rs);
    if (rs.statusCode !== 200) throw new Error('Unexpected status on query parameter injection');
    console.log('[PracticeFilterTest] PASS: Unrecognized/Injection parameters ignored safely.');

    console.log('[PracticeFilterTest] === BACKEND PRACTICE FILTER VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[PracticeFilterTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[PracticeFilterTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[PracticeFilterTest] Cleanup complete.');
  }
};

runPracticeFilterVerification();
