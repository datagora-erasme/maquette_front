<template>
  <v-card class="modal ma-auto">
    <v-card-title>
      <div class="d-flex flex-row justify-space-between align-center">
        <h4 style="color: #414288">
          Apercu de la maquette Lego
        </h4>
        <v-btn
          density="comfortable"
          color="#A18276"
          style="color: white"
          @click="download3DModel"
        >
          Télécharger le modèle 3D
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text class="pa-0">
      <div id="previewDiv" class="w-100 h-100" />
    </v-card-text>
  </v-card>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


var previewDiv;
var scene;
var camera;
var renderer;
var controls;
var spotLight;
var pointLight;
var voxelized3dModel;
var texture;
var currentMockupFile;

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
    currentMockupFile = this.$store.getters.getCurrentMockup;
    previewDiv = document.getElementById('previewDiv')
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, 800 / 500 );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xa18276, 0);
    renderer.setSize( 800, 500);
    pointLight = new THREE.PointLight( 0xffffff  );
    camera.add( pointLight );
    
    camera.position.set( 19.681337335336853, -88.17110542513275, 209.6151261927511 );
    // renderer.setPixelRatio( window.devicePixelRatio );

    const loadModel = () =>  {
      const geometries = []
      let combinedGeometry;
      voxelized3dModel.traverse( function( child ) {
        if ( child.isMesh ) {
          geometries.push(child.geometry);
          
          // // 1. Regroup geometries & create 1 mesh
          // // 2. Center camera around mesgh
        } 
        if (geometries.length)
        combinedGeometry = mergeBufferGeometries(geometries);

      } );

      const material = new THREE.MeshPhongMaterial({ 
          color: 0x666666,
					shininess: 0,
					side: THREE.DoubleSide,
					// Clipping setup:
					clipShadows: true
        });
      const mesh = new THREE.Mesh(combinedGeometry, material);
      // mesh.material.wireframe = true;
      // mesh.material.transparent = true;
      // mesh.material.opacity = 0.7;
      const offset = new THREE.Vector3();
      mesh.geometry.computeBoundingBox();
      mesh.geometry.boundingBox.getCenter(offset);
      offset.negate();
      mesh.position.add(offset);
      scene.add( mesh );

      render();

    }

    const manager = new THREE.LoadingManager( loadModel );
    const loader = new OBJLoader(manager);
    scene.add( new THREE.AmbientLight( 0xffffff ) );

    spotLight = new THREE.SpotLight( 0xffffff, 90 );
    spotLight.angle = Math.PI / 2;
    spotLight.penumbra = 0.2;
    spotLight.position.set( 0, 0, 0 );
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 3;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    // const dirLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
    // dirLight.position.set( 0, 2, 0 );
    // dirLight.castShadow = true;
    // dirLight.shadow.camera.near = 1;
    // dirLight.shadow.camera.far = 10;

    // dirLight.shadow.camera.right = 1;
    // dirLight.shadow.camera.left = - 1;
    // dirLight.shadow.camera.top	= 1;
    // dirLight.shadow.camera.bottom = - 1;

    // dirLight.shadow.mapSize.width = 1024;
    // dirLight.shadow.mapSize.height = 1024;
    // scene.add( dirLight );


    loader.load(
      currentMockupFile,
      function( object ) {

        voxelized3dModel = object

      },
      function( xhr ) {
        
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      function( error ) {
        
        console.log( 'An error happened' );

      }
    );
    
    scene.add( spotLight );
    scene.add( camera );


    controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener( 'change', render );

    previewDiv.appendChild( renderer.domElement );
    console.log(scene)

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
    download3DModel() {
      currentMockupFile.click()
    }
  },
}
</script>

<style>
.modal {
  height: 548px;
  width: 800px;
}
</style>