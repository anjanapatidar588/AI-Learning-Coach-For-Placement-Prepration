import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import Roadmap from '../src/models/Roadmap.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { verifyToken } from '../src/utils/jwtUtil.js';
import { loginUser } from '../src/controllers/authController.js';
import { protect } from '../src/middleware/authMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Helper to simulate Express req/res
const createMockReqRes = (body) => {
  const req = { body };
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

const runLoginVerification = async () => {
  console.log('[LoginTest] Starting Phase 3 Step 3 Backend Login Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[LoginTest] Connected to MongoDB Atlas.');

    // Setup temporary test user directly in Atlas
    const testEmail = `login-test-${Date.now()}@example.invalid`;
    const testPassword = 'LoginPassword123!';
    const passwordHash = await hashPassword(testPassword);

    const testUser = await User.create({
      name: 'Login Test Student',
      email: testEmail,
      passwordHash,
      role: 'student',
      targetCompanies: ['Google'],
      targetRole: 'SDE-1'
    });

    createdUserIds.push(testUser._id);
    console.log(`[LoginTest] Created temporary test user in Atlas (_id: ${testUser._id}).`);

    // A. Successful Login Test
    console.log('[LoginTest] A. Testing successful login...');
    const { req: reqA, res: resA } = createMockReqRes({
      email: testEmail,
      password: testPassword
    });

    await loginUser(reqA, resA);

    if (resA.statusCode !== 200 || !resA.body.success || !resA.body.token) {
      throw new Error(`Successful login test failed with status ${resA.statusCode}: ${JSON.stringify(resA.body)}`);
    }

    if (!resA.body.user || resA.body.user.id.toString() !== testUser._id.toString()) {
      throw new Error('Login response user ID does not match expected user');
    }
    console.log('[LoginTest] PASS: Successful login returned HTTP 200, JWT token, and safe user profile.');

    // B. Wrong Password Test
    console.log('[LoginTest] B. Testing wrong password rejection...');
    const { req: reqB, res: resB } = createMockReqRes({
      email: testEmail,
      password: 'WrongPassword123!'
    });

    await loginUser(reqB, resB);

    if (resB.statusCode !== 401 || resB.body.token) {
      throw new Error(`Wrong password login expected HTTP 401, got ${resB.statusCode}`);
    }
    console.log('[LoginTest] PASS: Wrong password rejected with HTTP 401 and no token.');

    // C. Non-existing User Test
    console.log('[LoginTest] C. Testing non-existent user rejection...');
    const { req: reqC, res: resC } = createMockReqRes({
      email: `nonexistent-${Date.now()}@example.invalid`,
      password: testPassword
    });

    await loginUser(reqC, resC);

    if (resC.statusCode !== 401 || resC.body.token) {
      throw new Error(`Non-existent user login expected HTTP 401, got ${resC.statusCode}`);
    }
    console.log('[LoginTest] PASS: Non-existent user rejected with HTTP 401.');

    // D. Invalid Input Validation Test
    console.log('[LoginTest] D. Testing invalid input validation...');
    const { req: rD1, res: resD1 } = createMockReqRes({ password: testPassword }); // missing email
    await loginUser(rD1, resD1);
    if (resD1.statusCode !== 400) throw new Error('Missing email validation failed');

    const { req: rD2, res: resD2 } = createMockReqRes({ email: testEmail }); // missing password
    await loginUser(rD2, resD2);
    if (resD2.statusCode !== 400) throw new Error('Missing password validation failed');

    const { req: rD3, res: resD3 } = createMockReqRes({ email: 'malformed-email', password: testPassword }); // malformed email
    await loginUser(rD3, resD3);
    if (resD3.statusCode !== 400) throw new Error('Malformed email validation failed');

    console.log('[LoginTest] PASS: Invalid input correctly rejected with HTTP 400.');

    // E. Email Normalization Test
    console.log('[LoginTest] E. Testing email normalization (mixed case input)...');
    const mixedCaseEmail = testEmail.toUpperCase();
    const { req: reqE, res: resE } = createMockReqRes({
      email: mixedCaseEmail,
      password: testPassword
    });

    await loginUser(reqE, resE);
    if (resE.statusCode !== 200 || !resE.body.token) {
      throw new Error('Email normalization login test failed');
    }
    console.log('[LoginTest] PASS: Mixed-case email authenticates successfully after normalization.');

    // F. JWT Verification Test
    console.log('[LoginTest] F. Testing JWT verification for generated token...');
    const tokenToVerify = resA.body.token;
    const decodedPayload = verifyToken(tokenToVerify);

    if (decodedPayload.id !== testUser._id.toString() || decodedPayload.role !== 'student') {
      throw new Error('JWT payload verification failed: Token identity mismatch');
    }
    console.log('[LoginTest] PASS: Generated JWT contains expected user ID and role.');

    // G. Middleware Compatibility Test
    console.log('[LoginTest] G. Testing authentication middleware compatibility...');
    const mockProtectedReq = { headers: { authorization: `Bearer ${tokenToVerify}` } };
    const mockProtectedRes = createMockReqRes({});
    let middlewareNextCalled = false;

    protect(mockProtectedReq, mockProtectedRes.res, () => {
      middlewareNextCalled = true;
    });

    if (!middlewareNextCalled || !mockProtectedReq.user || mockProtectedReq.user.userId !== testUser._id.toString()) {
      throw new Error('Authentication middleware failed to process generated login JWT token');
    }
    console.log('[LoginTest] PASS: Login JWT token is fully compatible with authMiddleware.');

    // H. Response Security Test
    console.log('[LoginTest] H. Testing response security...');
    if (resA.body.user.password || resA.body.user.passwordHash || resA.body.JWT_SECRET) {
      throw new Error('SECURITY FAILURE: Login response exposed password, passwordHash, or JWT_SECRET!');
    }
    console.log('[LoginTest] PASS: Login response does NOT expose password, passwordHash, or secrets.');

    // I. Role Integrity Test
    console.log('[LoginTest] I. Testing role integrity (attempting client role override)...');
    const { req: reqI, res: resI } = createMockReqRes({
      email: testEmail,
      password: testPassword,
      role: 'admin' // Attempt client role override
    });

    await loginUser(reqI, resI);
    if (resI.body.user.role === 'admin') {
      throw new Error('SECURITY FAILURE: Client input altered user role during login!');
    }
    if (resI.body.user.role !== 'student') {
      throw new Error(`Role integrity failure: Expected 'student', got '${resI.body.user.role}'`);
    }
    console.log('[LoginTest] PASS: Role integrity preserved (comes strictly from MongoDB document).');

    // J. Cleanup
    console.log('[LoginTest] J. Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
    }

    const postCleanupCount = await User.countDocuments({ _id: { $in: createdUserIds } });
    if (postCleanupCount !== 0) {
      throw new Error('Cleanup failed: Temporary test user documents remain in Atlas');
    }
    console.log('[LoginTest] PASS: All temporary test users deleted from MongoDB Atlas (0 remaining).');
    console.log('[LoginTest] === BACKEND LOGIN FUNCTIONALITY VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[LoginTest] VERIFICATION FAILED: ${error.message}`);
    // Emergency cleanup
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runLoginVerification();
