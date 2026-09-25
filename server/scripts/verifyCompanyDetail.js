import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import Topic from '../src/models/Topic.js';
import Question from '../src/models/Question.js';
import { hashPassword } from '../src/utils/passwordUtil.js';
import { generateToken } from '../src/utils/jwtUtil.js';
import { getCompanyDetail } from '../src/controllers/companyController.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, params = {}, query = {}) => {
  const req = { headers, params, query, body: {} };
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

const runVerification = async () => {
  console.log('[CompanyDetailTest] Starting Phase 3 Step 27 Backend Company Detail API Verification...');
  const createdIds = { users: [], companies: [], topics: [], questions: [] };

  try {
    await connectDB();
    console.log('[CompanyDetailTest] Connected to MongoDB Atlas.');

    const passwordHash = await hashPassword('TestPassword123!');

    // Create accounts
    const student1 = await User.create({ name: 'CD Student', email: `cd-student-${Date.now()}@example.invalid`, passwordHash, role: 'student' });
    const adminUser = await User.create({ name: 'CD Admin', email: `cd-admin-${Date.now()}@example.invalid`, passwordHash, role: 'admin' });
    createdIds.users.push(student1._id, adminUser._id);
    
    const studentToken = generateToken({ id: student1._id, role: student1.role });
    const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    const authStudent = authorize('student');
    const simulateRoute = async (req, res) => {
      const p = await runMiddleware(protect, req, res);
      if (!p) return;
      const a = await runMiddleware(authStudent, req, res);
      if (!a) return;
      await getCompanyDetail(req, res);
    };

    // Create test data
    console.log('[CompanyDetailTest] Creating test documents...');
    const compA = await Company.create({
      name: 'GoogleTestCompany',
      description: 'Search Giant',
      logoUrl: 'google.com/logo.png',
      cutoffBenchmark: 80,
      syllabus: ['DSA', 'System Design'],
      hiringRounds: [
        { roundName: 'Phone Screen', roundType: 'Algorithm', description: 'Basic DSA' }
      ]
    });
    const compB = await Company.create({
      name: 'AmazonTestCompany',
      cutoffBenchmark: 70
    });
    createdIds.companies.push(compA._id, compB._id);

    const testTopic = await Topic.create({
      title: 'Company Arrays',
      slug: `company-arrays-${Date.now()}`,
      description: 'Array problems',
      category: 'dsa',
      subject: 'Data Structures'
    });
    createdIds.topics.push(testTopic._id);

    const questionA = await Question.create({
      topicId: testTopic._id,
      title: 'Google Array Question',
      slug: `google-arr-${Date.now()}`,
      problemStatement: 'Find sum',
      type: 'coding',
      difficulty: 'Hard',
      companyTags: ['GoogleTestCompany'],
      solutionCode: { python: 'print(sum)' },
      solutionExplanation: 'Just sum it',
      testCases: [{ input: '1 2', expectedOutput: '3', isHidden: true }]
    });

    const questionB = await Question.create({
      topicId: testTopic._id,
      title: 'Google MCQ Question',
      slug: `google-mcq-${Date.now()}`,
      problemStatement: 'What is 1+1?',
      type: 'mcq',
      companyTags: ['GoogleTestCompany'],
      mcqOptions: [
        { optionId: '1', optionText: '2', isCorrect: true },
        { optionId: '2', optionText: '3', isCorrect: false }
      ]
    });

    const questionC = await Question.create({
      topicId: testTopic._id,
      title: 'Amazon Array Question',
      slug: `amazon-arr-${Date.now()}`,
      problemStatement: 'Reverse array',
      type: 'coding',
      difficulty: 'Easy',
      companyTags: ['AmazonTestCompany']
    });
    
    createdIds.questions.push(questionA._id, questionB._id, questionC._id);

    // A/B/C. Authentication
    console.log('[CompanyDetailTest] Testing Authentication & RBAC...');
    let { req: r, res: rs } = createMockReqRes({}, { companyId: compA._id.toString() });
    await simulateRoute(r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for missing token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: 'Bearer invalid.token' }, { companyId: compA._id.toString() }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 401) throw new Error('Expected 401 for invalid token');

    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${adminToken}` }, { companyId: compA._id.toString() }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 403) throw new Error('Expected 403 for Admin');
    console.log('[CompanyDetailTest] PASS: Auth/RBAC working correctly.');

    // F. Malformed ID
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, { companyId: 'not-an-object-id' }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 400) throw new Error('Expected 400 for malformed companyId');
    console.log('[CompanyDetailTest] PASS: Malformed companyId handled.');

    // G. Nonexistent ID
    const fakeId = new mongoose.Types.ObjectId().toString();
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, { companyId: fakeId }));
    await simulateRoute(r, rs);
    if (rs.statusCode !== 404) throw new Error('Expected 404 for nonexistent companyId');
    console.log('[CompanyDetailTest] PASS: Nonexistent companyId handled.');

    // D/E/H/I/J/K/L/M/N/O/P/Q/R. Valid Fetching
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, { companyId: compA._id.toString() }));
    await simulateRoute(r, rs);
    
    if (rs.statusCode !== 200 || !rs.body.success) throw new Error('Expected 200 success');
    const data = rs.body.data;
    
    if (!data.company || data.company._id.toString() !== compA._id.toString()) {
      throw new Error('Failed to return correct company details');
    }
    
    // Check fields
    if (data.company.name !== 'GoogleTestCompany' || data.company.cutoffBenchmark !== 80 || data.company.logoUrl !== 'google.com/logo.png') {
      throw new Error('Company fields not returned correctly');
    }
    if (!data.company.hiringRounds || data.company.hiringRounds.length === 0) throw new Error('Hiring rounds not returned correctly');
    if (!data.company.syllabus || data.company.syllabus.length === 0) throw new Error('Syllabus not returned correctly');
    
    if (data.company.__v !== undefined) throw new Error('Leaked internal __v field');

    if (!Array.isArray(data.questions)) throw new Error('Questions should be an array');
    
    const qIds = data.questions.map(q => q._id.toString());
    if (qIds.length !== 2 || !qIds.includes(questionA._id.toString()) || !qIds.includes(questionB._id.toString())) {
      throw new Error('Tagged questions not filtered correctly for requested company');
    }
    if (qIds.includes(questionC._id.toString())) {
      throw new Error('Unrelated company questions returned');
    }

    // Security Checks for questions
    const qA = data.questions.find(q => q._id.toString() === questionA._id.toString());
    if (qA.solutionCode) throw new Error('solutionCode exposed!');
    if (qA.solutionExplanation) throw new Error('solutionExplanation exposed!');
    if (qA.testCases) throw new Error('testCases exposed!');
    
    const qB = data.questions.find(q => q._id.toString() === questionB._id.toString());
    if (qB.mcqOptions && qB.mcqOptions.some(opt => opt.isCorrect !== undefined)) {
      throw new Error('MCQ isCorrect exposed!');
    }

    console.log('[CompanyDetailTest] PASS: Valid request, accurate fields, secure projection working.');

    // S. Query Injection Test
    ({ req: r, res: rs } = createMockReqRes({ authorization: `Bearer ${studentToken}` }, { companyId: { $ne: 'random' } }));
    await simulateRoute(r, rs);
    // Since req.params.companyId is validated as a hex string with regex, this will throw 400 or just not match the route in express.
    // In our manual route test it will hit our regex.
    if (rs.statusCode !== 400 && rs.statusCode !== 404) {
       throw new Error('Query injection not mitigated safely');
    }
    console.log('[CompanyDetailTest] PASS: Query injection handled safely.');

    console.log('[CompanyDetailTest] === BACKEND COMPANY DETAIL API VERIFICATION PASSED ===');
  } catch (error) {
    console.error(`[CompanyDetailTest] VERIFICATION FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    console.log('[CompanyDetailTest] Cleaning up temporary test documents from Atlas...');
    for (const id of createdIds.users) await User.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.companies) await Company.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.topics) await Topic.deleteOne({ _id: id }).catch(() => {});
    for (const id of createdIds.questions) await Question.deleteOne({ _id: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    console.log('[CompanyDetailTest] Cleanup complete.');
  }
};

runVerification();
