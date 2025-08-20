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
                  <li className="h"><a href="profile.html">Home</a></li>
                  <li className="about"><a href="#">About</a></li>
                  <li className="help"><a href="#">Help</a></li>
                  <li className="blog"><a href="#">Blog</a></li>
                  <li><a href="dashboard.html">Dashboard</a></li>
                  <li><a id="logoutBtn">Logout</a></li>
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
      </div>


      <div id="deleteOverlay" className="overlay" style={{ display: "none" }}>
        <div className="overlay-content">
          <span className="close-btn" id="closeDelOverlay">
            &times;
          </span>
          <h2>Delete Saved Location</h2>
          <input type="text" id="locationDelInput" placeholder="Enter location name" />
          <button id="confirmDelete">Delete</button>
        </div>
      </div>
      {/* end */}

      {/* REPORT OVERLAY */}
      <div id="reportOverlay" className="overlay" style={{ display: "none" }}>
        <div className="overlay-content">
          <span className="close-btn" id="closeReportOverlay">&times;</span>
          <h2>Report a New Incident</h2>

          <label style={{display:"block", textAlign:"left"}}>Type</label>
          <select id="reportType" style={{ width: "95%", padding: 8, marginTop: 6, marginBottom: 12, borderRadius: 5, border: "none", background:"#333", color:"#fff" }}>
            <option value="">Select type</option>
            <option value="accident">Accident</option>
            <option value="congestion">Congestion</option>
            <option value="event">Event</option>
            <option value="blockade">Blockade</option>
            <option value="flood">Flood</option>
          </select>

          <label style={{display:"block", textAlign:"left"}}>Severity</label>
          <select id="reportSeverity" style={{ width: "95%", padding: 8, marginTop: 6, marginBottom: 12, borderRadius: 5, border: "none", background:"#333", color:"#fff" }}>
            <option value="">Select severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label style={{display:"block", textAlign:"left"}}>Validity (minutes)</label>
          <input type="number" id="reportValidity" min="1" placeholder="e.g. 30" />
          <label style={{display:"block", textAlign:"left"}}>Description</label>
          <textarea id="reportDescription" className="desc-input" placeholder="Enter a short description"></textarea>

         <label style={{display:"block", textAlign:"left"}}>Upload Photo (optional)</label>
          <div className="upload-wrapper">
          <label htmlFor="reportPhotoFile" className="upload-btn">Upload Photo</label>
          <input type="file" id="reportPhotoFile" accept=".jpg,.jpeg,.png" style={{ display: "none" }} />
          <span id="uploadFileName" className="upload-filename">No file chosen</span>
        </div>



          <div style={{fontSize:12, opacity:0.8, marginTop:6, marginBottom:12}}>
            <span>Lat: <span id="reportLat">–</span></span> &nbsp;|&nbsp;
            <span>Lng: <span id="reportLng">–</span></span>
          </div>

          <button id="confirmReport">Submit Report</button>
        </div>
      </div>


      {/* end */}

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
