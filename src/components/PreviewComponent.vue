<template>
  <v-card class="modal ma-auto">
    <v-card-title class="py-1">
      <div class="d-flex flex-row justify-space-between align-center">
        <h4 style="color: #414288">
          Apercu de la maquette Lego
        </h4>
        <!-- <v-tooltip text="Construire une maquette">
          <template #activator="{ props }">
          </template>
        </v-tooltip> -->
        <v-btn
          color="cyan-darken-3"
          icon="mdi-help"
          variant="outlined"
          density="comfortable"
          class="ml-1"
        >
          <v-icon icon="mdi-help" />
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Clic gauche : Rotation<br>Clic droit : Déplacement
          </v-tooltip>
        </v-btn>
        <div class="d-flex flex-row align-center">
          <v-btn
            density="comfortable"
            color="#37474F"
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
import { mapGetters, mapActions } from 'vuex'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { toRaw } from 'vue';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

var previewDiv;
var scene;
var camera;
var renderer;
var controls;
var requestId;

export default {
  name: 'PreviewComponent',
  data() {
    return {
      isLoading: true,
    }
  },
  computed: {
    ...mapGetters({
      voxelizedMesh: 'map/getVoxelizedMesh'
    }),
  },
  watch: {
  },
  mounted() {
    previewDiv = document.getElementById('previewDiv')

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0x37474F, 0);
    renderer.setSize( 800, 500);

    camera = new THREE.PerspectiveCamera( 75, 800 / 500 );
    // Camera position set to see the mockup from the right side
    // Position obtained by logging the camera position while going through the map
    // camera.position.set( 19.681337335336853, -88.17110542513275, 209.6151261927511 );
    camera.position.set( 0, 0, 0 )
    camera.position.z = 100
    scene.add( camera )
    
    scene.add( new THREE.AmbientLight( 0x404040, 10 ) );
    scene.background = new THREE.Color( 0xbfe3dd );

    // toRaw() removes the "proxy" property of this.voxelizedMesh so it can be accessed and modified by THREE functions.
    let rawVoxelizedMesh = toRaw(this.voxelizedMesh);

    // Changind the basic material of the mesh to make it reflect and react to light.
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x777777,
      shininess: 1,
      side: THREE.DoubleSide,
      // Clipping setup:
      clipShadows: true,
    });
    const materialWire = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      shininess: 1,
      side: THREE.DoubleSide,
      // Clipping setup:
      clipShadows: true,
      wireframe: true,
    });

    // Add Mockup Mesh to Scene
    const mesh = new THREE.Mesh(rawVoxelizedMesh.geometry, material)
    const offset = new THREE.Vector3()
    mesh.geometry.computeBoundingBox()
    mesh.geometry.boundingBox.getCenter(offset)
    offset.negate()
    mesh.position.add(offset)
    scene.add( mesh );
    
    // Add Wireframe of Mockup Mesh
    var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0x000000 } );
    var wireframe = new THREE.LineSegments( geo, mat );
    mesh.add( wireframe );

    // Configure controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener( 'change', render );

    // Trigger Render
    if (this.isLoading) this.isLoading = false
    render();

    previewDiv.appendChild( renderer.domElement );

    function animate() {
      requestId = requestAnimationFrame(animate);
      render();
    }

    function render() {
      renderer.render( scene, camera );
    }
    animate()
  },
  beforeUnmount() {
    // Stopping the animation so it doens't continue in the background and 
    // slow down the user's computer.
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
  },
  methods: {
    ...mapActions({
      downloadMesh: 'map/downloadMesh',
    }),
    download3DModel() {
      this.downloadMesh();
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