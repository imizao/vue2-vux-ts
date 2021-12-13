import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// import Vue from 'vue';
import Vant from 'vant';
import 'vant/lib/index.css';

Vue.use(Vant);
Vue.config.productionTip = false;

//定义全局事件监听
Vue.prototype.$globalEvent = new Vue;

// function getHostUrl(){
//    return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
// }

//可根据具体环境配置
/* if(location.href.indexOf('localhost') > -1 ){
  Vue.config.SERVER_API = 'http://kf.xxxx.cn/guangmei/api';
  Vue.config.imgBase = 'http://kf.xxxx.cn';
}else{
  Vue.config.SERVER_API = getHostUrl() +'/guangmei/api';
  Vue.config.imgBase  = getHostUrl();
} */


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
