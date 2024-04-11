<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div class="app-container d-flex flex-row justify-center align-center">
    <div v-if="isLoggedIn === false" class="login-page d-flex flex-column">
      <v-card v-if="!ongoingPasswordRecuperation && !ongoingPasswordModification" class="form-container pa-7" elevation="3">
        <SignIn />
      </v-card>
      <v-card v-if="ongoingPasswordRecuperation" class="form-container pa-7" elevation="3">
        <PasswordRecuperation />
      </v-card>
      <v-card v-if="ongoingPasswordModification" class="form-container pa-7" elevation="3">
        <PasswordModification />
      </v-card>
    </div>
    <!-- <itowns-viewer v-if="isLoggedIn" class="itowns-viewer" /> -->
    <OLViewer v-if="isLoggedIn" class="itowns-viewer" />
    <v-dialog v-model="localIsCSVGenerationOngoing" class="csv-loading-screen-dialog">
      <CSVLoadingScreen v-show="isCSVGenerationOngoing" />
    </v-dialog>
    <!-- <csv-loading-screen @onHidePreview="hidePreview" /> -->
    <notifications position="bottom right" />
    <Aside v-if="isLoggedIn" />
    <AsideBtn v-if="isLoggedIn" />
    <SlideshowExitBtn v-if="isFullscreen" />
    <Notifications position="bottom right" />
  </div>
</template>

<script>
import ItownsViewer from './components/ItownsViewer.vue'
import OLViewer from './components/OLViewer.vue'
import AsideBtn from './components/AsideBtn.vue'
import Aside from './components/Aside.vue'
import SlideshowExitBtn from './components/SlideshowExitBtn.vue'
import SignIn from './components/SignIn.vue'
import CSVLoadingScreen from './components/CSVLoadingScreen.vue'
import PasswordRecuperation from './components/PasswordRecuperation.vue'
import PasswordModification from './components/PasswordModification.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    // ItownsViewer,
    OLViewer,
    SignIn,
    CSVLoadingScreen,
    PasswordRecuperation,
    PasswordModification,
    AsideBtn,
    Aside,
    SlideshowExitBtn,
    SignIn
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
      ongoingPasswordRecuperation: 'authentication/getOngoingPasswordRecuperation',
      ongoingPasswordModification: 'authentication/getOngoingPasswordModification',
      getAsideStatus: 'aside/getAsideStatus',
      getIsFullscreen: 'map/getIsFullscreen'
    }),
    isLoggedIn() {
      return this.isUserLoggedIn
    },
    asideStatus() {
      return this.getAsideStatus
    },
    isFullscreen() {
      return this.getIsFullscreen
    }
  },
  watch: {
    isCSVGenerationOngoing() {
      this.localIsCSVGenerationOngoing = this.isCSVGenerationOngoing
    }
  },
  mounted() {
    if (window.location.href.includes('reset?token=') && window.location.href.split('reset?token=')[1]) {
      this.setOngoingPasswordModification(true);
    } else this.verifySession();
  },
  methods: {
    ...mapActions({
      verifySession: 'authentication/verifySession',
      setOngoingPasswordModification: 'authentication/setOngoingPasswordModification',
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

.itowns-viewer {
  height: 100vh;
  width: 100vw;
}

.login-page {
  max-width: 50vw;
  max-height: 50vh;
}

.form-container {
  min-width: 521px;
  min-height: 420px;
}
.csv-loading-screen-dialog {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center !important; 
}
</style>
