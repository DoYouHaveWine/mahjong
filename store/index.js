import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	// 这里放全局参数
	state: {
		// 自定义tabbar数据
		vuex_tabbar: [{
				name: 'index',
				activeIcon: "/static/index/ic_tab_index_sel.svg",
				icon: "/static/index/ic_tab_index.svg",
				page: '/pages/index/index',
				text: '首页',
				badge: null
			},
			{
				name: 'preferential',
				activeIcon: "/static/preferential/ic_tab_preferential_sel.svg",
				icon: "/static/preferential/ic_tab_preferential.svg",
				page: '/pages/preferential/index',
				text: '优惠中心',
				badge: null
			},
			{
				name: 'order',
				activeIcon: "/static/order/ic_tab_order_sel.svg",
				icon: "/static/order/ic_tab_order.svg",
				page: '/pages/order/index',
				text: '我的预定',
				badge: null
			},
			{
				name: 'mine',
				activeIcon: "/static/mine/ic_tab_mine_sel.svg",
				icon: "/static/mine/ic_tab_mine.svg",
				page: '/pages/mine/index',
				text: '个人中心',
				badge: null
			}
		]
	},

	mutations: {


	}
})
