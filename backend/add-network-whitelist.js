import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NetworkWhitelist from './models/NetworkWhitelist.js';

dotenv.config();

const addNetworkWhitelist = async (ipRange, description) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const whitelist = await NetworkWhitelist.create({
      ipRange,
      description: description || 'Office network',
      enabled: true
    });

    console.log('✅ IP added to whitelist successfully:');
    console.log(whitelist);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding to whitelist:', error.message);
    process.exit(1);
  }
};

// Get IP from command line argument
const ipRange = process.argv[2];
const description = process.argv[3] || 'Office network';

if (!ipRange) {
  console.log('❌ Please provide an IP address or IP range');
  console.log('Usage: node add-network-whitelist.js <IP> [description]');
  console.log('Example: node add-network-whitelist.js 203.0.113.0/24 "Office WiFi"');
  process.exit(1);
}

addNetworkWhitelist(ipRange, description);
