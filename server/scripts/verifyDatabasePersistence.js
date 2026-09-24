import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';

export const runPersistenceSmokeTest = async () => {
  console.log('[SmokeTest] Initializing MongoDB Atlas persistence verification...');
  let testUserId = null;

  try {
    // 1. Connect using existing connectDB handler
    const conn = await connectDB();
    const dbName = conn.connection.name;
    console.log(`[SmokeTest] Connected host: ${conn.connection.host}`);
    console.log(`[SmokeTest] Target database name: ${dbName}`);

    if (dbName !== 'ai_placement_coach') {
      throw new Error(`Target database name is '${dbName}', expected 'ai_placement_coach'`);
    }

    // 2. CREATE: Temporary test user document
    const testEmail = `database-test-${Date.now()}@example.invalid`;
    console.log(`[SmokeTest] 1. CREATE: Saving temporary test document with email: ${testEmail}...`);
    
    const createdUser = await User.create({
      name: 'Temp Persistence Tester',
      email: testEmail,
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz0123456789PassHashTest',
      role: 'student',
      targetCompanies: ['TestCo'],
      targetRole: 'Test Engineer'
    });

    testUserId = createdUser._id;
    console.log(`[SmokeTest] CREATE SUCCESS: Document saved with _id: ${testUserId}`);

    // 3. READ: Retrieve same document by _id
    console.log(`[SmokeTest] 2. READ: Fetching document by _id: ${testUserId}...`);
    const retrievedUser = await User.findById(testUserId);

    if (!retrievedUser) {
      throw new Error(`READ FAILED: Could not retrieve document with _id: ${testUserId}`);
    }

    if (retrievedUser.email !== testEmail) {
      throw new Error(`READ MISMATCH: Retrieved email '${retrievedUser.email}' does not match inserted email '${testEmail}'`);
    }

    console.log(`[SmokeTest] READ SUCCESS: Document retrieved and matches inserted fields cleanly.`);

    // 4. DELETE: Remove ONLY exact temporary test document by _id
    console.log(`[SmokeTest] 3. DELETE: Removing temporary document _id: ${testUserId}...`);
    const deleteResult = await User.deleteOne({ _id: testUserId });

    if (deleteResult.deletedCount !== 1) {
      throw new Error(`DELETE FAILED: Expected 1 deleted document, got ${deleteResult.deletedCount}`);
    }

    console.log(`[SmokeTest] DELETE SUCCESS: Document _id ${testUserId} removed.`);

    // 5. POST-DELETE CHECK: Verify document no longer exists
    console.log(`[SmokeTest] 4. POST-DELETE VERIFICATION: Checking persistence cleanup...`);
    const postDeleteCheck = await User.findById(testUserId);

    if (postDeleteCheck !== null) {
      throw new Error(`POST-DELETE CHECK FAILED: Document _id ${testUserId} still exists in MongoDB Atlas!`);
    }

    console.log(`[SmokeTest] POST-DELETE CHECK SUCCESS: Confirmed no document remains in Atlas.`);
    console.log('[SmokeTest] === PERSISTENCE SMOKE TEST FULLY PASSED ===');

    await mongoose.disconnect();
    return { success: true, dbName };
  } catch (error) {
    console.error(`[SmokeTest] SMOKE TEST FAILED: ${error.message}`);
    
    // Safety cleanup attempt if document was created but subsequent step failed
    if (testUserId) {
      try {
        await User.deleteOne({ _id: testUserId });
        console.log(`[SmokeTest] Emergency cleanup deleted document _id: ${testUserId}`);
      } catch (cleanupErr) {
        console.error(`[SmokeTest] Emergency cleanup error: ${cleanupErr.message}`);
      }
    }

    await mongoose.disconnect().catch(() => {});
    return { success: false, error: error.message };
  }
};

// Run script if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('verifyDatabasePersistence.js')) {
  runPersistenceSmokeTest().then((res) => {
    process.exit(res.success ? 0 : 1);
  });
}
