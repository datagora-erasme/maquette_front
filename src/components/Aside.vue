<template>
  <v-slide-x-transition>
    <v-card v-show="asideStatus" id="aside-card">
      <v-card-title style="background: #1976D3; color: white">
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
                  {{ title }}
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
                />
              </template>
            </v-list-item>
            <div v-if="allBaseLayers[index].openSub" class="sub-item">
              <v-row class="justify-space-between">
                <v-col lg="12" class="pb-0">
                  Opacité de la couche :
                  <v-slider
                    v-model="bLayer.opacity"
                    class="layers-slider"
                    color="blue"
                    track-color="grey"
                    min="0"
                    max="100"
                    :step="1"
                    thumb-label="always"
                  >
                    <template #prepend>
                      0%
                    </template>
                    <template #append>
                      100%
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
          <v-list-item
            v-for="(customLayer, index) in exampleData"
            :key="customLayer.id"
            :title="customLayer.name"
            :subtitle="customLayer.subtitle"
            :prepend-icon="customLayer.icon"
            class="layers-list-item"
          >
            <template #prepend="{prepend}">
              <v-icon :color="exampleData[index].visible ? 'black' : 'grey'" :icon="prepend" />
            </template>
            <template #title="{title}">
              <div class="d-flex align-left">
                {{ title }}
              </div>
            </template>
            <template #subtitle="{subtitle}">
              <div class="d-flex align-left">
                {{ subtitle }}
              </div>
            </template>
            <template #append>
              <v-btn
                v-if="customLayer.visible"
                color="green-darken-4"
                icon="mdi-eye"
                variant="text"
                disabled
                @click="toggleVisible(index)"
              />
              <v-btn
                v-else
                color="grey"
                icon="mdi-eye-off"
                variant="text"
                disabled
                @click="toggleVisible(index)"
              />
              <v-btn
                color="black"
                icon="mdi-cog"
                variant="text"
                disabled
              />
            </template>
          </v-list-item>
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
      exampleData: [
        {
          id: 'RéseauRoutier',
          name: 'Réseau routier',
          icon: 'mdi-road',
          subtitle: '2020',
          append: 'mdi-eye-off',
          visible: false,
        },
        {
          id: 'LignesMétro',
          name: 'Lignes de métro',
          icon: 'mdi-train',
          subtitle: '2020',
          append: 'mdi-eye-off',
          visible: false,
        },
        {
          id: 'Arbres',
          name: 'Arbres',
          icon: 'mdi-tree',
          subtitle: '2020',
          append: 'mdi-eye-off',
          visible: false,
        },
      ]
    }
  },
  computed: {
    ...mapGetters({
      getAsideStatus: 'aside/getAsideStatus',
      getBaseLayers: 'map/getBaseLayers'
    }),
    asideStatus() {
      return this.getAsideStatus
    },
    iTownsBaseLayers() {
      return this.getBaseLayers
    },
  },
  watch: {
    iTownsBaseLayers() {
      // TEMP DEBUG
      console.log('trigger update baseLayers')
      if(!this.allBaseLayers.length) {
        this.computeBaseLayers()
      }
    }
  },
  mounted() {
    this.computeBaseLayers()
  },
  methods: {
    ...mapActions({
      setAsideStatus: 'aside/setAsideStatus',
    }),
    computeBaseLayers() {
      if (this.iTownsBaseLayers.length) {
        let tempBaseLayers = []
        this.iTownsBaseLayers.forEach(bLayer => {
          if (bLayer.id !== 'globe' && bLayer.id !== 'atmosphere') {
            let newSubtitle = 'Fond de plan'
            if (bLayer.id === 'IGN_Buildings') {
              newSubtitle = 'BD Topo Juin 2023'
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
    closeAside() {
      this.setAsideStatus(false)
    },
    toggleSub(index) {
      console.log('click toggle openSub')
      // TODO: Refermer autres panels ??
      this.allBaseLayers[index].openSub = !this.allBaseLayers[index].openSub
    },
    toggleVisible(index) {
      console.log('click toggle visible')
      this.allBaseLayers[index].visible = !this.allBaseLayers[index].visible
      // TODO: Emit Event and get in ItownsViewer ??
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

  .layer-card-text {
    overflow-y: auto;
    height: calc(100% - 56px);
  }
}
.close-icon {
  font-size: 25px;
}

.v-list-item__append>.v-icon, .v-list-item__prepend>.v-icon {
  --v-medium-emphasis-opacity: 1;
}
.layers-list {
  // border-bottom: 1px solid #e4e4e4 !important;

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
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e4e4e4;
}

.v-slider.v-input--horizontal .v-slider-thumb__label {
  left: calc(var(--v-slider-thumb-size) * -0.9)
}

.layers-slider {
  padding-top: 30px;
}
.layers-info-btn {
  margin-top: 20px;
}
</style>