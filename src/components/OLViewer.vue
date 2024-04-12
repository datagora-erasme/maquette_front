<template>
  <div id="map-root" ref="map-root" />
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import * as olProj from 'ol/proj';
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

  // DEBUG Import iTowns to reproj
  import * as itowns from '@/node_modules/itowns/dist/itowns'

  import proj4 from 'proj4';
  import { register } from 'ol/proj/proj4.js';

  // Singleton OL Map
  var olMap = null

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

  export default {
    name: 'MapContainer',
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        getSelectedPos: 'map/getSelectedPos',
        getOpenedMockup: 'map/getOpenedMockup',
        getIsFullscreen: 'map/getIsFullscreen',
      }),
    },
    mounted() {
      // ===== Bind Events =====
      this.$evtBus.on('onTravelForProjection', this.goToMockup)
      console.log(this.$evtBus)

      // proj4.defs['EPSG:2154'] = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
      // register(proj4);
      // const proj2154 = getProjection('EPSG:2154');
      // proj2154.setExtent([0, 0, 700000, 1300000]);

      // this is where we create the OpenLayers map
      olMap = new Map({
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
          // -------------
          // center: [4.835095, 45.757838],
          // projection: 'EPSG:2154',
          // center: [845989.4937740469, 6520401.078594064],
          // --------------
          center: [538240.3133371031, 5741627.150498441], //3857 (default)
          center: [543081.6043775391, 5743182.916149397], //3857 (converted gratteciel)
          zoom: 18,
          // constrainResolution: true
        }),
      })

      // DEBUG
      console.log(olMap)
      // console.log(olMap.view.crs)
      // this.goToMockup()
    },
    methods: {
      goToMockup() {
        // DEBUG
        console.log('olMap')
        console.log(olMap)
        console.log(this)
        // console.log('this.olMap.getLayers()')
        // console.log(this.olMap.getLayers())
        // console.log('this.olMap.getView()')
        // console.log(this.olMap.getView())

        // TODO: GET BBOX FROM STORE ?
        // const bbox = this.getOpenedMockup()
        // console.log(bbox)

        // {"bbox":"845600.9314362408, 6520086.293301369, 846378.0511953031, 6520715.868384956","pos":{"isCoordinates":true,"crs":"EPSG:4978","x":4440836.300916875,"y":379042.0116279596,"z":4547385.7553764675,"_normal":{"x":0,"y":0,"z":0},"_normalNeedsUpdate":true},"rotation":-1.6867438373981044e-14}

        // 3857 - x: 543546.096793 / y: 5743389.925034
        // 3857 - {"x":543081.6043775391,"y":5743182.916149397,"z":168.2260222453624}

        // 2154 - {"x":845989.4937740469,"y":6520401.078594064,"z":168.2260222453624}

        // TODO: Reproj coords
        // const result = { x: 4440836.300916875, y: 379042.0116279596 } // z: 4547385.7553764675
        const result = [4440836.300916875, 379042.0116279596, 4547385.7553764675] // z: 4547385.7553764675
        console.log('result')
        console.log(result)
        let convertCoord = new itowns.Coordinates('EPSG:4978', result).as('EPSG:3857')
        console.log('<br> Test convert 4978 to 3857 : ' + JSON.stringify({ x: convertCoord.x, y: convertCoord.y, z: convertCoord.z }))
        // let convertCoord = new itowns.Coordinates('EPSG:4978', result).as('EPSG:2154')
        // console.log('<br> Test convert 4978 to 2154 : ' + JSON.stringify({ x: convertCoord.x, y: convertCoord.y, z: convertCoord.z }))

        const bbMin = [845600.9314362408, 6520086.293301369]
        console.log('bbMin')
        console.log(bbMin)
        let convertBbMin = new itowns.Coordinates('EPSG:4978', bbMin).as('EPSG:3857')
        console.log('bbmin 4978 to 3857 : ' + JSON.stringify({ x: convertBbMin.x, y: convertBbMin.y }))
        
        const bbMax = [846378.0511953031, 6520715.868384956]
        console.log('bbMax')
        console.log(bbMax)
        let convertBbMax = new itowns.Coordinates('EPSG:4978', bbMax).as('EPSG:3857')
        console.log('bbmax 4978 to 3857 : ' + JSON.stringify({ x: convertBbMax.x, y: convertBbMax.y }))

        const bbConvert = [convertBbMin.x, convertBbMin.y, convertBbMax.x, convertBbMax.y]
        console.log(bbConvert)

        // TODO: SOL 2 with OL
        proj4.defs['EPSG:2154'] = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
        
        proj4.defs('EPSG:4978','+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs');

        console.log('olProj')
        console.log(olProj)
        olProj.proj4.register(proj4);
        
        // transform bbox from EPSG:4978 to EPSG:3857
        const bboxOrigin = [845600.9314362408, 6520086.293301369, 846378.0511953031, 6520715.868384956]
        const extent = olProj.transformExtent(bboxOrigin, 'EPSG:4978', 'EPSG:3857');

        olMap.getView().fit(extent);

        // const bbPoly = 
      }
    }
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