/** @file User routes (HTTP layer only) */
import { Router } from "express";
import { handleAsyncErrors, SafeError } from "../config.js";
import { requireAuth } from "../auth.js";
import { isSignupInput, isLoginInput } from "../utils/input.js";
import { signupUser, loginUser, getMe, deleteMe } from "../controllers/user.js";
import "../types.js"; // Ensure Express augmentation is loaded

const usersRouter = Router();

/**
 * @openapi
 * /api/users/signup:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid request body
 *       409:
 *         description: Email already in use
 */
usersRouter.post(
  "/signup",
  handleAsyncErrors(async (req, res) => {
    if (!isSignupInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }
    const result = await signupUser(req.body);
    res.status(201).json(result);
  })
);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
usersRouter.post(
  "/login",
  handleAsyncErrors(async (req, res) => {
    if (!isLoginInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }
    const result = await loginUser(req.body);
    res.json(result);
  })
);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
usersRouter.get(
  "/me",
  requireAuth,
  handleAsyncErrors(async (req, res) => {
    if (req.userId === undefined) {
      throw new SafeError("Unauthorized", 401);
    }
    const user = await getMe(req.userId);
    res.json(user);
  })
);

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Delete current user profile (GDPR)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
usersRouter.delete(
  "/me",
  requireAuth,
  handleAsyncErrors(async (req, res) => {
    if (req.userId === undefined) {
      throw new SafeError("Unauthorized", 401);
    }
    await deleteMe(req.userId);
    res.status(204).send();
  })
);

export default usersRouter;
