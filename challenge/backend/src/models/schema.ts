/** @file Schema factory with standardized string IDs */
import crypto from "node:crypto";
import { Schema, SchemaDefinition } from "mongoose";

const generateId = () => crypto.randomUUID();

/** Standard schema factory - all models use string IDs */
export function defineSchema<T>(fields: SchemaDefinition<T>) {
  return new Schema(
    {
      id: { type: String, default: generateId, unique: true },
      ...fields,
    }
  );
}

