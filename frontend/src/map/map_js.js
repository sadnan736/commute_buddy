import L from "leaflet";
import axios from "axios";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/marker-icon-2x.png",
  iconUrl: "images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

let reports = [];
let markers = [];

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (!token || !userId) {
  alert("Token or userId missing", token, userId);
  window.location.href = "login.html";
}


const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

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

async function create_report({ type, severity, validity, coords, description }) {
  try {
    const res = await axios.post(
      "http://localhost:1477/api/reports",
      {
        type,
        severity,
        validity: Number(validity),
        reportedBy: userId,
        location: { lat: coords.lat, lng: coords.lng },
        description,
        // photoUrl: undefined
      },
      axiosConfig
    );
    return res.data; // the created report document
  } catch (err) {
    console.error("Error creating report:", err.response?.data || err.message);
    throw err;
  }
}


async function save_place(locationName, coords) {
  try {
    const res = await axios.post(
      `http://localhost:1477/api/map/${userId}/saved-places`,
      {
        locationName: locationName,
        lat: coords.lat,
        lng: coords.lng,
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
        data: { locationName } // axios deletes need `data` for body
      }
    );

  } catch (err) {
    console.error("Error deleting location:", err.response?.data || err.message);
  }
}



let mapInstance = null;
let currentMarker = null;



export default function initMap() {

  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {}
    mapInstance = null;
  }

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


  const deleteBtn = document.getElementById("deleteLocationBtn");
  const mapEl = document.getElementById("map");
  const saveBtn = document.getElementById("saveLocationBtn");
  const reportBtn = document.getElementById("reportIndidentBtn");
  const overlay_del = document.getElementById("deleteOverlay")
  const overlay = document.getElementById("locationOverlay");
  const closeOverlayDelBtn = document.getElementById("closeDelOverlay")
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
    zoom: 12,
    minZoom: 11,
    maxBounds: dhakaBounds,
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapInstance);


  mapInstance.doubleClickZoom.disable();

  
  let selectedCoords = null;
fetch_saved_places().then(() => {
  updateSavedPlacesUI();

  if (Object.keys(saved_places).length > 0) {
    console.log(saved_places)
    deleteBtn.style.display = "block";
  }
});

  function onMapClick(e) {
    selectedCoords = e.latlng;

    if (currentMarker) {
      try {
        mapInstance.removeLayer(currentMarker);
      } catch (err) {}
    }

    currentMarker = L.marker(selectedCoords).addTo(mapInstance);

    if (saveBtn) saveBtn.style.display = "block";
    if (reportBtn) reportBtn.style.display = "block";
  }

  mapInstance.on("click", onMapClick);


function onDelBtnClick(){
  if (Object.keys(saved_places).length <= 0)  {
    deleteBtn.style.display = "none";
    return
  }
  if (overlay_del) overlay_del.style.display = "flex";
  if (locationDelInput) locationDelInput.focus();
  


}

