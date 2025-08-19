// src/components/Maps.jsx
import React, { useEffect } from "react";
import initMap from "./map_js";
import "leaflet/dist/leaflet.css";
import "./map.css"; // your existing styles

export default function Maps() {
  useEffect(() => {
    // initMap returns a cleanup function
    const cleanup = initMap();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  return (
    <>
    <div className="map-page">
          <div className="navi">
              <div className="logo">
                  <div className="com">Commute</div>
                  <div className="bud">Buddy</div>
              </div>
              <ul>
                  <li className="h"><a href="index.html">Home</a></li>
                  <li className="about"><a href="#">About</a></li>
                  <li className="help"><a href="#">Help</a></li>
                  <li className="blog"><a href="#">Blog</a></li>
                  <li><a href="dashboard.html">Dashboard</a></li>
                  <li><a href="#" id="logoutBtn">Logout</a></li>
              </ul>
          </div>
      <div className="sidebar">
        <div>
          <h3>Filters</h3>
          <div className="filter-btn">Accidents</div>
          <div className="filter-btn">Congestion</div>
          <div className="filter-btn">Hazards</div>
          <div className="filter-btn">Events</div>
        </div>

        <div className="sort-section">
          <h3>Sort By</h3>
          <div className="sort-option">Time</div>
          <div className="sort-option">Credibility (Votes)</div>
        </div>

        <div className="saved-section">
          <h3>Saved Places</h3>
          <div id="savedPlacesList"></div>
        </div>
      </div>

      <div className="map-container">
        <div id="map" style={{ height: "100%", minHeight: "400px" }}></div>
        <button
          className="save-btn"
          id="saveLocationBtn"
          style={{ display: "none" }}
        >
          Save Location
        </button>
      </div>

      <div id="locationOverlay" className="overlay" style={{ display: "none" }}>
        <div className="overlay-content">
          <span className="close-btn" id="closeOverlay">
            &times;
          </span>
          <h2>Save Location</h2>
          <input type="text" id="locationInput" placeholder="Enter location name" />
          <button id="confirmSave">Save</button>
        </div>
      </div>
      </div>
    </>
  );
}
