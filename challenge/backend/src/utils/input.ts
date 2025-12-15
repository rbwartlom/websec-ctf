/** @file HTTP input types and validators */
import { isRecord, isNonEmptyString } from "./guards.js";

// ─── Signup ──────────────────────────────────────────────────────────────────

export interface SignupInput {
  email: string;
  password: string;
}

export function isSignupInput(obj: unknown): obj is SignupInput {
  return (
    isRecord(obj) &&
    isNonEmptyString(obj.email) &&
    isNonEmptyString(obj.password)
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export function isLoginInput(obj: unknown): obj is LoginInput {
  return (
    isRecord(obj) &&
    isNonEmptyString(obj.email) &&
    isNonEmptyString(obj.password)
  );
}

// ─── Create Note ─────────────────────────────────────────────────────────────

export interface CreateNoteInput {
  title: string;
  content: string;
  isPublic?: boolean;
}

export function isCreateNoteInput(obj: unknown): obj is CreateNoteInput {
  if (!isRecord(obj)) return false;
  if (!isNonEmptyString(obj.title)) return false;
  if (!isNonEmptyString(obj.content)) return false;

  // isPublic is optional, but if present must be boolean
  if ("isPublic" in obj && typeof obj.isPublic !== "boolean") return false;

  return true;
}

// ─── Update Note ─────────────────────────────────────────────────────────────

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export function isUpdateNoteInput(obj: unknown): obj is UpdateNoteInput {
  if (!isRecord(obj)) return false;

  const hasTitle = "title" in obj;
  const hasContent = "content" in obj;
  const hasIsPublic = "isPublic" in obj;

  // Must have at least one field
  if (!hasTitle && !hasContent && !hasIsPublic) return false;

  // If present, must be correct type
  if (hasTitle && !isNonEmptyString(obj.title)) return false;
  if (hasContent && !isNonEmptyString(obj.content)) return false;
  if (hasIsPublic && typeof obj.isPublic !== "boolean") return false;

  return true;
}

// ─── Share Note ──────────────────────────────────────────────────────────────

export interface ShareNoteInput {
  emails: string[];
}

export function isShareNoteInput(obj: unknown): obj is ShareNoteInput {
  return (
    isRecord(obj) &&
    Array.isArray(obj.emails) &&
    obj.emails.length > 0 &&
    obj.emails.every((email) => isNonEmptyString(email))
  );
}

// ─── Unshare Note ────────────────────────────────────────────────────────────

export interface UnshareNoteInput {
  emails: string[];
}

export function isUnshareNoteInput(obj: unknown): obj is UnshareNoteInput {
  return (
    isRecord(obj) &&
    Array.isArray(obj.emails) &&
    obj.emails.length > 0 &&
    obj.emails.every((email) => isNonEmptyString(email))
  );
}
