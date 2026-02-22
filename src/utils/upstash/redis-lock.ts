import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setUserPin(userId: string, pin: string): Promise<void> {
  const hashedPin = await hashPin(pin);
  await redis.set(`user:${userId}:pin`, hashedPin);
}

export async function verifyUserPin(
  userId: string,
  pin: string,
): Promise<boolean> {
  const storedHash = await redis.get<string>(`user:${userId}:pin`);

  if (!storedHash) {
    return false;
  }

  const inputHash = await hashPin(pin);
  return inputHash === storedHash;
}

export async function userHasPin(userId: string): Promise<boolean> {
  const storedHash = await redis.get<string>(`user:${userId}:pin`);
  return storedHash !== null;
}

export async function lockUserAccount(userId: string): Promise<void> {
  await redis.set(`user:${userId}:lock`, "true");
}

export async function unlockUserAccount(userId: string): Promise<void> {
  await redis.del(`user:${userId}:lock`);
}

export async function isUserLocked(userId: string): Promise<boolean> {
  const lockStatus = await redis.get<string | boolean | null>(
    `user:${userId}:lock`,
  );
  return lockStatus === "true" || lockStatus === true;
}

export async function removeUserPin(userId: string): Promise<void> {
  await redis.del(`user:${userId}:pin`);
  await redis.del(`user:${userId}:lock`);
}

// Rate limiting for PIN attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60; // 15 minutes in seconds

export async function recordPinAttempt(userId: string): Promise<number> {
  const key = `user:${userId}:attempts`;
  const attempts = await redis.incr(key);

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
