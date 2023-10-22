<template>
  <div v-if="currentTabValue !== null" class="sidebar-container pa-0">
    <!-- <v-col v-if="currentTabValue !== null" :style="'max-width: ' + width + 'px; border-right: 1px solid #e4e4e4;'" class="pa-0"> -->
    <v-card v-if="currentTabValue == 1" class="sidebar-cards py-5 px-7">
      <v-row class="d-flex justify-center">
        <v-col class="sidebar-title-col pa-0">
          <!-- <div class="sidebar-title py-2"> -->
          <h3 class="sidebar-title py-2">
            Parcours de création d'une maquette
          </h3>
          <!-- </div> -->
        </v-col>
      </v-row>
      <v-row class="py-5">
        <v-col class="pa-0">
          <stepper-component :steps="stepperSteps" :current-step="currentStep" />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pa-0">
          <v-row v-if="currentStep == 0" class="step1 d-flex flex-column">
            <v-col class="pa-0">
              <div class="step1Title pa-3 text-h6 font-weight-bold">
                Sélection d'une emprise
              </div>
              <v-row class="d-flex justify-center">
                <v-col class="pa-0" :class="$vuetify.display.height > 722 ? 'text-subtitle-1' : 'text-subtitle-2'" cols="11">
                  Veuillez indiquer le nombre de plaques horizontales et verticales de Lego que vous souhaitez utiliser
                </v-col>
              </v-row>
              <v-row class="d-flex justify-space-evenly pt-6 pb-3">
                <v-col class="pa-0 pb-2" cols="5">
                  <v-text-field
                    v-model="nbPlatesHorizontal"
                    variant="underlined"
                    clearable
                    :density="$vuetify.display.height > 722 ? 'default' : 'compact'"
                    :disabled="isPlatesSelected" 
                    label="Horizontal" 
                    type="number"
                    prepend-icon="mdi-arrow-expand-horizontal"
                    :rules="[onlyNumbers, rangeValidationHorizontal]"
                  />
                </v-col>
                <v-col class="pa-0 pb-2" cols="5">
                  <v-text-field
                    v-model="nbPlatesVertical"
                    variant="underlined"
                    clearable
                    :density="$vuetify.display.height > 722 ? 'default' : 'compact'"
                    :disabled="isPlatesSelected" 
                    label="Vertical" 
                    type="number"
                    prepend-icon="mdi-arrow-expand-vertical"
                    :rules="[onlyNumbers, rangeValidationVertical]"
                  />
                </v-col>
              </v-row>
              <v-row class="d-flex justify-center mt-0">
                <v-btn
                  v-if="!isPlatesSelected"
                  density="comfortable"
                  color="#414288"
                  min-width="230"
                  style="color: white"
                  @click="checkPlatesNumber()"
                >
                  Valider les plaques
                </v-btn>
                <v-btn
                  v-if="isPlatesSelected"
                  density="comfortable"
                  color="#37474F"
                  min-width="230"
                  style="color: white"
                  :disabled="ongoingTravel"
                  @click="clearPlatesNumber()"
                >
                  Redéfinir les plaques
                </v-btn>
              </v-row>
              <v-row>
                <v-col :class="$vuetify.display.height > 722 ? 'text-subtitle-1' : 'text-subtitle-2'"> 
                  Après avoir sélectionné le nombre de plaques souhaité, cliquez sur "Sélectionner la zone" puis cliquez sur la carte pour positionner votre emprise.
                </v-col>
              </v-row>
              <v-row class="d-flex justify-center">
                <v-btn
                  v-if="!isAreaSelectionActive && !isAreaSelected"
                  density="comfortable"
                  :disabled="!isPlatesSelected"
                  color="#414288"
                  min-width="230"
                  style="color: white"
                  @click="startSelection()"
                >
                  Sélectionner la zone
                </v-btn>
                <v-btn
                  v-if="!isAreaSelectionActive && isAreaSelected"
                  density="comfortable"
                  color="#37474F"
                  min-width="230"
                  style="color: white"
                  @click="startSelection()"
                >
                  Modifier la sélection
                </v-btn>
                <div v-if="isAreaSelectionActive">
                  <v-btn
                    density="comfortable"
                    color="#3F0D12"
                    min-width="230"
                    style="color: white"
                    :disabled="ongoingTravel"
                    @click="cancelSelection()"
                  >
                    Annuler la sélection
                  </v-btn>
                  <br><br>
                </div>
                <div v-if="isAreaDropped && !isAreaSelected">
                  <!-- <div v-if="!isAreaSelected"> -->
                  Appliquer une rotation à la zone séléctionnée :
                  <v-slider
                    v-model="sliderValue"
                    class="align-center"
                    :max="sliderMax"
                    :min="sliderMin"
                    hide-details
                  >
                    <template #append>
                      <div style="width: 70px">
                        {{ sliderValue.toFixed(1) }}°
                      </div>
                    </template>
                  </v-slider>
                  <br>
                  <!-- </div> -->
                  <v-btn
                    :loading="ongoingTravel"
                    density="comfortable"
                    color="#1B5E20"
                    min-width="230"
                    style="color: white"
                    @click="endSelection()"
                  >
                    Valider la sélection
                  </v-btn>
                </div>
              </v-row>
              <v-row v-if="isAreaSelected && !isAreaSelectionActive" class="d-flex justify-center">
                <v-col>
                  <div :class="$vuetify.display.height > 722 ? 'text-subtitle-1' : 'text-subtitle-2'">
                    Si la sélection vous convient, cliquez sur "Étape suivante" pour lancer la création.
                  </div>
                  <v-btn
                    :stacked="$vuetify.display.height > 722"
                    :class="$vuetify.display.height > 722 ? 'mt-2' : 'mt-4'"
                    color="#1B5E20"
                    min-width="230"
                    style="color: white"
                    @click="goToNextStep"
                  >
                    Étape suivante
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-if="currentStep === 1" class="step2 w-100 d-flex justify-center align-center" style="height: calc(100vh - 200.38px)">
            <div class="d-flex flex-column justify-center align-center">
              <!-- Loading Lego Gif -->
              <img src="https://i.gifer.com/origin/f3/f39692ecaeca69ab75397c1caee129e8.gif" width="400">
              <div class="pt-0">
                Veuillez patienter pendant la construction en Lego<br>de votre maquette...
              </div>
            </div>
          </v-row>
          <v-row v-if="currentStep === 2" class="step3 w-100 d-flex justify-center" style="height: calc(100vh - 124.38px)">
            <v-col class="title-buttons-container w-100 d-flex flex-column align-center justify-space-around">
              <h2 class="mockup-ready-title">
                Votre maquette est prête !
              </h2>
              <!-- <v-card class="buttons-card pa-0 d-flex flex-column justif-center"> -->
              <v-row class="h-100 pa-0">
                <v-col class="py-0 px-1 d-flex flex-column justify-space-evenly align-center">
                  <v-btn
                    color="#37474F"
                    class="last-step-buttons"
                    @click="showMockup"
                  >
                    Afficher le rendu 3D
                  </v-btn>
                  <v-btn
                    color="#37474F"
                    class="last-step-buttons"
                    prepend-icon="$vuetify"
                    stacked
                    @click="generateAndDownloadCSV"
                  >
                    Générer le guide<br> de montage
                  </v-btn>
                  <v-btn
                    color="#37474F"
                    class="last-step-buttons"
                    stacked
                    disabled
                    @click="downloadArea"
                  >
                    Télécharger l'emprise géographique
                  </v-btn>
                </v-col>
              </v-row>
              <!-- </v-card> -->
              <v-btn
                color="#414288"
                class="new-mockup-button"
                prepend-icon="mdi-arrow-left"
                @click="resetMockupSelection"
              >
                Créer une nouvelle maquette
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
    <v-card v-if="currentTabValue == 2" class="sidebar-cards py-5 px-7">
      <v-row class="d-flex justify-center">
        <v-col class="pa-0">
          <div class="sidebar-title text-h6 font-weight-medium py-2">
            Panel de projection de la maquette
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="projection-panel d-flex flex-column justify-center align-center">
          <v-btn
            :stacked="$vuetify.display.height > 722"
            color="#1B5E20"
            min-width="330"
            style="color: white"
            @click="startSlideShow()"
          >
            Lancer le mode projection
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-card v-if="currentTabValue == 3">
      ccc
    </v-card>
  <!-- </v-col> -->
  </div>
