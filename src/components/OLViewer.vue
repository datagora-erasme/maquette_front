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
          :color="isPosDifferent ? '#1CB800':'#676767'" 
          icon
          :disabled="!isPosDifferent"
          @click="updateOlPos"
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
  import CircleStyle from 'ol/style/Circle'
  import OSM from 'ol/source/OSM'
  import TileLayer from 'ol/layer/Tile'
  import TileWMS from 'ol/source/TileWMS.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import VectorImageLayer from 'ol/layer/VectorImage.js'
  import VectorSource from 'ol/source/Vector.js'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import { bbox as bboxStrategy } from 'ol/loadingstrategy.js'
  import WMTS from 'ol/source/WMTS.js'
  import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
  import MVT from 'ol/format/MVT.js'
  import Feature from 'ol/Feature.js'
  import proj4 from 'proj4'
  import { register } from 'ol/proj/proj4'
  import { parseSld, getSldStyle } from '../utils/sldStyle'
  import { getUserLayerStyle } from '../utils/userLayer'
  import { loadVectorStyle } from '../utils/vectorStyle'
  import { applyStyle } from 'ol-mapbox-style'
  import { getRenderPixel } from 'ol/render.js'
  import { apply as applyTransform } from 'ol/transform.js'

  // Singleton OL Map
  let olMap = null
  let olLayers = []

  // Import Ortho data conf file
  let ortho = require('../datas/Ortho.json')
  // Import Open Free Map Dark data conf file (MapLibre style of vector tiles, shared with iTowns)
  let openFreeMapDark = require('../datas/OpenFreeMap_Dark.json')
  let monochromeBlack = require('../datas/Monochrome_Black.json')
  // Ground size of web mercator meters at Lyon: EPSG:2154 meters ≈ ground meters, web mercator ones are 1/cos(lat) bigger
  const LYON_MERCATOR_SCALE = Math.cos(45.76 * Math.PI / 180)
  // Resolutions of the MapLibre zoom levels (512 px tiles), in the units of the view (EPSG:2154) at Lyon
  const GL_STYLE_RESOLUTIONS = Array.from({ length: 25 }, (v, zoom) => 78271.51696402048 * LYON_MERCATOR_SCALE / Math.pow(2, zoom))
  // Import Végéstrate data conf file (MVT tiles + colors by 'indice', shared with iTowns)
  let vegestrate = require('../datas/Vegestrate.json')
  // Import Zones Climatiques Locales data conf file (MVT tiles + colors by 'indice', shared with iTowns)
  let lczColor = require('../datas/Lcz_Color.json')
  // MVT tiles level loaded in OL (view is in EPSG:2154, so tiles can't follow the view zoom)
  const VEGESTRATE_TILE_ZOOM = 16
  // LCZ polygons are larger: a lower level is enough and limits the number of tiles
  const LCZ_TILE_ZOOM = 14
  // 3 Villeurbanne: buildings GeoJSON file in EPSG:2154 + SLD style, shared with iTowns
  const villeurbanneArbresUrl = require('../datas/bati_nb_arbres_visibles_villeurbanne.geojson')
  const villeurbanneArbresSld = parseSld(require('../datas/3_symbologie.sld'))
  const WEB_MERCATOR_HALF_SIZE = 20037508.342789244

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
        getOpenedMockup: 'map/getOpenedMockup',
        getOlZoom: 'map/getOlZoom'
      }),
      currOlZoom() {
        return this.getOlZoom
      },
      currOpenedMockup() {
        return this.getOpenedMockup
      },
      currOpenedMockupPos() {
        let returnPos = null
        if (this.currOpenedMockup && this.currOpenedMockup.pos) {
          returnPos = JSON.parse(this.currOpenedMockup.pos)
        }
        return returnPos
      },
      isPosDifferent() {
        let diff = false

        // Compare OMPos & local var
        if (this.currOpenedMockupPos) {
          if (this.currOpenedMockupPos.centerX !== this.newOlCenterX) {
            diff = true
          }
          if (this.currOpenedMockupPos.centerY !== this.newOlCenterY) {
            diff = true
          }
          if (this.currOpenedMockupPos.zoom !== this.newOlZoom) {
            diff = true
          }
        } else {
          diff = true
        }

        return diff
      }
    },
    mounted() {
      // ===== Bind Events =====
      this.$evtBus.on('onTravelForProjection', this.goToMockup)
      this.$evtBus.on('onToggleLayerVisibility', this.toggleLayerVisibility)
      this.$evtBus.on('onChangeLayerOpacity', this.changeLayerOpacity)
      this.$evtBus.on('onChangeZoom', this.changeZoom)
      this.$evtBus.on('onChangeCenter', this.changeCenter)
      this.$evtBus.on('onAddUserLayer', this.addUserLayer)
      this.$evtBus.on('onUpdateUserLayer', this.updateUserLayer)
      this.$evtBus.on('onRemoveUserLayer', this.removeUserLayer)
      
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
      let interactions = olMap.getInteractions()
      interactions.forEach(function(interaction) {
          // Search for interaction to desactivate
          if (interaction.constructor.name === 'DragZoom' || interaction.constructor.name === 'KeyboardZoom' || interaction.constructor.name === 'KeyboardPan' || interaction.constructor.name === 'PinchRotate' || interaction.constructor.name === 'DragRotate') {
              // Desactivate
              interaction.setActive(false);
          }
      })

      // Get View center
      let newCenter = olMap.getView().getCenter()
      // Set Center in store + local
      this.newOlCenterX = newCenter[0]
      this.setOlCenterX(this.newOlCenterX)
      this.newOlCenterY = newCenter[1]
      this.setOlCenterY(this.newOlCenterY)

      // ===== Watch OL Events =====
      olMap.on('moveend', function(evt) {
          // Get Zoom from view
          let newZoomLevel = olMap.getView().getZoom()
          // DEBUG
          // console.log('Nouveau niveau de zoom :', newZoomLevel)

          // Set Zoom in store + local
          this.setOlZoom(parseFloat(newZoomLevel.toFixed(2)))
          this.newOlZoom = parseFloat(newZoomLevel.toFixed(2))

          // Get View center
          let newCenter = olMap.getView().getCenter()
          
          // DEBUG
          // console.log('newCenter: ', newCenter)

          // Set Center in store + local
          this.newOlCenterX = newCenter[0]
          this.setOlCenterX(this.newOlCenterX)
          this.newOlCenterY = newCenter[1]
          this.setOlCenterY(this.newOlCenterY)

          // Basemaps tiles level follows the zoom: their tiles are loaded again when it changes
          // (other vector layers have a fixed level or only depend on the mockup area: nothing to reload)
          const resolution = olMap.getView().getResolution()
          olMap.getAllLayers().forEach(layer => {
            const tileZoom = layer.get('tileZoom')
            if (tileZoom && tileZoom(resolution) !== layer.get('loadedTileZoom')) {
              layer.set('loadedTileZoom', tileZoom(resolution))
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
          // INFO: Open Free Map Dark fdp (vector tiles + MapLibre style)
          this.createVectorStyleLayer(openFreeMapDark),
          // INFO: Monochrome Black fdp (Plan IGN vector tiles + style of Jean-Marc Viglino)
          this.createVectorStyleLayer(monochromeBlack),
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
          // INFO: WMS Bruit
          new TileLayer({
            visible: false,
            source: new TileWMS({
              url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
              params: { 'LAYERS': 'grandlyon:GL_Rte_Lden', 'STYLES': 'grandlyon:bruit_avec_couleur' },
              serverType: 'geoserver',
              transition: 0,
            }),
            properties: {
              id: 'Bruit'
            }
          }),
          // INFO: WMTS CALQUE Layer 2022
          new TileLayer({
            visible: false,
            source: new TileWMS({
              url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
              params: { 'LAYERS': 'grandlyon:calque_plantabilite' },
              serverType: 'geoserver',
              transition: 0,
            }),
            properties: {
              id: 'Calque_Planta'
            }
          }),
          // INFO: WMS CALQUE Layer 2025
          new TileLayer({
            visible: false,
            source: new TileWMS({
              url: 'https://data.grandlyon.com/geoserver/grandlyon/ows',
              params: { 'LAYERS': 'grandlyon:calque_plantabilite_2025' },
              serverType: 'geoserver',
              transition: 0,
            }),
            properties: {
              id: 'Calque_Planta_2025'
            }
          }),
          // INFO: MVT Végéstrate (IA·rbre)
          // OL can't reproject vector tiles (view is in EPSG:2154): tiles are loaded in a vector source instead
          new VectorLayer({
            visible: false,
            // Only loaded when zoomed in (~ web zoom 15), to limit the number of tiles
            maxResolution: 3,
            source: this.createMVTSource({
              name: vegestrate.id,
              tileUrl: vegestrate.source.style.sources.vegestrate.tiles[0],
              tileZoom: VEGESTRATE_TILE_ZOOM,
              tileMatrixSetLimits: vegestrate.source.tileMatrixSetLimits,
            }),
            style: this.createMVTStyle(vegestrate),
            properties: {
              id: 'Vegestrate'
            }
          }),
          // INFO: MVT Zones Climatiques Locales (IA·rbre)
          new VectorLayer({
            visible: false,
            // Only loaded when zoomed in (~ web zoom 13), to limit the number of tiles
            maxResolution: 10,
            source: this.createMVTSource({
              name: lczColor.id,
              tileUrl: lczColor.source.style.sources.lcz.tiles[0],
              tileZoom: LCZ_TILE_ZOOM,
              tileMatrixSetLimits: lczColor.source.tileMatrixSetLimits,
            }),
            style: this.createMVTStyle(lczColor),
            properties: {
              id: 'lcz_color'
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
              // Only the mockup area is loaded (nothing before the projection): the view extent is far too big for the WFS
              strategy: () => (this.currExtent ? [this.currExtent] : []),
            }),
            style: {
              'stroke-width': 0.75,
              'stroke-color': 'black',
              'fill-color': 'rgba(255,255,255,1)',
            },
            properties: {
              id: 'IGN_Buildings'
            }
          }),
          // INFO: GeoJSON 3 Villeurbanne (buildings by number of visible trees), styled with the SLD file
          // Above IGN buildings (same footprints). VectorImage: faster for many polygons, and not refreshed on 'moveend' (file is loaded once)
          new VectorImageLayer({
            visible: false,
            source: new VectorSource({
              url: villeurbanneArbresUrl,
              format: new GeoJSON({ dataProjection: 'EPSG:2154' }),
            }),
            style: this.createRulesStyle(properties => getSldStyle(villeurbanneArbresSld, properties)),
            properties: {
              id: 'Villeurbanne_Arbres'
            }
          })
        ]
        // Crop all vector layers to the mockup area in projection
        olLayers.filter(layer => layer instanceof VectorLayer).forEach(layer => this.clipVectorLayer(layer))
      },
      createRulesStyle(getRuleStyle) {
        // One OL style per rule ('Map' is the OL map class in this file)
        const olStyles = new WeakMap()
        return feature => {
          const ruleStyle = getRuleStyle(feature.getProperties())
          if (!ruleStyle) {
            return null
          }
          if (!olStyles.has(ruleStyle)) {
            const fill = ruleStyle.fill ? new Fill({ color: ruleStyle.fill }) : undefined
            const stroke = ruleStyle.stroke ? new Stroke({ color: ruleStyle.stroke, width: ruleStyle.strokeWidth }) : undefined
            olStyles.set(ruleStyle, new Style({
              fill,
              stroke,
              // Only used by points
              image: ruleStyle.pointRadius ? new CircleStyle({ radius: ruleStyle.pointRadius, fill, stroke }) : undefined,
            }))
          }
          return olStyles.get(ruleStyle)
        }
      },
      addUserLayer(userLayer) {
        // GeoJSON imported by the user ("Mes données"), visible when added, above all other layers
        olMap.addLayer(this.createUserOlLayer(userLayer))
      },
      updateUserLayer({ userLayer, visible, opacity }) {
        // Edited user layer: replaced at the same place, with the same visibility & opacity
        const olLayers = olMap.getLayers()
        const oldLayer = olLayers.getArray().find(l => l.get('id') === userLayer.id)
        if (!oldLayer) {
          return
        }
        const newLayer = this.createUserOlLayer(userLayer)
        newLayer.setVisible(visible)
        newLayer.setOpacity(opacity)
        const index = olLayers.getArray().indexOf(oldLayer)
        olLayers.removeAt(index)
        olLayers.insertAt(index, newLayer)
      },
      removeUserLayer(layerId) {
        const userOlLayer = olMap.getAllLayers().find(l => l.get('id') === layerId)
        if (userOlLayer) {
          olMap.removeLayer(userOlLayer)
        }
      },
      createUserOlLayer(userLayer) {
        const viewProjection = olMap.getView().getProjection()
        const features = new GeoJSON().readFeatures(userLayer.geojson, {
          dataProjection: userLayer.crs,
          featureProjection: viewProjection,
        })
        // VectorImage: faster for many features, and not refreshed on 'moveend' (it would remove the features: there is no loader)
        const userOlLayer = new VectorImageLayer({
          source: new VectorSource({ features }),
          style: this.createRulesStyle(properties => getUserLayerStyle(userLayer, properties)),
          properties: {
            id: userLayer.id
          }
        })
        // Same extent as the other layers in projection
        if (this.currExtent) {
          userOlLayer.setExtent(this.currExtent)
        }
        return userOlLayer
      },
      computeWFSLink(extent) {
        return (
          // 'https://wxs.ign.fr/topographie/geoportail/wfs?SERVICE=WFS&' +
          'https://data.geopf.fr/wfs?SERVICE=WFS&' +
          'version=2.0.0&request=GetFeature&typename=BDTOPO_V3:batiment&' +
          'outputFormat=application/json&srsname=EPSG:2154&' +
          // 'outputFormat=application/json&srsname=EPSG:3857&' +
          'bbox=' +
          extent.join(',') +
          ',EPSG:2154'
          // ',EPSG:3857'
        )
      },
      createMVTStyle(conf) {
        // One style per 'indice', with the colors of the Mapbox style (JSON file)
        const stylesByIndice = {}
        conf.source.style.layers.forEach(layer => {
          stylesByIndice[layer.filter[2]] = new Style({ fill: new Fill({ color: layer.paint['fill-color'] }) })
        })
        return feature => stylesByIndice[feature.get('indice')]
      },
      createVectorStyleLayer(conf) {
        // Basemap from a MapLibre style: OL can't reproject vector tiles (view is in EPSG:2154),
        // so tiles are loaded in a vector source (level following the zoom) and styled with ol-mapbox-style
        const loadedStyle = loadVectorStyle(conf.styleUrl, conf.vectorSource)
        // Last level of the tiles (given in conf: some styles announce more levels than the server has)
        let maxZoom = conf.maxZoom || 14
        // Level of the style zoom (resolutions of the view at Lyon), up to the last level of the tiles
        const tileZoom = resolution => Math.max(0, Math.min(maxZoom, Math.floor(Math.log2(GL_STYLE_RESOLUTIONS[0] / resolution))))
        const vectorStyleLayer = new VectorLayer({
          visible: false,
          declutter: true,
          // Nothing drawn until the style is loaded
          style: null,
          source: this.createMVTSource({
            name: conf.id,
            tileUrl: loadedStyle.then(loaded => loaded.tileUrl),
            tileZoom,
          }),
          properties: {
            id: conf.id,
            // Used on 'moveend' to reload the tiles when their level changes
            tileZoom
          }
        })
        vectorStyleLayer.getSource().setAttributions("<a href='" + conf.attribution.url + "' target='_blank'>" + conf.attribution.name + '</a>')
        loadedStyle
          .then(loaded => {
            maxZoom = conf.maxZoom || loaded.maxZoom
            return applyStyle(vectorStyleLayer, loaded.style, {
              source: conf.vectorSource,
              updateSource: false,
              resolutions: GL_STYLE_RESOLUTIONS,
            })
          })
          .catch(e => console.error(conf.id + ' style not loaded', e))
        return vectorStyleLayer
      },
      clipVectorLayer(layer) {
        // OL 9 doesn't clip vector layers to their extent (mockup area in projection) as soon as one layer of the map
        // is decluttered (the MapLibre basemaps, even hidden): all vector layers are then drawn in a deferred pass,
        // without the clip of the layer extent.
        // Render events of this pass are used to clip it (they are only sent in the deferred pass when decluttering)
        layer.on('prerender', event => {
          const context = event.context
          context.save()
          const extent = layer.getExtent()
          if (!extent) {
            return
          }
          const [minX, minY, maxX, maxY] = extent
          // Map coordinates => CSS pixels of this frame => pixels of the layer canvas
          const corners = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]].map(corner =>
            getRenderPixel(event, applyTransform(event.frameState.coordinateToPixelTransform, corner))
          )
          context.beginPath()
          context.moveTo(corners[0][0], corners[0][1])
          corners.slice(1).forEach(corner => context.lineTo(corner[0], corner[1]))
          context.closePath()
          context.clip()
        })
        layer.on('postrender', event => event.context.restore())
      },
      createMVTSource({ name, tileUrl, tileZoom, tileMatrixSetLimits }) {
        // MVT tiles (EPSG:3857) loaded in a vector source, reprojected in the view projection
        // - tileUrl: URL template ({z}/{x}/{y}), or a promise of it
        // - tileZoom: level of the loaded tiles, or function(resolution) returning it
        // - tileMatrixSetLimits (optional): tiles with data, by level
        const format = new MVT({ featureClass: Feature })
        const loadedTiles = new Set()
        // Incremented when features are removed: tiles still loading for previous features are ignored
        let generation = 0

        const source = new VectorSource({
          strategy: bboxStrategy,
          loader: (extent, resolution, projection, success) => {
            const loaderGeneration = generation
            const zoom = typeof tileZoom === 'function' ? tileZoom(resolution) : tileZoom
            const tileSize = (2 * WEB_MERCATOR_HALF_SIZE) / Math.pow(2, zoom)
            const tileLimits = (tileMatrixSetLimits && tileMatrixSetLimits[zoom]) || {
              minTileCol: 0, maxTileCol: Math.pow(2, zoom) - 1, minTileRow: 0, maxTileRow: Math.pow(2, zoom) - 1,
            }
            // XYZ tiles covering the requested extent, inside the data limits
            const [minX, minY, maxX, maxY] = olProj.transformExtent(extent, projection, 'EPSG:3857')
            const minCol = Math.max(tileLimits.minTileCol, Math.floor((minX + WEB_MERCATOR_HALF_SIZE) / tileSize))
            const maxCol = Math.min(tileLimits.maxTileCol, Math.floor((maxX + WEB_MERCATOR_HALF_SIZE) / tileSize))
            const minRow = Math.max(tileLimits.minTileRow, Math.floor((WEB_MERCATOR_HALF_SIZE - maxY) / tileSize))
            const maxRow = Math.min(tileLimits.maxTileRow, Math.floor((WEB_MERCATOR_HALF_SIZE - minY) / tileSize))

            const tileRequests = []
            for (let col = minCol; col <= maxCol; col++) {
              for (let row = minRow; row <= maxRow; row++) {
                const tileKey = `${zoom}/${col}/${row}`
                if (loadedTiles.has(tileKey)) {
                  continue
                }
                loadedTiles.add(tileKey)

                let url = null
                const tileExtent = [
                  col * tileSize - WEB_MERCATOR_HALF_SIZE,
                  WEB_MERCATOR_HALF_SIZE - (row + 1) * tileSize,
                  (col + 1) * tileSize - WEB_MERCATOR_HALF_SIZE,
                  WEB_MERCATOR_HALF_SIZE - row * tileSize,
                ]
                tileRequests.push(
                  Promise.resolve(tileUrl)
                    .then(template => {
                      url = template.replace('{z}', zoom).replace('{x}', col).replace('{y}', row)
                      return fetch(url)
                    })
                    .then(response => {
                      // 404 = no data in this tile
                      if (response.status === 404) {
                        return null
                      }
                      if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`)
                      }
                      return response.arrayBuffer()
                    })
                    .then(buffer => {
                      if (!buffer || loaderGeneration !== generation) {
                        return
                      }
                      const features = format.readFeatures(buffer, { extent: tileExtent, featureProjection: 'EPSG:3857' })
                      features.forEach(f => {
                        f.getGeometry().transform('EPSG:3857', projection)
                        // A polygon cut by tile borders has the same id in each tile: ids would make the source drop the other parts
                        f.setId(undefined)
                      })
                      source.addFeatures(features)
                    })
                    .catch(err => {
                      // Allow a new try on next view change
                      loadedTiles.delete(tileKey)
                      console.warn(name + ' tile not loaded: ' + url, err)
                    })
                )
              }
            }
            Promise.all(tileRequests).then(() => success())
          },
        })
        // Features are removed on refresh (done on 'moveend' when the tiles level changes): tiles must be loaded again
        source.on('clear', () => {
          loadedTiles.clear()
          generation++
        })
        return source
      },
      addCustomProj() {
        // Define new custom coord
        proj4.defs('EPSG:2154','+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:4978','+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs');
        // CC46 (Lyon), accepted for user layers like in iTowns
        proj4.defs('EPSG:3946','+proj=lcc +lat_0=46 +lon_0=3 +lat_1=45.25 +lat_2=46.75 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
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
        // console.log(currLayer)
        // console.log(currLayer.constructor.name)
        
        const ratioOpacity = newLayerOp.opacity / 100
        if (currLayer) {
          // Only the buildings have their opacity in the style (other vector layers keep their own style)
          if (newLayerOp.id === 'IGN_Buildings') {
            // Change style (color alpha in rgba)
            let newStyle = new Style({
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

        // Convert into Array (and convert to Float)
        const currBboxStrArray = currBbox.split(', ')
        const currBboxArray = []
        currBboxStrArray.forEach(element => {
          currBboxArray.push(parseFloat(element))
        })

        // Set current BBOX (EPSG:2154)
        this.currExtent = currBboxArray

        // Set extent to all existing OL Layers
        olMap.getAllLayers().forEach(layer => {
          layer.setExtent(this.currExtent)
        })
        // Load the buildings of the new mockup area
        olMap.getAllLayers().find(l => l.get('id') === 'IGN_Buildings').getSource().refresh()

        // IF Pos in OpenedMockup exist
        if (this.currOpenedMockupPos) {
          // Set in Map (local & store do in moveEnd event)
          olMap.getView().setCenter([this.currOpenedMockupPos.centerX, this.currOpenedMockupPos.centerY])
          olMap.getView().setZoom(this.currOpenedMockupPos.zoom)

        } else {
          // Else > GoTo Extent converted
          olMap.getView().fit(this.currExtent)
        }
      },
      updateOlPos() {
        this.$evtBus.emit('onUpdatePos')
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