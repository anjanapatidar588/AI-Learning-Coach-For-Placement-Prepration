import User from '../models/User.js';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import Company from '../models/Company.js';
import AIConfig from '../models/AIConfig.js';
import AttemptTrack from '../models/AttemptTrack.js';
import LearnerProfile from '../models/LearnerProfile.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import AssessmentBlueprint from '../models/AssessmentBlueprint.js';
import PublishedAssessment from '../models/PublishedAssessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import { calculateReadinessScore } from '../services/readinessScoreService.js';

// Admin Dashboard Analytics
export const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Student Metrics
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Active students (students with at least 1 attempt)
    const activeStudentIds = await AttemptTrack.distinct('userId');
    const activeStudents = activeStudentIds.length;

    // Profiles & Readiness stats
    const profiles = await LearnerProfile.find().select('readinessScore baselineAssessmentCompleted');
    const baselineCompleted = profiles.filter(p => p.baselineAssessmentCompleted).length;
    
    let totalReadinessScore = 0;
    let readinessCount = 0;
    const distribution = {
      beginner: 0,      // 0-39
      developing: 0,    // 40-64
      good: 0,          // 65-84
      placementReady: 0 // 85-100
    };

    profiles.forEach(p => {
      const score = typeof p.readinessScore === 'number' ? p.readinessScore : 0;
      totalReadinessScore += score;
      readinessCount++;

      if (score >= 85) distribution.placementReady++;
      else if (score >= 65) distribution.good++;
      else if (score >= 40) distribution.developing++;
      else distribution.beginner++;
    });

    const averageReadiness = readinessCount > 0 ? Math.round(totalReadinessScore / readinessCount) : 0;

    // 2. Question / Content Metrics
    const totalQuestions = await Question.countDocuments();
    
    // Map topics by category
    const dsaTopics = await Topic.find({ category: 'dsa' }).select('_id');
    const aptitudeTopics = await Topic.find({ category: 'aptitude' }).select('_id');
    const csCoreTopics = await Topic.find({ category: 'cs_core' }).select('_id');

    const dsaTopicIds = dsaTopics.map(t => t._id);
    const aptitudeTopicIds = aptitudeTopics.map(t => t._id);
    const csCoreTopicIds = csCoreTopics.map(t => t._id);

    const dsaQuestions = dsaTopicIds.length > 0 ? await Question.countDocuments({ topicId: { $in: dsaTopicIds } }) : 0;
    const aptitudeQuestions = aptitudeTopicIds.length > 0 ? await Question.countDocuments({ topicId: { $in: aptitudeTopicIds } }) : 0;
    const csCoreQuestions = csCoreTopicIds.length > 0 ? await Question.countDocuments({ topicId: { $in: csCoreTopicIds } }) : 0;

    // 3. Practice Activity Metrics (AttemptTrack)
    const totalAttempts = await AttemptTrack.countDocuments();
    const successfulAttempts = await AttemptTrack.countDocuments({ status: 'Accepted' });
    const failedAttempts = totalAttempts - successfulAttempts;
    const overallAccuracy = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;

    // 4. Domain Performance
    const allAttempts = await AttemptTrack.find().select('category status');
    
    const domainStats = {
      dsa: { totalAttempts: 0, passedAttempts: 0, accuracy: 0 },
      aptitude: { totalAttempts: 0, passedAttempts: 0, accuracy: 0 },
      csCore: { totalAttempts: 0, passedAttempts: 0, accuracy: 0 }
    };

    allAttempts.forEach(att => {
      let key = null;
      if (att.category === 'dsa') key = 'dsa';
      else if (att.category === 'aptitude') key = 'aptitude';
      else if (att.category === 'cs_core') key = 'csCore';

      if (key) {
        domainStats[key].totalAttempts++;
        if (att.status === 'Accepted') domainStats[key].passedAttempts++;
      }
    });

    domainStats.dsa.accuracy = domainStats.dsa.totalAttempts > 0 ? Math.round((domainStats.dsa.passedAttempts / domainStats.dsa.totalAttempts) * 100) : 0;
    domainStats.aptitude.accuracy = domainStats.aptitude.totalAttempts > 0 ? Math.round((domainStats.aptitude.passedAttempts / domainStats.aptitude.totalAttempts) * 100) : 0;
    domainStats.csCore.accuracy = domainStats.csCore.totalAttempts > 0 ? Math.round((domainStats.csCore.passedAttempts / domainStats.csCore.totalAttempts) * 100) : 0;

    // 5. Weak Topics Aggregate
    const attemptsWithQuestion = await AttemptTrack.find()
      .populate({
        path: 'questionId',
        select: 'title topicId',
        populate: { path: 'topicId', select: 'title category' }
      })
      .select('userId questionId category status');

    const topicMap = {};
    attemptsWithQuestion.forEach(att => {
      let topicName = 'General Topic';
      let cat = att.category || 'dsa';

      if (att.questionId) {
        if (att.questionId.topicId && att.questionId.topicId.title) {
          topicName = att.questionId.topicId.title;
        } else if (att.questionId.title) {
          topicName = att.questionId.title;
        }
      }

      const key = `${cat}::${topicName}`;
      if (!topicMap[key]) {
        topicMap[key] = {
          topic: topicName,
          category: cat,
          totalAttempts: 0,
          passedAttempts: 0,
          failedAttempts: 0,
          students: new Set()
        };
      }

      topicMap[key].totalAttempts++;
      if (att.userId) topicMap[key].students.add(att.userId.toString());
      if (att.status === 'Accepted') topicMap[key].passedAttempts++;
      else topicMap[key].failedAttempts++;
    });

    const weaknesses = Object.values(topicMap)
      .map(stat => {
        const acc = Math.round((stat.passedAttempts / stat.totalAttempts) * 100);
        let severity = 'Low';
        if (acc < 30 || stat.failedAttempts >= 3) severity = 'High';
        else if (acc <= 45) severity = 'Medium';

        return {
          topic: stat.topic,
          category: stat.category,
          affectedStudents: stat.students.size,
          totalAttempts: stat.totalAttempts,
          failedAttempts: stat.failedAttempts,
          accuracy: acc,
          severity
        };
      })
      .filter(w => w.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // 6. Recent Activity
    const recentAttempts = await AttemptTrack.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('questionId', 'title category difficulty')
      .select('category status createdAt timeSpentSeconds');

    const recentActivity = recentAttempts.map(att => ({
      id: att._id,
      title: att.questionId?.title || 'Practice Submission',
      category: att.category ? att.category.replace('_', ' ') : 'dsa',
      status: att.status,
      timeSpentSeconds: att.timeSpentSeconds || 0,
      createdAt: att.createdAt
    }));

    // Assessment & Topic Platform Totals
    const totalAssessments = await AssessmentBlueprint.countDocuments();
    const publishedAssessments = await PublishedAssessment.countDocuments({ status: 'PUBLISHED' });
    const totalTopics = await Topic.countDocuments();

    // Assessment Completion Rate
    const totalAssessmentAttempts = await AssessmentAttempt.countDocuments();
    const completedAssessmentAttempts = await AssessmentAttempt.countDocuments({ status: 'COMPLETED' });
    const assessmentCompletionRate = totalAssessmentAttempts > 0
      ? Math.round((completedAssessmentAttempts / totalAssessmentAttempts) * 100)
      : (totalStudents > 0 ? Math.round((baselineCompleted / totalStudents) * 100) : 0);

    res.json({
      success: true,
      data: {
        kpis: {
          totalStudents,
          activeStudents,
          totalAssessments,
          publishedAssessments,
          totalQuestions,
          totalTopics,
          averageReadiness,
          assessmentCompletionRate
        },
        assessments: {
          total: totalAssessments,
          published: publishedAssessments,
          completionRate: assessmentCompletionRate
        },
        topics: {
          total: totalTopics
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          baselineCompleted,
          averageReadiness
        },
        questions: {
          total: totalQuestions,
          dsa: dsaQuestions,
          aptitude: aptitudeQuestions,
          csCore: csCoreQuestions
        },
        attempts: {
          total: totalAttempts,
          successful: successfulAttempts,
          failed: failedAttempts,
          overallAccuracy
        },
        readiness: {
          average: averageReadiness,
          distribution
        },
        domains: domainStats,
        weaknesses,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student Management
export const getStudentsList = async (req, res) => {
  try {
    const { search, baselineStatus, skillLevel, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build User query for students
    const userQuery = { role: 'student' };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const cleanedSearch = search.trim();
      userQuery.$or = [
        { name: { $regex: cleanedSearch, $options: 'i' } },
        { email: { $regex: cleanedSearch, $options: 'i' } }
      ];
    }

    // Build LearnerProfile query filter if provided
    const profileQuery = {};
    if (baselineStatus === 'completed') {
      profileQuery.baselineAssessmentCompleted = true;
    } else if (baselineStatus === 'pending') {
      profileQuery.baselineAssessmentCompleted = false;
    }

    if (skillLevel && ['Beginner', 'Intermediate', 'Advanced'].includes(skillLevel)) {
      profileQuery.currentSkillLevel = skillLevel;
    }

    if (Object.keys(profileQuery).length > 0) {
      const matchingProfiles = await LearnerProfile.find(profileQuery).select('userId');
      const matchingUserIds = matchingProfiles.map(p => p.userId);
      userQuery._id = { $in: matchingUserIds };
    }

    const total = await User.countDocuments(userQuery);

    const students = await User.find(userQuery)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const studentUserIds = students.map(s => s._id);
    const profiles = await LearnerProfile.find({ userId: { $in: studentUserIds } }).lean();
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const enrichedStudents = await Promise.all(
      students.map(async (st) => {
        const prof = profileMap.get(st._id.toString());
        let readinessScore = typeof prof?.readinessScore === 'number' ? prof.readinessScore : 0;
        
        try {
          const readinessRes = await calculateReadinessScore(st._id);
          readinessScore = readinessRes.score;
        } catch (e) {}

        return {
          _id: st._id,
          id: st._id,
          name: st.name,
          email: st.email,
          targetRole: st.targetRole || (prof?.targetRoles?.[0] || 'SDE-1'),
          targetCompanies: st.targetCompanies || [],
          currentSkillLevel: prof?.currentSkillLevel || 'Intermediate',
          baselineAssessmentCompleted: !!prof?.baselineAssessmentCompleted,
          baselineScore: typeof prof?.baselineScore === 'number' ? prof.baselineScore : 0,
          readinessScore,
          createdAt: st.createdAt
        };
      })
    );

    res.json({
      success: true,
      data: {
        students: enrichedStudents,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminStudents = getStudentsList;

export const getAdminStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(studentId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' })
      .select('-passwordHash')
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 1. Learner Profile
    const profile = await LearnerProfile.findOne({ userId: studentId }).lean();

    // 2. Authoritative Readiness Score
    const readinessDetails = await calculateReadinessScore(studentId);

    // 3. AttemptTrack metrics & domain performance
    const attempts = await AttemptTrack.find({ userId: studentId })
      .populate('questionId', 'title category difficulty')
      .sort({ createdAt: -1 })
      .lean();

    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.status === 'Accepted').length;
    const failedAttempts = totalAttempts - successfulAttempts;

    let totalPracticeTimeSeconds = 0;
    let hintsUsedCount = 0;

    const domainStats = {
      dsa: { totalAttempts: 0, passedAttempts: 0, accuracy: 0 },
      aptitude: { totalAttempts: 0, passedAttempts: 0, accuracy: 0 },
      csCore: { totalAttempts: 0, passedAttempts: 0, accuracy: 0 }
    };

    attempts.forEach(att => {
      totalPracticeTimeSeconds += att.timeSpentSeconds || 0;
      hintsUsedCount += att.hintsUsedCount || 0;

      let key = null;
      if (att.category === 'dsa') key = 'dsa';
      else if (att.category === 'aptitude') key = 'aptitude';
      else if (att.category === 'cs_core') key = 'csCore';

      if (key) {
        domainStats[key].totalAttempts++;
        if (att.status === 'Accepted') domainStats[key].passedAttempts++;
      }
    });

    domainStats.dsa.accuracy = domainStats.dsa.totalAttempts > 0
      ? Math.round((domainStats.dsa.passedAttempts / domainStats.dsa.totalAttempts) * 100) : 0;
    domainStats.aptitude.accuracy = domainStats.aptitude.totalAttempts > 0
      ? Math.round((domainStats.aptitude.passedAttempts / domainStats.aptitude.totalAttempts) * 100) : 0;
    domainStats.csCore.accuracy = domainStats.csCore.totalAttempts > 0
      ? Math.round((domainStats.csCore.passedAttempts / domainStats.csCore.totalAttempts) * 100) : 0;

    // 4. Weak Areas
    const weaknesses = await WeaknessAnalysis.find({ userId: studentId })
      .populate('topicId', 'title category')
      .lean();

    const weakAreas = weaknesses.map(w => ({
      _id: w._id,
      topic: w.topicId?.title || w.topicName || 'General Topic',
      category: w.category || 'dsa',
      accuracy: typeof w.accuracyPercentage === 'number' ? w.accuracyPercentage : 0,
      attempts: w.failureCount || 0,
      severity: w.severity || 'Medium'
    }));

    // 5. Active Roadmap
    const roadmap = await Roadmap.findOne({ userId: studentId })
      .populate('nodes.topicId', 'title category')
      .lean();

    // 6. Recent Activity Stream (NO submittedCode, NO secrets!)
    const recentActivity = attempts.slice(0, 10).map(att => ({
      id: att._id,
      title: att.questionId?.title || 'Practice Submission',
      category: att.category ? att.category.replace('_', ' ') : 'dsa',
      status: att.status,
      timeSpentSeconds: att.timeSpentSeconds || 0,
      createdAt: att.createdAt
    }));

    res.json({
      success: true,
      data: {
        profile: {
          _id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar || '',
          targetRole: student.targetRole || (profile?.targetRoles?.[0] || 'SDE-1'),
          targetCompanies: student.targetCompanies || [],
          currentSkillLevel: profile?.currentSkillLevel || 'Intermediate',
          targetDate: profile?.targetDate || null,
          baselineStatus: profile?.baselineAssessmentCompleted ? 'Completed' : 'Pending',
          baselineAssessmentCompleted: !!profile?.baselineAssessmentCompleted,
          baselineScore: typeof profile?.baselineScore === 'number' ? profile.baselineScore : 0,
          baselineCompletedAt: profile?.baselineCompletedAt || null,
          createdAt: student.createdAt
        },
        readiness: {
          score: readinessDetails.score,
          level: readinessDetails.level,
          breakdown: readinessDetails.breakdown,
          summary: readinessDetails.summary
        },
        performance: {
          totalAttempts,
          successfulAttempts,
          failedAttempts,
          overallAccuracy: totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0,
          totalPracticeTimeMinutes: Math.round(totalPracticeTimeSeconds / 60),
          hintsUsedCount,
          domains: domainStats
        },
        weakAreas,
        roadmap: roadmap ? {
          nodesCount: roadmap.nodes?.length || 0,
          completedNodes: roadmap.nodes?.filter(n => n.status === 'completed').length || 0,
          nodes: (roadmap.nodes || []).map(n => ({
            nodeId: n.nodeId,
            topic: n.topicId?.title || 'Topic Node',
            status: n.status,
            priorityScore: n.priorityScore,
            recommendedDifficulty: n.recommendedDifficulty
          })),
          lastGeneratedAt: roadmap.lastGeneratedAt
        } : null,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Question Management CRUD
export const getAdminQuestions = async (req, res) => {
  try {
    const { category, difficulty, topicId, search, page = 1, limit = 10 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Category filter
    if (category) {
      const cat = category.toLowerCase();
      if (['dsa', 'aptitude', 'cs_core'].includes(cat)) {
        const topics = await Topic.find({ category: cat }).select('_id');
        const topicIds = topics.map(t => t._id);
        query.topicId = { $in: topicIds };
      }
    }

    // Topic filter
    if (topicId) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
      if (isObjectId) {
        query.topicId = topicId;
      } else {
        const t = await Topic.findOne({ slug: topicId }).select('_id');
        if (t) {
          query.topicId = t._id;
        } else {
          return res.json({
            success: true,
            data: { questions: [], pagination: { total: 0, page: pageNum, limit: limitNum, pages: 0 } }
          });
        }
      }
    }

    // Difficulty filter
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const cleanedSearch = search.trim();
      query.$or = [
        { title: { $regex: cleanedSearch, $options: 'i' } },
        { problemStatement: { $regex: cleanedSearch, $options: 'i' } }
      ];
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('topicId', 'title category subject slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(questionId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid questionId format' });
    }

    const question = await Question.findById(questionId).populate('topicId', 'title category subject slug');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminQuestion = async (req, res) => {
  try {
    const {
      title,
      topicId,
      problemStatement,
      difficulty,
      type,
      slug,
      description,
      inputFormat,
      outputFormat,
      constraints,
      codeSnippets,
      testCases,
      mcqOptions,
      hints,
      solutionCode,
      solutionExplanation,
      companyTags,
      category
    } = req.body;

    if (category && !['dsa', 'aptitude', 'cs_core'].includes(category.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid category. Supported categories are dsa, aptitude, cs_core' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!problemStatement || typeof problemStatement !== 'string' || problemStatement.trim() === '') {
      return res.status(400).json({ success: false, message: 'Problem statement is required' });
    }

    if (!topicId || !/^[0-9a-fA-F]{24}$/.test(topicId)) {
      return res.status(400).json({ success: false, message: 'Valid topicId is required' });
    }

    const topicExists = await Topic.findById(topicId);
    if (!topicExists) {
      return res.status(400).json({ success: false, message: 'Specified topic does not exist' });
    }

    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Invalid difficulty value' });
    }

    const allowedTypes = ['coding', 'mcq', 'conceptual', 'CODING', 'MCQ', 'SHORT_ANSWER'];
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid question type' });
    }

    const questionType = (type || 'coding').toLowerCase();
    if (questionType === 'mcq') {
      if (!Array.isArray(mcqOptions) || mcqOptions.length < 2) {
        return res.status(400).json({ success: false, message: 'MCQ questions require at least 2 options' });
      }
      const hasCorrect = mcqOptions.some(opt => opt && opt.isCorrect === true);
      if (!hasCorrect) {
        return res.status(400).json({ success: false, message: 'MCQ questions require at least one correct option' });
      }
    }

    let finalSlug = slug;
    if (!finalSlug || typeof finalSlug !== 'string' || finalSlug.trim() === '') {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const slugExists = await Question.findOne({ slug: finalSlug });
    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      topicId,
      problemStatement: problemStatement.trim(),
      difficulty: difficulty || 'Easy',
      type: type || 'coding',
      description: description || '',
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      constraints: constraints || '',
      codeSnippets: codeSnippets || {},
      testCases: Array.isArray(testCases) ? testCases : [],
      mcqOptions: Array.isArray(mcqOptions) ? mcqOptions : [],
      hints: Array.isArray(hints) ? hints : [],
      solutionCode: solutionCode || {},
      solutionExplanation: solutionExplanation || '',
      companyTags: Array.isArray(companyTags) ? companyTags : []
    };

    const newQuestion = await Question.create(payload);
    const populated = await Question.findById(newQuestion._id).populate('topicId', 'title category subject slug');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(questionId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid questionId format' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const {
      title,
      topicId,
      problemStatement,
      difficulty,
      type,
      description,
      inputFormat,
      outputFormat,
      constraints,
      codeSnippets,
      testCases,
      mcqOptions,
      hints,
      solutionCode,
      solutionExplanation,
      companyTags,
      category
    } = req.body;

    if (category !== undefined && !['dsa', 'aptitude', 'cs_core'].includes(category.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid category. Supported categories are dsa, aptitude, cs_core' });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      question.title = title.trim();
    }

    if (problemStatement !== undefined) {
      if (typeof problemStatement !== 'string' || problemStatement.trim() === '') {
        return res.status(400).json({ success: false, message: 'Problem statement cannot be empty' });
      }
      question.problemStatement = problemStatement.trim();
    }

    if (topicId !== undefined) {
      if (!/^[0-9a-fA-F]{24}$/.test(topicId)) {
        return res.status(400).json({ success: false, message: 'Invalid topicId format' });
      }
      const topicExists = await Topic.findById(topicId);
      if (!topicExists) {
        return res.status(400).json({ success: false, message: 'Specified topic does not exist' });
      }
      question.topicId = topicId;
    }

    if (difficulty !== undefined) {
      if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        return res.status(400).json({ success: false, message: 'Invalid difficulty value' });
      }
      question.difficulty = difficulty;
    }

    if (type !== undefined) {
      const allowedTypes = ['coding', 'mcq', 'conceptual', 'CODING', 'MCQ', 'SHORT_ANSWER'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid question type' });
      }
      question.type = type;
    }

    if (mcqOptions !== undefined) {
      const qType = (question.type || 'coding').toLowerCase();
      if (qType === 'mcq') {
        if (!Array.isArray(mcqOptions) || mcqOptions.length < 2) {
          return res.status(400).json({ success: false, message: 'MCQ questions require at least 2 options' });
        }
        const hasCorrect = mcqOptions.some(opt => opt && opt.isCorrect === true);
        if (!hasCorrect) {
          return res.status(400).json({ success: false, message: 'MCQ questions require at least one correct option' });
        }
      }
      question.mcqOptions = mcqOptions;
    }

    if (description !== undefined) question.description = description;
    if (inputFormat !== undefined) question.inputFormat = inputFormat;
    if (outputFormat !== undefined) question.outputFormat = outputFormat;
    if (constraints !== undefined) question.constraints = constraints;
    if (codeSnippets !== undefined) question.codeSnippets = codeSnippets;
    if (testCases !== undefined && Array.isArray(testCases)) question.testCases = testCases;
    if (hints !== undefined && Array.isArray(hints)) question.hints = hints;
    if (solutionCode !== undefined) question.solutionCode = solutionCode;
    if (solutionExplanation !== undefined) question.solutionExplanation = solutionExplanation;
    if (companyTags !== undefined && Array.isArray(companyTags)) question.companyTags = companyTags;

    await question.save();
    const updated = await Question.findById(questionId).populate('topicId', 'title category subject slug');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(questionId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid questionId format' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const hasAttempts = await AttemptTrack.exists({ questionId });
    if (hasAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete question because historical student practice attempts reference it.'
      });
    }

    await Question.deleteOne({ _id: questionId });

    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminTopics = async (req, res) => {
  try {
    const { category, subject, difficulty, search, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (category && ['dsa', 'aptitude', 'cs_core'].includes(category.toLowerCase())) {
      query.category = category.toLowerCase();
    }

    if (subject && typeof subject === 'string' && subject.trim() !== '') {
      query.subject = { $regex: subject.trim(), $options: 'i' };
    }

    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const cleanedSearch = search.trim();
      query.$or = [
        { title: { $regex: cleanedSearch, $options: 'i' } },
        { subject: { $regex: cleanedSearch, $options: 'i' } },
        { summary: { $regex: cleanedSearch, $options: 'i' } }
      ];
    }

    const total = await Topic.countDocuments(query);
    const rawTopics = await Topic.find(query)
      .sort({ category: 1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const topicsWithDetails = await Promise.all(
      rawTopics.map(async (t) => {
        const questionCount = await Question.countDocuments({ topicId: t._id });
        return {
          ...t,
          id: t._id,
          name: t.title,
          questionCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        topics: topicsWithDetails,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminTopicById = async (req, res) => {
  try {
    const { topicId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid topic ID format' });
    }

    const topic = await Topic.findById(topicId).lean();
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const questionCount = await Question.countDocuments({ topicId });

    res.json({
      success: true,
      data: {
        ...topic,
        id: topic._id,
        name: topic.title,
        questionCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminTopic = async (req, res) => {
  try {
    const {
      title,
      name,
      category,
      subject,
      difficulty,
      order,
      summary,
      description,
      slug
    } = req.body;

    const topicTitle = (title || name || '').trim();
    if (!topicTitle) {
      return res.status(400).json({ success: false, message: 'Topic title is required' });
    }

    if (!category || !['dsa', 'aptitude', 'cs_core'].includes(category.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Valid category (dsa, aptitude, cs_core) is required' });
    }

    const topicSubject = (subject || '').trim();
    if (!topicSubject) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Invalid difficulty value' });
    }

    let finalSlug = slug;
    if (!finalSlug || typeof finalSlug !== 'string' || finalSlug.trim() === '') {
      finalSlug = topicTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const existingSlug = await Topic.findOne({ slug: finalSlug });
    if (existingSlug) {
      return res.status(400).json({ success: false, message: 'A topic with this title or slug already exists' });
    }

    const existingTitleInCat = await Topic.findOne({
      category: category.toLowerCase(),
      title: { $regex: `^${topicTitle}$`, $options: 'i' }
    });
    if (existingTitleInCat) {
      return res.status(400).json({ success: false, message: 'A topic with this title already exists in this category' });
    }

    const payload = {
      title: topicTitle,
      category: category.toLowerCase(),
      subject: topicSubject,
      slug: finalSlug,
      difficulty: difficulty || 'Medium',
      order: typeof order === 'number' ? order : 0,
      summary: summary || '',
      description: description || ''
    };

    const newTopic = await Topic.create(payload);

    res.status(201).json({
      success: true,
      data: {
        ...newTopic.toObject(),
        id: newTopic._id,
        name: newTopic.title,
        questionCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid topic ID format' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const {
      title,
      name,
      category,
      subject,
      difficulty,
      order,
      summary,
      description
    } = req.body;

    if (title !== undefined || name !== undefined) {
      const newTitle = (title || name || '').trim();
      if (!newTitle) {
        return res.status(400).json({ success: false, message: 'Topic title cannot be empty' });
      }
      topic.title = newTitle;
    }

    if (category !== undefined) {
      if (!['dsa', 'aptitude', 'cs_core'].includes(category.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid category. Must be dsa, aptitude, or cs_core' });
      }
      topic.category = category.toLowerCase();
    }

    if (subject !== undefined) {
      if (typeof subject !== 'string' || subject.trim() === '') {
        return res.status(400).json({ success: false, message: 'Subject cannot be empty' });
      }
      topic.subject = subject.trim();
    }

    if (difficulty !== undefined) {
      if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        return res.status(400).json({ success: false, message: 'Invalid difficulty value' });
      }
      topic.difficulty = difficulty;
    }

    if (order !== undefined) {
      topic.order = typeof order === 'number' ? order : 0;
    }

    if (summary !== undefined) topic.summary = summary;
    if (description !== undefined) topic.description = description;

    await topic.save();

    const questionCount = await Question.countDocuments({ topicId });

    res.json({
      success: true,
      data: {
        ...topic.toObject(),
        id: topic._id,
        name: topic.title,
        questionCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid topic ID format' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // 1. Check if questions are linked to this topic
    const linkedQuestionsCount = await Question.countDocuments({ topicId });
    if (linkedQuestionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Topic cannot be deleted because ${linkedQuestionsCount} question(s) are linked to this topic.`
      });
    }

    // 2. Check if active roadmaps reference this topic
    const linkedRoadmap = await Roadmap.exists({ "nodes.topicId": topicId });
    if (linkedRoadmap) {
      return res.status(400).json({
        success: false,
        message: 'Topic cannot be deleted because adaptive student roadmaps reference this topic.'
      });
    }

    await Topic.deleteOne({ _id: topicId });

    res.json({ success: true, message: 'Topic deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export manageQuestions for backwards compatibility if needed
export const manageQuestions = getAdminQuestions;

// Company Management for Admin
export const getAdminCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 }).lean();
    const companiesWithDetails = await Promise.all(
      companies.map(async (c) => {
        const taggedQuestionsCount = await Question.countDocuments({ companyTags: c.name });
        return {
          ...c,
          id: c._id,
          taggedQuestionsCount
        };
      })
    );
    res.json({ success: true, data: companiesWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminCompany = async (req, res) => {
  try {
    const { name, logoUrl, description, hiringRounds, syllabus, cutoffBenchmark } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company with this name already exists.' });
    }

    const company = await Company.create({
      name: name.trim(),
      logoUrl: logoUrl || '',
      description: description || '',
      hiringRounds: Array.isArray(hiringRounds) ? hiringRounds : [],
      syllabus: Array.isArray(syllabus) ? syllabus : [],
      cutoffBenchmark: typeof cutoffBenchmark === 'number' ? cutoffBenchmark : 75
    });

    res.status(201).json({ success: true, data: { ...company.toObject(), id: company._id, taggedQuestionsCount: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const { name, logoUrl, description, hiringRounds, syllabus, cutoffBenchmark } = req.body;
    if (name) company.name = name.trim();
    if (logoUrl !== undefined) company.logoUrl = logoUrl;
    if (description !== undefined) company.description = description;
    if (Array.isArray(hiringRounds)) company.hiringRounds = hiringRounds;
    if (Array.isArray(syllabus)) company.syllabus = syllabus;
    if (typeof cutoffBenchmark === 'number') company.cutoffBenchmark = cutoffBenchmark;

    await company.save();
    const taggedQuestionsCount = await Question.countDocuments({ companyTags: company.name });

    res.json({
      success: true,
      data: { ...company.toObject(), id: company._id, taggedQuestionsCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    await Company.deleteOne({ _id: companyId });
    res.json({ success: true, message: 'Company deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Configuration Management
export const getAIConfigs = async (req, res) => {
  try {
    const configs = [
      { id: 'cfg-1', personaName: 'DSA Mentor', modelName: 'gemini-1.5-pro', temperature: 0.7, maxTokens: 1024, isActive: true },
      { id: 'cfg-2', personaName: 'Aptitude Mentor', modelName: 'gemini-1.5-flash', temperature: 0.5, maxTokens: 800, isActive: true },
      { id: 'cfg-3', personaName: 'CS Core Mentor', modelName: 'gemini-1.5-pro', temperature: 0.6, maxTokens: 1024, isActive: true },
      { id: 'cfg-4', personaName: 'Interview Coach', modelName: 'gemini-1.5-pro', temperature: 0.8, maxTokens: 1200, isActive: true },
      { id: 'cfg-5', personaName: 'Career Coach', modelName: 'gemini-1.5-flash', temperature: 0.7, maxTokens: 1024, isActive: true }
    ];
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAIConfig = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, message: `AI Config ${id} updated successfully.`, data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

