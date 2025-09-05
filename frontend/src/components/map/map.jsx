// src/components/Maps.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import initMap from "./map_js";
import "leaflet/dist/leaflet.css";
import "../../assets/map.css";

import Notifications from "./notification";

export default function Maps() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const cleanup = initMap();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every 1 min
    return () => {
      if (typeof cleanup === "function") cleanup();
      clearInterval(interval);
    };
  }, []);

  async function fetchNotifications() {
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }

  async function markRead(id) {
    try {
      await axios.put(`/api/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }

  return (
    <>
      <div className="map-page-map">
        <div className="navi-map">
          <div className="logo-map">
            <div className="com-map">Commute</div>
            <div className="bud-map">Buddy</div>
          </div>
          <ul>
            <li className="h">
              <a href="/">Home</a>
            </li>
            <li className="about">
              <a href="#">About</a>
            </li>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li>
              <a id="logoutBtnMap">Logout</a>
            </li>
          </ul>
        </div>
        <div className="sidebar-map">
          <div className="notifications-wrapper" style={{ marginTop: 20 }}>
            <Notifications />
          </div>

        
          <div className="saved-section">
            <h3>Saved Places</h3>
            <div id="savedPlacesList"></div>
          </div>
        </div>

        <div className="map-container">
          <div id="map" style={{ height: "100%", minHeight: "400px" }}></div>
          <button
            className="report-btn"
            id="reportIndidentBtn"
            style={{ display: "none" }}
          >
            Report Incident
          </button>
          <button
            className="save-btn"
            id="saveLocationBtn"
            style={{ display: "none" }}
          >
            Save Location
          </button>
          <button
            className="delete-btn"
            id="deleteLocationBtn"
            style={{ display: "none" }}
          >
            Delete Location
          </button>
          <button className="choose-btn" id="chooseBtn">
            Choose
          </button>

          <div
            id="chooseMenu"
            className="choose-menu"
            style={{ display: "none" }}
          >
            <div id="chooseStart" className="choose-item">
              Start Location
            </div>
            <div id="chooseDest" className="choose-item">
              Destination
            </div>
          </div>

          <button className="deselect-btn" id="deselectBtn">
            Deselect
          </button>

          <button
            id="calcEtaBtn"
            className="calc-eta-btn"
            style={{ display: "none" }}
          >
            Calculate ETA
          </button>

          <div
            id="etaBadge"
            className="eta-badge"
            style={{ display: "none" }}
          ></div>
        </div>

        <div id="deleteOverlay" className="overlay" style={{ display: "none" }}>
          <div className="overlay-content">
            <span className="close-btn" id="closeDelOverlay">
              &times;
            </span>
            <h2>Delete Saved Location</h2>
            <input
              type="text"
              id="locationDelInput"
              placeholder="Enter location name"
            />
            <button id="confirmDelete">Delete</button>
          </div>
        </div>
        {/* end */}

        {/* REPORT OVERLAY */}
        <div id="reportOverlay" className="overlay" style={{ display: "none" }}>
          <div className="overlay-content">
            <span className="close-btn" id="closeReportOverlay">
              &times;
            </span>
            <h2>Report a New Incident</h2>

            <label style={{ display: "block", textAlign: "left" }}>Type</label>
            <select
              id="reportType"
              style={{
                width: "95%",
                padding: 8,
                marginTop: 6,
                marginBottom: 12,
                borderRadius: 5,
                border: "none",
                background: "#333",
                color: "#fff",
              }}
            >
              <option value="">Select type</option>
              <option value="accident">Accident</option>
              <option value="congestion">Congestion</option>
              <option value="event">Event</option>
              <option value="blockade">Blockade</option>
              <option value="flood">Flood</option>
            </select>

            <label style={{ display: "block", textAlign: "left" }}>
              Severity
            </label>
            <select
              id="reportSeverity"
              style={{
                width: "95%",
                padding: 8,
                marginTop: 6,
                marginBottom: 12,
                borderRadius: 5,
                border: "none",
                background: "#333",
                color: "#fff",
              }}
            >
              <option value="">Select severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label style={{ display: "block", textAlign: "left" }}>
              Validity (minutes)
            </label>
            <input
              type="number"
              id="reportValidity"
              min="1"
              placeholder="e.g. 30"
            />
            <label style={{ display: "block", textAlign: "left" }}>
              Description
            </label>
            <textarea
              id="reportDescription"
              className="desc-input"
              placeholder="Enter a short description"
            ></textarea>

            <label style={{ display: "block", textAlign: "left" }}>
              Upload Photo (optional)
            </label>
            <div className="upload-wrapper">
              <label htmlFor="reportPhotoFile" className="upload-btn">
                Upload Photo
              </label>
              <input
                type="file"
                id="reportPhotoFile"
                accept=".jpg,.jpeg,.png"
                style={{ display: "none" }}
              />
              <span id="uploadFileName" className="upload-filename">
                No file chosen
              </span>
            </div>

            <div
              style={{
                fontSize: 12,
                opacity: 0.8,
                marginTop: 6,
                marginBottom: 12,
              }}
            >
              <span>
                Lat: <span id="reportLat">–</span>
              </span>{" "}
              &nbsp;|&nbsp;
              <span>
                Lng: <span id="reportLng">–</span>
              </span>
            </div>

            <button id="confirmReport">Submit Report</button>
          </div>
        </div>

        {/* end */}

        {/* REPORT DETAILS OVERLAY */}
        <div
          id="reportDetailsOverlay"
          className="overlay"
          style={{ display: "none" }}
        >
          <div className="overlay-content details-content">
            <span className="close-btn" id="closeDetailsOverlay">
              &times;
            </span>

            <div className="details-header">
              <div className="details-title">
                <span id="detailType" className="badge">
                  TYPE
                </span>
                <span id="detailSeverity" className="badge badge-sev">
                  SEVERITY
                </span>
              </div>
              <div className="details-sub">
                <span>
                  Reported by: <strong id="detailReportedBy">—</strong>
                </span>
                <span>
                  Created: <strong id="detailCreatedAt">—</strong>
                </span>
                <span>
                  Expires: <strong id="detailExpiresAt">—</strong>
                </span>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-section">
                <h4>Description</h4>
                <p id="detailDescription">—</p>
              </div>

              <div className="details-section">
                <h4>Location</h4>
                <div className="coords">
                  <span>
                    Lat: <strong id="detailLat">—</strong>
                  </span>
                  <span>
                    Lng: <strong id="detailLng">—</strong>
                  </span>
                </div>
              </div>

              <div className="details-section">
                <h4>Validity</h4>
                <div className="chips">
                  <span className="chip">
                    Valid (min): <strong id="detailValidity">—</strong>
                  </span>
                  <span className="chip">
                    Time left: <strong id="detailTimeLeft">—</strong>
                  </span>
                </div>
              </div>

              <div className="details-section photo-section">
                <h4>Photo</h4>
                <img
                  id="detailPhoto"
                  alt="Incident"
                  style={{
                    display: "none",
                    width: "100%",
                    borderRadius: "6px",
                  }}
                />
                <div id="detailNoPhoto" className="muted">
                  No photo provided
                </div>
              </div>
            </div>
            <div id="reportVotesContainer"></div>
          </div>
        </div>

        {/* END */}

        <div
          id="locationOverlay"
          className="overlay"
          style={{ display: "none" }}
          >
          <div className="overlay-content">
            <span className="close-btn" id="closeOverlay">
              &times;
            </span>
            <h2>Save Location</h2>
            <input
              type="text"
              id="locationInput"
              placeholder="Enter location name"
            />
            <button id="confirmSave">Save</button>
          </div>
        </div>
      </div>
    </>
  );
}
