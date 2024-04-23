<template>
  <div />
</template>

<script>
export default {

  mounted() {
  const raycaster = new itowns.THREE.Raycaster(); // create once
  const coordMouse = new itowns.THREE.Vector2();  // create once

  var wireframeMaterial = new itowns.THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }) //{ color: 0x00ff00, wireframe: true })
  var exampleMaterial = new itowns.THREE.MeshBasicMaterial({ color: 0x00ff00 }) //{ color: 0x00ff00, wireframe: true })

  // Links
  //==WMS==
  //https://geoserver-planta.exo-dev.fr/geoserver/Metropole/wms?service=WMS&version=1.1.0&request=GetMap&layers=Metropole%3Abati&bbox=791003.625%2C6480095.5%2C873372.5625%2C6585209.5&width=601&height=768&srs=EPSG%3A404000&styles=&format=application/openlayers
  //https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Metropole%3Abati&maxFeatures=50&outputFormat=application%2Fjson

  //==WFS==
  //https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows?SERVICE=WFS&REQUEST=GetFeature&typeName=Metropole:bati&VERSION=1.0.0&SRSNAME=EPSG:4326&outputFormat=application/json
  //https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Metropole%3Abati&maxFeatures=50&outputFormat=application%2Fjson
  // EPSG:4326

    // TODO: NEW planar view ?
    // const extent = new itowns.Extent('EPSG:3946', 1837816.94334, 1847692.32501, 5170036.4587, 5178412.82698);
    // view = new itowns.PlanarView(viewerDiv, extent, { placement: { heading: -49.6, range: 6200, tilt: 17 } });
  
  // ! Calque layer - WIP
  var calque = require('../datas/Calque.json')
  var calqueSource = new itowns.WMTSSource(calque.source)
  var calqueLayer = new itowns.ColorLayer('CalqueLayer', {
    name: 'Calque de plantabilité',
    protocol: 'wmts',
    source: calqueSource,
    opacity: 1,
  })
  calqueLayer.visible = true
  view.addLayer(calqueLayer)

  // ----------------------------------------------------- ITOWNS WMTS CALQUE

  // TODO: ADD CALQUE WMS (with tiled ?)
      // var wmsCalqueSource = new itowns.WMSSource({
      //   extent: currentExtent,
      //   name: 'calque_plantabilite_metropole',
      //   url: 'https://geoserver-planta.exo-dev.fr/geoserver/Metropole/wms',
      //   version: '1.1.0',
      //   crs: 'EPSG:4326',
      //   format: 'image/jpeg',
      //   tiled: true,
      // })

      // // Add a WMS Calque layer
      // var wmsCalqueLayer = new itowns.ColorLayer('calque', {
      //   name: 'Calque',
      //   source: wmsCalqueSource,
      //   opacity: 1,
      // })

      // view.addLayer(wmsCalqueLayer);

      // TODO: CALQUE TMS
      
      // // Create the source
      // const tmsSource = new itowns.TMSSource({
      //   format: 'image/png',
      //   url: 'https://geoserver-planta.exo-dev.fr/geoserver/gwc/service/tms/1.0.0/Metropole:calque_plantabilite_metropole/${z}/${x}/${y}.png',
      //   crs: 'EPSG:4326',
      // })

      // // Create the layer
      // const colorLayer = new itowns.ColorLayer('OPENSM', {
      //     source: tmsSource,
      // })

      // // Add the layer
      // view.addLayer(colorLayer);

      // TODO: CALQUE WMTS
      var calque = require('../datas/Calque.json')
      
      var calqueSource = new itowns.WMTSSource(calque.source)
      
      var calqueLayer = new itowns.ColorLayer('CalqueLayer', {
        name: 'Calque de plantabilité',
        protocol: 'wmts',
        source: calqueSource,
        opacity: 1,
      })
      calqueLayer.visible = true

      view.addLayer(calqueLayer)

      var orthoLayer = {
        'type': 'color',
        'protocol':   'wmts',
        'id':         'calquewmts',
        'url':        'https://geoserver-planta.exo-dev.fr/geoserver/gwc/service/wmts',
        'updateStrategy': {
            'type': '0',
            'options': {}
        },
        'networkOptions' : {
            'crossOrigin' : 'omit'
        },
        'options': {
            'attribution' : {
                'name':'IGN',
                'url':'http://www.ign.fr/'
            },
            'name': 'Metropole:calque_plantabilite_metropole',
            'mimetype': 'image/jpeg',
            'tileMatrixSet': 'EPSG:4326',
            'tileMatrixSetLimits': {
              'EPSG:4326:0': {
                'minTileRow': 0,
                'maxTileRow': 1,
                'minTileCol': 0,
                'maxTileCol': 1
              },
              'EPSG:4326:1': {
                'minTileRow': 0,
                'maxTileRow': 2,
                'minTileCol': 0,
                'maxTileCol': 2
              },
              'EPSG:4326:2': {
                'minTileRow': 0,
                'maxTileRow': 4,
                'minTileCol': 0,
                'maxTileCol': 4
              },
              'EPSG:4326:3': {
                'minTileRow': 1,
                'maxTileRow': 8,
                'minTileCol': 1,
                'maxTileCol': 8
              },
              'EPSG:4326:4': {
                'minTileRow': 3,
                'maxTileRow': 16,
                'minTileCol': 3,
                'maxTileCol': 16
              },
              'EPSG:4326:5': {
                'minTileRow': 7,
                'maxTileRow': 32,
                'minTileCol': 7,
                'maxTileCol': 32
              },
              'EPSG:4326:6': {
                'minTileRow': 15,
                'maxTileRow': 65,
                'minTileCol': 15,
                'maxTileCol': 65
              },
              'EPSG:4326:7': {
                'minTileRow': 31,
                'maxTileRow': 131,
                'minTileCol': 31,
                'maxTileCol': 131
              },
              'EPSG:4326:8': {
                'minTileRow': 62,
                'maxTileRow': 262,
                'minTileCol': 63,
                'maxTileCol': 263
              },
              'EPSG:4326:9': {
                'minTileRow': 125,
                'maxTileRow': 525,
                'minTileCol': 126,
                'maxTileCol': 526
              },
              'EPSG:4326:10': {
                'minTileRow': 250,
                'maxTileRow': 1050,
                'minTileCol': 252,
                'maxTileCol': 1052
              },
              'EPSG:4326:11': {
                'minTileRow': 501,
                'maxTileRow': 2101,
                'minTileCol': 505,
                'maxTileCol': 2105
              },
              'EPSG:4326:12': {
                'minTileRow': 1002,
                'maxTileRow': 4202,
                'minTileCol': 1011,
                'maxTileCol': 4211
              },
              'EPSG:4326:13': {
                'minTileRow': 2739,
                'maxTileRow': 4628,
                'minTileCol': 41,
                'maxTileCol': 7917
              },
              'EPSG:4326:14': {
                'minTileRow': 5478,
                'maxTileRow': 9256,
                'minTileCol': 82,
                'maxTileCol': 15835
              },
              'EPSG:4326:15': {
                'minTileRow': 10956,
                'maxTileRow': 18513,
                'minTileCol': 165,
                'maxTileCol': 31670
              },
              'EPSG:4326:16': {
                'minTileRow': 21912,
                'maxTileRow': 37026,
                'minTileCol': 330,
                'maxTileCol': 63341
              },
              'EPSG:4326:17': {
                'minTileRow': 43825,
                'maxTileRow': 74052,
                'minTileCol': 660,
                'maxTileCol': 126683
              },
              'EPSG:4326:18': {
                'minTileRow': 87648,
                'maxTileRow': 148111,
                'minTileCol': 1312,
                'maxTileCol': 253375
              },
              'EPSG:4326:19': {
                'minTileRow': 175296,
                'maxTileRow': 294063,
                'minTileCol': 170144,
                'maxTileCol': 343487
              },
              'EPSG:4326:20': {
                'minTileRow': 357008,
                'maxTileRow': 384687,
                'minTileCol': 524400,
                'maxTileCol': 540927
              },
              'EPSG:4326:21': {
                'minTileRow': 714032,
                'maxTileRow': 768783,
                'minTileCol': 1048816,
                'maxTileCol': 1081775
              }
            }
        }
    }

    view.addLayer(orthoLayer)
    
  // -----------------------------------------------------

  // ! WMS Calque planta of Metropole de Lyon --> Not working...
  // var wmsCalqueLyonSource = new itowns.WMSSource({
  //   url: 'https://geoserver-planta.exo-dev.fr/geoserver/Metropole/wms',
  //   protocol: 'wmts',
  //   version: '1.1.0',
  //   name: 'calque_plantabilite_metropole',
  //   format: 'image/jpeg',
  //   projection: 'EPSG:4326',
  //   extent: currentExtent,
  // })
  // const wmsCalqueLyonLayer = new itowns.ColorLayer('Lyon_Calque', {
  //   name: 'Calque Lyon',
  //   source: wmsCalqueLyonSource,
  //   transparent: true,
  //   opacity: 1,
  // });
  // wmsCalqueLyonLayer.visible = true
  // view.addLayer(wmsCalqueLyonLayer);

  // ! Useless ?
    // Define crs projection that we will use (taken from https://epsg.io/3946, Proj4js section)
    // itowns.proj4.defs('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')

    // TODO: Setup loading screen and debug menu 
    // setupLoadingScreen(viewerDiv, view)
    // const debugMenu = new GuiTools('menuDiv', view)

  // ! Function that go to coordinates.
    // function lookAtCoordinate(coordinates) {
    //     view.controls.lookAtCoordinate({ coord: coordinates, range: 20000, heading: 0 })
    // }

    // Set zoom at 15 to map
    // view.controls.setZoom(15, true)


  // ! Rotate 3D object

  // sceneCube.rotation.y = this.currentSliderX
  // sceneCube.rotateX(this.currentSliderX / 100)
  // sceneCube.rotateX(MathUtils.degToRad(this.currentSliderX)) // × π/180
  
  // sceneCube.rotation.x = MathUtils.degToRad(-60)
  // sceneCube.rotation.set(new itowns.THREE.Euler(this.currentSliderX, 0,0))

  // var quaternion = new itowns.THREE.Quaternion();
  // console.log(quaternion)
  // quaternion = sceneCube.quaternion
  // console.log(quaternion)
  // quaternion.x = this.currentSliderX
  // sceneCube.setRotationFromQuaternion(quaternion)

  // const quaternion = new itowns.THREE.Quaternion();
  // quaternion.setFromAxisAngle( new itowns.THREE.Vector3( 0, 0, 1 ), Math.PI / this.currentSliderX ); // Pi / 2
  // sceneCube.applyQuaternion(quaternion)
  // quaternion.set(this.currentSliderX,1,1,1)
  // sceneCube.setRotationFromQuaternion(quaternion)
  // sceneCube.applyQuaternion(quaternion)

  // sceneCube.rotateOnWorldAxis(new itowns.THREE.Vector3( 1, 0, 1 ), Math.PI / this.currentSliderX)

  // var cubeAxis = new itowns.THREE.AxesHelper(20);
  // cubeAxis.updateMatrixWorld()
  // sceneCube.add(cubeAxis);

  // const a = new itowns.THREE.Euler( this.currentSliderX, sceneCube.rotation.y, sceneCube.rotation.z, 'XYZ' );
  // sceneCube.setRotationFromEuler(a)

  // ! Apply texture to mesh
  // const texture = new itowns.THREE.TextureLoader().load(require('../assets/atlas.png'))
  // texture.colorSpace = itowns.THREE.SRGBColorSpace
  // texture.magFilter = itowns.THREE.NearestFilter
  // selectedArea = new itowns.THREE.Mesh(geometry, new itowns.THREE.MeshLambertMaterial( { map: texture, side: itowns.THREE.DoubleSide } ))


  // TODO: Create 2 box for min and max + material + add to scene
  // ! NEW - DEBUG BBOX IN SCENE
  // const geomBB = new itowns.THREE.BoxGeometry(10, 10, 10);
  // const matBB = new itowns.THREE.MeshBasicMaterial({ color: 0xCB4335, opacity: 0.4, transparent: true });
  // const meshBB1 = new itowns.THREE.Mesh(geomBB, matBB);
  // const meshBB2 = new itowns.THREE.Mesh(geomBB, matBB);
  // meshBB1.position.set(bbMin.x, bbMin.y, bbMin.z)
  // meshBB2.position.set(bbMax.x, bbMax.y, bbMax.z)
  // // Add mesh to scene
  // view.scene.add(meshBB1)
  // view.scene.add(meshBB2)
  // // ! Used to force the re-rendering ?
  // meshBB1.updateMatrixWorld()
  // meshBB2.updateMatrixWorld() 
  // view.notifyChange(true)

  // !
    function intersect(pos) {
      raycaster.setFromCamera(pos, view.camera.camera3D);
      // console.log('raycaster')
      // console.log(raycaster)
      // console.log(view.scene.children)
      // console.log(view.scene.children.filter(c => c.name = 'WFS Building'))
      // console.log('HERE')
      // console.log(view.scene.children)
      // console.log(view.scene.children[3].children)
      // console.log(meshes)
      // console.log(view.scene.getObjectByName( 'WFS Building' ).children)
      // return raycaster.intersectObjects(view.scene.getObjectByName( 'WFS Building' ).children, true)
      var childrenToFind = view.scene.children.filter(c => c.name === 'WFS Building')
      // console.log(childrenToFind)
      // return raycaster.intersectObjects(childrenToFind, true)
      return raycaster.intersectObjects(view.scene.children, true)
      // return raycaster.intersectObjects(meshes, true)
      // return raycaster.intersectObjects(view.scene.children[3], true)
    }

        // ===== Handle events =====
    function handleMouseMove(event) {
      // Ensures that event trigger only when alt is pressed.
      if(event.altKey) {
        // console.log('mouse move')
        // console.log(event)

        // Define mouse coord
        coordMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        coordMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // console.log(coordMouse)

        // Intersecting all the elements within the mouse's direction
        const found = intersect(coordMouse);
        // const found = view.pickObjectsAt(event, 2, 'WFS Building');
        console.log('found')
        console.log(found)

        if (found.length > 0) {
          console.log('=========== found[0] ============')
          console.log(found[0])


          // TODO: Change Wireframe ?
          // if (found[0].object && found[0].object.wireframe) {
          //   found[0].object.wireframe = true
          // }

          // TODO: Change Material ?
          var modifiedMat
          if (found[0].object && found[0].object.material) {
            // modifiedMat = new itowns.THREE.MeshBasicMaterial(found[0].object.material)
            modifiedMat = found[0].object.material.clone()
            modifiedMat.color = 0x00ff00
            // modifiedMat.color.setHex( 0xffffff )
            // if (modifiedMat.wireframe !== null) {
            //   modifiedMat.wireframe = true
            // }
            console.log(modifiedMat)
            found[0].object.material = modifiedMat
          }

          // TODO: Go To Obj Coords ? (lookAt ?)
          // var goCoord = new itowns.Coordinates('EPSG:4978', found[14].point.x, found[14].point.y) //4978 - 4326
          // lookAtCoordinate(goCoord)

          // But only taking into account the cube (see metadata above, userData.draggable)
          // if (found[0].object.userData.draggable) {
          //   draggable = found[0].object
          //   console.log(`found draggable ${draggable.userData.name}`)
          //   console.log(draggable)
          //   travelToCube();
          //   // view.camera.camera3D.lookAt(,.y,0)
          //   // view.camera.camera3D.rotation.x = -Math.PI /2;
          //   view.notifyChange(true);
          // }
        }
      }
    }
    window.addEventListener('mousemove', handleMouseMove);

    // ==========================

    exampleData: [
      {
        id: 'RéseauRoutier',
        name: 'Réseau routier',
        icon: 'mdi-road',
        subtitle: '2020',
        append: 'mdi-eye-off',
        visible: false,
      },
      {
        id: 'LignesMétro',
        name: 'Lignes de métro',
        icon: 'mdi-train',
        subtitle: '2020',
        append: 'mdi-eye-off',
        visible: false,
      },
      {
        id: 'Arbres',
        name: 'Arbres',
        icon: 'mdi-tree',
        subtitle: '2020',
        append: 'mdi-eye-off',
        visible: false,
      },
    ]

    // ==========================
    // this.setOlCenter(parseFloat(newCenter.toFixed(2)))

    // TODO: Transform bbox from EPSG:2154 to EPSG:3857 with OL (to remove ?)
    // this.currExtent = olProj.transformExtent(currBboxArray, 'EPSG:2154', 'EPSG:3857')
    
    // DEBUG
    // console.log('new bbox extent')
    // console.log(extent)
    
    // ========================== OLD Zoom Controls (in map)
    // <v-text-field
    //       v-model="newOlZoom"
    //       label="Zoom (3 à 20)"
    //       type="number"
    //       min="0"
    //       max="20"
    //       variant="solo"
    //       density="compact"
    //       color="#263238"
    //       @click:append-inner="changeOlZoom"
    //       @keydown.enter="changeOlZoom"
    //       @blur="changeOlZoom"
    //     >
    //       <!-- append-inner-icon="mdi-check" -->
    //       <template #append-inner>
    //         <v-icon
    //           class="mt-3"
    //           :class="newOlZoom == currOlZoom ? '' : 'icon-darkblue'"
    //           icon="mdi-check"
    //           @click="changeOlZoom"
    //         />
    //       </template>
    //     </v-text-field>
    // ==========================

    // TODO: Add two elevation layers ? (change URL)
    /** These will deform iTowns globe geometry to represent terrain elevation.
    // function addElevationLayerFromConfig(config) {
    //     config.source = new itowns.WMTSSource(config.source);
    //     var layer = new itowns.ElevationLayer(config.id, config);
    //     view.addLayer(layer) //.then(menuGlobe.addLayerGUI.bind(menuGlobe));
    // }
    // itowns.Fetcher.json('./layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addElevationLayerFromConfig);
    // itowns.Fetcher.json('./layers/JSONLayers/WORLD_DTM.json').then(addElevationLayerFromConfig);
    */

    // Change Layers Order (Only color layers...................)
    // itowns.ColorLayersOrdering.moveLayerUp(view, 'CommunesLyon');
    // itowns.ColorLayersOrdering.moveLayerToIndex(view, 'Lyon_Districts', 3);

    // Try2
    // const imageryLayers = view.getLayers(l => l.isColorLayer);
    // const layer = view.getLayerById('Lyon_Districts');


    // ========= OpenLayers =========

    // ###### Geom OL JS #######
    // this is a simple triangle over the atlantic ocean
    // const data = {
    //   type: 'Feature',
    //   properties: {},
    //   geometry: {
    //     type: 'Polygon',
    //     coordinates: [
    //       [
    //         [
    //           -27.0703125,
    //           43.58039085560784
    //         ],
    //         [
    //           -28.125,
    //           23.563987128451217
    //         ],
    //         [
    //           -10.8984375,
    //           32.84267363195431
    //         ],
    //         [
    //           -27.0703125,
    //           43.58039085560784
    //         ]
    //       ]
    //     ]
    //   }
    // }

    // Events binding
    olMap.on('click', function(evt) {
      console.log('Coordonnées du clic:', evt.coordinate);
    });
    olMap.on('moveend', function(evt) {
        var newZoomLevel = olMap.getView().getZoom();
        console.log('Nouveau niveau de zoom :', newZoomLevel);
    });
    olMap.getView().on('change:resolution', function(evt) {
        var newZoomLevel = olMap.getView().getZoom();
        console.log('View niveau de zoom :', newZoomLevel);
    });

    // OL default 2154 ????????????
    // -------------
    // center: [4.835095, 45.757838],
    // projection: 'EPSG:2154',
    // center: [845989.4937740469, 6520401.078594064],
    // center: [538240.3133371031, 5741627.150498441], //3857 (lyon default)
    // --------------

    // OL - Find one Layer with id
    console.log(olMap.getAllLayers().find(l => l.get('id') === 'OpenStreetMap'))

    // OL Controls custom
    // import { FullScreen, Control, defaults as defaultControls } from 'ol/control.js'
    
    // in OL Map
    // controls: defaultControls().extend([new FullScreen(), new RotateNorthControl])

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
        this.getMap().getView().setRotation(0);
      }
    }
  }
}
</script>

<style>

</style>