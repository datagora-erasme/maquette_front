<template>
  <div v-if="currentTabValue !== null && !isFullscreen" class="sidebar-container pa-0">
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
                    @keyup.enter="checkPlatesNumber()"
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
                    @keyup.enter="checkPlatesNumber()"
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
              <v-row v-if="isPlatesSelected">
                <v-col :class="$vuetify.display.height > 722 ? 'text-subtitle-1' : 'text-subtitle-2'"> 
                  Après avoir sélectionné le nombre de plaques, cliquez sur "Sélectionner la zone" puis cliquez sur<br> la carte pour positionner votre emprise.
                </v-col>
              </v-row>
              <v-row class="d-flex justify-center">
                <v-btn
                  v-if="!isAreaSelectionActive && !isAreaSelected && isPlatesSelected"
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
                  v-if="!isAreaSelectionActive && isAreaSelected && isPlatesSelected"
                  density="comfortable"
                  color="#37474F"
                  min-width="230"
                  style="color: white"
                  @click="startSelection()"
                >
                  Modifier la sélection
                </v-btn>
                <div v-if="isAreaSelectionActive && isPlatesSelected">
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
                <div v-if="isAreaDropped && !isAreaSelected && isPlatesSelected">
                  <div>
                    Votre zone est séléctionnée. <br>Vous pouvez cliquer à nouveau sur la carte pour la déplacer ou "Valider votre sélection".
                  </div>
                  <!-- ! DISABLE FOR THE MOMENT -->
                  <div v-if="false">
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
                  </div>
                  <v-btn
                    :loading="ongoingTravel"
                    density="comfortable"
                    color="#1B5E20"
                    min-width="230"
                    class="mt-2"
                    style="color: white"
                    @click="endSelection()"
                  >
                    Valider la sélection
                  </v-btn>
                </div>
              </v-row>
              <v-row v-if="isAreaSelected && !isAreaSelectionActive && isPlatesSelected" class="d-flex justify-center">
                <v-col>
                  <div :class="$vuetify.display.height > 722 ? 'text-subtitle-1' : 'text-subtitle-2'">
                    Si la sélection vous convient, cliquez sur "Étape suivante" pour lancer la création.
                  </div>
                  <v-btn
                    :class="$vuetify.display.height > 722 ? 'mt-2' : 'mt-4'"
                    color="#1B5E20"
                    min-width="230"
                    min-height="80"
                    style="color: white"
                    append-icon="mdi-arrow-right"
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
          <v-row v-if="currentStep === 2" class="step3 d-flex justify-center" style="height: calc(100vh - 124.38px); width: 390px">
            <v-col class="title-buttons-container w-100 d-flex flex-column align-center justify-space-around">
              <h2 class="mockup-ready-title">
                Votre maquette est prête !
              </h2>
              <!-- <v-card class="buttons-card pa-0 d-flex flex-column justif-center"> -->
              <v-row class="d-flex align-center pa-0">
                <v-col class="py-0 px-1 d-flex flex-column justify-space-evenly align-center">
                  <v-btn
                    color="#414288"
                    class="last-step-buttons mb-3"
                    prepend-icon="mdi-printer-3d"
                    height="50"
                    block
                    @click="showMockup"
                  >
                    Afficher le rendu 3D
                  </v-btn>
                  <v-btn
                    color="#414288"
                    class="last-step-buttons mb-3"
                    prepend-icon="mdi-file-excel"
                    height="50"
                    block
                    @click="generateAndDownloadCSV"
                  >
                    <span class="py-2">Générer le guide<br> de montage</span>
                  </v-btn>
                  <v-btn
                    color="#414288"
                    class="last-step-buttons"
                    prepend-icon="mdi-cloud-download"
                    height="50"
                    block
                    disabled
                    @click="downloadArea"
                  >
                    <span class="py-2">Télécharger l'emprise<br> géographique</span>
                  </v-btn>
                </v-col>
              </v-row>
              <!-- </v-card> -->
              <v-form ref="formMockup" on-submit="return false;">
                <div v-if="!newMockupSend">
                  <div class="w-100 mb-2">
                    <v-text-field
                      v-model="newMockupName"
                      label="Nom de votre nouvelle maquette *" 
                      width="100%"
                      variant="outlined" 
                      :rules="[rules.required, rules.max20]"
                      maxlength="20"
                      density="compact"
                      counter
                      clearable
                    />
                  </div>
                  <v-btn
                    color="#1B5E20"
                    class="new-mockup-button mb-2"
                    prepend-icon="mdi-content-save"
                    @click="saveNewMockup()"
                  >
                    Sauvegarder cette maquette
                  </v-btn>
                </div>
                <div v-else>
                  <v-btn
                    color="#37474F"
                    class="new-mockup-button mb-2"
                    prepend-icon="mdi-arrow-left"
                    @click="redirectMockupList()"
                  >
                    Consulter mes maquettes
                  </v-btn>
                </div>
                <v-btn
                  color="#37474F"
                  class="new-mockup-button"
                  prepend-icon="mdi-arrow-left"
                  @click="resetMockupSelection()"
                >
                  Créer une nouvelle maquette
                </v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
    <v-card v-if="currentTabValue == 2" class="sidebar-cards py-5 px-7">
      <v-row class="d-flex justify-center">
        <v-col class="pa-0">
          <h3 class="sidebar-title py-2">
            Projection d'une maquette
          </h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="projection-panel d-flex flex-column justify-center align-center">
          Avant de lancer le mode projection, vous devez créer ou ouvrir une maquette existante.
          <br><br>
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
    <v-card v-if="currentTabValue == 3" class="mockup-list-cards py-5 px-0">
      <v-row class="d-flex justify-center">
        <v-col class="pa-0">
          <h3 class="sidebar-title py-2">
            Mes maquettes
          </h3>
        </v-col>
      </v-row>
      <v-card-text class="pa-0 layer-card-text">
        <!-- Mockup List -->
        <div v-if="!allMockupList.length" class="mt-5 align-center">
          <i>Aucune maquette sauvegardée</i>
        </div>
        <v-list v-else class="pa-0 mockup-list">
          <!-- v-for -->
          <div
            v-for="(cMock, index) in allMockupList.sort(function(a, b){return a.id - b.id})"
            :key="cMock.id"
          >
            <v-list-item
              :title="cMock.name"
              :subtitle="cMock.subtitle"
              :prepend-icon="cMock.icon"
              class="mockup-list-item"
            >
              <template #prepend>
                <v-icon class="fs-25" color="black" icon="mdi-toy-brick-outline" />
              </template>
              <template #title="{title}">
                <div class="d-flex align-left">
                  <span class="mockup-list-title">N°{{ cMock.id + ' - ' + title }}</span>
                </div>
              </template>
              <template #subtitle>
                <div class="d-flex align-left">
                  Plaques : {{ cMock.nb_plaques_h + ' x ' + cMock.nb_plaques_v }}
                </div>
              </template>
              <template #append>
                <v-btn
                  color="green-darken-2"
                  icon="mdi-eye"
                  variant="outlined"
                  density="comfortable"
                  class="ml-1"
                  @click="openMockup(index)"
                />
                <v-btn
                  color="black"
                  icon="mdi-square-edit-outline"
                  variant="outlined"
                  density="comfortable"
                  class="ml-1"
                  @click="editMockup(index)"
                />
                <v-btn
                  color="red-darken-3"
                  icon="mdi-trash-can"
                  variant="outlined"
                  density="comfortable"
                  class="ml-1"
                  @click="deleteMockup(index)"
                />
              </template>
            </v-list-item>
          </div>
        </v-list>
      </v-card-text>
    </v-card>
    <v-card v-if="currentTabValue == 4" class="sidebar-cards py-5 px-7">
      <v-row class="d-flex justify-center">
        <v-col class="pa-0">
          <h3 class="sidebar-title py-2">
            Aide et crédits
          </h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="projection-panel d-flex flex-column justify-center align-center">
          Commande pour se déplacer sur la carte :
          <br><br>
          Clic gauche : Déplacer la caméra
          Left-Click: camera translation (drag)
          Right-Click: camera translation (pan)
          Ctrl + Left-Click: camera rotation (orbit)
          Spacebar / Wheel-Click: smart zoom
          Mouse Wheel: zoom in/out
          T: orient camera to a top view
          Y: move camera to start position
        </v-col>
      </v-row>
    </v-card>
    <!-- Edit Mockup Dialog -->
    <v-dialog
      v-model="editMockupDialog"
      width="400px"
    >
      <v-card>
        <v-card-title>
          Modification d'une maquette
        </v-card-title>
        <v-card-text>
          <v-form ref="formEditMockup" on-submit="return false;">
            <v-text-field
              v-model="editMockupNewName"
              label="Nouveau nom pour cette maquette *" 
              width="100%"
              variant="outlined" 
              :rules="[rules.required, rules.max20]"
              maxlength="20"
              counter
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="#37474F"
            variant="outlined"
            size="small"
            @click="closeEditMockup()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="green-darken-2"
            variant="flat"
            size="small"
            @click="updateCurrentMockup()"
          >
            Sauvegarder
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete Mockup Dialog -->
    <v-dialog
      v-model="deleteMockupDialog"
      width="400px"
    >
      <v-card>
        <v-card-title>
          Suppression d'une maquette
        </v-card-title>
        <v-card-text>
          Etes-vous sûr de vouloir supprimer la maquette <b>n°{{ editMockupId + ' - ' + editMockupNewName }}</b> ?
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="#37474F"
            variant="outlined"
            size="small"
            @click="closeDeleteMockup()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="red-darken-3"
            variant="flat"
            size="small"
            @click="deleteCurrentMockup()"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import StepperComponent from './StepperComponent.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SidebarComponent',
  components: { StepperComponent },
  props: {
    // currentTabValue: {
    //   type: Number,
    //   required: true,
    // },
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
      newMockupSend: false,
      newMockupName: null,
      editMockupDialog: false,
      editMockupId: null,
      editMockupNewName: null,
      deleteMockupDialog: false,
      rules: {
        required: value => !!value || 'Champs obligatoire',
        max20: value => value.length <= 20 || 'Max 20 caractères',
      },
    }
  },
  computed: {
    ...mapGetters({
      voxelizedMesh: 'map/getVoxelizedMesh',
      plates: 'map/getPlates',
      getCurrentTabValue: 'map/getCurrentTabValue',
      getCurrAreaRotation: 'map/getCurrAreaRotation',
      getAreaSelectionActive: 'map/getAreaSelectionActive',
      getAreaDropped: 'map/getAreaDropped',
      getAreaSelected: 'map/getAreaSelected',
      getSelectedBbox: 'map/getSelectedBbox',
      getSelectedPos: 'map/getSelectedPos',
      getProjectsList: 'project/getProjectsList',
      getIsFullscreen: 'map/getIsFullscreen',
    }),
    currentTabValue() {
      return this.getCurrentTabValue
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
    currentAreaBbox() {
      return this.getSelectedBbox
    },
    currentAreaPos() {
      return this.getSelectedPos
    },
    currAreaRotation() {
      return this.getCurrAreaRotation
    },
    allMockupList() {
      return this.getProjectsList
    },
    isFullscreen() {
      return this.getIsFullscreen
    }
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
    this.$evtBus.on('onResetSliderRotation', this.resetSliderRotation)
    this.$evtBus.on('onResetArea', this.resetMockupSelection)
    this.$evtBus.on('onResetStepperPos', this.resetMockupSelection)
    this.$evtBus.on('onOpenedMockupStep', this.openedMockupStep)
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
      fetchProjectsList: 'project/fetchProjectsList',
      saveProject: 'project/saveProject',
      updateProject: 'project/updateProject',
      deleteProject: 'project/deleteProject',
      setCurrentTabValue: 'map/setCurrentTabValue',
      setIsFullscreen: 'map/setIsFullscreen'
    }),
    computeAreaRotation(newRotation) {
      this.setNewAreaRotation(newRotation) // in Deg
      this.$emit('onRotateSelectedArea')
    },
    startSlideShow() {
      // Enable navigator fullscreen
      document.documentElement.requestFullscreen()

      // ! Need to replace - REFACTO
      this.$emit('onTravelForProjection')
      this.$emit('onCloseNavbar')

      // ! Hide all widgets
      document.getElementById('widgets-scale').style.display = 'none'
      document.getElementById('widgets-navigation').style.display = 'none'
      document.getElementById('widgets-searchbar').style.display = 'none'
      
      // Enable fullscreen in Store (v-if btn of exit + sidebar)
      this.setIsFullscreen(true)
    },
    endSlideShow() {
      // Disable navigator fullscreen
      document.exitFullscreen()

      // Restore display of all widget
      document.getElementById('widgets-scale').style.display = 'flex' // flex
      document.getElementById('widgets-navigation').style.display = 'flex' // flex
      document.getElementById('widgets-searchbar').style.display = 'block' // block
      
      // Disable fullscreen in Store
      this.setIsFullscreen(false)
    },
    generateAndDownloadCSV() {
      this.generateHeightMap({ mesh: this.voxelizedMesh, platesX: this.plates.x, platesY: this.plates.y })
      .then((heightMap) => {
        this.generateCSVString({ heightMap, platesX: this.plates.x })
        .then((csvString) => {
          this.downloadCSV({ csvString, name: 'Lego' });
        });
      });
    },
    saveNewMockup() {
      this.$refs.formMockup.validate().then((response) => {
        if (response.valid) {
          // Build bbox & pos object
          var bboxPosJson = {
            bbox: this.currentAreaBbox,
            pos: this.currentAreaPos,
            rotation: this.currAreaRotation,
          }
          // Build mockup Obj
          var newMockupObj = {
            bbox: JSON.stringify(bboxPosJson),
            name: this.newMockupName,
            nb_plaques_h: this.nbPlatesHorizontal,
            nb_plaques_v: this.nbPlatesVertical,
            ratio: 1,
            csv_id: 2, // TODO: Change
            model_id: 2, // TODO: Change
          }

          // Save
          this.saveProject(newMockupObj)
          .then((response) => {
            // Switch form
            this.newMockupSend = true
            // Notify
            this.$notify({
              title: 'Nouvelle maquette sauvegardée',
              text: 'Votre nouvelle maquette à bien été ajoutée à votre compte',
              type: 'success'
            })
          }).catch((e) => {
            // Notify
            this.$notify({
              title: 'Erreur lors de la sauvegarde',
              text: "Une erreur s'est produite lors de l'enregistrement des données",
              type: 'error'
            })
          })
        }
      })
    },
    resetMockupSelection() {
      this.currentStep = 0
      this.clearPlatesNumber()
      this.cancelSelection()
      // Reset Mockup form
      this.newMockupName = null
      this.newMockupSend = false
      this.$emit('onResetMockupSelection')
      this.$emit('onResetOpenedMockup')
    },
    openMockup(index) {
      // Get current Mockup
      var currMockup = this.allMockupList[index]
      // Trigger Event and send Bbox to ItownsViewer
      this.$evtBus.emit('onOpenMockup', currMockup)
    },
    openedMockupStep() {
      this.currentStep = 2
      this.setAreaSelectionActive(true)
      this.setAreaDropped(true)
      this.setAreaSelected(true)
      this.newMockupSend = true
    },
    editMockup(index) {
      this.editMockupDialog = true
      this.editMockupNewName = this.allMockupList[index].name
      this.editMockupId = this.allMockupList[index].id
    },
    closeEditMockup() {
      this.editMockupDialog = false
      this.editMockupNewName = null
      this.editMockupId = null
    },
    updateCurrentMockup() {
      this.$refs.formEditMockup.validate().then((response) => {
        if (response.valid) {
          // Build Obj
          const updatedMockup = {
            id: this.editMockupId,
            name: this.editMockupNewName
          }
          // PATCH Mockup
          this.updateProject(updatedMockup).then((response) => {
            // Notify
            this.$notify({
              title: 'Maquette mise à jour',
              text: 'Votre maquette à bien été mise à jour',
              type: 'success'
            });
            // Refetch list
            this.fetchProjectsList()
            // Clear and close
            this.closeEditMockup()
          }).catch((e) => {
            // Notify
            this.$notify({
              title: 'Erreur lors de la sauvegarde',
              text: "Une erreur s'est produite lors de l'enregistrement des données",
              type: 'error'
            });
            // Clear and close
            this.closeEditMockup()
          })
        }
      })
    },
    deleteMockup(index) {
      this.deleteMockupDialog = true
      this.editMockupNewName = this.allMockupList[index].name
      this.editMockupId = this.allMockupList[index].id
    },
    closeDeleteMockup() {
      this.deleteMockupDialog = false
      this.editMockupNewName = null
      this.editMockupId = null
    },
    deleteCurrentMockup() {
      // DELETE Mockup
      this.deleteProject(this.editMockupId).then((response) => {
        // Notify
        this.$notify({
          title: 'Maquette supprimée',
          text: 'Votre maquette à bien été supprimée',
          type: 'success'
        });
        // Refetch list
        this.fetchProjectsList()
        // Clear and close
        this.closeDeleteMockup()
      }).catch((e) => {
          // Notify
          this.$notify({
            title: 'Erreur lors de la sauvegarde',
            text: "Une erreur s'est produite lors de l'enregistrement des données",
            type: 'error'
          });
          // Clear and close
          this.closeDeleteMockup()
        })
    },
    redirectMockupList() {
      this.resetMockupSelection()
      // Change step & refetch
      this.setCurrentTabValue(3)
      this.fetchProjectsList()
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
      this.cancelSelection()
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

<style lang="scss">
.sidebar-container {
  position: fixed;
  left: 55px;
  top: 0;
  width: 400px;
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

/* Projection */
.projection-panel {
  height: 100%;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
}

/* Mockup List */
.mockup-list-cards {
  width: 410px;
  height: 100%;
  border: 0 !important;
  border-radius: 0 !important;
}
.layer-card-text {
  overflow-y: auto;
  height: calc(100% - 56px);
}
.close-icon {
  font-size: 25px;
}
.mockup-list {
  margin-top: 2em;
  border-top: 1px solid #e4e4e4 !important;

  .mockup-list-item {
    border-bottom: 1px solid #e4e4e4;
  }
  .v-list-group__items {
    --indent-padding: 0px !important;
  }
}
.mockup-list-item {
  padding-left: 16px !important;
}
.mockup-list-title {
  font-size: 16px;
}

.w-100 {
  width: 100%;
}
.fs-16 {
  font-size: 16px !important;
}
.fs-25 {
  font-size: 25px !important;
}
</style>