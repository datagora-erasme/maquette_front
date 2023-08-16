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
      <v-card-text>
        <v-list lines="one">
          <v-list-item v-for="bLayer in baseLayers" :key="bLayer.id" :title="bLayer.id">
          <!-- {{ bLayer.id }} -->
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-slide-x-transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AsideComp',
  computed: {
    ...mapGetters({
      getAsideStatus: 'aside/getAsideStatus',
      getBaseLayers: 'map/getBaseLayers'
    }),
    asideStatus() {
      return this.getAsideStatus
    },
    baseLayers() {
      return this.getBaseLayers
    }
  },
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
</style>