<template>
  <div ref="map-root" style="width: 100%; height: 100%" />
</template>

<script>
  import Map from 'ol/Map'
  import OSM from 'ol/source/OSM'
  import TileLayer from 'ol/layer/Tile'
  import View from 'ol/View'
  // we’ll need these additional imports
  import VectorLayer from 'ol/layer/Vector'
  import VectorSource from 'ol/source/Vector'
  import GeoJSON from 'ol/format/GeoJSON'
  // NEW
  import TileWMS from 'ol/source/TileWMS.js';
  import WMTS from 'ol/source/WMTS.js';
  import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
  import { get as getProjection } from 'ol/proj.js';
  import { getTopLeft, getWidth } from 'ol/extent.js';

  // importing the OpenLayers stylesheet is required for having
  // good looking buttons!
  
  // import 'ol/ol.css'

  // Init var for WMTS CALQUE
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

  export default {
    name: 'MapContainer',
    components: {},
    props: {},
    mounted() {
      // this is where we create the OpenLayers map
      new Map({
        // the map will be created using the 'map-root' ref
        target: this.$refs['map-root'],
        layers: [
          // adding a background tiled layer
          new TileLayer({
            source: new OSM() // tiles are served by OpenStreetMap
          }),
          // TODO: WMS Bruit
          new TileLayer({
            // extent: [-13884991, 2870341, -7455066, 6338219],
            source: new TileWMS({
              url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
              params: { 'LAYERS': 'grandlyon:GL_Rte_Lden', 'SLD': 'https://documents.exo-dev.fr/metropole/style_raster_bruit.sld' },
              // serverType: 'geoserver',
              // Countries have transparency, so do not fade tiles:
              transition: 0,
            }),
          }),
          // WMTS CALQUE Layer
          // new TileLayer({
          //   opacity: 0.7,
          //   source: new WMTS({
          //     attributions: '- Métropole de Lyon',
          //     url: 'https://geoserver-planta.exo-dev.fr/geoserver/gwc/service/wmts',
          //     layer: 'Metropole:calque_plantabilite_metropole',
          //     matrixSet: 'EPSG:4326',
          //     format: 'image/png',
          //     projection: projectionCalq,
          //     tileGrid: new WMTSTileGrid({
          //       origin: getTopLeft(projectionExtentCalq),
          //       resolutions: resolutionsCalq,
          //       matrixIds: matrixIdsCalq,
          //     }),
          //     style: 'style_calque_planta',
          //     wrapX: true,
          //   }),
          // }),
        ],

        // the map view will initially show the whole world
        view: new View({
          zoom: 0,
          center: [0, 0],
          constrainResolution: true
        }),
      })
    },
  }
</script>