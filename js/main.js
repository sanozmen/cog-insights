// Declare the georaster variable at the top level
var georaster;

// Initialize leaflet map
var map = L.map("map").setView([40.358056, 33.063611], 10);

// Add OpenStreetMap basemap
L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Parse GeoRaster and add it to the map
var url_to_geotiff_file =
  "https://buscket.s3.eu-west-2.amazonaws.com/global_vs30_Cnv_Cnv.tif";

var scaleMinInput = document.getElementById("scaleMin");
var scaleMaxInput = document.getElementById("scaleMax");
var transparentMinInput = document.getElementById("transparentMin");
var transparentMaxInput = document.getElementById("transparentMax");

parseGeoraster(url_to_geotiff_file).then((parsedGeoraster) => {
  georaster = parsedGeoraster;

  // Event handler to display pixel value on mouse movement
  map.on("mousemove", function (evt) {
    var latlng = map.mouseEventToLatLng(evt.originalEvent);
    geoblaze
      .identify(georaster, [latlng.lng, latlng.lat])
      .then((pixelValue) => {
        if (pixelValue !== undefined && pixelValue !== null) {
          var roundedPixelValue = Number(pixelValue).toFixed(2);
          var pixelValueElement = document.getElementById("pixelValue");
          pixelValueElement.textContent = "Pixel value: " + roundedPixelValue;
          pixelValueElement.style.fontWeight = "bold";
        } else {
          document.getElementById("pixelValue").textContent = "";
        }
      });
  });

  // Event handler to hide and then show pixel value box during map updates
  map.on("update", function () {
    var pixelValueBox = document.getElementById("pixelValue");
    pixelValueBox.style.display = "none";
    setTimeout(function () {
      pixelValueBox.style.display = "block";
    }, 0);
  });
  document.getElementById("loader").style.display = "none";
});

function getColorForValue(value, scaleMin, scaleMax, scale) {
  var selectedScale = document.getElementById("colorScaleSelect").value;

  return chroma.scale(scale).domain([scaleMin, scaleMax])(value).hex();
}

// Event listener for color scale selection
document
  .getElementById("colorScaleSelect")
  .addEventListener("change", function () {
    updateMapLayer();
    updateLegend();
  });

var currentOpacity = 0.6; // Default opacity

// Define the function to update the map layer
var georasterLayer = null;

// Function to add or update the raster layer
function addOrUpdateRasterLayer(
  scaleMin,
  scaleMax,
  transparentMin,
  transparentMax
) {
  var selectedScale = document.getElementById("colorScaleSelect").value;

  // Check if layer exists and remove it
  if (georasterLayer) {
    map.removeLayer(georasterLayer);
  }

  // Create and add the new layer with provided settings
  georasterLayer = new GeoRasterLayer({
    georaster: georaster,
    opacity: currentOpacity,
    resolution: 64,
    pixelValuesToColorFn: function (values) {
      var value = values[0];
      if (value < transparentMin || value > transparentMax)
        return "transparent";
      return getColorForValue(value, scaleMin, scaleMax, selectedScale);
    },
  });
  georasterLayer.addTo(map);
}

// Initialize the map with default raster values
parseGeoraster(url_to_geotiff_file).then((parsedGeoraster) => {
  georaster = parsedGeoraster;

  // Default values
  var defaultScaleMin = 200;
  var defaultScaleMax = 1100;
  var defaultTransparentMin = 159;
  var defaultTransparentMax = 1500;

  addOrUpdateRasterLayer(
    defaultScaleMin,
    defaultScaleMax,
    defaultTransparentMin,
    defaultTransparentMax
  );
});

// Update map layer function for 'Apply' button
function updateMapLayer() {
  var scaleMin = parseFloat(document.getElementById("scaleMin").value);
  var scaleMax = parseFloat(document.getElementById("scaleMax").value);
  var transparentMin = parseFloat(
    document.getElementById("transparentMin").value
  );
  var transparentMax = parseFloat(
    document.getElementById("transparentMax").value
  );

  addOrUpdateRasterLayer(scaleMin, scaleMax, transparentMin, transparentMax);

  updateLegend(scaleMin, scaleMax);
}

