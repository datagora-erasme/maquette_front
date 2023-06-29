import { createApp } from 'vue'
import App from './App.vue'
// Import module
// import Itowns from 'itowns'
import * as Itowns from 'itowns'
import * as THREE from 'three'

// Import CSS
import '@/node_modules/itowns/examples/css/widgets.css'

// Create app
const app = createApp(App)

// Use module
app.use(Itowns)
app.use(THREE)

// Mount
app.mount('#app')
