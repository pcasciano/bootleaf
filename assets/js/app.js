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
  crs: L.CRS.EPSG4326,
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

// -- Display information on click --

// Add an event handler for the map "click" event
map.on('click', function(e) {

    // Build the URL for a GetFeatureInfo
    var url = getFeatureInfoUrl(
                    map,
                    layer,
                    e.latlng,
                    {
                        'info_format': 'application/json',
                        'propertyName': 'NAME,AREA_CODE,DESCRIPTIO'
                    }
                );

    // Send the request and create a popup showing the response
    reqwest({
        url: url,
        type: 'json',
    }).then(function (data) {
        var feature = data.features[0];
        L.popup()
        .setLatLng(e.latlng)
        .setContent(L.Util.template("<h2>{NAME}</h2><p>{DESCRIPTIO}</p>", feature.properties))
        .openOn(map);
    });

});

/**
 * Return the WMS GetFeatureInfo URL for the passed map, layer and coordinate.
 * Specific parameters can be passed as params which will override the
 * calculated parameters of the same name.
 */
function getFeatureInfoUrl(map, layer, latlng, params) {

    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
        size = map.getSize(),
        bounds = map.getBounds();
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();
       /* sw = crs.projection._proj.forward([sw.lng, sw.lat]),
        ne = crs.projection._proj.forward([ne.lng, ne.lat]);*/


    var defaultParams = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: layer._crs.code,
        styles: '',
        version: layer._wmsVersion,
        format: layer.options.format,
        //bbox: [sw.join(','), ne.join(',')].join(','),
	bbox:sw.lat+','+sw.lng+','+ne.lat+','+ne.lng,
        height: size.y,
        width: size.x,
        layers: layer.options.layers,
        query_layers: layer.options.layers,
        info_format: 'text/html'
    };

    params = L.Util.extend(defaultParams, params || {});

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return layer._url + L.Util.getParamString(params, layer._url, true);

}


