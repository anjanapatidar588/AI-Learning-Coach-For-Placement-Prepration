import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import AssessmentBlueprint from '../src/models/AssessmentBlueprint.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';
import { createAdminAssessmentBlueprint } from '../src/controllers/adminAssessmentController.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const runReqRes = async (handler, req) => {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        resolve({ status: this.statusCode, body: data });
      },
      send(data) {
        this.body = data;
        resolve({ status: this.statusCode, body: data });
      }
    };
    try {
      handler(req, res).catch(err => {
        resolve({ status: 500, body: { success: false, message: err.message } });
      });
    } catch (err) {
      resolve({ status: 500, body: { success: false, message: err.message } });
    }
  });
};

const runMiddleware = (middleware, req) => {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        resolve({ passed: false, status: this.statusCode, body: data });
      }
    };
    try {
      middleware(req, res, () => {
        resolve({ passed: true });
      });
    } catch (e) {
      resolve({ passed: false, status: 500, body: { message: e.message } });
    }
  });
};

const executeProtectedAdminRoute = async (handler, token, body = {}, params = {}, query = {}) => {
  const req = {
    headers: { authorization: `Bearer ${token}` },
    body,
    params,
    query
  };

  const authResult = await runMiddleware(protect, req);
  if (!authResult.passed) return authResult;

  const roleResult = await runMiddleware(authorize('admin'), req);
  if (!roleResult.passed) return roleResult;

  return await runReqRes(handler, req);
};

