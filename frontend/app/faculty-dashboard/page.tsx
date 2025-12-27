"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckSquare,
  FileText,
  LogOut,
  UserCheck,
  XCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  status: string;
  user_id: number;
  created_at?: string;
}

interface Student {
  id: number;
  full_name: string;
  email: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

export default function FacultyDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const API_BASE = "http://localhost:8000";

      // Parallel Data Fetching
      const [userRes, pendingRes, studentsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/auth/me`, config),
        axios.get(`${API_BASE}/activities/pending`, config),
        axios.get(`${API_BASE}/academic/students/`, config)
      ]);

      // Handle User Profile
      if (userRes.status === "fulfilled") {
        setUser(userRes.value.data);
        if (userRes.value.data.role !== "faculty" && userRes.value.data.role !== "admin") {
          alert("Access Denied: Faculty Only");
          router.push("/login");
          return;
        }
      }

      // Handle Activities
      if (pendingRes.status === "fulfilled") {
        setPendingActivities(pendingRes.value.data);
      }

      // Handle Students
      if (studentsRes.status === "fulfilled") {
        setStudents(studentsRes.value.data);
      }

    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStatus = async (activityId: string, action: "approve" | "reject") => {
    const token = localStorage.getItem("token");
    const API_BASE = "http://localhost:8000";

    try {
      await axios.put(`${API_BASE}/activities/${activityId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistic UI Update: Remove the item from list immediately
      setPendingActivities(prev => prev.filter(a => a.id !== activityId));
      alert(`Activity ${action}d successfully`);

    } catch (error) {
      console.error(`Failed to ${action} activity`, error);
      alert(`Failed to ${action} activity. Please try again.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">

      {/* Navbar */}
      <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Faculty Portal
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm font-medium hidden md:block">Prof. {user.full_name}</span>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">

        {/* 1. Mentorship Insights (Stats) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
                <p className="text-3xl font-bold">{pendingActivities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
                <p className="text-lg font-bold text-green-500">Active</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 2. Approval Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-500" /> Pending Approvals
              </h2>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {pendingActivities.length > 0 ? (
              <div className="space-y-4">
                {pendingActivities.map((activity) => (
                  <div key={activity.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{activity.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending Review
                      </span>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => updateActivityStatus(activity.id, "approve")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => updateActivityStatus(activity.id, "reject")}
                        className="flex-1 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Caught Up!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">No pending activities requiring your approval.</p>
              </div>
            )}
          </div>

          {/* 3. Student Roster */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-purple-500" /> Student Directory
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {students.length > 0 ? (
                students.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {student.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 transition-colors">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">No students found.</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button className="w-full py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> View Full Report
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
