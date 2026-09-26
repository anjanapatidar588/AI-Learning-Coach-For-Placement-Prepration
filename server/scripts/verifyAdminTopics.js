import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import {
  getAdminTopics,
  getAdminTopicById,
  createAdminTopic,
  updateAdminTopic,
  deleteAdminTopic
} from '../src/controllers/adminController.js';
import { getDSATopics } from '../src/controllers/dsaController.js';
import { getAptitudeTopics } from '../src/controllers/aptitudeController.js';
import { getCSCoreSubjects } from '../src/controllers/csCoreController.js';
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

const runAdminTopicsVerification = async () => {
  console.log('[AdminTopicsTest] Starting Step 48 Dedicated Admin Topic Management Verification...');
  const createdIds = { users: [], questions: [], topics: [] };

  try {
    await connectDB();
    console.log('[AdminTopicsTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student user
    const studentUser = await User.create({
      name: 'Admin Topics Test Student',
      email: `admin-topic-student-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdIds.users.push(studentUser._id);
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Topics Test Admin',
      email: `admin-topic-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdIds.users.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    // Create initial test topic
    const initialTopic = await Topic.create({
      title: 'Initial Admin Topic Test',
      slug: `initial-admin-topic-${Date.now()}`,
      category: 'dsa',
      subject: 'Data Structures',
      difficulty: 'Medium',
      order: 10,
      summary: 'Topic summary for testing'
    });
    createdIds.topics.push(initialTopic._id);

    const authAdmin = authorize('admin');

    const simulateAdminRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authAdmin, req, res);
      if (!a) return;
      await controller(req, res);
    };

    const simulateStudentRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const authStud = authorize('student');
      const a = await runMiddleware(authStud, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // 1. Unauthenticated list -> 401
    console.log('[AdminTopicsTest] 1. Testing unauthenticated GET topics...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${rs.statusCode}`);
    console.log('PASS: Unauthenticated request rejected (401).');

    // 2. Student list -> 403
    console.log('[AdminTopicsTest] 2. Testing student role accessing Admin topics...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student role, got ${rs.statusCode}`);
    console.log('PASS: Student request rejected with 403 Forbidden.');

    // 3. Admin list -> 200
    console.log('[AdminTopicsTest] 3. Testing Admin GET topics...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 200 || !rs.body?.success) {
      throw new Error(`Expected 200 for Admin GET topics, got ${rs.statusCode}`);
    }
    const topicList = rs.body.data?.topics;
    if (!Array.isArray(topicList) || topicList.length === 0) {
      throw new Error('Topics list empty or not an array');
    }
    console.log('PASS: Admin GET topics returned 200.');

    // 4. Search works
    console.log('[AdminTopicsTest] 4. Testing topic search...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { search: 'Initial Admin Topic' }
    ));
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 200 || !Array.isArray(rs.body.data?.topics) || rs.body.data.topics.length === 0) {
      throw new Error('Topic search failed to find initial topic');
    }
    console.log('PASS: Topic search verified.');

    // 5. Category/subject filter works
    console.log('[AdminTopicsTest] 5. Testing topic category filter...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { category: 'dsa', subject: 'Data Structures' }
    ));
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 200 || !Array.isArray(rs.body.data?.topics)) {
      throw new Error('Topic category/subject filter failed');
    }
    console.log('PASS: Topic category & subject filtering verified.');

    // 6. Pagination works
    console.log('[AdminTopicsTest] 6. Testing topic pagination...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      { page: 1, limit: 1 }
    ));
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 200 || rs.body.data?.pagination?.limit !== 1) {
      throw new Error('Topic pagination limit calculation failed');
    }
    console.log('PASS: Topic pagination verified.');

    // 7. Admin detail works
    console.log('[AdminTopicsTest] 7. Testing Admin GET topic detail...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { topicId: initialTopic._id.toString() }
    ));
    await simulateAdminRoute(getAdminTopicById, r, rs);
    if (rs.statusCode !== 200 || rs.body.data?.title !== initialTopic.title) {
      throw new Error(`GET topic by ID failed with status ${rs.statusCode}`);
    }
    console.log('PASS: Admin GET topic detail verified.');

    // 8. Invalid ObjectId -> 400
    console.log('[AdminTopicsTest] 8. Testing malformed ObjectId...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { topicId: 'invalid-topic-id-123' }
    ));
    await simulateAdminRoute(getAdminTopicById, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for malformed ObjectId, got ${rs.statusCode}`);
    console.log('PASS: Malformed ObjectId rejected with 400.');

    // 9. Missing topic -> 404
    console.log('[AdminTopicsTest] 9. Testing missing topic ID...');
    const fakeId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { topicId: fakeId }
    ));
    await simulateAdminRoute(getAdminTopicById, r, rs);
    if (rs.statusCode !== 404) throw new Error(`Expected 404 for missing topic, got ${rs.statusCode}`);
    console.log('PASS: Missing topic returned 404.');

    // 10. Valid topic creation works
    console.log('[AdminTopicsTest] 10. Testing Admin create topic...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'New Valid Admin Topic',
        category: 'aptitude',
        subject: 'Quantitative Aptitude',
        difficulty: 'Easy',
        order: 5,
        summary: 'Aptitude topic summary'
      }
    ));
    await simulateAdminRoute(createAdminTopic, r, rs);
    if (rs.statusCode !== 201 || !rs.body.data?._id) {
      throw new Error(`Admin create topic failed with status ${rs.statusCode}: ${rs.body?.message}`);
    }
    const createdTopicId = rs.body.data._id;
    createdIds.topics.push(createdTopicId);
    console.log('PASS: Admin create topic verified (201).');

    // 11. Invalid category rejected
    console.log('[AdminTopicsTest] 11. Testing invalid category rejection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Invalid Category Topic',
        category: 'invalid_category',
        subject: 'Math'
      }
    ));
    await simulateAdminRoute(createAdminTopic, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for invalid category, got ${rs.statusCode}`);
    console.log('PASS: Invalid category rejected with 400.');

    // 12. Invalid required fields rejected
    console.log('[AdminTopicsTest] 12. Testing missing required fields...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        category: 'dsa',
        subject: 'Data Structures'
      }
    ));
    await simulateAdminRoute(createAdminTopic, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for missing title, got ${rs.statusCode}`);
    console.log('PASS: Missing title rejected with 400.');

    // 13. Duplicate topic protection works
    console.log('[AdminTopicsTest] 13. Testing duplicate topic protection...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Initial Admin Topic Test', // Same title in category dsa
        category: 'dsa',
        subject: 'Data Structures'
      }
    ));
    await simulateAdminRoute(createAdminTopic, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for duplicate topic, got ${rs.statusCode}`);
    console.log('PASS: Duplicate topic creation rejected with 400.');

    // 14. Admin update works
    console.log('[AdminTopicsTest] 14. Testing Admin edit topic...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {
        title: 'Updated Admin Topic Title',
        difficulty: 'Hard'
      },
      {},
      { topicId: createdTopicId.toString() }
    ));
    await simulateAdminRoute(updateAdminTopic, r, rs);
    if (rs.statusCode !== 200 || rs.body.data?.title !== 'Updated Admin Topic Title') {
      throw new Error(`Admin update topic failed with status ${rs.statusCode}`);
    }
    console.log('PASS: Admin update topic verified.');

    // 15, 16, 17. Student cannot create/update/delete
    console.log('[AdminTopicsTest] 15–17. Testing student attempt to create/update/delete topics...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { title: 'Hacked Topic', category: 'dsa', subject: 'Hack' }
    ));
    await simulateAdminRoute(createAdminTopic, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student create, got ${rs.statusCode}`);

    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { title: 'Hacked Topic Title' },
      {},
      { topicId: createdTopicId.toString() }
    ));
    await simulateAdminRoute(updateAdminTopic, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student edit, got ${rs.statusCode}`);

    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      {},
      {},
      { topicId: createdTopicId.toString() }
    ));
    await simulateAdminRoute(deleteAdminTopic, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for student delete, got ${rs.statusCode}`);
    console.log('PASS: Student attempts to create/edit/delete strictly rejected with 403.');

    // 18 & 19. Delete with linked Question is safely blocked
    console.log('[AdminTopicsTest] 18 & 19. Testing safe topic deletion prevention when linked questions exist...');
    const linkedQuestion = await Question.create({
      topicId: initialTopic._id,
      title: 'Linked Question Topic Test',
      slug: `linked-q-topic-test-${Date.now()}`,
      category: 'dsa',
      difficulty: 'Easy',
      type: 'coding',
      problemStatement: 'Testing deletion block with linked question.',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }]
    });
    createdIds.questions.push(linkedQuestion._id);

    // Try deleting initialTopic (which has a linked question)
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { topicId: initialTopic._id.toString() }
    ));
    await simulateAdminRoute(deleteAdminTopic, r, rs);
    if (rs.statusCode !== 400 || !rs.body.message?.includes('question')) {
      throw new Error(`Expected 400 block when linked questions exist, got ${rs.statusCode}`);
    }
    console.log('PASS: Deletion safely blocked when linked questions exist.');

    // Now delete createdTopicId (which has NO linked question)
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${adminToken}` },
      {},
      {},
      { topicId: createdTopicId.toString() }
    ));
    await simulateAdminRoute(deleteAdminTopic, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) {
      throw new Error(`Expected 200 for safe topic deletion, got ${rs.statusCode}`);
    }
    createdIds.topics = createdIds.topics.filter(id => id.toString() !== createdTopicId.toString());
    console.log('PASS: Safe topic deletion without linked questions succeeded (200).');

    // 20, 21, 22. Body/query role/userId injection protection
    console.log('[AdminTopicsTest] 20–22. Testing role/userId/studentId injection safety...');
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${studentToken}` },
      { role: 'admin', userId: adminUser._id.toString(), studentId: adminUser._id.toString() }
    ));
    await simulateAdminRoute(getAdminTopics, r, rs);
    if (rs.statusCode !== 403) throw new Error('Security failure: Student bypassed authorization using body role injection');
    console.log('PASS: Request body role/userId override prevented.');

    // 23, 24, 25. Student topic APIs compatibility verification
    console.log('[AdminTopicsTest] 23–25. Verifying student topic APIs remain functional...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateStudentRoute(getDSATopics, r, rs);
    if (rs.statusCode !== 200 || !rs.body?.success) {
      throw new Error('Student GET DSA topics API failed');
    }

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateStudentRoute(getAptitudeTopics, r, rs);
    if (rs.statusCode !== 200 || !rs.body?.success) {
      throw new Error('Student GET Aptitude topics API failed');
    }

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }));
    await simulateStudentRoute(getCSCoreSubjects, r, rs);
    if (rs.statusCode !== 200 || !rs.body?.success) {
      throw new Error('Student GET CS Core subjects API failed');
    }
    console.log('PASS: All student-facing topic & syllabus endpoints remain 100% functional.');

    // 26 & 27. Secrets & credentials exposure check
    console.log('[AdminTopicsTest] 26 & 27. Auditing security & credentials exclusion...');
    const fullBodyStr = JSON.stringify(rs.body);
    if (fullBodyStr.includes('passwordHash') || fullBodyStr.includes('JWT_SECRET') || fullBodyStr.includes('GEMINI_API_KEY')) {
      throw new Error('SECURITY AUDIT FAILED: Credentials or secrets exposed!');
    }
    console.log('PASS: Zero secrets or credentials exposed.');

    // Clean up temporary test data
    console.log('[AdminTopicsTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id });
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id });
    for (const id of createdIds.users) await User.deleteOne({ _id: id });

    console.log('[AdminTopicsTest] PASS: All temporary test documents cleaned up.');
    console.log('[AdminTopicsTest] === DEDICATED STEP 48 ADMIN TOPIC MANAGEMENT VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[AdminTopicsTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runAdminTopicsVerification();
