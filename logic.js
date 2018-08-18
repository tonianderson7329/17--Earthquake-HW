// Store our API endpoint inside queryUrl
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
// Perform a GET request to the query URL
d3.json(quakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});
// d3.json(faultUrl, function(faultdata) {
//     createFeatures(faultdata.features);
// });
function getColor(d){
  return d > 5 ? "#a54500":
  d  > 4 ? "#cc5500":
  d > 3 ? "#ff6f08":
  d > 2 ? "#ff9143":
  d > 1 ? "#ffb37e":
         "#ffcca5";
}

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +
            "</h3><h3>Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return new L. Circle(latlng, 
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .6,
        color: "#000",
        stroke: true,
        weight: .8
    })
    // return L.circleMarker(latlng, markeroptions);
  }
});

    createMap(earthquakes);
}

// function createFeatures(vaultlineData){
    
//     function onEachFeature(feature, layer) {
//         layer.bindPopup("<h3>" + feature.properties.place +
//           "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
//       }  
//     var vaultlines = L.geoJSON(vaultlineData, {
//         onEachFeature: onEachFeature
//     });
//     createMap(vaultlines);
// }



  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake  
function createMap(earthquakes) {

  // Define sthe layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var contrastmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.high-contrast",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellitemap,
    "Outdoors Map": outdoorsmap,
    "High Contrast Map": contrastmap
  };

  // Create a layer for tectonic plates

  var faultlines = new L.LayerGroup();

  d3.json(faultUrl, function(faultData) {
    L.geoJSON(faultData, {
        fillColor: "false",
        color: "yellow",
        weight: 3
    }).addTo(faultlines);
   });

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Faultlines": faultlines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, faultlines]
  });

  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

    // function getColor(d){
    //   return d > 5 ? "#a54500":
    //   d  > 4 ? "#cc5500":
    //   d > 3 ? "#ff6f08":
    //   d > 2 ? "#ff9143":
    //   d > 1 ? "#ffb37e":
    //          "#ffcca5";
    // }

    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

        div.innerHTML+='Magnitude<br><hr>'

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style="background:'+ getColor(grades[i] + 1) + '"></i> ' + 
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br' : '+');

        }
  return div;  
  };
  legend.addTo(myMap);  
}

  //Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle. 
  function getRadius(value){
    return value*25000
  }
