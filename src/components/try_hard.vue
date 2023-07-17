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
  //http://217.182.138.216:8080/geoserver/Metropole/wms?service=WMS&version=1.1.0&request=GetMap&layers=Metropole%3Abati&bbox=791003.625%2C6480095.5%2C873372.5625%2C6585209.5&width=601&height=768&srs=EPSG%3A404000&styles=&format=application/openlayers
  //https://geoserver-planta.exo-dev.fr/geoserver/Metropole/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Metropole%3Abati&maxFeatures=50&outputFormat=application%2Fjson

  //==WFS==
  //http://217.182.138.216:8080/geoserver/Metropole/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Metropole%3Abati&maxFeatures=50&outputFormat=application%2Fjson
  //http://217.182.138.216:8080/geoserver/Metropole/ows?SERVICE=WFS&REQUEST=GetFeature&typeName=Metropole:bati&VERSION=1.0.0&SRSNAME=EPSG:4326&outputFormat=application/json
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
  }
}
</script>

<style>

</style>