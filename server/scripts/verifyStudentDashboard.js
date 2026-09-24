import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import Roadmap from '../src/models/Roadmap.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getStudentDashboard } from '../src/controllers/studentController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

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

const runDashboardVerification = async () => {
  console.log('[DashboardTest] Starting Phase 3 Step 7 Backend Student Dashboard API Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[DashboardTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1
    const student1 = await User.create({
      name: 'Dashboard Test 1',
      email: `dashboard-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (with data to test scoping)
    const student2 = await User.create({
      name: 'Dashboard Test 2',
      email: `dashboard-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    // Create Admin
    const adminUser = await User.create({
      name: 'Dashboard Admin',
      email: `dashboard-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    console.log('[DashboardTest] Created test accounts.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A. GET without token
    console.log('[DashboardTest] A. Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getStudentDashboard, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[DashboardTest] PASS: GET without token returns 401.');

    // B & C. GET with invalid/tampered JWT
    console.log('[DashboardTest] B/C. Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getStudentDashboard, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[DashboardTest] PASS: Invalid JWT returns 401.');

    // K. Dashboard works when optional data is missing (student1 has no data)
    console.log('[DashboardTest] K. Testing empty data handling...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getStudentDashboard, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    // Check missing fields are null/empty appropriately
    const data = rs.body.data;
    if (data.roadmapPreview !== null) throw new Error('Roadmap preview should be null if absent');
    if (data.dailyGoal !== null) throw new Error('Daily goal should be null if absent');
    if (data.recentActivity.length !== 0) throw new Error('Recent activity should be empty if absent');
    console.log('[DashboardTest] PASS: Endpoint functions correctly when optional data is missing.');

    // D, E, F, G. Valid student token, safe fields, JWT identity
    console.log('[DashboardTest] D/E/F/G. Testing response safety and identity...');
    if (data.profile.password || data.profile.passwordHash) throw new Error('SECURITY FAILURE: Profile contains sensitive fields');
    if (data.profile.userId.toString() !== student1._id.toString()) throw new Error('Identity mismatch');
    console.log('[DashboardTest] PASS: Safe response and correct identity from JWT.');

    // Setup some data for student 2
    await Roadmap.create({
      userId: student2._id,
      nodes: [{ nodeId: 'test-node-1', priorityScore: 5 }]
    });
    
    // J. Admin access behavior (matches existing student-route policy -> 403)
    console.log('[DashboardTest] J. Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getStudentDashboard, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[DashboardTest] PASS: Admin attempting student dashboard route rejected with 403.');

    // H, I, L. Identity Injection and Data Scoping
    console.log('[DashboardTest] H/I/L. Testing identity injection and data scoping...');
    // Attempting to access student2's data while logged in as student1
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() },
      { userId: student2._id.toString() }
    ));
    await simulateRoute(getStudentDashboard, r, rs);
    const injectedData = rs.body.data;
    if (injectedData.roadmapPreview !== null) throw new Error('SECURITY FAILURE: Student 1 retrieved Student 2 roadmap via injection!');
    if (injectedData.profile.userId.toString() !== student1._id.toString()) throw new Error('SECURITY FAILURE: Identity injection successful!');
    console.log('[DashboardTest] PASS: userId injection ignored, data strictly scoped to authenticated user.');

    // L part 2: Verify student2 gets their own data
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getStudentDashboard, r, rs);
    const student2Data = rs.body.data;
    if (student2Data.roadmapPreview === null || student2Data.roadmapPreview.length !== 1) {
      throw new Error('Failed to retrieve existing roadmap for authenticated user');
    }
    console.log('[DashboardTest] PASS: Scoped dashboard data correctly retrieved.');

    // M. No fake records permanently created
    console.log('[DashboardTest] M. Verifying no fake records created...');
    const fakeRoadmaps = await Roadmap.countDocuments({ userId: student1._id });
    if (fakeRoadmaps !== 0) throw new Error('Endpoint incorrectly created a fake roadmap for a student without one');
    console.log('[DashboardTest] PASS: No fake dashboard records permanently created.');

    // Cleanup
    console.log('[DashboardTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
      await LearnerProfile.deleteOne({ userId: id });
      await Roadmap.deleteOne({ userId: id });
      await AttemptTrack.deleteMany({ userId: id });
    }
    
    console.log('[DashboardTest] PASS: All temporary test users deleted from MongoDB Atlas.');
    console.log('[DashboardTest] === BACKEND STUDENT DASHBOARD API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[DashboardTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
      await LearnerProfile.deleteOne({ userId: id }).catch(() => {});
      await Roadmap.deleteOne({ userId: id }).catch(() => {});
      await AttemptTrack.deleteMany({ userId: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runDashboardVerification();
