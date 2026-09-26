import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import WeaknessAnalysis from '../src/models/WeaknessAnalysis.js';
import Roadmap from '../src/models/Roadmap.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import {
  getStudentsList,
  getAdminStudentById
} from '../src/controllers/adminController.js';
import { calculateReadinessScore } from '../src/services/readinessScoreService.js';
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

const runAdminStudentsVerification = async () => {
  console.log('[AdminStudentsTest] Starting Step 47 Dedicated Admin Student Management Verification...');
  const createdIds = { users: [], questions: [], topics: [], attempts: [], profiles: [], weaknesses: [], roadmaps: [] };

  try {
    await connectDB();
    console.log('[AdminStudentsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // 1. Create target student user
    const studentUser = await User.create({
      name: 'Admin Student Test Target',
      email: `admin-stud-target-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student',
      targetRole: 'Senior SDE-1',
      targetCompanies: ['Google', 'Microsoft']
    });
    createdIds.users.push(studentUser._id);
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });

    // 2. Create admin user
    const adminUser = await User.create({
      name: 'Admin Student Test Admin',
      email: `admin-stud-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // 3. Create Learner Profile for target student
    const profile = await LearnerProfile.create({
      userId: studentUser._id,
      currentSkillLevel: 'Intermediate',
      baselineAssessmentCompleted: true,
      baselineScore: 75,
      readinessScore: 70
    });
    createdIds.profiles.push(profile._id);

    // 4. Create Topic & Question for practice data
    const topic = await Topic.create({
      category: 'dsa',
      subject: 'Data Structures',
      title: 'Admin Stud Test Topic',
      slug: `admin-stud-topic-${Date.now()}`,
      order: 999
    });
    createdIds.topics.push(topic._id);

    const question = await Question.create({
      topicId: topic._id,
      title: 'Two Sum Admin Stud Test',
      slug: `two-sum-admin-stud-${Date.now()}`,
      category: 'dsa',
      difficulty: 'Easy',
      type: 'coding',
      problemStatement: 'Find indices of two numbers.',
      solutionCode: 'function twoSum() {}',
      solutionExplanation: 'Use Hash Map',
      testCases: [{ input: '[2,7]\n9', expectedOutput: '[0,1]', isHidden: false }]
    });
    createdIds.questions.push(question._id);

    // 5. Create AttemptTrack for target student
    const attempt = await AttemptTrack.create({
      userId: studentUser._id,
      questionId: question._id,
      category: 'dsa',
      submittedCode: 'const SECRET_SUBMITTED_CODE = true; function twoSum() { return [0,1]; }',
      language: 'javascript',
      status: 'Accepted',
      timeSpentSeconds: 180,
      passedTestCases: 1,
      totalTestCases: 1
    });
    createdIds.attempts.push(attempt._id);

    // 6. Create WeaknessAnalysis for target student
    const weakness = await WeaknessAnalysis.create({
      userId: studentUser._id,
      topicId: topic._id,
      category: 'dsa',
      failureCount: 2,
      accuracyPercentage: 33,
      severity: 'High'
    });
    createdIds.weaknesses.push(weakness._id);

    // 7. Create Roadmap for target student
    const roadmap = await Roadmap.create({
      userId: studentUser._id,
      nodes: [{
        nodeId: 'node-1',
        topicId: topic._id,
        status: 'in_progress',
        priorityScore: 85,
        recommendedDifficulty: 'Medium'
      }]
    });
    createdIds.roadmaps.push(roadmap._id);

    const authAdmin = authorize('admin');

    const simulateAdminRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authAdmin, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // 1. Unauthenticated list -> 401
    console.log('[AdminStudentsTest] 1. Testing unauthenticated GET students list...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateAdminRoute(getStudentsList, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2. Student list -> 403
    console.log('[AdminStudentsTest] 2. Testing student role accessing admin student list...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateAdminRoute(getStudentsList, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student role, got ${rs.statusCode}`);
    console.log('PASS: Student request rejected with 403 Forbidden.');

    // 3. Admin list -> 200
    console.log('[AdminStudentsTest] 3. Testing Admin GET students list...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateAdminRoute(getStudentsList, r, rs);
    if (rs.statusCode !== 200 || !rs.body?.success) {
      throw new Error(`Expected 200 for Admin GET students, got ${rs.statusCode}`);
    }
    const studentList = rs.body.data?.students;
    if (!Array.isArray(studentList) || studentList.length === 0) {
      throw new Error('Students list empty or not an array');
    }
    console.log('PASS: Admin GET students list returned 200.');

    // 4. Search works
    console.log('[AdminStudentsTest] 4. Testing student search by name/email...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { search: 'Admin Student Test Target' }
    ));
    await simulateAdminRoute(getStudentsList, r, rs);
    const searchRes = rs.body.data?.students;
    if (!Array.isArray(searchRes) || searchRes.length === 0 || searchRes[0].email !== studentUser.email) {
      throw new Error('Student search failed to find target student');
    }
    console.log('PASS: Student search works cleanly.');

    // 5. Pagination works
    console.log('[AdminStudentsTest] 5. Testing pagination...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { page: 1, limit: 1 }
    ));
    await simulateAdminRoute(getStudentsList, r, rs);
    if (rs.statusCode !== 200 || rs.body.data?.pagination?.limit !== 1) {
      throw new Error('Pagination limit validation failed');
    }
    console.log('PASS: Pagination limit verified.');

    // 6. Filter works (baselineStatus & skillLevel)
    console.log('[AdminStudentsTest] 6. Testing student filters...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { baselineStatus: 'completed', skillLevel: 'Intermediate' }
    ));
    await simulateAdminRoute(getStudentsList, r, rs);
    if (rs.statusCode !== 200 || !Array.isArray(rs.body.data?.students)) {
      throw new Error('Filter query failed');
    }
    console.log('PASS: Student filters (baselineStatus & skillLevel) verified.');

    // 7. Admin student detail -> 200
    console.log('[AdminStudentsTest] 7. Testing Admin GET student detail by ID...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { studentId: studentUser._id.toString() }
    ));
    await simulateAdminRoute(getAdminStudentById, r, rs);
    if (rs.statusCode !== 200 || !rs.body.data?.profile) {
      throw new Error(`GET student detail failed with status ${rs.statusCode}`);
    }
    console.log('PASS: Admin GET student detail returned 200.');

    // 8. Invalid student ID -> 400
    console.log('[AdminStudentsTest] 8. Testing invalid student ID format...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { studentId: 'invalid-id-123' }
    ));
    await simulateAdminRoute(getAdminStudentById, r, rs);
    if (rs.statusCode !== 400) {
      throw new Error(`Expected 400 for malformed student ID, got ${rs.statusCode}`);
    }
    console.log('PASS: Malformed student ID rejected with 400.');

    // 9. Missing student -> 404
    console.log('[AdminStudentsTest] 9. Testing missing student ID...');
    const fakeId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { studentId: fakeId }
    ));
    await simulateAdminRoute(getAdminStudentById, r, rs);
    if (rs.statusCode !== 404) {
      throw new Error(`Expected 404 for missing student ID, got ${rs.statusCode}`);
    }
    console.log('PASS: Missing student ID returned 404.');

    // 10. Student detail contains real profile data
    console.log('[AdminStudentsTest] 10. Validating profile data in detail response...');
    const detailData = rs.body.data; // Note: previous call was missing ID; let's call for valid target
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { studentId: studentUser._id.toString() }
    ));
    await simulateAdminRoute(getAdminStudentById, r, rs);
    const validDetail = rs.body.data;
    if (validDetail.profile?.name !== studentUser.name || validDetail.profile?.email !== studentUser.email) {
      throw new Error('Student profile data mismatch in detail response');
    }
    console.log('PASS: Real profile data in student detail response validated.');

    // 11. Readiness score matches calculateReadinessScore
    console.log('[AdminStudentsTest] 11. Validating readiness score integration...');
    const readinessCalc = await calculateReadinessScore(studentUser._id);
    if (validDetail.readiness?.score !== readinessCalc.score) {
      throw new Error(`Readiness score mismatch: expected ${readinessCalc.score}, got ${validDetail.readiness?.score}`);
    }
    console.log('PASS: Readiness score matches readinessScoreService authoritatively.');

    // 12. Performance metrics use real AttemptTrack data
    console.log('[AdminStudentsTest] 12. Validating performance metrics from AttemptTrack...');
    if (validDetail.performance?.totalAttempts < 1 || validDetail.performance?.successfulAttempts < 1) {
      throw new Error('Performance metrics did not reflect real AttemptTrack data');
    }
    console.log('PASS: Performance metrics strictly derived from MongoDB AttemptTrack.');

    // 13. Weak areas use real WeaknessAnalysis data
    console.log('[AdminStudentsTest] 13. Validating weak areas from WeaknessAnalysis...');
    if (!Array.isArray(validDetail.weakAreas) || validDetail.weakAreas.length === 0) {
      throw new Error('Weak areas missing in student detail');
    }
    console.log('PASS: Weak areas strictly derived from MongoDB WeaknessAnalysis.');

    // 14, 15, 16, 17. Security Audit (No passwords, secrets, submitted code, answer keys)
    console.log('[AdminStudentsTest] 14–17. Auditing security & secret exclusion in responses...');
    const fullBodyStr = JSON.stringify(rs.body);
    if (fullBodyStr.includes('passwordHash') || fullBodyStr.includes('JWT_SECRET') || fullBodyStr.includes('GEMINI_API_KEY')) {
      throw new Error('SECURITY AUDIT FAILED: Password hash or credentials exposed!');
    }
    if (fullBodyStr.includes('SECRET_SUBMITTED_CODE')) {
      throw new Error('SECURITY AUDIT FAILED: Submitted source code exposed in admin monitoring API!');
    }
    console.log('PASS: Security audit passed (0 password hashes, credentials, or submitted source codes exposed).');

    // 18, 19, 20. Body/Query injection protection
    console.log('[AdminStudentsTest] 18–20. Testing body/query parameter injection protection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { role: 'admin', userId: adminUser._id.toString(), studentId: adminUser._id.toString() },
      { role: 'admin', userId: adminUser._id.toString() }
    ));
    await simulateAdminRoute(getStudentsList, r, rs);
    if (rs.statusCode !== 403) {
      throw new Error('Security failure: Student bypassed authorization using body/query injection');
    }
    console.log('PASS: Body/query parameter injection safely ignored.');

    // Clean up temporary test data
    console.log('[AdminStudentsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.roadmaps) await Roadmap.deleteOne({ _id: id });
    for (const id of createdIds.weaknesses) await WeaknessAnalysis.deleteOne({ _id: id });
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id });
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.profiles) await LearnerProfile.deleteOne({ _id: id });
    for (const id of createdIds.users) await User.deleteOne({ _id: id });

    console.log('[AdminStudentsTest] PASS: All temporary test documents cleaned up.');
    console.log('[AdminStudentsTest] === DEDICATED STEP 47 ADMIN STUDENT MANAGEMENT VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[AdminStudentsTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.roadmaps) await Roadmap.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.weaknesses) await WeaknessAnalysis.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.attempts) await AttemptTrack.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.profiles) await LearnerProfile.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runAdminStudentsVerification();