// Event listener for the "Apply" button
document
  .getElementById("applySettingsButton")
  .addEventListener("click", updateMapLayer);

var comparisonList = []; // Initialize an empty comparison list

// Function to get the pixel value at a specific location and display in a popup
function displayPixelValue(location, georaster) {
  return new Promise(function (resolve, reject) {
    geoblaze
      .identify(georaster, [location.lng, location.lat])
      .then(function (pixelValue) {
        if (pixelValue !== undefined && pixelValue !== null) {
          var roundedPixelValue = Number(pixelValue).toFixed(2);
          var buttonId =
            "comparison-button-" + location.lat + "-" + location.lng;
          var isInComparison = markerStates[location.toString()];

          var buttonText = isInComparison
            ? "Remove from Comparison"
            : "Add to Comparison";
          var buttonOnClick = isInComparison
            ? "removeFromComparison"
            : "addToComparison";

          var popupContent = `
                <span class="pixel-value-text">Pixel value: ${roundedPixelValue}</span>
                <br>
                <button id="${buttonId}" class="comparison-button" onclick="${buttonOnClick}('${location.toString()}', '${buttonId}')">
                    ${buttonText}
                </button>`;

          resolve(popupContent);
        } else {
          resolve("Pixel value not available");
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

//icon to be switched to when the marker has been added to the comparison
var highlightIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

//default icon
var defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var scatterData = []; // Initialize an empty array for scatter chart data
var markersByLocation = {}; // Object to store markers

var markerStates = {}; // Object to store the state of each marker

// Function to add marker data to comparison list and scatter chart data
function addToComparison(location, buttonId) {
  var button = document.getElementById(buttonId);
  var locationString = location.toString();
  markerStates[location] = true;

  // Find the marker with the specified location
  var markerWithLocation = null;
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    if (marker.getLatLng().toString() === location) {
      markerWithLocation = marker;
      break;
    }
  }
  markersByLocation[locationString] = marker; // Assuming 'marker' is the marker object

  if (markerWithLocation) {
    // Access the tooltip of the marker and pick the markerCount
    var markerCountFromTooltip = markerWithLocation.getTooltip().getContent();

    // Fetch and display the pixel value in a popup
    displayPixelValue(markerWithLocation.getLatLng(), georaster)
      .then(function (popupContent) {
        var pixelValue = parseFloat(popupContent.split(":")[1].trim()); // Extract the pixel value

        if (!isNaN(pixelValue)) {
          var roundedPixelValue = Number(pixelValue).toFixed(2);

          var item = {
            location: location,
            pixelValue: pixelValue, // Use the actual pixel value
            markerCount: markerCountFromTooltip,
          };

          comparisonList.push(item);

          // Add the new data point to the scatterData array
          scatterData.push({
            x: parseFloat(markerCountFromTooltip),
            y: parseFloat(pixelValue),
            location: locationString, // Use the actual pixel value
          });

          // Update the scatter plot when a point is added
          updateScatterPlot();

          // Update the icon or do other actions with the marker as needed
          markerWithLocation.setIcon(highlightIcon);
        } else {
          console.error("Pixel value not available");
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    console.error("Marker not found for location: " + location);
  }
  // At the end of the function, after the marker has been added to the comparison:
  button.textContent = "Remove from Comparison";
  button.classList.add("remove-from-graph");
  button.onclick = function () {
    removeFromComparison(location, buttonId);
  };
}

function removeFromComparison(location, buttonId) {
  var button = document.getElementById(buttonId);
  var locationString = location.toString();
  delete markerStates[location];

  // Remove the item from the comparisonList
  comparisonList = comparisonList.filter(function (item) {
    return item.location !== locationString;
  });

  // Remove the corresponding data from scatterData
  scatterData = scatterData.filter(function (dataPoint) {
    return dataPoint.location !== locationString;
  });

  // Update the scatter chart
  updateScatterPlot();

  // Revert button text and style
  button.textContent = "Add to Comparison";
  button.classList.remove("remove-from-graph");

  // Revert button functionality to add to graph
  button.onclick = function () {
    addToComparison(location, buttonId);
  };

  if (markersByLocation[locationString]) {
    markersByLocation[locationString].setIcon(defaultIcon);
    delete markersByLocation[locationString]; // Remove the marker from the object
  }
}

var markers = []; // Initialize an empty array to store markers
var markerCount = 0; // Initialize marker count

// Event handler for adding markers on map click
map.on("click", function (e) {
  var location = e.latlng;
  markerCount++;

  var marker = L.marker(location, {
    markerCount: markerCount,
    title: "Right click to remove marker",
  }).addTo(map);

  marker.on("popupopen", function () {
    displayPixelValue(location, georaster)
      .then(function (popupContent) {
        marker.getPopup().setContent(popupContent);
      })
      .catch(function (error) {
        console.error(error);
      });
  });

  displayPixelValue(location, georaster)
    .then(function (popupContent) {
      marker.bindPopup(popupContent).openPopup();
      marker
        .bindTooltip(String(markerCount), {
          permanent: true,
          offset: [0, 0],
        })
        .openTooltip();
      markers.push(marker);
    })
    .catch(function (error) {
      console.error(error);
    });
});

var userMarker; // Declare a variable to store the user's marker

// Event handler for when the user's location is found
map.on("locationfound", function (e) {
  var userLocation = e.latlng;

  // Remove the previous user marker if it exists
  if (userMarker) {
    userMarker.remove();
  }

  // Create a new marker at the user's location
  userMarker = L.marker(userLocation).addTo(map);
  markerCount++;
  userMarker
    .bindTooltip(String(markerCount), { permanent: true, offset: [0, 0] })
    .openTooltip();

  markers.push(userMarker);
  userMarker.on("popupopen", function () {
    displayPixelValue(userLocation, georaster)
      .then(function (popupContent) {
        userMarker.getPopup().setContent(popupContent);
      })
      .catch(function (error) {
        console.error(error);
      });
  });

  // Fetch and display the pixel value in the marker's popup
  displayPixelValue(userLocation, georaster)
    .then(function (popupContent) {
      userMarker.bindPopup(popupContent).openPopup();

      // Update the pixelValueBox with the popup content
      var pixelValueBox = document.getElementById("pixelValue");
    })
    .catch(function (error) {
      console.error(error);
    });

  // Show the pixelValueBox again after the location is found
  var pixelValueBox = document.getElementById("pixelValue");
  pixelValueBox.style.display = "block";
});

// Add "Find Me" button control
var findMeButton = L.control({
  position: "topleft",
});

findMeButton.onAdd = function (map) {
  var buttonDiv = L.DomUtil.create("div", "find-me-button");
  buttonDiv.innerHTML = 'Find Me <i class="fa fa-map-marker"></i>';
  L.DomEvent.addListener(buttonDiv, "click", function () {
    map.locate({
      setView: true,
      maxZoom: 12,
      watch: false, // Disable continuous location updates
    });

    // Hide the pixelValueBox when the button is clicked
    var pixelValueBox = document.getElementById("pixelValue");
    pixelValueBox.style.display = "none";
  });
  L.DomEvent.disableClickPropagation(buttonDiv); // Add this line
  return buttonDiv;
};

findMeButton.addTo(map);

//add an address geocoder button
var geocoder = L.Control.geocoder({ defaultMarkGeocode: false })
  .addTo(map)
  .setPosition("topleft");

// attach and event listenet to address geocoder button
geocoder.on("markgeocode", function (event) {
  var location = event.geocode.center;

  // Center the map on the geocoded location
  map.setView(location, map.getZoom()); // you can also specify a zoom level, e.g., map.setView(location, 10);
  // Create a marker at the geocode result location
  var geocoderMarker = L.marker(location).addTo(map);
  markerCount++;

  geocoderMarker.on("popupopen", function () {
    displayPixelValue(location, georaster)
      .then(function (popupContent) {
        geocoderMarker.getPopup().setContent(popupContent);
      })
      .catch(function (error) {
        console.error(error);
      });
  });

  displayPixelValue(location, georaster)
    .then(function (popupContent) {
      geocoderMarker.bindPopup(popupContent).openPopup();
      geocoderMarker
        .bindTooltip(String(markerCount), {
          permanent: true,
          offset: [0, 0],
        })
        .openTooltip();
      markers.push(geocoderMarker);
    })
    .catch(function (error) {
      console.error(error);
    });
});

// Function to clear all markers and reset their states
function clearAllMarkers() {
  markers.forEach(function (marker) {
    marker.remove();
  });
  markers = [];
  markerStates = {}; // Reset the state of all markers
  comparisonList = []; // Assuming you have a comparison list
  markerCount = 0;
  // Reset any additional state or data structures you might be using
}

//create a button to remove all data from the map and graph
var clearMarkersButton = L.control({ position: "topleft" });
//attach an even listener to clear all markers button
clearMarkersButton.onAdd = function (map) {
  var buttonDiv = L.DomUtil.create("div", "clear-markers-button");
  buttonDiv.innerHTML = 'Clear All Markers <i class="fa fa-trash"></i>';
  L.DomEvent.addListener(buttonDiv, "click", function (e) {
    clearAllMarkers();
    // Stop the event from propagating to other elements
    L.DomEvent.stopPropagation(e);

    // Remove all markers from the map
    markers.forEach(function (marker) {
      marker.remove();
    });
    // Clear the markers array
    markers = [];
    comparisonList = [];
    markerCount = 0;

    scatterData = [];
    updateScatterPlot();
  });
  return buttonDiv;
};

clearMarkersButton.addTo(map);

//add a button to remove markers from the map and graph individually with a nearby right click
function removeNearbyMarkers(latlng) {
  const tolerance = 5000;
  const newMarkers = [];
  const removedTooltipValues = new Set(); // Use a Set to store tooltip values for removal

  markers.forEach((marker, index) => {
    const markerLatlng = marker.getLatLng();
    const distance = map.distance(latlng, markerLatlng);

    if (distance >= tolerance) {
      // Only add markers with distance greater than or equal to tolerance to newMarkers
      newMarkers.push(marker);
    } else {
      // Mark the tooltip value for removal
      const tooltipContent = marker.getTooltip().getContent();
      removedTooltipValues.add(tooltipContent);
      // Remove the marker from the map if it's within the tolerance
      marker.remove();
    }
  });

  // Filter scatterData to remove entries corresponding to the removed markers
  scatterData = scatterData.filter(
    (dataPoint) => !removedTooltipValues.has(String(dataPoint.x))
  );

  // Update markers with the filtered array
  markers = newMarkers;

  // Update the scatter plot with the new data
  updateScatterPlot();
}

// add an even listener to remove markers button
map.on("contextmenu", function (e) {
  removeNearbyMarkers(e.latlng);
});

//a function to toggle the side pane
function togglePane() {
  var sidePane = document.getElementById("sidePane");
  var toggleButton = document.getElementById("toggleButton");
  if (sidePane.classList.contains("collapsed")) {
    sidePane.classList.remove("collapsed");
    toggleButton.classList.remove("collapsed");
  } else {
    sidePane.classList.add("collapsed");
    toggleButton.classList.add("collapsed");
  }
}

// Initialize the scatter chart once
var scatterChart;

function initScatterChart() {
  const ctx = document.getElementById("scatterChart").getContext("2d");
  scatterChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "",
          data: [], // Empty data initially
          pointBackgroundColor: "#67aaa3",
          pointBorderColor: "#02434c",
          pointHoverBackgroundColor: "#276e72",
          pointHoverBorderColor: "#0b252d",
          pointRadius: 5,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false, // This will hide the legend
        },
      },
      aspectRatio: 1.5,
      scales: {
        x: {
          type: "linear", // Use linear scale for x-axis (assuming numeric values)
          position: "bottom", // Adjust position as needed
          title: {
            display: true,
            text: "Marker Number",
          },
          ticks: {
            stepSize: 1, // Set the interval between ticks to 1 (integer values)
            max: Math.ceil(Math.max(...scatterData.map((item) => item.x))), // Set the maximum value
            min: Math.floor(Math.min(...scatterData.map((item) => item.x))), // Set the minimum value
            precision: 0, // Display integers only (no decimal places)
          },
        },
        y: {
          type: "linear", // Use linear scale for y-axis (assuming numeric values)
          position: "left", // Adjust position as needed
          title: {
            display: true,
            text: "Pixel Values",
          },
        },
      },
    },
  });
}

// Call initScatterChart to initialize the scatter chart
initScatterChart();

// Define a function to update the scatter plot
function updateScatterPlot() {
  // Extract x (markerCount) and y (pixelValue) values from the comparisonList

  scatterChart.data.datasets[0].data = scatterData;

  scatterChart.update();

  // Create or update the scatter plot using Chart.js
  const ctx = document.getElementById("scatterChart").getContext("2d");

  if (window.scatterChart) {
    // If the scatterChart object already exists, update its data

    window.scatterChart.data.datasets[0].data = scatterData; // Use scatterData instead of data
    window.scatterChart.update();
  } else {
    // Create a new scatterChart
    window.scatterChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Markers",
            data: scatterData,
            pointBackgroundColor: ["red", "blue", "green", "orange"], // Customize the point color
            pointRadius: 18, // Customize the point size
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "X-Axis Label", // Customize the x-axis label
            },
          },
          y: {
            title: {
              display: true,
              text: "Y-Axis Label", // Customize the y-axis label
            },
          },
        },
      },
    });
  }
}

