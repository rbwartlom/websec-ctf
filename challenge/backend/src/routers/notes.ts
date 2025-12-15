/** @file Note routes (HTTP layer only) */
import { Request, Router } from "express";
import { handleAsyncErrors, SafeError } from "../config.js";
import { requireAuth } from "../auth.js";
import {
  isCreateNoteInput,
  isUpdateNoteInput,
  isShareNoteInput,
  isUnshareNoteInput,
} from "../utils/input.js";
import {
  createNote,
  getUserNotes,
  getNote,
  updateNote,
  deleteNote,
  shareNote,
  unshareNote,
  getPaginatedPublicNotes,
  getPublicNote,
} from "../controllers/note.js";
import "../types.js"; // Ensure Express augmentation is loaded

const notesRouter = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Helper to get noteId from params */
function getNoteId(params: { id?: string }): string {
  if (typeof params.id !== "string" || params.id.length === 0) {
    throw new SafeError("Invalid note ID", 400);
  }
  return params.id;
}

/**
 * Extracts userId from an authenticated request.
 * Uses the `userId` property added to Express.Request via types.ts augmentation.
 * @throws SafeError if userId is missing (should not happen after requireAuth)
 */
function getUserId(req: Request): string {
  if (req.userId === undefined) {
    throw new SafeError("Unauthorized", 401);
  }
  return req.userId;
}

// ─── Public Routes (no auth required) ────────────────────────────────────────

/**
 * @openapi
 * /api/notes/public:
 *   get:
 *     tags: [Notes]
 *     summary: List public notes with cursor-based pagination
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Base64-encoded cursor for pagination
 *     responses:
 *       200:
 *         description: Paginated list of public notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                   description: Cursor for the next page, null if no more results
 */
notesRouter.get(
  "/public",
  handleAsyncErrors(async (req, res) => {
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const result = await getPaginatedPublicNotes(cursor);
    res.json(result);
  })
);

/**
 * @openapi
 * /api/notes/public/{id}:
 *   get:
 *     tags: [Notes]
 *     summary: Get a single public note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public note details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found or not public
 */
notesRouter.get(
  "/public/:id",
  handleAsyncErrors(async (req, res) => {
    const note = await getPublicNote(getNoteId(req.params));
    res.json(note);
  })
);

// ─── Protected Routes (auth required) ────────────────────────────────────────

notesRouter.use(requireAuth);

/**
 * @openapi
 * /api/notes:
 *   post:
 *     tags: [Notes]
 *     summary: Create a new note
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the note should be publicly accessible
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 */
notesRouter.post(
  "/",
  handleAsyncErrors(async (req, res) => {
    if (!isCreateNoteInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }
    const note = await createNote(getUserId(req), req.body);
    res.status(201).json(note);
  })
);

/**
 * @openapi
 * /api/notes:
 *   get:
 *     tags: [Notes]
 *     summary: List all notes for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 */
notesRouter.get(
  "/",
  handleAsyncErrors(async (req, res) => {
    const notes = await getUserNotes(getUserId(req));
    res.json(notes);
  })
);

/**
 * @openapi
 * /api/notes/{id}:
 *   get:
 *     tags: [Notes]
 *     summary: Get a single note
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
notesRouter.get(
  "/:id",
  handleAsyncErrors(async (req, res) => {
    const note = await getNote(getUserId(req), getNoteId(req.params));
    res.json(note);
  })
);

/**
 * @openapi
 * /api/notes/{id}:
 *   put:
 *     tags: [Notes]
 *     summary: Update a note
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the note should be publicly accessible
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
notesRouter.put(
  "/:id",
  handleAsyncErrors(async (req, res) => {
    if (!isUpdateNoteInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }
    const note = await updateNote(getUserId(req), getNoteId(req.params), req.body);
    res.json(note);
  })
);

/**
 * @openapi
 * /api/notes/{id}:
 *   delete:
 *     tags: [Notes]
 *     summary: Delete a note
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Note deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
notesRouter.delete(
  "/:id",
  handleAsyncErrors(async (req, res) => {
    await deleteNote(getUserId(req), getNoteId(req.params));
    res.status(204).send();
  })
);

/**
 * @openapi
 * /api/notes/{id}/share:
 *   post:
 *     tags: [Notes]
 *     summary: Share a note with other users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emails]
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user emails to share with
 *     responses:
 *       200:
 *         description: Note shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid request body or cannot share with yourself
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note or user not found
 */
notesRouter.post(
  "/:id/share",
  handleAsyncErrors(async (req, res) => {
    if (!isShareNoteInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }
    const note = await shareNote(getUserId(req), getNoteId(req.params), req.body);
    res.json(note);
  })
);

/**
 * @openapi
 * /api/notes/{id}/unshare:
 *   post:
 *     tags: [Notes]
 *     summary: Remove sharing from specific users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emails]
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user emails to remove from sharing
 *     responses:
 *       200:
 *         description: Note unshared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
notesRouter.post(
  "/:id/unshare",
  handleAsyncErrors(async (req, res) => {
    if (!isUnshareNoteInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }
    const note = await unshareNote(getUserId(req), getNoteId(req.params), req.body);
    res.json(note);
  })
);

/**
 * @openapi
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         owner:
 *           type: string
 *         sharedWith:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs the note is shared with
 *         isPublic:
 *           type: boolean
 *           description: Whether the note is publicly accessible
 */

export default notesRouter;
