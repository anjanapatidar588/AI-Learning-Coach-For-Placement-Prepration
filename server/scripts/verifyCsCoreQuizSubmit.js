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
import AttemptTrack from '../src/models/AttemptTrack.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { submitCSCoreQuiz } from '../src/controllers/csCoreController.js';
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

const runCsCoreQuizSubmitVerification = async () => {
  console.log('[CsCoreQuizSubmitTest] Starting Phase 3 Step 24 Backend CS Core Quiz Submit Verification...');
  const createdIds = { users: [], topics: [], questions: [], attempts: [] };

  try {
    await connectDB();
    console.log('[CsCoreQuizSubmitTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create accounts
    const student1 = await User.create({ name: 'CS Quiz S1', email: `cs-quiz-s1-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'CS Quiz Admin', email: `cs-quiz-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
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

    console.log('[CsCoreQuizSubmitTest] Creating test topics and questions...');
    
    // Create Topics
    const topicDBMS = await Topic.create({ category: 'cs_core', subject: 'DBMS', title: 'Normalization', slug: `norm-cs-${Date.now()}` });
    const topicOS = await Topic.create({ category: 'cs_core', subject: 'OS', title: 'Paging', slug: `paging-cs-${Date.now()}` });
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Arrays', title: 'Two Pointers', slug: `tp-cs-${Date.now()}` });
    
    createdIds.topics.push(topicDBMS._id, topicOS._id, topicDSA._id);
    
    // Create Questions for DBMS
    const q1 = await Question.create({
      topicId: topicDBMS._id, title: 'DBMS Q1', slug: `dbms-q1-${Date.now()}`, type: 'mcq', problemStatement: 'What is 1NF?',
      mcqOptions: [ { optionId: 'A', text: 'Atomic', isCorrect: true }, { optionId: 'B', text: 'Multi', isCorrect: false } ],
      solutionCode: { javascript: 'secret1' }, testCases: [{ input: '1', expectedOutput: '1', isHidden: true }]
    });
    const q2 = await Question.create({
      topicId: topicDBMS._id, title: 'DBMS Q2', slug: `dbms-q2-${Date.now()}`, type: 'mcq', problemStatement: 'What is 2NF?',
      mcqOptions: [ { optionId: 'A', text: 'Partial', isCorrect: false }, { optionId: 'B', text: 'Full', isCorrect: true } ]
    });

    // Create Question for OS
    const qOS = await Question.create({
      topicId: topicOS._id, title: 'OS Q1', slug: `os-q1-${Date.now()}`, type: 'mcq', problemStatement: 'What is Paging?',
      mcqOptions: [ { optionId: 'A', text: 'Frames', isCorrect: true } ]
    });

    // Create Question for DSA
    const qDSA = await Question.create({
      topicId: topicDSA._id, title: 'DSA Q1', slug: `dsa-q1-${Date.now()}`, type: 'mcq', problemStatement: 'Two Pointers?',
      mcqOptions: [ { optionId: 'A', text: 'Yes', isCorrect: true } ]
    });

    createdIds.questions.push(q1._id, q2._id, qOS._id, qDSA._id);
    console.log('[CsCoreQuizSubmitTest] Created test documents.');

    // A/B/C. Authentication
    console.log('[CsCoreQuizSubmitTest] Testing Authentication...');
    let { req: r, res: rs } = createMockReqRes({}, { topicId: topicDBMS._id.toString(), answers: [] });
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for missing token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, { topicId: topicDBMS._id.toString(), answers: [] }));
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for invalid token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, { topicId: topicDBMS._id.toString(), answers: [] }));
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 403) throw new Error('Expected 403 for Admin');
    console.log('[CsCoreQuizSubmitTest] PASS: Auth/RBAC working correctly.');

    // N/O/P. Topic Validation & Empty Submit
    console.log('[CsCoreQuizSubmitTest] Testing Topic Validation and Empty Submit...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, { topicId: 'malformed_id', answers: [] }));
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 400) throw new Error('Expected 400 for malformed topicId');

    const fakeTopicId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, { topicId: fakeTopicId, answers: [] }));
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 404) throw new Error('Expected 404 for nonexistent topic');

    // Attempt DSA topic submission on CS Core route
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, { topicId: topicDSA._id.toString(), answers: [] }));
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 404) throw new Error('Expected 404 when submitting DSA topic to CS Core endpoint');

    // Valid topic, empty answers
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, { topicId: topicDBMS._id.toString(), answers: [] }));
    await simulateRoute(submitCSCoreQuiz, r, rs);
    if (rs.statusCode !== 200 || rs.body.data.result.totalQuestions !== 2 || rs.body.data.result.attemptedQuestions !== 0) {
      throw new Error('Empty answers submission failed to return correct initial result state');
    }
    console.log('[CsCoreQuizSubmitTest] PASS: Validation handled safely.');

    // D/E/F/G/H/I/J/K/L/M/Q/R/S/T. Real Submission Logic
    console.log('[CsCoreQuizSubmitTest] Testing Complex Valid Submission...');
    const mixedAnswers = [
      { questionId: q1._id.toString(), selectedOption: 'A', timeSpentSeconds: 15 }, // Correct
      { questionId: q1._id.toString(), selectedOption: 'B', timeSpentSeconds: 10 }, // Duplicate q1, should be ignored
      { questionId: q2._id.toString(), selectedOption: 'A', timeSpentSeconds: 20 }, // Incorrect
      { questionId: qOS._id.toString(), selectedOption: 'A' }, // Other topic's question (OS), should be ignored
      { questionId: qDSA._id.toString(), selectedOption: 'A' }, // DSA question, should be ignored
      { questionId: fakeTopicId, selectedOption: 'A' }, // Nonexistent/Invalid question, should be ignored
      { questionId: 'malformed_q_id', selectedOption: 'B' } // Malformed qId, ignored
    ];

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {
      topicId: topicDBMS._id.toString(),
      answers: mixedAnswers,
      userId: adminUser._id.toString(), // E/S. Identity injection attempt
      score: 100, // F. Fake score injection
      accuracy: 100 // G. Fake accuracy injection
    }));
    await simulateRoute(submitCSCoreQuiz, r, rs);

    if (rs.statusCode !== 200) throw new Error(`Submission failed with status: ${rs.statusCode}`);
    
    const result = rs.body.data.result;
    
    // Evaluate Result Object
    if (result.totalQuestions !== 2) throw new Error('Total questions should be 2 (for DBMS topic)');
    if (result.attemptedQuestions !== 2) throw new Error('Attempted questions should be 2 (q1 and q2)');
    if (result.correctAnswers !== 1) throw new Error('Correct answers should be exactly 1');
    if (result.incorrectAnswers !== 1) throw new Error('Incorrect answers should be exactly 1');
    if (result.unansweredQuestions !== 0) throw new Error('Unanswered questions should be exactly 0');
    if (result.accuracy !== 50) throw new Error('Accuracy should be 50%');
    console.log('[CsCoreQuizSubmitTest] PASS: Server-side calculation ignores duplicates, fakes, and cross-category attempts.');
    
    // Evaluate Data Leakage (T)
    const jsonStr = JSON.stringify(rs.body);
    if (jsonStr.includes('secret1') || jsonStr.includes('solutionCode') || jsonStr.includes('isCorrect')) {
      throw new Error('Sensitive question fields leaked in response!');
    }

    // Evaluate AttemptTrack Records
    const attemptIds = rs.body.data.attemptIds;
    if (!Array.isArray(attemptIds) || attemptIds.length !== 2) throw new Error('Should have created exactly 2 attempts');
    createdIds.attempts.push(...attemptIds);

    const attempts = await AttemptTrack.find({ _id: { $in: attemptIds } });
    if (attempts.length !== 2) throw new Error('Failed to fetch AttemptTracks');
    
    for (const attempt of attempts) {
      if (attempt.userId.toString() !== student1._id.toString()) throw new Error('Identity injection bypassed token!');
      if (attempt.category !== 'cs_core') throw new Error('AttemptTrack category must be cs_core');
      if (attempt.questionId.toString() !== q1._id.toString() && attempt.questionId.toString() !== q2._id.toString()) {
        throw new Error('Saved attempt for invalid question ID');
      }
      if (attempt.questionId.toString() === q1._id.toString() && attempt.status !== 'Accepted') throw new Error('q1 should be Accepted');
      if (attempt.questionId.toString() === q2._id.toString() && attempt.status !== 'Wrong Answer') throw new Error('q2 should be Wrong Answer');
    }
    console.log('[CsCoreQuizSubmitTest] PASS: AttemptTrack records successfully logged securely.');
    console.log('[CsCoreQuizSubmitTest] === BACKEND CS CORE QUIZ SUBMIT VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[CsCoreQuizSubmitTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[CsCoreQuizSubmitTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[CsCoreQuizSubmitTest] Cleanup complete.');
  }
};

runCsCoreQuizSubmitVerification();
