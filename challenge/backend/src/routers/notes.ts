/** @file Note routes (HTTP layer only) */
import { Router } from "express";
import { handleAsyncErrors, SafeError } from "../config.js";
import { requireAuth } from "../auth.js";
import { isCreateNoteInput, isUpdateNoteInput } from "../utils/input.js";
import {
  createNote,
  getUserNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/note.js";

const notesRouter = Router();

// All routes require authentication
notesRouter.use(requireAuth);

/** Helper to get userId from authenticated request */
function getUserId(req: { userId?: string }): string {
  if (!req.userId) {
    throw new SafeError("Unauthorized", 401);
  }
  return req.userId;
}

/** Helper to get noteId from params */
function getNoteId(params: { id?: string }): string {
  if (typeof params.id !== "string" || params.id.length === 0) {
    throw new SafeError("Invalid note ID", 400);
  }
  return params.id;
}

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
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         owner:
 *           type: string
 */

export default notesRouter;
