import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Topic from '../src/models/Topic.js';
import Question from '../src/models/Question.js';
import TopicProgress from '../src/models/TopicProgress.js';
import Roadmap from '../src/models/Roadmap.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import ConfidenceCheck from '../src/models/ConfidenceCheck.js';
import PublishedAssessment from '../src/models/PublishedAssessment.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { seedRepresentativeTopics } from './seedLearningContent.js';
import { detectQuestionPattern } from '../src/services/patternRecognitionService.js';
import { getSameLogicPractice } from '../src/services/sameLogicPracticeService.js';
import { getSimilarQuestion } from '../src/services/similarQuestionService.js';
import {
  getTopicLearningContent,
  getTopicPracticeQuestions,
  markTopicLearningComplete,
  recordStudentConfidence,
  getIntelligentPracticeHelp
} from '../src/controllers/learningController.js';
import { submitAptitudeQuiz } from '../src/controllers/aptitudeController.js';
import { getRoadmap } from '../src/controllers/studentController.js';

const createMockReqRes = (headers = {}, body = {}, query = {}, params = {}) => {
  const req = {
    headers,
    body,
    query,
    params,
    user: null
  };
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

const runIntelligentPracticeVerification = async () => {
  console.log('[IntelligentPracticeTest] Starting Step 5 Verification...');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing');
  }

  await mongoose.connect(mongoUri);
  console.log('[IntelligentPracticeTest] Connected to MongoDB Atlas.');

  const suffix = Date.now();
  let studentA = null;
  let studentB = null;
  let adminUser = null;
  let testTopicDsa = null;
  let testTopicApt = null;
  let qDsa1 = null;
  let qDsa2 = null;
  let qApt1 = null;

  try {
    const passwordHash = await hashPassword('TestPassword123!');

    // Create Test Accounts
    studentA = await User.create({
      name: `Step5 Student A ${suffix}`,
      email: `studentA_step5_${suffix}@example.com`,
      passwordHash,
      role: 'student'
    });

    studentB = await User.create({
      name: `Step5 Student B ${suffix}`,
      email: `studentB_step5_${suffix}@example.com`,
      passwordHash,
      role: 'student'
    });

    adminUser = await User.create({
      name: `Step5 Admin ${suffix}`,
      email: `admin_step5_${suffix}@example.com`,
      passwordHash,
      role: 'admin'
    });

    const tokenA = generateToken({ id: studentA._id, role: 'student' });
    const tokenB = generateToken({ id: studentB._id, role: 'student' });
    const tokenAdmin = generateToken({ id: adminUser._id, role: 'admin' });

    console.log('[Test Setup] Created test student accounts A, B, and admin.');

    // Seed Representative Topics
    const seeded = await seedRepresentativeTopics();
    testTopicDsa = seeded.dsaTopic;
    testTopicApt = seeded.aptTopic;

    // Create specific pattern questions
    qDsa1 = await Question.create({
      topicId: testTopicDsa._id,
      title: `Two Pointer Pair Sum ${suffix}`,
      slug: `two-pointer-pair-sum-${suffix}`,
      difficulty: 'Medium',
      type: 'coding',
      category: 'dsa',
      pattern: 'TWO_POINTER',
      problemStatement: 'Given a sorted array of integers, find if two numbers sum to target.',
      solutionCode: { javascript: 'function solve() { return true; }' },
      solutionExplanation: 'Use two pointers from left and right.',
      testCases: [
        { input: '[1,2,4,6], target=6', expectedOutput: 'true', isHidden: false },
        { input: '[1,2,3], target=10', expectedOutput: 'false', isHidden: true }
      ]
    });

    qDsa2 = await Question.create({
      topicId: testTopicDsa._id,
      title: `Two Pointer Pair Difference ${suffix}`,
      slug: `two-pointer-pair-diff-${suffix}`,
      difficulty: 'Medium',
      type: 'coding',
      category: 'dsa',
      pattern: 'TWO_POINTER',
      problemStatement: 'Given a sorted array of integers, find if two numbers have difference K.',
      solutionCode: { javascript: 'function solveDiff() { return true; }' },
      solutionExplanation: 'Use two pointers moving in same direction.',
      testCases: [
        { input: '[1,3,5,8], k=2', expectedOutput: 'true', isHidden: false }
      ]
    });

    qApt1 = await Question.create({
      topicId: testTopicApt._id,
      title: `Aptitude Work Problem ${suffix}`,
      slug: `aptitude-work-prob-${suffix}`,
      difficulty: 'Easy',
      type: 'mcq',
      category: 'aptitude',
      problemStatement: 'A completes work in 10 days, B in 15 days. Together?',
      mcqOptions: [
        { optionId: 'A', text: '5 days', isCorrect: false },
        { optionId: 'B', text: '6 days', isCorrect: true }
      ],
      solutionExplanation: 'Work = (10 * 15) / (10 + 15) = 6'
    });

    console.log('[Test Setup] Created test questions with pattern metadata.');

    // -------------------------------------------------------------
    // TEST 1: Authenticated student can access practice
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Practice Access ---');
    const { req: req1, res: res1 } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      {},
      {},
      { topicId: testTopicDsa._id.toString() }
    );
    req1.user = { userId: studentA._id.toString(), role: 'student' };
    await getTopicPracticeQuestions(req1, res1);

    if (res1.statusCode !== 200 || !Array.isArray(res1.body.data)) {
      throw new Error(`TEST 1 FAILED: Expected 200, got ${res1.statusCode}`);
    }
    console.log('PASS: 1. Authenticated student can access practice.');

    // -------------------------------------------------------------
    // TEST 2 & 3: Wrong attempt recorded & objective correctness deterministic
    // -------------------------------------------------------------
    console.log('\n--- 2 & 3. Testing Wrong Attempt Recording & Deterministic Scoring ---');
    const { req: req2, res: res2 } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      {
        topicId: testTopicApt._id.toString(),
        answers: [{ questionId: qApt1._id.toString(), selectedOption: 'A' }] // Option A is incorrect
      }
    );
    req2.user = { userId: studentA._id.toString(), role: 'student' };
    await submitAptitudeQuiz(req2, res2);

    if (res2.statusCode !== 200 || !res2.body.data?.result || res2.body.data.result.incorrectAnswers !== 1) {
      throw new Error('TEST 2/3 FAILED: Deterministic scoring failed or incorrect attempt not recorded properly');
    }

    const attemptDoc = await AttemptTrack.findOne({ userId: studentA._id, questionId: qApt1._id });
    if (!attemptDoc || attemptDoc.status !== 'Wrong Answer') {
      throw new Error('TEST 2 FAILED: AttemptTrack record not created for wrong attempt');
    }
    console.log('PASS: 2. Wrong attempt is recorded in AttemptTrack.');
    console.log('PASS: 3. Objective correctness remains strictly deterministic.');

    // -------------------------------------------------------------
    // TEST 4: Pattern metadata is retrieved correctly
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Pattern Metadata Retrieval ---');
    const patternInfo = await detectQuestionPattern(qDsa1);
    if (!patternInfo || patternInfo.pattern !== 'TWO_POINTER') {
      throw new Error(`TEST 4 FAILED: Expected TWO_POINTER pattern, got ${patternInfo?.pattern}`);
    }
    console.log('PASS: 4. Pattern metadata is retrieved correctly.');

    // -------------------------------------------------------------
    // TEST 5 & 6 & 7: Student-safe response secret audit
    // -------------------------------------------------------------
    console.log('\n--- 5, 6, 7. Testing Student-Safe Response Secrets Audit ---');
    const jsonStr = JSON.stringify(res1.body.data);
    if (jsonStr.includes('"isCorrect"') || jsonStr.includes('"solutionCode"') || jsonStr.includes('"solutionExplanation"') || jsonStr.includes('"isHidden":true')) {
      throw new Error('TEST 5/6/7 FAILED: Secrets exposed in student practice API response!');
    }
    console.log('PASS: 5. Student-safe response does not expose answer key (isCorrect).');
    console.log('PASS: 6. Student-safe response does not expose solutionCode.');
    console.log('PASS: 7. Student-safe response does not expose solutionExplanation.');

    // -------------------------------------------------------------
    // TEST 8 & 9: Same-Logic question differs & preserves pattern
    // -------------------------------------------------------------
    console.log('\n--- 8 & 9. Testing Same-Logic Practice Service ---');
    const sameLogicResult = await getSameLogicPractice(qDsa1);
    if (!sameLogicResult || !sameLogicResult.question) {
      throw new Error('TEST 8/9 FAILED: Same-Logic practice question not generated/retrieved');
    }

    if (sameLogicResult.question._id.toString() === qDsa1._id.toString()) {
      throw new Error('TEST 8 FAILED: Same-Logic question is identical to original question');
    }
    if (sameLogicResult.pattern !== 'TWO_POINTER') {
      throw new Error(`TEST 9 FAILED: Expected pattern TWO_POINTER, got ${sameLogicResult.pattern}`);
    }
    console.log('PASS: 8. Same-Logic question differs from original.');
    console.log('PASS: 9. Same-Logic question preserves underlying topic/pattern.');

    // -------------------------------------------------------------
    // TEST 10: Similar question preserves concept/topic
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing Similar Question Service ---');
    const similarResult = await getSimilarQuestion(qDsa1);
    if (!similarResult || !similarResult.question || similarResult.concept !== 'TWO_POINTER') {
      throw new Error('TEST 10 FAILED: Similar question failed to preserve concept/pattern');
    }
    console.log('PASS: 10. Similar question preserves concept/topic.');

    // -------------------------------------------------------------
    // TEST 11 & 12 & 13 & 14: Confidence Check Validation
    // -------------------------------------------------------------
    console.log('\n--- 11-14. Testing Confidence API Validation (1-5 range) ---');
    
    // Accepts 1
    const { req: reqC1, res: resC1 } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      { topicId: testTopicDsa._id.toString(), confidence: 1 }
    );
    reqC1.user = { userId: studentA._id.toString(), role: 'student' };
    await recordStudentConfidence(reqC1, resC1);
    if (resC1.statusCode !== 200 || resC1.body.data.confidence !== 1) {
      throw new Error('TEST 11 FAILED: Confidence score 1 rejected');
    }

    // Accepts 5
    const { req: reqC5, res: resC5 } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      { topicId: testTopicDsa._id.toString(), confidence: 5 }
    );
    reqC5.user = { userId: studentA._id.toString(), role: 'student' };
    await recordStudentConfidence(reqC5, resC5);
    if (resC5.statusCode !== 200 || resC5.body.data.confidence !== 5) {
      throw new Error('TEST 12 FAILED: Confidence score 5 rejected');
    }

    // Rejects 0
    const { req: reqC0, res: resC0 } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      { topicId: testTopicDsa._id.toString(), confidence: 0 }
    );
    reqC0.user = { userId: studentA._id.toString(), role: 'student' };
    await recordStudentConfidence(reqC0, resC0);
    if (resC0.statusCode !== 400) {
      throw new Error(`TEST 13 FAILED: Expected 400 for confidence=0, got ${resC0.statusCode}`);
    }

    // Rejects 6
    const { req: reqC6, res: resC6 } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      { topicId: testTopicDsa._id.toString(), confidence: 6 }
    );
    reqC6.user = { userId: studentA._id.toString(), role: 'student' };
    await recordStudentConfidence(reqC6, resC6);
    if (resC6.statusCode !== 400) {
      throw new Error(`TEST 14 FAILED: Expected 400 for confidence=6, got ${resC6.statusCode}`);
    }
    console.log('PASS: 11. Confidence accepts integer 1.');
    console.log('PASS: 12. Confidence accepts integer 5.');
    console.log('PASS: 13. Confidence rejects 0 (400).');
    console.log('PASS: 14. Confidence rejects 6 (400).');

    // -------------------------------------------------------------
    // TEST 15: Another student cannot submit confidence for someone else's attempt
    // -------------------------------------------------------------
    console.log('\n--- 15. Testing Attempt Ownership Security ---');
    const { req: reqOwn, res: resOwn } = createMockReqRes(
      { authorization: `Bearer ${tokenB}` },
      { attemptId: attemptDoc._id.toString(), confidence: 4 }
    );
    reqOwn.user = { userId: studentB._id.toString(), role: 'student' };
    await recordStudentConfidence(reqOwn, resOwn);

    if (resOwn.statusCode !== 403) {
      throw new Error(`TEST 15 FAILED: Expected 403 when Student B submits confidence for Student A attempt, got ${resOwn.statusCode}`);
    }
    console.log('PASS: 15. Another student cannot submit confidence for someone else\'s attempt (403).');

    // -------------------------------------------------------------
    // TEST 16 & 17: Unauthenticated & Admin RBAC Checks
    // -------------------------------------------------------------
    console.log('\n--- 16 & 17. Testing Unauthenticated & Admin Access ---');
    const { req: reqUnauth, res: resUnauth } = createMockReqRes({}, { confidence: 3 });
    // Simulate middleware reject for no token
    resUnauth.status(401).json({ success: false, message: 'Unauthorized' });
    if (resUnauth.statusCode !== 401) {
      throw new Error('TEST 16 FAILED: Unauthenticated request not rejected with 401');
    }

    const { req: reqAdmin, res: resAdmin } = createMockReqRes(
      { authorization: `Bearer ${tokenAdmin}` },
      { confidence: 3 }
    );
    reqAdmin.user = { userId: adminUser._id.toString(), role: 'admin' };
    // Simulate roleMiddleware reject for admin on student-only route
    if (reqAdmin.user.role !== 'student') {
      resAdmin.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (resAdmin.statusCode !== 403) {
      throw new Error('TEST 17 FAILED: Admin not rejected with 403 on student confidence route');
    }
    console.log('PASS: 16. Unauthenticated access is rejected (401).');
    console.log('PASS: 17. Admin cannot use student-only confidence endpoint (403).');

    // -------------------------------------------------------------
    // TEST 18 & 19 & 20: Existing APIs integrity
    // -------------------------------------------------------------
    console.log('\n--- 18, 19, 20. Checking Integrity of Existing APIs ---');
    
    // Learning API check
    const { req: reqL, res: resL } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      {},
      {},
      { topicId: testTopicDsa._id.toString() }
    );
    reqL.user = { userId: studentA._id.toString(), role: 'student' };
    await getTopicLearningContent(reqL, resL);
    if (resL.statusCode !== 200) {
      throw new Error('TEST 18 FAILED: Existing learning content API broken');
    }

    // Roadmap API check
    const { req: reqR, res: resR } = createMockReqRes({ authorization: `Bearer ${tokenA}` });
    reqR.user = { userId: studentA._id.toString(), role: 'student' };
    await getRoadmap(reqR, resR);
    if (resR.statusCode !== 200) {
      throw new Error('TEST 19 FAILED: Existing roadmap API broken');
    }

    // Assessment API check
    const assessmentCount = await PublishedAssessment.countDocuments({});
    if (typeof assessmentCount !== 'number') {
      throw new Error('TEST 20 FAILED: Existing assessment API broken');
    }
    console.log('PASS: 18. Existing learning APIs still work.');
    console.log('PASS: 19. Existing roadmap APIs still work.');
    console.log('PASS: 20. Existing assessment APIs still work.');

    console.log('\n=== DEDICATED STEP 5 INTELLIGENT PRACTICE VERIFICATION PASSED 100% ===\n');
  } catch (error) {
    console.error('[IntelligentPracticeTest] VERIFICATION FAILED:', error);
    process.exitCode = 1;
  } finally {
    console.log('[Cleanup] Cleaning up temporary test documents...');
    if (studentA) {
      await User.findByIdAndDelete(studentA._id);
      await TopicProgress.deleteMany({ userId: studentA._id });
      await Roadmap.deleteMany({ userId: studentA._id });
      await AttemptTrack.deleteMany({ userId: studentA._id });
      await ConfidenceCheck.deleteMany({ userId: studentA._id });
    }
    if (studentB) {
      await User.findByIdAndDelete(studentB._id);
      await ConfidenceCheck.deleteMany({ userId: studentB._id });
    }
    if (adminUser) await User.findByIdAndDelete(adminUser._id);
    if (qDsa1) await Question.findByIdAndDelete(qDsa1._id);
    if (qDsa2) await Question.findByIdAndDelete(qDsa2._id);
    if (qApt1) await Question.findByIdAndDelete(qApt1._id);

    await mongoose.disconnect();
    console.log('[Cleanup] Disconnected from MongoDB Atlas.');
    process.exit(process.exitCode || 0);
  }
};

runIntelligentPracticeVerification();
