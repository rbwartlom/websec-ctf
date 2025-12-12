/** @file Password hashing and verification */
import crypto from "node:crypto";

const SCRYPT_KEYLEN = 64;
const SCRYPT_SALT_BYTES = 16;

function scryptAsync(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

/**
 * Hashes a password using scrypt.
 * Format: `scrypt$<saltBase64>$<derivedKeyBase64>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SCRYPT_SALT_BYTES);
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

/**
 * Verifies a password against a hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "base64");
  const storedKey = parts[2];
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN);

  return crypto.timingSafeEqual(
    Buffer.from(storedKey, "base64"),
    derivedKey
  );
}
