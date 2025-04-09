// utils/redis-lock.ts
import { Redis } from "@upstash/redis";
import * as crypto from "crypto";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Simple hash function for PINs
function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

// Set a user's PIN
export async function setUserPin(userId: string, pin: string): Promise<void> {
  const hashedPin = hashPin(pin);
  await redis.set(`user:${userId}:pin`, hashedPin);
}

// Verify a user's PIN
export async function verifyUserPin(
  userId: string,
  pin: string,
): Promise<boolean> {
  const storedHash = await redis.get<string>(`user:${userId}:pin`);

  if (!storedHash) {
    return false; // No PIN set
  }

  const inputHash = hashPin(pin);
  return inputHash === storedHash;
}

// Lock a user's account
export async function lockUserAccount(userId: string): Promise<void> {
  await redis.set(`user:${userId}:lock`, "true");
}

// Unlock a user's account
export async function unlockUserAccount(userId: string): Promise<void> {
  await redis.del(`user:${userId}:lock`);
}

// Check if a user's account is locked
export async function isUserLocked(userId: string): Promise<boolean> {
  const lockStatus = await redis.get<string>(`user:${userId}:lock`);
  return lockStatus === "true";
}

// Remove a user's PIN (if they want to disable the lock feature)
export async function removeUserPin(userId: string): Promise<void> {
  await redis.del(`user:${userId}:pin`);
  await redis.del(`user:${userId}:lock`);
}

// Auto-lock timeout (optional)
// Set a timeout after which the account will automatically lock
export async function setAutoLockTimeout(
  userId: string,
  timeoutMinutes: number,
): Promise<void> {
  // Convert minutes to seconds for Redis expiration
  const expirySeconds = timeoutMinutes * 60;

  // Set the expiry on the key
  await redis.set(`user:${userId}:autolock`, "pending", { ex: expirySeconds });

  // When this key expires, an expiration event could trigger the lock
  // For simplicity, we'll check if this key exists in our middleware
}

// Rate limiting for PIN attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60; // 15 minutes in seconds

export async function recordPinAttempt(userId: string): Promise<number> {
  const key = `user:${userId}:attempts`;
  const attempts = await redis.incr(key);

  // Set expiry on first attempt
  if (attempts === 1) {
    await redis.expire(key, LOCKOUT_TIME);
  }

  return attempts;
}

export async function getRemainingAttempts(userId: string): Promise<number> {
  const attempts = (await redis.get<number>(`user:${userId}:attempts`)) || 0;
  return Math.max(0, MAX_ATTEMPTS - attempts);
}

export async function resetPinAttempts(userId: string): Promise<void> {
  await redis.del(`user:${userId}:attempts`);
}
