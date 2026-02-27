import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function CreateOpportunity() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        date: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/opportunities", form);
            toast.success("Opportunity created");
            navigate("/dashboard");
        } catch (err) {
            toast.error("Failed to create opportunity");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-4"
            >
                <h2 className="text-xl font-bold mb-4">
                    Create Opportunity
                </h2>

                {["title", "description", "location", "date"].map(field => (
                    <input
                        key={field}
                        type="text"
                        placeholder={field}
                        className="w-full p-3 rounded bg-gray-700"
                        onChange={(e) =>
                            setForm({ ...form, [field]: e.target.value })
                        }
                    />
                ))}

                <button className="w-full bg-green-600 py-3 rounded">
                    Create
                </button>
            </form>
        </div>
    );
}