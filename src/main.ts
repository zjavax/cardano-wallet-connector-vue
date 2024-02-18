import { createApp } from 'vue'
import App from './App.vue'
import CollectFromUtxoList from './components/CollectFromUtxoList.vue'
import store from './components/store' // Import your Vuex store
import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

// import "~/styles/element/index.scss";

// import ElementPlus from "element-plus";
// import all element css, uncommented next line
// import "element-plus/dist/index.css";

// or use cdn, uncomment cdn link in `index.html`

import '~/styles/index.scss'
import 'uno.css'

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/CollectFromUtxoList', component: CollectFromUtxoList },
    { path: '/', component: HelloWorld },
  ],
})

const app = createApp(App)
// app.use(ElementPlus);
app.use(store)
app.use(router)
app.mount('#app')
