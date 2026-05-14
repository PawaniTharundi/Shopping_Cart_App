import React, { useState, useEffect } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [webauthnSupported, setWebauthnSupported] = useState(true);

  useEffect(() => {
    if (!window.PublicKeyCredential) {
      setWebauthnSupported(false);
      console.warn("WebAuthn not supported in this browser");
    }
  }, []);

  const handleGoogle = () => (window.location.href = `${API}/auth/google`);
  const handleFacebook = () => (window.location.href = `${API}/auth/facebook`);
  const handleGitHub = () => (window.location.href = `${API}/auth/github`);

  // Single passkey function: register a new passkey (and auto-login)
  const handlePasskey = async () => {
    if (!email || !name) {
      alert("Please enter both email and name to create a passkey");
      return;
    }
    if (!webauthnSupported) {
      alert(
        "Your browser does not support passkeys. Please use Google or GitHub login.",
      );
      return;
    }
    try {
      const { data } = await axios.post(`${API}/auth/passkey/register/begin`, {
        email,
        name,
      });
      const attResp = await startRegistration({ optionsJSON: data.options });
      await axios.post(
        `${API}/auth/passkey/register/verify`,
        {
          email,
          name,
          passkeyUserId: data.passkeyUserId,
          attestationResponse: attResp,
        },
        { withCredentials: true },
      );
      const me = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(me.data.user);
      alert("Passkey created and you are now logged in!");
    } catch (err) {
      console.error(err);
      let errorMsg = err.response?.data?.error || err.message;
      if (err.name === "NotAllowedError") {
        errorMsg =
          "Passkey creation was cancelled or not allowed. Make sure your device has a screen lock (PIN, fingerprint, or face ID) enabled and you are not using an incognito window that blocks storage.";
      }
      alert(`Passkey creation failed: ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            placeholder="Your name (required for Passkey)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
          <div className="space-y-2">
            <button
              onClick={handleGoogle}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
            >
              Sign in with Google
            </button>
            <button
              onClick={handleFacebook}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
            >
              Sign in with Facebook
            </button>
            <button
              onClick={handleGitHub}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg transition"
            >
              Sign in with GitHub
            </button>
            <button
              onClick={handlePasskey}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
              disabled={!webauthnSupported}
            >
              🔑 Login with Passkey (create new)
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Click "Login with Passkey" to create a new passkey for this email. You
          will be logged in automatically.
          <br />
          Passkey uses your device's fingerprint, face ID, or PIN.
        </p>
      </div>
    </div>
  );
};

export default Login;
