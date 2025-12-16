/** @file Database initialization - creates admin user, sample notes, and flag password */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { signupUser, deleteMe } from "./controllers/user.js";
import { createNote } from "./controllers/note.js";
import { hashPassword } from "./utils/password.js";
import { User } from "./models/User.js";
import { checkENVs } from "./config.js";
import { connectDB } from "./index.js";

/** Path to store the flag password hash (persists across processes) */
export const FLAG_PASSWORD_FILE = path.join("/tmp", "flag_password_hash");

checkENVs();

const ADMIN_EMAIL = "super-cracked-admin@cracked-devs.com";

/**
 * Initializes the database with admin user, sample notes, and flag password.
 * Writes the hashed flag password to FLAG_PASSWORD_FILE.
 * Idempotent: deletes existing admin user before recreating.
 */
export async function initDatabase(): Promise<void> {

  await connectDB();
  // Delete existing admin user if present (makes this idempotent)
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    await deleteMe(existingAdmin.id);
    console.log("Deleted existing admin user for reinitialization");
  }

  // Generate random flag password
  const flagPassword = crypto.randomBytes(32).toString("hex");

  // Create admin user with random password
  const adminUser = await signupUser({
    email: ADMIN_EMAIL,
    password: crypto.randomBytes(32).toString("hex"),
  });

  // Word lists for generating random note titles
  const w1 = [
    "super", "giga", "mega", "slightly", "ultra", "hyper", "extremely",
    "incredibly", "massively", "ridiculously", "absolutely", "totally",
    "completely", "utterly", "insanely",
  ];
  const w2 = [
    "cracked", "broken", "damaged", "shattered", "fractured", "busted",
    "destroyed", "ruined", "wrecked", "obliterated", "annihilated",
    "demolished", "crushed", "smashed", "cooked",
  ];
  const w3 = [
    "prompt engineers", "devs", "developers",
    "programmers", "coders", "engineers", "architects", "hackers",
    "ninjas", "wizards", "gurus", "masters", "experts", "professionals",
    "specialists", "technicians", "analysts", "consultants",
  ];

  // Create 100 random notes (mix of public and private)
  await Promise.all(
    new Array(100).fill(0).map(async () => {
      const one = w1[Math.floor(Math.random() * w1.length)];
      const two = w2[Math.floor(Math.random() * w2.length)];
      const three = w3[Math.floor(Math.random() * w3.length)];
      await createNote(adminUser.user.id, {
        title: `${one} ${two} ${three}`,
        content: `This is a note about ${one} ${two} ${three}. They really are ${one} ${two}.`,
        isPublic: Math.random() < 0.5,
      });
    })
  );

  // Create private note with flag password (this is what users must find)
  await createNote(adminUser.user.id, {
    title: "No one can see my privates!",
    content: `Good thing this service is secure, so no one can see this private note with my password: ${flagPassword}`,
  });

  // Hash password and write to file (persists across processes)
  const hashedPassword = await hashPassword(flagPassword);
  fs.writeFileSync(FLAG_PASSWORD_FILE, hashedPassword, "utf-8");

  console.log("Database initialized with admin user and notes");
  console.log(`Flag password hash written to ${FLAG_PASSWORD_FILE}`);
}


initDatabase().then(() => {
  console.log("Database initialized");
  process.exit(0);
}).catch((error) => {
  console.error("Error initializing database:", error);
  process.exit(1);
});