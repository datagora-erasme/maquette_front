<template>
  <v-col v-if="currentTabValue !== null" :style="'max-width: ' + width + 'px'" class="pa-0">
    <v-card v-if="currentTabValue == 1" class="mockup-creation-card pa-3">
      <v-row class="d-flex justify-center">
        <h3> Parcours de création d'une maquette </h3>
      </v-row>
      <v-row class="py-3 px-2">
        <stepper-component :steps="stepperSteps" :current-step="currentStep" />
      </v-row>
      <v-row class="steps-container pa-3">
        <v-row v-if="currentStep == 0" class="step1 d-flex flex-column">
          <row class="step1Title">
            Panel de sélection d'une emprise
          </row>
          <row>
            Veuillez indiquer le nombre de plaques horizontales et verticales de lego que vous souhaitez utiliser <br><br>
          </row>
          <v-row class="d-flex justify-space-evenly">
            <v-responsive min-width="140" max-width="140">
              <v-text-field
                v-model="nbPlatesHorizontal"
                variant="solo-filled"
                clearable
                :disabled="isPlatesSelected" 
                label="Horizontal" 
                :rules="[onlyNumbers, rangeValidationHorizontal]"
              />
            </v-responsive>
            <v-responsive min-width="140" max-width="140">
              <v-text-field
                v-model="nbPlatesVertical"
                variant="solo-filled"
                clearable
                :disabled="isPlatesSelected" 
                label="Vertical" 
                :rules="[onlyNumbers, rangeValidationVertical]"
              />
            </v-responsive>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-btn
              v-if="!isPlatesSelected"
              density="comfortable"
              color="#414288"
              min-width="230"
              style="color: white"
              @click="checkPlatesNumber()"
            >
              Valider plaques
            </v-btn>
            <v-btn
              v-if="isPlatesSelected"
              density="comfortable"
              color="#A18276"
              min-width="230"
              style="color: white"
              @click="clearPlatesNumber()"
            >
              Redéfinir plaques
            </v-btn>
            <br><br>
          </v-row>
          <v-row class="pa-3">
            Après avoir sélectionné le nombre de plaques souhaité, cliquez sur "Sélectionnez la zone" puis cliquez sur la carte pour choisir une zone.
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
              v-if="isAreaSelectionActive"
              density="comfortable"
              color="#3F0D12"
              min-width="230"
              style="color: white"
              @click="cancelSelection()"
            >
              Annuler la sélection
            </v-btn>
            <v-btn
              v-if="!isAreaSelectionActive && isAreaSelected"
              density="comfortable"
              color="#A18276"
              min-width="230"
              style="color: white"
              @click="startSelection()"
            >
              Modifier la sélection
            </v-btn>
            <br><br>
            <v-btn
              v-if="isAreaSelectionActive"
              density="comfortable"
              color="#1B5E20"
              min-width="230"
              style="color: white"
              @click="endSelection()"
            >
              Valider la sélection
            </v-btn>
          </v-row>
          <v-row v-if="isAreaSelected && !isAreaSelectionActive" class="pa-3 d-flex justify-center">
            Si la sélection vous convient, cliquez sur "Étape suivante" pour lancer la voxelisation. <br><br>
            <v-btn
              stacked
              color="#1B5E20"
              min-width="230"
              style="color: white"
              @click="goToNextStep"
            >
              Étape suivante
            </v-btn>
          </v-row>
        </v-row>
        <v-row v-if="currentStep === 1" class="step2 w-100 d-flex justify-center align-center" style="height: calc(100vh - 200.38px)">
          <div class="d-flex flex-column justify-center align-center">
            <v-progress-circular
              v-if="isLoading"
              color="#414288"
              indeterminate
              :size="128"
              :width="5"
            />
            <div class="pt-2">
              Veuillez patienter pendant la voxelisation{{ dots }}
            </div>
          </div>
        </v-row>
        <v-row v-if="currentStep === 2" class="step3 w-100 d-flex justify-center" style="height: calc(100vh - 124.38px)">
          <div class="title-buttons-container w-100 d-flex flex-column align-center justify-space-around">
            <h2 class="">
              La maquette est prête !
            </h2>
            <v-card class="buttons-card d-flex flex-column align-center justify-space-around">
              <v-btn
                color="#A18276"
                min-width="230"
                style="color: white"
                @click="a"
              >
                Afficher maquette
              </v-btn>
              <v-btn
                color="#A18276"
                min-width="230"
                style="color: white"
                disabled
              >
                Télécharger le CSV
              </v-btn>
              <v-btn
                color="#A18276"
                min-width="230"
                style="color: white"
                disabled
              >
                Télécharger l'emprise
              </v-btn>
            </v-card>
          </div>
        </v-row>
      </v-row>
    </v-card>
    <v-card v-if="currentTabValue == 2">
      bbb
    </v-card>
    <v-card v-if="currentTabValue == 3">
      ccc
    </v-card>
  </v-col>
