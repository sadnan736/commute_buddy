// Variables
let selectedCoords = null;
let savedLocations = {};
let saved_places = {
    "Place Name": { lat: 23.81, lng: 90.41 }
};


// Dhaka bounding box
const dhakaBounds = [
    [23.60, 90.30], // Southwest
    [23.92, 90.52]  // Northeast
];

// Initialize map centered on Dhaka
const map = L.map('map', {
    center: [23.8103, 90.4125],
    zoom: 12,
    minZoom: 11,
    maxBounds: dhakaBounds,
    maxBoundsViscosity: 1.0
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;

// Click to place marker and store coordinates
map.on('click', function(e) {
    selectedCoords = e.latlng;
    console.log(selectedCoords);
    
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(selectedCoords).addTo(map);
    console.log("Selected Coordinates:", selectedCoords);

    
    document.getElementById("saveLocationBtn").style.display = "block";

});


document.getElementById('saveLocationBtn').addEventListener('click', function() {
    document.getElementById("locationOverlay").style.display = "flex";
});

document.getElementById('closeOverlay').addEventListener('click', function() {
    document.getElementById("locationOverlay").style.display = "none";
});


document.getElementById('confirmSave').addEventListener('click', function() {
    let locationName = document.getElementById("locationInput").value.trim();

    if (locationName) {
        // savedLocations[locationName] = { ...selectedCoords };
;       saved_places[locationName] = { ...selectedCoords };
        updateSavedPlacesUI()
        alert("Location saved!");
        document.getElementById("locationOverlay").style.display = "none";
        document.getElementById("locationInput").value = "";
    } else {
        alert("Please enter a location name.");
    }
});


function updateSavedPlacesUI() {
    const listContainer = document.getElementById("savedPlacesList");
    listContainer.innerHTML = ""; // clear old buttons

    for (let placeName in saved_places) {
        let btn = document.createElement("div");
        btn.classList.add("filter-btn");
        btn.textContent = placeName;
        btn.addEventListener("click", function() {
            let coords = saved_places[placeName];
            L.marker(coords).addTo(map).bindPopup(placeName).openPopup();
            map.setView(coords, 15);
        });
        listContainer.appendChild(btn);
    }
}

updateSavedPlacesUI()