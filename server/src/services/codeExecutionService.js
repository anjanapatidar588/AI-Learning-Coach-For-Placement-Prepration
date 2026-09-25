export const executeCode = async ({ language, code, testCases }) => {
  // Currently, a real external execution provider is not configured.
  // We should not pretend a real execution happened.
  // Keep the service boundary ready for Judge0/Piston integration later.

  return {
    isAvailable: false,
    message: "Code execution provider is currently not configured.",
    status: "Execution Unavailable",
    passedTests: 0,
    totalTests: testCases ? testCases.length : 0,
    executionTimeMs: null,
    memoryKb: null,
    output: null,
    error: "Service unavailable"
  };
};
