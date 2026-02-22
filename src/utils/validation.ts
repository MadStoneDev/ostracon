/**
 * Validates community name format for URL slugs
 * Format: lowercase letters, numbers, and hyphens only
 * Length: 3-50 characters
 */
export function isValidCommunityName(name: string): boolean {
  // Must be 3-50 characters
  if (name.length < 3 || name.length > 50) {
    return false;
  }

  // Must match pattern: lowercase letters, numbers, hyphens
  // Cannot start or end with hyphen
  const pattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return pattern.test(name);
}

/**
 * Sanitizes a string to be a valid community name
 * Converts to lowercase, replaces spaces/special chars with hyphens
 */
export function sanitizeCommunityName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 50); // Enforce max length
}

/**
 * Validates username format
 * Format: letters, numbers, and underscores only
 * Length: 3-30 characters
 */
export function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 30) {
    return false;
  }

  const pattern = /^[a-zA-Z0-9_]+$/;
  return pattern.test(username);
}

/**
 * Get error message for invalid community name
 */
export function getCommunityNameError(name: string): string | null {
  if (!name || name.length === 0) {
    return "Community name is required";
  }

  if (name.length < 3) {
    return "Community name must be at least 3 characters";
  }

  if (name.length > 50) {
    return "Community name must be 50 characters or less";
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return "Community name can only contain lowercase letters, numbers, and hyphens";
  }

  if (name.startsWith("-") || name.endsWith("-")) {
    return "Community name cannot start or end with a hyphen";
  }

  if (name.includes("--")) {
    return "Community name cannot contain consecutive hyphens";
  }

  return null;
}

/**
 * Get error message for invalid username
 */
export function getUsernameError(username: string): string | null {
  if (!username || username.length === 0) {
    return "Username is required";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username.length > 30) {
    return "Username must be 30 characters or less";
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }

  return null;
}

/**
 * Reserved names that cannot be used as usernames or community names
 */
const RESERVED_NAMES = [
  "admin",
  "api",
  "app",
  "auth",
  "blog",
  "connect",
  "create",
  "delete",
  "edit",
  "explore",
  "help",
  "home",
  "messages",
  "new",
  "notifications",
  "post",
  "profile",
  "search",
  "settings",
  "support",
  "system",
  "user",
  "users",
];

/**
 * Check if community name is reserved
 */
export function isReservedCommunityName(name: string): boolean {
  return RESERVED_NAMES.includes(name.toLowerCase());
}

/**
 * Check if username is reserved
 */
export function isReservedUsername(name: string): boolean {
  return RESERVED_NAMES.includes(name.toLowerCase());
}
