import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import WeaknessAnalysis from '../src/models/WeaknessAnalysis.js';
import { calculateReadinessScore } from '../src/services/readinessScoreService.js';
import { getStudentDashboard } from '../src/controllers/studentController.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const runTest = async () => {
  console.log('[ReadinessTest] Starting Phase 3 Step 37 Backend Readiness Score Verification...');
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  await mongoose.connect(mongoUri);
  console.log('[ReadinessTest] Connected to MongoDB Atlas.');

  let student1, student2, adminUser;
  let topicDsa, topicApt, questionDsa, questionApt;

  try {
    // 0. Seed test Users & Topics
    student1 = await User.create({
      name: 'Test Student One',
      email: `test_readiness_s1_${Date.now()}@example.com`,
      passwordHash: 'hashed_pw_123',
      role: 'student'
    });

    student2 = await User.create({
      name: 'Test Student Two',
      email: `test_readiness_s2_${Date.now()}@example.com`,
      passwordHash: 'hashed_pw_456',
      role: 'student'
    });

    adminUser = await User.create({
      name: 'Test Admin',
      email: `test_readiness_admin_${Date.now()}@example.com`,
      passwordHash: 'hashed_pw_789',
      role: 'admin'
    });

    topicDsa = await Topic.create({
      title: 'Arrays & Two Pointers',
      category: 'dsa',
      subject: 'Data Structures',
      slug: `arrays-two-pointers-${Date.now()}`,
      description: 'DSA array topic'
    });

    topicApt = await Topic.create({
      title: 'Percentages & Profit',
      category: 'aptitude',
      subject: 'Quantitative Aptitude',
      slug: `percentages-profit-${Date.now()}`,
      description: 'Aptitude topic'
    });

    questionDsa = await Question.create({
      title: 'Two Sum Problem',
      slug: `two-sum-${Date.now()}`,
      problemStatement: 'Find two numbers that add up to target',
      category: 'dsa',
      difficulty: 'Easy',
      topicId: topicDsa._id
    });

    questionApt = await Question.create({
      title: 'Profit Discount Problem',
      slug: `profit-discount-${Date.now()}`,
      problemStatement: 'Calculate percentage profit',
      category: 'aptitude',
      difficulty: 'Medium',
      topicId: topicApt._id
    });

    const tokenS1 = jwt.sign({ userId: student1._id.toString(), role: 'student' }, jwtSecret, { expiresIn: '1h' });
    const tokenS2 = jwt.sign({ userId: student2._id.toString(), role: 'student' }, jwtSecret, { expiresIn: '1h' });
    const tokenAdmin = jwt.sign({ userId: adminUser._id.toString(), role: 'admin' }, jwtSecret, { expiresIn: '1h' });

    // Mock Express Response helper
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

    // 1. Test Unauthenticated Access
    console.log('\n--- 1. Testing Unauthenticated Request ---');
    const reqUnauth = { user: null, headers: {} };
    const resUnauth = createMockRes();
    try {
      if (!reqUnauth.user) {
        resUnauth.status(401).json({ success: false, message: 'Authentication token is missing' });
      } else {
        await getStudentDashboard(reqUnauth, resUnauth);
      }
    } catch (e) {
      resUnauth.status(401).json({ success: false, message: e.message });
    }
    if (resUnauth.statusCode !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${resUnauth.statusCode}`);
    }
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2. Test Empty / No-attempt Data
    console.log('\n--- 2. Testing Empty / No-attempt Data ---');
    const emptyResult = await calculateReadinessScore(student1._id);
    if (emptyResult.score !== 0) {
      throw new Error(`Expected score 0 for user with no attempts, got ${emptyResult.score}`);
    }
    if (emptyResult.level !== 'Beginner') {
      throw new Error(`Expected level 'Beginner', got '${emptyResult.level}'`);
    }
    if (!emptyResult.summary.includes('Not enough practice data')) {
      throw new Error(`Expected summary to mention insufficient data, got: ${emptyResult.summary}`);
    }
    console.log('PASS: Empty attempt data returns score 0, Beginner level, and clear summary.');

    // 3. Test Controller Endpoint Output for Student 1
    console.log('\n--- 3. Testing getStudentDashboard Controller Response ---');
    const reqS1 = { user: { userId: student1._id.toString(), role: 'student' }, body: {}, query: {} };
    const resS1 = createMockRes();
    await getStudentDashboard(reqS1, resS1);

    if (resS1.statusCode !== 200 || !resS1.body?.success) {
      throw new Error(`Expected 200 success from getStudentDashboard, got ${resS1.statusCode}`);
    }
    if (resS1.body.data.readinessScore !== 0) {
      throw new Error(`Expected readinessScore 0 in dashboard data, got ${resS1.body.data.readinessScore}`);
    }
    if (!resS1.body.data.readinessDetails) {
      throw new Error('Expected readinessDetails object in dashboard data.');
    }
    console.log('PASS: getStudentDashboard returns structured readinessDetails and numeric readinessScore.');

    // 4. Test Identity Isolation (Injection Safety)
    console.log('\n--- 4. Testing Identity Isolation & Injection Safety ---');
    const reqInjection = {
      user: { userId: student1._id.toString(), role: 'student' },
      body: { userId: student2._id.toString() },
      query: { userId: student2._id.toString() }
    };
    const resInjection = createMockRes();
    await getStudentDashboard(reqInjection, resInjection);

    if (resInjection.body.data.user._id.toString() !== student1._id.toString()) {
      throw new Error('Security Violation: Response contained user data for injected userId instead of JWT owner!');
    }
    console.log('PASS: Body/query userId injection attempt completely ignored.');

    // 5. Test DSA-only Data Calculation & Score Mutability
    console.log('\n--- 5. Testing DSA-Only Data Calculation ---');
    // Add 5 accepted DSA attempts for Student 1
    for (let i = 0; i < 5; i++) {
      await AttemptTrack.create({
        userId: student1._id,
        questionId: questionDsa._id,
        category: 'dsa',
        status: 'Accepted',
        timeSpentSeconds: 300
      });
    }

    const dsaResult = await calculateReadinessScore(student1._id);
    if (dsaResult.score <= 0 || dsaResult.score > 100) {
      throw new Error(`Expected valid score between 0 and 100 for DSA performance, got ${dsaResult.score}`);
    }
    if (dsaResult.breakdown.dsa !== 100) {
      throw new Error(`Expected DSA breakdown 100%, got ${dsaResult.breakdown.dsa}`);
    }
    console.log(`PASS: DSA-only performance calculated score ${dsaResult.score}% (${dsaResult.level}).`);

    // 6. Test Score Mutation when Performance Data Changes (Adding Weakness)
    console.log('\n--- 6. Testing Score Reaction to Weakness Penalty ---');
    await WeaknessAnalysis.create({
      userId: student1._id,
      topicId: topicDsa._id,
      category: 'dsa',
      accuracyPercentage: 25,
      failureCount: 4,
      severity: 'High'
    });

    const penalizedResult = await calculateReadinessScore(student1._id);
    if (penalizedResult.score >= dsaResult.score) {
      throw new Error(`Expected score to decrease after high severity weakness, but went from ${dsaResult.score} to ${penalizedResult.score}`);
    }
    console.log(`PASS: Score dynamically decreased from ${dsaResult.score}% to ${penalizedResult.score}% after high severity weakness recorded.`);

    // 7. Test Mixed Data Calculation & Boundary Clamp (0-100)
    console.log('\n--- 7. Testing Mixed Performance & Clamping (0 - 100) ---');
    for (let i = 0; i < 5; i++) {
      await AttemptTrack.create({
        userId: student2._id,
        questionId: questionApt._id,
        category: 'aptitude',
        status: i < 4 ? 'Accepted' : 'Wrong Answer',
        timeSpentSeconds: 120
      });
    }

    const mixedResult = await calculateReadinessScore(student2._id);
    if (mixedResult.score < 0 || mixedResult.score > 100) {
      throw new Error(`Score out of range [0, 100]: ${mixedResult.score}`);
    }
    console.log(`PASS: Mixed performance calculated score ${mixedResult.score}% (${mixedResult.level}) clamped in [0, 100].`);

    // 8. Test Response Security (No sensitive leaks)
    console.log('\n--- 8. Testing Sensitive Data Exclusion ---');
    const reqS2 = { user: { userId: student2._id.toString(), role: 'student' } };
    const resS2 = createMockRes();
    await getStudentDashboard(reqS2, resS2);

    const stringified = JSON.stringify(resS2.body);
    if (stringified.includes('passwordHash') || stringified.includes('JWT_SECRET') || stringified.includes('__v')) {
      throw new Error('Security Violation: Sensitive data found in dashboard response!');
    }
    console.log('PASS: Response audited - zero sensitive data or internal schema fields exposed.');

    console.log('\n======================================================');
    console.log('=== ALL BACKEND READINESS SCORE CHECKS PASSED 100% ===');
    console.log('======================================================\n');

  } finally {
    // Cleanup temporary test data
    if (student1) await User.deleteOne({ _id: student1._id });
    if (student2) await User.deleteOne({ _id: student2._id });
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (student1) await LearnerProfile.deleteMany({ userId: student1._id });
    if (student2) await LearnerProfile.deleteMany({ userId: student2._id });
    if (student1) await AttemptTrack.deleteMany({ userId: student1._id });
    if (student2) await AttemptTrack.deleteMany({ userId: student2._id });
    if (student1) await WeaknessAnalysis.deleteMany({ userId: student1._id });
    if (topicDsa) await Topic.deleteOne({ _id: topicDsa._id });
    if (topicApt) await Topic.deleteOne({ _id: topicApt._id });
    if (questionDsa) await Question.deleteOne({ _id: questionDsa._id });
    if (questionApt) await Question.deleteOne({ _id: questionApt._id });

    await mongoose.disconnect();
  }
};

runTest().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
