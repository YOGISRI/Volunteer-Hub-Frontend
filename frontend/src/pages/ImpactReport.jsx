import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ImpactReport() {
    const { user } = useAuth();

    const [report, setReport] = useState({
        totalHours: 0,
        totalOpportunities: 0,
        totalOrganizations: 0,
        averageRating: 0
    });

    useEffect(() => {
        if (user) {
            fetchImpactData();
        }
    }, [user]);

    const fetchImpactData = async () => {
        try {
            const hoursRes = await api.get(`/impact/${user.id}/hours`);
            const ratingRes = await api.get(`/impact/${user.id}/rating`);

            setReport({
                totalHours: hoursRes.data.totalHours || 0,
                totalOpportunities: hoursRes.data.history?.length || 0,
                totalOrganizations: 0, // Not available in current backend
                averageRating: ratingRes.data.score || 0
            });

        } catch (err) {
            console.error("Impact fetch error:", err);
        }
    };
    const shareText = `
I have contributed ${report.totalHours} hours across 
${report.totalOpportunities} volunteering opportunities 
supporting ${report.totalOrganizations} organizations! 🌍✨

Join me in making a difference!
`;

    const shareURL = window.location.origin + "/register";

    const shareWhatsApp = () => {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText + shareURL)}`,
            "_blank"
        );
    };

    const shareTwitter = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareURL)}`,
            "_blank"
        );
    };

    const shareLinkedIn = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareURL)}`,
            "_blank"
        );
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareText + shareURL);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-5xl mx-auto">

                <h1 className="text-3xl font-bold mb-8">
                    📊 My Impact Report
                </h1>

                <div className="grid md:grid-cols-4 gap-6">

                    <StatCard
                        title="Total Hours"
                        value={report.totalHours}
                        color="text-green-400"
                    />

                    <StatCard
                        title="Opportunities Completed"
                        value={report.totalOpportunities}
                        color="text-blue-400"
                    />

                    <StatCard
                        title="Organizations Worked With"
                        value={report.totalOrganizations}
                        color="text-purple-400"
                    />

                    <StatCard
                        title="Average Rating"
                        value={`⭐ ${report.averageRating}`}
                        color="text-yellow-400"
                    />
                </div>

                {/* Motivation Section */}
                <div className="bg-gray-800 mt-10 p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-semibold mb-4">
                        🌟 Your Contribution Impact
                    </h2>

                    <p className="text-gray-300 leading-relaxed">
                        You have contributed <span className="text-green-400 font-bold">{report.totalHours}</span> hours
                        across <span className="text-blue-400 font-bold">{report.totalOpportunities}</span> opportunities
                        and supported <span className="text-purple-400 font-bold">{report.totalOrganizations}</span> organizations.
                        <br /><br />
                        Your dedication is creating meaningful change in the community.
                        Keep making an impact!
                    </p>
                </div>
                {/* ================= SOCIAL SHARE ================= */}
                <div className="bg-gray-800 mt-10 p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-semibold mb-6">
                        📣 Share Your Impact
                    </h2>

                    <div className="flex flex-wrap gap-4">

                        <button
                            onClick={() => shareWhatsApp()}
                            className="bg-green-600 px-5 py-2 rounded-lg"
                        >
                            WhatsApp
                        </button>

                        <button
                            onClick={() => shareTwitter()}
                            className="bg-blue-500 px-5 py-2 rounded-lg"
                        >
                            Twitter (X)
                        </button>

                        <button
                            onClick={() => shareLinkedIn()}
                            className="bg-blue-700 px-5 py-2 rounded-lg"
                        >
                            LinkedIn
                        </button>

                        <button
                            onClick={copyLink}
                            className="bg-gray-600 px-5 py-2 rounded-lg"
                        >
                            Copy Link
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-sm text-gray-400">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>
                {value}
            </p>
        </div>
    );
}