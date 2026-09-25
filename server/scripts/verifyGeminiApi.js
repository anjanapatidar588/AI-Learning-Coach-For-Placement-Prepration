import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { generateAIResponse } from '../src/services/ai/geminiClient.js';

const runVerification = async () => {
  console.log('[GeminiApiTest] Starting Gemini API Connection Verification...');
  
  const rawKey = process.env.GEMINI_API_KEY;
  const isKeyDetected = !!(
    rawKey &&
    typeof rawKey === 'string' &&
    rawKey.trim().length > 10 &&
    rawKey.trim() !== 'mock_key_for_testing' &&
    rawKey.trim() !== 'your_gemini_api_key_here'
  );

  console.log(`GEMINI_API_KEY detected: ${isKeyDetected ? 'YES' : 'NO'}`);

  if (!isKeyDetected) {
    console.log('Gemini API request: FAILED');
    console.log('Response received: NO');
    console.log('Failure Reason / Category: Missing or placeholder API key in server/.env');
    console.log('\n[GeminiApiTest] VERIFICATION RESULT: FAIL (Missing or unconfigured GEMINI_API_KEY)');
    process.exitCode = 1;
    return;
  }

  const modelUsed = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  console.log(`Model used: ${modelUsed}`);

  let requestSuccess = false;
  let responseReceived = false;
  let safeErrorCategory = '';

  try {
    const responseText = await generateAIResponse({
      persona: 'Career Coach',
      systemPrompt: 'You are a test assistant.',
      userPrompt: 'Reply with exactly: GEMINI_CONNECTION_OK',
      failIfUnavailable: true
    });

    if (responseText && typeof responseText === 'string') {
      requestSuccess = true;
      responseReceived = true;
      
      // Security Check: Verify API key is NOT in response
      if (responseText.includes(rawKey)) {
        throw new Error('SECURITY VIOLATION: GEMINI_API_KEY exposed in response string');
      }
    } else {
      safeErrorCategory = 'Empty response received from provider';
    }
  } catch (err) {
    requestSuccess = false;
    const errMessage = (err.message || '').toLowerCase();

    if (errMessage.includes('api key not valid') || errMessage.includes('invalid') || errMessage.includes('auth')) {
      safeErrorCategory = 'Authentication failure (Invalid GEMINI_API_KEY)';
    } else if (errMessage.includes('quota') || errMessage.includes('429') || errMessage.includes('rate limit')) {
      safeErrorCategory = 'Quota or Rate Limit Exceeded';
    } else if (errMessage.includes('not found') || errMessage.includes('model')) {
      safeErrorCategory = 'Model Unavailable or Unrecognized';
    } else if (errMessage.includes('network') || errMessage.includes('econnrefused') || errMessage.includes('fetch failed')) {
      safeErrorCategory = 'Network Connection Failure';
    } else {
      safeErrorCategory = 'Provider Service Unavailable / Communication Error';
    }
  }

  console.log(`Gemini API request: ${requestSuccess ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Response received: ${responseReceived ? 'YES' : 'NO'}`);

  if (requestSuccess) {
    console.log('\n[GeminiApiTest] VERIFICATION RESULT: PASS');
  } else {
    console.log(`Failure Reason / Category: ${safeErrorCategory}`);
    console.log('\n[GeminiApiTest] VERIFICATION RESULT: FAIL');
    process.exitCode = 1;
  }
};

runVerification();
