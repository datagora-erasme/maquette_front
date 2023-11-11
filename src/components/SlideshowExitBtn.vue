<template>
  <v-tooltip text="Sortir du mode projection">
    <template #activator="{ props }">
      <v-btn id="slideshow-exit-btn" v-bind="props" @click="endSlideShow()">
        <v-icon class="slideshow-icon" icon="mdi-close-circle" />
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AsideBtn',
  computed: {
  },
  methods: {
    ...mapActions({
      setIsFullscreen: 'map/setIsFullscreen'
    }),
    endSlideShow() {
      // Disable navigator fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }

      // Restore display of all widget
      document.getElementById('widgets-scale').style.display = 'flex' // flex
      document.getElementById('widgets-navigation').style.display = 'flex' // flex
      document.getElementById('widgets-searchbar').style.display = 'block' // block
      
      // Disable fullscreen in Store
      this.setIsFullscreen(false)

      // Show again Opened Mockup
      this.$emit('onShowOpenedMockup')

      // Refresh map
      this.$emit('onRefreshMap')
    },
  }
}
</script>

<style lang="scss">
#slideshow-exit-btn {
  position: absolute;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  top: 5px;
  right: 10px;
  min-width: 20px;
  width: 50px;
  height: 45px;
  background: #1976D3; // rgb(7, 189, 235);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding-left: 2px;
  padding-right: 2px;
  z-index: 4;
  transition: all 0.1s ease-out;

  .slideshow-icon {
    font-size: 26px;
    color: white;
  }
}
</style>