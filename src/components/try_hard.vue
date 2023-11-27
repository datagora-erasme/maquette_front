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
      console.log('HERE')
      console.log(view.scene.children)
      // console.log(view.scene.children[3].children)
      // console.log(meshes)
      // console.log(view.scene.getObjectByName( 'WFS Building' ).children)
      // return raycaster.intersectObjects(view.scene.getObjectByName( 'WFS Building' ).children, true)
      var childrenToFind = view.scene.children.filter(c => c.name === 'WFS Building')
      console.log(childrenToFind)
      // return raycaster.intersectObjects(childrenToFind, true)
      return raycaster.intersectObjects(view.scene.children, true)
      // return raycaster.intersectObjects(meshes, true)
      // return raycaster.intersectObjects(view.scene.children[3], true)
    }

        // ===== Handle events =====
    function handleMouseMove(event) {
      // Ensures that event trigger only when alt is pressed.
      if(event.altKey) {
        console.log('mouse move')
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
  }
}
</script>

<style>

</style>