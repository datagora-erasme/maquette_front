<!-- eslint-disable vue/no-v-html -->
<template>
  <div id="wrapper-div">
    <div id="viewerDiv" class="viewer" />
    <div id="info-div">
      DEBUG :
      <br>
      <div v-html="debugInfos" />
    </div>
  </div>
</template>

<script>
import * as itowns from '@/node_modules/itowns/dist/itowns'
import * as itowns_widgets from '@/node_modules/itowns/dist/itowns_widgets'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { gsap, Power2 } from 'gsap'

// TODO : Remove draggable variable

// Global vars...
var view
var viewerDiv
var lyonPlacement
var coordMouse
var selectedArea
var draggable
const raycaster = new itowns.THREE.Raycaster(); // create once
const clickMouse = new itowns.THREE.Vector2();  // create once

export default {
  name: 'ItownsViewer',
  data() {
    return {
      wfsMeshes: null,
      debugInfos: null,
      selectedArea: null
    }
  },
  computed: {
    currentZoomLevel() {
      if (view && view.controls) {
        return view.controls.getZoom()
      } else {
        return null
      }
    }
  },
  watch: {
    currentZoomLevel() {
      console.log(this.currentZoomLevel)
    }
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
  
    // ===== Init Data and add layer to iTowns =====
    this.loadFdpData(view)
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
        // ===== Show Debug =====
        this.showDebugInfos()
        // ===== Show All Layers =====
        this.showAllLayers()
    }.bind(this))

    // Add Mouse move Event listener
    window.addEventListener('mousemove', this.handleMouseMove);
    // Add Wheel Event listener
    window.addEventListener('wheel', this.handleMouseMove)
    // Add Click Event listener
    viewerDiv.addEventListener('click', this.handleClick)
  },
  methods: {
    showDebugInfos() {
      console.log('Root layer', view)
      console.log('== itowns DEBUG ==', itowns)
      console.log('== view DEBUG ==', view)
    },
    showAllLayers() {
      // DEBUG Show layers
      console.log('== allViewLayers DEBUG ==')
      var allViewLayers = view.getLayers()
      allViewLayers.forEach(layer => {
        console.log(layer.id, layer.crs, layer)
      })
    },
    handleMouseMove(event) {
      // Define mouse coord
      coordMouse = new itowns.THREE.Vector2();
      coordMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      coordMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const target = new itowns.Coordinates('EPSG:4978', 0, 0, 0);
      const result = view.pickCoordinates(event, target);
      // ! Print mouse coords in debug div
      this.debugInfos = 'Mouse coord : ' + JSON.stringify(coordMouse) + '<br> Map coord: ' + JSON.stringify({ x: result.x, y: result.y, z: result.z })
      // ! Print Zoom level in debug div
      this.debugInfos += '<br> Zoom : ' + JSON.stringify(view.controls.getZoom())
    },
    handleClick(event) {
      console.log('view', view)
      // Ensures that the selectedArea is only added when alt is pressed.
      if(event.altKey) {
        this.selectArea(event);
        return;
      } 

      // Trying to detect the selectedArea
      this.raycast(event)
    },
    raycast(event) {
      clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // Intersecting all the elements within the mouse's direction
      const found = this.intersect(clickMouse);
      if (found.length > 0) {
        console.log(found)
        // But only taking into account the selectedArea (see metadata above, userData.draggable)
        if (found[0].object.userData.draggable) {
          draggable = found[0].object
          console.log(`found draggable ${draggable.userData.name}`)
          console.log(draggable)
          console.log(
            { x: view.camera.camera3D.position.x - selectedArea.position.x, 
            y: view.camera.camera3D.position.y - selectedArea.position.y, 
            z: view.camera.camera3D.position.z - selectedArea.position.z }
          )
          this.travelToCube();
          view.notifyChange(true);
        }
    }
    },
    intersect(pos) {
      raycaster.setFromCamera(pos, view.camera.camera3D);
      return raycaster.intersectObjects(view.scene.children, true);
    },
    travelToCube() {
      const targetPosition = selectedArea.position.clone()
      const duration = 2; // Animation duration in seconds
      const easing = Power2.easeInOut; // Easing function

      const offset = 600 // variable used to set the camera position above the selectedArea
      gsap.to(view.camera.camera3D.position, {
        x: targetPosition.x + offset,
        y: targetPosition.y + offset/11.8,
        z: targetPosition.z + offset * 1.01,
        duration: duration,
        ease: easing,
        onUpdate: () => {
          view.camera.camera3D.lookAt(targetPosition);
        },
        onComplete: () => {
          const bufferBoxGeometry = selectedArea.geometry.clone()
          const meshi = new itowns.THREE.Mesh(bufferBoxGeometry);
          const exporter = new STLExporter();
          const options = { binary: false };
          const result = exporter.parse(meshi, options);
          console.log('a', bufferBoxGeometry)
          bufferBoxGeometry.applyMatrix4(selectedArea.matrixWorld);
          // console.log('b', bufferBoxGeometry)
          bufferBoxGeometry.computeBoundingBox();
          console.log('c', bufferBoxGeometry)
          console.log(result)
        }
      });
    },
    loadFdpData() {
      // Init Data and add layer to iTowns
      itowns.Fetcher.json('http://www.itowns-project.org/itowns/examples/layers/JSONLayers/Ortho.json')
        .then(ortho => {
          var orthoSource = new itowns.WMTSSource(ortho.source)
          var orthoLayer = new itowns.ColorLayer('Ortho', {
            source: orthoSource,
          })
          view.addLayer(orthoLayer)
        })

      itowns.Fetcher.json('http://www.itowns-project.org/itowns/examples/layers/JSONLayers/IGN_MNT.json')
        .then(mnt => {
          var mntSource = new itowns.WMTSSource(mnt.source)
          var mntLayer = new itowns.ElevationLayer('IGN_MNT', {
            source: mntSource,
          })
          view.addLayer(mntLayer)
        })
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
      var wfsBuildingLayer = new itowns.FeatureGeometryLayer('WFS Building',{
          batchId: function(property, featureId) { return featureId },
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
      // ! Add to local variable ???
      this.wfsMeshes = meshes

      view.addLayer(wfsBuildingLayer)
    },
    lookAtCoordinate(coordinates) {
      view.controls.lookAtCoordinate({ coord: coordinates, range: 20000, heading: 0 })
    },
    addNavigationWidget() {
      // Add Navigation Widgets
      var navigationWidgets = new itowns_widgets.Navigation(view, { position: 'bottom-right' })

      // Add a new button to the widgets menu
      navigationWidgets.addButton(
          'rotate-up',
          '<p style="font-size: 20px">&#8595</p>',
          'rotate camera up',
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
          'rotate camera down',
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
          'reset position',
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
          // As precised in the doc (http://www.itowns-project.org/itowns/docs/#api/Widgets/Searchbar), the parser
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
          position: 'top-right',
          width: '320',
          placeholder: 'Cherchez un emplacement en France 🔎',
      })
    },
    removeSelectedArea() {
      if (!selectedArea)
        return;
      view.scene.remove(selectedArea);
      this.selectedArea.updateMatrixWorld(); // Used to force the re-rendering ?
      this.selectedArea = null; 
      view.notifyChange(true);
    },
    selectArea(event){
      
      this.removeSelectedArea();

      const target = new itowns.Coordinates('EPSG:4978', 0, 0, 0);
      const result = view.pickCoordinates(event, target);

      const geometry = new itowns.THREE.BoxGeometry(100, 100, 100);
      const material = new itowns.THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.4, transparent: true });

      selectedArea = new itowns.THREE.Mesh(geometry, material);

      selectedArea.position.set(result.x, result.y, result.z + 50)
      selectedArea.rotation.set(Math.PI/1, Math.PI / 4, Math.PI / 1)
      this.selectedArea = selectedArea;

      // Filling the selectedArea's metadata (used to get the selectedArea with raycaster)
      selectedArea.userData = { draggable: true, name: 'CUBE' }
      selectedArea.updateMatrixWorld(); // Used to force the re-rendering ?
      console.log(selectedArea)
      view.scene.add(selectedArea);

      view.notifyChange(true);
    }
  }
}
</script>

<style>
#wrapper-div {
  height: 100vh;
  width: 100%;
}

.viewer {
  height: 100vh;
  width: 100%;
}

#info-div {
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  align-items: flex-start;
  text-align: left;
  position: absolute;
  top: 20px;
  left: 20px;
  height: 200px;
  width: 550px;
  padding: 10px;
  background: #0000005e;
  color: white;
}

/* Override Itowns CSS */
#widgets-searchbar form > input::placeholder {
    color: #e6e6e6 !important;
}
</style>