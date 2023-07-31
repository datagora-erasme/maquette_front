<template>
  <v-card class="modal">
    <div id="previewDiv" class="w-100 h-100" />
  </v-card>
</template>

<script>
import * as THREE from 'three';
var previewDiv;
var scene
var camera
var renderer

export default {
  name: 'PreviewComponent',
  data() {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
    previewDiv = document.getElementById('previewDiv')
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    previewDiv.appendChild( renderer.domElement );

    // camera

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 15, 20, 30 );
    scene.add( camera );

    this.animate();
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
    },
    render() {
      renderer.render( scene, camera );
    },
  },
}
</script>

<style>
.modal {
  height: 65vh;
}
</style>