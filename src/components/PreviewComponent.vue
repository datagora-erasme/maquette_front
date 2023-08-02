<template>
  <v-card class="modal">
    <div id="previewDiv" class="w-100 h-100" />
  </v-card>
</template>

<script>
import * as THREE from 'three';
var previewDiv;
var scene;
var camera;
var renderer;

export default {
  name: 'PreviewComponent',
  props: {
    selectedAreaVoxelized: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
    // console.log(this.selectedAreaVoxelized)

    previewDiv = document.getElementById('previewDiv')
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, 1200 / 600 );
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // camera.position.set( 15, 20, 30 );
    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1200, 600 );
    previewDiv.appendChild( renderer.domElement );

    scene.add( camera );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // this.animate();

    function animate() {
      requestAnimationFrame(animate);
      render();
    }
    function render() {
      renderer.render( scene, camera );
    }
    animate()
  },
  methods: {
    // animate() {
    //   requestAnimationFrame(this.animate);
    //   this.render();
    // },
    // render() {
    //   renderer.render( scene, camera );
    // },
  },
}
</script>

<style>
.modal {
  height: 600px;
  width: 1200px;
}
</style>