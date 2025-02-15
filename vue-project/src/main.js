import { createApp } from 'vue'

import App from './App.vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'



const app = createApp(App)

app.component('login', Login)
app.component('Signup', Signup)


app.mount('#app')