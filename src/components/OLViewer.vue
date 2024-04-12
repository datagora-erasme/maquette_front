<template>
  <div id="map-root" ref="map-root" />
</template>

<script>
  import Map from 'ol/Map'
  import OSM from 'ol/source/OSM'
  import TileLayer from 'ol/layer/Tile'
  import View from 'ol/View'
  import { FullScreen, Control, defaults as defaultControls } from 'ol/control.js';
  // we’ll need these additional imports
  import VectorLayer from 'ol/layer/Vector'
  import VectorSource from 'ol/source/Vector'
  import GeoJSON from 'ol/format/GeoJSON'
  import TileWMS from 'ol/source/TileWMS.js';
  import WMTS from 'ol/source/WMTS.js';
  import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
  import { get as getProjection } from 'ol/proj.js';
  import { getTopLeft, getWidth } from 'ol/extent.js';
  // import 'ol/ol.css'

  // Import Ortho data conf file
  var ortho = require('../datas/Ortho.json')

  // --- Init var for WMTS OrthoImagery ---
  const projectionOrtho = getProjection('EPSG:3857');
  const projectionExtentOrtho = projectionOrtho.getExtent();
  const sizeOrtho = getWidth(projectionExtentOrtho) / 256;
  const resolutionsOrtho = new Array(19);
  const matrixIdsOrtho = new Array(19);
  for (let z = 0; z < 19; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutionsOrtho[z] = sizeOrtho / Math.pow(2, z);
    matrixIdsOrtho[z] = z;
  }

  // --- Init var for WMTS CALQUE ---
  const projectionCalq = getProjection('EPSG:4326');
  const projectionExtentCalq = projectionCalq.getExtent();
  const sizeCalq = getWidth(projectionExtentCalq) / 256;
  const resolutionsCalq = new Array(19);
  const matrixIdsCalq = new Array(19);
  for (let z = 0; z < 19; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutionsCalq[z] = sizeCalq / Math.pow(2, z + 1);
    matrixIdsCalq[z] = 'EPSG:4326:' + z;
  }

  // --- Custom OLL Control ---
  class RotateNorthControl extends Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
      const options = opt_options || {};

      const button = document.createElement('button');
      button.innerHTML = 'N';

      const element = document.createElement('div');
      element.className = 'rotate-north ol-unselectable ol-control';
      element.appendChild(button);

      super({
        element: element,
        target: options.target,
      });

      button.addEventListener('click', this.handleRotateNorth.bind(this), false);
    }

    handleRotateNorth() {
      // this.getMap().getView().setRotation(0);

      const size = this.getMap().getSize();
      const coord = [543546.096793, 5743389.925034]
      this.getMap().getView().centerOn(coord, size, [570, 500])
    }
  }

  // {"bbox":"845600.9314362408, 6520086.293301369, 846378.0511953031, 6520715.868384956","pos":{"isCoordinates":true,"crs":"EPSG:4978","x":4440836.300916875,"y":379042.0116279596,"z":4547385.7553764675,"_normal":{"x":0,"y":0,"z":0},"_normalNeedsUpdate":true},"rotation":-1.6867438373981044e-14}

  // 3857 - x: 543546.096793 / y: 5743389.925034

  export default {
    name: 'MapContainer',
    components: {},
    props: {},
    mounted() {
      // this is where we create the OpenLayers map
      const olMap = new Map({
        controls: defaultControls().extend([new FullScreen(), new RotateNorthControl]),
        layers: [
          // adding a background tiled layer
          new TileLayer({
            source: new OSM() // tiles are served by OpenStreetMap
          }),
          // TODO: WMS Bruit > Manque style
          // new TileLayer({
          //   // extent: [-13884991, 2870341, -7455066, 6338219],
          //   source: new TileWMS({
          //     url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
          //     params: { 'LAYERS': 'grandlyon:GL_Rte_Lden', 'SLD': 'https://documents.exo-dev.fr/metropole/style_raster_bruit.sld' },
          //     // serverType: 'geoserver',
          //     // Countries have transparency, so do not fade tiles:
          //     transition: 0,
          //   }),
          // }),
          // INFO: WMTS IGN OrthoImagery Layer
          new TileLayer({
            opacity: 1,
            source: new WMTS({
              attributions: "<a href='" + ortho.source.attribution.url + "' target='_blank'>" + ortho.source.attribution.name + '</a>',
              url: ortho.source.url,
              layer: ortho.source.name,
              matrixSet: ortho.source.tileMatrixSet,
              format: ortho.source.format,
              projection: projectionOrtho,
              tileGrid: new WMTSTileGrid({
                origin: getTopLeft(projectionExtentOrtho),
                resolutions: resolutionsOrtho,
                matrixIds: matrixIdsOrtho,
              }),
              style: 'normal',
              wrapX: true,
            }),
          }),
          // INFO: WMTS CALQUE Layer
          new TileLayer({
            opacity: 0.5,
            source: new WMTS({
              attributions: "- <a href='https://datagora.erasme.org/projets/calque-de-plantabilite/' target='_blank'>Métropole de Lyon</a>",
              url: 'https://geoserver-planta.exo-dev.fr/geoserver/gwc/service/wmts',
              layer: 'Metropole:calque_plantabilite_metropole',
              matrixSet: 'EPSG:4326',
              format: 'image/png',
              projection: projectionCalq,
              tileGrid: new WMTSTileGrid({
                origin: getTopLeft(projectionExtentCalq),
                resolutions: resolutionsCalq,
                matrixIds: matrixIdsCalq,
              }),
              style: 'style_calque_planta',
              wrapX: true,
            }),
          }),
        ],
        // the map view will initially show the whole world
        target: this.$refs['map-root'],
        view: new View({
          // projection: 'EPSG:4326',
          // center: [4.835095, 45.757838],
          center: [538240.3133371031, 5741627.150498441],
          zoom: 12,
          constrainResolution: true
        }),
      })

      // DEBUG
      console.log(olMap)
    },
  }
</script>

<style>
#map-root {
  width: 100%;
  height: 100%;
}

/* .ol-control {
  position: absolute;
  bottom: 2em !important;
  right: 1em !important;
} */
.rotate-north {
  position: absolute;
  bottom: 2em !important;
  right: 1em !important;
}
/* .ol-zoom {
  bottom: 2em !important;
  right: 1em !important;
} */
</style>