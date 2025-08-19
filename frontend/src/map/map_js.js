import L from "leaflet";
import axios from "axios";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/marker-icon-2x.png",
  iconUrl: "images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
console.log(token);
console.log(userId);

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
    console.log(res.data)
    saved_places = res.data;
  } catch (err) {
    console.error("Fetch profile error:", err.response?.data);
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

    console.log("Updated saved places:", res.data.savedPlaces);
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

    console.log(res.data.message);
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

  const deleteBtn = document.getElementById("deleteLocationBtn");
  const mapEl = document.getElementById("map");
  const saveBtn = document.getElementById("saveLocationBtn");
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

  let selectedCoords = null;
fetch_saved_places().then(() => {
  updateSavedPlacesUI();

  if (saved_places){
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
  }

  mapInstance.on("click", onMapClick);


function onDelBtnClick(){
  if (!saved_places) {
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
          if (overlay_del) overlay_del.style.display = "none";

      });

    } else {
      alert("Does not Exist")
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
    console.log(saved_places);
    save_place(locationName, selectedCoords);

    updateSavedPlacesUI();

    window.alert("Location saved!");
    onCloseOverlay();
    nameEl.value = "";
    if (saveBtn) saveBtn.style.display = "none";
  }

  function updateSavedPlacesUI() {
    console.log()
    if (!savedPlacesListEl) return;
    savedPlacesListEl.innerHTML = "";

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
