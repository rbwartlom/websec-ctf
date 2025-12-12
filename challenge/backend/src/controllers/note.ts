/** @file Note business logic (no HTTP concerns) */
import { HydratedDocument } from "mongoose";
import { SafeError } from "../config.js";
import { Note, INote } from "../models/Note.js";
import { CreateNoteInput, UpdateNoteInput } from "../utils/input.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findUserNote(userId: string, noteId: string): Promise<HydratedDocument<INote>> {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new SafeError("Note not found", 404);
  }
  if (note.owner !== userId) {
    throw new SafeError("Note not found", 404); // Don't leak existence
  }
  return note;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function createNote(
  userId: string,
  input: CreateNoteInput
): Promise<INote> {
  const note = await Note.create({
    ...input,
    owner: userId,
  });
  return note.toObject();
}

export async function getUserNotes(userId: string): Promise<INote[]> {
  const notes = await Note.find({ owner: userId });
  return notes.map((n) => n.toObject());
}

export async function getNote(userId: string, noteId: string): Promise<INote> {
  const note = await findUserNote(userId, noteId);
  return note;
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: UpdateNoteInput
): Promise<INote> {
  const note = await findUserNote(userId, noteId);

  if (input.title !== undefined) note.title = input.title;
  if (input.content !== undefined) note.content = input.content;

  await note.save();
  return note;
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const note = await findUserNote(userId, noteId);
  await note.deleteOne();
}

