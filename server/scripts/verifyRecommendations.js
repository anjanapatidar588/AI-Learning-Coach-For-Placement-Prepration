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
import LearnerProfile from '../src/models/LearnerProfile.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import WeaknessAnalysis from '../src/models/WeaknessAnalysis.js';
import Roadmap from '../src/models/Roadmap.js';
import Topic from '../src/models/Topic.js';
import Question from '../src/models/Question.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getRecommendations } from '../src/controllers/studentController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, query = {}, body = {}) => {
  const req = { headers, query, body };
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

const runVerification = async () => {
  console.log('[RecommendationsTest] Starting Phase 3 Step 30 Backend Recommendations Verification...');
  const created = {
    users: [],
    profiles: [],
    topics: [],
    questions: [],
    attempts: [],
    weaknesses: [],
    roadmaps: []
  };

  try {
    await connectDB();
    console.log('[RecommendationsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');
    const student1 = await User.create({ name: 'Empty Student', email: `rec-empty-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const student2 = await User.create({ name: 'Weak Student', email: `rec-weak-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const student3 = await User.create({ name: 'Strong Student', email: `rec-strong-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'Rec Admin', email: `rec-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
    created.users.push(student1._id, student2._id, student3._id, adminUser._id);

    const token1 = generateToken({ id: student1._id, role: student1.role });
    const token2 = generateToken({ id: student2._id, role: student2.role });
    const token3 = generateToken({ id: student3._id, role: student3.role });
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Setup Weak Student data (student2)
    const topicDsa = await Topic.create({ title: 'Dynamic Programming', category: 'dsa', subject: 'Algorithms', slug: `dp-rec-${Date.now()}` });
    const topicApt = await Topic.create({ title: 'Time and Work', category: 'aptitude', subject: 'Math', slug: `math-rec-${Date.now()}` });
    created.topics.push(topicDsa._id, topicApt._id);

    const qDsa = await Question.create({ title: 'Knapsack 0/1', slug: `knapsack-${Date.now()}`, problemStatement: 'Solve 0/1 Knapsack problem.', category: 'dsa', topicId: topicDsa._id, difficulty: 'Medium' });
    created.questions.push(qDsa._id);

    const weakRecord = await WeaknessAnalysis.create({
      userId: student2._id,
      topicId: topicDsa._id,
      category: 'dsa',
      failureCount: 5,
      accuracyPercentage: 20,
      severity: 'High'
    });
    created.weaknesses.push(weakRecord._id);

    const roadmap2 = await Roadmap.create({
      userId: student2._id,
      nodes: [{ nodeId: 'dp-node', topicId: topicDsa._id, status: 'in_progress', priorityScore: 90 }]
    });
    created.roadmaps.push(roadmap2._id);

    // Setup Strong Student data (student3)
    const profile3 = await LearnerProfile.create({
      userId: student3._id,
      currentSkillLevel: 'Advanced',
      dsaMastery: 92,
      aptitudeMastery: 88,
      csCoreMastery: 85,
      overallReadinessScore: 90
    });
    created.profiles.push(profile3._id);

    for (let i = 0; i < 4; i++) {
      const att = await AttemptTrack.create({
        userId: student3._id,
        questionId: qDsa._id,
        category: 'dsa',
        status: 'Accepted',
        timeSpentSeconds: 90
      });
      created.attempts.push(att._id);
    }

    const authStudent = authorize('student');
    const simulateRoute = async (req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await getRecommendations(req, res);
    };

    console.log('\n--- Test A & B: Auth & RBAC Enforcement ---');
    // A. Unauthenticated request -> 401
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);
    console.log('PASS: Unauthenticated request rejected (401).');

    // B. Admin request -> 403
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('PASS: Admin role rejected (403).');

    console.log('\n--- Test C & F: Valid Student Request & Empty Data Behavior ---');
    // C, F. Brand new student (student1) with zero records -> returns empty array
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200 for valid student, got ${rs.statusCode}`);
    if (rs.body.success !== true || !Array.isArray(rs.body.data)) throw new Error('Invalid response format');
    if (rs.body.data.length !== 0) throw new Error(`Expected empty array for student with no data, got ${rs.body.data.length} items`);
    console.log('PASS: Valid student request with empty data returns { success: true, data: [] } without fake recommendations.');

    console.log('\n--- Test D & K: Identity Isolation & Injection Safety ---');
    // D, K. Student1 attempts to pass Student2's ID in query or body
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}` },
      { userId: student2._id.toString(), studentId: student2._id.toString() },
      { userId: student2._id.toString() }
    ));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200, got ${rs.statusCode}`);
    if (rs.body.data.length !== 0) throw new Error('Identity injection leaked another student data!');
    console.log('PASS: Identity strictly derived from JWT. Query/body injection parameters ignored safely.');

    console.log('\n--- Test G: Weakness-based Recommendation ---');
    // G. Student2 (weak student) recommendations
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200, got ${rs.statusCode}`);
    if (rs.body.data.length === 0) throw new Error('Expected recommendations for weak student, got none');
    
    const weakRec = rs.body.data.find(rec => rec.topicName === 'Dynamic Programming' || rec.type === 'EASIER_PRACTICE' || rec.type === 'WEAK_TOPIC_REVISION');
    if (!weakRec) throw new Error('Expected weakness-based recommendation for Dynamic Programming');
    if (!weakRec.reason.includes('accuracy') && !weakRec.reason.includes('failed') && !weakRec.reason.includes('weakness')) {
      throw new Error(`Reason must be data-driven! Got: ${weakRec.reason}`);
    }
    console.log('PASS: Weakness-based recommendation generated with accurate data-driven reason.');

    console.log('\n--- Test H: Strong-performance Recommendation ---');
    // H. Student3 (strong student) recommendations
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token3}` }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200, got ${rs.statusCode}`);
    const harderRec = rs.body.data.find(rec => rec.type === 'HARDER_PRACTICE');
    if (!harderRec) throw new Error('Expected HARDER_PRACTICE recommendation for strong student');
    console.log('PASS: Strong-performance produced HARDER_PRACTICE recommendation correctly.');

    console.log('\n--- Test E & J: Recommendation Limits (<= 5) & Deduplication ---');
    if (rs.body.data.length > 5) throw new Error(`Recommendation count exceeds limit of 5: got ${rs.body.data.length}`);
    
    // Check duplicates
    const keys = rs.body.data.map(rec => `${rec.type}_${rec.category}_${rec.topicName}`);
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== keys.length) throw new Error('Duplicate recommendations found in response');
    console.log(`PASS: Recommendations count is ${rs.body.data.length} (<= 5) and deduplication verified.`);

    console.log('\n--- Test I: Sensitive-field Protection ---');
    const responseJson = JSON.stringify(rs.body);
    const forbiddenList = ['password', 'passwordHash', 'token', 'jwt', 'submittedCode', 'secret'];
    for (const f of forbiddenList) {
      if (responseJson.toLowerCase().includes(f.toLowerCase())) {
        throw new Error(`Forbidden sensitive field "${f}" found in recommendation response!`);
      }
    }
    console.log('PASS: Response audited - no sensitive fields or internal codes exposed.');

    console.log('\n[RecommendationsTest] === ALL STEP 30 VERIFICATION CHECKS PASSED ===');
  } catch (error) {
    console.error(`\n[RecommendationsTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[RecommendationsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of created.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.profiles) await LearnerProfile.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.weaknesses) await WeaknessAnalysis.deleteOne({ _id: id }).catch(() => {});
    for (const id of created.roadmaps) await Roadmap.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[RecommendationsTest] Cleanup complete.');
  }
};

runVerification();
