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
              <v-icon class="close-icon" icon="mdi-close" />
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pa-0">
        <!-- Base Layers List -->
        <v-list class="pa-0 layers-list">
          <v-list-group value="Base">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                title="Couches de base"
                class="subgroup-list"
              >
                <template #title="{title}">
                  <div class="d-flex align-left subgroup-title">
                    {{ title }}
                  </div>
                </template>
              </v-list-item>
            </template>

            <v-list-item
              v-for="bLayer in allBaseLayers"
              :key="bLayer.title"
              :title="bLayer.title"
              :subtitle="bLayer.subtitle"
              :prepend-icon="bLayer.icon"
              class="layers-list-item"
            >
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
                  color="grey-lighten-1"
                  icon="mdi-information"
                  variant="text"
                />
              </template>
            </v-list-item>
          </v-list-group>
        </v-list>
        <!-- User data layers -->
      </v-card-text>
    </v-card>
  </v-slide-x-transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AsideComp',
  data() {
    return {
      openedLayersMenu: ['Base'],
      opened: ['Base'],
      // allBaseLayers: []
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
    allBaseLayers() {
      if (this.iTownsBaseLayers.length) {
        let tempBaseLayers = []
        this.iTownsBaseLayers.forEach(bLayer => {
          if (bLayer.id !== 'globe' && bLayer.id !== 'atmosphere') {
            let newSubtitle = 'Fond de plan'
            if (bLayer.id === 'Bâtiments IGN (BD Topo Juin 2023)') {
              newSubtitle = 'Bâtiments'
            }
            // Add layers
            let newLayer = {
              title: bLayer.id,
              prependAvatar: 'mdi-map',
              icon: 'mdi-map',
              subtitle: newSubtitle,
              value: bLayer.id,
              type: 'item',
            }
            tempBaseLayers.push(newLayer)
          }
        });
        return tempBaseLayers
      } else {
        return []
      }
    }
  },
  mounted() {
  },
  methods: {
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
}

.close-icon {
  font-size: 25px;
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
</style>