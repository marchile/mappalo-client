L.mapbox.accessToken = 'pk.eyJ1IjoibWFyY29iYXJiaWVyaSIsImEiOiJpU3pTWFFrIn0.GlDg3OgUheOFRBU5siy76w';
var map, featureList, /*boundingboxSearch = [],*/ rifugiSearch = [], bivacchiSearch = [];

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$(document).on("mouseover", ".feature-row", function(e) {
  highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(boundingbox.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 15);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Basemap Layers */
var mappm = L.layerGroup([L.tileLayer("http://www.webmapp.it/maps/piemonte/pmt/{z}/{x}/{y}.png", {
  maxZoom: 15,
  attribution: 'Map data: (c) <a href="http://www.dati.piemonte.it/" target="_blank">Regione Piemonte</a>, under CC-BY'
}), L.mapbox.tileLayer('marcobarbieri.6f24b918')]);
var mapsat =  L.mapbox.tileLayer('marcobarbieri.l0ca30pl');



var mapfis = L.tileLayer("http://www.webmapp.it/maps/piemonte/pmt/{z}/{x}/{y}.png", {
  maxZoom: 15,
  attribution: 'Map data: (c) <a href="http://www.dati.piemonte.it/" target="_blank">Regione Piemonte</a>, under CC-BY'
});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var boundingbox = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "black",
      fill: false,
      opacity: 1,
      clickable: false
    };
  }
});
$.getJSON("data/boundingbox.geojson", function (data) {
  boundingbox.addData(data);
});

/** Refacoring Actions sentieri **/
function sentieriAll(type,color,weight,type_icon) {
	var sentieriLwn = L.geoJson(null, {
  style: function (feature) {
      return {
        color: color,
        weight: weight,
        opacity: 0.8
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
		var content = "<div> <table class='table table-striped table-bordered table-condensed'>";
		content = content + "<tr><th>Network</th><td>Importanza " + type + "  <img src='assets/icons/"+type_icon+"' width='34' height='6'></td></tr>";
        if(feature.properties.route_name) content = content + "<tr><th>Nome</th><td>" + feature.properties.route_name + "</td></tr>" ;
        if(feature.properties.ref) content = content + "<tr><th>Numero o codice</th><td>" + feature.properties.ref  + "</td></tr>" ;
        if(feature.properties.operator) content = content + "<tr><th>Ente gestore</th><td>" + feature.properties.operator  + "</td></tr>" ;
//         "<tr><th>Stato</th><td>" + feature.properties.state + "</td></tr>" +
		if(feature.properties.description) content = content + "<tr><th>Descrizione</th><td>" + feature.properties.description  + "</td></tr>" ;
		if(feature.properties.distance) content = content + "<tr><th>Lunghezza</th><td>" + feature.properties.distance + "</td></tr>" ;
		if(feature.properties.ascent) content = content + "<tr><th>Dislivello positivo</th><td>" + feature.properties.ascent + "</td></tr>" ;
		if(feature.properties.descent) content = content + "<tr><th>Dislivello negativo</th><td>" + feature.properties.descent + "</td></tr>" ;
		if(feature.properties.roundtrip) content = content + "<tr><th>Percorso circolare</th><td>" + feature.properties.roundtrip  + "</td></tr>" ;
		if(feature.properties.website) content = content + "<tr><th>Web</th><td><a class='url-break' href='" + feature.properties.website + "' target='_blank'>" + feature.properties.website + "</a></td></tr>" ;
		content = content + "</table></div>";
		
      var nomesent = "<p>" + feature.properties.ref + " " + feature.properties.route_name + "</p>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(nomesent);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
      map.fitBounds(e.target.getBounds());
        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: weight,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        sentieriLwn.resetStyle(e.target);
      }
    });
  }
});

return sentieriLwn;

};

var sentieriLwn = sentieriAll("locale","#E53920", 3 ,"lwn.png");
var sentieriIwn = sentieriAll("internazionale","#BD00BF", 5 ,"iwn.png");
var sentieriNwn = sentieriAll("nazionale","#30A500", 5 ,"nwn.png");
var sentieriRwn = sentieriAll("regionale","#FF8806", 5 ,"rwn.png");

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 15
});

/* Empty layer placeholder to add to layer control for listening when to add/remove rifugi to markerClusters layer */
var rifugiLayer = L.geoJson(null);
var rifugi = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
//      iconUrl: 'icons/' + feature.properties.icon + '.png'
        iconUrl: "assets/icons/red.png",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -40],
        shadowUrl: 'assets/icons/marker-shadow.png',
        shadowSize:   [41, 41],
        shadowAnchor: [14, 41]
      }),
      title: feature.properties.name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.name + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.phone + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.website + "' target='_blank'>" + feature.properties.website + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });

      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/icons/red.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      rifugiSearch.push({
        name: layer.feature.properties.name,
//        address: layer.feature.properties.ADDRESS1,
        source: "rifugi",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/rifugiosm.geojson", function (data) {
  rifugi.addData(data);
  map.addLayer(rifugiLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove bivacchi to markerClusters layer */
var bivacchiLayer = L.geoJson(null);
var bivacchi = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
//      iconUrl: 'icons/' + feature.properties.icon + '.png'
        iconUrl: "assets/icons/blue.png",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -40],
        shadowUrl: 'assets/icons/marker-shadow.png',
        shadowSize:   [41, 41],
        shadowAnchor: [14, 41]
      }),
      title: feature.properties.name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.name + "</td></tr>" + "<tr><th>Quota</th><td>" + feature.properties.ele + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/icons/blue.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      bivacchiSearch.push({
        name: layer.feature.properties.name,
        source: "Bivacchi",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/bivacchiosm.geojson", function (data) {
  bivacchi.addData(data);
  map.addLayer(bivacchiLayer);
});


