import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/user.css";
import "../assets/menu.css";

function UserDashboard() {
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      alert("Not logged in!");
      window.location.href = "/";
      return;
    }

    const cachedUser = JSON.parse(localStorage.getItem("userData"));
    if (cachedUser) setUser(cachedUser);

    axios
      .get(`https://commute-buddy-fegt.onrender.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("userData", JSON.stringify(res.data));
      })
      .catch(() => {
        alert("Failed to load profile. Please log in again.");
        logout();
      });
  }, []);

  if (!user) return <div>Loading...</div>;

  const fields = [
    "name",
    "email",
    "avatar",
    "preferences",
    "homeLocation",
    "workLocation",
    "preferredRegions",
  ];
  let filledCount = 0;
  fields.forEach((field) => {
    if (field === "preferences" || field === "preferredRegions") {
      if (user[field]?.length > 0) filledCount++;
    } else if (user[field]) {
      filledCount++;
    }
  });
  const completionPercent = Math.round((filledCount / fields.length) * 100);

  return (
    <>
      <div className="menu">
        <div className="logo-menu">
          <div className="com">Commute</div>
          <div className="bud">Buddy</div>
        </div>
        <div className="name">
          <img src={user.avatar || "default-avatar.png"} alt="Avatar" />
          <h1>{user.name || "Unnamed"}</h1>
        </div>
        <p>Email: {user.email || "N/A"}</p>
        <a href="/user" className="user">
          User Profile
        </a>
        <a href="/dashboard" className="update">
          Update Profile
        </a>
        <button id="logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <img src={user.avatar || "default-avatar.png"} alt="Avatar" />
          <div className="profile-info">
            <h2 className="name">{user.name || "Unnamed"}</h2>
            <p>{user.email || "N/A"}</p>
            <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <h3>Profile Completion</h3>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${completionPercent}%` }}
          >
            {completionPercent}%
          </div>
        </div>

        <div className="profile-details">
          <h3 className="pre">Preferences</h3>
          <ul>
            {user.preferences && user.preferences.length > 0 ? (
              user.preferences.map((pref, idx) => <li key={idx}>{pref}</li>)
            ) : (
              <li>No preferences set</li>
            )}
          </ul>
        </div>

        <div className="profile-details">
          <h3>Locations</h3>
          <p>Home: {user.homeLocation || "Not set"}</p>
          <p>Work: {user.workLocation || "Not set"}</p>
        </div>

        <div className="profile-details">
          <h3>Preferred Regions</h3>
          <ul>
            {user.preferredRegions && user.preferredRegions.length > 0 ? (
              user.preferredRegions.map((region, idx) => (
                <li key={idx}>{region}</li>
              ))
            ) : (
              <li>No regions set</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
