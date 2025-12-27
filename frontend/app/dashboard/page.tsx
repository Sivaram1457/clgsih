"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Activity {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchActivities = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/activities/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error) {
      console.error("Failed to fetch activities", error);
      alert("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <button onClick={fetchActivities} className="bg-blue-500 text-white p-2 rounded mb-4" disabled={loading}>
        {loading ? "Loading..." : "Load Activities"}
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl">{activity.title}</h2>
            <p>{activity.description}</p>
            <p>Status: {activity.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
