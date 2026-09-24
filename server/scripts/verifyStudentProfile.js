import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getStudentProfile, updateStudentProfile } from '../src/controllers/studentController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

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

const runMiddleware = (middleware, req, res) => {
  return new Promise((resolve) => {
    middleware(req, res, () => resolve(true));
    setTimeout(() => resolve(false), 10);
  });
};

const runProfileVerification = async () => {
  console.log('[ProfileTest] Starting Phase 3 Step 6 Backend Student Profile Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[ProfileTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student user 1
    const student1 = await User.create({
      name: 'Student Profile Test 1',
      email: `student-profile-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student user 2
    const student2 = await User.create({
      name: 'Student Profile Test 2',
      email: `student-profile-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Profile Test',
      email: `admin-profile-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    console.log('[ProfileTest] Created test accounts.');

    const authStudent = authorize('student');

    // Helper to simulate full route processing
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A. GET without token
    console.log('[ProfileTest] A. Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getStudentProfile, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[ProfileTest] PASS: GET without token returns 401.');

    // B. PUT without token
    console.log('[ProfileTest] B. Testing PUT without token...');
    ({ req: r, res: rs } = createMockReqRes({}, { targetRoles: ['Dev'] }));
    await simulateRoute(updateStudentProfile, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for PUT without token, got ${rs.statusCode}`);
    console.log('[ProfileTest] PASS: PUT without token returns 401.');

    // C. GET with invalid JWT
    console.log('[ProfileTest] C. Testing GET with invalid JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid' }));
    await simulateRoute(getStudentProfile, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[ProfileTest] PASS: GET with invalid JWT returns 401.');

    // D. Valid student GET
    console.log('[ProfileTest] D. Testing valid student GET...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getStudentProfile, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success || !rs.body.data) {
      throw new Error(`Expected 200 success for GET, got ${rs.statusCode}`);
    }
    const profileId = rs.body.data._id;
    console.log('[ProfileTest] PASS: Valid student GET returns 200 and profile.');

    // E, J, K. Valid student PUT, protected fields, unexpected fields
    console.log('[ProfileTest] E, J, K. Testing valid student PUT with protected and unexpected fields...');
    const testDate = new Date();
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, {
      currentSkillLevel: 'Advanced',
      targetRoles: ['SDE-2'],
      targetDate: testDate.toISOString(),
      dsaMastery: 100, // Should be ignored
      userId: student2._id.toString(), // Should be ignored
      hackedField: true // Should be ignored
    }));
    await simulateRoute(updateStudentProfile, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) {
      throw new Error(`Expected 200 success for PUT, got ${rs.statusCode} - ${JSON.stringify(rs.body)}`);
    }
    console.log('[ProfileTest] PASS: Valid student PUT returns 200.');

    // F. Updated values persist in MongoDB
    console.log('[ProfileTest] F. Testing MongoDB persistence...');
    const dbProfile = await LearnerProfile.findOne({ userId: student1._id });
    if (dbProfile.currentSkillLevel !== 'Advanced') throw new Error('currentSkillLevel did not persist');
    if (dbProfile.targetRoles[0] !== 'SDE-2') throw new Error('targetRoles did not persist');
    if (dbProfile.dsaMastery === 100) throw new Error('SECURITY FAILURE: Protected field dsaMastery was overwritten!');
    if (dbProfile.userId.toString() !== student1._id.toString()) throw new Error('SECURITY FAILURE: userId was overwritten!');
    if (dbProfile.hackedField) throw new Error('SECURITY FAILURE: Unexpected field persisted!');
    console.log('[ProfileTest] PASS: Allowed fields persisted, protected/unexpected fields blocked.');

    // G. GET after PUT returns the updated values
    console.log('[ProfileTest] G. Testing GET after PUT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getStudentProfile, r, rs);
    if (rs.body.data.currentSkillLevel !== 'Advanced') throw new Error('GET after PUT did not return updated data');
    console.log('[ProfileTest] PASS: GET after PUT returns the updated values.');

    // H, I, M. Provide another user's userId/profileId
    console.log('[ProfileTest] H, I, M. Testing ownership enforcement (injection attempt)...');
    const profile2 = await LearnerProfile.create({ userId: student2._id }); // Make sure student 2 has a profile
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString(), _id: profile2._id.toString() },
      { userId: student2._id.toString(), profileId: profile2._id.toString() }
    ));
    await simulateRoute(getStudentProfile, r, rs);
    if (rs.body.data.userId.toString() !== student1._id.toString()) {
      throw new Error('SECURITY FAILURE: Student accessed another student profile!');
    }
    console.log('[ProfileTest] PASS: Attempts to inject another userId/profileId are completely ignored.');

    // L. Invalid profile data validation
    console.log('[ProfileTest] L. Testing invalid profile data validation...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { currentSkillLevel: 'Hacker' }));
    await simulateRoute(updateStudentProfile, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for invalid enum, got ${rs.statusCode}`);
    
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }, { targetRoles: 'NotAnArray' }));
    await simulateRoute(updateStudentProfile, r, rs);
    if (rs.statusCode !== 400) throw new Error(`Expected 400 for invalid array, got ${rs.statusCode}`);
    console.log('[ProfileTest] PASS: Invalid data correctly rejected with HTTP 400.');

    // N. Admin behavior
    console.log('[ProfileTest] N. Testing Admin behavior on student routes...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getStudentProfile, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin on student route, got ${rs.statusCode}`);
    console.log('[ProfileTest] PASS: Admin attempting student profile route rejected with 403.');

    // 7. Database Relationship
    console.log('[ProfileTest] 7. Testing Database Relationship...');
    const profiles = await LearnerProfile.find({ userId: student1._id });
    if (profiles.length > 1) throw new Error('Duplicate profiles created for one user');
    if (profiles[0].userId.toString() !== student1._id.toString()) throw new Error('Profile does not belong to user');
    console.log('[ProfileTest] PASS: Database relationships remain correct, no duplicates.');

    // Cleanup
    console.log('[ProfileTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
      await LearnerProfile.deleteOne({ userId: id });
    }
    
    console.log('[ProfileTest] PASS: All temporary test users deleted from MongoDB Atlas.');
    console.log('[ProfileTest] === BACKEND STUDENT PROFILE API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[ProfileTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
      await LearnerProfile.deleteOne({ userId: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runProfileVerification();
