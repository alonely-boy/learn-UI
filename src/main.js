import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';//忘了这个
// import "@/assets/fonts/style.css";/*引入字体样式 */
import "@/assets/fonts/iconfont.css";/*引入字体样式 */
import "@/assets/global.css"//引入全局样式
import axios from 'axios'

Vue.config.productionTip = false
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/';//网络接口
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'              //本地接口
axios.interceptors.request.use(config =>{
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //最后必须return config
  return config
})
Vue.prototype.$http = axios;
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
