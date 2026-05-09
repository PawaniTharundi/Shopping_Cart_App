const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  name: String,
  authProvider: { type: String, enum: ['google', 'facebook', 'passkey'], required: true },
  // Passkey fields
  passkeyUserId: { type: String, unique: true, sparse: true },
  credentialID: String,
  publicKey: String,
  counter: Number,
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);