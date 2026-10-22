<template>
  <v-slide-x-transition>
    <v-card v-show="asideStatus" id="aside-card">
      <v-card-title class="aside-card-title">
        <v-row>
          <v-col class="d-flex align-center">
            Menu des couches
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn icon size="small" variant="text">
              <v-icon class="close-icon" icon="mdi-close" @click="closeAside()" />
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pa-0 layer-card-text">
        <!-- Base Layers List -->
        <v-list class="pa-0 layers-list">
          <div class="d-flex align-center subgroup-title-text section-toggle" @click="toggleSection('base')">
            <v-icon :icon="openSections.base ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="small" class="mr-1" />
            Couches de base
          </div>
          <v-expand-transition>
            <div v-show="openSections.base">
              <!-- v-for -->
              <div
                v-for="(bLayer, index) in allBaseLayers"
                :key="bLayer.id"
              >
                <v-list-item
                  :title="bLayer.name"
                  :subtitle="bLayer.subtitle"
                  :prepend-icon="bLayer.icon"
                  class="layers-list-item"
                >
                  <template #prepend="{prepend}">
                    <v-icon :color="allBaseLayers[index].visible ? 'black' : 'grey'" :icon="prepend" />
                  </template>
                  <template #title="{title}">
                    <div class="d-flex align-left">
                      <span :class="bLayer.visible ? '':'text-grey'">{{ title }}</span>
                    </div>
                  </template>
                  <template #subtitle="{subtitle}">
                    <div class="d-flex align-left">
                      {{ subtitle }}
                    </div>
                  </template>
                  <template #append>
                    <v-btn
                      v-if="bLayer.visible"
                      color="green-darken-2"
                      icon="mdi-eye"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="toggleVisible(index)"
                    />
                    <v-btn
                      v-else
                      color="grey"
                      icon="mdi-eye-off"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="toggleVisible(index)"
                    />
                    <v-btn
                      :color="allBaseLayers[index].openSub ? 'blue': 'black'"
                      icon="mdi-cog"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      :active="allBaseLayers[index].openSub"
                      :disabled="!bLayer.opacity"
                      @click="toggleSub(index)"
                    />
                    <v-btn
                      color="cyan-darken-3"
                      icon="mdi-help"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      disabled
                    />
                  </template>
                </v-list-item>
                <div v-if="allBaseLayers[index].openSub" class="sub-item">
                  <v-row class="justify-space-between">
                    <v-col lg="12" class="pb-0">
                      <span class="fs-16" :class="bLayer.visible ? '':'text-grey'">Opacité de la couche : <b>{{ Math.round(bLayer.opacity) }}%</b></span>
                      <v-slider
                        v-model="bLayer.opacity"
                        class="layers-slider"
                        :color="bLayer.visible ? 'blue':'grey'"
                        track-color="grey"
                        min="0"
                        max="100"
                        :step="1"
                        @update:modelValue="changeOpacity(index)"
                      >
                        <template #prepend>
                          <span :class="bLayer.visible ? '':'text-grey'">0%</span>
                        </template>
                        <template #append>
                          <span :class="bLayer.visible ? '':'text-grey'">100%</span>
                        </template>
                      </v-slider>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </v-list>
        <!-- Additionnal data layers -->
        <v-list class="layers-list">
          <div class="d-flex align-center subgroup-title-text section-toggle" @click="toggleSection('custom')">
            <v-icon :icon="openSections.custom ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="small" class="mr-1" />
            Données supplémentaires
          </div>
          <v-expand-transition>
            <div v-show="openSections.custom">
              <!-- v-for -->
              <div
                v-for="(bLayer, index) in allCustomLayers"
                :key="bLayer.id"
              >
                <v-list-item
                  :title="bLayer.name"
                  :subtitle="bLayer.subtitle"
                  :prepend-icon="bLayer.icon"
                  class="layers-list-item"
                >
                  <template #prepend="{prepend}">
                    <v-icon :color="allCustomLayers[index].visible ? 'black' : 'grey'" :icon="prepend" />
                  </template>
                  <template #title="{title}">
                    <div class="d-flex align-left">
                      <span :class="bLayer.visible ? '':'text-grey'">{{ title }}</span>
                    </div>
                  </template>
                  <template #subtitle="{subtitle}">
                    <div class="d-flex align-left">
                      {{ subtitle }}
                    </div>
                  </template>
                  <template #append>
                    <v-btn
                      v-if="bLayer.visible"
                      color="green-darken-2"
                      icon="mdi-eye"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="toggleVisibleCustom(index)"
                    />
                    <v-btn
                      v-else
                      color="grey"
                      icon="mdi-eye-off"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="toggleVisibleCustom(index)"
                    />
                    <v-btn
                      :color="allCustomLayers[index].openSub ? 'blue': 'black'"
                      icon="mdi-cog"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      :active="allCustomLayers[index].openSub"
                      :disabled="!bLayer.opacity"
                      @click="toggleSubCustom(index)"
                    />
                    <v-btn
                      color="cyan-darken-3"
                      icon="mdi-help"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      disabled
                    />
                  </template>
                </v-list-item>
                <div v-if="allCustomLayers[index].openSub" class="sub-item">
                  <v-row class="justify-space-between">
                    <v-col lg="12" class="pb-0">
                      <span class="fs-16" :class="bLayer.visible ? '':'text-grey'">Opacité de la couche : <b>{{ Math.round(bLayer.opacity) }}%</b></span>
                      <v-slider
                        v-model="bLayer.opacity"
                        class="layers-slider"
                        :color="bLayer.visible ? 'blue':'grey'"
                        track-color="grey"
                        min="0"
                        max="100"
                        :step="1"
                        @update:modelValue="changeOpacityCustom(index)"
                      >
                        <template #prepend>
                          <span :class="bLayer.visible ? '':'text-grey'">0%</span>
                        </template>
                        <template #append>
                          <span :class="bLayer.visible ? '':'text-grey'">100%</span>
                        </template>
                      </v-slider>
                    </v-col>
                  </v-row>
                  <!-- Buildings extrusion (iTowns viewer only) -->
                  <v-row v-if="bLayer.id === 'IGN_Buildings' && !isFullscreen" class="justify-space-between">
                    <v-col lg="12" class="pt-0">
                      <v-checkbox
                        v-model="bLayer.extruded"
                        class="layers-checkbox"
                        :color="bLayer.visible ? 'blue':'grey'"
                        density="compact"
                        hide-details
                        @update:modelValue="toggleBuildingsExtrusion(index)"
                      >
                        <template #label>
                          <span class="fs-16" :class="bLayer.visible ? '':'text-grey'">Extruder les bâtiments (3D)</span>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </v-list>
        <!-- User data layers (imported GeoJSON files) -->
        <v-list class="layers-list">
          <div class="d-flex align-center justify-space-between subgroup-title-text section-toggle" @click="toggleSection('user')">
            <span class="d-flex align-center">
              <v-icon :icon="openSections.user ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="small" class="mr-1" />
              Mes données
            </span>
            <v-btn
              color="#1976D3"
              variant="outlined"
              size="small"
              prepend-icon="mdi-upload"
              class="mr-3"
              @click.stop="openImportUser()"
            >
              Importer une couche
            </v-btn>
          </div>
          <v-expand-transition>
            <div v-show="openSections.user">
              <!-- Placeholder (as long as no layer is imported) -->
              <div v-if="!allUserLayers.length" class="d-flex align-center justify-center py-4 text-grey">
                <i>Aucune couche importée</i>
              </div>

              <!-- v-for -->
              <div
                v-for="(bLayer, index) in allUserLayers"
                :key="bLayer.id"
              >
                <v-list-item
                  :title="bLayer.name"
                  :subtitle="bLayer.subtitle"
                  :prepend-icon="bLayer.icon"
                  class="layers-list-item"
                >
                  <template #prepend="{prepend}">
                    <v-icon :color="allUserLayers[index].visible ? 'black' : 'grey'" :icon="prepend" />
                  </template>
                  <template #title="{title}">
                    <div class="d-flex align-left">
                      <span :class="bLayer.visible ? '':'text-grey'">{{ title }}</span>
                    </div>
                  </template>
                  <template #subtitle="{subtitle}">
                    <div class="d-flex align-left">
                      {{ subtitle }}
                    </div>
                  </template>
                  <template #append>
                    <v-btn
                      v-if="bLayer.visible"
                      color="green-darken-2"
                      icon="mdi-eye"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="toggleVisibleUser(index)"
                    />
                    <v-btn
                      v-else
                      color="grey"
                      icon="mdi-eye-off"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="toggleVisibleUser(index)"
                    />
                    <v-btn
                      :color="allUserLayers[index].openSub ? 'blue': 'black'"
                      icon="mdi-cog"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      :active="allUserLayers[index].openSub"
                      @click="toggleSubUser(index)"
                    />
                    <v-btn
                      color="#1976D3"
                      icon="mdi-pencil"
                      variant="outlined"
                      density="comfortable"
                      class="ml-1"
                      @click="openEditUser(index)"
                    />
                  </template>
                </v-list-item>
                <div v-if="allUserLayers[index].openSub" class="sub-item">
                  <v-row class="justify-space-between">
                    <v-col lg="12" class="pb-0">
                      <span class="fs-16" :class="bLayer.visible ? '':'text-grey'">Opacité de la couche : <b>{{ Math.round(bLayer.opacity) }}%</b></span>
                      <v-slider
                        v-model="bLayer.opacity"
                        class="layers-slider"
                        :color="bLayer.visible ? 'blue':'grey'"
                        track-color="grey"
                        min="0"
                        max="100"
                        :step="1"
                        @update:modelValue="changeOpacityUser(index)"
                      >
                        <template #prepend>
                          <span :class="bLayer.visible ? '':'text-grey'">0%</span>
                        </template>
                        <template #append>
                          <span :class="bLayer.visible ? '':'text-grey'">100%</span>
                        </template>
                      </v-slider>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </v-list>
      </v-card-text>
      <ImportLayerDialog
        v-model="importLayerDialog"
        :user-layer="editedUserLayer"
        @onLayerImported="addUserLayer"
        @onLayerUpdated="updateUserLayer"
        @onLayerDeleted="removeUserLayer"
      />
    </v-card>
  </v-slide-x-transition>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ImportLayerDialog from './ImportLayerDialog.vue'

