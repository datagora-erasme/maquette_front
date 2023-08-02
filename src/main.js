import { createApp } from 'vue'
import App from './App.vue'
// Import module
// import Itowns from 'itowns'
import * as Itowns from 'itowns'
import * as THREE from 'three'
import axios from 'axios';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/dist/vuetify.min.css';
import store from './store';

// Import CSS
import '@/node_modules/itowns/examples/css/widgets.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

// Create app
const app = createApp(App)
const axiosInstance = axios.create({
  baseURL: process.env.API_URL,
});
// Use module
app.config.globalProperties.$axios = axiosInstance;
app.use(Itowns)
app.use(THREE)
app.use(vuetify)
app.use(store)
console.log(process.env) 

// Mount
app.mount('#app')
