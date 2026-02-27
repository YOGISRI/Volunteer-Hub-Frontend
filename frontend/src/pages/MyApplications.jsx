import { useEffect, useState } from "react";
import api from "../api/axios";

export default function MyApplications() {
    const [applications, setApplications] = useState([]);

    const fetchApplications = async () => {
        try {
            const res = await api.get("/opportunities/my/applications");
            setApplications(res.data);
        } catch (err) {
            alert("Error loading applications", err);
        }
    };
    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                My Applications
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="bg-gray-800 p-6 rounded-xl"
                    >
                        <h2 className="text-xl font-semibold">
                            {app.opportunities.title}
                        </h2>
                        <p className="mt-2">
                            {app.opportunities.description}
                        </p>

                        <p className="mt-4 font-semibold">
                            Status:{" "}
                            <span className="text-yellow-400">
                                {app.status || "Pending"}
                            </span>
                        </p><br></br>
                        <button
                            onClick={() => navigate(`/chat/${app.opportunities.organization_id}`)}
                            className="bg-purple-600 px-4 py-2 rounded"
                        >
                            Message Org
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}