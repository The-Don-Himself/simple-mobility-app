// Start with the Map Themes
function getMapTheme(theme) {
  let mapTheme;
  // Default Theme
  mapTheme = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
  if ('light_all' === theme) {
    mapTheme = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
  }
  if ('dark_all' === theme) {
    mapTheme = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
  }
  return mapTheme;
}

// Add Map Attribution
let mapAttribution = '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="http://cartodb.com/attributions">CartoDB</a>';
let lighttheme = L.tileLayer(getMapTheme('light_all'), { attribution: mapAttribution });
let darktheme  = L.tileLayer(getMapTheme('dark_all'), { attribution: mapAttribution });

// Add Themes to selectable Map Layers
let baseLayers = {
  "Light Theme": lighttheme,
  "Dark Theme": darktheme
};

// Setup a Riders' Marker Group
let ridersMarkers = L.layerGroup();
let overlayMaps = {
  "Riders": ridersMarkers
};

// Initialize and show the map
let map = L.map('map', {
  attributionControl: true,
  zoom: 16,
  layers: [lighttheme]
}).fitWorld();

// Add selectable controls to it
L.control.layers(baseLayers, overlayMaps).addTo(map);

// Create custom marker icons for riders other than myself
let customIcon = L.Icon.extend({
  options: {
    shadowUrl: "/img/marker-shadow.png",
    iconSize: [25, 39],
    iconAnchor:   [12, 36],
    shadowSize: [41, 41],
    shadowAnchor: [12, 38],
    popupAnchor: [0, -30]
  }
});
let yellowIcon = new customIcon({ iconUrl: "/img/marker-yellow.png" });

// Function to add these custom markers
function setMarker(data) {
  for (i = 0; i < data.coords.length; i++) {
    let marker = L.marker([data.coords[i].lat, data.coords[i].lng], { icon: yellowIcon }).addTo(map);
    marker.bindPopup("A ride is here!");
    // add marker
    ridersMarkers.addLayer(marker);
    alertify.success("A nearby rider ID " + data.id + " has just connected!");
  }
}

// Socket IO Client Initialization
let connects = {};
let socket = io('http://127.0.0.1:80');
socket.on('receive', function(data) {
  alertify.log("New Socket Event Received");
  if (!(data.id in connects)) {
    setMarker(data);
  }
  connects[data.id] = data;
});

// placeholders for the L.marker and L.circle representing user's current position and accuracy    
let current_position, current_accuracy;

function onLocationFound(e) {
  // if position defined, then remove the existing position marker and accuracy circle from the map
  if (current_position) {
    map.removeLayer(current_position);
    map.removeLayer(current_accuracy);
  }

  let radius = e.accuracy / 2;

  current_position = L.marker(e.latlng)
    .addTo(map)
    .bindPopup('Your current position and a ' + radius + ' meters radius').openPopup();

  current_accuracy = L.circle(e.latlng, radius).addTo(map);

  let data = {
    id: userId,
    coords: [{
      lat: e.latitude,
      lng: e.longitude,
      acr: e.accuracy
    }]
  }
  socket.emit("send", data);
}

let errors = {
  1: "Geolocation Permission Denied",
  2: "Network Error",
  3: "Connection Timeout"
};

function onLocationError(error) {
  // confirm dialog
  alertify.confirm("We could not get your current location, reason : " + errors[error.code] + "! Would you like to reload the page and try again?", function () {
      // user clicked "ok"
      location.reload();
  }, function() {
      // user clicked "cancel"
      alertify.log("Please Note You Might Be Getting Stale Data!");
  });

  console.log(
    'code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n',
    'Geo-Location Error'
  );
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on('moveend', function(e) {
  let bounds = map.getBounds();

  let sw = bounds.getSouthWest();
  let ne = bounds.getNorthEast();

  let sw_latitude = sw.lat;
  let sw_longitude = sw.lng;

  let ne_latitude = ne.lat;
  let ne_longitude = ne.lng;

  let zoom = map.getZoom();

  if( zoom < 16 ){
    // remove all the current layers
    ridersMarkers.clearLayers();
    // Show Toast to zoom in
    alertify.log("Please zoom in to view nearby riders");
  } else {
    // To Do - Query DB for nearby rides
  }
});

map.stopLocate();

// Start Mobility App function
let startApp = function (){
  // check whether browser supports geolocation api
  if (navigator.geolocation) {
    map.locate({
      watch:              true, 
      setView:            true, 
      maxZoom:            16,
      timeout:            60000,  
      maximumAge:         60000, 
      enableHighAccuracy: false 
    });
  } else {
    alertify.alert("Sorry, your browser does not support geolocation!");
  }
}

// Simulate Rider Authorization by asking for hypothetical ID
let userId;
let defaultUserId = "9999";
alertify
  .defaultValue("9999")
  .prompt("Please Enter A Hypothetical User ID : ",
    function (val, ev) {
      ev.preventDefault();
      alertify.success("You've clicked OK and typed: " + val);
      userId = val;

      startApp();
    }, function(ev) {
      ev.preventDefault();
      alertify.error("You've clicked Cancel, default ID 9999 used");
      userId = defaultUserId;

      startApp();
    }
  );
