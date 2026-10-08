export function getJwtKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET is required to sign and verify login tokens.');
  }

  const key = new TextEncoder().encode(secret);
  if (key.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes long.');
  }

  return key;
}
