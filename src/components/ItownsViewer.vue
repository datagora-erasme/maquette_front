<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container id="wrapper-div" fluid>
    <v-dialog v-model="isPreviewActive" class="preview-container">
      <preview-component @onHidePreview="hidePreview" />
    </v-dialog>
    <v-dialog v-model="isUserInfoActive" class="user-info-dialog">
      <user-info @onCloseUserInfo="closeUserInfo" />
    </v-dialog>

    <!-- Navbar -->
    <div v-if="!isFullscreen" class="navbar-container pa-0">
      <v-card>
        <v-layout style="width: 56px !important;">
          <v-navigation-drawer
            v-model="drawer"
            :rail="true"
            permanent
            style="width: 56px !important; height: 100%"
          >
            <v-list-item
              :prepend-avatar="require('../assets/logo_metropole_favicon.jpg')"
              title="Logo Métropole de Lyon"
              nav
            />

            <v-divider />

            <v-list density="compact" nav>
              <v-tooltip text="Construire une maquette">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-toy-brick"
                    title="Construire une maquette"
                    @click="clickOnNavbarItem(1)"
                  /> 
                </template>
              </v-tooltip>
              <v-tooltip text="Consulter mes maquettes">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-list-box"
                    title="Mes maquettes"
                    @click="clickOnNavbarItem(3)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Mode projection">
                <template #activator="{ props }">
                  <!-- TODO: Disable if maq was not load -->
                  <!-- :disabled="!getSelectedArea" -->
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-video-box"
                    title="Projection de la maquette"
                    @click="clickOnNavbarItem(2)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Mon compte">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-account"
                    title="Mon compte"
                    @click="openUserInfo()"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Aide et crédits">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    prepend-icon="mdi-help-circle-outline"
                    title="Aide et crédit"
                    class="help-nav-item"
                    @click="clickOnNavbarItem(4)"
                  />
                </template>
              </v-tooltip>
            </v-list>
          </v-navigation-drawer>
        </v-layout>
      </v-card>
    </div>

    <!-- Viewer Div (override by JS) -->
    <div v-show="!isFullscreen" id="viewerDiv" class="viewer" />
    <OLViewer v-show="isFullscreen" />
    <!-- v-show="isFullscreen" -->

    <!-- Sidebar -->
    <sidebar-component
      v-if="currentTabValue"
      ref="sidebarComponent"
      :ongoing-travel="ongoingTravel"
      @onCloseNavbar="closeNavbarItem()"
      @onStartSelection="startSelection()"
      @onResetMockupSelection="resetMockupSelection()"
      @onRemoveSelectedArea="removeSelectedArea()"
      @onResetOpenedMockup="resetOpenedMockup()"
      @onTravelToSelectedArea="travelToSelectedArea()"
      @onTravelForProjection="travelForProjection()"
      @onPlatesSelected="onPlatesSelected"
      @onStep1="voxelize"
      @onShowPreview="showPreview"
      @onHidePreview="hidePreview"
      @onDownloadArea="downloadArea"
      @onRotateSelectedArea="rotateSelectedArea()"
    />

    <!-- <div v-if="showDebug" id="info-div">
      DEBUG :
      <br>
      <div class="debugInfos" v-html="debugInfos" />
    </div> -->
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as itowns from '@/node_modules/itowns/dist/itowns'
import * as itowns_widgets from '@/node_modules/itowns/dist/itowns_widgets'
import OLViewer from './OLViewer.vue'
import SidebarComponent from './SidebarComponent.vue'
import PreviewComponent from './PreviewComponent.vue'
import UserInfo from './UserInfo.vue'
import { objToMesh, convertBboxToGeoJSON } from '../utils/threeUtils'
import { MathUtils } from 'three'

// Global vars...
var view
var viewerDiv
var currentExtent
var lyonPlacement
var lyonPlacementSmall
var coordMouse
var selectedArea = null
var openedMockupMesh = null
var openedMockupObj = null
var scaler
const raycaster = new itowns.THREE.Raycaster(); // create once
const clickMouse = new itowns.THREE.Vector2();  // create once

