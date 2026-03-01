import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* Close on route change */
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  /* Close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Fetch unread count */
  useEffect(() => {
    if (!user) return;

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnread = async () => {
    try {
      const res = await api.get("/messages/unread-count");
      setUnread(res.data.unread);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Unread fetch error", err);
      }
    }
  };

  return (
  <nav className="bg-gray-800 p-4 relative z-30">
    {/* ================= DESKTOP NAV ================= */}
    <div className="hidden sm:flex justify-between items-center">

      {/* Logo */}
      <h1 className="text-xl font-bold">
        <Link to="/">VolunteerHub</Link>
      </h1>

      {user && (
        <div className="flex items-center gap-4 text-sm">

          <Link to="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>

          <Link to="/opportunities" className="text-gray-300 hover:text-white">
            Opportunities
          </Link>

          <button
            onClick={() => navigate("/chat")}
            className="relative px-4 py-2 bg-indigo-600 rounded-lg text-white"
          >
            Community Chat
            {unread > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-2 py-1 rounded-full">
                {unread}
              </span>
            )}
          </button>

          {user.role === "volunteer" && (
            <Link to="/my-applications" className="text-gray-300 hover:text-white">
              My Applications
            </Link>
          )}

          <NotificationBell />

          {/* Avatar */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setProfileOpen(prev => !prev)}
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-700">
                  Profile
                </Link>
                <Link to="/calendar" className="block px-4 py-2 hover:bg-gray-700">
                  Calendar
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* ================= MOBILE NAV ================= */}
    <div className="sm:hidden space-y-3">

      {/* Top Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">VolunteerHub</Link>
        </h1>

        {user && (
          <div
            onClick={() => setProfileOpen(prev => !prev)}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Mobile Links */}
      {user && (
        <div className="flex flex-col gap-2">

          <Link
            to="/dashboard"
            className="block px-4 py-2 bg-gray-700 rounded-lg"
          >
            Dashboard
          </Link>

          <Link
            to="/opportunities"
            className="block px-4 py-2 bg-gray-700 rounded-lg"
          >
            Opportunities
          </Link>

          <button
            onClick={() => navigate("/chat")}
            className="w-full px-4 py-2 bg-indigo-600 rounded-lg text-white"
          >
            Community Chat
          </button>

          {user.role === "volunteer" && (
            <Link
              to="/my-applications"
              className="block px-4 py-2 bg-gray-700 rounded-lg"
            >
              My Applications
            </Link>
          )}

          <NotificationBell />
        </div>
      )}
    </div>

    {/* ================= MOBILE PROFILE DRAWER ================= */}
    {profileOpen && (
  <div className="sm:hidden">

    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/50 z-40"
      onClick={() => setProfileOpen(false)}
    />

    {/* Drawer */}
    <div className="fixed top-0 right-0 h-full w-72 bg-gray-900 shadow-2xl z-50 flex flex-col">

      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Account</h3>
        <button onClick={() => setProfileOpen(false)}>✕</button>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">

        <Link
          to="/profile"
          onClick={() => setProfileOpen(false)}
          className="block p-3 bg-gray-800 rounded-lg"
        >
          Profile
        </Link>

        <Link
          to="/calendar"
          onClick={() => setProfileOpen(false)}
          className="block p-3 bg-gray-800 rounded-lg"
        >
          Calendar
        </Link>

        <button
          onClick={() => {
            setProfileOpen(false);
            logout();
          }}
          className="w-full text-left p-3 bg-red-600 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  </div>
)}
  </nav>
);
}
