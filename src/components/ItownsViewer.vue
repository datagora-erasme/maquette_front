<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container id="wrapper-div" fluid>
    <v-dialog v-model="isPreviewActive" class="preview-container">
      <preview-component :selected-area-voxelized="selectedAreaVoxelized" @onHidePreview="hidePreview" />
    </v-dialog>
    <v-dialog v-model="isUserInfoActive" class="user-info-dialog">
      <user-info @onCloseUserInfo="closeUserInfo" />
    </v-dialog>
    <v-row>
      <v-col class="navbar-container pa-0" :style="{ 'max-width': navbarWidth + 'px' }">
        <v-card>
          <v-layout>
            <v-navigation-drawer
              v-model="drawer"
              :rail="true"
              permanent
            >
              <v-list-item
                :prepend-avatar="require('../assets/logo_metropole_favicon.jpg')"
                title="John Leider"
                nav
              />

              <v-divider />

              <v-list density="compact" nav>
                <v-list-item
                  prepend-icon="mdi-domain"
                  title="Sélectionner une emprise"
                  value="1"
                  @click="clickOnNavbarItem(1)"
                /> 
                <v-list-item
                  disabled
                
                  prepend-icon="mdi-map-legend"
                  title="Afficher la voxelisation"
                  value="2"
                  @click="clickOnNavbarItem(2)"
                />
                <v-list-item
                  disabled
                  prepend-icon="mdi-account-group-outline"
                  title="Générer le guide de montage"
                  value="3"
                  @click="clickOnNavbarItem(3)"
                />
                <v-list-item
                  prepend-icon="mdi-account"
                  title="Générer le guide de montage"
                  value="3"
                  style="transform: scaleX(-1)"
                  @click="openUserInfo"
                />
              </v-list>
            </v-navigation-drawer>
          </v-layout>
        </v-card>
      </v-col>
      <sidebar-component
        ref="sidebarComponent"
        :current-tab-value="currentTabValue"
        :selected-area="selectedArea"
        :width="sidebarWidth"
        :ongoing-travel="ongoingTravel"
        @onResetMockupSelection="resetMockupSelection"
        @onRemoveSelectedArea="removeSelectedArea()"
        @onTravelToSelectedArea="travelToSelectedArea()"
        @onPlatesSelected="onPlatesSelected"
        @onStep1="voxelize"
        @onShowPreview="showPreview"
        @onHidePreview="hidePreview"
        @onDownloadArea="downloadArea"
      />
      <v-col class="viewerDiv-container pa-0" :style="{ width: viewerDivWidth + 'px' }">
        <div id="viewerDiv" class="viewer" />
      </v-col>
      
      <div v-if="showDebug" id="info-div">
        DEBUG :
        <br>
        <div class="debugInfos" v-html="debugInfos" />
      </div>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as itowns from '@/node_modules/itowns/dist/itowns'
import * as itowns_widgets from '@/node_modules/itowns/dist/itowns_widgets'
import * as colorLayersOrdering from '@/node_modules/itowns/lib/Renderer/ColorLayersOrdering.js'
import { gsap, Power2 } from 'gsap'
import SidebarComponent from './SidebarComponent.vue'
import PreviewComponent from './PreviewComponent.vue'
import UserInfo from './UserInfo.vue'
import { objDownloadUrlToMesh, createHeightMapFromMesh, generateCSVwithHeightMap, createHeightMapFromMeshUsingWorkers } from '../utils/threeUtils'
// TODO : Remove draggable variable

// Global vars...
var view
var viewerDiv
var currentExtent
var lyonPlacement
var coordMouse
var selectedArea
const raycaster = new itowns.THREE.Raycaster(); // create once
const clickMouse = new itowns.THREE.Vector2();  // create once

