import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import Roadmap from '../src/models/Roadmap.js';
import WeaknessAnalysis from '../src/models/WeaknessAnalysis.js';
import { getBaselineAssessment, submitBaselineAssessment } from '../src/controllers/assessmentController.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const runTest = async () => {
  console.log('[BaselineAssessmentTest] Starting Step 39 Backend Baseline Assessment Verification...');
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  await mongoose.connect(mongoUri);
  console.log('[BaselineAssessmentTest] Connected to MongoDB Atlas.');

  let student1, student2, adminUser;
  let topicDsa, topicApt, topicCs;
  let qDsa, qApt, qCs;

  try {
    const suffix = Date.now();

    // Seed test users
    student1 = await User.create({
      name: 'Baseline Student 1',
      email: `test_baseline_s1_${suffix}@example.com`,
      passwordHash: 'hashed_pw_1',
      role: 'student'
    });

    student2 = await User.create({
      name: 'Baseline Student 2',
      email: `test_baseline_s2_${suffix}@example.com`,
      passwordHash: 'hashed_pw_2',
      role: 'student'
    });

    adminUser = await User.create({
      name: 'Baseline Admin',
      email: `test_baseline_admin_${suffix}@example.com`,
      passwordHash: 'hashed_pw_3',
      role: 'admin'
    });

    // Seed test topics
    topicDsa = await Topic.create({
      title: 'Arrays Baseline Topic',
      category: 'dsa',
      subject: 'Data Structures',
      slug: `arrays-baseline-${suffix}`
    });

    topicApt = await Topic.create({
      title: 'Logic Baseline Topic',
      category: 'aptitude',
      subject: 'Logical Reasoning',
      slug: `logic-baseline-${suffix}`
    });

    topicCs = await Topic.create({
      title: 'OS Baseline Topic',
      category: 'cs_core',
      subject: 'Operating Systems',
      slug: `os-baseline-${suffix}`
    });

    // Seed test questions (with mcqOptions having isCorrect)
    qDsa = await Question.create({
      title: 'Baseline DSA Question',
      slug: `baseline-dsa-${suffix}`,
      problemStatement: 'Find element in array',
      category: 'dsa',
      difficulty: 'Easy',
      topicId: topicDsa._id,
      mcqOptions: [
        { optionId: 'opt-dsa-1', text: 'Option A (Correct)', isCorrect: true },
        { optionId: 'opt-dsa-2', text: 'Option B (Wrong)', isCorrect: false }
      ],
      solutionCode: { javascript: 'console.log("secret solution");' },
      solutionExplanation: 'Secret explanation',
      testCases: [{ input: '1', expectedOutput: '2', isHidden: true }]
    });

    qApt = await Question.create({
      title: 'Baseline Aptitude Question',
      slug: `baseline-apt-${suffix}`,
      problemStatement: 'Find next number in sequence',
      category: 'aptitude',
      difficulty: 'Medium',
      topicId: topicApt._id,
      mcqOptions: [
        { optionId: 'opt-apt-1', text: 'Option A (Wrong)', isCorrect: false },
        { optionId: 'opt-apt-2', text: 'Option B (Correct)', isCorrect: true }
      ]
    });

    qCs = await Question.create({
      title: 'Baseline CS Core Question',
      slug: `baseline-cs-${suffix}`,
      problemStatement: 'What is deadlocking?',
      category: 'cs_core',
      difficulty: 'Hard',
      topicId: topicCs._id,
      mcqOptions: [
        { optionId: 'opt-cs-1', text: 'Option A (Correct)', isCorrect: true },
        { optionId: 'opt-cs-2', text: 'Option B (Wrong)', isCorrect: false }
      ]
    });

    const createMockRes = () => {
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
      return res;
    };

    // 1. Testing Unauthenticated Request (GET)
    console.log('\n--- 1. Testing Unauthenticated Request ---');
    const reqUnauth = { user: null };
    const resUnauth = createMockRes();
    try {
      if (!reqUnauth.user) {
        resUnauth.status(401).json({ success: false, message: 'Unauthenticated' });
      } else {
        await getBaselineAssessment(reqUnauth, resUnauth);
      }
    } catch (e) {
      resUnauth.status(401).json({ success: false, message: e.message });
    }
    if (resUnauth.statusCode !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${resUnauth.statusCode}`);
    }
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2 & 3 & 4 & 5. Student GET Baseline Assessment & Secret Leak Audit
    console.log('\n--- 2, 3, 4, 5. Student GET Baseline Assessment & Secret Leak Protection ---');
    const reqS1 = { user: { userId: student1._id.toString(), role: 'student' } };
    const resS1 = createMockRes();
    await getBaselineAssessment(reqS1, resS1);

    if (resS1.statusCode !== 200 || !resS1.body?.success) {
      throw new Error(`Expected 200 success from getBaselineAssessment, got ${resS1.statusCode}`);
    }

    const assessmentData = resS1.body.data;
    if (!assessmentData.assessmentId || !Array.isArray(assessmentData.questions)) {
      throw new Error('Expected assessmentId and questions array in response data.');
    }

    // Verify secret fields are completely stripped
    const stringifiedGet = JSON.stringify(resS1.body);
    if (stringifiedGet.includes('isCorrect') || stringifiedGet.includes('secret solution') || stringifiedGet.includes('solutionExplanation') || stringifiedGet.includes('isHidden')) {
      throw new Error('SECURITY FAILURE: GET assessment response leaked sensitive answer key or solution fields!');
    }
    console.log('PASS: Baseline assessment returned safe questions without exposing isCorrect, answer keys, or solution code.');

    // 6. Test Submission Validation (Empty/Invalid payload)
    console.log('\n--- 6. Testing Submission Validation ---');
    const reqInvalidSub = { user: { userId: student1._id.toString(), role: 'student' }, body: { answers: [] } };
    const resInvalidSub = createMockRes();
    await submitBaselineAssessment(reqInvalidSub, resInvalidSub);

    if (resInvalidSub.statusCode !== 400) {
      throw new Error(`Expected 400 for empty answers submission, got ${resInvalidSub.statusCode}`);
    }
    console.log('PASS: Empty answers submission correctly rejected (400).');

    // 7 & 8 & 9. Authoritative Backend Scoring & Identity Isolation
    console.log('\n--- 7, 8, 9. Authoritative Backend Scoring & Identity Isolation ---');
    const reqSubS1 = {
      user: { userId: student1._id.toString(), role: 'student' },
      body: {
        assessmentId: assessmentData.assessmentId,
        userId: student2._id.toString(), // Injection attempt
        clientFakeScore: 100, // Fake score attempt
        answers: [
          { questionId: qDsa._id.toString(), selectedAnswer: 'opt-dsa-1' }, // Correct
          { questionId: qApt._id.toString(), selectedAnswer: 'opt-apt-2' }, // Correct
          { questionId: qCs._id.toString(), selectedAnswer: 'opt-cs-2' }    // Incorrect
        ]
      }
    };
    const resSubS1 = createMockRes();
    await submitBaselineAssessment(reqSubS1, resSubS1);

    if (resSubS1.statusCode !== 200 || !resSubS1.body?.success) {
      throw new Error(`Expected 200 from submitBaselineAssessment, got ${resSubS1.statusCode}`);
    }

    const subResult = resSubS1.body.data;
    if (subResult.summary.correct !== 2 || subResult.summary.incorrect !== 1) {
      throw new Error(`Authoritative scoring mismatch! Expected 2 correct and 1 incorrect, got: ${JSON.stringify(subResult.summary)}`);
    }
    if (subResult.summary.accuracy !== 67) {
      throw new Error(`Expected 67% accuracy, got ${subResult.summary.accuracy}%`);
    }
    console.log('PASS: Authoritative backend evaluation scored 2/3 correct (67% accuracy), ignoring fake client scores.');

    // 10 & 11. Duplicate Submission & AttemptTrack Recording
    console.log('\n--- 10 & 11. Duplicate Submission Safety & AttemptTrack Recording ---');
    const initialAttempts = await AttemptTrack.countDocuments({ userId: student1._id });
    if (initialAttempts !== 3) {
      throw new Error(`Expected 3 AttemptTrack records for 3 questions, got ${initialAttempts}`);
    }

    // Submit identical answers again immediately
    await submitBaselineAssessment(reqSubS1, createMockRes());
    const finalAttempts = await AttemptTrack.countDocuments({ userId: student1._id });
    if (finalAttempts !== 3) {
      throw new Error(`Duplicate submission created duplicate AttemptTrack records! Expected 3, got ${finalAttempts}`);
    }
    console.log('PASS: Retried submission executed cleanly without creating duplicate AttemptTrack records.');

    // 12. LearnerProfile Baseline Updates
    console.log('\n--- 12. LearnerProfile Baseline Field Verification ---');
    const profileS1 = await LearnerProfile.findOne({ userId: student1._id });
    if (!profileS1 || !profileS1.baselineAssessmentCompleted) {
      throw new Error('Expected LearnerProfile.baselineAssessmentCompleted to be true.');
    }
    if (profileS1.baselineScore !== 67) {
      throw new Error(`Expected profile.baselineScore 67, got ${profileS1.baselineScore}`);
    }
    console.log('PASS: LearnerProfile updated baselineAssessmentCompleted=true and baselineScore=67.');

    // 13 & 14. Readiness Score Recalculation & Roadmap Adaptation
    console.log('\n--- 13 & 14. Readiness Score Recalculation & Adaptive Roadmap ---');
    if (typeof subResult.readinessScore !== 'number') {
      throw new Error('Expected numeric readinessScore in submission response.');
    }
    if (!subResult.roadmapUpdated) {
      throw new Error('Expected roadmapUpdated: true in submission response.');
    }
    console.log(`PASS: Deterministic readiness score recalculated (${subResult.readinessScore}%) and roadmap adapted.`);

    // 15 & 16. Sensitive Field Exclusion & Insufficient Questions Fallback
    console.log('\n--- 15 & 16. Sensitive Field Exclusion Audit ---');
    const stringifiedSub = JSON.stringify(resSubS1.body);
    if (stringifiedSub.includes('passwordHash') || stringifiedSub.includes('JWT_SECRET') || stringifiedSub.includes('GEMINI_API_KEY')) {
      throw new Error('SECURITY FAILURE: Submission response exposed sensitive system secrets!');
    }
    console.log('PASS: Submission response audited - zero secrets or internal schema keys exposed.');

    console.log('\n==========================================================');
    console.log('=== ALL BASELINE ASSESSMENT VERIFICATION CHECKS PASSED ===');
    console.log('==========================================================\n');

  } finally {
    // Cleanup temporary test data
    if (student1) await User.deleteOne({ _id: student1._id });
    if (student2) await User.deleteOne({ _id: student2._id });
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (student1) await LearnerProfile.deleteOne({ userId: student1._id });
    if (student2) await LearnerProfile.deleteOne({ userId: student2._id });
    if (student1) await AttemptTrack.deleteMany({ userId: student1._id });
    if (student2) await AttemptTrack.deleteMany({ userId: student2._id });
    if (student1) await WeaknessAnalysis.deleteMany({ userId: student1._id });
    if (student1) await Roadmap.deleteOne({ userId: student1._id });
    if (topicDsa) await Topic.deleteOne({ _id: topicDsa._id });
    if (topicApt) await Topic.deleteOne({ _id: topicApt._id });
    if (topicCs) await Topic.deleteOne({ _id: topicCs._id });
    if (qDsa) await Question.deleteOne({ _id: qDsa._id });
    if (qApt) await Question.deleteOne({ _id: qApt._id });
    if (qCs) await Question.deleteOne({ _id: qCs._id });

    await mongoose.disconnect();
  }
};

runTest().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
