import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/marker-icon-2x.png",
  iconUrl: "images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});


let mapInstance = null;
let currentMarker = null;

let saved_places = {
  "Place Name": { lat: 23.81, lng: 90.41 },
};

export default function initMap() {
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {
    }
    mapInstance = null;
  }


  const mapEl = document.getElementById("map");
  const saveBtn = document.getElementById("saveLocationBtn");
  const overlay = document.getElementById("locationOverlay");
  const closeOverlayBtn = document.getElementById("closeOverlay");
  const confirmSaveBtn = document.getElementById("confirmSave");
  const locationInput = document.getElementById("locationInput");
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


  function onMapClick(e) {
    selectedCoords = e.latlng;


    if (currentMarker) {
      try {
        mapInstance.removeLayer(currentMarker);
      } catch (err) {

      }
    }

    currentMarker = L.marker(selectedCoords).addTo(mapInstance);

    if (saveBtn) saveBtn.style.display = "block";
  }

  mapInstance.on("click", onMapClick);


  function onSaveBtnClick() {
    if (overlay) overlay.style.display = "flex";
    if (locationInput) locationInput.focus();
  }


  function onCloseOverlay() {
    if (overlay) overlay.style.display = "none";
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


    saved_places[locationName] = { lat: selectedCoords.lat, lng: selectedCoords.lng };


    updateSavedPlacesUI();


    window.alert("Location saved!");
    onCloseOverlay();
    nameEl.value = "";
    if (saveBtn) saveBtn.style.display = "none";


  }

  function updateSavedPlacesUI() {
    if (!savedPlacesListEl) return;
    savedPlacesListEl.innerHTML = "";

    for (const placeName in saved_places) {
      if (!Object.prototype.hasOwnProperty.call(saved_places, placeName)) continue;
      const coords = saved_places[placeName];

      const btn = document.createElement("div");
      btn.className = "filter-btn";
      btn.textContent = placeName;
      btn.style.cursor = "pointer";

      btn.addEventListener("click", function () {

        if (currentMarker) {
            try {
                mapInstance.removeLayer(currentMarker);
            } catch (err) {

            }
            }

        currentMarker = L.marker([coords.lat, coords.lng]).addTo(mapInstance);
        currentMarker.bindPopup(placeName).openPopup();
        mapInstance.setView([coords.lat, coords.lng], 15);
      });

      savedPlacesListEl.appendChild(btn);
    }
  }


  if (saveBtn) saveBtn.addEventListener("click", onSaveBtnClick);
  if (closeOverlayBtn) closeOverlayBtn.addEventListener("click", onCloseOverlay);
  if (confirmSaveBtn) confirmSaveBtn.addEventListener("click", onConfirmSave);

  updateSavedPlacesUI();

  return function cleanup() {
    try {

      if (mapInstance) {
        mapInstance.off("click", onMapClick);
      }

      if (saveBtn) saveBtn.removeEventListener("click", onSaveBtnClick);
      if (closeOverlayBtn) closeOverlayBtn.removeEventListener("click", onCloseOverlay);
      if (confirmSaveBtn) confirmSaveBtn.removeEventListener("click", onConfirmSave);


      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }


      if (savedPlacesListEl) savedPlacesListEl.innerHTML = "";
    } catch (err) {

    }
  };
}
