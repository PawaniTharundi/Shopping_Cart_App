const crypto = require("crypto");
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasskeyChallenge = require("../models/PasskeyChallenge");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { isoBase64URL } = require("@simplewebauthn/server/helpers");

const router = express.Router();

// Helper to set JWT cookie
const setTokenCookie = (res, userId, isAdmin) => {
  const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ---------- Google OAuth (only if credentials exist) ----------
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            name: profile.displayName,
            authProvider: "google",
          });
          await user.save();
        }
        return done(null, user);
      },
    ),
  );
  console.log("Google OAuth enabled");
} else {
  console.log("Google OAuth disabled - missing credentials");
}

router.get(
  "/google",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: "Google OAuth not configured" });
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: "Google OAuth not configured" });
    }
    next();
  },
  passport.authenticate("google", { session: false }),
  (req, res) => {
    setTokenCookie(res, req.user._id, req.user.isAdmin);
    res.redirect(process.env.FRONTEND_URL);
  },
);

// ---------- Facebook OAuth (only if credentials exist) ----------
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            name: profile.displayName,
            authProvider: "facebook",
          });
          await user.save();
        }
        return done(null, user);
      },
    ),
  );
  console.log("Facebook OAuth enabled");
} else {
  console.log("Facebook OAuth disabled - missing credentials");
}

router.get(
  "/facebook",
  (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID) {
      return res.status(503).json({ error: "Facebook OAuth not configured" });
    }
    next();
  },
  passport.authenticate("facebook", { scope: ["email"] }),
);
router.get(
  "/facebook/callback",
  (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID) {
      return res.status(503).json({ error: "Facebook OAuth not configured" });
    }
    next();
  },
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    setTokenCookie(res, req.user._id, req.user.isAdmin);
    res.redirect(process.env.FRONTEND_URL);
  },
);

