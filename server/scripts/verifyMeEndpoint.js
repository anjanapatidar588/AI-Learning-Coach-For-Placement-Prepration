import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getMe } from '../src/controllers/authController.js';
import { protect } from '../src/middleware/authMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Helper to simulate Express req/res
const createMockReqRes = (headers = {}, body = {}, query = {}) => {
  const req = { headers, body, query };
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

// Promisified protect middleware runner
const runProtect = (req, res) => {
  return new Promise((resolve) => {
    protect(req, res, () => {
      resolve(true); // next() called
    });
    // If next is not called, protect should have called res.status().json()
    // We use setTimeout to give it time to synchronously run json() if it fails
    setTimeout(() => resolve(false), 10);
  });
};

const runMeVerification = async () => {
  console.log('[MeEndpointTest] Starting Phase 3 Step 5 Backend Current User Endpoint Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[MeEndpointTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student user
    const studentUser = await User.create({
      name: 'Student Me Test',
      email: `student-me-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(studentUser._id);
    const studentToken = generateToken({ id: studentUser._id, role: studentUser.role });

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Me Test',
      email: `admin-me-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    console.log('[MeEndpointTest] Created test accounts for Student and Admin.');

    // A. No Authorization header
    console.log('[MeEndpointTest] A. Testing No Authorization header...');
    const { req: reqA, res: resA } = createMockReqRes();
    const nextA = await runProtect(reqA, resA);
    if (nextA || resA.statusCode !== 401) {
      throw new Error(`Expected 401 for no auth header, got next=${nextA}, status=${resA.statusCode}`);
    }
    console.log('[MeEndpointTest] PASS: No auth header returns 401.');

    // B & C. Invalid/Tampered JWT
    console.log('[MeEndpointTest] B & C. Testing Invalid/Tampered JWT...');
    const { req: reqB, res: resB } = createMockReqRes({ authorization: 'Bearer invalid.token.here' });
    const nextB = await runProtect(reqB, resB);
    if (nextB || resB.statusCode !== 401) {
      throw new Error(`Expected 401 for invalid JWT, got status=${resB.statusCode}`);
    }
    console.log('[MeEndpointTest] PASS: Invalid/Tampered JWT returns 401.');

    // D & F & G & H & I & J. Valid student JWT
    console.log('[MeEndpointTest] D, F, G, H, I, J. Testing valid student JWT...');
    const { req: reqD, res: resD } = createMockReqRes({ authorization: `Bearer ${studentToken}` });
    const nextD = await runProtect(reqD, resD);
    if (!nextD) throw new Error('Protect middleware rejected valid student token');
    await getMe(reqD, resD);

    if (resD.statusCode !== 200 || !resD.body.success) {
      throw new Error(`Expected 200 success for getMe, got ${resD.statusCode}`);
    }
    const { user: studentProfile } = resD.body;
    if (studentProfile.id.toString() !== studentUser._id.toString()) throw new Error('Student ID mismatch');
    if (studentProfile.role !== 'student') throw new Error('Student role mismatch');
    if (studentProfile.email !== studentUser.email) throw new Error('Student email mismatch');
    if (studentProfile.name !== studentUser.name) throw new Error('Student name mismatch');
    
    if (studentProfile.password || studentProfile.passwordHash || resD.body.JWT_SECRET) {
      throw new Error('SECURITY FAILURE: Sensitive data exposed in response');
    }
    console.log('[MeEndpointTest] PASS: Valid student JWT returns 200, correct fields, no sensitive data.');

    // E. Valid admin JWT
    console.log('[MeEndpointTest] E. Testing valid admin JWT...');
    const { req: reqE, res: resE } = createMockReqRes({ authorization: `Bearer ${adminToken}` });
    const nextE = await runProtect(reqE, resE);
    if (!nextE) throw new Error('Protect middleware rejected valid admin token');
    await getMe(reqE, resE);
    
    if (resE.body.user.role !== 'admin' || resE.body.user.id.toString() !== adminUser._id.toString()) {
      throw new Error('Admin profile data mismatch');
    }
    console.log('[MeEndpointTest] PASS: Valid admin JWT works and returns admin role.');

    // K. Client-provided user ID injection attempt
    console.log('[MeEndpointTest] K. Testing client-provided user ID injection...');
    const { req: reqK, res: resK } = createMockReqRes(
      { authorization: `Bearer ${studentToken}`, 'x-user-id': adminUser._id.toString() },
      { userId: adminUser._id.toString(), id: adminUser._id.toString() },
      { userId: adminUser._id.toString(), id: adminUser._id.toString() }
    );
    const nextK = await runProtect(reqK, resK);
    if (!nextK) throw new Error('Protect middleware failed on injection test');
    await getMe(reqK, resK);
    
    if (resK.body.user.id.toString() !== studentUser._id.toString()) {
      throw new Error('SECURITY FAILURE: Client was able to inject a different user ID!');
    }
    console.log('[MeEndpointTest] PASS: Client-provided ID injection ignored, identity relies solely on JWT.');

    // L. Deleted/nonexistent authenticated user
    console.log('[MeEndpointTest] L. Testing deleted/nonexistent authenticated user...');
    await User.deleteOne({ _id: studentUser._id }); // delete the student user directly in DB
    
    const { req: reqL, res: resL } = createMockReqRes({ authorization: `Bearer ${studentToken}` });
    const nextL = await runProtect(reqL, resL); // token is still mathematically valid
    if (!nextL) throw new Error('Protect middleware unexpectedly rejected mathematically valid token');
    
    await getMe(reqL, resL); // Controller should catch the nonexistent user
    if (resL.statusCode !== 404 || resL.body.success !== false) {
      throw new Error(`Expected 404 for deleted user in getMe, got ${resL.statusCode}`);
    }
    console.log('[MeEndpointTest] PASS: Deleted/nonexistent user handled safely with 404.');

    // M. Cleanup
    console.log('[MeEndpointTest] M. Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
    }
    
    const postCleanupCount = await User.countDocuments({ _id: { $in: createdUserIds } });
    if (postCleanupCount !== 0) {
      throw new Error('Cleanup failed: Temporary test user documents remain in Atlas');
    }
    console.log('[MeEndpointTest] PASS: All temporary test users deleted from MongoDB Atlas (0 remaining).');
    console.log('[MeEndpointTest] === BACKEND ME ENDPOINT FUNCTIONALITY VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[MeEndpointTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runMeVerification();
