import Vue from 'vue'
import App from '@/App'
import store from '@/store/index.js'

import uView from 'uview-ui';
Vue.use(uView);

// 混入全局的变量方法
import common from '@/common/utils/commonMixin.js'
Vue.mixin(common)

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
