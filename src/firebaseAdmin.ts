// src/firebaseAdmin.ts
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account file
const serviceAccount = JSON.parse(
  readFileSync(
    join(dirname(__dirname), "config/serviceAccountKey.json"),
    "utf-8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
