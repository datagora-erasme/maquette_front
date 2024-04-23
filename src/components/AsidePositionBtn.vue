<template>
  <!-- TODO: v-if="isFullscreen" -->
  <v-btn
    id="position-btn"
    :class="asidePosStatus ? 'aside-open': ''"
    :color="isFullscreen ? '#263238': ''"
    :theme="isFullscreen ? 'dark':''"
    @click="toggleAsidePos()"
  >
    <v-icon class="position-icon" icon="mdi-map-marker-radius" />
  </v-btn>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AsidePosBtn',
  computed: {
    ...mapGetters({
      getAsidePosStatus: 'aside/getAsidePosStatus',
      getIsFullscreen: 'map/getIsFullscreen',
    }),
    asidePosStatus() {
      return this.getAsidePosStatus
    },
    isFullscreen() {
      return this.getIsFullscreen
    }
  },
  methods: {
    ...mapActions({
      setAsidePosStatus: 'aside/setAsidePosStatus'
    }),
    toggleAsidePos() {
      this.setAsidePosStatus(!this.asidePosStatus)
    }
  }
}
</script>

<style lang="scss">
#position-btn {
  position: absolute;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  top: 116px;
  right: 0;
  width: 50px;
  height: 50px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px 0 0 10px;
  z-index: 4;
  transition: all 0.1s ease-out;

  &.aside-open {
    margin-right: 400px;
  }

  .position-icon {
    font-size: 26px;
  }
}
</style>