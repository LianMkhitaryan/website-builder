import './styles/app.scss'
import 'vue-draggable-resizable/style.css'

import { createApp } from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router).component('vue-draggable-resizable', VueDraggableResizable)
app.mount('#app')
