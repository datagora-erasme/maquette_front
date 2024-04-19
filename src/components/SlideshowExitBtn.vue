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
import { mapActions } from 'vuex'

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
      
      // Disable fullscreen in Store
      this.setIsFullscreen(false)

      this.$evtBus.emit('onRefreshMap')

      setTimeout(() => {
        // Restore display of all widget
        const widgetScale = document.getElementById('widgets-scale')
        if (widgetScale) {
          widgetScale.style.display = 'flex' // flex
        }
        const widgetNav = document.getElementById('widgets-navigation')
        if (widgetNav) {
          widgetNav.style.display = 'flex' // flex
        }
        const widgetSearch = document.getElementById('widgets-searchbar')
        if (widgetSearch) {
          widgetSearch.style.display = 'block' // block
        }
      }, 1000);

      // TODO: Show again Opened Mockup
      this.$evtBus.emit('onShowOpenedMockup')

      // TODO: Reset position ?
      this.$evtBus.emit('onResetMapLocation')

      // Refresh map
      this.$evtBus.emit('onRefreshMap')
      // this.$emit('onRefreshMap')
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