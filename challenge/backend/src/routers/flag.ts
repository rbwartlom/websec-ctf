/** @file Flag route (HTTP layer only) */
import { Router } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { handleAsyncErrors, SafeError } from "../config.js";
import { isNonEmptyString, isRecord } from "../utils/guards.js";
import { verifyPassword } from "../utils/password.js";

const execFileAsync = promisify(execFile);

const flagRouter = Router();

/**
 * Gets the FLAG_PASSWORD hash lazily (at request time, not module load time).
 */
function getFlagPasswordHash(): string {
  const hash = process.env.FLAG_PASSWORD;
  if (!isNonEmptyString(hash)) {
    throw new SafeError("Flag password not configured", 500);
  }
  return hash;
}

/**
 * Type guard for flag request body
 */
function isFlagInput(body: unknown): body is { password: string } {
  if (!isRecord(body)) return false;
  return isNonEmptyString(body.password);
}

/**
 * @openapi
 * /api/flag:
 *   post:
 *     tags: [Flag]
 *     summary: Get the flag if password is correct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Flag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flag:
 *                   type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Invalid password
 *       500:
 *         description: Failed to execute flag command
 */
flagRouter.post(
  "/",
  handleAsyncErrors(async (req, res) => {
    if (!isFlagInput(req.body)) {
      throw new SafeError("Invalid request body", 400);
    }

    const flagPasswordHash = getFlagPasswordHash();
    const valid = await verifyPassword(req.body.password, flagPasswordHash);
    if (!valid) {
      throw new SafeError("Invalid password", 401);
    }

    try {
      const { stdout } = await execFileAsync("/bin/get_flag");
      res.json({ flag: stdout.trim() });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to execute flag command";
      throw new SafeError(message, 500);
    }
  })
);

export default flagRouter;