const runBlueprintSaveVerification = async () => {
  console.log('====================================================');
  console.log('[Test] Admin Blueprint Save & RBAC Verification');
  console.log('====================================================');

  const createdUsers = [];
  const createdBlueprints = [];

  try {
    await connectDB();
    console.log('[Test] Connected to MongoDB Atlas.');

    const pwd = await hashPassword('TestPass@1234');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Blueprint Audit Admin',
      email: `audit-admin-${Date.now()}@example.invalid`,
      passwordHash: pwd,
      role: 'admin'
    });
    createdUsers.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });
    console.log('[Test] 1. Created Admin user:', adminUser.email);

    // 2. Create Student User
    const studentUser = await User.create({
      name: 'Blueprint Audit Student',
      email: `audit-student-${Date.now()}@example.invalid`,
      passwordHash: pwd,
      role: 'student'
    });
    createdUsers.push(studentUser._id);
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });
    console.log('[Test] 2. Created Student user:', studentUser.email);

    // 3. Admin creates valid blueprint
    console.log('[Test] 3. Testing Admin creation of valid blueprint...');
    const validPayload = {
      title: 'Placement Readiness Assessment',
      description: 'Initial placement readiness assessment',
      questionCount: 5,
      durationMinutes: 30,
      marksPerQuestion: 1,
      totalMarks: 5,
      subjects: ['dsa', 'aptitude', 'dbms'],
      topicDistribution: [
        { topicName: 'Arrays & Two Pointers', category: 'dsa', questionCount: 2, difficulty: 'Easy' },
        { topicName: 'Percentages', category: 'aptitude', questionCount: 2, difficulty: 'Easy' },
        { topicName: 'SQL Queries', category: 'dbms', questionCount: 1, difficulty: 'Medium' }
      ]
    };

    const adminCreateRes = await executeProtectedAdminRoute(createAdminAssessmentBlueprint, adminToken, validPayload);
    if (adminCreateRes.status !== 201 || !adminCreateRes.body?.success) {
      throw new Error(`Admin valid blueprint creation failed with status ${adminCreateRes.status}: ${JSON.stringify(adminCreateRes.body)}`);
    }

    const createdBp = adminCreateRes.body.data;
    createdBlueprints.push(createdBp._id);
    console.log('PASS: Admin blueprint created successfully. ID:', createdBp._id);
    console.log('PASS: Status is:', createdBp.status, '(expected DRAFT)');
    if (createdBp.status !== 'DRAFT') {
      throw new Error(`Expected blueprint status DRAFT, got ${createdBp.status}`);
    }

    // 4. Verify MongoDB Document
    console.log('[Test] 4. Verifying document in MongoDB...');
    const dbDoc = await AssessmentBlueprint.findById(createdBp._id).lean();
    if (!dbDoc) {
      throw new Error('Blueprint document not found in MongoDB!');
    }
    console.log('PASS: Document found in MongoDB:');
    console.log(' - Title:', dbDoc.title);
    console.log(' - Question Count:', dbDoc.questionCount);
    console.log(' - Duration:', dbDoc.durationMinutes);
    console.log(' - Topics count:', dbDoc.topicDistribution.length);
    console.log(' - Subjects:', dbDoc.subjects);
    console.log(' - CreatedBy:', dbDoc.createdBy.toString(), '(matches admin ID:', adminUser._id.toString(), ')');

    if (dbDoc.createdBy.toString() !== adminUser._id.toString()) {
      throw new Error('CreatedBy does not match authenticated admin ID!');
    }

    // 5. Test Student attempting to create blueprint -> Must return 403
    console.log('[Test] 5. Testing Student authorization (RBAC) - student creating blueprint...');
    const studentCreateRes = await executeProtectedAdminRoute(createAdminAssessmentBlueprint, studentToken, validPayload);
    if (studentCreateRes.status !== 403) {
      throw new Error(`Expected HTTP 403 for student create blueprint, got ${studentCreateRes.status}`);
    }
    console.log('PASS: Student blueprint creation strictly blocked with HTTP 403.');

    // 6. Test Invalid Blueprints -> Must return 400
    console.log('[Test] 6. Testing Invalid Blueprint Validations...');

    // 6a. Missing Title
    const noTitleRes = await executeProtectedAdminRoute(createAdminAssessmentBlueprint, adminToken, {
      ...validPayload,
      title: '   '
    });
    if (noTitleRes.status !== 400) {
      throw new Error(`Expected 400 for empty title, got ${noTitleRes.status}`);
    }
    console.log('PASS: Empty title rejected with 400:', noTitleRes.body.message);

    // 6b. Invalid question count
    const invalidQCountRes = await executeProtectedAdminRoute(createAdminAssessmentBlueprint, adminToken, {
      ...validPayload,
      questionCount: 0
    });
    if (invalidQCountRes.status !== 400) {
      throw new Error(`Expected 400 for 0 question count, got ${invalidQCountRes.status}`);
    }
    console.log('PASS: Invalid question count rejected with 400:', invalidQCountRes.body.message);

    // 6c. No subjects or topics selected
    const noTopicsRes = await executeProtectedAdminRoute(createAdminAssessmentBlueprint, adminToken, {
      ...validPayload,
      subjects: [],
      selectedTopics: []
    });
    if (noTopicsRes.status !== 400) {
      throw new Error(`Expected 400 for empty subjects/topics, got ${noTopicsRes.status}`);
    }
    console.log('PASS: Empty subjects/topics selection rejected with 400:', noTopicsRes.body.message);

    // 6d. Duration < 5
    const shortDurationRes = await executeProtectedAdminRoute(createAdminAssessmentBlueprint, adminToken, {
      ...validPayload,
      durationMinutes: 2
    });
    if (shortDurationRes.status !== 400) {
      throw new Error(`Expected 400 for duration < 5, got ${shortDurationRes.status}`);
    }
    console.log('PASS: Short duration (<5) rejected with 400:', shortDurationRes.body.message);

    console.log('====================================================');
    console.log('ALL ADMIN BLUEPRINT VERIFICATION CHECKS PASSED!');
    console.log('====================================================');
  } finally {
    // Cleanup created test records
    console.log('[Cleanup] Cleaning up test records...');
    if (createdBlueprints.length > 0) {
      await AssessmentBlueprint.deleteMany({ _id: { $in: createdBlueprints } });
    }
    if (createdUsers.length > 0) {
      await User.deleteMany({ _id: { $in: createdUsers } });
    }
    console.log('[Cleanup] Done.');
    await mongoose.disconnect();
    process.exit(0);
  }
};

runBlueprintSaveVerification();