var southWest = L.latLng(43.7741,6.5369),
    northEast = L.latLng(46.4729,9.4016),
    bounds = L.latLngBounds(southWest, northEast);

map = L.map('map', {
  layers: [mappm, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false,
  maxBounds: bounds,
  minZoom: 9,
  maxZoom: 15
});


/* Layer control listeners that allow for a single markerClusters layer */


map.on("load", function ( e ) {
      var bbox = (map.getBounds().toBBoxString());
      var pgiwn_url = "http://188.166.15.99/mappalo/pgiwn.php?bbox="+bbox;
      var pgnwn_url = "http://188.166.15.99/mappalo/pgnwn.php?bbox="+bbox;
      var pgrwn_url = "http://188.166.15.99/mappalo/pgrwn.php?bbox="+bbox;
      var pglwn_url = "http://188.166.15.99/mappalo/pglwn.php?bbox="+bbox;
      $.getJSON(pgiwn_url, function (data) {
      sentieriIwn.addData(data);
      map.addLayer(sentieriIwn);
      });
   if (map.getZoom() > 10) {
      $.getJSON(pgnwn_url, function (data) {
      sentieriNwn.addData(data);
      map.addLayer(sentieriNwn);
      });
      $.getJSON(pgrwn_url, function (data) {
      sentieriRwn.addData(data);
      map.addLayer(sentieriRwn);
      });
      }
   if (map.getZoom() > 11) {
      $.getJSON(pglwn_url, function (data) {
      sentieriLwn.addData(data);
      map.addLayer(sentieriLwn);
      });
      }
});

map.setView([45.2903, 7.9898], 12);

map.on("moveend", function ( e ) {
      var bbox = (map.getBounds().toBBoxString());
      var pgiwn_url = "http://188.166.15.99/mappalo/pgiwn.php?bbox="+bbox;
      var pgnwn_url = "http://188.166.15.99/mappalo/pgnwn.php?bbox="+bbox;
      var pgrwn_url = "http://188.166.15.99/mappalo/pgrwn.php?bbox="+bbox;
      $.getJSON(pgiwn_url, function (data) {
      sentieriIwn.addData(data);
      });
   if (map.getZoom() > 10) {
      $.getJSON(pgnwn_url, function (data) {
      sentieriNwn.addData(data);
      map.addLayer(sentieriNwn);
      });
      $.getJSON(pgrwn_url, function (data) {
      sentieriRwn.addData(data);
      map.addLayer(sentieriRwn);
      });
      } else {
        map.removeLayer(sentieriNwn);
        map.removeLayer(sentieriRwn);
      }
});

map.on("moveend", function ( e ) {
      var bbox = (map.getBounds().toBBoxString());
      var pglwn_url = "http://188.166.15.99/mappalo/pglwn.php?bbox="+bbox;
   if (map.getZoom() > 11) {
      $.getJSON(pglwn_url, function (data) {
      sentieriLwn.addData(data);
      map.addLayer(sentieriLwn);
      });
      } else {
        map.removeLayer(sentieriLwn);
      }
});

map.on("overlayadd", function(e) {
  if (e.layer === rifugiLayer) {
    markerClusters.addLayer(rifugi);
  }
  if (e.layer === bivacchiLayer) {
    markerClusters.addLayer(bivacchi);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === rifugiLayer) {
    markerClusters.removeLayer(rifugi);
  }
  if (e.layer === bivacchiLayer) {
    markerClusters.removeLayer(bivacchi);
  }
});


/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}



var baseMaps = {
  "Mappa": mappm,
  "Satellite": mapsat,
  "Mappa fisica": mapfis
};

var overlayMaps = {
    "<img src='assets/icons/red.png' width='19' height='22'>&nbsp;Rifugi": rifugiLayer,
    "<img src='assets/icons/blue.png' width='19' height='22'>&nbsp;Bivacchi": bivacchiLayer
  };

var layerControl = L.control.layers(baseMaps, overlayMaps, {
  position: "bottomleft",
  collapsed: isCollapsed
}).addTo(map);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  follow: true
}).addTo(map);



/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();

  var rifugiBH = new Bloodhound({
    name: "Rifugi",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: rifugiSearch,
    limit: 10
  });

  var bivacchiBH = new Bloodhound({
    name: "Bivacchi",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: bivacchiSearch,
    limit: 10
  });
/*
  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
*/
//  boundingboxBH.initialize();
  rifugiBH.initialize();
  bivacchiBH.initialize();
//  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  },
/*
   {
    name: "Boroughs",
    displayKey: "name",
    source: boundingboxBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Boroughs</h4>"
    }
  },
*/
   {
    name: "Rifugi",
    displayKey: "name",
    source: rifugiBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/icons/red.png' width='24' height='28'>&nbsp;Rifugi</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Bivacchi",
    displayKey: "name",
    source: bivacchiBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/icons/blue.png' width='24' height='28'>&nbsp;Bivacchi</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }
/*,
   {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }
*/
  ).on("typeahead:selected", function (obj, datum) {
/*    if (datum.source === "Boroughs") {
      map.fitBounds(datum.bounds);
    }
*/
    if (datum.source === "rifugi") {
      if (!map.hasLayer(rifugiLayer)) {
        map.addLayer(rifugiLayer);
      }
      map.setView([datum.lat, datum.lng], 15);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Bivacchi") {
      if (!map.hasLayer(bivacchiLayer)) {
        map.addLayer(bivacchiLayer);
      }
      map.setView([datum.lat, datum.lng], 15);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
/*
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
*/
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});
