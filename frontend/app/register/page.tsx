"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "student",
        department: "",
        year: "",
    });
    const router = useRouter();

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: any) => {
        e.preventDefault();
        try {
            // Prepare data based on role
            const dataToSend = {
                ...formData,
                // Clear optional fields if not relevant to role
                department: formData.role !== "admin" ? formData.department : null,
                year: formData.role === "student" ? formData.year : null,
            };

            // Using direct fetch for better debugging control
            const response = await axios.post("http://localhost:8000/auth/register", dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Registration Response:", response.data);
            alert("Registration successful! Please login.");
            router.push("/login"); // Redirect to login page

        } catch (error: any) {
            console.error("Registration failed:", error);
            if (error.response) {
                // Server responded with a status code outside 2xx
                alert(`Server Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // Request was made but no response received
                alert("Network Error: No response from server. Is the Backend running on Port 8000?");
            } else {
                // Something happened in setting up the request
                alert(`Error: ${error.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
            <form onSubmit={handleRegister} className="bg-white/90 dark:bg-black/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <h2 className="text-3xl mb-6 font-extrabold text-center text-blue-600 dark:text-blue-400">Sign Up</h2>

                <div className="mb-4">
                    <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">Full Name</label>
                    <input
                        name="full_name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 placeholder-blue-300 transition-colors"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">Email</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 placeholder-blue-300 transition-colors"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">Password</label>
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 placeholder-blue-300 transition-colors"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 transition-colors"
                    >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {(formData.role === "student" || formData.role === "faculty") && (
                    <div className="mb-4">
                        <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">Department</label>
                        <input
                            name="department"
                            type="text"
                            placeholder="e.g. CS, EE"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 placeholder-blue-300 transition-colors"
                            required
                        />
                    </div>
                )}

                {(formData.role === "student" || formData.role === "faculty") && (
                    <div className="mb-6">
                        <label className="block text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">
                            {formData.role === "faculty" ? "Assigned Year" : "Year"}
                        </label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-blue-900 bg-blue-50 transition-colors"
                            required
                        >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>
                )}

                <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                    Register
                </button>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
}
