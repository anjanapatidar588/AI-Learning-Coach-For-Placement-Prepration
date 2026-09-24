import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token.
 * @param {object} payload - Data payload to encode (e.g. { id, role })
 * @param {string} expiresIn - Token validity duration (default: '30d')
 * @returns {string} JWT token string
 */
export const generateToken = (payload, expiresIn = '30d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifies a JWT token.
 * @param {string} token - Token string to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return jwt.verify(token, secret);
};
