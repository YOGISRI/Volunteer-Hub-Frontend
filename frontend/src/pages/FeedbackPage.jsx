import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Feedbackpages() {

    const { id } = useParams();                // 👈 GET application ID
    const [searchParams] = useSearchParams();  // 👈 GET query param
    const navigate = useNavigate();

    const status = searchParams.get("status"); // 👈 complete / incomplete

    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState(
        status === "complete" ? 1 : -1
    );
    const [hours, setHours] = useState(0);

    const handleSubmit = async () => {
        try {

            console.log("Application ID:", id);
            console.log("Status:", status);

            // 1️⃣ mark complete or incomplete
            await api.patch(
                `/opportunities/applications/${id}/complete`,
                {
                    completed: status === "complete",
                    hours: Number(hours)
                }
            );

            // 2️⃣ submit rating
            await api.post(
                `/opportunities/applications/${id}/rate`,
                {
                    feedback,
                    type: status === "complete" ? "positive" : "negative"
                }
            );

            toast.success("Performance submitted");
            navigate("/dashboard");

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">

                <h2 className="text-2xl font-bold mb-6">
                    {status === "complete"
                        ? "Positive Feedback"
                        : "Improvement Feedback"}
                </h2>
                <input
                    type="number"
                    className="w-full p-3 rounded bg-gray-700 mb-4"
                    placeholder="Hours volunteered"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                />


                <textarea
                    className="w-full p-3 rounded bg-gray-700 mb-4"
                    placeholder="Write feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 py-3 rounded"
                >
                    Submit
                </button>

            </div>
        </div>
    );
}