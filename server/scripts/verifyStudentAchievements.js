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
import { getAchievements } from '../src/controllers/studentController.js';
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

const runAchievementsVerification = async () => {
  console.log('[AchievementsTest] Starting Phase 3 Step 12 Backend Student Achievements API Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[AchievementsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1 (No attempts)
    const student1 = await User.create({
      name: 'Achievements Test 1',
      email: `achieve-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (With attempts)
    const student2 = await User.create({
      name: 'Achievements Test 2',
      email: `achieve-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'Achievements Admin',
      email: `achieve-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics & Questions
    const topic1 = await Topic.create({ category: 'dsa', subject: 'Trees', title: 'Binary Search Trees', slug: `bst-${Date.now()}` });
    const topic2 = await Topic.create({ category: 'aptitude', subject: 'Quant', title: 'Time and Work', slug: `tw-${Date.now()}` });
    createdIds.topics.push(topic1._id, topic2._id);

    const q1 = await Question.create({ topicId: topic1._id, title: 'Valid BST', slug: `valid-bst-${Date.now()}`, problemStatement: '...' });
    const q2 = await Question.create({ topicId: topic2._id, title: 'Pipes and Cisterns', slug: `pipes-${Date.now()}`, problemStatement: '...' });
    createdIds.questions.push(q1._id, q2._id);

    // Prepare Date objects
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(); dayBefore.setDate(today.getDate() - 2);
    const threeDaysAgo = new Date(); threeDaysAgo.setDate(today.getDate() - 3);

    // Create attempts for Student 2
    const attemptsToCreate = [];

    // Day -3 (2 DSA Attempts, both Wrong Answer) -> Unlocks 'ach-first-practice', 'ach-dsa-beginner'
    attemptsToCreate.push({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Wrong Answer', createdAt: threeDaysAgo });
    attemptsToCreate.push({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Wrong Answer', createdAt: threeDaysAgo });

    // Day -2 (1 Aptitude Attempt, Accepted) -> Unlocks 'ach-first-success', 'ach-aptitude-beginner'
    attemptsToCreate.push({ userId: student2._id, questionId: q2._id, category: 'aptitude', status: 'Accepted', createdAt: dayBefore });

    // Day -1 (7 DSA Attempts, all Accepted) -> Reaches 10 attempts total -> Unlocks 'ach-10-attempts'
    for (let i = 0; i < 7; i++) {
      attemptsToCreate.push({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Accepted', createdAt: yesterday });
    }

    // No activity today.
    // Unique days: -3, -2, -1 (3 consecutive days ending yesterday)
    // Streak: current = 3, longest = 3

    for (let data of attemptsToCreate) {
      const att = await AttemptTrack.create(data);
      createdIds.attempts.push(att._id);
    }

    console.log('[AchievementsTest] Created test accounts and attempt data.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // G. Authentication
    console.log('[AchievementsTest] Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getAchievements, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[AchievementsTest] PASS: GET without token returns 401.');

    console.log('[AchievementsTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getAchievements, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[AchievementsTest] PASS: Invalid/Tampered JWT returns 401.');

    // H. RBAC
    console.log('[AchievementsTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getAchievements, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[AchievementsTest] PASS: Admin attempting student route rejected with 403.');

    // A. Empty student
    console.log('[AchievementsTest] Testing student 1 (zero attempts)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getAchievements, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    // Check structure & streak
    if (rs.body.data.streak.current !== 0 || rs.body.data.streak.longest !== 0) {
      throw new Error('Streak should be 0 for student with no attempts');
    }
    const emptyAchievements = rs.body.data.achievements;
    if (!Array.isArray(emptyAchievements)) throw new Error('Achievements should be an array');
    if (emptyAchievements.some(a => a.unlocked)) throw new Error('Student 1 should have NO unlocked achievements');
    console.log('[AchievementsTest] PASS: Empty achievements returned correctly for user with no attempts. Streak is 0.');

    // B, C, D, E, F. Student 2 tests
    console.log('[AchievementsTest] Testing seeded achievements calculation (Student 2)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getAchievements, r, rs);
    
    const s2Achievements = rs.body.data.achievements;
    const unlockedMap = Object.fromEntries(s2Achievements.map(a => [a.id, a]));

    if (!unlockedMap['ach-first-practice'].unlocked) throw new Error('Expected ach-first-practice to be unlocked');
    if (!unlockedMap['ach-dsa-beginner'].unlocked) throw new Error('Expected ach-dsa-beginner to be unlocked');
    if (!unlockedMap['ach-aptitude-beginner'].unlocked) throw new Error('Expected ach-aptitude-beginner to be unlocked');
    if (!unlockedMap['ach-first-success'].unlocked) throw new Error('Expected ach-first-success to be unlocked');
    if (!unlockedMap['ach-10-attempts'].unlocked) throw new Error('Expected ach-10-attempts to be unlocked');

    const streak = rs.body.data.streak;
    if (streak.current !== 3) throw new Error(`Expected current streak to be 3, got ${streak.current}`);
    if (streak.longest !== 3) throw new Error(`Expected longest streak to be 3, got ${streak.longest}`);

    console.log('[AchievementsTest] PASS: Achievements, milestones, and streak calculated correctly.');

    // K. Repeatability
    console.log('[AchievementsTest] Testing repeatability...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getAchievements, r, rs);
    if (rs.body.data.streak.current !== 3) throw new Error('Repeatability failed (streak changed).');
    console.log('[AchievementsTest] PASS: Consecutive GET requests are idempotent and do not mutate state.');

    // I, J. Ownership & Injection
    console.log('[AchievementsTest] Testing identity injection and data scoping...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() }, // body
      { userId: student2._id.toString() }, // query
      { userId: student2._id.toString() }  // params
    ));
    await simulateRoute(getAchievements, r, rs);
    if (rs.body.data.streak.current !== 0 || rs.body.data.achievements.some(a => a.unlocked)) {
      throw new Error('SECURITY FAILURE: Identity injection succeeded, Student 1 read Student 2 progress!');
    }
    console.log('[AchievementsTest] PASS: userId injection ignored, Student A cannot read Student B progress.');

    // L. Atlas persistence verification (Implicit, plus count)
    console.log('[AchievementsTest] Atlas persistence verification...');
    const dbAttempts = await AttemptTrack.countDocuments({ userId: student2._id });
    if (dbAttempts !== 10) throw new Error('Database persistence issue, attempts not found in Atlas.');
    console.log('[AchievementsTest] PASS: Atlas connectivity and persistence verified.');

    // M. Cleanup
    console.log('[AchievementsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    
    console.log('[AchievementsTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[AchievementsTest] === BACKEND STUDENT ACHIEVEMENTS API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[AchievementsTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runAchievementsVerification();
