import { createApp } from 'vue'
import App from './App.vue'
// Import module
import * as Itowns from 'itowns'
// TODO: Remove ?
import * as THREE from 'three'
import 'vuetify/styles';
import { axiosInstance as axios }  from './axios';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/dist/vuetify.min.css';
import store from './store';
import Notifications from '@kyvg/vue3-notification';
import eventBus from './utils/event-bus';

// ### OL ###
import 'ol/ol.css'

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
// Use module
app.use(Itowns)
app.use(THREE)
app.use(vuetify)
app.use(Notifications)
app.use(store)
app.use(eventBus)

// Create prototypes
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$eventBus = app;

// Mount
app.mount('#app')