// Get references to the transparency control elements
var transparencySlider = document.getElementById("transparencySlider");

// Add an event listener to the slider to control the transparency
transparencySlider.addEventListener("input", function () {
  currentOpacity = transparencySlider.value;
  updateRasterOpacity(currentOpacity);
});

// Function to update the opacity of the raster layer
function updateRasterOpacity(opacity) {
  if (georasterLayer) {
    georasterLayer.setOpacity(opacity);
  }
}

function updateLegend() {
  var selectedScale = document.getElementById("colorScaleSelect").value;
  const legend = document.getElementById("legend");
  legend.innerHTML = "<h4>Legend (V<sub>S30</sub> Values)</h4>";

  // Get values from input fields and parse them to numbers
  const scaleMinValue = parseFloat(document.getElementById("scaleMin").value);
  const scaleMaxValue = parseFloat(document.getElementById("scaleMax").value);

  // Check if the values are numbers
  if (isNaN(scaleMinValue) || isNaN(scaleMaxValue)) {
    legend.innerHTML += "<p>Invalid scale values</p>";
    return;
  }

  // Generate legend items
  const steps = 10;
  const interval = (scaleMaxValue - scaleMinValue) / steps;

  for (let i = 0; i <= steps; i++) {
    const value = scaleMinValue + i * interval;
    const color = getColorForValue(
      value,
      scaleMinValue,
      scaleMaxValue,
      selectedScale
    );

    legend.innerHTML += `<div>
                <i style="background: ${color}; width: 18px; height: 18px; float: left; margin-right: 8px;"></i>
                ${value.toFixed(2)}
            </div>`;
  }
}

// Event listener for color scale selection
document
  .getElementById("colorScaleSelect")
  .addEventListener("change", function () {
    updateMapLayer(); // Call the function that updates the map layer
  });

// Call the function to update the legend
updateLegend(scaleMin, scaleMax);

document.getElementById("loadCogButton").addEventListener("click", function () {
  var cogUrl = document.getElementById("cogUrlInput").value;
  if (cogUrl) {
    document.getElementById("loader").style.display = "block";

    parseGeoraster(cogUrl)
      .then((parsedGeoraster) => {
        georaster = parsedGeoraster;
        document.getElementById("loader").style.display = "none";

        // Update the raster layer with the new georaster
        addOrUpdateRasterLayer(
          parseFloat(scaleMinInput.value),
          parseFloat(scaleMaxInput.value),
          parseFloat(transparentMinInput.value),
          parseFloat(transparentMaxInput.value)
        );
      })
      .catch((error) => {
        console.error("Error loading COG:", error);
        document.getElementById("loader").style.display = "none";

        // Handle error (e.g., show an alert or a message in the UI)
      });
  } else {
    console.error("Unknown COG error");
    document.getElementById("loader").style.display = "none";
  }
});