export default {
  name: 'ItownsViewer',
  components: { SidebarComponent, PreviewComponent, UserInfo },
  data() {
    return {
      debugInfos: null,
      drawer: true,
      rail: true,
      viewerDivWidth: window.innerWidth - 50,
      navbarWidth: 50,
      sidebarWidth: 400,
      currentTabValue: null,
      nbPlatesHorizontal: null,
      nbPlatesVertical: null,
      isPreviewActive: false,
      selectedAreaVoxelized: null,
      showDebug: true,
      selectedBbox: null,
      ongoingTravel: false,
      isUserInfoActive: false,
    }
  },
  computed: {
    ...mapGetters({
      // voxelizedMesh: 'map/getVoxelizedSingleMesh',
      selectedPlates: 'map/getPlates',
      getBaseLayers: 'map/getBaseLayers'
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
    }
  },
  watch: {
    currentZoomLevel() {
      // console.log(this.currentZoomLevel)
    },
  },
  mounted() {
    // ===== Init iTowns vars =====
    // Placement in Lyon - France
    lyonPlacement = {
      coord: new itowns.Coordinates('EPSG:4326', 4.835095, 45.757838),
        range: 30000,
    }
    viewerDiv = document.getElementById('viewerDiv')

    // ===== Init View =====
    view = new itowns.GlobeView(viewerDiv, lyonPlacement)
  
    // ===== Initiate view Extent =====
    this.getViewCurrentExtent()
    // ===== Add other projections to iTowns =====
    this.addCustomProjections()
    // ===== Init Data and add layer to iTowns =====
    // this.loadFdpData(view)
    // ===== Init Scale Widget =====
    this.addScaleWidget(view)
    // ===== Init Navigation Widgets =====
    this.addNavigationWidget(view)
    // ===== Init Searchbar Widgets =====
    this.addSearchBarWidget(view)
    // ===== Add 3D Building =====
    this.addBuildingLayer()

    // Finally...
    view.notifyChange()

    // Global init Event
    view.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function m() {
      console.info('-Globe initialized-')
        // ===== Reload view Extent =====
        this.getViewCurrentExtent()
        // ===== Init Data and add layer to iTowns =====
        this.loadFdpData(view)
        // ===== Show Debug =====
        this.showDebugInfos()
        // ===== Show All Layers =====
        this.showAllLayers()
        // Add Mouse move Event listener
        viewerDiv.addEventListener('mousemove', this.handleMouseMove);
        // Add Wheel Event listener
        viewerDiv.addEventListener('wheel', this.handleMouseMove)
        // Add Click Event listener
        viewerDiv.addEventListener('click', this.handleClick)
    }.bind(this))

  },
  methods: {
    ...mapActions({
      setCurrentMockupDownloadLink: 'map/setCurrentMockupDownloadLink',
      setBaseLayers: 'map/setBaseLayers'
    }),
    resetMockupSelection() {
      this.removeSelectedArea()
    },
    openUserInfo() {
      this.isUserInfoActive = true;
    },
    closeUserInfo() {
      this.isUserInfoActive = false;
    },
    async downloadArea() {
      if (this.selectedBbox) {
        await this.$axios.get('https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows', {
          params: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: 'Metropole:bati',
            outputFormat: 'json',
            srsName: 'EPSG:2154',
            bbox: this.selectedBbox,
            startIndex: 0,
          }
        }).then(() => {
          // const blob = new Blob([atob(response.data.data)], { type: 'text/plain' });
          // const downloadUrl = URL.createObjectURL(blob);
          // const downloadLink = document.createElement('a');
          // downloadLink.href = downloadUrl;
          // downloadLink.download = 'myfile.obj'; // Change the file name as desired
          // downloadLink.click();
        })
      }
    },
    showPreview() {
      this.isPreviewActive = true;
    },
    hidePreview() {
      this.isPreviewActive = false;
    },
    async voxelize() {
      if (selectedArea) {
        const clonedGeometry = selectedArea.geometry.clone();
        clonedGeometry.computeBoundingBox()
        const bbMin = clonedGeometry.boundingBox.min.clone().applyMatrix4(selectedArea.matrixWorld)
        const bbMax = clonedGeometry.boundingBox.max.clone().applyMatrix4(selectedArea.matrixWorld)

        const coordsMin = new itowns.Coordinates('EPSG:4978', bbMin).as('EPSG:2154')
        const coordsMax = new itowns.Coordinates('EPSG:4978', bbMax).as('EPSG:2154')
        this.selectedBbox = coordsMin.x.toString() + ', ' + (Math.min(coordsMax.y, coordsMin.y)).toString() + ', ' + coordsMax.x.toString() + ', ' + (Math.max(coordsMax.y, coordsMin.y)).toString();
        await this.$axios.post('/dataprocess/bbox', {
          bbox: this.selectedBbox,
          ratio: 5
        }).then((response) => {
          this.$refs.sidebarComponent.endVoxelisation();
          this.selectedAreaVoxelized = atob(response.data.data)
          const blob = new Blob([atob(response.data.data)], { type: 'text/plain' });
          const downloadUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = 'myfile.obj'; // TODO: Change the file name with maquette project name choose by user
          this.setCurrentMockupDownloadLink(downloadLink);
          objDownloadUrlToMesh(downloadLink).then((mesh) => {
            console.log(mesh)
            console.log(this.selectedPlates);
            const heightMap = createHeightMapFromMeshUsingWorkers(mesh, this.selectedPlates.x, this.selectedPlates.y);
            // generateCSVwithHeightMap(heightMap, 'CSV_OMG');
          });
        })
        // console.log(this.selectedBbox)
        // console.log('Bounding Box : ', coordsMin.x, coordsMax.y, coordsMax.x, coordsMin.y)
      }
    },
    clickOnNavbarItem(value) {
      if (value == this.currentTabValue) {
        this.currentTabValue = null
        this.viewerDivWidth = window.innerWidth - this.navbarWidth
      }
      else {
        this.currentTabValue = value
        this.viewerDivWidth = window.innerWidth - this.sidebarWidth - this.navbarWidth
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
      // DEBUG Show layers
      console.log('== allViewLayers DEBUG ==')
      var allViewLayers = view.getLayers()
      this.setBaseLayers(allViewLayers)
      console.log(allViewLayers)

      allViewLayers.forEach(layer => {
        console.log(layer.id, layer.crs, layer)
      })
    },
    addCustomProjections() {
      // Define crs projection that we will use (taken from https://epsg.io/2154, Proj4js section)
      itowns.proj4.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs')
    },
    handleMouseMove(event) {
      // DEBUG
      // console.log(event)

      // Define mouse coord
      coordMouse = new itowns.THREE.Vector2();
      coordMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      coordMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
    },
    handleClick(event) {
      // Ensures that the selectedArea is only added when alt is pressed.
      if(this.$refs.sidebarComponent.isAreaSelectionActive) {
        this.selectArea(event);
        return;
      }

      // Trying to detect the selectedArea
      this.raycast(event)
    },
    intersectArea(areaSelected, min, max) {
      const area = areaSelected;

      if (!area.min || !area.max) return false;

      // TODO could be optimize if not compute at each intersect
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
    travelToSelectedArea() {
      if (!selectedArea)
        return;
      this.ongoingTravel = true;
      const targetPosition = selectedArea.position.clone()
      const duration = 2; // Animation duration in seconds
      const easing = Power2.easeInOut; // Easing function

      const offset = 1000 // variable used to set the camera position above the selectedArea
      gsap.to(view.camera.camera3D.position, {
        x: targetPosition.x + offset,
        y: targetPosition.y + offset/11.8,
        z: targetPosition.z + offset * 1.01,
        duration: duration,
        ease: easing,
        onUpdate: () => {
          view.camera.camera3D.lookAt(targetPosition);
          view.notifyChange(true);
        },
        onComplete: () => {
          this.ongoingTravel = false;
        }
      });
    },
    getViewCurrentExtent() {
      if (view.tileLayer && view.tileLayer.info.displayed.extent) {
        var extentObj = view.tileLayer.info.displayed.extent;
        // currentExtent = {
        //   west: extentObj.west,
        //   east: extentObj.east,
        //   south: extentObj.south,
        //   north: extentObj.north,
        // }
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
      var mntLayer = new itowns.ElevationLayer('MNT_IGN_Layer', {
        name: 'Couche MNT IGN',
        source: mntSource,
      })
      mntLayer.visible = true
      view.addLayer(mntLayer)

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
      wmsCommuneLyonLayer.visible = true
      view.addLayer(wmsCommuneLyonLayer);
    },
    addBuildingLayer() {
      var color = new itowns.THREE.Color()
      var meshes = []

      function colorBuildings(properties) {
        if (properties.usage_1 === 'Résidentiel') {
            return color.set(0xFDFDFF)
        } else if (properties.usage_1 === 'Annexe') {
            return color.set(0xC6C5B9)
        } else if (properties.usage_1 === 'Commercial et services') {
            return color.set(0x62929E)
        } else if (properties.usage_1 === 'Religieux') {
            return color.set(0x393D3F)
        } else if (properties.usage_1 === 'Sportif') {
            return color.set(0x546A7B)
        }
        return color.set(0x555555)
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

      // DB IGN Building on Exo-Dev Server (https://geoserver-planta.exo-dev.fr/geoserver/) - Only dep 69 in France
      var wfsBuildingSource = new itowns.WFSSource({
        protocol: 'wfs',
        url: 'https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows?',
        version: '1.0.0',
        typeName: 'Metropole:bati',
        crs: 'EPSG:4326',
        format: 'application/json',
        maxFeatures: 50
      })

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
              }
          })
      })
      // TODO: Add to local variable ???
      // wfsMeshes = meshes

      // Finally add layer
      view.addLayer(wfsBuildingLayer)
    },
    addIGNBuildingLayer() {
      // ! Unused ?
      var color = new itowns.THREE.Color()
      var meshes = []

      function colorBuildings(properties) {
        if (properties.usage_1 === 'Résidentiel') {
            return color.set(0xFDFDFF)
        } else if (properties.usage_1 === 'Annexe') {
            return color.set(0xC6C5B9)
        } else if (properties.usage_1 === 'Commercial et services') {
            return color.set(0x62929E)
        } else if (properties.usage_1 === 'Religieux') {
            return color.set(0x393D3F)
        } else if (properties.usage_1 === 'Sportif') {
            return color.set(0x546A7B)
        }
        return color.set(0x555555)
      }
      function acceptFeature(properties) {
        return !!properties.hauteur
      }
      function altitudeBuildings(properties) {
        return properties.altitude_minimale_sol
      }
      function extrudeBuildings(properties) {
        return properties.hauteur
      }

      // BD Topo 3D layer (buildings)
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
      })

      // Create layer on wfs building source
      var wfsBuildingLayer = new itowns.FeatureGeometryLayer('WFS Building',{
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
          zoom: { min: 17 }, //14
          style: new itowns.Style({
              fill: {
                  color: colorBuildings,
                  base_altitude: altitudeBuildings,
                  extrusion_height: extrudeBuildings,
              }
          })
      })
      // TODO: Add to local variable ???
      // wfsMeshes = meshes

      // Finally add layer
      view.addLayer(wfsBuildingLayer)
    },
    lookAtCoordinate(coordinates) {
      view.controls.lookAtCoordinate({ coord: coordinates, range: 20000, heading: 0 })
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
    removeSelectedArea() {
      if (selectedArea) {
        view.scene.remove(selectedArea);
        selectedArea.updateMatrixWorld(); // Used to force the re-rendering ?
        selectedArea = undefined; 
        view.notifyChange(true);
      }
    },
    selectArea(event){
      
      this.removeSelectedArea();

      const target = new itowns.Coordinates('EPSG:4978', 0, 0, 0);
      const result = view.pickCoordinates(event, target);

      const geometry = new itowns.THREE.BoxGeometry(250, this.nbPlatesHorizontal * 100, this.nbPlatesVertical * 100);
      const material = new itowns.THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.4, transparent: true });

      
      selectedArea = new itowns.THREE.Mesh(geometry, material);
      selectedArea.position.set(result.x, result.y, result.z + 100)
      selectedArea.rotation.set(Math.PI/1, Math.PI / 4, Math.PI / 1)
      this.selectedArea = selectedArea;

      // Filling the selectedArea's metadata (used to get the selectedArea with raycaster)
      selectedArea.userData = { draggable: true, name: 'CUBE' }
      view.scene.add(selectedArea);
      // console.log(selectedArea)
      selectedArea.updateMatrixWorld(); // Used to force the re-rendering ?
      view.notifyChange(true);
    }
  },
}
</script>

<style>
html, body {
  overflow: hidden !important;
}

#wrapper-div {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.viewer {
  height: 100vh;
  width: 100%;
}

.navbar-container {
  /* max-width: 300px !important; */
  display: inline-block;
  padding: 0px;
}

.viewerDiv-container {
  padding: 0px;
}

.mockup-creation-card {
  width: 100%;
  height: 100%;
}

#info-div {
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  align-items: flex-start;
  text-align: left;
  position: absolute;
  top: 40%;
  right: -2000px;  /* //! Temporary value to remove debug from screen without causing bugs */
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
</style>