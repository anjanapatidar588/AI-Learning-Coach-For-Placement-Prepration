/**
 * Helper to determine the correct initial destination for a student
 * based strictly on their LearnerProfile state.
 *
 * Flow:
 * A. Incomplete onboarding -> /student/onboarding
 * B. Onboarding complete + Assessment pending -> /student/assessment-ready
 * C. Both complete -> /student/dashboard
 *
 * @param {object|null} profile
 * @returns {string}
 */
export const getStudentInitialRoute = (profile) => {
  if (!profile) return '/student/onboarding';
  if (!profile.onboardingCompleted) return '/student/onboarding';
  if (!profile.baselineAssessmentCompleted) return '/student/assessment-ready';
  return '/student/dashboard';
};
