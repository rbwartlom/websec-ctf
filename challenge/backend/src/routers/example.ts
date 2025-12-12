import { Router } from "express";
import { handleAsyncErrors } from "../config.js";

const exampleRouter = Router();

/**
 * @openapi
 * example:
 *   get:
 *     tags: [example-tag]
 *     summary: An example endpoint.
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World!"
 */
exampleRouter.get(
  "",
  handleAsyncErrors(async (req, res) => {
    return res.json({
      message: "Hello World! If you see this message, everything is working!",
    });
  })
);

export default exampleRouter;
