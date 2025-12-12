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
}

export function isCreateNoteInput(obj: unknown): obj is CreateNoteInput {
  return (
    isRecord(obj) &&
    isNonEmptyString(obj.title) &&
    isNonEmptyString(obj.content)
  );
}

// ─── Update Note ─────────────────────────────────────────────────────────────

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export function isUpdateNoteInput(obj: unknown): obj is UpdateNoteInput {
  if (!isRecord(obj)) return false;

  const hasTitle = "title" in obj;
  const hasContent = "content" in obj;

  // Must have at least one field
  if (!hasTitle && !hasContent) return false;

  // If present, must be non-empty string
  if (hasTitle && !isNonEmptyString(obj.title)) return false;
  if (hasContent && !isNonEmptyString(obj.content)) return false;

  return true;
}
