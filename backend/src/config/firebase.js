const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

// Load service account credentials
// In production (Vercel/Render), use FIREBASE_SERVICE_ACCOUNT env var
// containing the JSON string. In development, load from file.
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Service account JSON stored as environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Development: Load from file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  serviceAccount = require(path.resolve(serviceAccountPath));
}

// Initialize Firebase Admin (singleton — safe to call once)
admin.initializeApp({
  credential: admin.cert(serviceAccount),
  projectId: 'algobench-4fca6',
});

// Export the Auth instance (v14 API)
const auth = getAuth();

module.exports = auth;
