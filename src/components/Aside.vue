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
          <div class="d-flex align-left subgroup-title-text">
            Couches de base
          </div>
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
        </v-list>
        <!-- Custom data layers -->
        <v-list v-if="isFullscreen" class="layers-list">
          <div class="d-flex align-left subgroup-title-text">
            Données personnalisées
          </div>

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
            </div>
          </div>
        </v-list>
        <!-- User data layers -->
        <v-list class="layers-list">
          <div class="d-flex align-left subgroup-title-text">
            Mes données
          </div>

          <!-- Placeholder -->
          <div class="d-flex align-center justify-center mt-2">
            <i>A venir...</i>
          </div>
        </v-list>
      </v-card-text>
    </v-card>
  </v-slide-x-transition>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AsideComp',
  data() {
    return {
      allBaseLayers: [],
      allCustomLayers: [],
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
        this.iTownsBaseLayers.forEach(bLayer => {
          if (bLayer.id !== 'globe' && bLayer.id !== 'atmosphere' && bLayer.id !== 'IGN_MNT' && bLayer.id !== 'IGN_MNT_HIGHRES' && bLayer.id !== 'MNT_WORLD_SRTM3') {
            let newSubtitle = 'Fond de plan'
            if (bLayer.id === 'IGN_Buildings') {
              newSubtitle = 'BD Topo - Juin 2023'
            }
            if (bLayer.id === 'Lyon_Districts') {
              newSubtitle = 'Métropole de Lyon'
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
      
      // Final set in data
      this.allCustomLayers = tempBaseLayers
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
.sub-item {
  width: 98%;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e4e4e4;
}
.layers-slider {
  padding-top: 10px;
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