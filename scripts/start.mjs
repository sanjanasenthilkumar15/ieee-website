#!/usr/bin/env node
/**
 * Production start: `npm start` (after `npm run build`).
 * Keeps the database and uploads in ./data next to the project (or DATA_DIR)
 * — not inside the build folder, so rebuilding never touches site data.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
try { process.loadEnvFile(".env"); } catch {} // optional .env next to the project

process.env.DATA_DIR ||= path.resolve("data");
process.env.NODE_ENV = "production";
process.env.PORT ||= "3000";
process.env.HOSTNAME ||= "0.0.0.0";
console.log(`IEEE SB RMKEC website — data folder: ${process.env.DATA_DIR}`);
await import(pathToFileURL(path.resolve(".next/standalone/server.js")).href);
