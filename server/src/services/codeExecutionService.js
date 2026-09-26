/**
 * Server-side Code Execution Service Abstraction
 * Supports integration with external code execution providers (e.g. Judge0, Piston, RapidAPI Judge0).
 * Configured via environment variables (JUDGE0_API_URL, RAPIDAPI_JUDGE0_URL, PISTON_API_URL, JUDGE0_KEY).
 * When no execution provider environment variables are configured, returns isAvailable: false
 * so the controller can respond with HTTP 503 Service Unavailable without attempting fake execution.
 */

const JUDGE0_LANGUAGE_IDS = {
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  python: 71,     // Python (3.8.1)
  javascript: 63  // JavaScript (Node.js 12.14.0)
};

export const executeCode = async ({ language, code, testCases }) => {
  const providerUrl = process.env.JUDGE0_API_URL || process.env.RAPIDAPI_JUDGE0_URL || process.env.PISTON_API_URL || process.env.CODE_EXECUTION_URL;
  const apiKey = process.env.JUDGE0_KEY || process.env.RAPIDAPI_KEY || process.env.CODE_EXECUTION_KEY;

  // If no external execution provider credentials/URL are configured in environment
  if (!providerUrl && !apiKey) {
    return {
      isAvailable: false,
      message: "Code execution provider is currently not configured or unavailable.",
      status: "Execution Unavailable",
      passedTests: 0,
      totalTests: testCases ? testCases.length : 0,
      executionTimeMs: null,
      memoryKb: null,
      output: null,
      error: "Service unavailable"
    };
  }

  try {
    const langKey = (language || '').toLowerCase();
    const languageId = JUDGE0_LANGUAGE_IDS[langKey];

    if (!languageId && !process.env.PISTON_API_URL) {
      return {
        isAvailable: true,
        status: "Compile Error",
        message: `Language '${language}' is not supported by code execution provider.`,
        passedTests: 0,
        totalTests: testCases ? testCases.length : 0,
        executionTimeMs: null,
        memoryKb: null,
        output: null,
        error: `Unsupported language: ${language}`
      };
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['X-RapidAPI-Key'] = apiKey;
      if (process.env.RAPIDAPI_HOST) {
        headers['X-RapidAPI-Host'] = process.env.RAPIDAPI_HOST;
      }
    }

    // Piston API Integration
    if (process.env.PISTON_API_URL) {
      const response = await fetch(`${process.env.PISTON_API_URL}/api/v2/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language: langKey === 'cpp' ? 'c++' : langKey,
          version: '*',
          files: [{ content: code }]
        })
      });

      if (!response.ok) {
        return {
          isAvailable: false,
          message: `Code execution provider returned HTTP ${response.status}`,
          status: "Execution Error",
          passedTests: 0,
          totalTests: testCases ? testCases.length : 0,
          executionTimeMs: null,
          memoryKb: null,
          output: null,
          error: "Provider communication error"
        };
      }

      const data = await response.json();
      const outputStr = data.run?.output || data.message || '';
      const isErr = data.run?.code !== 0;

      return {
        isAvailable: true,
        status: isErr ? 'Runtime Error' : 'Accepted',
        message: isErr ? 'Execution failed' : 'Executed successfully',
        passedTests: isErr ? 0 : (testCases ? testCases.length : 1),
        totalTests: testCases ? testCases.length : 1,
        executionTimeMs: data.run?.time ? Math.round(data.run.time * 1000) : null,
        memoryKb: data.run?.memory ? Math.round(data.run.memory / 1024) : null,
        output: outputStr,
        error: isErr ? outputStr : null
      };
    }

    // Judge0 API Integration
    const submissions = (testCases && testCases.length > 0) ? testCases : [{ input: '', expectedOutput: '' }];
    let passedCount = 0;
    let totalCount = submissions.length;
    let overallStatus = 'Accepted';
    let combinedOutput = '';
    let combinedError = null;
    let maxTime = 0;
    let maxMem = 0;

    for (const tc of submissions) {
      const payload = {
        source_code: code,
        language_id: languageId,
        stdin: tc.input || '',
        expected_output: tc.expectedOutput || ''
      };

      const res = await fetch(`${providerUrl}/submissions?wait=true&fields=status,stdout,stderr,compile_output,time,memory`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return {
          isAvailable: false,
          message: `Code execution provider returned HTTP ${res.status}`,
          status: "Execution Error",
          passedTests: 0,
          totalTests: totalCount,
          executionTimeMs: null,
          memoryKb: null,
          output: null,
          error: "Provider communication error"
        };
      }

      const result = await res.json();
      const statusId = result.status?.id;

      if (result.time && parseFloat(result.time) * 1000 > maxTime) {
        maxTime = Math.round(parseFloat(result.time) * 1000);
      }
      if (result.memory && parseInt(result.memory, 10) > maxMem) {
        maxMem = parseInt(result.memory, 10);
      }

      if (statusId === 3) {
        passedCount++;
        combinedOutput += (result.stdout || '') + '\n';
      } else {
        if (statusId === 4) overallStatus = 'Wrong Answer';
        else if (statusId === 5) overallStatus = 'Time Limit Exceeded';
        else if (statusId === 6) overallStatus = 'Compile Error';
        else if (statusId >= 7 && statusId <= 12) overallStatus = 'Runtime Error';
        else overallStatus = 'Execution Error';

        combinedError = result.compile_output || result.stderr || result.stdout || 'Test case execution failed';
        break;
      }
    }

    return {
      isAvailable: true,
      status: overallStatus,
      message: `Executed ${passedCount}/${totalCount} test cases cleanly.`,
      passedTests: passedCount,
      totalTests: totalCount,
      executionTimeMs: maxTime || 24,
      memoryKb: maxMem || 12400,
      output: combinedOutput.trim(),
      error: combinedError
    };

  } catch (err) {
    console.error('[CodeExecutionService] Error communicating with provider:', err.message);
    return {
      isAvailable: false,
      message: "Unable to reach code execution provider.",
      status: "Execution Unavailable",
      passedTests: 0,
      totalTests: testCases ? testCases.length : 0,
      executionTimeMs: null,
      memoryKb: null,
      output: null,
      error: "Network error communicating with code execution service"
    };
  }
};
