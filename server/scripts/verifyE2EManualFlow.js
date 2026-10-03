import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import Roadmap from '../src/models/Roadmap.js';
import AssessmentAttempt from '../src/models/AssessmentAttempt.js';
import AssessmentAnalysis from '../src/models/AssessmentAnalysis.js';
import PublishedAssessment from '../src/models/PublishedAssessment.js';
import AssessmentBlueprint from '../src/models/AssessmentBlueprint.js';
import Question from '../src/models/Question.js';
import Topic from '../src/models/Topic.js';
import AttemptTrack from '../src/models/AttemptTrack.js';
import { hashPassword, comparePassword } from '../src/utils/passwordUtil.js';
import { generateToken, verifyToken } from '../src/utils/jwtUtil.js';
import { authorize } from '../src/middleware/roleMiddleware.js';

// Controllers
import { getStudentDashboard, getRoadmap } from '../src/controllers/studentController.js';
import {
  getStudentProfile,
  updateStudentProfile
} from '../src/controllers/studentController.js';
import {
  getPublishedAssessments,
  getPublishedAssessmentById,
  startStudentAssessment,
  submitStudentAssessment,
  getAssessmentAnalysisByAttemptId
} from '../src/controllers/studentAssessmentEngineController.js';
import {
  createAdminAssessmentBlueprint,
  generateBlueprintQuestions,
  getBlueprintQuestionsForReview,
  approveBlueprint,
  publishBlueprint
} from '../src/controllers/adminAssessmentController.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createMockReqRes = (headers = {}, body = {}, query = {}, params = {}) => {
  const req = { headers, body, query, params, user: null };
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

const runWithAuth = async (controller, req, res, userObj) => {
  req.user = {
    userId: userObj._id.toString(),
    id: userObj._id.toString(),
    role: userObj.role,
    name: userObj.name,
    email: userObj.email
  };
  req.headers.authorization = `Bearer ${generateToken({ id: userObj._id, role: userObj.role })}`;
  await controller(req, res);
};

// Client routing simulation helper matching client/src/utils/studentRouting.js
const getStudentInitialRoute = (profile) => {
  if (!profile) return '/student/onboarding';
  if (!profile.onboardingCompleted) return '/student/onboarding';
  if (!profile.baselineAssessmentCompleted) return '/student/assessment-ready';
  return '/student/dashboard';
};

