"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const API_BASE = "http://localhost:8000";
      // 1. Authenticate to get token
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const authResponse = await axios.post(`${API_BASE}/auth/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const token = authResponse.data.access_token;
      localStorage.setItem("token", token);

      // 2. Fetch user details to get role
      const userResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userRole = userResponse.data.role;

      // 3. Redirect based on role
      if (userRole === "student") {
        router.push("/student-dashboard");
      } else if (userRole === "faculty") {
        router.push("/faculty-dashboard");
      } else if (userRole === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Login failed: ${error.response.data.detail}`);
      } else {
        alert("Login failed: Incorrect email or password");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <form onSubmit={handleLogin} className="bg-white/90 dark:bg-black/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl mb-6 font-extrabold text-center text-blue-600 dark:text-blue-400">Login</h2>
        <div className="mb-4">
          <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 placeholder-blue-300 transition-colors"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 placeholder-blue-300 transition-colors"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
          Login
        </button>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
