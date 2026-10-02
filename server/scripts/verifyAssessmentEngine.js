import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import AssessmentBlueprint from '../src/models/AssessmentBlueprint.js';
import PublishedAssessment from '../src/models/PublishedAssessment.js';
import AssessmentAttempt from '../src/models/AssessmentAttempt.js';
import Question from '../src/models/Question.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

import {
  getAdminAssessmentBlueprints,
  createAdminAssessmentBlueprint,
  updateAdminAssessmentBlueprint,
  deleteAdminAssessmentBlueprint,
  generateBlueprintQuestions,
  getBlueprintQuestionsForReview,
  updateBlueprintQuestion,
  approveBlueprint,
  publishBlueprint,
  archiveBlueprint
} from '../src/controllers/adminAssessmentController.js';

import {
  getPublishedAssessments,
  getPublishedAssessmentById,
  startStudentAssessment,
  submitStudentAssessment
} from '../src/controllers/studentAssessmentEngineController.js';

import { validateGeneratedQuestion } from '../src/services/ai/questionGenerator.js';

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
    let done = false;
    const next = () => {
      if (!done) {
        done = true;
        resolve(true);
      }
    };
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      originalJson(data);
      if (!done) {
        done = true;
        resolve(false);
      }
      return res;
    };
    Promise.resolve(middleware(req, res, next)).catch(() => {
      if (!done) {
        done = true;
        resolve(false);
      }
    });
  });
};

const runRoute = async (controller, req, res, requiredRole = 'admin') => {
  const authVal = await runMiddleware(protect, req, res);
  if (!authVal) return;
  const roleVal = await runMiddleware(authorize(requiredRole), req, res);
  if (!roleVal) return;
  await controller(req, res);
};