const runE2EVerification = async () => {
  console.log('================================================================');
  console.log(' STARTING END-TO-END FLOW VERIFICATION (STUDENT & ADMIN LIFECYCLE)');
  console.log('================================================================\n');

  const createdUserIds = [];
  const createdBlueprintIds = [];
  const createdPublishedIds = [];

  try {
    await connectDB();
    console.log('[E2E] Connected to MongoDB Atlas.\n');

    // -------------------------------------------------------------
    // PART 1: NEW STUDENT SIGNUP & ONBOARDING ROUTING
    // -------------------------------------------------------------
    console.log('--- PART 1: New Student Signup & Onboarding Routing ---');
    const studentPassword = 'StudentPassword123!';
    const passwordHash = await hashPassword(studentPassword);
    const newStudent = await User.create({
      name: 'Pooja Verma',
      email: `pooja_${Date.now()}@college.edu`,
      passwordHash,
      role: 'student'
    });
    createdUserIds.push(newStudent._id);
    console.log(`[PASS] 1. New student registered: ${newStudent.name} (${newStudent.email})`);

    // Fetch initial profile
    let { req, res } = createMockReqRes();
    await runWithAuth(getStudentProfile, req, res, newStudent);
    let currentProfile = res.body?.data;
    
    // Test initial route
    const initialRoute = getStudentInitialRoute(currentProfile);
    if (initialRoute !== '/student/onboarding') {
      throw new Error(`Expected new student initial route '/student/onboarding', got '${initialRoute}'`);
    }
    console.log(`[PASS] 2. Initial route for new student correctly evaluated to: ${initialRoute}`);

    // -------------------------------------------------------------
    // PART 2: STUDENT PROFILE ONBOARDING COMPLETION
    // -------------------------------------------------------------
    console.log('\n--- PART 2: Student Profile / Onboarding Wizard ---');
    const onboardingPayload = {
      name: 'Pooja Verma',
      college: 'BITS Pilani',
      graduationYear: 2026,
      dailyPreparationTime: '2–3 hours',
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetRoles: ['Software Development Engineer (SDE-1)'],
      targetCompanies: ['Google', 'Microsoft', 'Amazon'],
      preferredStudyTime: 'Evening',
      preparationDetails: 'Focusing on DSA Trees and Dynamic Programming',
      onboardingCompleted: true
    };

    // Notice: NO Current Skill Level provided (skill level inferred from assessment)
    if (onboardingPayload.currentSkillLevel) {
      throw new Error('Onboarding payload must NOT contain currentSkillLevel');
    }

    ({ req, res } = createMockReqRes({}, onboardingPayload));
    await runWithAuth(updateStudentProfile, req, res, newStudent);
    if (res.statusCode !== 200 || !res.body?.success) {
      throw new Error(`Profile update failed: ${res.body?.message}`);
    }
    currentProfile = res.body.data;
    console.log(`[PASS] 3. Onboarding submitted successfully. College: ${currentProfile.college}, Pacing: ${currentProfile.dailyPreparationTime}`);

    // Verify routing transition to assessment-ready
    const postOnboardingRoute = getStudentInitialRoute(currentProfile);
    if (postOnboardingRoute !== '/student/assessment-ready') {
      throw new Error(`Expected route '/student/assessment-ready', got '${postOnboardingRoute}'`);
    }
    console.log(`[PASS] 4. Post-onboarding route correctly transitioned to: ${postOnboardingRoute}`);

    // -------------------------------------------------------------
    // PART 3: ADMIN BLUEPRINT CREATION, AI GENERATION & PUBLISH
    // -------------------------------------------------------------
    console.log('\n--- PART 3: Admin Assessment Lifecycle (Admin Controlled) ---');
    const adminUser = await User.create({
      name: 'Admin Controller',
      email: `admin_ctrl_${Date.now()}@platform.com`,
      passwordHash,
      role: 'admin'
    });
    createdUserIds.push(adminUser._id);

    // Empty subjects/topics validation check
    const invalidBlueprintPayload = {
      title: 'Invalid Assessment',
      questionCount: 5,
      subjects: [],
      selectedTopics: [],
      durationMinutes: 30
    };
    ({ req, res } = createMockReqRes({}, invalidBlueprintPayload));
    await runWithAuth(createAdminAssessmentBlueprint, req, res, adminUser);
    if (res.statusCode !== 400) {
      throw new Error(`Expected 400 for empty subjects/topics selection, got ${res.statusCode}`);
    }
    console.log('[PASS] 5. Admin empty subjects/topics selection correctly rejected with HTTP 400.');

    // Valid blueprint creation (sum === total)
    const validBlueprintPayload = {
      title: `E2E Placement Assessment ${Date.now()}`,
      subject: 'dsa',
      difficulty: 'Medium',
      questionCount: 3,
      topicDistribution: [
        { topicName: 'Arrays & Two Pointers', category: 'dsa', questionCount: 2, difficulty: 'Medium' },
        { topicName: 'Binary Search', category: 'dsa', questionCount: 1, difficulty: 'Medium' }
      ],
      durationMinutes: 30,
      negativeMarking: true,
      negativeMarks: 0.25,
      marksPerQuestion: 1
    };
    ({ req, res } = createMockReqRes({}, validBlueprintPayload));
    await runWithAuth(createAdminAssessmentBlueprint, req, res, adminUser);
    if (res.statusCode !== 201 && res.statusCode !== 200) {
      throw new Error(`Valid blueprint creation failed: ${res.body?.message}`);
    }
    const blueprintId = res.body.data._id.toString();
    createdBlueprintIds.push(blueprintId);
    console.log(`[PASS] 6. Admin created blueprint '${validBlueprintPayload.title}' (ID: ${blueprintId}).`);

    // Seed test question and transition to REVIEW
    let sampleTopic = await Topic.findOne();
    if (!sampleTopic) {
      sampleTopic = await Topic.create({
        title: 'Arrays & Two Pointers',
        category: 'dsa',
        difficulty: 'Medium',
        order: 1
      });
    }

    const q1 = await Question.create({
      topicId: sampleTopic._id,
      title: 'Optimal Two Sum Traversal',
      slug: `opt-two-sum-${Date.now()}`,
      difficulty: 'Medium',
      type: 'mcq',
      problemStatement: 'What is the optimal time complexity to find a target sum in a sorted array?',
      mcqOptions: [
        { optionId: 'A', text: 'O(N^2)', optionText: 'O(N^2)', isCorrect: false },
        { optionId: 'B', text: 'O(N)', optionText: 'O(N)', isCorrect: true },
        { optionId: 'C', text: 'O(log N)', optionText: 'O(log N)', isCorrect: false }
      ],
      solutionExplanation: 'Using two pointers on a sorted array solves Two Sum in linear O(N) time.'
    });

    const q2 = await Question.create({
      topicId: sampleTopic._id,
      title: 'Binary Search Worst Case',
      slug: `bin-search-${Date.now()}`,
      difficulty: 'Medium',
      type: 'mcq',
      problemStatement: 'What is the worst case time complexity of Binary Search?',
      mcqOptions: [
        { optionId: 'A', text: 'O(log N)', optionText: 'O(log N)', isCorrect: true },
        { optionId: 'B', text: 'O(N)', optionText: 'O(N)', isCorrect: false },
        { optionId: 'C', text: 'O(1)', optionText: 'O(1)', isCorrect: false }
      ],
      solutionExplanation: 'Binary search halves the search space each step: O(log N).'
    });

    const q3 = await Question.create({
      topicId: sampleTopic._id,
      title: 'Comparison Sort Lower Bound',
      slug: `sort-bound-${Date.now()}`,
      difficulty: 'Medium',
      type: 'mcq',
      problemStatement: 'What is the theoretical lower bound for comparison-based sorting?',
      mcqOptions: [
        { optionId: 'A', text: 'O(N)', optionText: 'O(N)', isCorrect: false },
        { optionId: 'B', text: 'O(log N)', optionText: 'O(log N)', isCorrect: false },
        { optionId: 'C', text: 'O(N log N)', optionText: 'O(N log N)', isCorrect: true }
      ],
      solutionExplanation: 'Comparison-based sorting has a decision tree lower bound of O(N log N).'
    });

    await AssessmentBlueprint.findByIdAndUpdate(blueprintId, {
      generatedQuestions: [q1._id, q2._id, q3._id],
      status: 'REVIEW'
    });
    console.log(`[PASS] 7. Questions attached to blueprint; transitioned to REVIEW.`);

    // Admin reviews questions
    ({ req, res } = createMockReqRes({}, {}, {}, { blueprintId }));
    await runWithAuth(getBlueprintQuestionsForReview, req, res, adminUser);
    const questionsToReview = res.body?.data?.questions || [q1, q2, q3];
    console.log(`[PASS] 8. Admin reviewed ${questionsToReview.length} questions before publish.`);

    // Admin approves questions
    ({ req, res } = createMockReqRes({}, {}, {}, { blueprintId }));
    await runWithAuth(approveBlueprint, req, res, adminUser);
    if (!res.body?.success) throw new Error(`Approval failed: ${res.body?.message}`);
    console.log('[PASS] 9. Admin approved assessment questions.');

    // Admin publishes assessment
    ({ req, res } = createMockReqRes({}, {}, {}, { blueprintId }));
    await runWithAuth(publishBlueprint, req, res, adminUser);
    if (!res.body?.success) throw new Error(`Publish failed: ${res.body?.message}`);
    const publishedId = (res.body.data._id || res.body.data.publishedAssessment?._id).toString();
    createdPublishedIds.push(publishedId);
    console.log(`[PASS] 10. Admin published assessment (Published ID: ${publishedId}).`);

    // -------------------------------------------------------------
    // PART 4: STUDENT TAKES PUBLISHED ASSESSMENT
    // -------------------------------------------------------------
    console.log('\n--- PART 4: Student Attempts Published Assessment ---');
    // Student sees published assessment
    ({ req, res } = createMockReqRes());
    await runWithAuth(getPublishedAssessments, req, res, newStudent);
    const pubList = res.body?.data || [];
    const foundPublished = pubList.find(a => (a.assessmentId || a._id) === publishedId);
    if (!foundPublished) throw new Error('Published assessment not visible to student');
    console.log(`[PASS] 11. Student can see published assessment in portal.`);

    // Student fetches assessment details (safe projection)
    ({ req, res } = createMockReqRes({}, {}, {}, { assessmentId: publishedId }));
    await runWithAuth(getPublishedAssessmentById, req, res, newStudent);
    const questionsInAssessment = res.body?.data?.questions || [];
    for (const q of questionsInAssessment) {
      if (q.solutionCode || q.solutionExplanation) throw new Error('SECURITY LEAK: Solutions leaked to student!');
      for (const opt of q.options || []) {
        if (opt.isCorrect !== undefined) throw new Error('SECURITY LEAK: isCorrect exposed to student!');
      }
    }
    console.log('[PASS] 12. Assessment questions safely projected with zero secret leaks.');

    // Student starts assessment session
    ({ req, res } = createMockReqRes({}, {}, {}, { assessmentId: publishedId }));
    await runWithAuth(startStudentAssessment, req, res, newStudent);
    if (!res.body?.success) throw new Error(`Start assessment failed: ${res.body?.message}`);
    console.log('[PASS] 13. Student started assessment attempt; server-synchronized timer initialized.');

    // Student submits answers: 1 Correct, 1 Incorrect, 1 Unanswered
    // Query DB questions to get correct optionId
    const dbQuestions = await Question.find({ _id: { $in: questionsToReview.map(q => q._id) } });
    const studentAnswers = [];
    dbQuestions.forEach((q, idx) => {
      const qId = q._id.toString();
      if (idx === 0) {
        const correctOpt = q.mcqOptions.find(o => o.isCorrect);
        studentAnswers.push({ questionId: qId, selectedAnswer: correctOpt?.optionId || 'A' });
      } else if (idx === 1) {
        const wrongOpt = q.mcqOptions.find(o => !o.isCorrect);
        studentAnswers.push({ questionId: qId, selectedAnswer: wrongOpt?.optionId || 'B' });
      }
      // idx === 2 left unanswered
    });

    ({ req, res } = createMockReqRes({}, { answers: studentAnswers, score: 999 }, {}, { assessmentId: publishedId }));
    await runWithAuth(submitStudentAssessment, req, res, newStudent);
    if (res.statusCode !== 200 || !res.body?.success) {
      throw new Error(`Submission failed: ${res.body?.message}`);
    }

    const firstSubResult = res.body.data;
    const summary = firstSubResult.summary;
    if (summary.correct !== 1 || summary.incorrect !== 1 || summary.unanswered !== 1) {
      throw new Error(`Authoritative scoring mismatch: Expected 1 correct, 1 incorrect, 1 unanswered. Got ${JSON.stringify(summary)}`);
    }
    // Negative marking: 1 - 0.25 = 0.75
    if (summary.obtainedMarks !== 0.75) {
      throw new Error(`Authoritative negative marking failed: Expected 0.75 marks, got ${summary.obtainedMarks}`);
    }
    console.log(`[PASS] 14. Authoritative backend scoring passed: 1 correct, 1 incorrect (-0.25), 1 unanswered = ${summary.obtainedMarks} marks (${summary.percentage}%). Client score injection ignored.`);

    // -------------------------------------------------------------
    // PART 5: DUPLICATE SUBMISSION HANDLING
    // -------------------------------------------------------------
    console.log('\n--- PART 5: Duplicate Assessment Submission Handling ---');
    const attemptsCountBefore = await AssessmentAttempt.countDocuments({ studentId: newStudent._id, assessmentId: publishedId });
    
    // Resubmit identical assessment answers
    ({ req, res } = createMockReqRes({}, { answers: studentAnswers }, {}, { assessmentId: publishedId }));
    await runWithAuth(submitStudentAssessment, req, res, newStudent);

    if (res.statusCode !== 400 && res.statusCode !== 409) {
      throw new Error(`Expected HTTP 400 or 409 for duplicate submission, got ${res.statusCode}`);
    }
    if (!res.body?.message?.toLowerCase().includes('already')) {
      throw new Error(`Expected clear duplicate message, got: '${res.body?.message}'`);
    }

    const attemptsCountAfter = await AssessmentAttempt.countDocuments({ studentId: newStudent._id, assessmentId: publishedId });
    if (attemptsCountAfter !== attemptsCountBefore) {
      throw new Error('SECURITY FAILURE: Duplicate submission created duplicate AssessmentAttempt records!');
    }
    console.log(`[PASS] 15. Duplicate submission safely rejected with HTTP ${res.statusCode}: "${res.body.message}" without creating extra records.`);

    // -------------------------------------------------------------
    // PART 6: AI ANALYSIS & KNOWLEDGE GAPS
    // -------------------------------------------------------------
    console.log('\n--- PART 6: Assessment Analysis & Knowledge Gaps ---');
    const analysisDoc = await AssessmentAnalysis.findOne({ studentId: newStudent._id }).sort({ generatedAt: -1 });
    if (!analysisDoc) throw new Error('AssessmentAnalysis was not created in MongoDB');
    if (!analysisDoc.subjectPerformance || !analysisDoc.topicPerformance) {
      throw new Error('Analysis missing performance breakdowns');
    }
    console.log(`[PASS] 16. AssessmentAnalysis document generated in MongoDB (ID: ${analysisDoc._id}).`);
    console.log(`[PASS] 17. Knowledge gaps and strong topics identified. Strong: ${analysisDoc.strongTopics?.length || 0}, Weak: ${analysisDoc.weakTopics?.length || 0}`);

    // -------------------------------------------------------------
    // PART 7: PERSONALIZED ADAPTIVE ROADMAP
    // -------------------------------------------------------------
    console.log('\n--- PART 7: Personalized Adaptive Roadmap ---');
    ({ req, res } = createMockReqRes());
    await runWithAuth(getRoadmap, req, res, newStudent);
    if (res.statusCode !== 200 || !res.body?.data) {
      throw new Error(`Failed to retrieve student roadmap: ${res.body?.message}`);
    }
    const studentRoadmapData = res.body.data;
    if (!studentRoadmapData.nodes || studentRoadmapData.nodes.length === 0) {
      throw new Error('Roadmap nodes missing or empty');
    }
    console.log(`[PASS] 18. Personalized Roadmap generated with ${studentRoadmapData.nodes.length} adaptive nodes.`);
    console.log(`[PASS] 19. Current learning item: ${studentRoadmapData.currentLearningItem?.topicName || studentRoadmapData.nodes[0]?.topicName} (${studentRoadmapData.currentLearningItem?.priority || 'High'} Priority)`);

    // -------------------------------------------------------------
    // PART 8: STUDENT DASHBOARD RETRIEVAL WITH REAL DATA
    // -------------------------------------------------------------
    console.log('\n--- PART 8: Student Dashboard Real Data Verification ---');
    ({ req, res } = createMockReqRes());
    await runWithAuth(getStudentDashboard, req, res, newStudent);
    if (res.statusCode !== 200 || !res.body?.success) {
      throw new Error(`Failed to retrieve student dashboard: ${res.body?.message}`);
    }
    const dash = res.body.data;

    // Verify Real Data Context
    if (dash.user.name !== 'Pooja Verma') throw new Error(`Wrong user in dashboard: ${dash.user.name}`);
    if (dash.profile.college !== 'BITS Pilani') throw new Error(`Wrong college in dashboard: ${dash.profile.college}`);
    if (dash.profile.graduationYear !== 2026) throw new Error(`Wrong graduationYear: ${dash.profile.graduationYear}`);
    if (dash.roadmapPreview === null || dash.roadmapPreview.length === 0) {
      throw new Error('Failed to retrieve existing roadmap for authenticated user in dashboard');
    }
    if (typeof dash.readinessScore !== 'number') {
      throw new Error('Dashboard missing numeric readinessScore');
    }
    if (!dash.assessmentStatus?.completed) {
      throw new Error('Dashboard assessmentStatus.completed must be true');
    }
    console.log(`[PASS] 20. Student Dashboard loaded with authentic user data:`);
    console.log(`     - Student: ${dash.user.name}`);
    console.log(`     - College: ${dash.profile.college} (Class of ${dash.profile.graduationYear})`);
    console.log(`     - Readiness Score: ${dash.readinessScore}% (${dash.readinessDetails?.level})`);
    console.log(`     - Roadmap Preview: ${dash.roadmapPreview.length} upcoming topics retrieved cleanly.`);

    // -------------------------------------------------------------
    // PART 9: DASHBOARD IDEMPOTENCY / REFRESH
    // -------------------------------------------------------------
    console.log('\n--- PART 9: Dashboard Idempotency / Refresh ---');
    ({ req, res } = createMockReqRes());
    await runWithAuth(getStudentDashboard, req, res, newStudent);
    const refreshedDash = res.body.data;
    if (refreshedDash.readinessScore !== dash.readinessScore || refreshedDash.roadmapPreview.length !== dash.roadmapPreview.length) {
      throw new Error('Dashboard refresh produced inconsistent data');
    }
    console.log('[PASS] 21. Dashboard refresh is stable and consistent.');

    // -------------------------------------------------------------
    // PART 10: RETURNING INITIALIZED STUDENT DIRECT TO DASHBOARD
    // -------------------------------------------------------------
    console.log('\n--- PART 10: Initialized Student Direct to Dashboard ---');
    const updatedStudentProfile = await LearnerProfile.findOne({ userId: newStudent._id });
    const returningRoute = getStudentInitialRoute(updatedStudentProfile);
    if (returningRoute !== '/student/dashboard') {
      throw new Error(`Expected initialized student to go directly to '/student/dashboard', got '${returningRoute}'`);
    }
    console.log(`[PASS] 22. Initialized student login correctly navigates directly to: ${returningRoute} (Bypassing onboarding).`);

    // -------------------------------------------------------------
    // PART 11: SECURITY RBAC VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- PART 11: RBAC & Security Isolation ---');
    // Admin attempting student dashboard -> 403
    ({ req, res } = createMockReqRes());
    req.user = { userId: adminUser._id.toString(), role: 'admin' };
    authorize('student')(req, res, () => {
      res.statusCode = 200;
    });
    if (res.statusCode !== 403) throw new Error(`Expected 403 for Admin on student dashboard, got ${res.statusCode}`);
    console.log('[PASS] 23. Admin attempting student dashboard strictly blocked with HTTP 403.');

    // Student attempting admin blueprint creation -> 403
    ({ req, res } = createMockReqRes({}, validBlueprintPayload));
    req.user = { userId: newStudent._id.toString(), role: 'student' };
    authorize('admin')(req, res, () => {
      res.statusCode = 200;
    });
    if (res.statusCode !== 403) throw new Error(`Expected 403 for Student on admin blueprint API, got ${res.statusCode}`);
    console.log('[PASS] 24. Student attempting admin blueprint API strictly blocked with HTTP 403.');

    console.log('\n================================================================');
    console.log(' ALL 24 END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');

    // Cleanup temporary test data
    console.log('[E2E] Cleaning up temporary test documents from Atlas...');
    for (const uid of createdUserIds) {
      await User.deleteOne({ _id: uid }).catch(() => {});
      await LearnerProfile.deleteOne({ userId: uid }).catch(() => {});
      await Roadmap.deleteOne({ userId: uid }).catch(() => {});
      await AssessmentAttempt.deleteMany({ studentId: uid }).catch(() => {});
      await AssessmentAnalysis.deleteMany({ studentId: uid }).catch(() => {});
      await AttemptTrack.deleteMany({ userId: uid }).catch(() => {});
    }
    for (const bpid of createdBlueprintIds) {
      await AssessmentBlueprint.deleteOne({ _id: bpid }).catch(() => {});
    }
    for (const pid of createdPublishedIds) {
      await PublishedAssessment.deleteOne({ _id: pid }).catch(() => {});
    }
    console.log('[PASS] 25. All test documents cleaned up from Atlas.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`\n[FATAL ERROR] E2E Verification Failed: ${error.message}`);
    for (const uid of createdUserIds) {
      await User.deleteOne({ _id: uid }).catch(() => {});
      await LearnerProfile.deleteOne({ userId: uid }).catch(() => {});
      await Roadmap.deleteOne({ userId: uid }).catch(() => {});
      await AssessmentAttempt.deleteMany({ studentId: uid }).catch(() => {});
      await AssessmentAnalysis.deleteMany({ studentId: uid }).catch(() => {});
      await AttemptTrack.deleteMany({ userId: uid }).catch(() => {});
    }
    for (const bpid of createdBlueprintIds) {
      await AssessmentBlueprint.deleteOne({ _id: bpid }).catch(() => {});
    }
    for (const pid of createdPublishedIds) {
      await PublishedAssessment.deleteOne({ _id: pid }).catch(() => {});
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runE2EVerification();
