var mapcenter=[42.5424371, 1.4572426];
var mapzoom=8;
var maptoken='pk.eyJ1IjoiYWNvcm9uYWRvYyIsImEiOiJjamlwMG0zOGUwdDV2M3Bud2d6dXN6Nzh4In0.FuCykMm8Fl7qVla2DEfyiQ';

/* Mapa */
document.addEventListener("DOMContentLoaded", function(event) { 
	var mymap = L.map('mapid').setView(mapcenter, mapzoom);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+maptoken, {
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'your.mapbox.access.token'
	}).addTo(mymap);

	mymap.on('click', onMapClick);
	});

function onMapClick(e) {
	getInfo( e.latlng.lat, e.latlng.lng);
	}


/* Datos */
function getInfo(lat,lng) {
	var data=getData(lat,lng);

	fetch("http://127.0.0.1:9200/ciudades/ciudades/_search?pretty", {
	    body: data,
	    headers: {
		'Content-Type': 'application/json'
		},
	    mode: 'cors',
	    method: 'POST', 
	  }).then(function( response ) { 
		response.json().then(function(json) {
			results(json);
			});
		});
	}

function results(json) {
	var s="";
	var countries={};

	for ( var i=0; i<json.hits.hits.length; i++ ) {
		s+="<div>";
		s+=json.hits.hits[i]._source.accentCity+" ("+json.hits.hits[i]._source.country+")";
		s+="</div>";

		if ( countries[ json.hits.hits[i]._source.country ] == undefined )
			countries[ json.hits.hits[i]._source.country ]=1;
			else
			countries[ json.hits.hits[i]._source.country ]++;
		}

	document.getElementById("total").innerHTML=json.hits.total;
	document.getElementById("cities").innerHTML=s;
	document.getElementById("countries").innerHTML=JSON.stringify(countries);		
	}

function getData(lat,lng) {
	return '{'+
		'    "size" : 100,'+
		'    "query": {'+
		'        "bool" : {'+
		'            "must" : {'+
		'                "match_all" : {}'+
		'            },'+
		'            "filter" : {'+
		'                "geo_distance" : {'+
		'                    "distance" : "60km",'+
		'                    "location" : {'+
		'                        "lat" : '+lat+','+
		'                        "lon" : '+lng+
		'                    }'+
		'                }'+
		'            }'+
		'        }'+
		'    },'+
		'   "aggs" : {'+
		'        "paises" : {'+
		'           "terms" : { "field" : "country" }, '+
		'           "aggs" : {'+
		'              "centros": {'+
		'                "geo_centroid" : { "field" : "location" }'+
		'                }'+
		'              }'+
		'           }'+
		'        }'+
		'}';
	}
