import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios
      .get("/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  const markRead = async (id) => {
    await axios.put(`/api/notifications/${id}/read`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      {notifications.length === 0 && <p>No notifications</p>}
      <ul>
        {notifications.map((n) => (
          <li
            key={n._id}
            style={{ fontWeight: n.isRead ? "normal" : "bold", cursor: "pointer" }}
            onClick={() => markRead(n._id)}
          >
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
