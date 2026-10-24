const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING');

  if (!isPlaceholder) {
    try {
      console.log('Attempting to connect to configured MongoDB URI...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to configured MONGO_URI:', err.message);
      console.log('🔄 Falling back to embedded in-memory MongoDB for seamless development...');
    }
  } else {
    console.log('ℹ️ No external MongoDB URI provided. Initializing in-memory MongoDB...');
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✅ Connected to Embedded In-Memory MongoDB at ${memoryUri}`);
  } catch (memErr) {
    console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
