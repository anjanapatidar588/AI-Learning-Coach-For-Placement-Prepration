import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Roadmap from '../src/models/Roadmap.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getRoadmap } from '../src/controllers/studentController.js';
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

const runRoadmapVerification = async () => {
  console.log('[RoadmapTest] Starting Phase 3 Step 8 Backend Student Roadmap API Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[RoadmapTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1 (no roadmap)
    const student1 = await User.create({
      name: 'Roadmap Test 1',
      email: `roadmap-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (with roadmap)
    const student2 = await User.create({
      name: 'Roadmap Test 2',
      email: `roadmap-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    const roadmap2 = await Roadmap.create({
      userId: student2._id,
      nodes: [{ nodeId: 'test-node-1', status: 'locked' }]
    });

    // Create Admin
    const adminUser = await User.create({
      name: 'Roadmap Admin',
      email: `roadmap-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    console.log('[RoadmapTest] Created test accounts.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // A. GET without token
    console.log('[RoadmapTest] A. Testing GET without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(getRoadmap, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for GET without token, got ${rs.statusCode}`);
    console.log('[RoadmapTest] PASS: GET without token returns 401.');

    // B & C. GET with invalid/tampered JWT
    console.log('[RoadmapTest] B/C. Testing invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(getRoadmap, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[RoadmapTest] PASS: Invalid/Tampered JWT returns 401.');

    // K. Student with no roadmap receives safe empty response
    console.log('[RoadmapTest] K. Testing empty roadmap handling (Student 1)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(getRoadmap, r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200, got ${rs.statusCode}`);
    if (rs.body.data !== null) throw new Error(`Expected null data for missing roadmap, got ${JSON.stringify(rs.body.data)}`);
    console.log('[RoadmapTest] PASS: Endpoint functions correctly when student has no roadmap.');

    // M. GET request does not create or modify roadmap records
    console.log('[RoadmapTest] M. Verifying GET request does not create records...');
    const fakeRoadmaps = await Roadmap.countDocuments({ userId: student1._id });
    if (fakeRoadmaps !== 0) throw new Error('Endpoint incorrectly created a fake roadmap for a student without one');
    console.log('[RoadmapTest] PASS: No fake dashboard records permanently created.');

    // D, E, F, G, L. Valid student token, safe fields, JWT identity, returning correct roadmap
    console.log('[RoadmapTest] D/E/F/G/L. Testing response safety and identity (Student 2)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token2}` }));
    await simulateRoute(getRoadmap, r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    const data = rs.body.data;
    if (!data || data.userId.toString() !== student2._id.toString()) throw new Error('Failed to retrieve existing roadmap for authenticated user or identity mismatch');
    
    // Check for secrets
    if (data.password || data.passwordHash || data.GEMINI_API_KEY) throw new Error('SECURITY FAILURE: Roadmap contains sensitive fields');
    if (rs.body.password || rs.body.MONGODB_URI) throw new Error('SECURITY FAILURE: Secrets exposed');
    console.log('[RoadmapTest] PASS: Safe response and correct identity from JWT. Existing roadmap retrieved successfully.');

    // J. Admin access behavior (matches existing student-route policy -> 403)
    console.log('[RoadmapTest] J. Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(getRoadmap, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[RoadmapTest] PASS: Admin attempting student roadmap route rejected with 403.');

    // H, I. Identity Injection and Data Scoping (Accessing another student's roadmap)
    console.log('[RoadmapTest] H/I. Testing identity injection and data scoping...');
    // Attempting to access student2's roadmap while logged in as student1
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() }, // body
      { userId: student2._id.toString() }, // query
      { userId: student2._id.toString() }  // params
    ));
    await simulateRoute(getRoadmap, r, rs);
    const injectedData = rs.body.data;
    if (injectedData !== null) throw new Error('SECURITY FAILURE: Student 1 retrieved Student 2 roadmap via injection!');
    console.log('[RoadmapTest] PASS: userId injection ignored, data strictly scoped to authenticated user.');

    // N. Cleanup
    console.log('[RoadmapTest] N. Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
      await Roadmap.deleteOne({ userId: id });
    }
    
    console.log('[RoadmapTest] PASS: All temporary test users/roadmaps deleted from MongoDB Atlas.');
    console.log('[RoadmapTest] === BACKEND STUDENT ROADMAP API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[RoadmapTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
      await Roadmap.deleteOne({ userId: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runRoadmapVerification();
