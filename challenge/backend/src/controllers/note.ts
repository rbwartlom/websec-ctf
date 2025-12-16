/** @file Note business logic (no HTTP concerns) */
import { HydratedDocument, QueryFilter } from "mongoose";
import { SafeError } from "../config.js";
import { Note, INote } from "../models/Note.js";
import { User } from "../models/User.js";
import {
  CreateNoteInput,
  UpdateNoteInput,
  ShareNoteInput,
  UnshareNoteInput,
} from "../utils/input.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Find a note that the user owns (for write operations) */
async function findOwnedNote(
  userId: string,
  noteId: string
): Promise<HydratedDocument<INote>> {
  const note = await Note.findOne({ id: noteId });
  if (!note || note.owner !== userId) {
    throw new SafeError("Note not found", 404);
  }
  return note;
}

/** Find a note that the user can access (owns or shared with) */
async function findAccessibleNote(
  userId: string,
  noteId: string
): Promise<HydratedDocument<INote>> {
  const note = await Note.findOne({
    id: noteId,
    $or: [{ owner: userId }, { sharedWith: userId }],
  });
  if (!note) {
    throw new SafeError("Note not found", 404);
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
  // Only return notes owned by the user
  const notes = await Note.find({ owner: userId });
  // Map sharedWith IDs to emails for display
  const results: INote[] = [];
  for (const n of notes) {
    results.push(await noteWithEmailSharing(n.toObject()));
  }
  return results;
}

export async function getNote(userId: string, noteId: string): Promise<INote> {
  const note = await findAccessibleNote(userId, noteId);
  return noteWithEmailSharing(note.toObject());
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: UpdateNoteInput
): Promise<INote> {
  // Only owner can update the note
  const note = await findOwnedNote(userId, noteId);

  if (input.title !== undefined) note.title = input.title;
  if (input.content !== undefined) note.content = input.content;
  if (input.isPublic !== undefined) note.isPublic = input.isPublic;

  await note.save();
  return noteWithEmailSharing(note.toObject());
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<void> {
  // Only owner can delete the note
  const note = await findOwnedNote(userId, noteId);
  await note.deleteOne();
}

// ─── Sharing ─────────────────────────────────────────────────────────────────

/** Look up user by email and return their ID */
async function getUserIdByEmail(email: string): Promise<string> {
  const user = await User.findOne({ email });
  if (!user) {
    throw new SafeError(`User with email ${email} not found`, 404);
  }
  return user.id;
}

/** Look up user by ID and return their email */
async function getUserEmailById(userId: string): Promise<string | null> {
  const user = await User.findOne({ id: userId });
  return user?.email ?? null;
}

/** Map user IDs to emails for display */
async function mapIdsToEmails(userIds: string[]): Promise<string[]> {
  const emails: string[] = [];
  // such beautiful code thank you claude <3
  for (const userId of userIds) {
    const email = await getUserEmailById(userId);
    if (email) {
      emails.push(email);
    }
  }
  return emails;
}

/** Convert note with user ID sharedWith to email sharedWith for response */
async function noteWithEmailSharing(note: INote): Promise<INote> {
  if (!note.sharedWith || note.sharedWith.length === 0) {
    return note;
  }
  const emails = await mapIdsToEmails(note.sharedWith);
  return { ...note, sharedWith: emails.length > 0 ? emails : undefined };
}

export async function shareNote(
  userId: string,
  noteId: string,
  input: ShareNoteInput
): Promise<INote> {
  // Only owner can share the note
  const note = await findOwnedNote(userId, noteId);

  // Look up current user's email
  const currentUserEmail = await getUserEmailById(userId);

  // Convert emails to user IDs and validate
  const targetUserIds: string[] = [];
  for (const email of input.emails) {
    // Cannot share with yourself
    if (email === currentUserEmail) {
      throw new SafeError("Cannot share note with yourself", 400);
    }
    const targetUserId = await getUserIdByEmail(email);
    targetUserIds.push(targetUserId);
  }

  // Add new users to sharedWith (avoid duplicates)
  const existingSet = new Set(note.sharedWith ?? []);
  for (const targetUserId of targetUserIds) {
    existingSet.add(targetUserId);
  }
  note.sharedWith = Array.from(existingSet);

  await note.save();
  return noteWithEmailSharing(note.toObject());
}

export async function unshareNote(
  userId: string,
  noteId: string,
  input: UnshareNoteInput
): Promise<INote> {
  // Only owner can unshare the note
  const note = await findOwnedNote(userId, noteId);

  // Convert emails to user IDs
  const removeIds: string[] = [];
  for (const email of input.emails) {
    try {
      const targetUserId = await getUserIdByEmail(email);
      removeIds.push(targetUserId);
    } catch {
      // Ignore if user not found - might have been deleted
    }
  }

  // Remove users from sharedWith
  const removeSet = new Set(removeIds);
  const currentSharedWith = note.sharedWith ?? [];
  const newSharedWith = currentSharedWith.filter((id) => !removeSet.has(id));
  note.sharedWith = newSharedWith.length > 0 ? newSharedWith : undefined;

  await note.save();
  return noteWithEmailSharing(note.toObject());
}

// ─── Public Notes ────────────────────────────────────────────────────────────

export async function getPublicNote(noteId: string): Promise<INote> {
  const note = await Note.findOne({ id: noteId });
  if (!note || !note.isPublic) {
    throw new SafeError("Note not found", 404);
  }
  return note.toObject();
}

// ─── Cursor-based Pagination ──────────────────────────────────────────────────
// I've heard that cursor-based pagination is the best way to paginate for scalable distributed system like this one,
// so here's my generic implementation. I think this is some amazing code.
// https://medium.com/@maryam-bit/offset-vs-cursor-based-pagination-choosing-the-best-approach-2e93702a118b

interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | undefined;
}

/**
 * Cursor-based pagination with filter callback
 * @param cursor - the base64-encoded cursor to start from
 * @param limit - the maximum number of items to return
 * @param filter - filter predicate applied on the server-side
 * @param mongoFilter - filter applied on the database-side
 */
async function paginateNotes(
  cursor: string | undefined,
  limit: number,
  filter: (note: INote) => boolean | Promise<boolean>,
  mongoFilter: QueryFilter<INote> = {}
): Promise<PaginatedResult<INote>> {
  const items: INote[] = [];
  let afterId = cursor ? Buffer.from(cursor, "base64").toString() : undefined;

  while (items.length < limit) {
    const batch = await Note.find(
      afterId ? { id: { $gt: afterId }, ...mongoFilter } : mongoFilter
    )
      .sort({ id: 1 })
      .limit(limit * 2);

    if (batch.length === 0) break;

    for (const doc of batch) {
      const note = doc.toObject();
      if (await filter(note)) {
        items.push(note);
        if (items.length >= limit) break;
      }
    }

    afterId = batch[batch.length - 1].id;
  }

  return {
    items,
    nextCursor: (afterId && items.length > 0) ? Buffer.from(afterId).toString("base64") : undefined,
  };
}

export async function getPaginatedPublicNotes(
  cursor: string | undefined
): Promise<PaginatedResult<INote>> {
  return paginateNotes(cursor, 100, (note) => note.isPublic);
}

export async function getPaginatedRegexNotes(
  userId: string,
  cursor: string | undefined,
  limit: number,
  regex: string
): Promise<PaginatedResult<INote>> {
  return paginateNotes(cursor, limit, (note) => note.owner === userId, {
    title: { $regex: regex },
  });
}
