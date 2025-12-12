/** @file Note model with co-located type and guard */
import { model } from "mongoose";
import { defineSchema } from "./schema.js";
import { isRecord } from "../utils/guards.js";

// ─── Interface ───────────────────────────────────────────────────────────────

export interface INote {
  _id: string;
  title: string;
  content: string;
  owner: string;
}

// ─── Type Guard ──────────────────────────────────────────────────────────────

export function isNote(obj: unknown): obj is INote {
  return (
    isRecord(obj) &&
    typeof obj._id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.content === "string" &&
    typeof obj.owner === "string"
  );
}

// ─── Mongoose Model ──────────────────────────────────────────────────────────

const noteSchema = defineSchema<INote>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: String, required: true, ref: "User" },
});

export const Note = model<INote>("Note", noteSchema);
