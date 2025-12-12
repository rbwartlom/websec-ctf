/** @file User business logic (no HTTP concerns) */
import { SafeError } from "../config.js";
import { User, IUser } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { SignupInput, LoginInput } from "../utils/input.js";

// ─── Validation ──────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email: string): void {
  if (!EMAIL_REGEX.test(email)) {
    throw new SafeError("Invalid email format", 400);
  }
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new SafeError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { _id: string; email: string };
}

export async function signupUser(input: SignupInput): Promise<AuthResponse> {
  validateEmail(input.email);
  validatePassword(input.password);

  const exists = await User.exists({ email: input.email });
  if (exists) {
    throw new SafeError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({ email: input.email, passwordHash });

  const token = signToken({ userId: user._id });
  return { token, user: { _id: user._id, email: user.email } };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new SafeError("Invalid credentials", 401);
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new SafeError("Invalid credentials", 401);
  }

  const token = signToken({ userId: user._id });
  return { token, user: { _id: user._id, email: user.email } };
}

export async function getMe(userId: string): Promise<{ _id: string; email: string }> {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    throw new SafeError("User not found", 404);
  }

  return { _id: user._id, email: user.email };
}
