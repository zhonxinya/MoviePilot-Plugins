import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import Page from './components/Page.vue'

const vuetify = createVuetify({
  components,
  directives
})

const app = createApp(Page)
app.use(vuetify)
app.mount('#app')