export default {
  name: 'ItownsViewer',
  components: { 
    OLViewer,
    SidebarComponent, 
    PreviewComponent, 
    UserInfo 
  },
  data() {
    return {
      debugInfos: null,
      drawer: true,
      rail: true,
      // viewerDivWidth: window.innerWidth - 50,
      navbarWidth: 55,
      nbPlatesHorizontal: null,
      nbPlatesVertical: null,
      isPreviewActive: false,
      voxelizedMeshObjContent: null,
      showDebug: true,
      selectedBbox: null,
      ongoingTravel: false,
      isUserInfoActive: false,
      dragging: false,
    }
  },
  computed: {
    ...mapGetters({
      // voxelizedMesh: 'map/getVoxelizedSingleMesh',
      voxelizedMeshObjContent: 'map/getVoxelizedMeshObjContent',
      selectedPlates: 'map/getPlates',
      getBaseLayers: 'map/getBaseLayers',
      getCurrAreaRotation: 'map/getCurrAreaRotation',
      getNewAreaRotation: 'map/getNewAreaRotation',
      getCurrentTabValue: 'map/getCurrentTabValue',
      getSelectedPos: 'map/getSelectedPos',
      getIsFullscreen: 'map/getIsFullscreen',
    }),
    currentZoomLevel() {
      if (view && view.controls) {
        return view.controls.getZoom()
      } else {
        return null
      }
    },
    baseLayers() {
      return this.getBaseLayers
    },
    currentSelectedArea() {
      return selectedArea ? selectArea : null
    },
    currAreaRotation() {
      return this.getCurrAreaRotation
    },
    newAreaRotation() {
      return this.getNewAreaRotation
    },
    currentTabValue() {
      return this.getCurrentTabValue
    },
    selectedPos() {
      return this.getSelectedPos
    },
    isFullscreen() {
      return this.getIsFullscreen
    }
  },
  mounted() {
    // ===== Bind Events =====
    this.$evtBus.on('onToggleLayerVisibility', this.toggleLayerVisibility)
    this.$evtBus.on('onChangeLayerOpacity', this.changeLayerOpacity)
    this.$evtBus.on('onOpenMockup', this.openMockup)
    this.$evtBus.on('onShowOpenedMockup', this.showOpenedMockup)
    this.$evtBus.on('onRefreshMap', this.refreshMap)
    this.$evtBus.on('onResetMapLocation', this.resetMapLocation)
    this.$evtBus.on('onResetArea', this.resetOpenedMockup)

    // ===== Init iTowns vars =====
    
    // Add other projections to iTowns
    this.addCustomProjections()

    // Placement in Lyon - France
    lyonPlacement = {
      coord: new itowns.Coordinates('EPSG:4326', 4.835095, 45.757838),
        range: 30000,
    }
    lyonPlacementSmall = {
      coord: new itowns.Coordinates('EPSG:4326', 4.835095, 45.757838),
        range: 3000,
    }
    viewerDiv = document.getElementById('viewerDiv')
    
    // DEBUG
    // console.log('viewerDiv')
    // console.log(viewerDiv)

    if (viewerDiv) {
      // ===== Init View =====
      view = new itowns.GlobeView(viewerDiv, lyonPlacement)
      
      // ===== Initiate view Extent =====
      this.getViewCurrentExtent()
      
      // ===== Init Data and add layer to iTowns =====
      // this.loadFdpData(view)
      // ===== Init Scale Widget =====
      this.addScaleWidget(view)
      // ===== Init Navigation Widgets =====
      this.addNavigationWidget(view)
      // ===== Init Searchbar Widgets =====
      this.addSearchBarWidget(view)
  
      // Finally...
      view.notifyChange()
  
      this.removeSelectedArea()
      this.resetAreaStore()
  
      // Global init Event
      view.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function m() {
        // ! Init OK
        // console.info('-Globe initialized-')
        // ! ===== Reload view Extent =====
        this.getViewCurrentExtent()
        // ! ===== Init Data and add layer to iTowns =====
        this.loadFdpData(view)
        // ! ===== Add 3D Building =====
        this.addIGNBuildingLayer()
        // ! ===== Show Debug =====
        // this.showDebugInfos()
        // ! ===== Show All Layers =====
        this.showAllLayers()
  
        // ## Add Mouse Event listener ##
        viewerDiv.addEventListener('mousedown', this.handleMouseDown)
        viewerDiv.addEventListener('mouseup', this.handleMouseUp)
        viewerDiv.addEventListener('mousemove', this.handleMouseDrag)
  
        // ! For debugging pos
        // viewerDiv.addEventListener('mousemove', this.handleMouseMove)
        // ## Add Wheel Event listener ##
        // viewerDiv.addEventListener('wheel', this.handleMouseMove)
  
      }.bind(this))
    }

  },
  methods: {
    ...mapActions({
      setCurrentMockupHTMLAnchorElement: 'map/setCurrentMockupHTMLAnchorElement',
      setVoxelizedMesh: 'map/setVoxelizedMesh',
      setVoxelizedMeshObjContent: 'map/setVoxelizedMeshObjContent',
      voxelizeBbox: 'map/voxelizeBbox',
      setSelectedArea: 'map/setSelectedArea',
      setCurrentMockupDownloadLink: 'map/setCurrentMockupDownloadLink',
      setBaseLayers: 'map/setBaseLayers',
      setCurrAreaRotation: 'map/setCurrAreaRotation',
      setNewAreaRotation: 'map/setNewAreaRotation',
      setAreaSelectionActive: 'map/setAreaSelectionActive',
      setAreaDropped: 'map/setAreaDropped',
      setAreaSelected: 'map/setAreaSelected',
      setSelectedBbox: 'map/setSelectedBbox',
      setSelectedPos: 'map/setSelectedPos',
      fetchProjectsList: 'project/fetchProjectsList',
      setCurrentTabValue: 'map/setCurrentTabValue',
      setOpenedMockup: 'map/setOpenedMockup',
    }),
    toggleLayerVisibility(layerId) {
      if(view) {
        const currLayer = view.getLayerById(layerId);
        currLayer.visible = !currLayer.visible
        view.notifyChange()
      }
    },
    changeLayerOpacity(newLayerOp) {
      if(view) {
        const currLayer = view.getLayerById(newLayerOp.id);
        currLayer.opacity = newLayerOp.opacity / 100
        view.notifyChange()
      }
    },
    refreshMap() {
      view.notifyChange()
    },
    openUserInfo() {
      this.isUserInfoActive = true;
    },
    closeUserInfo() {
      this.isUserInfoActive = false;
    },
    async downloadArea() {
      // !
      // TODO: Refacto
    },
    showPreview() {
      this.isPreviewActive = true;
    },
    hidePreview() {
      this.isPreviewActive = false;
    },
    clickOnNavbarItem(value) {
      if (value == this.currentTabValue) {
        // this.closeNavbarItem()
        this.setCurrentTabValue(null)
      } else {
        this.setCurrentTabValue(value)

        // Do this if it's not projection
        if (this.currentTabValue !== 2) {
          // Reset Area for Step1
          this.removeSelectedArea()
          this.resetAreaStore()
          // Reset openedMockup
          this.$evtBus.emit('onResetArea')
        }

        // Specific to mockup list tab
        if (this.currentTabValue === 3) {
          this.fetchProjectsList()
        }
      }
    },
    closeNavbarItem() {
      if (this.currentTabValue !== 2) {
        this.setCurrentTabValue(null)
        this.removeSelectedArea()
        this.resetAreaStore()
      }
    },
    onPlatesSelected(plates) {
      this.nbPlatesHorizontal = plates.horizontal;
      this.nbPlatesVertical = plates.vertical
    },
    showDebugInfos() {
      console.log('Root layer', view)
      console.log('== itowns DEBUG ==', itowns)
      console.log('== view DEBUG ==', view)
    },
    showAllLayers() {
      // ! Add all Layers in Store
      var allViewLayers = view.getLayers()
      this.setBaseLayers(allViewLayers)

      // DEBUG Show layers
      // console.log('== allViewLayers DEBUG ==')
      // console.log(allViewLayers)
      // allViewLayers.forEach(layer => {
      //   console.log(layer.id, layer.crs, layer)
      // })
    },
    addCustomProjections() {
      // Define crs projection that we will use (taken from https://epsg.io/2154, Proj4js section)
      itowns.proj4.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs')
      itowns.proj4.defs('EPSG:3946','+proj=lcc +lat_0=46 +lon_0=3 +lat_1=45.25 +lat_2=46.75 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
    },
    handleMouseDrag(event) {
      // Enable drag boolean
      this.dragging = true
    },
    handleMouseMove(event) {
      // DEBUG
      // console.log(event)

      // Enable drag boolean
      this.dragging = true

      // Define mouse coord
      coordMouse = new itowns.THREE.Vector2();
      coordMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      coordMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Detect mouse move
      if (coordMouse.x && coordMouse.y) {
        const target = new itowns.Coordinates('EPSG:2154', 0, 0, 0);
        const result = view.pickCoordinates(event, target);
        // ! Print Zoom level in debug div
        this.debugInfos = 'Zoom level : ' + JSON.stringify(view.controls.getZoom())
        // ! Print mouse coords in debug div
        this.debugInfos += '<br> Mouse (window) coord : <br>' + JSON.stringify(coordMouse)
        this.debugInfos += '<br> Map coord (2154) : ' + JSON.stringify({ x: result.x, y: result.y, z: result.z })
        // ! Reproj with Coordinates
        let convertCoord = new itowns.Coordinates('EPSG:2154', result).as('EPSG:4326')
        this.debugInfos += '<br> Test convert 2154 to 4326 : ' + JSON.stringify({ x: convertCoord.x, y: convertCoord.y, z: convertCoord.z })
        // ! Reproj with itowns.proj4 (z ignored)
        let convertProjCoord = itowns.proj4('EPSG:2154','EPSG:4326',{ x:result.x, y:result.y })
        this.debugInfos += '<br> Test proj convert 2154 to 4326 : ' + JSON.stringify(convertProjCoord)
      }

    },
    handleMouseDown() {
      // Reset drag boolean
      this.dragging = false
    },
    handleMouseUp(event) {
      // DEBUG
      // console.log('mouse up')
      // console.log(this.dragging ? 'drag': 'click')

      // Check drag boolean
      if (this.dragging === false) {
        // Add selectedArea
        if(this.$refs.sidebarComponent && this.$refs.sidebarComponent.isAreaSelectionActive) {
          this.selectArea(event);
          return;
        }
      }
    },
    intersectArea(areaSelected, min, max) {
      const area = areaSelected;

      if (!area.min || !area.max) return false;

      const minArea = new itowns.THREE.Vector2(
        Math.min(area.min.x, area.max.x),
        Math.min(area.min.y, area.max.y)
      );
      const maxArea = new itowns.THREE.Vector2(
        Math.max(area.min.x, area.max.x),
        Math.max(area.min.y, area.max.y)
      );

      return (
        minArea.x <= max.x &&
        maxArea.x >= min.x &&
        minArea.y <= max.y &&
        maxArea.y >= min.y
      );
    },
    raycast(event) {
      clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // Intersecting all the elements within the mouse's direction
      const found = this.intersect(clickMouse);
      if (found.length > 0) {
        // But only taking into account the selectedArea (see metadata above, userData.draggable)
        if (found[0].object.userData.draggable) {
          view.notifyChange(true);
        }
    }
    },
    intersect(pos) {
      raycaster.setFromCamera(pos, view.camera.camera3D);
      return raycaster.intersectObjects(view.scene.children, true);
    },
    getViewCurrentExtent() {
      if (view.tileLayer && view.tileLayer.info.displayed.extent) {
        var extentObj = view.tileLayer.info.displayed.extent;
        currentExtent = extentObj
      } else {
        currentExtent = {
          west: 'Infinity',
          east: '-Infinity',
          south: 'Infinity',
          north: '-Infinity',
        }
      }
      // DEBUG
      // console.log(currentExtent)
    },
    loadFdpData() {
      // -- Init Data and add layer to iTowns --

      // OSM layer
      var osm = require('../datas/OPENSM.json')
      var osmSource = new itowns.WMTSSource(osm.source)
      var osmLayer = new itowns.ColorLayer('OpenStreetMap', {
        name: 'OpenStreetMap',
        source: osmSource,
      })
      osmLayer.visible = false
      view.addLayer(osmLayer)

      // Ortho layer
      var ortho = require('../datas/Ortho.json')
      var orthoSource = new itowns.WMTSSource(ortho.source)
      var orthoLayer = new itowns.ColorLayer('IGN_Orthophotos', {
        name: 'Plan Orthophotos IGN',
        source: orthoSource,
        opacity: 1,
      })
      orthoLayer.visible = true
      view.addLayer(orthoLayer)

      // MNT layer
      var mnt = require('../datas/IGN_MNT.json')
      var mntSource = new itowns.WMTSSource(mnt.source)
      var mntLayer = new itowns.ElevationLayer('IGN_MNT', {
        name: 'Couche MNT IGN',
        source: mntSource,
      })
      mntLayer.visible = true
      view.addLayer(mntLayer)

      var mntHD = require('../datas/IGN_MNT_HIGHRES.json')
      var mntHDSource = new itowns.WMTSSource(mntHD.source)
      var mntHDLayer = new itowns.ElevationLayer('IGN_MNT_HIGHRES', {
        name: 'Couche MNT HD IGN',
        source: mntHDSource,
      })
      mntHDLayer.visible = true
      view.addLayer(mntHDLayer)

      var worldDTM = require('../datas/WORLD_DTM.json')
      var worldDTMSource = new itowns.WMTSSource(worldDTM.source)
      var worldDTMLayer = new itowns.ElevationLayer('MNT_WORLD_SRTM3', {
        name: 'Couche DTM IGN',
        source: worldDTMSource,
      })
      worldDTMLayer.visible = true
      view.addLayer(worldDTMLayer)

      // WMS Communes of Metropole de Lyon
      var wmsCommuneLyonSource = new itowns.WMSSource({
        url: 'https://geoserver-planta.exo-dev.fr/geoserver/Metropole/wms',
        protocol: 'wms',
        version: '1.1.0',
        name: 'communes',
        format: 'image/svg',
        projection: 'EPSG:3857',
        extent: currentExtent,
      })
      const wmsCommuneLyonLayer = new itowns.ColorLayer('Lyon_Districts', {
        name: 'Communes Lyon',
        source: wmsCommuneLyonSource,
        transparent: true,
        opacity: 1,
      });
      wmsCommuneLyonLayer.visible = false
      view.addLayer(wmsCommuneLyonLayer);
    },
    addCustomBuildingLayer() {
      // FIXME Unused ?
      var color = new itowns.THREE.Color()
      var meshes = []

      function colorBuildings(properties) {
        // ? Grey : 0x555555 / White : 0xFDFDFF
        // if (properties.usage_1 === 'Résidentiel') {
        //     return color.set(0xFDFDFF)
        // } else if (properties.usage_1 === 'Annexe') {
        //     return color.set(0xC6C5B9)
        // } else if (properties.usage_1 === 'Commercial et services') {
        //     return color.set(0x62929E)
        // } else if (properties.usage_1 === 'Religieux') {
        //     return color.set(0x393D3F)
        // } else if (properties.usage_1 === 'Sportif') {
        //     return color.set(0x546A7B)
        // }
        return color.set(0xFDFDFF)
      }
      function acceptFeature(properties) {
        return !!properties.hauteur
      }
      function altitudeBuildings(properties) {
        return parseFloat(properties.altitude_minimale_sol)
      }
      function extrudeBuildings(properties) {
        return parseFloat(properties.hauteur)
      }

      scaler = function update(/* dt */) {
        var i;
        var mesh;
        if (meshes.length) {
          view.notifyChange(view.camera.camera3D, true);
        }
        for (i = 0; i < meshes.length; i++) {
          mesh = meshes[i];
          if (mesh) {
            mesh.scale.z = Math.min(1.0, mesh.scale.z + 0.1);
            mesh.updateMatrixWorld(true);
          }
        }
        meshes = meshes.filter(function filter(m) { return m.scale.z < 1; });
      };
      view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER, scaler);

      // DB IGN Building from Exo-Dev Server (https://geoserver-planta.exo-dev.fr/geoserver/) - Only dep 69 in France
      var wfsBuildingSource = new itowns.WFSSource({
        protocol: 'wfs',
        url: 'https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows?',
        version: '1.0.0',
        typeName: 'Metropole:bati',
        crs: 'EPSG:4326',
        format: 'application/json',
        // maxFeatures: 50
      })

      var wfsBuildingSource = new itowns.WFSSource({
        url: 'https://wxs.ign.fr/topographie/geoportail/wfs?',
        version: '2.0.0',
        typeName: 'BDTOPO_V3:batiment',
        crs: 'EPSG:4326',
        ipr: 'IGN',
        format: 'application/json',
        extent: {
          west: 4.568,
          east: 5.18,
          south: 45.437,
          north: 46.03,
        },
      });

      // Create layer on wfs building source
      var wfsBuildingLayer = new itowns.FeatureGeometryLayer('IGN_Buildings',{
          name: 'Bâtiments IGN',
          batchId: function(property, featureId) { return featureId },
          accurate: true,
          onMeshCreated: function scaleZ(mesh) {
              mesh.children.forEach(c => {
                  c.scale.z = 0.01
              })
          },
          filter: acceptFeature,
          source: wfsBuildingSource,
          zoom: { min: 15 }, //14
          style: new itowns.Style({
            fill: {
              color: colorBuildings,
              base_altitude: altitudeBuildings,
              extrusion_height: extrudeBuildings,
            },
            stroke: { color: color.set(0x546A7B) },
          })
      })

      // Finally add layer
      view.addLayer(wfsBuildingLayer)
    },
    addIGNBuildingLayer() {
      var color = new itowns.THREE.Color()
      var meshes = []

      function colorBuildings(properties) {
        // ? Grey : 0x555555 / White : 0xFDFDFF
        return color.set(0xFDFDFF)
      }
      function acceptFeature(properties) {
        return !!properties.hauteur
      }
      function altitudeBuildings(properties) {
        return parseFloat(properties.altitude_minimale_sol)
      }
      function extrudeBuildings(properties) {
        return parseFloat(properties.hauteur)
      }

      scaler = function update(/* dt */) {
        var i;
        var mesh;
        if (meshes.length) {
          view.notifyChange(view.camera.camera3D, true);
        }
        for (i = 0; i < meshes.length; i++) {
          mesh = meshes[i];
          if (mesh) {
            mesh.scale.z = Math.min(1.0, mesh.scale.z + 0.1);
            mesh.updateMatrixWorld(true);
          }
        }
        meshes = meshes.filter(function filter(m) { return m.scale.z < 1; });
      };
      view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER, scaler);

      var wfsBuildingSource = new itowns.WFSSource({
        url: 'https://wxs.ign.fr/topographie/geoportail/wfs?',
        version: '2.0.0',
        typeName: 'BDTOPO_V3:batiment',
        crs: 'EPSG:4326',
        ipr: 'IGN',
        format: 'application/json',
        extent: {
          west: 4.568,
          east: 5.18,
          south: 45.437,
          north: 46.03,
        },
      });

      // Create layer on wfs building source
      var wfsBuildingLayer = new itowns.FeatureGeometryLayer('IGN_Buildings',{
          name: 'Bâtiments IGN',
          batchId: function(property, featureId) { return featureId },
          accurate: true,
          onMeshCreated: function scaleZ(mesh) {
              mesh.children.forEach(c => {
                c.scale.z = 0.01
                meshes.push(c)
              })
          },
          filter: acceptFeature,
          source: wfsBuildingSource,
          zoom: { min: 15 }, //14
          style: new itowns.Style({
            fill: {
              color: colorBuildings,
              base_altitude: altitudeBuildings,
              extrusion_height: extrudeBuildings,
            },
            stroke: { color: color.set(0x546A7B) },
          })
      })
      // Finally add layer
      view.addLayer(wfsBuildingLayer)
    },
    lookAtCoordinate(coordinates, range, tilt) {
      view.controls.lookAtCoordinate({ 
        coord: coordinates, 
        tilt: tilt ? tilt : 100,
        range: range ? range : 20000, 
        heading: 0 
      })
    },
    addScaleWidget() {
      // Add Scale Widget
      var scale = new itowns_widgets.Scale(view, { position: 'bottom-right', translate: { x: -80 } });
    },
    addNavigationWidget() {
      // Add Navigation Widgets
      var navigationWidgets = new itowns_widgets.Navigation(view, { position: 'bottom-right' })

      // Add a new button to the widgets menu
      navigationWidgets.addButton(
          'rotate-up',
          '<p style="font-size: 20px">&#8595</p>',
          'Pivoter vers le haut',
          () => {
              view.controls.lookAtCoordinate({
                  tilt: view.controls.getTilt() - 10,
                  time: 500,
              })
          },
          'button-bar-rotation',
      )
      navigationWidgets.addButton(
          'rotate-down',
          '<p style="font-size: 20px">&#8593</p>',
          'Pivoter vers le bas',
          () => {
              view.controls.lookAtCoordinate({
                  tilt: view.controls.getTilt() + 10,
                  time: 500,
              })
          },
          'button-bar-rotation',
      )
      navigationWidgets.addButton(
          'reset-position',
          '&#8634',
          'Réinitialiser la position',
          () => { view.controls.lookAtCoordinate(lyonPlacement) },
      )
    },
    addSearchBarWidget() {
      // Define options for geocoding service that should be used by the searchbar
      const geocodingOptions = {
          url: new URL(
              'https://wxs.ign.fr/ayxvok72rcocdyn8xyvy32og/ols/apis/completion?text=&type=StreetAddress,' +
              'PositionOfInterest',
          ),
          // As precised in the doc (https://www.itowns-project.org/itowns/docs/#api/Widgets/Searchbar), the parser
          // method must parse the geocoding service response into a Map object. For each item of this Map, the
          // key is a string that is displayed in the suggestions bellow the searchbar, and the value is whatever
          // the user wants. The value is the parameter that is passed to the `onSelected` method when a
          // suggestion is clicked. Here, we se the value as the `Coordinates` associated to the location.
          parser: (response) => {
              const map = new Map()
              response.results.forEach(location => {
                  map.set(location.fulltext, new itowns.Coordinates('EPSG:4326', location.x, location.y))
              })
              return map
          },
          onSelected: this.lookAtCoordinate,
      }
      // Create the searchbar
      // eslint-disable-next-line no-unused-vars
      var searchbarWidget = new itowns_widgets.Searchbar(view, geocodingOptions, {
          maxSuggestionNumber: 5,
          position: 'top',
          width: '320',
          placeholder: 'Cherchez un emplacement en France 🔎',
      })
    },
    resetMapLocation() {
      console.log('pass by resetMapLocation')
      if (this.selectedPos) {
        this.lookAtCoordinate(this.selectedPos, 1500)
      } else {
        // Set placement on Lyon + zoom
        view.controls.lookAtCoordinate(lyonPlacementSmall)
      }
    },
    startSelection() {
      // Set placement on Lyon + zoom
      view.controls.lookAtCoordinate(lyonPlacementSmall)
    },
    resetAreaStore() {
      this.setCurrAreaRotation(0)
      this.setNewAreaRotation(0)
      this.setAreaSelectionActive(false)
      this.setAreaDropped(false)
      this.setAreaSelected(false)
    },
    removeSelectedArea() {
      if (selectedArea) {
        view.scene.remove(selectedArea);
        selectedArea = undefined; 
        view.notifyChange(true);
      }
      this.$evtBus.emit('onResetSliderRotation', true)
    },
    resetMockupSelection() {
      this.removeSelectedArea()
    },
    rotateSelectedArea() {
      // Get cube in scene
      const sceneCube = view.scene.getObjectByName( 'selectedAreaCube' )
      
      if (sceneCube) {
        // Compare actual with new rotation get from slider
        const diffRotationDeg = this.newAreaRotation - this.currAreaRotation
        const diffRotationRad = MathUtils.degToRad(diffRotationDeg)
        // Apply Rotation
        sceneCube.rotateX(diffRotationRad)
        // Re-set new actual rotation (in Deg)
        this.setCurrAreaRotation(this.newAreaRotation)

        // Re-render cube
        sceneCube.updateMatrixWorld()
        view.notifyChange()
      }
    },
    selectArea(event){
      // Remove existing Area
      this.removeSelectedArea();

      // Get target coordinate
      const target = new itowns.Coordinates('EPSG:4978', 0, 0, 0);
      const result = view.pickCoordinates(event, target);
      
      // DEBUG
      // console.log('pick selectedArea')
      // console.log(result)

      // Keep coordinates
      this.setSelectedPos(result)

      // GoTo coordinates
      this.lookAtCoordinate(result, 1500)

      // Build Geometry (h, L, l) + material
      const geometry = new itowns.THREE.BoxGeometry(100, this.nbPlatesHorizontal * 200, this.nbPlatesVertical * 200);
      const material = new itowns.THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.4, transparent: true });
      selectedArea = new itowns.THREE.Mesh(geometry, material);
      
      // Set Mesh properties : pos + rotate
      selectedArea.position.set(result.x, result.y, result.z) //50
      selectedArea.rotation.set(Math.PI / 1, Math.PI / 4, Math.PI / 1.02)
      // ! Disable ????
      selectedArea.rotateX(MathUtils.degToRad(-180))

      // Set area rotation in Store (in Deg)
      const currRotateXDeg = MathUtils.radToDeg(selectedArea.rotation.x) // Convert Rad to Deg
      this.setCurrAreaRotation(currRotateXDeg)

      // Set variables to Sidebar
      this.selectedArea = selectedArea;
      this.setAreaDropped(true)

      // TODO: Remove ? check raycast to CSV ?
      // Filling the selectedArea's metadata (used to get the selectedArea with raycaster)
      selectedArea.name = 'selectedAreaCube'
      selectedArea.userData = { draggable: true, name: 'CUBE' }

      // Add mesh to scene
      view.scene.add(selectedArea);
      
      // ! Used to force the re-rendering ?
      selectedArea.updateMatrixWorld(); 
      view.notifyChange(true);
    },
    travelToSelectedArea() {
      if (selectedArea) {
        // Go To area
        this.ongoingTravel = true;
        this.lookAtCoordinate(this.selectedPos, 1500)
        this.ongoingTravel = false;
        
        // Disable area selection
        this.setAreaSelectionActive(false)
      }
    },
    travelForProjection(plates) {
      if (this.selectedPos) {
        // Go To area
        this.ongoingTravel = true;

        var newZoom = 160

        if (openedMockupObj) {
          if (openedMockupObj.nb_plaques_h > 1 || openedMockupObj.nb_plaques_v > 1) {
            // nb_plates h & v x distance (zoom)
            if (openedMockupObj.nb_plaques_h > openedMockupObj.nb_plaques_v) {
              newZoom = openedMockupObj.nb_plaques_h * newZoom
            } else {
              newZoom = openedMockupObj.nb_plaques_v * newZoom
            }
          }
        } else {
          if (plates.x > 1 || plates.y > 1) {
            // nb_plates h & v x distance (zoom)
            if (plates.x > plates.y) {
              newZoom = plates.x * newZoom
            } else {
              newZoom = plates.y * newZoom
            }
          }
        }

        this.lookAtCoordinate(this.selectedPos, newZoom, 89.5)
        this.ongoingTravel = false;
      }

      // ! Hide opened Mockup area
      this.hideOpenedMockup()
    },
    async voxelize() {
      if (selectedArea) {
        // DEBUG
        // console.log('enter voxelize')
        // console.log(selectedArea)

        // ! Clone geometry to voxelize
        const clonedGeometry = selectedArea.geometry.clone();
        clonedGeometry.computeBoundingBox()
        
        // DEBUG
        // console.log('cloned geom')
        // console.log(clonedGeometry)

        // ! Geolocalize bbox point
        const bbMin = clonedGeometry.boundingBox.min.clone().applyMatrix4(selectedArea.matrixWorld)
        const bbMax = clonedGeometry.boundingBox.max.clone().applyMatrix4(selectedArea.matrixWorld)
        
        // DEBUG
        console.log('bbMin / bbMax')
        console.log(bbMin)
        console.log(bbMax)

        // ! Convert to 2154 coords
        const coordsMin = new itowns.Coordinates('EPSG:4978', bbMin).as('EPSG:2154')
        const coordsMax = new itowns.Coordinates('EPSG:4978', bbMax).as('EPSG:2154')
        
        // ! Take old BBOX with min/max
        this.selectedBbox = (Math.min(coordsMax.x, coordsMin.x)) + ', ' + (Math.min(coordsMax.y, coordsMin.y)).toString() + ', ' + (Math.max(coordsMax.x, coordsMin.x)).toString() + ', ' + (Math.max(coordsMax.y, coordsMin.y)).toString();
        
        // DEBUG
        // console.log('selectedBbox')
        // console.log(this.selectedBbox)

        // ! Set in Store
        this.setSelectedBbox(this.selectedBbox)

        // ! Api call to voxelize
        this.voxelizeBbox(this.selectedBbox)
        .then((objContent) =>  {
          console.log('objContent')
          console.log(objContent)

          objToMesh(objContent)
          .then((mesh) => {
            console.log('mesh')
            console.log(mesh)

            // Set data in Store
            this.setVoxelizedMesh(mesh)

            // TODO: Refacto - Goto next Step
            this.$refs.sidebarComponent.endVoxelisation();
          })
        })
        .catch((e) => {
          // Is area empty of building ?
          if (e.response.data.isEmpty) {
            this.$notify({
              title: 'Erreur lors de la création',
              text: "Une erreur s'est produite lors de la création. La zone séléctionnée ne contient peut-être pas de bâtiment ? Merci de recommencer ce processus.",
              type: 'error',
              duration: 10000
            })
            // Clean selected Area + redirect step 0 sidebar
            this.$evtBus.emit('onResetStepperPos')
          } else {
            this.$notify({
              title: 'Erreur lors de la création',
              text: "Une erreur s'est produite lors de la création. Merci de recommencer ce processus.",
              type: 'error',
              duration: 10000
            })
            // Clean selected Area + redirect step 0 sidebar
            this.$evtBus.emit('onResetStepperPos')
          }
        })
      }
    },
    openMockup(currMockup) {
      // ! Reset previous Mesh on scene
      this.resetOpenedMockup()

      // ! Get mockup props and cast to JSON
      const areaJsonProps = JSON.parse(currMockup.bbox)
      // console.log(areaJsonProps)

      // TODO: Try hard convert to geoJson polygon
      // convertBboxToGeoJSON(areaJsonProps.bbox)

      // ! Build mockup new Mesh
      const geom = new itowns.THREE.BoxGeometry(100, currMockup.nb_plaques_h * 200, currMockup.nb_plaques_v * 200);
      const mat = new itowns.THREE.MeshBasicMaterial({ color: 0xCB4335, opacity: 0.4, transparent: true });
      var boxMockup = new itowns.THREE.Mesh(geom, mat);
      
      // ! Set Mesh pos
      boxMockup.position.set(areaJsonProps.pos.x, areaJsonProps.pos.y, areaJsonProps.pos.z)
      // DEBUG
      // boxMockup.position.set(4441865.150187417, 375812.67610067065, 4546651.963041471)
      
      // ! Set Mesh Rotation
      boxMockup.rotation.set(Math.PI / 1, Math.PI / 4, Math.PI / 1.02)
      boxMockup.rotateX(MathUtils.degToRad(areaJsonProps.rotation))
      // DEBUG
      // boxMockup.rotateX(MathUtils.degToRad(-180))

      // ! Add to scene
      view.scene.add(boxMockup)
      
      // ! Save Mesh to manipulate after
      openedMockupMesh = boxMockup

      // ! Trigger render
      boxMockup.updateMatrixWorld()
      view.notifyChange()

      // ! Save SelectedArea
      selectedArea = boxMockup
      
      // ! Goto poly position
      const polyMockupCoord = new itowns.Coordinates(areaJsonProps.pos.crs, areaJsonProps.pos.x, areaJsonProps.pos.y, areaJsonProps.pos.z)
      this.lookAtCoordinate(polyMockupCoord, 1500)
      
      // ! Save pos in store for proj
      this.setSelectedPos(polyMockupCoord)
      
      // ! Save mockup obj in global var + store
      openedMockupObj = currMockup
      this.setOpenedMockup(currMockup)
      
      // ! Trigger boolean to next step (sidebar)
      this.setCurrentTabValue(1)
      this.$evtBus.emit('onOpenedMockupStep')
    },
    hideOpenedMockup() {
      if (openedMockupMesh) {
        view.scene.remove(openedMockupMesh)
        view.notifyChange(true)
      }
    },
    showOpenedMockup() {
      console.log('openedMockupMesh')
      console.log(openedMockupMesh)
      if (openedMockupMesh) {
        view.scene.add(openedMockupMesh)
        view.notifyChange(true)

        // Travel with range up
        this.lookAtCoordinate(this.selectedPos, 1500)
      }
    },
    resetOpenedMockup() {
      if (openedMockupMesh) {
        view.scene.remove(openedMockupMesh)
        openedMockupMesh = null
        view.notifyChange(true)
      }
    },
  },
}
</script>

<style lang="scss">
html, body {
  overflow: hidden !important;
}

.screen-row {
  margin: 0 !important;
  width: 100% !important;
  /* height: 100%; */
}

.navbar-container {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 56px !important;
  max-width: 56px !important;
  height: 100vh !important;
  min-height: 100vh !important;
  padding: 0px;
  z-index: 1000;
}

#wrapper-div {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  padding: 0 !important;
}

.viewer {
  height: 100vh;
  width: 100%;
}

.viewerDiv-container {
  padding: 0px;
  width: calc(100vw - 50px) !important;
}

#info-div {
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  align-items: flex-start;
  text-align: left;
  position: absolute;
  top: 40%;
  right: 10px;
  height: 250px;
  width: 550px;
  padding: 10px;
  background: #0000005e;
  color: white;
}

/* Override Itowns CSS */
#widgets-searchbar form > input::placeholder {
  color: #e6e6e6 !important;
}
#widgets-navigation #zoom-out-logo {
  background-position: bottom !important;
}

.user-info-dialog {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center !important; 
}

.help-nav-item {
  position: fixed !important; 
  bottom: 5px;
  width: 40px !important;
  // margin: 0 !important;
  
  .mdi {
    margin: 0 !important;
    color: #1976D3;
  }
}
</style>