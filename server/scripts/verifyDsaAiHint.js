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
import { getDSAAIHint } from '../src/controllers/dsaController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, body = {}, query = {}, params = {}, user = null) => {
  const req = { headers, body, query, params, user };
  const res = {
    statusCode: 200,
    body: null,
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

const runVerification = async () => {
  console.log('[DsaAiHintTest] Starting Phase 3 Step 17 Backend DSA AI Hint API Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[DsaAiHintTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    const student1 = await User.create({
      name: 'DSA Hint Test 1',
      email: `dsa-hint-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    const student2 = await User.create({
      name: 'DSA Hint Test 2',
      email: `dsa-hint-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    const adminUser = await User.create({
      name: 'DSA Hint Admin',
      email: `dsa-hint-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Arrays', title: 'Two Pointers', slug: `tp-hint-${Date.now()}`, order: 1000 });
    const topicAptitude = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Speed', slug: `speed-hint-${Date.now()}`, order: 1002 });
    createdIds.topics.push(topicDSA._id, topicAptitude._id);

    const qDSA = await Question.create({ topicId: topicDSA._id, title: 'Two Sum', slug: `two-sum-hint-${Date.now()}`, problemStatement: '...' });
    const qAptitude = await Question.create({ topicId: topicAptitude._id, title: 'Speed test', slug: `speed-test-hint-${Date.now()}`, problemStatement: '...' });
    createdIds.questions.push(qDSA._id, qAptitude._id);

    const attempt1 = await AttemptTrack.create({
      userId: student1._id,
      questionId: qDSA._id,
      category: 'dsa',
      submittedCode: 'wrong code',
      language: 'javascript',
      status: 'Wrong Answer',
      passedTestCases: 0,
      totalTestCases: 5,
      timeSpentSeconds: 60
    });
    createdIds.attempts.push(attempt1._id);

    console.log('[DsaAiHintTest] Created test accounts, topics, questions, and attempt.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // 1. Missing Token
    let { req: r, res: rs } = createMockReqRes({}, { questionId: qDSA._id.toString() });
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for POST without token, got ${rs.statusCode}`);
    
    // 2. Invalid Token
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid' }, { questionId: qDSA._id.toString() }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    
    // 3. Admin -> 403
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, { questionId: qDSA._id.toString() }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);

    // 4. Missing questionId -> 400
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { code: 'console.log("hi")' }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for missing questionId, got ${rs.statusCode}`);
    
    // 5. Invalid questionId -> 400
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { questionId: 'invalid123' }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for invalid questionId format, got ${rs.statusCode}`);
    
    // 6. Non-existent question -> 404
    const fakeId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { questionId: fakeId }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for non-existent question, got ${rs.statusCode}`);
    
    // 7. Non-DSA question -> 404
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { questionId: qAptitude._id.toString() }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for non-DSA question, got ${rs.statusCode}`);

    // 8. Student B cannot access Student A's attempt
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }, { questionId: qDSA._id.toString(), attemptId: attempt1._id.toString() }));
    await simulateRoute(getDSAAIHint, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Student B accessing Student A attempt, got ${rs.statusCode}`);
    console.log('[DsaAiHintTest] PASS: Student A cannot access Student B attempt');

    // 9. Valid request
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { 
      questionId: qDSA._id.toString(), 
      code: 'function twoSum() {}', 
      language: 'javascript',
      userId: student2._id.toString() // Injection attempt
    }));
    await simulateRoute(getDSAAIHint, r, rs);

    // Depending on whether Gemini is configured/available, it could be 200 or 503.
    if (rs.statusCode === 503) {
      console.log('[DsaAiHintTest] PASS: Gemini is unavailable. Endpoint returned safe 503 service unavailable without faking hint.');
    } else if (rs.statusCode === 200) {
      console.log('[DsaAiHintTest] PASS: Gemini is available and hint generated.');
      if (!rs.body.data || !rs.body.data.hint || rs.body.data.mentor !== 'DSA Mentor') {
        throw new Error('Response contract failed');
      }
      if (rs.body.data.hint.includes(process.env.GEMINI_API_KEY) && process.env.GEMINI_API_KEY) {
        throw new Error('API key leaked in response');
      }
    } else {
      throw new Error(`Unexpected status code for valid request: ${rs.statusCode}`);
    }

    console.log('[DsaAiHintTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    
    console.log('[DsaAiHintTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[DsaAiHintTest] === BACKEND DSA AI HINT API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DsaAiHintTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runVerification();