export default {
  name: 'AsideComp',
  components: {
    ImportLayerDialog,
  },
  data() {
    return {
      allBaseLayers: [],
      allCustomLayers: [],
      allUserLayers: [],
      importLayerDialog: false,
      // User layer edited in the dialog (null: import)
      editedUserLayer: null,
      // Opened sections of the menu
      openSections: {
        base: false,
        custom: true,
        user: true,
      },
    }
  },
  computed: {
    ...mapGetters({
      getAsideStatus: 'aside/getAsideStatus',
      getBaseLayers: 'map/getBaseLayers',
      getIsFullscreen: 'map/getIsFullscreen',
    }),
    asideStatus() {
      return this.getAsideStatus
    },
    iTownsBaseLayers() {
      return this.getBaseLayers
    },
    isFullscreen() {
      return this.getIsFullscreen
    }
  },
  watch: {
    iTownsBaseLayers() {
      // DEBUG
      // console.log('trigger update baseLayers')
      
      if(!this.allBaseLayers.length) {
        this.computeBaseLayers()
        this.computeCustomLayers()
      }
    }
  },
  created() {
    // Full definitions of user layers (GeoJSON, files...) by id: not in data, to keep them out of Vue reactivity
    this.userLayerDefs = {}
  },
  mounted() {
    this.computeBaseLayers()
    this.computeCustomLayers()
  },
  methods: {
    ...mapActions({
      setAsideStatus: 'aside/setAsideStatus',
    }),
    computeBaseLayers() {
      if (this.iTownsBaseLayers.length) {
        let tempBaseLayers = []
        // Technical layers and layers listed in additional data (see computeCustomLayers)
        const excludedLayerIds = ['globe', 'atmosphere', 'IGN_MNT', 'IGN_MNT_HIGHRES', 'MNT_WORLD_SRTM3', 'IGN_Buildings', 'IGN_Buildings_Flat', 'Calque_Planta', 'Calque_Planta_2025', 'Bruit', 'Vegestrate', 'lcz_color', 'Villeurbanne_Arbres']
        this.iTownsBaseLayers.forEach(bLayer => {
          if (!excludedLayerIds.includes(bLayer.id)) {
            let newSubtitle = 'Fond de plan'
            if (bLayer.id === 'Lyon_Districts') {
              newSubtitle = 'Métropole de Lyon'
            }
            if (bLayer.id === 'Monochrome_Black') {
              newSubtitle = 'Jean-Marc Viglino'
            }
            // Add layers
            let newLayer = {
              id: bLayer.id,
              name: bLayer.name,
              icon: 'mdi-map',
              subtitle: newSubtitle,
              openSub: false,
              visible: bLayer.visible,
              opacity: bLayer.opacity * 100,
            }
            tempBaseLayers.push(newLayer)
          }
        });
        this.allBaseLayers = tempBaseLayers
      }
    },
    computeCustomLayers() {
      let tempBaseLayers = []
      // Add layers
      let newLayerBuildings = {
        id: 'IGN_Buildings',
        name: 'Bâtiments IGN',
        icon: 'mdi-office-building',
        subtitle: 'BD Topo - Juin 2023',
        openSub: false,
        visible: true,
        opacity: 1 * 100,
        extruded: true,
      }
      tempBaseLayers.push(newLayerBuildings)

      let newLayerBruit = {
        id: 'Bruit',
        name: 'Bruit routier LDEN',
        icon: 'mdi-home-sound-in',
        subtitle: 'Métropole de Lyon - 2022',
        openSub: false,
        visible: false,
        opacity: 1 * 100,
      }
      tempBaseLayers.push(newLayerBruit)

      let newLayerCalque = {
        id: 'Calque_Planta',
        name: 'Calque de plantabilité',
        icon: 'mdi-forest',
        subtitle: 'Métropole de Lyon - 2022',
        openSub: false,
        visible: false,
        opacity: 1 * 100,
      }
      tempBaseLayers.push(newLayerCalque)

      let newLayerCalque2025 = {
        id: 'Calque_Planta_2025',
        name: 'Calque de plantabilité',
        icon: 'mdi-forest',
        subtitle: 'Métropole de Lyon - 2025',
        openSub: false,
        visible: false,
        opacity: 1 * 100,
      }
      tempBaseLayers.push(newLayerCalque2025)

      let newLayerVegestrate = {
        id: 'Vegestrate',
        name: 'Végéstrate',
        icon: 'mdi-tree',
        subtitle: 'IArbre - 2023',
        openSub: false,
        visible: false,
        opacity: 1 * 100,
      }
      tempBaseLayers.push(newLayerVegestrate)

      let newLayerLcz = {
        id: 'lcz_color',
        name: 'Zones Climatiques Locales',
        icon: 'mdi-thermometer',
        subtitle: 'IArbre - CEREMA - 2022',
        openSub: false,
        visible: false,
        opacity: 1 * 100,
      }
      tempBaseLayers.push(newLayerLcz)

      let newLayerVilleurbanneArbres = {
        id: 'Villeurbanne_Arbres',
        name: '3 Villeurbanne',
        icon: 'mdi-home-city',
        subtitle: 'Bâtiments - nb arbres visibles',
        openSub: false,
        visible: false,
        opacity: 1 * 100,
      }
      tempBaseLayers.push(newLayerVilleurbanneArbres)

      // Final set in data
      this.allCustomLayers = tempBaseLayers
    },
    toggleSection(section) {
      this.openSections[section] = !this.openSections[section]
    },
    closeAside() {
      this.setAsideStatus(false)
    },
    toggleSub(index) {
      // Toggle sub menu
      this.allBaseLayers[index].openSub = !this.allBaseLayers[index].openSub
    },
    toggleVisible(index) {
      // Toggle button
      this.allBaseLayers[index].visible = !this.allBaseLayers[index].visible
      // Emit Event to ItownsViewer
      this.$evtBus.emit('onToggleLayerVisibility', this.allBaseLayers[index].id)
    },
    changeOpacity(index) {
      // Emit Event to ItownsViewer
      let newLayerOpacity = {
        id: this.allBaseLayers[index].id,
        opacity: this.allBaseLayers[index].opacity
      }
      this.$evtBus.emit('onChangeLayerOpacity', newLayerOpacity)
    },
    toggleSubCustom(index) {
      // Toggle sub menu
      this.allCustomLayers[index].openSub = !this.allCustomLayers[index].openSub
    },
    toggleVisibleCustom(index) {
      // Toggle button
      this.allCustomLayers[index].visible = !this.allCustomLayers[index].visible
      // Emit Event to OL
      this.$evtBus.emit('onToggleLayerVisibility', this.allCustomLayers[index].id)
    },
    changeOpacityCustom(index) {
      // Emit Event to OL
      let newLayerOpacity = {
        id: this.allCustomLayers[index].id,
        opacity: this.allCustomLayers[index].opacity
      }
      this.$evtBus.emit('onChangeLayerOpacity', newLayerOpacity)
    },
    openImportUser() {
      this.editedUserLayer = null
      this.importLayerDialog = true
    },
    openEditUser(index) {
      this.editedUserLayer = this.userLayerDefs[this.allUserLayers[index].id]
      this.importLayerDialog = true
    },
    addUserLayer(userLayer) {
      this.userLayerDefs[userLayer.id] = userLayer
      // Add in list (only display infos: the GeoJSON stays out of Vue reactivity)
      this.allUserLayers.push({
        id: userLayer.id,
        name: userLayer.name,
        icon: 'mdi-file-upload',
        subtitle: userLayer.geojsonFile.name,
        openSub: false,
        visible: true,
        opacity: 1 * 100,
      })
      // Emit Event to ItownsViewer & OL (layer is visible when added)
      this.$evtBus.emit('onAddUserLayer', userLayer)
    },
    updateUserLayer(userLayer) {
      this.userLayerDefs[userLayer.id] = userLayer
      // Update list (visibility & opacity are kept)
      const layerItem = this.allUserLayers.find(l => l.id === userLayer.id)
      layerItem.name = userLayer.name
      layerItem.subtitle = userLayer.geojsonFile.name
      // Emit Event to ItownsViewer & OL (layer is replaced, at the same place)
      this.$evtBus.emit('onUpdateUserLayer', {
        userLayer,
        visible: layerItem.visible,
        opacity: layerItem.opacity / 100,
      })
    },
    removeUserLayer(layerId) {
      delete this.userLayerDefs[layerId]
      this.allUserLayers = this.allUserLayers.filter(l => l.id !== layerId)
      // Emit Event to ItownsViewer & OL
      this.$evtBus.emit('onRemoveUserLayer', layerId)
    },
    toggleSubUser(index) {
      // Toggle sub menu
      this.allUserLayers[index].openSub = !this.allUserLayers[index].openSub
    },
    toggleVisibleUser(index) {
      // Toggle button
      this.allUserLayers[index].visible = !this.allUserLayers[index].visible
      // Emit Event to ItownsViewer & OL
      this.$evtBus.emit('onToggleLayerVisibility', this.allUserLayers[index].id)
    },
    changeOpacityUser(index) {
      // Emit Event to ItownsViewer & OL
      let newLayerOpacity = {
        id: this.allUserLayers[index].id,
        opacity: this.allUserLayers[index].opacity
      }
      this.$evtBus.emit('onChangeLayerOpacity', newLayerOpacity)
    },
    toggleBuildingsExtrusion(index) {
      // Emit Event to ItownsViewer (style only, visibility is unchanged)
      this.$evtBus.emit('onToggleBuildingsExtrusion', this.allCustomLayers[index].extruded)
    }
  }
}
</script>

