import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/spline-sans-mono/400.css'
import '@fontsource/spline-sans-mono/500.css'
import '@fontsource/spline-sans-mono/600.css'
import './shared/styles/main.css'
import App from './App.vue'
import { router } from './router'
import { setUnauthorizedHandler } from './shared/services/httpClient'

const app = createApp(App)

app.use(createPinia())
app.use(router)

setUnauthorizedHandler(() => {
  router.push({ name: 'login' })
})

app.mount('#app')
