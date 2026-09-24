import mongoose from 'mongoose';
import dns from 'dns';

// Ensure standard DNS resolvers (8.8.8.8 / 1.1.1.1) for MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS override errors if in restricted environment
}

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_placement_coach';
    
    // Connect to MongoDB / Atlas
    const conn = await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}`);
    console.log(`[Database] Active Database Name: ${conn.connection.name}`);

    if (conn.connection.name !== 'ai_placement_coach') {
      console.warn(`[Database] Warning: Active database is '${conn.connection.name}', expected 'ai_placement_coach'.`);
    }

    return conn;
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    throw error;
  }
};