function onCloseDelOverlay(){
  if (overlay_del) overlay_del.style.display = "none";
}
  function onSaveBtnClick() {
    if (overlay) overlay.style.display = "flex";
    if (locationInput) locationInput.focus();
  }

  function onCloseOverlay() {
    if (overlay) overlay.style.display = "none";
  }

  function onConfirmDel(){
    const nameEl = locationDelInput;
    if (!nameEl) return;

    const locationName = nameEl.value.trim();

    if (!locationName) {
      window.alert("Please enter a location name.");
      return;
    }

    if (locationName in saved_places) {
      deleteSavedPlace(locationName).then(() => {
          delete saved_places[locationName]
          updateSavedPlacesUI();
          nameEl.value = "";
          if (Object.keys(saved_places).length <= 0)  deleteBtn.style.display = "none";
          if (overlay_del) overlay_del.style.display = "none";


      });

    } else {
      alert("Does not Exist in Saved Places")
    }
  }

  function onConfirmSave() {
    const nameEl = locationInput;
    if (!nameEl) return;
    const locationName = nameEl.value.trim();

    if (!locationName) {
      window.alert("Please enter a location name.");
      return;
    }
    if (!selectedCoords) {
      window.alert("No location selected on map.");
      return;
    }

    saved_places[locationName] = {
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
    };
    save_place(locationName, selectedCoords);

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
    
    if (Object.keys(saved_places).length > 0)  deleteBtn.style.display = "block";
    for (const placeName in saved_places) {
      if (!Object.prototype.hasOwnProperty.call(saved_places, placeName))
        continue;
      const coords = saved_places[placeName];

      const btn = document.createElement("div");
      btn.className = "filter-btn";
      btn.textContent = placeName;
      btn.style.cursor = "pointer";

      btn.addEventListener("click", function () {
        if (currentMarker) {
          try {
            mapInstance.removeLayer(currentMarker);
          } catch (err) {}
        }

        currentMarker = L.marker([coords.lat, coords.lng]).addTo(mapInstance);
        currentMarker.bindPopup(placeName).openPopup();
        mapInstance.setView([coords.lat, coords.lng], 15);
      });

      savedPlacesListEl.appendChild(btn);
    }
  }


  // for reporting

  function onPhotoFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const name = file.name.toLowerCase();

  if (!(name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png"))) {
    alert("Only JPG and PNG files are allowed.");
    e.target.value = ""; // reset the input
    if (uploadFileNameEl) uploadFileNameEl.textContent = "No file chosen";
    return;
  }

  if (uploadFileNameEl) uploadFileNameEl.textContent = file.name;
}


  function onReportBtnClick() {
  if (!selectedCoords) {
    alert("Select a location on the map first.");
    return;
  }
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
  if (!selectedCoords) {
    alert("No location selected.");
    return;
  }
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

  // For now just log the result
  console.log("Report ready:", {
    type,
    severity,
    validity,
    reportedBy: userId,
    location: { lat: selectedCoords.lat, lng: selectedCoords.lng },description,
  });
create_report({
    type,
    severity,
    validity,
    coords: selectedCoords,
    description,
  })
    .then((created) => {
      reports.push(created)
      console.log("Created report:", created);
      alert("Report submitted!");
      resetReportForm();
    })
    .catch(() => {
      alert("Failed to submit report");
    });


  
  onCloseReportOverlay();

  // Optionally hide buttons after submit
  if (reportBtn) reportBtn.style.display = "none";
  if (saveBtn) saveBtn.style.display = "none";
}


  // reporting


  if (reportPhotoFileEl) {
    reportPhotoFileEl.addEventListener("change", () => {
      uploadFileNameEl.textContent = reportPhotoFileEl.files[0]?.name || "No file chosen";
    });
  }
  if (reportPhotoFileEl) {
  reportPhotoFileEl.addEventListener("change", onPhotoFileChange);
}




  

  if (reportBtn) reportBtn.addEventListener("click", onReportBtnClick);
  if (closeReportOverlayBtn) closeReportOverlayBtn.addEventListener("click", onCloseReportOverlay);
  if (confirmReportBtn) confirmReportBtn.addEventListener("click", onConfirmReport);

  if (saveBtn) saveBtn.addEventListener("click", onSaveBtnClick);
  if (closeOverlayBtn)
    closeOverlayBtn.addEventListener("click", onCloseOverlay);
  if (closeOverlayDelBtn)
    closeOverlayDelBtn.addEventListener("click", onCloseDelOverlay);
  if (confirmSaveBtn) confirmSaveBtn.addEventListener("click", onConfirmSave);
  if (confirmDelBtn) confirmDelBtn.addEventListener("click", onConfirmDel);
  if (deleteBtn) deleteBtn.addEventListener("click", onDelBtnClick);

  updateSavedPlacesUI();
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
  });
}
