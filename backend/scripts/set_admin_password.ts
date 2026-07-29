import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../src/models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/inventory-db';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function run() {
  await mongoose.connect(MONGODB_URL);
  console.log('Connected to MongoDB');
  const user = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    console.error('Admin user not found:', ADMIN_EMAIL);
    process.exit(1);
  }
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  user.password = hashed;
  user.role = 'admin';
  await user.save();
  console.log(`Password set for ${ADMIN_EMAIL}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
