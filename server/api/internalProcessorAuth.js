const crypto = require('node:crypto');

function secretMatches(provided, expected) {
  if (!provided || !expected) return false;
  const providedDigest = crypto.createHash('sha256').update(String(provided)).digest();
  const expectedDigest = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

function isAuthorizedCron(header, expectedSecret) {
  const match = /^Bearer\s+(.+)$/i.exec(String(header || ''));
  return Boolean(match && secretMatches(match[1], expectedSecret));
}

module.exports = { secretMatches, isAuthorizedCron };
