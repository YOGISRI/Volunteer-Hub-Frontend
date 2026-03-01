import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* ===============================
     CLOSE DROPDOWN WHEN CLICK OUTSIDE
  ================================ */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     FETCH UNREAD CHAT COUNT
  ================================ */
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
    <nav className="bg-gray-800 px-4 py-3 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">

        {/* LOGO */}
        <h1 className="text-xl font-bold text-white">
          <Link to="/">VolunteerHub</Link>
        </h1>

        {/* MENU */}
        <div className="flex flex-wrap items-center gap-4 text-sm">

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>

              <Link
                to="/opportunities"
                className="text-gray-300 hover:text-white transition"
              >
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
                <Link
                  to="/my-applications"
                  className="text-gray-300 hover:text-white transition"
                >
                  My Applications
                </Link>
              )}

              <NotificationBell />

              {/* PROFILE AVATAR */}
              <div className="relative" ref={profileRef}>
                <div
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* DROPDOWN (WORKS FOR ALL SCREENS) */}
                {profileOpen && (
                  <div
                    className="
                      absolute
                      mt-3
                      right-0
                      w-44
                      bg-gray-800
                      rounded-lg
                      shadow-xl
                      border border-gray-700
                      z-50
                      overflow-hidden
                    "
                  >
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                    >
                      Profile
                    </Link>

                    <Link
                      to="/calendar"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                    >
                      Calendar
                    </Link>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="text-gray-300 hover:text-white transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}