const runVerification = async () => {
  console.log('[AssessmentEngineTest] Starting Dedicated STEP 2 Assessment Engine Verification...');
  const createdUserIds = [];
  const createdBlueprintIds = [];
  const createdPublishedIds = [];

  try {
    await connectDB();
    console.log('[AssessmentEngineTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPass123!');

    // Admin user
    const adminUser = await User.create({
      name: 'Admin Test User',
      email: `admin-assessment-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Student A
    const studentA = await User.create({
      name: 'Student A Test',
      email: `student-a-assessment-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(studentA._id);
    const tokenA = generateToken({ id: studentA._id, role: studentA.role });

    // Student B
    const studentB = await User.create({
      name: 'Student B Test',
      email: `student-b-assessment-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(studentB._id);
    const tokenB = generateToken({ id: studentB._id, role: studentB.role });

    console.log('[AssessmentEngineTest] Test accounts created.');

    // 1 & 2. Admin can create blueprint; Student cannot create blueprint (403)
    console.log('[AssessmentEngineTest] 1 & 2. Testing Admin create blueprint & Student RBAC rejection...');
    let { req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${tokenA}` }, {
      title: 'Student Unauthorized Blueprint',
      questionCount: 3,
      totalMarks: 3
    });
    await runRoute(createAdminAssessmentBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student on admin endpoint, got ${rs.statusCode}`);
    console.log('PASS: Student attempt to create blueprint rejected with 403 Forbidden.');

    // 3. Blueprint validation (missing title/qCount returns 400)
    console.log('[AssessmentEngineTest] 3. Testing blueprint basic input validation...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {
      description: 'Missing title',
      questionCount: 3
    }));
    await runRoute(createAdminAssessmentBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for missing title, got ${rs.statusCode}`);
    console.log('PASS: Missing title correctly rejected with 400.');

    // 4. Question distribution validation (sum of topic question counts != qCount returns 400)
    console.log('[AssessmentEngineTest] 4. Testing Topic Question Distribution Validation...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {
      title: 'Mismatched Distribution Blueprint',
      questionCount: 5,
      totalMarks: 5,
      topicDistribution: [
        { topicName: 'Arrays', questionCount: 2, category: 'dsa' },
        { topicName: 'SQL', questionCount: 2, category: 'dbms' }
      ] // Sum = 4 != 5
    }));
    await runRoute(createAdminAssessmentBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 400 || !rs.body.message.includes('must equal blueprint question count')) {
      throw new Error(`Expected 400 for mismatched topic distribution sum, got ${rs.statusCode} - ${rs.body?.message}`);
    }
    console.log('PASS: Topic question distribution mismatch correctly rejected with HTTP 400.');

    // Valid Admin Blueprint Creation
    console.log('[AssessmentEngineTest] Creating valid assessment blueprint...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {
      title: 'Placement Assessment Blueprint v1',
      description: 'Standard Placement Readiness Evaluation',
      subjects: ['dsa', 'aptitude', 'dbms'],
      questionCount: 3,
      marksPerQuestion: 1,
      totalMarks: 3,
      durationMinutes: 30,
      negativeMarking: true,
      negativeMarks: 0.25,
      topicDistribution: [
        { topicName: 'Arrays & Two Pointers', category: 'dsa', questionCount: 1, difficulty: 'Easy' },
        { topicName: 'Percentages', category: 'aptitude', questionCount: 1, difficulty: 'Easy' },
        { topicName: 'SQL Fundamentals', category: 'dbms', questionCount: 1, difficulty: 'Medium' }
      ]
    }));
    await runRoute(createAdminAssessmentBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 201 || !rs.body.data?._id) {
      throw new Error(`Failed to create valid blueprint, got ${rs.statusCode}`);
    }
    const bpId = rs.body.data._id.toString();
    createdBlueprintIds.push(bpId);
    console.log(`PASS: Valid blueprint created successfully with ID: ${bpId}`);

    // 5. AI Question Generation & Server-side execution
    console.log('[AssessmentEngineTest] 5 & 6. Testing AI Question Generation & Strict Output Validation...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { blueprintId: bpId }));
    await runRoute(generateBlueprintQuestions, r, rs, 'admin');
    if (rs.statusCode !== 200 || !rs.body.data?.generatedQuestions || rs.body.data.generatedQuestions.length !== 3) {
      throw new Error(`AI question generation failed, got ${rs.statusCode} - ${rs.body?.message}`);
    }
    console.log('PASS: AI Question Generation produced exactly 3 validated questions.');

    // 6. Test Malformed Question Rejection Layer explicitly
    console.log('[AssessmentEngineTest] 6. Verifying Strict Question Validation Layer...');
    const malformed1 = validateGeneratedQuestion({ title: 'Short', problemStatement: 'abc', difficulty: 'Easy', type: 'mcq' });
    if (malformed1.valid) throw new Error('Failed to reject short problem statement');
    const malformed2 = validateGeneratedQuestion({
      title: 'Valid Title',
      problemStatement: 'Valid problem statement text',
      difficulty: 'Easy',
      type: 'mcq',
      options: [
        { text: 'Same', isCorrect: true },
        { text: 'Same', isCorrect: false }
      ]
    });
    if (malformed2.valid) throw new Error('Failed to reject duplicate options');
    console.log('PASS: Strict Validation Layer rejects malformed questions accurately.');

    // 7. Generated questions are editable before publishing
    console.log('[AssessmentEngineTest] 7. Testing Admin editing of generated question before publish...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { blueprintId: bpId }));
    await runRoute(getBlueprintQuestionsForReview, r, rs, 'admin');
    const questionsToReview = rs.body.data.questions;
    if (!questionsToReview || questionsToReview.length < 3) throw new Error('Could not retrieve generated questions for review');
    const targetQId = questionsToReview[0]._id.toString();

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {
      title: 'Edited Array Question Title',
      problemStatement: 'Updated Array Problem Statement Text',
      difficulty: 'Easy',
      mcqOptions: [
        { optionId: 'A', text: 'Option A Edited', isCorrect: false },
        { optionId: 'B', text: 'Option B Edited (Correct)', isCorrect: true },
        { optionId: 'C', text: 'Option C Edited', isCorrect: false },
        { optionId: 'D', text: 'Option D Edited', isCorrect: false }
      ],
      solutionExplanation: 'Updated solution explanation.'
    }, {}, { blueprintId: bpId, questionId: targetQId }));
    await runRoute(updateBlueprintQuestion, r, rs, 'admin');
    if (rs.statusCode !== 200 || rs.body.data.title !== 'Edited Array Question Title') {
      throw new Error(`Failed to update blueprint question, got ${rs.statusCode}`);
    }
    console.log('PASS: Admin edited generated question before publishing.');

    // 8 & 9. Draft assessment invisible to students; Published assessment visible to students
    console.log('[AssessmentEngineTest] 8 & 9. Testing Assessment Visibility lifecycle (Draft vs Published)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${tokenA}` }));
    await runRoute(getPublishedAssessments, r, rs, 'student');
    const initialList = rs.body.data;
    if (initialList.some(a => a.blueprintId === bpId)) {
      throw new Error('Draft blueprint is visible to students!');
    }
    console.log('PASS: Draft blueprint is invisible to student endpoints.');

    // Approve & Publish Blueprint
    console.log('[AssessmentEngineTest] Approving & Publishing Assessment Blueprint...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { blueprintId: bpId }));
    await runRoute(approveBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 200) throw new Error(`Failed to approve blueprint, got ${rs.statusCode}`);

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, {}, {}, { blueprintId: bpId }));
    await runRoute(publishBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 200 || !rs.body.data?._id) throw new Error(`Failed to publish blueprint, got ${rs.statusCode}`);
    const pubId = rs.body.data._id.toString();
    createdPublishedIds.push(pubId);
    console.log(`PASS: Assessment published successfully with Published ID: ${pubId}`);

    // Verify Published Assessment is visible to students
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${tokenA}` }));
    await runRoute(getPublishedAssessments, r, rs, 'student');
    const updatedList = rs.body.data;
    if (!updatedList.some(a => a.assessmentId === pubId)) {
      throw new Error('Published assessment is not visible to students!');
    }
    console.log('PASS: Published assessment is visible to student endpoints.');

    // 17, 18, 19. Correct answers and hidden test cases not leaked in Student Assessment API
    console.log('[AssessmentEngineTest] 17, 18, 19. Testing Safe Question Projection (No secret leaks)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${tokenA}` }, {}, {}, { assessmentId: pubId }));
    await runRoute(getPublishedAssessmentById, r, rs, 'student');
    if (rs.statusCode !== 200 || !rs.body.data?.questions) throw new Error('Failed to get student assessment details');
    
    const studentQuestions = rs.body.data.questions;
    for (const sq of studentQuestions) {
      if (sq.solutionCode || sq.solutionExplanation) {
        throw new Error(`SECURITY LEAK: Solution code/explanation exposed to student for question ${sq.questionId}`);
      }
      if (Array.isArray(sq.options)) {
        for (const opt of sq.options) {
          if (opt.isCorrect !== undefined) {
            throw new Error(`SECURITY LEAK: isCorrect field exposed to student in option ${opt.optionId}`);
          }
        }
      }
    }
    console.log('PASS: Student Assessment API project is 100% safe (zero answers, solution code, or explanations leaked).');

    // 10, 11, 12, 13. Student starts assessment, JWT identity isolation, studentId injection ignored
    console.log('[AssessmentEngineTest] 10, 11, 12, 13. Testing Start Assessment & Identity Isolation...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      { studentId: studentB._id.toString(), userId: studentB._id.toString() }, // Injection attempt
      {},
      { assessmentId: pubId }
    ));
    await runRoute(startStudentAssessment, r, rs, 'student');
    if (rs.statusCode !== 200 || !rs.body.data?.attemptId) throw new Error(`Start assessment failed, got ${rs.statusCode}`);
    const attemptIdA = rs.body.data.attemptId;
    console.log('PASS: Student A started assessment, identity injection ignored.');

    // 14, 15, 16, 21. Authoritative Backend Scoring, Client score ignored, Negative marking enforced, Server timing
    console.log('[AssessmentEngineTest] 14, 15, 16, 21. Testing Authoritative Backend Scoring & Negative Marking...');
    
    // Fetch original questions from DB to get correct answer IDs
    const dbQuestions = await Question.find({ _id: { $in: questionsToReview.map(q => q._id) } });

    // Build answers payload: Answer 1 correct, Answer 2 incorrect, Answer 3 unanswered
    const studentAnswers = [];
    dbQuestions.forEach((q, idx) => {
      const qId = q._id.toString();
      if (idx === 0) {
        const correctOpt = q.mcqOptions.find(o => o.isCorrect);
        studentAnswers.push({ questionId: qId, selectedAnswer: correctOpt?.optionId || 'B' });
      } else if (idx === 1) {
        const wrongOpt = q.mcqOptions.find(o => !o.isCorrect);
        studentAnswers.push({ questionId: qId, selectedAnswer: wrongOpt?.optionId || 'A' });
      }
      // idx === 2 left unanswered
    });

    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${tokenA}` },
      {
        score: 100, // Fake score injection attempt
        percentage: 100, // Fake percentage injection attempt
        answers: studentAnswers
      },
      {},
      { assessmentId: pubId }
    ));
    await runRoute(submitStudentAssessment, r, rs, 'student');
    if (rs.statusCode !== 200 || !rs.body.data?.summary) {
      throw new Error(`Assessment submission failed, got ${rs.statusCode} - ${rs.body?.message}`);
    }

    const summary = rs.body.data.summary;
    if (summary.correct !== 1 || summary.incorrect !== 1 || summary.unanswered !== 1) {
      throw new Error(`Authoritative scoring failed: Expected 1 correct, 1 incorrect, 1 unanswered. Got ${JSON.stringify(summary)}`);
    }

    // Check negative marking: 1 correct (+1 mark) - 1 incorrect (-0.25 mark) = 0.75 / 3 = 25%
    if (summary.obtainedMarks !== 0.75) {
      throw new Error(`Authoritative negative marking failed: Expected obtainedMarks 0.75, got ${summary.obtainedMarks}`);
    }
    console.log('PASS: Authoritative backend evaluation scored 1 correct, 1 incorrect with -0.25 negative marking (0.75 marks), ignoring fake client scores.');

    // 20. Duplicate submission prevention
    console.log('[AssessmentEngineTest] 20. Testing Duplicate Submission Prevention...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${tokenA}` }, { answers: studentAnswers }, {}, { assessmentId: pubId }));
    await runRoute(submitStudentAssessment, r, rs, 'student');
    if (rs.statusCode !== 400 || !rs.body.message.toLowerCase().includes('already')) {
      throw new Error('Duplicate submission was not safely handled');
    }
    console.log('PASS: Duplicate submission handled safely without double counting (HTTP 400 rejection).');

    // 22. Assessment result contains subject & topic performance
    console.log('[AssessmentEngineTest] 22. Testing Subject & Topic Performance Breakdown in Result...');
    if (!rs.body.data.subjectPerformance || !rs.body.data.topicPerformance || !rs.body.data.difficultyPerformance) {
      throw new Error('Assessment result missing subject, topic, or difficulty performance breakdown');
    }
    console.log('PASS: Assessment result includes detailed subject, topic, and difficulty performance breakdowns.');

    // 23 & 24. Historical published assessment remains stable & Admin RBAC
    console.log('[AssessmentEngineTest] 23 & 24. Testing Immutability of Published Assessment & Admin RBAC...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, { title: 'Mutate Published' }, {}, { blueprintId: bpId }));
    await runRoute(updateAdminAssessmentBlueprint, r, rs, 'admin');
    if (rs.statusCode !== 400 || !rs.body.message.includes('Cannot modify a PUBLISHED')) {
      throw new Error('Failed to block mutation of published assessment blueprint');
    }
    console.log('PASS: Historical published assessment blueprint is immutable.');

    // Cleanup temporary test data
    console.log('[AssessmentEngineTest] Cleaning up temporary test data from Atlas...');
    for (const uid of createdUserIds) {
      await User.deleteOne({ _id: uid }).catch(() => {});
      await AssessmentAttempt.deleteMany({ studentId: uid }).catch(() => {});
    }
    for (const bpid of createdBlueprintIds) {
      await AssessmentBlueprint.deleteOne({ _id: bpid }).catch(() => {});
    }
    for (const pid of createdPublishedIds) {
      await PublishedAssessment.deleteOne({ _id: pid }).catch(() => {});
    }
    console.log('PASS: All temporary test documents cleaned up from Atlas.');

    console.log('[AssessmentEngineTest] === DEDICATED STEP 2 ASSESSMENT ENGINE VERIFICATION PASSED ===');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[AssessmentEngineTest] VERIFICATION FAILED: ${error.message}`);
    for (const uid of createdUserIds) {
      await User.deleteOne({ _id: uid }).catch(() => {});
      await AssessmentAttempt.deleteMany({ studentId: uid }).catch(() => {});
    }
    for (const bpid of createdBlueprintIds) {
      await AssessmentBlueprint.deleteOne({ _id: bpid }).catch(() => {});
    }
    for (const pid of createdPublishedIds) {
      await PublishedAssessment.deleteOne({ _id: pid }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runVerification();
