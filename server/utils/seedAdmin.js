const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/courseplatform';
    await mongoose.connect(mongoUri);
    console.log('[SeedAdmin] Connected to MongoDB');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log(`[SeedAdmin] Existing user ${adminEmail} updated to 'admin' role.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      const adminUser = await User.create({
        name: 'Lead Platform Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isVerified: true
      });

      console.log('[SeedAdmin] Successfully created new Admin account!');
      console.log(`  ID: ${adminUser._id}`);
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('[SeedAdmin] Error creating admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();

