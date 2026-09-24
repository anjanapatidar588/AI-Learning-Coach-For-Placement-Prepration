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
import { getWeakAreas } from '../src/controllers/studentController.js';
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

const runWeakAreasVerification = async () => {
  console.log('[WeakAreasTest] Starting Phase 3 Step 11 Backend Student Weak Areas API Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [] };

  try {
    await connectDB();
    console.log('[WeakAreasTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1 (No attempts)
    const student1 = await User.create({
      name: 'Weak Area Test 1',
      email: `weak-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (With attempts)
    const student2 = await User.create({
      name: 'Weak Area Test 2',
      email: `weak-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create student 3 (No attempts at all)
    const student3 = await User.create({
      name: 'Weak Area Test 3',
      email: `weak-test-3-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(student3._id);
    const token3 = generateToken({ id: student3._id, role: student3.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'Weak Area Admin',
      email: `weak-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create Topics
    const topic1 = await Topic.create({
      category: 'dsa', subject: 'Trees', title: 'Binary Search Trees', slug: `bst-${Date.now()}`
    });
    const topic2 = await Topic.create({
      category: 'dsa', subject: 'Graphs', title: 'Graph Traversal', slug: `graph-${Date.now()}`
    });
    const topic3 = await Topic.create({
      category: 'aptitude', subject: 'Quant', title: 'Time and Work', slug: `tw-${Date.now()}`
    });
    createdIds.topics.push(topic1._id, topic2._id, topic3._id);

    // Create Questions
    const q1 = await Question.create({
      topicId: topic1._id, title: 'Valid BST', slug: `valid-bst-${Date.now()}`, problemStatement: '...'
    });
    const q2 = await Question.create({
      topicId: topic2._id, title: 'BFS', slug: `bfs-${Date.now()}`, problemStatement: '...'
    });
    const q3 = await Question.create({
      topicId: topic3._id, title: 'Pipes and Cisterns', slug: `pipes-${Date.now()}`, problemStatement: '...'
    });
    createdIds.questions.push(q1._id, q2._id, q3._id);

    // Create attempts for Student 2
    // Topic 1: Binary Search Trees - 4 attempts, 2 accepted (50% accuracy) -> Weak area!
    const a1 = await AttemptTrack.create({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Accepted' });
    const a2 = await AttemptTrack.create({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Wrong Answer' });
    const a3 = await AttemptTrack.create({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Accepted' });
    const a4 = await AttemptTrack.create({ userId: student2._id, questionId: q1._id, category: 'dsa', status: 'Time Limit Exceeded' });
    
    // Topic 2: Graph Traversal - 2 attempts, 2 accepted (100% accuracy) -> NOT a weak area
    const a5 = await AttemptTrack.create({ userId: student2._id, questionId: q2._id, category: 'dsa', status: 'Accepted' });
    const a6 = await AttemptTrack.create({ userId: student2._id, questionId: q2._id, category: 'dsa', status: 'Accepted' });
    
    // Topic 3: Time and Work - 3 attempts, 1 accepted (33% accuracy) -> Weak area!
    const a7 = await AttemptTrack.create({ userId: student2._id, questionId: q3._id, category: 'aptitude', status: 'Wrong Answer' });
    const a8 = await AttemptTrack.create({ userId: student2._id, questionId: q3._id, category: 'aptitude', status: 'Wrong Answer' });
    const a9 = await AttemptTrack.create({ userId: student2._id, questionId: q3._id, category: 'aptitude', status: 'Accepted' });
    
    // Attempt for Student 1 to test isolation (shouldn't leak)
    const a10 = await AttemptTrack.create({ userId: student1._id, questionId: q1._id, category: 'dsa', status: 'Wrong Answer' });

    createdIds.attempts.push(a1._id, a2._id, a3._id, a4._id, a5._id, a6._id, a7._id, a8._id, a9._id, a10._id);

    console.log('[WeakAreasTest] Created test accounts and attempt data.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // I. No token
    console.log('[WeakAreasTest] Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getWeakAreas, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[WeakAreasTest] PASS: GET without token returns 401.');

    // J. Invalid JWT
    console.log('[WeakAreasTest] Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getWeakAreas, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[WeakAreasTest] PASS: Invalid/Tampered JWT returns 401.');

    // K. Admin token
    console.log('[WeakAreasTest] Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getWeakAreas, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[WeakAreasTest] PASS: Admin attempting student route rejected with 403.');

    // A. Student with no attempts (Empty data)
    console.log('[WeakAreasTest] Testing student 3 (zero attempts)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token3}` }));
    await simulateRoute(getWeakAreas, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    if (rs.body.data.weakAreas.length !== 0) throw new Error(`Expected 0 weak areas for student 3, got ${rs.body.data.weakAreas.length}`);
    console.log('[WeakAreasTest] PASS: Empty weak areas returned correctly for user with no attempts.');

    // A2. Valid student with one attempt
    console.log('[WeakAreasTest] Testing valid student 1 (isolated)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getWeakAreas, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    if (rs.body.data.weakAreas.length !== 1) throw new Error(`Expected 1 weak area for student 1, got ${rs.body.data.weakAreas.length}`);
    console.log('[WeakAreasTest] PASS: Endpoint isolated correctly for student 1.');

    // B. Valid student with seeded attempt data
    console.log('[WeakAreasTest] Testing seeded weakness calculation (Student 2)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getWeakAreas, r, rs);
    
    const weakAreas = rs.body.data.weakAreas;
    if (weakAreas.length !== 2) throw new Error(`Expected exactly 2 weak areas (<60%), got ${weakAreas.length}`);

    // They should be sorted by accuracy (ascending) then totalAttempts (descending)
    // 33% accuracy (Time and Work) should be first
    // 50% accuracy (Binary Search Trees) should be second
    if (weakAreas[0].topic !== 'Time and Work') throw new Error(`Expected Time and Work first, got ${weakAreas[0].topic}`);
    if (weakAreas[0].accuracy !== 33) throw new Error(`Expected 33% accuracy for Time and Work, got ${weakAreas[0].accuracy}`);
    
    if (weakAreas[1].topic !== 'Binary Search Trees') throw new Error(`Expected BST second, got ${weakAreas[1].topic}`);
    if (weakAreas[1].accuracy !== 50) throw new Error(`Expected 50% accuracy for BST, got ${weakAreas[1].accuracy}`);
    if (weakAreas[1].totalAttempts !== 4) throw new Error(`Expected 4 attempts for BST, got ${weakAreas[1].totalAttempts}`);

    console.log('[WeakAreasTest] PASS: Weak areas calculated, filtered (<60%), and sorted correctly.');

    // L, M. Injection and Scoping
    console.log('[WeakAreasTest] Testing identity injection and data scoping...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() }, // body
      { userId: student2._id.toString() }, // query
      { userId: student2._id.toString() }  // params
    ));
    await simulateRoute(getWeakAreas, r, rs);
    if (rs.body.data.weakAreas.length !== 1) throw new Error('SECURITY FAILURE: Identity injection succeeded, Student 1 read Student 2 progress!');
    console.log('[WeakAreasTest] PASS: userId injection ignored, Student A cannot read Student B progress.');

    // N. Atlas persistence verification (Implied by above reads from created data, but let's confirm DB state)
    console.log('[WeakAreasTest] Atlas persistence verification...');
    const dbAttempts = await AttemptTrack.countDocuments({ userId: student2._id });
    if (dbAttempts !== 9) throw new Error('Database persistence issue, attempts not found in Atlas.');
    console.log('[WeakAreasTest] PASS: Atlas connectivity and persistence verified.');

    // O. Cleanup
    console.log('[WeakAreasTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    
    console.log('[WeakAreasTest] PASS: All temporary test data deleted from MongoDB Atlas.');
    console.log('[WeakAreasTest] === BACKEND STUDENT WEAK AREAS API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[WeakAreasTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runWeakAreasVerification();
