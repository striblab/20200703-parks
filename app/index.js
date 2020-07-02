/**
 * Main JS file for project.
 */

// Define globals that are added through the js.globals in
// the config.json file, here like this:
// /* global _ */

// Utility functions, such as Pym integration, number formatting,
// and device checking

import Popover from './shared/popover.js';
import StribPopup from './shared/popup.js';
import utilsFn from './utils.js';

import parks from '../sources/parks.json';
import parksneed from '../sources/parksneed.json';
import mpls from '../sources/minneapolis.json';

const utils = utilsFn({});

const popover_thresh = 500; // The width of the map when tooltips turn to popovers
const isMobile = (window.innerWidth <= popover_thresh || document.body.clientWidth) <= popover_thresh || utils.isMobile();
const adaptive_ratio = utils.isMobile() ? 1.1 : 1.3; // Height/width ratio for adaptive map sizing

let popover = new Popover('#map-popover');



let center = [-93.265354, 44.968524];
let zoom = 10.5;


mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhcnRyaWJ1bmUiLCJhIjoiY2sxYjRnNjdqMGtjOTNjcGY1cHJmZDBoMiJ9.St9lE8qlWR5jIjkPYd3Wqw';

/********** MAKE MAP **********/

// Set adaptive sizing
let mapHeight = window.innerWidth * adaptive_ratio;
document.getElementById("map").style.height = mapHeight.toString() + "px";

const zoomThreshold = 13;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
  center: center,
  zoom: zoom,
  minZoom: 10.5,
  maxZoom: 16,
  maxBounds: [-97.25, 43.2, -89.53, 49.5],
  scrollZoom: false
});

// $("#mapmain").css('pointer-events','none');

/********** SPECIAL RESET BUTTON **********/
class HomeReset {
  onAdd(map){
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl my-custom-control mapboxgl-ctrl-group';

    const button = this._createButton('mapboxgl-ctrl-icon StateFace monitor_button')
    this.container.appendChild(button);
    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
  _createButton(className) {
    const el = window.document.createElement('button')
    el.className = className;
    el.innerHTML = '&#x21BB;';
    el.addEventListener('click',(e)=>{
      e.style.display = 'none'
      console.log(e);
      // e.preventDefault()
      e.stopPropagation()
    },false )
    return el;
  }
}
const toggleControl = new HomeReset();

var scale = new mapboxgl.ScaleControl({
  maxWidth: 80,
  unit: 'imperial'
  });
  map.addControl(scale)

// Setup basic map controls
if (utils.isMobile()) {
  map.dragPan.disable();
  map.keyboard.disable();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.scrollZoom.disable();
  $("#map").css("pointer-events","none");
} else {

  map.getCanvas().style.cursor = 'pointer';
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }),'top-left');
  map.addControl(toggleControl,'top-left');

$('.my-custom-control').on('click', function(){
  map.jumpTo({
    center: center,
    zoom: zoom,
  });
});

}



/********** MAP BEHAVIORS **********/

map.on('load', function() {

  map.setPaintProperty(
    'water',
    'fill-color','#ededed' 
  );

  map.addSource('parks', {
    type: 'geojson',
    data: parks
  });
 
   map.addLayer({
        'id': 'parks-layer',
        'interactive': true,
        'source': 'parks',
        'layout': {},
        'type': 'fill',
          'paint': {
            'fill-antialias' : true,
            'fill-opacity': 0.8,
            'fill-outline-color': "#8cbf82",
            'fill-color': "#8cbf82"
          }
    }, 'road-primary');

    map.addSource('needed', {
      type: 'geojson',
      data: parksneed
    });
   
     map.addLayer({
          'id': 'needed-layer',
          'interactive': true,
          'source': 'needed',
          'layout': {},
          'type': 'fill',
            'paint': {
              'fill-antialias' : true,
              'fill-opacity': 0.8,
              'fill-outline-color': "#7D739C",
              'fill-color': "#7D739C"
            }
      }, 'road-primary');

      map.addSource('mpls', {
        type: 'geojson',
        data: mpls
      });

      map.addLayer({
            'id': 'mpls-layer',
            'interactive': true,
            'source': 'mpls',
            'layout': {},
            'type': 'line',
            'paint': {
              'line-width': 0.7,
              'line-color': '#aaaaaa'
            }
        });

});


$(document).ready(function() {
  if (($("#wrapper").width() < 500)) {
      map.flyTo({
          center: center,
          zoom: 10
      });
  }
  $(window).resize(function() {
      if (($("#wrapper").width() < 500)){
          map.flyTo({
              center: center,
              zoom: 10
          });
      } else {
          map.flyTo({
              center: center
          });
      }
  });
});