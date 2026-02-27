import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function OrgDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [opportunitiesCount, setOpportunitiesCount] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const appsRes = await api.get("/opportunities/org/applications");
            setApplications(appsRes.data);

            const statsRes = await api.get("/opportunities/stats");
            setOpportunitiesCount(statsRes.data.opportunities);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        }
    };

    /* ==============================
       APPROVE / REJECT
    =============================== */

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/opportunities/applications/${id}/status`, {
                status
            });

            toast.success(`Application ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    /* ==============================
       COMPLETE / INCOMPLETE
       → Redirect to feedback page
    =============================== */

    const handleCompletion = async (id, completedStatus) => {
        try {
            await api.patch(`/opportunities/applications/${id}/complete`, {
                completed: completedStatus
            });

            // Redirect to feedback page
            navigate(`/feedback/${id}`);
        } catch (err) {
            toast.error("Error updating completion status");
        }
    };

    const totalApplicants = applications.length;
    const approved = applications.filter(a => a.status === "approved").length;
    const pending = applications.filter(a => a.status === "pending").length;
    const rejected = applications.filter(a => a.status === "rejected").length;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Welcome, {user?.name}
            </h1>

            {/* Stat Cards */}
            <div className="grid md:grid-cols-5 gap-6">
                <StatCard title="Opportunities" value={opportunitiesCount} color="text-blue-400" />
                <StatCard title="Applicants" value={totalApplicants} color="text-purple-400" />
                <StatCard title="Approved" value={approved} color="text-green-400" />
                <StatCard title="Pending" value={pending} color="text-yellow-400" />
                <StatCard title="Rejected" value={rejected} color="text-red-400" />
            </div>

            <h2 className="text-xl font-semibold mt-10 mb-4">
                Recent Applications
            </h2>

            <div className="space-y-4">
                {applications.slice(0, 5).map(app => (
                    <div
                        key={app.id}
                        className="bg-gray-800 p-5 rounded-xl hover:scale-[1.02] transition"
                    >
                        <p className="font-semibold">
                            {app.users?.name}
                        </p>

                        <p className="text-sm text-gray-400">
                            {app.users?.email}
                        </p>

                        <p className="mt-1 text-sm">
                            Opportunity: {app.opportunities?.title}
                        </p>

                        {/* STATUS TEXT */}
                        <p
                            className={`mt-2 font-medium ${app.status === "approved"
                                    ? "text-green-400"
                                    : app.status === "rejected"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                }`}
                        >
                            {app.status}
                        </p>

                        {/* =======================
                            APPROVE / REJECT
                        ======================== */}
                        {app.status === "pending" && (
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => updateStatus(app.id, "approved")}
                                    className="bg-green-600 px-4 py-2 rounded-lg"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => updateStatus(app.id, "rejected")}
                                    className="bg-red-600 px-4 py-2 rounded-lg"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {/* =======================
                            COMPLETE / INCOMPLETE
                        ======================== */}
                        {app.status === "approved" && (
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => handleCompletion(app.id, true)}
                                    className="bg-green-600 px-4 py-2 rounded-lg"
                                >
                                    Complete
                                </button>

                                <button
                                    onClick={() => handleCompletion(app.id, false)}
                                    className="bg-red-600 px-4 py-2 rounded-lg"
                                >
                                    Incomplete
                                </button>
                            </div>
                        )}

                        {/* COMPLETED BADGE */}
                        {app.completed && (
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">
                                Performance Submitted
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition">
            <p className="text-sm text-gray-400">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>
                {value}
            </p>
        </div>
    );
}