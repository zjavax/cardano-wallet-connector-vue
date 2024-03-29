import { createApp } from 'vue'
import App from './App.vue'
// import CollectFromUtxoList from './components/CollectFromUtxoList.vue'
// import store from './components/store' // Import your Vuex store
import { createRouter, createWebHistory } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
// import WalletInfo from './components/WalletInfo.vue'
// import LucidTest from './components/LucidTest.vue'
// import DexHunter from './components/DexHunter.vue'

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
    // { path: '/LucidTest', component: LucidTest },
    {
      path: '/LucidTest',
      component: () => import('./components/LucidTest.vue'),
    },
    {
      path: '/CollectFromUtxoList',
      component: () => import('./components/CollectFromUtxoList.vue'),
    },

    {
      path: '/WalletInfo',
      component: () => import('./components/WalletInfo.vue'),
    },
    {
      path: '/',
      component: () => import('./components/CollectFromUtxoList.vue'),
    },
    {
      path: '/HelloWorld',
      component: () => import('./components/HelloWorld.vue'),
    },
    {
      path: '/DexHunter',
      component: () => import('./components/DexHunter.vue'),
    },
  ],
})

const app = createApp(App)
// app.use(ElementPlus);
// app.use(store)
app.use(router)
app.mount('#app')
