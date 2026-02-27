import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

export default function EventCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      let res;

      if (user?.role === "organization") {
        res = await api.get("/opportunities");
        const filtered = res.data.filter(
          (opp) => opp.organization_id === user.id
        );
        formatEvents(filtered);
      } else {
        res = await api.get("/opportunities");
        formatEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatEvents = (data) => {
    const formatted = data.map((opp) => ({
      id: opp.id,
      title: opp.title,
      start: new Date(opp.date),
      end: new Date(opp.date),
    }));
    setEvents(formatted);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        Event Calendar
      </h1>

      <div className="bg-white text-black rounded-xl p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={(event) =>
            navigate(`/opportunities`)
          }
        />
      </div>
    </div>
  );
}