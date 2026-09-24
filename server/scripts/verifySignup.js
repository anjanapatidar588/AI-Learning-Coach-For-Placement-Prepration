import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import Roadmap from '../src/models/Roadmap.js';
import { comparePassword } from '../src/utils/passwordUtil.js';
import { signupUser } from '../src/controllers/authController.js';

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

const runSignupVerification = async () => {
  console.log('[SignupTest] Starting Phase 3 Step 2 Signup Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[SignupTest] Connected to MongoDB Atlas.');

    // A & B: Valid Signup & Password Hashing Verification
    console.log('[SignupTest] A & B. Testing valid signup & password hashing...');
    const testEmail = `signup-test-${Date.now()}@example.invalid`;
    const rawPassword = 'ValidPassword123!';

    const { req: req1, res: res1 } = createMockReqRes({
      name: 'Temporary Test Student',
      email: testEmail,
      password: rawPassword,
      targetCompanies: ['Google', 'Amazon']
    });

    await signupUser(req1, res1);

    if (res1.statusCode !== 201 || !res1.body.success) {
      throw new Error(`Valid signup failed with status ${res1.statusCode}: ${JSON.stringify(res1.body)}`);
    }

    const userId = res1.body.user.id;
    createdUserIds.push(userId);

    // Verify stored in Atlas
    const savedUser = await User.findById(userId);
    if (!savedUser) {
      throw new Error('User was not persisted to MongoDB Atlas');
    }

    if (savedUser.passwordHash === rawPassword) {
      throw new Error('SECURITY FAILURE: Password was stored in plaintext!');
    }

    const isMatch = await comparePassword(rawPassword, savedUser.passwordHash);
    if (!isMatch) {
      throw new Error('Password hash verification failed with passwordUtil');
    }
    console.log('[SignupTest] PASS: Valid signup succeeded, user stored in Atlas, password properly hashed.');

    // F: Response Security Verification
    console.log('[SignupTest] F. Testing response security...');
    if (res1.body.user.password || res1.body.user.passwordHash) {
      throw new Error('SECURITY FAILURE: Response exposed password or passwordHash!');
    }
    console.log('[SignupTest] PASS: Signup response does NOT expose password or passwordHash.');

    // C: Duplicate Email Rejection
    console.log('[SignupTest] C. Testing duplicate email rejection...');
    const { req: reqDup, res: resDup } = createMockReqRes({
      name: 'Duplicate Student',
      email: testEmail,
      password: 'AnotherPassword123!'
    });

    await signupUser(reqDup, resDup);

    if (resDup.statusCode !== 400 || resDup.body.success !== false) {
      throw new Error(`Duplicate signup expected HTTP 400, got ${resDup.statusCode}`);
    }

    const userCount = await User.countDocuments({ email: testEmail });
    if (userCount !== 1) {
      throw new Error(`Duplicate user check failed: Found ${userCount} users with email ${testEmail}`);
    }
    console.log('[SignupTest] PASS: Duplicate email rejected with HTTP 400.');

    // D: Invalid Input Rejection
    console.log('[SignupTest] D. Testing invalid input validation...');
    
    // Missing name
    const { req: rName, res: resName } = createMockReqRes({ email: 'noname@example.invalid', password: 'Password123!' });
    await signupUser(rName, resName);
    if (resName.statusCode !== 400) throw new Error('Missing name validation failed');

    // Invalid email
    const { req: rEmail, res: resEmail } = createMockReqRes({ name: 'Test', email: 'invalid-email-format', password: 'Password123!' });
    await signupUser(rEmail, resEmail);
    if (resEmail.statusCode !== 400) throw new Error('Invalid email format validation failed');

    // Short password
    const { req: rPass, res: resPass } = createMockReqRes({ name: 'Test', email: 'valid@example.invalid', password: '123' });
    await signupUser(rPass, resPass);
    if (resPass.statusCode !== 400) throw new Error('Short password validation failed');

    console.log('[SignupTest] PASS: Input validation correctly rejects missing/malformed fields with HTTP 400.');

    // E: Admin Role Injection Protection Test
    console.log('[SignupTest] E. Testing admin role injection protection...');
    const adminInjectEmail = `admin-inject-${Date.now()}@example.invalid`;
    const { req: reqAdmin, res: resAdmin } = createMockReqRes({
      name: 'Hacker User',
      email: adminInjectEmail,
      password: 'HackerPassword123!',
      role: 'admin' // Attempt injection
    });

    await signupUser(reqAdmin, resAdmin);
    if (resAdmin.statusCode !== 201) throw new Error('Role injection test signup failed');

    const adminUserId = resAdmin.body.user.id;
    createdUserIds.push(adminUserId);

    const savedAdminAttempt = await User.findById(adminUserId);
    if (savedAdminAttempt.role === 'admin' || resAdmin.body.user.role === 'admin') {
      throw new Error('SECURITY FAILURE: Public signup allowed client to register as admin!');
    }

    if (savedAdminAttempt.role !== 'student') {
      throw new Error(`Role assignment failed: Expected 'student', got '${savedAdminAttempt.role}'`);
    }
    console.log('[SignupTest] PASS: Public signup strictly enforces default student role and blocks admin injection.');

    // G: Cleanup
    console.log('[SignupTest] G. Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
      await LearnerProfile.deleteOne({ userId: id });
      await Roadmap.deleteOne({ userId: id });
    }

    const postCleanupCount = await User.countDocuments({
      _id: { $in: createdUserIds }
    });

    if (postCleanupCount !== 0) {
      throw new Error('Cleanup failed: Temporary test user documents remain in Atlas');
    }
    console.log('[SignupTest] PASS: All temporary test data removed from MongoDB Atlas.');
    console.log('[SignupTest] === SIGNUP FUNCTIONALITY VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[SignupTest] VERIFICATION FAILED: ${error.message}`);
    // Emergency cleanup
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
      await LearnerProfile.deleteOne({ userId: id }).catch(() => {});
      await Roadmap.deleteOne({ userId: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runSignupVerification();
