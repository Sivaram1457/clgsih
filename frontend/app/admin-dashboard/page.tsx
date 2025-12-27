"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  TrendingUp,
  Download,
  Award,
  Layers
} from "lucide-react";

interface Analytics {
  total_students: number;
  total_activities: number;
  department_wise: { [key: string]: number };
}

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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

      // Parallel Fetching
      const [userRes, analyticsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/auth/me`, config),
        axios.get(`${API_BASE}/analytics/`, config)
      ]);

      // Handle User Profile
      if (userRes.status === "fulfilled") {
        setUser(userRes.value.data);
        if (userRes.value.data.role !== "admin") {
          alert("Access Denied: Admin Only");
          router.push("/login");
          return;
        }
      }

      // Handle Analytics
      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.data);
      }

    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type: "NAAC" | "NIRF") => {
    // Simulator for report generation
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analytics, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `smart_student_hub_${type}_report.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    alert(`${type} Report JSON generated successfully!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">

      {/* Navbar */}
      <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 text-white p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Institution Admin
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm font-medium hidden md:block">{user.full_name}</span>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">

        {/* 1. Global KPI Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-500 bg-green-100 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
            <h3 className="text-3xl font-bold">{analytics?.total_students || 0}</h3>
          </div>

          {/* Metric 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-500 bg-green-100 px-2 py-1 rounded-full">+5%</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Activities</p>
            <h3 className="text-3xl font-bold">{analytics?.total_activities || 0}</h3>
          </div>

          {/* Metric 3: Accreditation Score (Mock) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Projected</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">NAAC Score</p>
            <h3 className="text-3xl font-bold">A++</h3>
          </div>

          {/* Metric 4 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Participation Rate</p>
            <h3 className="text-3xl font-bold">85%</h3>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 2. Department Analytics */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Department Engagement
            </h2>

            <div className="space-y-4">
              {analytics?.department_wise && Object.entries(analytics.department_wise).length > 0 ? (
                Object.entries(analytics.department_wise).map(([dept, count], idx) => {
                  const max = Math.max(...Object.values(analytics.department_wise));
                  const percentage = (count / max) * 100;

                  return (
                    <div key={dept} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{dept || "Unassigned"}</span>
                        <span className="text-gray-500">{count} Activities</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                  <p>No activity data available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Report Generation Station */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-green-500" /> Accreditation Reports
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Generate standard compliance reports compatible with NAAC, NIRF, and NBA formats.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => generateReport("NAAC")}
                className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-between px-4 group"
              >
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <ShieldCheck className="w-5 h-5 text-blue-500" /> NAAC Report
                </span>
                <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => generateReport("NIRF")}
                className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-between px-4 group"
              >
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Award className="w-5 h-5 text-purple-500" /> NIRF Data Export
                </span>
                <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">System Health</h3>
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                All Systems Operational
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
