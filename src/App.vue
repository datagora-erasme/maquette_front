<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div class="app-container d-flex flex-row justify-center align-center">
    <div v-if="isLoggedIn === false" class="login-page d-flex flex-column">
      <v-card class="form-container pa-7" elevation="3">
        <sign-in />
      </v-card>
    </div>
    <itowns-viewer v-if="isLoggedIn" class="itowns-viewer" />
    <notifications position="bottom right" />
  </div>
</template>

<script>
import ItownsViewer from './components/ItownsViewer.vue'
import SignIn from './components/SignIn.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    ItownsViewer,
    SignIn
  },
  computed: {
    ...mapGetters({
      isUserLoggedIn: 'authentication/getIsUserLoggedIn'
    }),
    isLoggedIn() {
      return this.isUserLoggedIn
    },
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
</style>
