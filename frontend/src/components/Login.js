import React, { useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleGoogle = () => (window.location.href = `${API}/auth/google`);
  const handleFacebook = () => (window.location.href = `${API}/auth/facebook`);
  const handleGitHub = () => (window.location.href = `${API}/auth/github`);

  const handlePasskeyRegister = async () => {
    try {
      const { data } = await axios.post(`${API}/auth/passkey/register/begin`, {
        email,
        name,
      });
      const attResp = await startRegistration(data.options);
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
      alert("Passkey registered & logged in");
    } catch (err) {
      console.error(err);
      alert("Passkey registration failed");
    }
  };

  const handlePasskeyLogin = async () => {
    try {
      const { data } = await axios.post(`${API}/auth/passkey/login/begin`, {
        email,
      });
      const attResp = await startAuthentication(data.options);
      await axios.post(
        `${API}/auth/passkey/login/verify`,
        { email, attestationResponse: attResp },
        { withCredentials: true },
      );
      const me = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(me.data.user);
      alert("Logged in with Passkey");
    } catch (err) {
      console.error(err);
      alert("Passkey login failed");
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
            placeholder="Your name (for Passkey registration)"
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
              onClick={handlePasskeyRegister}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
            >
              Register Passkey
            </button>
            <button
              onClick={handlePasskeyLogin}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg transition"
            >
              Login with Passkey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
