import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Roadmap from '../src/models/Roadmap.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { recalculateRoadmap } from '../src/controllers/studentController.js';
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

const runRoadmapRecalculateVerification = async () => {
  console.log('[RecalculateTest] Starting Phase 3 Step 9 Backend Student Roadmap Recalculate API Verification...');
  const createdUserIds = [];

  try {
    await connectDB();
    console.log('[RecalculateTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create student 1 (no roadmap initially)
    const student1 = await User.create({
      name: 'Recalc Test 1',
      email: `recalc-test-1-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student1._id);
    const token1 = generateToken({ id: student1._id, role: student1.role });

    // Create student 2 (with existing roadmap)
    const student2 = await User.create({
      name: 'Recalc Test 2',
      email: `recalc-test-2-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(student2._id);
    const token2 = generateToken({ id: student2._id, role: student2.role });

    await Roadmap.create({
      userId: student2._id,
      nodes: [{ nodeId: 'test-node-1', status: 'locked' }],
      version: 1
    });

    // Create Admin
    const adminUser = await User.create({
      name: 'Recalc Admin',
      email: `recalc-admin-${Date.now()}@example.invalid`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    console.log('[RecalculateTest] Created test accounts.');

    const authStudent = authorize('student');
    const simulateRoute = async (controller, req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await controller(req, res);
    };

    // B. GET without token
    console.log('[RecalculateTest] B. Testing POST without token...');
    let { req: r, res: rs } = createMockReqRes();
    await simulateRoute(recalculateRoadmap, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for POST without token, got ${rs.statusCode}`);
    console.log('[RecalculateTest] PASS: POST without token returns 401.');

    // C. GET with invalid/tampered JWT
    console.log('[RecalculateTest] C. Testing POST with invalid/tampered JWT...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }));
    await simulateRoute(recalculateRoadmap, r, rs);
    if (rs.statusCode !== 401) throw new Error(`Expected 401 for invalid JWT, got ${rs.statusCode}`);
    console.log('[RecalculateTest] PASS: Invalid/Tampered JWT returns 401.');

    // D. Admin access behavior
    console.log('[RecalculateTest] D. Testing Admin access...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }));
    await simulateRoute(recalculateRoadmap, r, rs);
    if (rs.statusCode !== 403) throw new Error(`Expected 403 for Admin, got ${rs.statusCode}`);
    console.log('[RecalculateTest] PASS: Admin attempting student route rejected with 403.');

    // A. Valid student with token -> successful recalculation (creates new roadmap if missing)
    console.log('[RecalculateTest] A. Testing valid student token (Student 1, no initial roadmap)...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(recalculateRoadmap, r, rs);
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error(`Expected 200, got ${rs.statusCode}`);
    
    const data1 = rs.body.data;
    if (!data1 || data1.version !== 1) throw new Error(`Expected new roadmap with version 1, got ${JSON.stringify(data1)}`);
    console.log('[RecalculateTest] PASS: Endpoint creates and recalculates roadmap correctly for new student.');

    // H. Repeated recalculation does not create duplicate roadmap documents
    console.log('[RecalculateTest] H. Testing repeated recalculation...');
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${token1}` }));
    await simulateRoute(recalculateRoadmap, r, rs);
    if (rs.statusCode !== 200) throw new Error(`Expected 200 on repeat, got ${rs.statusCode}`);
    
    const count1 = await Roadmap.countDocuments({ userId: student1._id });
    if (count1 !== 1) throw new Error(`Expected 1 roadmap, found ${count1}`);
    if (rs.body.data.version !== 2) throw new Error(`Expected roadmap version 2, got ${rs.body.data.version}`);
    console.log('[RecalculateTest] PASS: Repeated recalculation updates version and does NOT create duplicates.');

    // E, F, G, I. Identity Injection and Data Scoping (Accessing another student's roadmap)
    console.log('[RecalculateTest] E/F/G/I. Testing identity injection and data scoping (Student 2)...');
    
    const beforeVersion = (await Roadmap.findOne({ userId: student2._id })).version;

    // Attempting to inject student2's roadmap while logged in as student1
    ({ req: r, res: rs } = createMockReqRes(
      { authorization: `Bearer ${token1}`, 'x-user-id': student2._id.toString() },
      { userId: student2._id.toString() }, // body
      { userId: student2._id.toString() }, // query
      { userId: student2._id.toString() }  // params
    ));
    await simulateRoute(recalculateRoadmap, r, rs);
    
    const injectedData = rs.body.data;
    if (injectedData.userId.toString() !== student1._id.toString()) throw new Error('SECURITY FAILURE: Identity injection succeeded!');
    
    const afterVersion = (await Roadmap.findOne({ userId: student2._id })).version;
    if (beforeVersion !== afterVersion) throw new Error('SECURITY FAILURE: Student 1 altered Student 2 roadmap via injection!');
    
    console.log('[RecalculateTest] PASS: userId injection via body/query/headers is ignored, data strictly scoped to authenticated user.');

    // J. Atlas persistence verification
    console.log('[RecalculateTest] J. Atlas persistence verification...');
    const s1Roadmap = await Roadmap.findOne({ userId: student1._id });
    if (s1Roadmap.version !== 3) throw new Error('Atlas persistence failed, expected version 3');
    console.log('[RecalculateTest] PASS: Roadmap updates are successfully persisted to MongoDB Atlas.');

    // L. Cleanup
    console.log('[RecalculateTest] L. Cleaning up temporary test documents from Atlas...');
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id });
      await Roadmap.deleteOne({ userId: id });
    }
    
    console.log('[RecalculateTest] PASS: All temporary test users/roadmaps deleted from MongoDB Atlas.');
    console.log('[RecalculateTest] === BACKEND STUDENT ROADMAP RECALCULATE API VERIFICATION PASSED ===');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[RecalculateTest] VERIFICATION FAILED: ${error.message}`);
    for (const id of createdUserIds) {
      await User.deleteOne({ _id: id }).catch(() => {});
      await Roadmap.deleteOne({ userId: id }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runRoadmapRecalculateVerification();