</template>

<script>
import StepperComponent from './StepperComponent.vue'
import AWN from 'awesome-notifications'

// Initialize instance of AWN
let notifier = new AWN({})

export default {
  name: 'SidebarComponent',
  components: { StepperComponent },
  props: {
    width: {
      type: Number,
      required: true,
    },
    currentTabValue: {
      type: Number,
      required: true,
    },
    selectedArea: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      nbPlatesHorizontal: null,
      nbPlatesVertical: null,
      isPlatesSelected: false,
      isAreaSelectionActive: false,
      isAreaSelected: false,
      currentStep: 2,
      isLoading: false,
      dotsCount: 3,
      dotsVisible: 0,
      stepperSteps: ['Emprise', 'Voxelisation', 'Finalisation']
    }
  },
  computed: {
    // Added here because props.selectedArea isn't a vue data() object, thus its value 
    // doesn't get updated here when it is updated in the parent component
    localSelectedArea() {
      return this.$props.selectedArea;
    },
    dots() {
      return '.'.repeat(this.dotsVisible);
    },
  },
  watch: {
    currentStep() {
      if (this.currentStep === 1) {
        this.isLoading = true;
        this.$emit('onStep1')
      }
    },
  },
  mounted() {
    this.animateDots();
  },
  methods: {
    animateDots() {
      setTimeout(() => {
        this.dotsVisible = (this.dotsVisible + 1) % (this.dotsCount + 1);
        this.animateDots();
      }, this.dotsVisible === 0 ? 800 : 400);
    },
    endVoxelisation() {
      this.isLoading = false;
      this.goToNextStep();
    },
    goToNextStep() {
      this.currentStep++;
    },
    checkPlatesNumber() {
      if (!this.nbPlatesHorizontal || !this.nbPlatesVertical) {
          // this.$awn.warning("Veuillez d'abord sélectionner le nombre de plaques", {})
          notifier.warning('Your custom message')
          console.log("Veuillez d'abord sélectionner le nombre de plaques")
          return;
      }
      if (this.nbPlatesHorizontal > 5 || this.nbPlatesVertical > 3) {
        console.log('Veuillez sélectionner au plus 5 plaques horizontales et 3 plaques verticales')
        return;
      }
      this.isPlatesSelected = true
      this.$emit('onPlatesSelected', { horizontal: this.nbPlatesHorizontal, vertical: this.nbPlatesVertical })
    },
    clearPlatesNumber() {
      // Remove selected area when redefining the plates number
      this.$emit('onRemoveSelectedArea')
      this.isAreaSelectionActive = false
      this.localSelectedArea = null
      this.isAreaSelected = false
      this.nbPlatesVertical = null
      this.nbPlatesHorizontal = null
      this.isPlatesSelected = false
    },
    startSelection() {
      this.isAreaSelectionActive = true
    },
    endSelection() {
      this.isAreaSelectionActive = false
      this.isAreaSelected = !!this.selectedArea
      if (this.isAreaSelected) {
        this.$emit('onTravelToSelectedArea')
      }
    },
    cancelSelection() {
      this.isAreaSelectionActive = false
      this.isAreaSelected = false
      this.$emit('onRemoveSelectedArea')
    },
    onlyNumbers(value) {
      return /^\d+$/.test(value) || 'Nombres uniquement';
    },
    rangeValidationHorizontal(value) {
      const numValue = parseInt(value);
      return numValue >= 1 && numValue <= 5 || 'Doit être compris entre 1 et 5';
    },
    rangeValidationVertical(value) {
      const numValue = parseInt(value);
      return numValue >= 1 && numValue <= 3 || 'Doit être compris entre 1 et 3.';
    },
  },
}
</script>

<style>

.title-buttons-container {
  height: 500px;
}
.buttons-card {
  width: 70%;
  height: 35%;
}
</style>