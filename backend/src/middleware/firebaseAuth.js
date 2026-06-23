const admin = require('../config/firebase');

/**
 * Middleware to verify Firebase ID tokens sent in the request body.
 * 
 * Usage: For the /google-login route where the client sends a Firebase ID token.
 * This is NOT a replacement for userMiddleware — it's used specifically
 * for the Google login flow.
 * 
 * After verification, attaches decoded token to req.firebaseUser:
 *   - uid: Firebase user ID
 *   - email: User's email
 *   - name: Display name
 *   - picture: Profile photo URL
 *   - emailVerified: Whether email is verified
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(401).json({ message: 'Firebase ID token is required' });
    }

    // Verify the token with Firebase Admin SDK
    // This checks: signature, expiration, audience, issuer
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach decoded user info to request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired. Please sign in again.' });
    }
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ message: 'Token has been revoked. Please sign in again.' });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({ message: 'Invalid token format.' });
    }

    return res.status(401).json({ message: 'Invalid Firebase token' });
  }
};

module.exports = verifyFirebaseToken;
