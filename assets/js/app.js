var map;


var s = window.location.search.slice(1);
var qs={};
s.split('&').forEach(function(item) {
    var parts = item.split('=');
    qs[parts[0].trim()] = parts[1].trim();
});

console.log(qs);
/*
var southWest=L.latLng(qs.miny, qs.minx);
var northEast=(qs.maxy, qs.maxx);
var bounds= L.latLngBounds(southWest, northEast);
*/

var cx = qs.minx + (qs.maxx - qs.minx) /2;
var cy = qs.miny + (qs.maxy - qs.miny) /2;


/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);


var layer = L.tileLayer.wms("http://oaks.binarioetico.org:20581/geoserver/wms", {
    layers: qs.ns+':'+qs.layer,
    format: 'image/png',
    transparent: true,
    attribution: ""
});

var baseLayers = {
  "Street Map": mapquestOSM,
  "Aerial Imagery": mapquestOAM,
  "Imagery with Streets": mapquestHYB,
  //"prova": nexrad
};

var overlayLayers={};
overlayLayers[qs.layer]=layer;

map = L.map("map", {
  zoom: 10,
  center: [cy, cx],
  layers: [layer, mapquestOSM],
  zoomControl: false,
  attributionControl: false
});

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}
/*

var layerControl = L.control.groupedLayers(baseLayers, {
  collapsed: isCollapsed
}).addTo(map);
*/

L.control.layers(baseLayers, overlayLayers).addTo(map);




