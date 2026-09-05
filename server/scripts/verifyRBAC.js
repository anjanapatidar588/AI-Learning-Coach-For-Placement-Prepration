import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken, verifyToken } from '../src/utils/jwtUtil.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Helper to simulate Express middleware chain
const runMiddlewareChain = (req, middlewares) => {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        resolve({ req, res: this });
        return this;
      }
    };

    let index = 0;
    const next = () => {
      if (index < middlewares.length) {
        const mw = middlewares[index++];
        mw(req, res, next);
      } else {
        // All middlewares passed successfully
        res.statusCode = 200;
        res.body = { success: true, message: 'Chain passed', user: req.user };
        resolve({ req, res });
      }
    };

    next();
  });
};

const runRBACVerification = async () => {
  console.log('[RBACTest] Starting Phase 3 Step 4 RBAC Middleware Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[RBACTest] Connected to MongoDB Atlas.');

    // 1. Create temporary database-backed Student User
    const studentEmail = `rbac-student-${Date.now()}@example.invalid`;
    const studentPass = 'StudentPass123!';
    const studentHash = await hashPassword(studentPass);

    const studentUser = await User.create({
      name: 'Temporary Student Tester',
      email: studentEmail,
      passwordHash: studentHash,
      role: 'student'
    });
    createdUserIds.push(studentUser._id);
    console.log(`[RBACTest] Created database-backed student user (_id: ${studentUser._id}).`);

    // 2. Create temporary database-backed Admin User
    const adminEmail = `rbac-admin-${Date.now()}@example.invalid`;
    const adminPass = 'AdminPass123!';
    const adminHash = await hashPassword(adminPass);

    const adminUser = await User.create({
      name: 'Temporary Admin Tester',
      email: adminEmail,
      passwordHash: adminHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    console.log(`[RBACTest] Created database-backed admin user (_id: ${adminUser._id}).`);

    // 3. Generate Trusted JWTs
    const studentToken = generateToken({ id: studentUser._id.toString(), role: studentUser.role });
    const adminToken = generateToken({ id: adminUser._id.toString(), role: adminUser.role });

    // Verify JWT payload integrity
    const decodedStudent = verifyToken(studentToken);
    const decodedAdmin = verifyToken(adminToken);
    if (decodedStudent.role !== 'student' || decodedAdmin.role !== 'admin') {
      throw new Error('JWT payload integrity check failed: Role mismatch');
    }
    console.log('[RBACTest] PASS: Trusted JWT generation and verification intact.');

    // TEST 1: Unauthenticated request (no token) -> 401
    console.log('[RBACTest] Test 1: Testing missing token (Unauthenticated)...');
    const req1 = { headers: {} };
    const res1 = await runMiddlewareChain(req1, [protect, authorize('student')]);
    if (res1.res.statusCode !== 401) {
      throw new Error(`Test 1 Failed: Expected HTTP 401, got ${res1.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Missing token correctly rejected with HTTP 401.');

    // TEST 2: Invalid token -> 401
    console.log('[RBACTest] Test 2: Testing invalid token...');
    const req2 = { headers: { authorization: 'Bearer invalid.token.string' } };
    const res2 = await runMiddlewareChain(req2, [protect, authorize('student')]);
    if (res2.res.statusCode !== 401) {
      throw new Error(`Test 2 Failed: Expected HTTP 401, got ${res2.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Invalid token correctly rejected with HTTP 401.');

    // TEST 3: Valid student JWT + student authorization -> 200 Allowed
    console.log('[RBACTest] Test 3: Valid student accessing student route...');
    const req3 = { headers: { authorization: `Bearer ${studentToken}` } };
    const res3 = await runMiddlewareChain(req3, [protect, authorize('student')]);
    if (res3.res.statusCode !== 200 || !res3.res.body.success) {
      throw new Error(`Test 3 Failed: Expected HTTP 200, got ${res3.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Student authorized cleanly for student route.');

    // TEST 4: Valid admin JWT + admin authorization -> 200 Allowed
    console.log('[RBACTest] Test 4: Valid admin accessing admin route...');
    const req4 = { headers: { authorization: `Bearer ${adminToken}` } };
    const res4 = await runMiddlewareChain(req4, [protect, authorize('admin')]);
    if (res4.res.statusCode !== 200 || !res4.res.body.success) {
      throw new Error(`Test 4 Failed: Expected HTTP 200, got ${res4.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Admin authorized cleanly for admin route.');

    // TEST 5: Valid student JWT + admin authorization -> 403 Forbidden
    console.log('[RBACTest] Test 5: Student attempting admin route...');
    const req5 = { headers: { authorization: `Bearer ${studentToken}` } };
    const res5 = await runMiddlewareChain(req5, [protect, authorize('admin')]);
    if (res5.res.statusCode !== 403) {
      throw new Error(`Test 5 Failed: Expected HTTP 403 Forbidden, got ${res5.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Student attempting admin route rejected with HTTP 403 Forbidden.');

    // TEST 6: Valid admin JWT + student authorization -> 403 Forbidden
    console.log('[RBACTest] Test 6: Admin attempting student-only route...');
    const req6 = { headers: { authorization: `Bearer ${adminToken}` } };
    const res6 = await runMiddlewareChain(req6, [protect, authorize('student')]);
    if (res6.res.statusCode !== 403) {
      throw new Error(`Test 6 Failed: Expected HTTP 403 Forbidden, got ${res6.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Admin attempting student-only route rejected with HTTP 403 Forbidden.');

    // TEST 7: Valid student JWT + multi-role authorization ('student', 'admin') -> 200 Allowed
    console.log('[RBACTest] Test 7: Student accessing shared route (student, admin)...');
    const req7 = { headers: { authorization: `Bearer ${studentToken}` } };
    const res7 = await runMiddlewareChain(req7, [protect, authorize('student', 'admin')]);
    if (res7.res.statusCode !== 200) {
      throw new Error(`Test 7 Failed: Expected HTTP 200, got ${res7.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Student allowed on shared route.');

    // TEST 8: Valid admin JWT + multi-role authorization ('student', 'admin') -> 200 Allowed
    console.log('[RBACTest] Test 8: Admin accessing shared route (student, admin)...');
    const req8 = { headers: { authorization: `Bearer ${adminToken}` } };
    const res8 = await runMiddlewareChain(req8, [protect, authorize('student', 'admin')]);
    if (res8.res.statusCode !== 200) {
      throw new Error(`Test 8 Failed: Expected HTTP 200, got ${res8.res.statusCode}`);
    }
    console.log('[RBACTest] PASS: Admin allowed on shared route.');

    // TEST 9: Client Role Injection Protection Test
    console.log('[RBACTest] Test 9: Client passing role=admin in body/header while student...');
    const req9 = {
      headers: { authorization: `Bearer ${studentToken}`, 'x-client-role': 'admin' },
      body: { role: 'admin' }
    };
    const res9 = await runMiddlewareChain(req9, [protect, authorize('admin')]);
    if (res9.res.statusCode !== 403) {
      throw new Error('Test 9 SECURITY FAILURE: Client body/header role injection bypassed RBAC!');
    }
    console.log('[RBACTest] PASS: Client role injection attempt rejected with HTTP 403.');

    // TEST 10: req.user context verification
    console.log('[RBACTest] Test 10: Verifying req.user identity context...');
    if (!res3.req.user || res3.req.user.userId !== studentUser._id.toString() || res3.req.user.role !== 'student') {
      throw new Error('Test 10 Failed: req.user context verification mismatch');
    }
    console.log('[RBACTest] PASS: req.user context populated correctly ({ userId, role }).');

    // Cleanup temporary test users
    console.log('[RBACTest] Cleaning up temporary test users from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
    }

    const remainingCount = await User.countDocuments({ _id: { $in: createdUserIds } });
    if (remainingCount !== 0) {
      throw new Error('Cleanup failed: Temporary test user documents remain in Atlas');
    }
    console.log('[RBACTest] PASS: All temporary test users deleted from MongoDB Atlas (0 remaining).');
    console.log('[RBACTest] === RBAC MIDDLEWARE VERIFICATION FULLY PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[RBACTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runRBACVerification();
