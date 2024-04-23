<template>
  <div id="map-root" ref="map-root">
    <!-- Arrow Controls -->
    <v-row id="custom-arrow">
      <v-col>
        <v-btn
          class="custom-arrow-btn mb-1"
          density="compact"
          color="#263238"
          icon
          @click="moveLeft"
        >
          <v-icon class="arrow-icon" style="color: #fff" icon="mdi-arrow-left" />
        </v-btn>
      </v-col>
      <v-col id="arrow-middle">
        <v-btn
          class="custom-arrow-btn mb-1"
          density="compact"
          color="#263238"
          icon
          @click="moveUp"
        >
          <v-icon class="arrow-icon" style="color: #fff" icon="mdi-arrow-up" />
        </v-btn>
        <!-- Save BTN #1CB800 // #676767 -->
        <v-btn
          class="custom-arrow-btn mb-1"
          density="compact"
          color="#676767" 
          icon
          @click="plusZoom"
        >
          <v-icon class="arrow-icon" style="color: #fff" icon="mdi-content-save" />
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Sauvegarder la position
          </v-tooltip>
        </v-btn>
        <v-btn
          class="custom-arrow-btn mb-1"
          density="compact"
          color="#263238"
          icon
          @click="moveDown"
        >
          <v-icon class="arrow-icon" style="color: #fff" icon="mdi-arrow-down" />
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          class="custom-arrow-btn mb-1"
          density="compact"
          color="#263238"
          icon
          @click="moveRight"
        >
          <v-icon class="arrow-icon" style="color: #fff" icon="mdi-arrow-right" />
        </v-btn>
      </v-col>
    </v-row>

    <!-- Zoom Controls -->
    <div id="custom-zoom">
      <v-btn
        class="custom-zoom-btn mb-1"
        density="compact"
        color="#263238"
        icon
        @click="plusZoom"
      >
        <v-icon class="zoom-icon" style="color: #fff" icon="mdi-plus" />
      </v-btn>
      <v-btn
        class="custom-zoom-btn"
        density="compact"
        color="#263238"
        icon
        @click="minusZoom"
      >
        <v-icon class="zoom-icon" style="color: #fff" icon="mdi-minus" />
      </v-btn>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import * as olProj from 'ol/proj'
  import { get as getProjection } from 'ol/proj.js'
  import { getTopLeft, getWidth } from 'ol/extent.js'
  import Map from 'ol/Map'
  import View from 'ol/View'
  import Style from 'ol/style/Style'
  import Fill from 'ol/style/Fill'
  import Stroke from 'ol/style/Stroke'
  import OSM from 'ol/source/OSM'
  import TileLayer from 'ol/layer/Tile'
  import TileWMS from 'ol/source/TileWMS.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import VectorSource from 'ol/source/Vector.js'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import { bbox as bboxStrategy } from 'ol/loadingstrategy.js'
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
        newOlCenterX: null,
        newOlCenterY: null,
        currExtent: null,
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
      this.$evtBus.on('onToggleLayerVisibility', this.toggleLayerVisibility)
      this.$evtBus.on('onChangeLayerOpacity', this.changeLayerOpacity)
      this.$evtBus.on('onChangeZoom', this.changeZoom)
      this.$evtBus.on('onChangeCenter', this.changeCenter)
      
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
          center: [845989.4937740469, 6520401.078594064],
          projection: 'EPSG:2154',
          zoom: this.currOlZoom,
          minZoom: 3,
          maxZoom: 20
          // constrainResolution: true
        }),
      })

      // DEBUG
      // console.log('olMap')
      // console.log(olMap)

      // ===== Disable some interactions in OL Map =====
      var interactions = olMap.getInteractions()
      interactions.forEach(function(interaction) {
          // Search for interaction to desactivate
          if (interaction.constructor.name === 'DragZoom' || interaction.constructor.name === 'KeyboardZoom' || interaction.constructor.name === 'KeyboardPan' || interaction.constructor.name === 'PinchRotate' || interaction.constructor.name === 'DragRotate') {
              // Desactivate
              interaction.setActive(false);
          }
      })

      // Get View center
      var newCenter = olMap.getView().getCenter()
      // Set Center in store + local
      this.newOlCenterX = newCenter[0]
      this.setOlCenterX(this.newOlCenterX)
      this.newOlCenterY = newCenter[1]
      this.setOlCenterY(this.newOlCenterY)

      // ===== Watch OL Events =====
      olMap.on('moveend', function(evt) {
          // Get Zoom from view
          var newZoomLevel = olMap.getView().getZoom()
          // DEBUG
          // console.log('Nouveau niveau de zoom :', newZoomLevel)

          // Set Zoom in store + local
          this.setOlZoom(parseFloat(newZoomLevel.toFixed(2)))
          this.newOlZoom = parseFloat(newZoomLevel.toFixed(2))

          // Get View center
          var newCenter = olMap.getView().getCenter()
          
          // DEBUG
          // console.log('newCenter: ', newCenter)

          // Set Center in store + local
          this.newOlCenterX = newCenter[0]
          this.setOlCenterX(this.newOlCenterX)
          this.newOlCenterY = newCenter[1]
          this.setOlCenterY(this.newOlCenterY)

          // Re-set Extent and refresh all VectorLayers in OL
          olMap.getAllLayers().forEach(layer => {
            if (layer.constructor.name === 'VectorLayer') {
              layer.setExtent(this.currExtent)
              layer.getSource().refresh()
            }
          })
      }.bind(this))
    },
    methods: {
      ...mapActions({
        setOlZoom: 'map/setOlZoom',
        setOlCenterX: 'map/setOlCenterX',
        setOlCenterY: 'map/setOlCenterY',
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
            source: new OSM(), // tiles are served by OpenStreetMap
            properties: {
              id: 'OpenStreetMap'
            }
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
            properties: {
              id: 'IGN_Orthophotos'
            }
          }),
          // TODO: WMS Bruit > Manque style
          new TileLayer({
            visible: false,
            source: new TileWMS({
              url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
              params: { 'LAYERS': 'grandlyon:GL_Rte_Lden', 'SLD': 'https://documents.exo-dev.fr/metropole/style_raster_bruit.sld' },
              serverType: 'geoserver',
              transition: 0,
            }),
            properties: {
              id: 'Bruit'
            }
          }),
          // INFO: WMTS CALQUE Layer
          new TileLayer({
            visible: false,
            opacity: 1,
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
            properties: {
              id: 'Calque_Planta'
            }
          }),
          // INFO: WFS BDTOPO (IGN)
          new VectorLayer({
            visible: true,
            opacity: 1,
            source: new VectorSource({
              format: new GeoJSON(),
              url: function(extent) {
                return this.computeWFSLink(extent)
              }.bind(this),
              strategy: bboxStrategy,
            }),
            style: {
              'stroke-width': 0.75,
              'stroke-color': 'black',
              'fill-color': 'rgba(255,255,255,1)',
            },
            properties: {
              id: 'IGN_Buildings'
            }
          })
        ]
      },
      computeWFSLink(extent) {
        var goodExtent = extent
        if (this.currExtent) {
          goodExtent = this.currExtent
        }

        return (
          'https://wxs.ign.fr/topographie/geoportail/wfs?SERVICE=WFS&' +
          'version=2.0.0&request=GetFeature&typename=BDTOPO_V3:batiment&' +
          'outputFormat=application/json&srsname=EPSG:2154&' +
          // 'outputFormat=application/json&srsname=EPSG:3857&' +
          'bbox=' +
          goodExtent.join(',') +
          ',EPSG:2154'
          // ',EPSG:3857'
        )
      },
      addCustomProj() {
        // Define new custom coord
        proj4.defs('EPSG:2154','+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:4978','+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs');
        // Register new custom coord
        register(proj4)
      },
      toggleLayerVisibility(layerId) {
        const currLayer = olMap.getAllLayers().find(l => l.get('id') === layerId)
        if (currLayer) {
          currLayer.setVisible(!currLayer.getVisible())
        }
      },
      changeLayerOpacity(newLayerOp) {
        const currLayer = olMap.getAllLayers().find(l => l.get('id') === newLayerOp.id)
        
        // DEBUG
        console.log(currLayer)
        console.log(currLayer.constructor.name)
        
        const ratioOpacity = newLayerOp.opacity / 100
        if (currLayer) {
          if (currLayer.constructor.name === 'VectorLayer') {
            // Change style (color alpha in rgba)
            var newStyle = new Style({
              fill: new Fill({
                color: 'rgba(255,255,255,'+ ratioOpacity + ')'
              }),
              stroke: new Stroke({
                color: 'rgba(0,0,0,'+ ratioOpacity + ')',
                width: 0.75
              })
            })
            
            // Re-set style in Layer
            currLayer.setStyle(newStyle)
          } else {
            // Change layer opacity
            currLayer.setOpacity(ratioOpacity)
          }
        }
      },
      goToMockup() {
        // Get current Mockup Bbox from Store (str)
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

        // Set current BBOX (EPSG:2154)
        this.currExtent = currBboxArray

        // GoTo Extent converted
        olMap.getView().fit(this.currExtent)

        // Set extent to all existing OL Layers
        olMap.getAllLayers().forEach(layer => {
          layer.setExtent(this.currExtent)
        })
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
      },
      moveLeft() {
        this.newOlCenterX -= 10

        // Min value
        if (this.newOlCenterX < -22000000) {
          this.newOlCenterX = -22000000
        }

        // Set Center in view
        olMap.getView().setCenter([this.newOlCenterX, this.newOlCenterY])
        // Set Center in store
        this.setOlCenterX(this.newOlCenterX)
      },
      moveRight() {
        this.newOlCenterX += 10

        // Max value
        if (this.newOlCenterX > 18500000) {
          this.newOlCenterX = 18500000
        }

        // Set Center in view
        olMap.getView().setCenter([this.newOlCenterX, this.newOlCenterY])
        // Set Center in store
        this.setOlCenterX(this.newOlCenterX)
      },
      moveUp() {
        this.newOlCenterY += 10

        // Max value
        if (this.newOlCenterY > 19600000) {
          this.newOlCenterY = 19600000
        }

        // Set Center in view
        olMap.getView().setCenter([this.newOlCenterX, this.newOlCenterY])
        // Set Center in store
        this.setOlCenterY(this.newOlCenterY)
      },
      moveDown() {
        this.newOlCenterY -= 10

        // Max value
        if (this.newOlCenterY < -19600000) {
          this.newOlCenterY = -19600000
        }

        // Set Center in view
        olMap.getView().setCenter([this.newOlCenterX, this.newOlCenterY])
        // Set Center in store
        this.setOlCenterY(this.newOlCenterY)
      },
      changeZoom(newZoom) {
        // Set Zoom in local
        this.newOlZoom = newZoom
        // Set Zoom in store
        this.setOlZoom(newZoom)
        // Set Zoom in view
        olMap.getView().setZoom(newZoom)
      },
      changeCenter(newCenter) {
        // Set Center in local
        this.newOlCenterX = newCenter[0]
        this.newOlCenterY = newCenter[1]
        // Set Center in store
        this.setOlCenterX(this.newOlCenterX)
        this.setOlCenterY(this.newOlCenterY)
        // Set Center in view
        olMap.getView().setCenter(newCenter)
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

#custom-arrow {
  position: absolute;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  bottom: 1.6em;
  right: 0.7em;
  z-index: 3;
  width: 95px;
  padding: 0;
  margin: 0;

  div {
    padding: 0;
    margin: 0;
  }

  #arrow-middle {
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    justify-content: center;
  }

  .custom-arrow-btn {
    border-radius: 6px !important;

    .arrow-icon {
      font-size: 18px;
    }
  }
}
#custom-zoom {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: center;
  bottom: 8em;
  right: 2.8em;
  z-index: 3;
}
.custom-zoom-btn {
  border-radius: 6px !important;

  .zoom-icon {
    font-size: 18px;
  }
}
</style>