import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Opportunities() {
    const [opportunities, setOpportunities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    const [location, setLocation] = useState("");

    useEffect(() => {
        fetchOpportunities();

        if (user?.role === "volunteer") {
            fetchMyApplications();
        }
    }, [user]);

    const fetchOpportunities = async () => {
        try {
            const res = await api.get(
                `/opportunities?location=${location}&search=${search}`
            );
            setOpportunities(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyApplications = async () => {
        const res = await api.get("/opportunities/my/applications");
        setApplications(res.data);
    };

    const handleApply = async (id) => {
        try {
            const res = await api.post(`/opportunities/${id}/apply`);
            toast.success("Applied successfully!");

            setApplications((prev) => [...prev, res.data]);
        } catch (err) {
            toast.error(err.response?.data?.error || "Error applying");
        }
    };

    const getApplicationStatus = (opportunityId) => {
        const app = applications.find(
            (a) => a.opportunity_id === opportunityId
        );
        return app ? app.status : null;
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Volunteer Opportunities
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mb-6">

                {/* Search by Title */}
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-3 rounded bg-gray-700 text-white w-full"
                />

                {/* Filter by Location */}
                <input
                    type="text"
                    placeholder="Filter by location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="p-3 rounded bg-gray-700 text-white w-full"
                />

                <button
                    onClick={fetchOpportunities}
                    className="bg-blue-600 px-6 rounded hover:bg-blue-700"
                >
                    Apply
                </button>

            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {opportunities
                    .filter((opp) =>
                        opp.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((opp) => {
                        const status = getApplicationStatus(opp.id);

                        return (
                            <div
                                key={opp.id}
                                className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-[1.02] transition"
                            >
                                <h2 className="text-xl font-semibold">
                                    {opp.title}
                                </h2>

                                <p className="mt-2">{opp.description}</p>

                                <p className="mt-2 text-sm text-gray-400">
                                    📍 {opp.location}
                                </p>

                                {user?.role === "volunteer" && (
                                    <>
                                        {status ? (
                                            <button
                                                disabled
                                                className={`mt-4 px-4 py-2 rounded-lg ${status === "approved"
                                                    ? "bg-green-600"
                                                    : status === "rejected"
                                                        ? "bg-red-600"
                                                        : "bg-yellow-600"
                                                    }`}
                                            >
                                                {status.charAt(0).toUpperCase() +
                                                    status.slice(1)}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleApply(opp.id)}
                                                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}