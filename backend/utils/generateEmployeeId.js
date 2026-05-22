import User from '../models/User.js';

// Generate unique employee ID in format: AT-XXXX where XXXX is a 4-digit number
export const generateUniqueEmployeeId = async () => {
  let employeeId;
  let isUnique = false;

  while (!isUnique) {
    // Generate random 4-digit number (1000-9999)
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    employeeId = `AT-${randomNumber}`;

    // Check if ID already exists
    const existing = await User.findOne({ employeeId });
    if (!existing) {
      isUnique = true;
    }
  }

  return employeeId;
};
