import { execSync } from 'child_process';

const scripts = [
  'verifyAuthFoundation.js',
  'verifyLogin.js',
  'verifyRBAC.js',
  'verifyStudentProfile.js',
  'verifyStudentDashboard.js',
  'verifyStudentRoadmap.js',
  'verifyStudentProgress.js',
  'verifyStudentWeakAreas.js',
  'verifyStudentAchievements.js',
  'verifyDsaTopics.js',
  'verifyDsaQuestions.js',
  'verifyDsaQuestionDetail.js',
  'verifyDsaSubmit.js',
  'verifyDsaAiHint.js',
  'verifyAptitudeTopics.js',
  'verifyAptitudeQuiz.js',
  'verifyAptitudeQuizSubmit.js',
  'verifyAptitudeAiExplain.js',
  'verifyCsCoreSubjects.js',
  'verifyCsCoreTopics.js',
  'verifyCsCoreQuizSubmit.js',
  'verifyPracticeFilter.js',
  'verifyCompanies.js',
  'verifyCompanyDetail.js',
  'verifyAiCoach.js',
  'verifyAiCoachContext.js',
  'verifyRecommendations.js',
  'verifyRecommendationExplain.js',
  'verifyGeminiApi.js'
];

let failed = false;

for (const script of scripts) {
  let attempts = 0;
  const maxAttempts = 3;
  let success = false;

  while (attempts < maxAttempts && !success) {
    console.log(`\n========================================`);
    console.log(`Running ${script} (Attempt ${attempts + 1}/${maxAttempts})...`);
    console.log(`========================================`);
    try {
      execSync(`node scripts/${script}`, { stdio: 'inherit' });
      success = true;
    } catch (error) {
      console.error(`\n[ERROR] ${script} failed on attempt ${attempts + 1}!`);
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Waiting 5 seconds before retrying...`);
        execSync('node -e "setTimeout(() => {}, 5000)"');
      }
    }
  }

  if (!success) {
    console.error(`\n[FATAL ERROR] ${script} failed after ${maxAttempts} attempts. Aborting suite.`);
    failed = true;
    break;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All regression tests passed!');
}
