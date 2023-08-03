<template>
  <v-card class="modal ma-auto">
    <v-card-title>Apercu de la maquette Lego</v-card-title>
    <v-card-text class="pa-0">
      <div id="previewDiv" class="w-100 h-100" />
    </v-card-text>
  </v-card>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
    camera = new THREE.PerspectiveCamera( 75, 800 / 500 );
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    camera.position.set( 2, 2, 2 );
    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 800, 500 );
    previewDiv.appendChild( renderer.domElement );

    scene.add( camera );

    new OrbitControls(camera, renderer.domElement)

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // this.animate();

    function animate() {
      requestAnimationFrame(animate);

      // cube.rotation.x += 0.01
      // cube.rotation.y += 0.01

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
  height: 548px;
  width: 800px;
}
</style>