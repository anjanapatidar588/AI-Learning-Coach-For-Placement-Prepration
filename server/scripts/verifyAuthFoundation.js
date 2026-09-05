import dotenv from 'dotenv';
dotenv.config();

import { hashPassword, comparePassword } from '../src/utils/passwordUtil.js';
import { generateToken, verifyToken } from '../src/utils/jwtUtil.js';
import { protect } from '../src/middleware/authMiddleware.js';

const runAuthTests = async () => {
  console.log('[AuthTest] Starting Phase 3 Step 1 Authentication Foundation Verification...');

  // 1 & 2 & 3: Password Hashing & Comparison Test
  console.log('[AuthTest] 1. Testing password hashing and comparison...');
  const plainPassword = 'SuperSecretPass123!';
  const hashedPassword = await hashPassword(plainPassword);

  if (!hashedPassword || hashedPassword === plainPassword) {
    throw new Error('Password hashing failed: Result is invalid or plain text');
  }

  const isMatchCorrect = await comparePassword(plainPassword, hashedPassword);
  if (!isMatchCorrect) {
    throw new Error('Password comparison failed for correct password');
  }

  const isMatchWrong = await comparePassword('WrongPassword123!', hashedPassword);
  if (isMatchWrong) {
    throw new Error('Password comparison failed: Incorrect password returned true match');
  }
  console.log('[AuthTest] PASS: Password hashing & comparison work cleanly.');

  // 4 & 5: JWT Generation & Verification Test
  console.log('[AuthTest] 2. Testing JWT token generation and verification...');
  const testPayload = { id: '650000000000000000000099', role: 'student' };
  const token = generateToken(testPayload, '1h');

  if (!token || typeof token !== 'string') {
    throw new Error('JWT generation failed');
  }

  const decoded = verifyToken(token);
  if (decoded.id !== testPayload.id || decoded.role !== testPayload.role) {
    throw new Error('JWT verification failed: Decoded payload does not match source');
  }
  console.log('[AuthTest] PASS: JWT generation and verification work cleanly.');

  // 6 & 7: Invalid / Expired Token Test
  console.log('[AuthTest] 3. Testing invalid & expired token rejection...');
  try {
    verifyToken('invalid.jwt.token.string');
    throw new Error('Failed to reject invalid token');
  } catch (err) {
    if (err.message.includes('Failed to reject')) throw err;
    console.log('[AuthTest] PASS: Invalid token rejected correctly.');
  }

  const expiredToken = generateToken(testPayload, '-1s');
  try {
    verifyToken(expiredToken);
    throw new Error('Failed to reject expired token');
  } catch (err) {
    if (err.message.includes('Failed to reject')) throw err;
    console.log('[AuthTest] PASS: Expired token rejected correctly.');
  }

  // 8 & 9 & 10: Authentication Middleware Request Context Test
  console.log('[AuthTest] 4. Testing protect middleware authentication context...');

  // Helper mock response object
  const createMockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  // Test missing header
  const reqMissing = { headers: {} };
  const resMissing = createMockRes();
  let nextCalled = false;
  protect(reqMissing, resMissing, () => { nextCalled = true; });

  if (nextCalled || resMissing.statusCode !== 401) {
    throw new Error('Middleware failed: Missing Authorization header was not rejected with HTTP 401');
  }

  // Test malformed header
  const reqMalformed = { headers: { authorization: 'Basic invalidtoken' } };
  const resMalformed = createMockRes();
  nextCalled = false;
  protect(reqMalformed, resMalformed, () => { nextCalled = true; });

  if (nextCalled || resMalformed.statusCode !== 401) {
    throw new Error('Middleware failed: Malformed Authorization header was not rejected with HTTP 401');
  }

  // Test valid Bearer token
  const reqValid = { headers: { authorization: `Bearer ${token}` } };
  const resValid = createMockRes();
  nextCalled = false;
  protect(reqValid, resValid, () => { nextCalled = true; });

  if (!nextCalled) {
    throw new Error('Middleware failed: Valid Bearer token was not passed to next()');
  }

  if (!reqValid.user || reqValid.user.userId !== testPayload.id || reqValid.user.role !== testPayload.role) {
    throw new Error('Middleware failed: req.user request context is missing or invalid');
  }

  console.log('[AuthTest] PASS: Middleware attaches clean req.user context ({ userId, role }).');
  console.log('[AuthTest] === AUTHENTICATION FOUNDATION TEST FULLY PASSED ===');
};

runAuthTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('[AuthTest] VERIFICATION FAILED:', err.message);
  process.exit(1);
});