<style lang="scss">
#aside-card {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  border-radius: 0;
  z-index: 10;

  .aside-card-title {
    background: #1976D3; 
    color: white;
  }

  .layer-card-text {
    overflow-y: auto;
    height: calc(100% - 56px);
  }
}
.close-icon {
  font-size: 25px;
}
.layers-list {
  .layers-list-item {
    border-bottom: 1px solid #e4e4e4;
  }
  .v-list-group__items {
    --indent-padding: 0px !important;
  }
}
.layers-list-item {
  padding-left: 16px !important;
}
.subgroup-list {
  border-bottom: 1px solid #e4e4e4 !important;
}
.subgroup-title {
  font-weight: bold;
  color: #194275;
}
.subgroup-title-text {
  display: flex;
  align-items: center;
  height: 47px;
  padding-left: 10px;
  font-size: 1.2em;
  font-weight: bold;
  color: #194275;
  border-bottom: 1px solid #e4e4e4;
}
// Section titles open / close their section
.section-toggle {
  cursor: pointer;
  user-select: none;
}
.sub-item {
  width: 98%;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e4e4e4;
}
.layers-slider {
  padding-top: 10px;
}
// Vuetify labels are greyed by default (medium emphasis opacity)
.layers-checkbox .v-label {
  opacity: 1;
}
.layers-info-btn {
  margin-top: 20px;
}

// Generic
.fs-16 {
  font-size: 16px;
}

// Override Vuetify : Fix CSS...
.v-slider.v-input--horizontal .v-slider-thumb__label {
  left: calc(var(--v-slider-thumb-size) * -0.9)
}
.v-list-item__append>.v-icon, .v-list-item__prepend>.v-icon {
  --v-medium-emphasis-opacity: 1;
}
.v-list-item__prepend>.v-icon {
  margin-inline-end: 16px !important;
}
</style>