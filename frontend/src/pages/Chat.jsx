import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
    const { user } = useAuth();
    const { userId } = useParams();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        const res = await api.get(`/messages/${userId}`);
        setMessages(res.data);
    };

    const sendMessage = async () => {
        if (!text.trim()) return;

        await api.post("/messages", {
            receiver_id: userId,
            content: text
        });

        setText("");
        fetchMessages();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl">

                <div className="h-96 overflow-y-auto space-y-3 mb-4">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`p-3 rounded-lg max-w-xs ${msg.sender_id === user.id
                                    ? "bg-blue-600 ml-auto"
                                    : "bg-gray-700"
                                }`}
                        >
                            {msg.content}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 p-3 rounded bg-gray-700"
                        placeholder="Type message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-600 px-5 rounded"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    );
}