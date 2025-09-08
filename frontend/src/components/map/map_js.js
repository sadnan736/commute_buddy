//for report votes

//

import L from "leaflet";
import axios from "axios";
delete L.Icon.Default.prototype._getIconUrl;
import graph from "../../assets/graph/dhaka.graph.json";
import { computeRouteFromCoords, nearestNodeId, aStarRoute } from "./a_star";
import { updateIncidentStore } from "./aStarRouteWithIncidents";
import { computeRouteFromCoords_core } from "./a_star_core";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/marker-icon-2x.png",
  iconUrl: "images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

const desination_marker = L.icon({
  iconRetinaUrl: "images/eta-marker-icon-2x.png",
  iconUrl: "images/eta-marker-icon.png",
  shadowUrl: "images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41], // center-bottom (12 = 25/2)
  popupAnchor: [0, -36], // nudge popup up so it sits above the tip
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const start_marker = L.icon({
  iconRetinaUrl: "images/start-marker-icon-2x.png",
  iconUrl: "images/start-marker-icon.png",
  shadowUrl: "images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41], // center-bottom (12 = 25/2)
  popupAnchor: [0, -36], // nudge popup up so it sits above the tip
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const incident_marker = L.icon({
  iconRetinaUrl: "images/incident-marker-icon-2x.png",
  iconUrl: "images/incident-marker-icon.png",
  shadowUrl: "images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41], // center-bottom (12 = 25/2)
  popupAnchor: [0, -36], // nudge popup up so it sits above the tip
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
let selectedWayId = null;
let selectedWayId_start = null;
let selectedWayId_desination = null;

let routeLayer = null;

const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

async function fetchUserName(userId) {
  try {
    const res = await axios.get(
      `http://localhost:1477/api/reports/${userId}/name`,
      axiosConfig
    );
    return res.data;
  } catch (err) {
    console.error(
      "Error fetching user name:",
      err.response?.data || err.message
    );
    return;
  }
}

let saved_places = {};
async function fetch_saved_places() {
  try {
    const res = await axios.get(
      `http://localhost:1477/api/map/${userId}/saved-places`,
      axiosConfig
    );
    saved_places = res.data;
  } catch (err) {
    console.error("Fetch profile error:", err.response?.data);
  }
}

async function create_report({
  type,
  severity,
  validity,
  coords,
  description,
  reportedBy,
  wayId,
}) {
  try {
    const res = await axios.post(
      "http://localhost:1477/api/reports",
      {
        type,
        severity,
        validity: Number(validity),
        reportedBy,
        reportedByUID: userId,
        location: { lat: coords.lat, lng: coords.lng },
        description,
        wayId,
        photoUrl: undefined,
      },
      axiosConfig
    );
    return res.data; // the created report document
  } catch (err) {
    console.error("Error creating report:", err.response?.data || err.message);
    throw err;
  }
}

async function fetchReports(activeOnly = true) {
  const res = await axios.get(
    `http://localhost:1477/api/reports?activeOnly=${activeOnly}`,
    axiosConfig
  );
  return res.data;
}

async function save_place(locationName, coords, selected_id) {
  try {
    console.log(userId);
    console.log(selected_id);
    console.log(locationName, coords);
    const res = await axios.post(
      `http://localhost:1477/api/map/${userId}/saved-places`,

      {
        locationName: locationName,
        lat: coords.lat,
        lng: coords.lng,
        wayId: selected_id,
      },
      axiosConfig
    );
  } catch (err) {
    console.error("Error saving place:", err.response?.data || err.message);
  }
}

async function deleteSavedPlace(locationName) {
  if (!locationName) return;

  try {
    const res = await axios.delete(
      `http://localhost:1477/api/map/${userId}/saved-places`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { locationName }, // axios deletes need `data` for body
      }
    );
  } catch (err) {
    console.error(
      "Error deleting location:",
      err.response?.data || err.message
    );
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pointToSegmentDist(lat, lng, p1, p2) {
  const A = [lat, lng];
  const B = [p1[0], p1[1]];
  const C = [p2[0], p2[1]];

  const AB = [C[0] - B[0], C[1] - B[1]];
  const AP = [A[0] - B[0], A[1] - B[1]];
  const ab2 = AB[0] ** 2 + AB[1] ** 2;
  const t = Math.max(0, Math.min(1, (AP[0] * AB[0] + AP[1] * AB[1]) / ab2));

  const closest = [B[0] + AB[0] * t, B[1] + AB[1] * t];
  return {
    dist: haversine(A[0], A[1], closest[0], closest[1]),
    snapped: closest,
  };
}

//  road snap
export function snapToRoad(lat, lng, graph, threshold = 30) {
  let best = { dist: Infinity, snapped: null, wayId: null };

  for (const fromNode in graph.adj) {
    for (const [toNode, , , , wayId] of graph.adj[fromNode]) {
      const p1 = graph.nodes[fromNode];
      const p2 = graph.nodes[toNode];
      if (!p1 || !p2) continue;

      const { dist, snapped } = pointToSegmentDist(lat, lng, p1, p2);
      if (dist < best.dist) {
        best = { dist, snapped, wayId };
      }
    }
  }

  return best.dist <= threshold ? best : null;
}
function hasActiveReportSameTypeOnWay({ type, wayId, reports }) {
  if (!wayId || !Array.isArray(reports)) return false;

  const desiredType = String(type).toLowerCase();

  return reports.some((r) => {
    const rWay = r.wayId ?? r.wayID; // be tolerant of casing
    if (rWay !== wayId) return false;

    const rType = String(r.type || "").toLowerCase();
    if (rType !== desiredType) return false;

    // Only consider active reports

    // If no expiresAt provided, treat as active
    return true;
  });
}

let mapInstance = null;
let currentMarker = null;
let start_location_flag = false;
let start_location_marker = null;
let destination_flag = false;
let destination_marker = null;

function setStartLocation(lat, lng) {
  document.getElementById("etaBadge").style.display = "none";
  if (routeLayer) {
    try {
      mapInstance.removeLayer(routeLayer);
    } catch {}
  }
  if (start_location_marker) {
    mapInstance.removeLayer(start_location_marker);
  }
  start_location_marker = L.marker([lat, lng], { icon: start_marker })
    .addTo(mapInstance)
    .bindPopup("Start Location");
}

function setDestination(lat, lng) {
  document.getElementById("etaBadge").style.display = "none";
  if (routeLayer) {
    try {
      mapInstance.removeLayer(routeLayer);
    } catch {}
  }
  if (destination_marker) {
    mapInstance.removeLayer(destination_marker);
  }
  destination_marker = L.marker([lat, lng], { icon: desination_marker })
    .addTo(mapInstance)
    .bindPopup("Destination");
}

export default function initMap() {
  if (!token || !userId) {
    alert("Token or userId missing", token, userId);
    window.location.href = "/";
  }
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {}
    mapInstance = null;
  }

  // FOR REPORT VEWING OVERLAY

  const detailsOverlay = document.getElementById("reportDetailsOverlay");
  const closeDetailsOverlayBtn = document.getElementById("closeDetailsOverlay");

  const calcBtn = document.getElementById("calcEtaBtn");

  const elDetailType = document.getElementById("detailType");
  const elDetailSeverity = document.getElementById("detailSeverity");
  const elDetailReportedBy = document.getElementById("detailReportedBy");
  const elDetailCreatedAt = document.getElementById("detailCreatedAt");
  const elDetailExpiresAt = document.getElementById("detailExpiresAt");
  const elDetailDescription = document.getElementById("detailDescription");
  const elDetailLat = document.getElementById("detailLat");
  const elDetailLng = document.getElementById("detailLng");
  const elDetailValidity = document.getElementById("detailValidity");
  const elDetailTimeLeft = document.getElementById("detailTimeLeft");
  const elDetailPhoto = document.getElementById("detailPhoto");
  const elDetailNoPhoto = document.getElementById("detailNoPhoto");

  // END

  // for reporting
  const reportDescriptionEl = document.getElementById("reportDescription");

  const reportOverlay = document.getElementById("reportOverlay");
  const closeReportOverlayBtn = document.getElementById("closeReportOverlay");
  const confirmReportBtn = document.getElementById("confirmReport");
  const reportTypeEl = document.getElementById("reportType");
  const reportSeverityEl = document.getElementById("reportSeverity");
  const reportValidityEl = document.getElementById("reportValidity");
  const reportPhotoFileEl = document.getElementById("reportPhotoFile");
  const uploadFileNameEl = document.getElementById("uploadFileName");

  const reportLatEl = document.getElementById("reportLat");
  const reportLngEl = document.getElementById("reportLng");

  // report end

  const chooseBtn = document.getElementById("chooseBtn");
  const deselectBtn = document.getElementById("deselectBtn");
  const chooseMenu = document.getElementById("chooseMenu");
  const chooseStart = document.getElementById("chooseStart");
  const chooseDest = document.getElementById("chooseDest");

  const deleteBtn = document.getElementById("deleteLocationBtn");
  const mapEl = document.getElementById("map");
  const saveBtn = document.getElementById("saveLocationBtn");
  const reportBtn = document.getElementById("reportIndidentBtn");
  const overlay_del = document.getElementById("deleteOverlay");
  const overlay = document.getElementById("locationOverlay");
  const closeOverlayDelBtn = document.getElementById("closeDelOverlay");
  const closeOverlayBtn = document.getElementById("closeOverlay");
  const confirmSaveBtn = document.getElementById("confirmSave");
  const confirmDelBtn = document.getElementById("confirmDelete");
  const locationInput = document.getElementById("locationInput");
  const locationDelInput = document.getElementById("locationDelInput");
  const savedPlacesListEl = document.getElementById("savedPlacesList");

  if (!mapEl) {
    console.error("Map element (#map) not found in DOM.");
    return;
  }

  const dhakaBounds = [
    [23.6, 90.3],
    [23.92, 90.52],
  ];

  mapInstance = L.map(mapEl, {
    center: [23.8103, 90.4125],
    zoom: 15,
    minZoom: 14,
    maxBounds: dhakaBounds,
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapInstance);

  mapInstance.doubleClickZoom.disable();

  let selectedCoords = null;

  let start_location_coords = null;
  let destination_coords = null;

  let IncidentStore = { byWayId: {}, lastUpdated: 0 };

  fetch_saved_places().then(() => {
    updateSavedPlacesUI();

    if (Object.keys(saved_places).length > 0) {
      console.log(saved_places);
      deleteBtn.style.display = "block";
    }
  });

  function onMapClick(e) {
    selectedCoords = e.latlng;
    const { lat, lng } = e.latlng;
    const snap = snapToRoad(lat, lng, graph);

    if (snap) {
      const snappedLatLng = { lat: snap.snapped[0], lng: snap.snapped[1] };

      if (start_location_flag === true) {
        setStartLocation(snappedLatLng.lat, snappedLatLng.lng);
        start_location_coords = { ...snappedLatLng };
        console.log("in mpa", start_location_coords);
        selectedWayId_start = snap.wayId;

        refreshCalcButton();
      } else if (destination_flag === true) {
        setDestination(snappedLatLng.lat, snappedLatLng.lng);
        destination_coords = { ...snappedLatLng };
        selectedWayId_desination = snap.wayId;
        refreshCalcButton();
      } else {
        if (currentMarker) {
          try {
            mapInstance.removeLayer(currentMarker);
          } catch (err) {}
        }
        selectedCoords = { lat: snap.snapped[0], lng: snap.snapped[1] };
        selectedWayId = snap.wayId;
        currentMarker = L.marker(selectedCoords).addTo(mapInstance);
        if (saveBtn) saveBtn.style.display = "block";
        if (reportBtn) reportBtn.style.display = "block";
        console.log("in mpa", selectedCoords);
      }
    } else {
      alert("No road nearby. Try clicking closer to a road.");
    }
  }

  mapInstance.on("click", onMapClick);

  function onDelBtnClick() {
    if (Object.keys(saved_places).length <= 0) {
      deleteBtn.style.display = "none";
      return;
    }
    if (overlay_del) overlay_del.style.display = "flex";
    if (locationDelInput) locationDelInput.focus();
  }

  function onCloseDelOverlay() {
    if (overlay_del) overlay_del.style.display = "none";
  }
  function onSaveBtnClick() {
    if (overlay) overlay.style.display = "flex";
    if (locationInput) locationInput.focus();
  }

  function onCloseOverlay() {
    if (overlay) overlay.style.display = "none";
  }

  function onConfirmDel() {
    const nameEl = locationDelInput;
    if (!nameEl) return;

    const locationName = nameEl.value.trim();

    if (!locationName) {
      window.alert("Please enter a location name.");
      return;
    }

    if (locationName in saved_places) {
      deleteSavedPlace(locationName).then(() => {
        delete saved_places[locationName];
        updateSavedPlacesUI();
        nameEl.value = "";
        if (Object.keys(saved_places).length <= 0)
          deleteBtn.style.display = "none";
        if (overlay_del) overlay_del.style.display = "none";
      });
    } else {
      alert("Does not Exist in Saved Places");
    }
  }

  function onConfirmSave() {
    console.log(`selectedCoords: ${selectedCoords}`);
    const nameEl = locationInput;
    if (!nameEl) return;
    const locationName = nameEl.value.trim();

    if (!locationName) {
      window.alert("Please enter a location name.");
      return;
    }

    saved_places[locationName] = {
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      wayId: selectedWayId,
    };

    save_place(locationName, selectedCoords, selectedWayId);

    updateSavedPlacesUI();

    window.alert("Location saved!");
    onCloseOverlay();
    nameEl.value = "";
    if (saveBtn) saveBtn.style.display = "none";
    if (reportBtn) reportBtn.style.display = "none";
  }

  function updateSavedPlacesUI() {
    if (!savedPlacesListEl) return;
    savedPlacesListEl.innerHTML = "";

    if (Object.keys(saved_places).length > 0) deleteBtn.style.display = "block";
    for (const placeName in saved_places) {
      if (!Object.prototype.hasOwnProperty.call(saved_places, placeName))
        continue;
      const coords = saved_places[placeName];

      const btn = document.createElement("div");
      btn.className = "filter-btn";
      btn.textContent = placeName;
      btn.style.cursor = "pointer";

      btn.addEventListener("click", function () {
        const { lat, lng } = coords;

        if (start_location_flag === true) {
          setStartLocation(lat, lng);
          start_location_coords = { lat: lat, lng: lng };

          selectedWayId_start = nearestNodeId(graph, { lat: lat, lng: lng });
          refreshCalcButton();
        } else if (destination_flag === true) {
          setDestination(lat, lng);
          selectedWayId_desination = nearestNodeId(graph, {
            lat: lat,
            lng: lng,
          });
          destination_coords = { lat: lat, lng: lng };
          refreshCalcButton();
        } else {
          if (currentMarker) {
            try {
              mapInstance.removeLayer(currentMarker);
            } catch (err) {}
          }
          if (currentMarker) {
            try {
              mapInstance.removeLayer(currentMarker);
            } catch {}
          }
          currentMarker = L.marker([lat, lng]).addTo(mapInstance);
          currentMarker.bindPopup(placeName).openPopup();
        }

        mapInstance.setView([lat, lng], 15);
      });

      savedPlacesListEl.appendChild(btn);
    }
  }

  // for reporting

  function onPhotoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();

    if (
      !(
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png")
      )
    ) {
      alert("Only JPG and PNG files are allowed.");
      e.target.value = ""; // reset the input
      if (uploadFileNameEl) uploadFileNameEl.textContent = "No file chosen";
      return;
    }

    if (uploadFileNameEl) uploadFileNameEl.textContent = file.name;
  }

  function onReportBtnClick() {
    if (reportLatEl) reportLatEl.textContent = selectedCoords.lat.toFixed(6);
    if (reportLngEl) reportLngEl.textContent = selectedCoords.lng.toFixed(6);

    // reset form
    if (reportDescriptionEl) reportDescriptionEl.value = "";
    if (reportTypeEl) reportTypeEl.value = "";
    if (reportSeverityEl) reportSeverityEl.value = "";
    if (reportValidityEl) reportValidityEl.value = "";
    if (reportPhotoFileEl) reportPhotoFileEl.value = "";
    if (uploadFileNameEl) uploadFileNameEl.textContent = "No file chosen";

    if (reportOverlay) reportOverlay.style.display = "flex";
  }

  function onCloseReportOverlay() {
    if (reportOverlay) reportOverlay.style.display = "none";
  }

  function onConfirmReport() {
    const type = reportTypeEl?.value.trim();
    const severity = reportSeverityEl?.value.trim();
    const validity = Number(reportValidityEl?.value);
    const photoFile = reportPhotoFileEl?.files[0] || undefined;
    const description = reportDescriptionEl?.value.trim();

    if (photoFile && !["image/jpeg", "image/png"].includes(photoFile.type)) {
      alert("Only JPG and PNG files are allowed.");
      reportPhotoFileEl.value = ""; // reset file input
      uploadFileNameEl.textContent = "No file chosen";
      return;
    }

    if (!type || !severity || !validity || validity < 1 || !description) {
      alert("Type, Severity, Description, and Validity (>=1) are required.");
      return;
    }

    if (
      hasActiveReportSameTypeOnWay({
        type,
        wayId: selectedWayId,
        reports: Array.isArray(all_reports) ? all_reports : [],
      })
    ) {
      alert(
        `A "${type}" report already exists on this road. Please choose another road or wait until it expires.`
      );
      return; // stop submission
    }
    // For now just log the result
    console.log("Report ready:");

    fetchUserName(userId).then((name) => {
      const reporterName = name?.name ?? "";
      console.log(reporterName);
      create_report({
        type,
        severity,
        validity,
        coords: selectedCoords,
        description,
        wayId: selectedWayId,
        reportedBy: reporterName,
      })
        .then((created) => {
          refreshReportsAndIncidents();
        })
        .catch((err) => {
          console.log("Failed to submit report", err);
        });
    });

    onCloseReportOverlay();

    if (reportBtn) reportBtn.style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";
    if (currentMarker) mapInstance.removeLayer(currentMarker);
  }

  // reporting

  //  for marker

  function msUntilExpiry(expiresAt) {
    const t = new Date(expiresAt).getTime();
    return t - Date.now();
  }

  function addReportMarker(report) {
    // skip expired defensively
    const msLeft = msUntilExpiry(report.expiresAt);
    if (msLeft <= 0) return;

    const { lat, lng } = report.location || {};
    if (typeof lat !== "number" || typeof lng !== "number") return;

    const marker = L.marker([lat, lng], { icon: incident_marker }).addTo(
      mapInstance
    );

    // Popup content (short summary)
    const minsLeft = Math.max(1, Math.round(msLeft / 60000));
    const popupHtml = `
  <div style="min-width:200px">
  <strong>${(report.type || "report").toUpperCase()}</strong><br/>
  Severity: ${report.severity || "-"}<br/>
  Expires in: ~${minsLeft} min<br/>
  <em>${report.description || ""}</em>
  </div>
  `;
    marker.bindPopup(popupHtml);

    // Events
    marker.on("click", () => {
      marker.openPopup();
      openReportId = report._id;
    });

    marker.on("dblclick", () => {
      openReportId = report._id;
      openReportDetailsOverlay(report); // implement this to show your details overlay
    });

    const expireTimerId = setTimeout(() => {
      removeReportMarker(report._id);
    }, msLeft);

    reportMarkers.set(report._id, { marker, expireTimerId });
  }

  /** Remove a marker (and its timer) by id */
  function removeReportMarker(reportId) {
    const rec = reportMarkers.get(reportId);
    if (!rec) return;
    try {
      rec.marker.remove();
    } catch {}
    if (rec.expireTimerId) clearTimeout(rec.expireTimerId);
    reportMarkers.delete(reportId);
    if (openReportId === reportId) openReportId = null;
  }

  // /** Update popup/timer if a report changed (optional granular updates) */
  function updateReportMarkerIfNeeded(report) {
    const rec = reportMarkers.get(report._id);
    if (!rec) return false;

    // If expiry changed, reset the timer
    const msLeft = msUntilExpiry(report.expiresAt);
    if (rec.expireTimerId) clearTimeout(rec.expireTimerId);
    if (msLeft <= 0) {
      removeReportMarker(report._id);
      return true;
    } else {
      rec.expireTimerId = setTimeout(
        () => removeReportMarker(report._id),
        msLeft
      );
    }

    // Update popup content if key fields changed
    const minsLeft = Math.max(1, Math.round(msLeft / 60000));
    const newHtml = `
          <div style="min-width:200px">
            <strong>${(report.type || "report").toUpperCase()}</strong><br/>
            Severity: ${report.severity || "-"}<br/>
            Expires in: ~${minsLeft} min<br/>
            <em>${report.description || ""}</em>
          </div>
        `;
    rec.marker.setPopupContent(newHtml);

    return true;
  }

  /** Diff & sync markers to match the latest all_reports */
  function syncReportMarkersFromAll() {
    const list = Array.isArray(all_reports) ? all_reports : [];

    // 1) Build a set of incoming IDs
    const incomingIds = new Set(list.map((r) => r._id));

    // 2) Remove markers for reports that no longer exist (or got filtered out server-side)
    for (const existingId of reportMarkers.keys()) {
      if (!incomingIds.has(existingId)) {
        removeReportMarker(existingId);
      }
    }

    // 3) Add or update each incoming report
    for (const r of list) {
      // Skip expired defensively
      if (msUntilExpiry(r.expiresAt) <= 0) {
        // ensure removed if somehow still present
        if (reportMarkers.has(r._id)) removeReportMarker(r._id);
        continue;
      }

      if (!reportMarkers.has(r._id)) {
        addReportMarker(r);
      } else {
        updateReportMarkerIfNeeded(r);
      }
    }

    // 4) If we had a popup open, keep it open if the marker still exists
    if (openReportId && reportMarkers.has(openReportId)) {
      const rec = reportMarkers.get(openReportId);
      try {
        rec.marker.openPopup();
      } catch {}
    }
  }

  /** Public: call this whenever you refresh all_reports (replace whole list) */
  function setAllReports(newList) {
    all_reports = Array.isArray(newList) ? newList : [];
    syncReportMarkersFromAll();
  }

  /** Optional: call this if you only added one new report (to avoid full diff) */
  function addOneReport(report) {
    // Update your source list if you want it to stay in sync
    all_reports.push(report);
    if (!reportMarkers.has(report._id)) addReportMarker(report);
  }

  /** Optional: call this if you removed one report by id */
  function removeOneReportById(reportId) {
    all_reports = all_reports.filter((r) => r._id !== reportId);
    removeReportMarker(reportId);
  }

  /** Details overlay stub — fill with your UI show logic */
  function openReportDetailsOverlay(report) {
    const toUpper = (s) => (s || "—").toString().toUpperCase();
    const fmt = (d) => {
      const date = new Date(d);
      if (isNaN(date)) return "—";
      return date.toLocaleString();
    };
    const timeLeftMin = Math.max(
      0,
      Math.round((new Date(report.expiresAt).getTime() - Date.now()) / 60000)
    );

    // Fill fields
    if (elDetailType) elDetailType.textContent = toUpper(report.type);
    if (elDetailSeverity) {
      elDetailSeverity.textContent = toUpper(report.severity);
      // severity color
      elDetailSeverity.style.background =
        report.severity === "high"
          ? "#ef4444"
          : report.severity === "medium"
          ? "#f59e0b"
          : report.severity === "low"
          ? "#22c55e"
          : "#3b82f6";
    }

    if (elDetailReportedBy)
      elDetailReportedBy.textContent = report.reportedBy || "—";
    if (elDetailCreatedAt)
      elDetailCreatedAt.textContent = fmt(report.createdAt);
    if (elDetailExpiresAt)
      elDetailExpiresAt.textContent = fmt(report.expiresAt);
    if (elDetailDescription)
      elDetailDescription.textContent = report.description || "—";
    if (elDetailLat) elDetailLat.textContent = report.location?.lat ?? "—";
    if (elDetailLng) elDetailLng.textContent = report.location?.lng ?? "—";
    if (elDetailValidity) elDetailValidity.textContent = report.validity ?? "—";
    if (elDetailTimeLeft) elDetailTimeLeft.textContent = `${timeLeftMin} min`;

    // Photo
    const hasPhoto = !!report.photoUrl;
    if (elDetailPhoto && elDetailNoPhoto) {
      if (hasPhoto) {
        elDetailPhoto.src = report.photoUrl;
        elDetailPhoto.style.display = "block";
        elDetailNoPhoto.style.display = "none";
      } else {
        elDetailPhoto.removeAttribute("src");
        elDetailPhoto.style.display = "none";
        elDetailNoPhoto.style.display = "block";
      }
    }

    if (detailsOverlay) detailsOverlay.style.display = "flex";
  }

  let all_reports = [];
  const reportMarkers = new Map();
  let openReportId = null;

  refreshReportsAndIncidents();
  function refreshReportsAndIncidents() {
    fetchReports()
      .then((new_reports) => {
        setAllReports(new_reports);
        IncidentStore = updateIncidentStore(IncidentStore, new_reports);
      })
      .catch(console.error);
  }

  setInterval(() => {
    refreshReportsAndIncidents();
  }, 120000);
  // marker

  if (reportPhotoFileEl) {
    reportPhotoFileEl.addEventListener("change", () => {
      uploadFileNameEl.textContent =
        reportPhotoFileEl.files[0]?.name || "No file chosen";
    });
  }
  if (reportPhotoFileEl) {
    reportPhotoFileEl.addEventListener("change", onPhotoFileChange);
  }

  if (closeDetailsOverlayBtn) {
    closeDetailsOverlayBtn.addEventListener("click", () => {
      if (detailsOverlay) detailsOverlay.style.display = "none";
    });
  }

  // for ETA

  function showChooseMenu() {
    if (chooseMenu) chooseMenu.style.display = "block";
  }
  function hideChooseMenu() {
    if (chooseMenu) chooseMenu.style.display = "none";
  }

  function onChooseStart() {
    start_location_flag = true;
    destination_flag = false;
    hideChooseMenu();
  }

  function onChooseDest() {
    start_location_flag = false;
    destination_flag = true;
    hideChooseMenu();
  }

  function onDeselectClick() {
    // Exit choose mode; keep any existing start/destination markers on map
    start_location_flag = false;
    destination_flag = false;
    hideChooseMenu();
  }

  function refreshCalcButton() {
    const btn = document.getElementById("calcEtaBtn");
    if (!btn) return;

    if (start_location_coords && destination_coords) {
      btn.style.display = "block";
    }
  }
  async function onCalculateETA() {
    if (!start_location_marker || !destination_marker) {
      alert("Please set both Start and Destination.");
      return;
    }

    // Compute route (A*)
    // const result = computeRouteFromCoords_core(
    //   graph,
    //   start_location_coords,
    //   destination_coords
    // );

    const result = computeRouteFromCoords(
      graph,
      start_location_coords,
      destination_coords,
      IncidentStore
    );

    if (!result.coordsPath.length) {
      if (routeLayer) {
        try {
          mapInstance.removeLayer(routeLayer);
        } catch {}
      }
      document.getElementById("etaBadge").style.display = "none";
      alert("No route found.");
      return;
    }

    // Draw (replace previous)
    if (routeLayer) {
      try {
        mapInstance.removeLayer(routeLayer);
      } catch {}
    }
    routeLayer = L.polyline(result.coordsPath, {
      weight: 5,
      opacity: 0.9,
    }).addTo(mapInstance);
    mapInstance.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });

    // Show ETA + distance
    const km = (result.distanceMeters / 1000).toFixed(2);
    const mins = Math.max(1, Math.round(result.durationSec / 60));
    const badge = document.getElementById("etaBadge");
    badge.textContent = `Route: ${km} km • ETA ~ ${mins} min`;
    badge.style.display = "block";
  }

  if (calcBtn) calcBtn.addEventListener("click", onCalculateETA);

  if (reportBtn) reportBtn.addEventListener("click", onReportBtnClick);
  if (closeReportOverlayBtn)
    closeReportOverlayBtn.addEventListener("click", onCloseReportOverlay);
  if (confirmReportBtn)
    confirmReportBtn.addEventListener("click", onConfirmReport);

  if (saveBtn) saveBtn.addEventListener("click", onSaveBtnClick);
  if (closeOverlayBtn)
    closeOverlayBtn.addEventListener("click", onCloseOverlay);
  if (closeOverlayDelBtn)
    closeOverlayDelBtn.addEventListener("click", onCloseDelOverlay);
  if (confirmSaveBtn) confirmSaveBtn.addEventListener("click", onConfirmSave);
  if (confirmDelBtn) confirmDelBtn.addEventListener("click", onConfirmDel);
  if (deleteBtn) deleteBtn.addEventListener("click", onDelBtnClick);

  if (chooseBtn) chooseBtn.addEventListener("click", showChooseMenu);
  if (chooseStart) chooseStart.addEventListener("click", onChooseStart);
  if (chooseDest) chooseDest.addEventListener("click", onChooseDest);
  if (deselectBtn) deselectBtn.addEventListener("click", onDeselectClick);

  // Close menu when clicking outside
  document.addEventListener("click", (ev) => {
    const within = ev.target === chooseBtn || chooseMenu?.contains(ev.target);
    if (!within) hideChooseMenu();
  });

  updateSavedPlacesUI();
  document.getElementById("logoutBtnMap").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/";
  });
}
