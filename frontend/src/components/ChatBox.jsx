import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

export default function ChatBox({ room }) {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    // Fetch previous messages
    useEffect(() => {
        fetchMessages();
    }, [room]);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/${room}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages");
        }
    };

    // Socket join + listener
    useEffect(() => {
        socket.emit("join_room", room);

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [room]);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const msgData = {
            room,
            sender: user.id,
            message,
        };

        socket.emit("send_message", msgData);
        setMessages((prev) => [...prev, msgData]);
        setMessage("");
    };

    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 w-full max-w-lg">

            <div className="h-80 overflow-y-auto space-y-3 mb-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === user.id ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === user.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 dark:bg-slate-700 dark:text-white"
                                }`}
                        >
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef}></div>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}