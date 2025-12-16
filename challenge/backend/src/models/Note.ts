/** @file Note model with co-located type and guard */
import { model } from "mongoose";
import { defineSchema } from "./schema.js";
import { isRecord } from "../utils/guards.js";

// ─── Interface ───────────────────────────────────────────────────────────────

export interface INote {
  id: string;
  title: string;
  content: string;
  owner: string;
  sharedWith?: string[];
  isPublic: boolean;
}

// ─── Type Guard ──────────────────────────────────────────────────────────────

export function isNote(obj: unknown): obj is INote {
  if (!isRecord(obj)) return false;
  if (typeof obj.id !== "string") return false;
  if (typeof obj.title !== "string") return false;
  if (typeof obj.content !== "string") return false;
  if (typeof obj.owner !== "string") return false;
  if (typeof obj.isPublic !== "boolean") return false;

  // sharedWith is optional, but if present must be array of strings
  if (obj.sharedWith !== undefined) {
    if (!Array.isArray(obj.sharedWith)) return false;
    if (!obj.sharedWith.every((id) => typeof id === "string")) return false;
  }

  return true;
}

// ─── Mongoose Model ──────────────────────────────────────────────────────────

const noteSchema = defineSchema<INote>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: String, required: true, ref: "User" },
  sharedWith: { type: [String], ref: "User", default: undefined },
  isPublic: { type: Boolean, default: false },
});

export const Note = model<INote>("Note", noteSchema);
