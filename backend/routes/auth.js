const crypto = require("crypto");
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { isoBase64URL } = require("@simplewebauthn/server/helpers");

const router = express.Router();

// ---------- Helper to issue JWT cookie ----------
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

// ---------- Google OAuth ----------
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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    setTokenCookie(res, req.user._id, req.user.isAdmin);
    res.redirect(process.env.FRONTEND_URL);
  },
);

// ---------- Facebook OAuth ----------
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

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    setTokenCookie(res, req.user._id, req.user.isAdmin);
    res.redirect(process.env.FRONTEND_URL);
  },
);

// ---------- Passkey (WebAuthn) Registration ----------
router.post("/passkey/register/begin", async (req, res) => {
  const { email, name } = req.body;
  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ error: "Email already registered" });

  const passkeyUserId = crypto.randomBytes(16).toString("base64url");
  const options = await generateRegistrationOptions({
    rpName: process.env.RP_NAME,
    rpID: process.env.RP_ID,
    userID: passkeyUserId,
    userName: email,
    attestationType: "none",
  });
  // Store challenge temporarily (in production, store in session/redis)
  res.locals.challenge = options.challenge;
  res.json({ options, passkeyUserId });
});

router.post("/passkey/register/verify", async (req, res) => {
  const { email, name, passkeyUserId, attestationResponse } = req.body;
  const verification = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge: req.locals?.challenge, // simplified – use proper storage
    expectedOrigin: process.env.ORIGIN,
    expectedRPID: process.env.RP_ID,
  });
  if (!verification.verified)
    return res.status(400).json({ error: "Verification failed" });

  const { credentialPublicKey, credentialID, counter } =
    verification.registrationInfo;
  const user = new User({
    email,
    name,
    authProvider: "passkey",
    passkeyUserId,
    credentialID: isoBase64URL.fromBuffer(credentialID),
    publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
    counter,
  });
  await user.save();
  setTokenCookie(res, user._id, user.isAdmin);
  res.json({ success: true });
});

// ---------- Passkey Login ----------
router.post("/passkey/login/begin", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.authProvider !== "passkey")
    return res.status(404).json({ error: "User not found" });

  const options = await generateAuthenticationOptions({
    rpID: process.env.RP_ID,
    allowCredentials: [
      {
        id: isoBase64URL.toBuffer(user.credentialID),
        type: "public-key",
      },
    ],
  });
  res.locals.challenge = options.challenge;
  res.json({ options, user: { id: user._id, email: user.email } });
});

router.post("/passkey/login/verify", async (req, res) => {
  const { email, attestationResponse } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const verification = await verifyAuthenticationResponse({
    response: attestationResponse,
    expectedChallenge: req.locals?.challenge,
    expectedOrigin: process.env.ORIGIN,
    expectedRPID: process.env.RP_ID,
    authenticator: {
      credentialID: isoBase64URL.toBuffer(user.credentialID),
      credentialPublicKey: isoBase64URL.toBuffer(user.publicKey),
      counter: user.counter,
    },
  });
  if (!verification.verified)
    return res.status(400).json({ error: "Authentication failed" });

  user.counter = verification.authenticationInfo.newCounter;
  await user.save();
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