// ---------- GitHub OAuth (only if credentials exist) ----------
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/github/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        let email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`;
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            email: email,
            name: profile.displayName || profile.username,
            authProvider: "github",
          });
          await user.save();
        }
        return done(null, user);
      },
    ),
  );
  console.log("GitHub OAuth enabled");
} else {
  console.log("GitHub OAuth disabled - missing credentials");
}

router.get(
  "/github",
  (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.status(503).json({ error: "GitHub OAuth not configured" });
    }
    next();
  },
  passport.authenticate("github", { scope: ["user:email"] }),
);
router.get(
  "/github/callback",
  (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.status(503).json({ error: "GitHub OAuth not configured" });
    }
    next();
  },
  passport.authenticate("github", { session: false }),
  (req, res) => {
    setTokenCookie(res, req.user._id, req.user.isAdmin);
    res.redirect(process.env.FRONTEND_URL);
  },
);

// ---------- Passkey (WebAuthn) ----------
function extractChallengeFromResponse(attestationResponse) {
  try {
    const clientDataJSON = attestationResponse.response.clientDataJSON;
    const clientData = JSON.parse(
      Buffer.from(clientDataJSON, "base64").toString(),
    );
    return clientData.challenge;
  } catch (e) {
    console.error("Failed to extract challenge:", e);
    return null;
  }
}

// REGISTRATION - BEGIN
router.post("/passkey/register/begin", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const userID = crypto.randomBytes(32);
  let options;
  try {
    options = await generateRegistrationOptions({
      rpName: process.env.RP_NAME || "Shopping Cart App",
      rpID: process.env.RP_ID || "localhost",
      userID: userID,
      userName: email,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });
  } catch (err) {
    console.error("Error generating registration options:", err);
    return res.status(500).json({ error: err.message });
  }

  await PasskeyChallenge.create({
    challenge: options.challenge,
    data: { userID: isoBase64URL.fromBuffer(userID), email, name },
  });

  res.json({
    options,
    passkeyUserId: isoBase64URL.fromBuffer(userID),
  });
});

// REGISTRATION - VERIFY
router.post("/passkey/register/verify", async (req, res) => {
  const { email, name, attestationResponse } = req.body;
  const challenge = extractChallengeFromResponse(attestationResponse);
  if (!challenge) {
    return res.status(400).json({ error: "Invalid attestation response" });
  }

  const stored = await PasskeyChallenge.findOne({ challenge });
  if (!stored) {
    return res.status(400).json({ error: "Challenge not found or expired" });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: process.env.ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      requireUserVerification: false,
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: err.message });
  }

  if (!verification.verified) {
    return res.status(400).json({ error: "Verification failed" });
  }

  const { credentialPublicKey, credentialID, counter } =
    verification.registrationInfo;
  const user = new User({
    email: stored.data.email,
    name: stored.data.name,
    authProvider: "passkey",
    passkeyUserId: stored.data.userID,
    credentialID: isoBase64URL.fromBuffer(credentialID),
    publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
    counter,
  });
  await user.save();
  await PasskeyChallenge.deleteOne({ challenge });
  setTokenCookie(res, user._id, user.isAdmin);
  res.json({ success: true });
});

// LOGIN - BEGIN
router.post("/passkey/login/begin", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  console.log("[Passkey] Login attempt for email:", email);

  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      console.log("[Passkey] User not found");
      return res.status(404).json({ error: "No user found with this email" });
    }
    if (user.authProvider !== "passkey") {
      console.log("[Passkey] User does not have passkey auth provider");
      return res
        .status(404)
        .json({ error: "No passkey registered for this email" });
    }
    if (!user.credentialID || !user.publicKey) {
      console.error(
        "[Passkey] User missing credentialID or publicKey:",
        user.email,
      );
      return res
        .status(500)
        .json({ error: "Invalid passkey data. Please re-register." });
    }
  } catch (err) {
    console.error("[Passkey] Database error on login/begin:", err);
    return res.status(500).json({ error: "Database error" });
  }

  let options;
  try {
    options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || "localhost",
      userVerification: "preferred",
      allowCredentials: [
        {
          id: isoBase64URL.toBuffer(user.credentialID),
          type: "public-key",
        },
      ],
    });
  } catch (err) {
    console.error("[Passkey] Error generating authentication options:", err);
    return res.status(500).json({ error: err.message });
  }

  try {
    await PasskeyChallenge.create({
      challenge: options.challenge,
      data: { email },
    });
  } catch (err) {
    console.error("[Passkey] Error saving challenge:", err);
    return res.status(500).json({ error: "Failed to save challenge" });
  }

  console.log("[Passkey] Login options generated successfully for", email);
  res.json({ options });
});

// LOGIN - VERIFY
router.post("/passkey/login/verify", async (req, res) => {
  const { email, attestationResponse } = req.body;
  const challenge = extractChallengeFromResponse(attestationResponse);
  if (!challenge) {
    return res.status(400).json({ error: "Invalid assertion response" });
  }

  const stored = await PasskeyChallenge.findOne({ challenge });
  if (!stored) {
    return res.status(400).json({ error: "Challenge not found or expired" });
  }

  let user;
  try {
    user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: process.env.ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      authenticator: {
        credentialID: isoBase64URL.toBuffer(user.credentialID),
        credentialPublicKey: isoBase64URL.toBuffer(user.publicKey),
        counter: user.counter,
      },
      requireUserVerification: false,
    });
  } catch (err) {
    console.error("Authentication verification error:", err);
    return res.status(500).json({ error: err.message });
  }

  if (!verification.verified) {
    return res.status(400).json({ error: "Authentication failed" });
  }

  user.counter = verification.authenticationInfo.newCounter;
  await user.save();
  await PasskeyChallenge.deleteOne({ challenge });
  setTokenCookie(res, user._id, user.isAdmin);
  res.json({ success: true });
});

// ---------- Logout ----------
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Get current user
router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ user: null });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-credentialID -publicKey -counter",
    );
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

module.exports = router;
