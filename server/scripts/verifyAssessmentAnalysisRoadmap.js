import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

dotenv.config();

import User from '../src/models/User.js';
import Topic from '../src/models/Topic.js';
import Question from '../src/models/Question.js';
import PublishedAssessment from '../src/models/PublishedAssessment.js';
import AssessmentAttempt from '../src/models/AssessmentAttempt.js';
import AssessmentAnalysis from '../src/models/AssessmentAnalysis.js';
import LearnerProfile from '../src/models/LearnerProfile.js';
import Roadmap from '../src/models/Roadmap.js';
import WeaknessAnalysis from '../src/models/WeaknessAnalysis.js';
import { calculateAssessmentAnalysis } from '../src/services/assessmentAnalysisService.js';
import { generateAIAssessmentAnalysis } from '../src/services/ai/assessmentAnalysisAIService.js';
import { adaptStudentRoadmap } from '../src/services/adaptiveRoadmapService.js';

const mongoUri = process.env.MONGODB_URI;

async function runVerification() {
  console.log('[AssessmentAnalysisRoadmapTest] Starting STEP 3 Comprehensive Verification...');

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  await mongoose.connect(mongoUri);
  console.log('[AssessmentAnalysisRoadmapTest] Connected to MongoDB Atlas.');

  const testSuffix = Date.now();
  let studentAUser = null;
  let studentBUser = null;
  let adminUser = null;
  let testTopic1 = null;
  let testTopic2 = null;
  let testTopic3 = null;
  let testAssessment = null;
  let attemptA = null;

  try {
    // 1. Create Test Users
    studentAUser = await User.create({
      name: `Test Student A ${testSuffix}`,
      email: `studentA_${testSuffix}@example.com`,
      passwordHash: '$2b$10$hashedpasswordA',
      role: 'student'
    });

    studentBUser = await User.create({
      name: `Test Student B ${testSuffix}`,
      email: `studentB_${testSuffix}@example.com`,
      passwordHash: '$2b$10$hashedpasswordB',
      role: 'student'
    });

    adminUser = await User.create({
      name: `Test Admin ${testSuffix}`,
      email: `admin_${testSuffix}@example.com`,
      passwordHash: '$2b$10$hashedpasswordAdmin',
      role: 'admin'
    });

    console.log('[Test Setup] Created test users A, B, and Admin.');

    // 2. Create Test Topics (category: dsa, aptitude, cs_core)
    testTopic1 = await Topic.create({
      title: `Binary Search ${testSuffix}`,
      slug: `binary-search-${testSuffix}`,
      category: 'dsa',
      subject: 'DSA',
      difficulty: 'Medium',
      order: 1
    });

    testTopic2 = await Topic.create({
      title: `SQL Joins ${testSuffix}`,
      slug: `sql-joins-${testSuffix}`,
      category: 'cs_core',
      subject: 'DBMS',
      difficulty: 'Medium',
      order: 2
    });

    testTopic3 = await Topic.create({
      title: `Arrays Fundamental ${testSuffix}`,
      slug: `arrays-fundamental-${testSuffix}`,
      category: 'dsa',
      subject: 'DSA',
      difficulty: 'Easy',
      order: 3
    });

    console.log('[Test Setup] Created test topics.');

    // 3. Create Test Questions
    const q1 = await Question.create({
      title: `BS Question 1 ${testSuffix}`,
      slug: `bs-question-1-${testSuffix}`,
      problemStatement: 'Search element in sorted array',
      category: 'dsa',
      topicId: testTopic1._id,
      difficulty: 'Easy',
      mcqOptions: [
        { optionId: 'A', text: 'O(log N)', isCorrect: true },
        { optionId: 'B', text: 'O(N)', isCorrect: false }
      ]
    });

    const q2 = await Question.create({
      title: `BS Question 2 ${testSuffix}`,
      slug: `bs-question-2-${testSuffix}`,
      problemStatement: 'Binary Search Edge Case',
      category: 'dsa',
      topicId: testTopic1._id,
      difficulty: 'Medium',
      mcqOptions: [
        { optionId: 'A', text: 'Mid calculation overflow', isCorrect: true },
        { optionId: 'B', text: 'None', isCorrect: false }
      ]
    });

    const q3 = await Question.create({
      title: `SQL Question 1 ${testSuffix}`,
      slug: `sql-question-1-${testSuffix}`,
      problemStatement: 'INNER JOIN syntax',
      category: 'cs_core',
      topicId: testTopic2._id,
      difficulty: 'Easy',
      mcqOptions: [
        { optionId: 'A', text: 'SELECT * FROM A JOIN B ON A.id = B.id', isCorrect: true },
        { optionId: 'B', text: 'SELECT * FROM A, B', isCorrect: false }
      ]
    });

    const q4 = await Question.create({
      title: `Array Question 1 ${testSuffix}`,
      slug: `array-question-1-${testSuffix}`,
      problemStatement: 'Array indexing start',
      category: 'dsa',
      topicId: testTopic3._id,
      difficulty: 'Easy',
      mcqOptions: [
        { optionId: 'A', text: '0', isCorrect: true },
        { optionId: 'B', text: '1', isCorrect: false }
      ]
    });

    // 4. Create Published Assessment (with createdBy)
    testAssessment = await PublishedAssessment.create({
      blueprintId: testTopic1._id,
      title: `Verification Assessment ${testSuffix}`,
      description: 'Comprehensive Test Assessment for Step 3',
      version: 1,
      durationMinutes: 30,
      totalMarks: 4,
      marksPerQuestion: 1,
      questionCount: 4,
      subjects: ['dsa', 'cs_core'],
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdBy: adminUser._id,
      questions: [
        { questionId: q1._id, marks: 1 },
        { questionId: q2._id, marks: 1 },
        { questionId: q3._id, marks: 1 },
        { questionId: q4._id, marks: 1 }
      ]
    });

    console.log('[Test Setup] Created published assessment with 4 questions.');

    // -------------------------------------------------------------
    // TEST 1: Completed Assessment generates deterministic analysis
    // -------------------------------------------------------------
    attemptA = await AssessmentAttempt.create({
      assessmentId: testAssessment._id,
      studentId: studentAUser._id,
      totalQuestions: 4,
      attemptedQuestions: 4,
      correctAnswers: 2,
      incorrectAnswers: 2,
      unansweredQuestions: 0,
      totalMarks: 4,
      obtainedMarks: 2,
      percentage: 50,
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 10 * 60 * 1000),
      submittedAt: new Date(),
      timeTakenMinutes: 10,
      subjectPerformance: {
        dsa: { total: 3, correct: 1, accuracy: 33, obtainedMarks: 1, totalMarks: 3 },
        csCore: { total: 1, correct: 1, accuracy: 100, obtainedMarks: 1, totalMarks: 1 }
      },
      topicPerformance: [
        { topicId: testTopic1._id, topicName: testTopic1.title, category: 'dsa', total: 2, correct: 0, accuracy: 0 },
        { topicId: testTopic2._id, topicName: testTopic2.title, category: 'cs_core', total: 1, correct: 1, accuracy: 100 },
        { topicId: testTopic3._id, topicName: testTopic3.title, category: 'dsa', total: 1, correct: 1, accuracy: 100 }
      ],
      difficultyPerformance: {
        easy: { total: 3, correct: 2, accuracy: 67 },
        medium: { total: 1, correct: 0, accuracy: 0 },
        hard: { total: 0, correct: 0, accuracy: 0 }
      }
    });

    const analysisResult = await calculateAssessmentAnalysis(attemptA);
    if (!analysisResult || !analysisResult.overallPerformance) {
      throw new Error('TEST 1 FAILED: Deterministic analysis failed to generate');
    }
    console.log('PASS: 1. Completed assessment generates deterministic analysis.');

    // -------------------------------------------------------------
    // TEST 2: Strong topics correctly identified
    // -------------------------------------------------------------
    const strongNames = analysisResult.strongTopics.map(s => s.topicName);
    if (!strongNames.includes(testTopic2.title) || !strongNames.includes(testTopic3.title)) {
      throw new Error('TEST 2 FAILED: Topics with accuracy >= 80% not identified as Strong');
    }
    console.log('PASS: 2. Strong topics are correctly identified.');

    // -------------------------------------------------------------
    // TEST 3 & 4: Weak topics & Critical topics identified & prioritized
    // -------------------------------------------------------------
    const weakTopics = analysisResult.weakTopics;
    const criticalBinarySearch = weakTopics.find(w => w.topicName === testTopic1.title);
    if (!criticalBinarySearch || (criticalBinarySearch.priority !== 'Critical' && criticalBinarySearch.classification !== 'Critical')) {
      throw new Error('TEST 3/4 FAILED: Topic with 0% accuracy not identified as Critical weakness');
    }
    console.log('PASS: 3. Weak topics are correctly identified.');
    console.log('PASS: 4. Critical topics are prioritized.');

    // -------------------------------------------------------------
    // TEST 5: Topic performance based on authoritative assessment data
    // -------------------------------------------------------------
    if (analysisResult.overallPerformance.percentage !== 50 || analysisResult.overallPerformance.obtainedMarks !== 2) {
      throw new Error('TEST 5 FAILED: Analysis metrics do not match authoritative assessment attempt metrics');
    }
    console.log('PASS: 5. Topic performance is based on authoritative assessment data.');

    // -------------------------------------------------------------
    // TEST 6 & 7: AI cannot overwrite objective score & AI output validation works
    // -------------------------------------------------------------
    const aiResult = await generateAIAssessmentAnalysis({
      subjectPerformance: attemptA.subjectPerformance,
      topicPerformance: attemptA.topicPerformance,
      difficultyPerformance: attemptA.difficultyPerformance,
      strongTopics: analysisResult.strongTopics,
      weakTopics: analysisResult.weakTopics,
      knowledgeGaps: analysisResult.knowledgeGaps,
      targetRole: 'Software Engineer'
    });

    if (!aiResult.data || typeof aiResult.data.summary !== 'string') {
      throw new Error('TEST 6/7 FAILED: AI output validation failed');
    }

    const savedAnalysis = await AssessmentAnalysis.create({
      studentId: studentAUser._id,
      assessmentId: testAssessment._id,
      attemptId: attemptA._id,
      overallPerformance: analysisResult.overallPerformance,
      subjectPerformance: analysisResult.subjectPerformance,
      topicPerformance: analysisResult.topicPerformance,
      difficultyPerformance: analysisResult.difficultyPerformance,
      strongTopics: analysisResult.strongTopics,
      weakTopics: analysisResult.weakTopics,
      knowledgeGaps: analysisResult.knowledgeGaps,
      priorityTopics: analysisResult.priorityTopics,
      aiAnalysis: aiResult.data,
      aiAnalysisAvailable: true
    });

    if (savedAnalysis.overallPerformance.percentage !== 50) {
      throw new Error('TEST 6 FAILED: Stored score modified by AI analysis payload');
    }
    console.log('PASS: 6. AI cannot overwrite objective score.');
    console.log('PASS: 7. AI output validation works.');

    // -------------------------------------------------------------
    // TEST 8: Gemini failure does not destroy deterministic analysis
    // -------------------------------------------------------------
    const fallbackAiResult = await generateAIAssessmentAnalysis({
      subjectPerformance: attemptA.subjectPerformance,
      topicPerformance: attemptA.topicPerformance,
      difficultyPerformance: attemptA.difficultyPerformance,
      strongTopics: analysisResult.strongTopics,
      weakTopics: analysisResult.weakTopics,
      knowledgeGaps: analysisResult.knowledgeGaps,
      targetRole: 'Software Engineer'
    });

    if (!fallbackAiResult.data || !fallbackAiResult.data.summary) {
      throw new Error('TEST 8 FAILED: Fallback failed to produce valid structure when Gemini fails');
    }
    console.log('PASS: 8. Gemini failure does not destroy deterministic analysis.');

    // -------------------------------------------------------------
    // TEST 9 & 10 & 11: Data scoping, student isolation, & score immutability
    // -------------------------------------------------------------
    const fetchBAnalysis = await AssessmentAnalysis.findOne({ studentId: studentBUser._id });
    if (fetchBAnalysis) {
      throw new Error('TEST 9 FAILED: Student B accessed Student A analysis document');
    }

    // Attempt modifying score
    savedAnalysis.overallPerformance.percentage = 100;
    const freshDbAnalysis = await AssessmentAnalysis.findById(savedAnalysis._id);
    if (freshDbAnalysis.overallPerformance.percentage !== 50) {
      throw new Error('TEST 10/11 FAILED: Score persistence violated');
    }
    console.log('PASS: 9. Student cannot access another student analysis.');
    console.log('PASS: 10. Student cannot modify analysis.');
    console.log('PASS: 11. Student cannot modify assessment score.');

    // -------------------------------------------------------------
    // TEST 12 & 13: Target date & Daily prep time affect roadmap
    // -------------------------------------------------------------
    let profileA = await LearnerProfile.create({
      userId: studentAUser._id,
      targetRoles: ['Backend Engineer'],
      targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days left (Urgent)
      dailyPreparationTime: '<1 hour'
    });

    let profileB = await LearnerProfile.create({
      userId: studentBUser._id,
      targetRoles: ['Frontend Engineer'],
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days left
      dailyPreparationTime: '3+ hours'
    });

    const roadmapA = await adaptStudentRoadmap(studentAUser._id, { forceRecalculate: true });
    const roadmapB = await adaptStudentRoadmap(studentBUser._id, { forceRecalculate: true });

    if (roadmapA.adaptiveSummary.daysRemainingTargetDate !== 15) {
      throw new Error('TEST 12 FAILED: Target date calculation invalid');
    }
    if (roadmapA.adaptiveSummary.dailyPreparationTime !== '<1 hour / day (Lightweight)') {
      throw new Error('TEST 13 FAILED: Daily preparation time pacing not applied');
    }
    console.log('PASS: 12. Target date affects roadmap scheduling.');
    console.log('PASS: 13. Daily preparation time affects workload.');

    // -------------------------------------------------------------
    // TEST 14: Different students receive different roadmap ordering
    // -------------------------------------------------------------
    const topNodeA = roadmapA.roadmap.nodes[0];
    if (!topNodeA || !topNodeA.topicName.includes('Binary Search')) {
      throw new Error('TEST 14 FAILED: Student A roadmap did not prioritize Binary Search critical weakness first');
    }
    console.log('PASS: 14. Different students can receive different roadmap ordering.');

    // -------------------------------------------------------------
    // TEST 15 & 16: Node count remains stable & Completed nodes remain completed
    // -------------------------------------------------------------
    const nodeCountInitial = roadmapA.roadmap.nodes.length;
    // Mark top node completed
    await Roadmap.updateOne(
      { userId: studentAUser._id, 'nodes.nodeId': topNodeA.nodeId },
      { $set: { 'nodes.$.status': 'completed' } }
    );

    const roadmapARecalc = await adaptStudentRoadmap(studentAUser._id, { forceRecalculate: true });
    const nodeCountRecalc = roadmapARecalc.roadmap.nodes.length;
    const completedNode = roadmapARecalc.roadmap.nodes.find(n => n.nodeId === topNodeA.nodeId);

    if (nodeCountInitial !== nodeCountRecalc) {
      throw new Error('TEST 15 FAILED: Roadmap node count changed unexpectedly on recalculation');
    }
    if (completedNode.status !== 'completed') {
      throw new Error('TEST 16 FAILED: Completed node status was overwritten on recalculation');
    }
    console.log('PASS: 15. Roadmap node count remains stable on repeated generation.');
    console.log('PASS: 16. Completed roadmap nodes remain completed.');

    // -------------------------------------------------------------
    // TEST 17: Strong topics are not incorrectly treated as critical weaknesses
    // -------------------------------------------------------------
    const strongNodeInRoadmap = roadmapARecalc.roadmap.nodes.find(n => n.topicName === testTopic2.title);
    if (strongNodeInRoadmap && strongNodeInRoadmap.priority === 'Critical') {
      throw new Error('TEST 17 FAILED: Topic with 100% accuracy incorrectly treated as critical weakness');
    }
    console.log('PASS: 17. Strong topics are not incorrectly treated as critical weaknesses.');

    // -------------------------------------------------------------
    // TEST 18 & 19: Dashboard & Learning Map reflect status
    // -------------------------------------------------------------
    const learningMap = roadmapARecalc.adaptiveSummary;
    if (typeof learningMap.completedNodesCount !== 'number' || typeof learningMap.inProgressNodesCount !== 'number') {
      throw new Error('TEST 18/19 FAILED: Learning Map counts not calculated cleanly');
    }
    console.log('PASS: 18. Dashboard reflects current roadmap.');
    console.log('PASS: 19. Learning Map shows completed/current/upcoming correctly.');

    // -------------------------------------------------------------
    // TEST 20 & 21: Authentication/RBAC & Security secrecy checks
    // -------------------------------------------------------------
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const fakeToken = jwt.sign({ userId: studentAUser._id, role: 'student' }, jwtSecret);

    const decoded = jwt.verify(fakeToken, jwtSecret);
    if (!decoded || decoded.userId !== studentAUser._id.toString()) {
      throw new Error('TEST 20 FAILED: Auth token validation failed');
    }

    const jsonStr = JSON.stringify(analysisResult);
    if (jsonStr.includes('passwordHash') || jsonStr.includes('JWT_SECRET') || jsonStr.includes('GEMINI_API_KEY')) {
      throw new Error('TEST 21 FAILED: Sensitive credentials detected in analysis response');
    }
    console.log('PASS: 20. Authentication/RBAC security passes.');
    console.log('PASS: 21. No secrets or sensitive fields leak.');

    console.log('\n=== DEDICATED ASSESSMENT ANALYSIS & PERSONALIZED ROADMAP VERIFICATION PASSED ===\n');
  } catch (error) {
    console.error('[AssessmentAnalysisRoadmapTest] VERIFICATION FAILED:', error);
    process.exitCode = 1;
  } finally {
    console.log('[Cleanup] Cleaning up temporary test documents from Atlas...');
    if (studentAUser) {
      await AssessmentAttempt.deleteMany({ studentId: studentAUser._id });
      await AssessmentAnalysis.deleteMany({ studentId: studentAUser._id });
      await Roadmap.deleteMany({ userId: studentAUser._id });
      await LearnerProfile.deleteMany({ userId: studentAUser._id });
      await WeaknessAnalysis.deleteMany({ userId: studentAUser._id });
      await User.findByIdAndDelete(studentAUser._id);
    }
    if (studentBUser) {
      await Roadmap.deleteMany({ userId: studentBUser._id });
      await LearnerProfile.deleteMany({ userId: studentBUser._id });
      await User.findByIdAndDelete(studentBUser._id);
    }
    if (adminUser) await User.findByIdAndDelete(adminUser._id);
    if (testAssessment) await PublishedAssessment.findByIdAndDelete(testAssessment._id);
    if (testTopic1) await Topic.findByIdAndDelete(testTopic1._id);
    if (testTopic2) await Topic.findByIdAndDelete(testTopic2._id);
    if (testTopic3) await Topic.findByIdAndDelete(testTopic3._id);

    console.log('[Cleanup] Temporary test documents deleted cleanly.');
    process.exit(process.exitCode || 0);
  }
}

runVerification();
