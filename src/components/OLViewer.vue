<template>
  <div id="map-root" ref="map-root">
    <div id="custom-controls">
      <v-text-field
        v-model="newOlZoom"
        label="Zoom (3 à 20)"
        type="number"
        min="0"
        max="20"
        variant="solo"
        density="compact"
        @click:append-inner="changeOlZoom"
        @keydown.enter="changeOlZoom"
        @blur="changeOlZoom"
      >
        <!-- append-inner-icon="mdi-check" -->
        <template #append-inner>
          <v-icon
            class="mt-3"
            :class="newOlZoom == currOlZoom ? '' : 'icon-darkblue'"
            icon="mdi-check"
            @click="changeOlZoom"
          />
        </template>
      </v-text-field>
    </div>
    <div id="custom-zoom">
      <v-btn
        class="custom-zoom-btn mb-1"
        density="compact"
        icon
        @click="plusZoom"
      >
        <v-icon class="zoom-icon" icon="mdi-plus" />
      </v-btn>
      <v-btn
        class="custom-zoom-btn"
        density="compact"
        icon
        @click="minusZoom"
      >
        <v-icon class="zoom-icon" icon="mdi-minus" />
      </v-btn>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import * as ol from 'ol'
  import * as olProj from 'ol/proj'
  import { get as getProjection } from 'ol/proj.js'
  import { getTopLeft, getWidth } from 'ol/extent.js'
  import Map from 'ol/Map'
  import View from 'ol/View'
  import OSM from 'ol/source/OSM'
  import TileLayer from 'ol/layer/Tile'
  import TileWMS from 'ol/source/TileWMS.js'
  import WMTS from 'ol/source/WMTS.js'
  import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
  import proj4 from 'proj4'
  import { register } from 'ol/proj/proj4'

  // Singleton OL Map
  var olMap = null
  var olLayers = []

  // Import Ortho data conf file
  var ortho = require('../datas/Ortho.json')

  export default {
    name: 'MapContainer',
    data() {
      return {
        newOlZoom: null,
      }
    },
    computed: {
      ...mapGetters({
        getSelectedPos: 'map/getSelectedPos',
        getOpenedMockup: 'map/getOpenedMockup',
        getIsFullscreen: 'map/getIsFullscreen',
        getCurrentMockupBbox: 'map/getCurrentMockupBbox',
        getOlZoom: 'map/getOlZoom'
      }),
      currOlZoom() {
        return this.getOlZoom
      }
    },
    mounted() {
      // ===== Bind Events =====
      this.$evtBus.on('onTravelForProjection', this.goToMockup)
      
      // ===== Init OL =====
      this.initOlLayers()
      this.addCustomProj()

      // Set initial OL Zoom
      this.newOlZoom = this.currOlZoom

      // ===== Create OL Map =====
      olMap = new Map({
        control: [],
        layers: olLayers,
        target: this.$refs['map-root'],
        view: new View({
          // -------------
          // center: [4.835095, 45.757838],
          // projection: 'EPSG:2154',
          // center: [845989.4937740469, 6520401.078594064],
          // --------------
          center: [538240.3133371031, 5741627.150498441], //3857 (lyon default)
          zoom: this.currOlZoom,
          minZoom: 3,
          maxZoom: 20
          // constrainResolution: true
        }),
      })

      // DEBUG
      console.log('olMap')
      console.log(olMap)
      console.log('olMap.getView().getZoom()')
      console.log(olMap.getView().getZoom())
      console.log('olMap.getAllLayers()')
      console.log(olMap.getAllLayers())
      console.log('olMap.getLayers()')
      console.log(olMap.getLayers())

      var interactions = olMap.getInteractions();
      console.log('interactions')
      console.log(interactions)
      interactions.forEach(function(interaction) {
          // Search for interaction to desactivate
          if (interaction.constructor.name === 'DragZoom' || interaction.constructor.name === 'KeyboardZoom' || interaction.constructor.name === 'KeyboardPan' || interaction.constructor.name === 'PinchRotate' || interaction.constructor.name === 'DragRotate') {
              // Desactivate
              interaction.setActive(false);
          }
      });

      // ===== Watch OL Events =====
      olMap.on('moveend', function(evt) {
          // Get Zoom from view
          var newZoomLevel = olMap.getView().getZoom()
          console.log('Nouveau niveau de zoom :', newZoomLevel)
          // Set in store + local
          this.setOlZoom(parseFloat(newZoomLevel.toFixed(2)))
          this.newOlZoom = parseFloat(newZoomLevel.toFixed(2))
      }.bind(this))
    },
    methods: {
      ...mapActions({
        setOlZoom: 'map/setOlZoom'
      }),
      initOlLayers() {
        // --- Init var for WMTS OrthoImagery ---
        const projectionOrtho = getProjection('EPSG:3857')
        const projectionExtentOrtho = projectionOrtho.getExtent()
        const sizeOrtho = getWidth(projectionExtentOrtho) / 256
        const resolutionsOrtho = new Array(19)
        const matrixIdsOrtho = new Array(19)
        for (let z = 0; z < 19; ++z) {
          // generate resolutions and matrixIds arrays for this WMTS
          resolutionsOrtho[z] = sizeOrtho / Math.pow(2, z)
          matrixIdsOrtho[z] = z
        }

        // --- Init var for WMTS CALQUE ---
        const projectionCalq = getProjection('EPSG:4326')
        const projectionExtentCalq = projectionCalq.getExtent()
        const sizeCalq = getWidth(projectionExtentCalq) / 256
        const resolutionsCalq = new Array(19)
        const matrixIdsCalq = new Array(19)
        for (let z = 0; z < 19; ++z) {
          // generate resolutions and matrixIds arrays for this WMTS
          resolutionsCalq[z] = sizeCalq / Math.pow(2, z + 1)
          matrixIdsCalq[z] = 'EPSG:4326:' + z
        }
        
        olLayers = [
          // INFO: OSM fdp
          new TileLayer({
            visible: false,
            source: new OSM() // tiles are served by OpenStreetMap
          }),
          // INFO: WMTS IGN OrthoImagery Layer
          new TileLayer({
            visible: true,
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
            extent: [542514.5195642435, 5742717.405373302, 543648.7387576812, 5743648.423984917]
          }),
          // TODO: WMS Bruit > Manque style
          // new TileLayer({
          //   visible: false,
          //   source: new TileWMS({
          //     url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
          //     params: { 'LAYERS': 'grandlyon:GL_Rte_Lden', 'SLD': 'https://documents.exo-dev.fr/metropole/style_raster_bruit.sld' },
          //     serverType: 'geoserver',
          //     transition: 0,
          //   }),
          // }),
          // INFO: WMTS CALQUE Layer
          new TileLayer({
            visible: false,
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
        ]
      },
      addCustomProj() {
        // Define new custom coord
        proj4.defs('EPSG:2154','+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:4978','+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs');
        // Register new custom coord
        register(proj4)
      },  
      goToMockup() {
        // GET BBOX FROM STORE (str)
        const currBbox = this.getCurrentMockupBbox
        // DEBUG
        // console.log('bbox getter')
        // console.log(currBbox)

        // Convert into Array (and convert to Float)
        const currBboxStrArray = currBbox.split(', ')
        const currBboxArray = []
        currBboxStrArray.forEach(element => {
          currBboxArray.push(parseFloat(element))
        })
        // DEBUG
        // console.log(currBboxArray)


        // TODO: Transform bbox from EPSG:2154 to EPSG:3857 with OL
        // const bboxOrigin = [845600.9314362408, 6520086.293301369, 846378.0511953031, 6520715.868384956]
        const extent = olProj.transformExtent(currBboxArray, 'EPSG:2154', 'EPSG:3857')
        console.log('new bbox extent')
        console.log(extent)

        // GoTo extent converted
        olMap.getView().fit(extent)


      },
      verifyOlZoom() {
        // Min or null value
        if (!this.newOlZoom || this.newOlZoom < 3) {
          this.newOlZoom = 3
        }

        // Max value
        if (this.newOlZoom > 20) {
          this.newOlZoom = 20
        }
      },
      changeOlZoom() {
        this.verifyOlZoom()

        // Set Zoom in view
        olMap.getView().setZoom(this.newOlZoom)
        // Set Zoom in store
        this.setOlZoom(this.newOlZoom)
      },
      minusZoom() {
        this.newOlZoom -= 0.1
        
        // Max value
        if (this.newOlZoom < 3) {
          this.newOlZoom = 3
        }

        // Set Zoom in view
        olMap.getView().setZoom(this.newOlZoom)
        // Set Zoom in store
        this.setOlZoom(this.newOlZoom)
      },
      plusZoom() {
        this.newOlZoom += 0.1
        
        // Max value
        if (this.newOlZoom > 20) {
          this.newOlZoom = 20
        }

        // Set Zoom in view
        olMap.getView().setZoom(this.newOlZoom)
        // Set Zoom in store
        this.setOlZoom(this.newOlZoom)
      }
    }
  }
</script>

<style lang="scss">
#map-root {
  width: 100%;
  height: 100%;
  background: black;
}
.ol-zoom {
  display: none;
}

#custom-controls {
  position: absolute;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  bottom: 1.5em;
  right: 3.5em;
  z-index: 3;

  input {
    border-bottom: 1px solid grey !important;
  }
}
.icon-darkblue {
  color: #388e3c !important;
  opacity: 1 !important;
  font-weight: bold;
}
#custom-zoom {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: center;
  bottom: 2.8em;
  right: 1em;
  z-index: 3;
}
.custom-zoom-btn {
  border-radius: 6px !important;

  .zoom-icon {
    font-size: 18px;
  }
}
</style>