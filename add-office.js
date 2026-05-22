import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Office from './backend/models/Office.js';

dotenv.config();

const addOffice = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const office = await Office.create({
      name: 'Sahibzada Ajit Singh Nagar Office',
      city: 'Sahibzada Ajit Singh Nagar',
      state: 'Punjab',
      country: 'India',
      address: '3rd Floor, C-127, Phase-8, Industrial Area, Sector 73, Sahibzada Ajit Singh Nagar, Punjab 160071',
      zipCode: '160071',
      latitude: 30.6394,
      longitude: 76.8106,
      radius: 100,
      isActive: true
    });

    console.log('✅ Office added successfully:');
    console.log(office);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding office:', error.message);
    process.exit(1);
  }
};

addOffice();