</template>

<script>
import StepperComponent from './StepperComponent.vue'
import { mapActions, mapGetters } from 'vuex'


export default {
  name: 'SidebarComponent',
  components: { StepperComponent },
  props: {
    currentTabValue: {
      type: Number,
      required: true,
    },
    ongoingTravel: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      width: 400,
      nbPlatesHorizontal: null,
      nbPlatesVertical: null,
      isPlatesSelected: false,
      currentStep: 0,
      isLoading: false,
      stepperSteps: ['Emprise', 'Construction', 'Finalisation'],
      sliderValue: 0,
      sliderMin: 0,
      sliderMax: 360,
    }
  },
  computed: {
    ...mapGetters({
      voxelizedMesh: 'map/getVoxelizedMesh',
      plates: 'map/getPlates',
      getCurrAreaRotation: 'map/getCurrAreaRotation',
      getAreaSelectionActive: 'map/getAreaSelectionActive',
      getAreaDropped: 'map/getAreaDropped',
      getAreaSelected: 'map/getAreaSelected',
    }),
    currAreaRotation() {
      return this.getCurrAreaRotation
    },
    isAreaSelectionActive() {
      return this.getAreaSelectionActive
    },
    isAreaDropped() {
      return this.getAreaDropped
    },
    isAreaSelected() {
      return this.getAreaSelected
    },
  },
  watch: {
    ongoingTravel() {
      if (this.ongoingTravel === false) {
        this.setAreaSelectionActive(false)
      }
    },
    currentStep() {
      if (this.currentStep === 1) {
        this.isLoading = true;
        this.$emit('onStep1')
      }
    },
    sliderValue() {
      this.computeAreaRotation(this.sliderValue)
    },
  },
  mounted() {
    // ===== Bind Events =====
    this.$evtBus.on('onResetSliderRotation', this.resetSliderRotation);
  },
  methods: {
    ...mapActions({
      setPlates: 'map/setPlates',
      generateHeightMap: 'map/generateHeightMap',
      generateCSVString: 'map/generateCSVString',
      downloadCSV: 'map/downloadCSV',
      setNewAreaRotation: 'map/setNewAreaRotation',
      setAreaSelectionActive: 'map/setAreaSelectionActive',
      setAreaDropped: 'map/setAreaDropped',
      setAreaSelected: 'map/setAreaSelected',
    }),
    computeAreaRotation(newRotation) {
      this.setNewAreaRotation(newRotation) // in Deg
      this.$emit('onRotateSelectedArea')
    },
    startSlideShow() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      // ! Need to replace
      this.$emit('onTravelToSelectedArea')
      this.$emit('onCloseNavbar')
    },
    generateAndDownloadCSV() {
      this.generateHeightMap({ mesh: this.voxelizedMesh, platesX: this.plates.x, platesY: this.plates.y }).then((heightMap) => {
        this.generateCSVString({ heightMap, platesX: this.plates.x }).then((csvString) => {
          this.downloadCSV({ csvString, name: 'Lego' });
        });
      });
    },
    resetMockupSelection() {
      console.log('resetMockupSelection')
      this.currentStep = 0;
      this.clearPlatesNumber()
      this.cancelSelection()
      this.$emit('onResetMockupSelection')
    },
    downloadArea() {
      this.$emit('onDownloadArea')
    },
    endVoxelisation() {
      this.isLoading = false;
      this.goToNextStep();
    },
    goToNextStep() {
      this.currentStep++;
      this.setPlates({ x: this.nbPlatesHorizontal, y: this.nbPlatesVertical })
    },
    showMockup() {
      this.$emit('onShowPreview')
    },
    hideMockup() {
      this.$emit('onHidePreview')
    },
    checkPlatesNumber() {
      if (!this.nbPlatesHorizontal || !this.nbPlatesVertical) {
          this.$notify({
            title: 'Nombre de plaques non saisi',
            text: 'Veuillez sélectionner le nombre de plaques',
            type: 'info'
          });
          return;
      }
      if ((this.nbPlatesHorizontal < 1 || this.nbPlatesHorizontal > 6) || (this.nbPlatesVertical < 1 || this.nbPlatesVertical > 6)) {
        this.$notify({
            title: 'Nombre de plaques incorrect',
            text: 'Veuillez sélectionner entre 1 à 6 plaques horizontales et verticales',
            type: 'info'
          });
        return;
      }
      this.isPlatesSelected = true
      this.$emit('onPlatesSelected', { horizontal: this.nbPlatesHorizontal, vertical: this.nbPlatesVertical })
    },
    clearPlatesNumber() {
      this.nbPlatesVertical = null
      this.nbPlatesHorizontal = null
      this.isPlatesSelected = false
      // Remove selected area when redefining the plates number
      this.cancelSelection()
    },
    startSelection() {
      this.setAreaSelectionActive(true)
      this.setAreaSelected(false)
      this.$emit('onStartSelection')
    },
    endSelection() {
      if (!this.isAreaDropped) {
        this.$notify({
          title: 'Zone non sélectionnée',
          text: "Veuillez d'abord sélectionner une zone en cliquant sur la carte",
          type: 'info'
        });
      } else {
        this.setAreaSelected(true)
        this.$emit('onTravelToSelectedArea')
      }
    },
    cancelSelection() {
      this.setAreaSelectionActive(false)
      this.setAreaDropped(false)
      this.setAreaSelected(false)
      this.sliderValue = 0
      this.$emit('onRemoveSelectedArea')
    },
    resetSliderRotation() {
      this.sliderValue = 0
    },
    onlyNumbers(value) {
      return /^\d+$/.test(value) || 'Nombres uniquement';
    },
    rangeValidationHorizontal(value) {
      const numValue = parseInt(value);
      return numValue >= 1 && numValue <= 6 || 'Doit être compris entre 1 et 6';
    },
    rangeValidationVertical(value) {
      const numValue = parseInt(value);
      return numValue >= 1 && numValue <= 6 || 'Doit être compris entre 1 et 6';
    },
  },
}
</script>

<style>
.sidebar-container {
  position: fixed;
  left: 55px;
  top: 0;
  max-width: 400px;
  height: 100%;
  z-index: 10;
  border-right: 1px solid #e4e4e4;
}

.sidebar-cards {
  width: 100%;
  height: 100%;
  border: 0 !important;
  border-radius: 0 !important;
}

.mockup-ready-title {
  color: #414288;
}
.sidebar-title {
  color: #414288;
  font-weight: bold;
}
.step1Title {
  color: #414288;
}
.title-buttons-container {
  height: 75vh;
}
.buttons-card {
  width: 70%;
  height: 35%;
}
.last-step-buttons {
  color: white !important; 
  width: 90%;
}
.new-mockup-button {
  color: white !important; 
  width: 100%;
}


.projection-panel {
  height: 100%;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
}
</style>