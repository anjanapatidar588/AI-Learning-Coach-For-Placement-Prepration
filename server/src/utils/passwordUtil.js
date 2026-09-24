import bcrypt from 'bcryptjs';

/**
 * Asynchronously hashes a plain-text password using bcrypt.
 * @param {string} password - Plain-text password to hash
 * @returns {Promise<string>} Hashed password string
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Asynchronously compares a plain-text password with a hashed password.
 * @param {string} plainPassword - Plain-text password input
 * @param {string} hashedPassword - Stored hashed password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(plainPassword, hashedPassword);
};
