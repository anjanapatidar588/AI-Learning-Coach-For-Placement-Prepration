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
import { submitAptitudeQuiz } from '../src/controllers/aptitudeController.js';
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

const runAptitudeQuizSubmitVerification = async () => {
  console.log('[AptitudeQuizSubmitTest] Starting Phase 3 Step 20 Backend Aptitude Quiz Submit Verification...');
  const createdIds = { users: [], topics: [], questions: [], attempts: [] };

  try {
    await connectDB();
    console.log('[AptitudeQuizSubmitTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create students
    const student1 = await User.create({
      name: 'Apt Submit S1',
      email: `apt-submit-s1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const student1Token = generateToken({ id: student1._id, role: student1.role });

    const student2 = await User.create({
      name: 'Apt Submit S2',
      email: `apt-submit-s2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const student2Token = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'Apt Submit Admin',
      email: `apt-submit-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics
    const topicApt1 = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Percentages', slug: `perc-submit-${Date.now()}`, order: 1000 });
    const topicApt2 = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Speed', slug: `speed-submit-${Date.now()}`, order: 1001 });
    const topicDSA = await Topic.create({ category: 'dsa', subject: 'Arrays', title: 'Two Pointers', slug: `tp-submit-${Date.now()}`, order: 1002 });
    createdIds.topics.push(topicApt1._id, topicApt2._id, topicDSA._id);

    // Create Questions
    const q1 = await Question.create({
      topicId: topicApt1._id, title: 'Q1', slug: `q1-${Date.now()}`, type: 'mcq', problemStatement: '...',
      mcqOptions: [ { optionId: 'A', isCorrect: false }, { optionId: 'B', isCorrect: true } ]
    });
    const q2 = await Question.create({
      topicId: topicApt1._id, title: 'Q2', slug: `q2-${Date.now()}`, type: 'mcq', problemStatement: '...',
      mcqOptions: [ { optionId: 'A', isCorrect: true }, { optionId: 'B', isCorrect: false } ]
    });
    const q3 = await Question.create({
      topicId: topicApt1._id, title: 'Q3', slug: `q3-${Date.now()}`, type: 'mcq', problemStatement: '...',
      mcqOptions: [ { optionId: 'C', isCorrect: true }, { optionId: 'D', isCorrect: false } ]
    });
    const qApt2 = await Question.create({
      topicId: topicApt2._id, title: 'Q4', slug: `q4-${Date.now()}`, type: 'mcq', problemStatement: '...'
    });
    const qDSA = await Question.create({
      topicId: topicDSA._id, title: 'Two Sum', slug: `two-sum-submit-${Date.now()}`, type: 'coding', problemStatement: '...'
    });
    createdIds.questions.push(q1._id, q2._id, q3._id, qApt2._id, qDSA._id);

    console.log('[AptitudeQuizSubmitTest] Created test accounts, topics, and questions.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A. Authentication
    console.log('[AptitudeQuizSubmitTest] Testing POST without token...');
    let { req: r, res: rs } = createMockReqRes({}, { topicId: topicApt1._id.toString(), answers: [] });
    await simulateRoute(submitAptitudeQuiz, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    
    console.log('[AptitudeQuizSubmitTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, { topicId: topicApt1._id.toString(), answers: [] }));
    await simulateRoute(submitAptitudeQuiz, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    
    console.log('[AptitudeQuizSubmitTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, { topicId: topicApt1._id.toString(), answers: [] }));
    await simulateRoute(submitAptitudeQuiz, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[AptitudeQuizSubmitTest] PASS: Auth/RBAC working correctly.');

    // B. Valid Submission & E. Question validation & F. Answer validation
    console.log('[AptitudeQuizSubmitTest] Testing valid partial submission with invalid/duplicate answers mixed in...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student1Token}` }, {
      topicId: topicApt1._id.toString(),
      score: 100, // C. Score manipulation attempt
      accuracy: 100, // C. Score manipulation attempt
      userId: student2._id.toString(), // D. Ownership manipulation attempt
      answers: [
        { questionId: q1._id.toString(), selectedOption: 'B' }, // Correct
        { questionId: q2._id.toString(), selectedOption: 'B' }, // Incorrect
        { questionId: q2._id.toString(), selectedOption: 'A' }, // Duplicate (should be ignored)
        { questionId: qApt2._id.toString(), selectedOption: 'A' }, // Wrong topic
        { questionId: qDSA._id.toString(), selectedOption: 'A' }, // DSA topic
        { questionId: new mongoose.Types.ObjectId().toString(), selectedOption: 'A' }, // Non-existent
        { questionId: q3._id.toString(), selectedOption: 'InvalidOption' } // Invalid option format -> just marked wrong safely
      ]
    }));
    await simulateRoute(submitAptitudeQuiz, r, rs);
    
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode} - ${JSON.stringify(rs.body)}`);
    
    const resData = rs.body.data;
    
    // G. Sensitive response protection
    if (resData.result.correctAnswer !== undefined || resData.isCorrect !== undefined) {
      throw new Error('SECURITY FAILURE: Sensitive data returned in response');
    }
    
    // Check results logic
    const { totalQuestions, attemptedQuestions, correctAnswers, incorrectAnswers, unansweredQuestions, accuracy } = resData.result;
    
    if (totalQuestions !== 3) throw new Error(`Expected 3 total questions in topic, got ${totalQuestions}`);
    if (attemptedQuestions !== 3) throw new Error(`Expected 3 attempted (q1, q2, q3), got ${attemptedQuestions}`);
    if (correctAnswers !== 1) throw new Error(`Expected 1 correct (q1), got ${correctAnswers}`);
    if (incorrectAnswers !== 2) throw new Error(`Expected 2 incorrect (q2 wrong, q3 invalid opt), got ${incorrectAnswers}`);
    if (unansweredQuestions !== 0) throw new Error(`Expected 0 unanswered, got ${unansweredQuestions}`);
    if (accuracy !== 33) throw new Error(`Expected accuracy 33, got ${accuracy}`);

    console.log('[AptitudeQuizSubmitTest] PASS: Backend properly calculated score, ignored faked client scores, and dropped invalid/duplicate questions.');
    console.log('[AptitudeQuizSubmitTest] PASS: Identity injection correctly ignored.');

    // H. AttemptTrack
    const attemptIds = resData.attemptIds;
    if (!Array.isArray(attemptIds) || attemptIds.length !== 3) {
      throw new Error(`Expected 3 AttemptTrack records, got ${attemptIds?.length}`);
    }
    createdIds.attempts.push(...attemptIds);

    const dbAttempts = await AttemptTrack.find({ _id: { $in: attemptIds } });
    for (const attempt of dbAttempts) {
      if (attempt.userId.toString() !== student1._id.toString()) {
        throw new Error('SECURITY FAILURE: Attempt tracked under wrong userId due to injection!');
      }
      if (attempt.category !== 'aptitude') throw new Error('Attempt category must be aptitude');
    }
    
    const q1Attempt = dbAttempts.find(a => a.questionId.toString() === q1._id.toString());
    const q2Attempt = dbAttempts.find(a => a.questionId.toString() === q2._id.toString());
    const q3Attempt = dbAttempts.find(a => a.questionId.toString() === q3._id.toString());

    if (!q1Attempt || q1Attempt.status !== 'Accepted') throw new Error('Q1 attempt not recorded as Accepted');
    if (!q2Attempt || q2Attempt.status !== 'Wrong Answer') throw new Error('Q2 attempt not recorded as Wrong Answer');
    if (!q3Attempt || q3Attempt.status !== 'Wrong Answer') throw new Error('Q3 attempt not recorded as Wrong Answer');
    
    const invalidAttempts = await AttemptTrack.find({ questionId: { $in: [qApt2._id, qDSA._id] } });
    if (invalidAttempts.length > 0) throw new Error('Created attempts for questions outside the topic/category!');

    console.log('[AptitudeQuizSubmitTest] PASS: AttemptTrack records verified.');

    // F. Partially answered quiz
    console.log('[AptitudeQuizSubmitTest] Testing partially answered quiz...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${student2Token}` }, {
      topicId: topicApt1._id.toString(),
      answers: [
        { questionId: q1._id.toString(), selectedOption: 'B' }
      ]
    }));
    await simulateRoute(submitAptitudeQuiz, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    createdIds.attempts.push(...rs.body.data.attemptIds);

    const partialRes = rs.body.data.result;
    if (partialRes.totalQuestions !== 3 || partialRes.attemptedQuestions !== 1 || partialRes.unansweredQuestions !== 2 || partialRes.accuracy !== 33) {
      throw new Error('Partial quiz calculation is incorrect');
    }
    console.log('[AptitudeQuizSubmitTest] PASS: Partially answered quiz calculated correctly.');

    console.log('[AptitudeQuizSubmitTest] === BACKEND APTITUDE QUIZ SUBMIT VERIFICATION PASSED ===');

  } catch (error) {
    console.error(`[AptitudeQuizSubmitTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[AptitudeQuizSubmitTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[AptitudeQuizSubmitTest] Cleanup complete.');
  }
};

runAptitudeQuizSubmitVerification();
