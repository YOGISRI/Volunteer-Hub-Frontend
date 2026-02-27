import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-800">
            <h1 className="text-xl font-bold">
                <Link to="/">VolunteerHub</Link>
            </h1>

            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/opportunities">Opportunities</Link>

                        {user.role === "volunteer" && (
                            <Link to="/my-applications">
                                My Applications
                            </Link>
                        )}
                        {/* 🔔 Notification Bell */}
                        <NotificationBell />

                        <div className="relative group">
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>

                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 hover:bg-gray-700 rounded-t-lg"
                                >
                                    Profile
                                </Link>

                                <button
                                    onClick={logout}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-lg"
                                >
                                    Logout
                                </button>
                                <Link
                                    to="/calendar"
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-lg"
                                >
                                    Calendar
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}