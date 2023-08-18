<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div class="app-container d-flex flex-row justify-center align-center">
    <div v-if="isLoggedIn === false" class="login-page d-flex flex-column">
      <v-card class="form-container pa-7" elevation="3">
        <SignIn />
      </v-card>
    </div>
    <itowns-viewer v-if="isLoggedIn" class="itowns-viewer" />
    <v-dialog v-model="localIsCSVGenerationOngoing" class="csv-loading-screen-dialog">
      <CSVLoadingScreen v-show="isCSVGenerationOngoing" />
    </v-dialog>
    <!-- <csv-loading-screen @onHidePreview="hidePreview" /> -->
    <notifications position="bottom right" />
  </div>
</template>

<script>
import ItownsViewer from './components/ItownsViewer.vue'
import SignIn from './components/SignIn.vue'
import CSVLoadingScreen from './components/CSVLoadingScreen.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    ItownsViewer,
    SignIn,
    CSVLoadingScreen
  },
  data() {
    return {
      localIsCSVGenerationOngoing: false,
    }
  },
  computed: {
    ...mapGetters({
      isUserLoggedIn: 'authentication/getIsUserLoggedIn',
      isCSVGenerationOngoing: 'map/getIsCSVGenerationOngoing',
    }),
    isLoggedIn() {
      return this.isUserLoggedIn
    },
    
  },
  watch: {
    isCSVGenerationOngoing() {
      this.localIsCSVGenerationOngoing = this.isCSVGenerationOngoing
    }
  },
  mounted() {
    this.verifySession();
  },
  methods: {
    ...mapActions({
      verifySession: 'authentication/verifySession'
    }),
  },
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

.app-container {
  width: 100vw;
  height: 100vh;
}

.login-page {
  max-width: 50vw;
  max-height: 50vh;
}

.form-container {
  min-width: 521px;
  min-height: 420px;
}

.itowns-viewer {
  height: 100vh;
  width: 100vw;
}
.csv-loading-screen-dialog {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center !important; 
}
</style>
