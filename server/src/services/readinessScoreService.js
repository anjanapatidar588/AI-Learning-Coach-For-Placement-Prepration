import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import LearnerProfile from '../models/LearnerProfile.js';

/**
 * Deterministically calculates a student's Placement Readiness Score (0-100)
 * based strictly on MongoDB performance data (AttemptTrack, WeaknessAnalysis, LearnerProfile).
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<{ score: number, level: string, breakdown: object, summary: string }>}
 */
export const calculateReadinessScore = async (userId) => {
  // 1. Fetch student performance data cleanly
  const [attempts, weaknesses, profile] = await Promise.all([
    AttemptTrack.find({ userId }).sort({ createdAt: -1 }).lean().catch(() => []),
    WeaknessAnalysis.find({ userId }).lean().catch(() => []),
    LearnerProfile.findOne({ userId }).catch(() => null)
  ]);

  const totalAttemptsCount = Array.isArray(attempts) ? attempts.length : 0;

  // 2. Handle empty / insufficient activity case
  if (totalAttemptsCount === 0) {
    const emptyResult = {
      score: 0,
      level: 'Beginner',
      breakdown: {
        dsa: 0,
        aptitude: 0,
        csCore: 0,
        consistency: 0,
        weaknessImpact: 0
      },
      summary: 'Not enough practice data to calculate Placement Readiness Score. Complete practice problems in DSA, Aptitude, or CS Core to build your score.'
    };

    // Keep profile fields in sync if profile exists
    if (profile) {
      profile.readinessScore = 0;
      profile.overallReadinessScore = 0;
      await profile.save().catch(() => {});
    }

    return emptyResult;
  }

  // 3. Domain-specific performance calculation
  const getCategoryMetrics = (catName) => {
    const catAttempts = attempts.filter(a => a.category === catName);
    const count = catAttempts.length;
    if (count === 0) return { count: 0, passed: 0, accuracy: 0, domainScore: 0, active: false };

    const passed = catAttempts.filter(a => a.status === 'Accepted').length;
    const accuracy = Math.round((passed / count) * 100);
    // Volume factor caps at 5 attempts for full scaling
    const volumeFactor = Math.min(1, count / 5);
    const domainScore = Math.round(accuracy * volumeFactor);

    return { count, passed, accuracy, domainScore, active: true };
  };

  const dsaMetrics = getCategoryMetrics('dsa');
  const aptitudeMetrics = getCategoryMetrics('aptitude');
  const csCoreMetrics = getCategoryMetrics('cs_core');

  // Compute aggregated domain score based on active domains
  const activeDomains = [dsaMetrics, aptitudeMetrics, csCoreMetrics].filter(d => d.active);

  let domainAggregate = 0;
  if (activeDomains.length === 3) {
    domainAggregate = Math.round(dsaMetrics.domainScore * 0.45 + aptitudeMetrics.domainScore * 0.30 + csCoreMetrics.domainScore * 0.25);
  } else if (activeDomains.length > 0) {
    const totalActiveScore = activeDomains.reduce((sum, d) => sum + d.domainScore, 0);
    domainAggregate = Math.round(totalActiveScore / activeDomains.length);
  }

  // 4. Recent momentum & accuracy (last 10 attempts)
  const recentAttempts = attempts.slice(0, 10);
  const recentCount = recentAttempts.length;
  const recentPassed = recentAttempts.filter(a => a.status === 'Accepted').length;
  const recentAccuracy = recentCount > 0 ? Math.round((recentPassed / recentCount) * 100) : 0;

  // 5. Practice consistency (unique active practice days)
  const uniqueDays = new Set(attempts.map(a => {
    if (!a.createdAt) return null;
    try {
      return new Date(a.createdAt).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }).filter(Boolean));

  const uniqueDaysCount = uniqueDays.size;
  const consistencyScore = Math.min(100, uniqueDaysCount * 20 + Math.min(40, totalAttemptsCount * 2));

  // 6. Weakness severity impact (deduction)
  let weaknessDeduction = 0;

  // Check WeaknessAnalysis records
  if (Array.isArray(weaknesses)) {
    weaknesses.forEach(w => {
      const acc = typeof w.accuracyPercentage === 'number' ? w.accuracyPercentage : 50;
      const failures = w.failureCount || 0;
      const severity = w.severity || 'Medium';

      if (acc < 40 || severity === 'High' || failures >= 3) {
        weaknessDeduction += 8;
      } else if (acc < 60 || severity === 'Medium') {
        weaknessDeduction += 4;
      }
    });
  }

  // Check profile weaknessVector if available
  if (profile && Array.isArray(profile.weaknessVector)) {
    profile.weaknessVector.forEach(w => {
      if ((w.errorCount || 0) >= 3) weaknessDeduction += 5;
    });
  }

  // Cap max weakness impact at -25
  const weaknessImpact = -Math.min(25, weaknessDeduction);

  // 7. Weighted Base Score
  // Domain Performance: 60%, Recent Momentum: 25%, Consistency: 15%
  const weightedBase = (domainAggregate * 0.60) + (recentAccuracy * 0.25) + (consistencyScore * 0.15);

  // Apply weakness impact and clamp strictly between 0 and 100
  const rawScore = Math.round(weightedBase + weaknessImpact);
  const finalScore = Math.max(0, Math.min(100, rawScore));

  // 8. Determine Readiness Level
  let level = 'Beginner';
  if (finalScore >= 85) {
    level = 'Placement Ready';
  } else if (finalScore >= 65) {
    level = 'Good';
  } else if (finalScore >= 40) {
    level = 'Developing';
  }

  // 9. Generate Deterministic Summary
  let summary = `Your Placement Readiness Score is ${finalScore}% (${level}).`;
  if (activeDomains.length > 0) {
    const topDomain = [...activeDomains].sort((a, b) => b.accuracy - a.accuracy)[0];
    const topName = topDomain === dsaMetrics ? 'DSA' : topDomain === aptitudeMetrics ? 'Aptitude' : 'CS Core';
    summary += ` Strong accuracy in ${topName} (${topDomain.accuracy}%).`;
  }
  if (weaknessImpact < 0) {
    summary += ` Address detected weaknesses to boost your score further.`;
  } else {
    summary += ` Continue practicing across all modules to maintain momentum.`;
  }

  // 10. Persist score to LearnerProfile if present
  if (profile) {
    profile.readinessScore = finalScore;
    profile.overallReadinessScore = finalScore;
    if (dsaMetrics.active) profile.dsaMastery = dsaMetrics.accuracy;
    if (aptitudeMetrics.active) profile.aptitudeMastery = aptitudeMetrics.accuracy;
    if (csCoreMetrics.active) profile.csCoreMastery = csCoreMetrics.accuracy;
    await profile.save().catch(() => {});
  }

  return {
    score: finalScore,
    level,
    breakdown: {
      dsa: dsaMetrics.accuracy,
      aptitude: aptitudeMetrics.accuracy,
      csCore: csCoreMetrics.accuracy,
      consistency: consistencyScore,
      weaknessImpact
    },
    summary
  };
};
