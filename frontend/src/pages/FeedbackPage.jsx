import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const { id } = useParams(); // application_id
  const navigate = useNavigate();
  const { user } = useAuth(); // organization

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [application, setApplication] = useState(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/opportunities/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      toast.error("Failed to load application");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/ratings", {
        volunteer_id: application.volunteer_id,
        organization_id: user.id,
        application_id: id,
        rating,
        feedback,
      });

      toast.success("Feedback submitted successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  if (!application) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">
          Rate Volunteer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-400 mb-1">
              Rating (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              rows="4"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 py-2 rounded-lg text-white font-semibold hover:bg-blue-700 transition"
          >
            Submit Feedback
          </button>

        </form>
      </div>
    </div>
  );
}