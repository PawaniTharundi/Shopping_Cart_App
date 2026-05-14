const mongoose = require("mongoose");

const passkeyChallengeSchema = new mongoose.Schema({
  challenge: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 minutes
});

module.exports = mongoose.model("PasskeyChallenge", passkeyChallengeSchema);
