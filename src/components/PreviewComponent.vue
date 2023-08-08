<template>
  <v-card class="modal ma-auto">
    <v-card-title class="py-1">
      <div class="d-flex flex-row justify-space-between align-center">
        <h4 style="color: #414288">
          Apercu de la maquette Lego
        </h4>
        <div class="d-flex flex-row align-center">
          <v-btn
            density="comfortable"
            color="#A18276"
            style="color: white"
            @click="download3DModel"
          >
            Télécharger le modèle 3D
          </v-btn>
          <v-btn
            class="user-info-close-icon ml-2"
            icon="mdi-close"
            elevation="0"
            @click="handleHidePreview"
          />
        </div>
      </div>
    </v-card-title>
    <v-card-text class="pa-0 d-flex justify-center align-center">
      <div>
        <div v-if="isLoading" class="d-flex flex-column justify-center align-center">
          <!-- <v-icon icon="mdi-video-3d" size="x-large" /> -->
          <v-icon icon="mdi-domain" size="x-large" />
          <div class="pt-2">
            Veuillez patienter pendant le chargement de la maquette...
          </div>
        </div>
        <div
          v-show="!isLoading"
          id="previewDiv"
          v-card-text 
          class="w-100 h-100"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
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
      isLoading: true,
    }
  },
  computed: {
    ...mapGetters({
      getCurrentMockupDownloadLink: 'map/getCurrentMockupDownloadLink'
    }),
  },
  watch: {
  },
  mounted() {
    currentMockupFile = this.getCurrentMockupDownloadLink
    previewDiv = document.getElementById('previewDiv')

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, 800 / 500 );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xa18276, 0);
    renderer.setSize( 800, 500);
    pointLight = new THREE.PointLight( 0xffffff  );
    camera.add( pointLight );
    
    // Camera position set to see the mockup from the right side
    // Position obtained by logging the camera position while going through the map
    camera.position.set( 19.681337335336853, -88.17110542513275, 209.6151261927511 );

    const loadModel = () =>  {
      const geometries = []
      let combinedGeometry;
      voxelized3dModel.traverse( function( child ) {
        if ( child.isMesh ) {
          geometries.push(child.geometry);
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

      if (this.isLoading) this.isLoading = false;
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

    loader.load(
      currentMockupFile,
      (object) => {
        voxelized3dModel = object
      },
      () => {
        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      (error) => {
        console.log(error);
        this.$notify({
          title: 'Erreur lors du rendu 3D',
          text: "Une erreur s'est produite lors de l'affichage de la maquette 3D",
          type: 'error'
        });
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
    },
    handleHidePreview() {
      this.$emit('onHidePreview')
    },
  },
}
</script>

<style>
.modal {
  height: 556px;
  width: 800px;
}

.icon-3d {
  height: 150px;
  width: 150px;
}
</style>