<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <itowns-viewer class="itowns-viewer" />
</template>

<script>
import ItownsViewer from './components/ItownsViewer.vue'

export default {
  name: 'App',
  components: {
    ItownsViewer
  },
  mounted() {
  }
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.itowns-viewer {
  height: 100vh;
  width: 100vw;
}
</style>
