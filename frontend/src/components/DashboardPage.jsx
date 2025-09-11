import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/dashboard.css";
import "../assets/menu.css";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [homeLocation, setHomeLocation] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [preferredRegions, setPreferredRegions] = useState("");
  const [followedRoutes, setFollowedRoutes] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      window.location.href = "/";
      return;
    }

    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(
        `https://commute-buddy-fegt.onrender.com/api/users/${userId}`,
        axiosConfig
      )
      .then((res) => {
        const data = res.data;
        setUser(data);
        setHomeLocation(data.homeLocation || "");
        setWorkLocation(data.workLocation || "");
        setPreferredRegions(data.preferredRegions?.join(", ") || "");
        setFollowedRoutes(data.followedRoutes?.join(", ") || "");
      })
      .catch(() =>
        alert("Session expired or unauthorized. Please login again.")
      );
  }, []);

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await axios.post(
          `https://commute-buddy-fegt.onrender.com/api/users/${userId}/avatar`,
          formData,
          {
            headers: {
              ...axiosConfig.headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      await axios.put(
        `https://commute-buddy-fegt.onrender.com/api/users/${userId}/locations`,
        { homeLocation, workLocation },
        axiosConfig
      );
      await axios.put(
        `https://commute-buddy-fegt.onrender.com/api/users/${userId}/preferred-regions`,
        { regions: preferredRegions.split(",").map((r) => r.trim()) },
        axiosConfig
      );

      const res = await axios.get(
        `https://commute-buddy-fegt.onrender.com/api/users/${userId}`,
        axiosConfig
      );
      localStorage.setItem("userData", JSON.stringify(res.data));
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile");
    }
  };

  const updateRoutes = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.put(
        `https://commute-buddy-fegt.onrender.com/api/users/${userId}/followed-routes`,
        { routes: followedRoutes.split(",").map((r) => r.trim()) },
        axiosConfig
      );

      const res = await axios.get(
        `https://commute-buddy-fegt.onrender.com/api/users/${userId}`,
        axiosConfig
      );
      localStorage.setItem("userData", JSON.stringify(res.data));
      alert("Followed routes updated successfully!");
    } catch {
      alert("Failed to update routes");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <div className="menu">
        <div className="logo">
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

      <div className="container">
        <h2>Update Profile</h2>
        <input
          type="text"
          placeholder="Home Location"
          value={homeLocation}
          onChange={(e) => setHomeLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Work Location"
          value={workLocation}
          onChange={(e) => setWorkLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Preferred Regions (comma separated)"
          value={preferredRegions}
          onChange={(e) => setPreferredRegions(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files[0])}
        />
        <button onClick={updateProfile}>Update Profile</button>

        <h2>Followed Routes</h2>
        <input
          type="text"
          placeholder="Followed Routes (comma separated)"
          value={followedRoutes}
          onChange={(e) => setFollowedRoutes(e.target.value)}
        />
        <button onClick={updateRoutes}>Update Routes</button>
      </div>
    </>
  );
}

export default DashboardPage;
