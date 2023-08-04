<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div class="app-container d-flex flex-row justify-center align-center">
    <div v-if="!isLoggedIn" class="login-page d-flex flex-column">
      <v-card class="form-container pa-7" elevation="3">
        <sign-in />
      </v-card>
    </div>
    <itowns-viewer v-if="isLoggedIn" class="itowns-viewer" />
  </div>
</template>

<script>
import ItownsViewer from './components/ItownsViewer.vue'
import SignIn from './components/SignIn.vue'
import { mapGetters } from 'vuex'
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export default {
  name: 'App',
  components: {
    ItownsViewer,
    SignIn
  },
  computed: {
    isLoggedIn() {
      return !!cookies.get('token') || this.$store.getters.getIsUserLoggedIn
    },
  },
  mounted() {
    console.log(this.$store)
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
  width: 40vw;
  height: 50vh;
}

.itowns-viewer {
  height: 100vh;
  width: 100vw;
}
</style>
