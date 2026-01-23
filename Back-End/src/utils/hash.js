import crypto from 'crypto';

/**
 * Generates a SHA-256 hash from a file buffer.
 * @param {Buffer} buffer 
 * @returns {string} Hex hash string
 */
export const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
