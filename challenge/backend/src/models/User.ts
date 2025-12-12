/** @file User model with co-located type and guard */
import { model } from "mongoose";
import { defineSchema } from "./schema.js";
import { isRecord } from "../utils/guards.js";

// ─── Interface ───────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
}

// ─── Type Guard ──────────────────────────────────────────────────────────────

export function isUser(obj: unknown): obj is IUser {
  return (
    isRecord(obj) &&
    typeof obj._id === "string" &&
    typeof obj.email === "string" &&
    typeof obj.passwordHash === "string"
  );
}

// ─── Mongoose Model ──────────────────────────────────────────────────────────

const userSchema = defineSchema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

export const User = model<IUser>("User", userSchema);
