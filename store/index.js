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
		],

		cardList: [], // 绑定的健康卡

		// 用于hosCardSel组件中选择医院（放在vuex主要是不想每次在医院列表选择后每个使用HosCardSel组件的页面都得处理返回结果，降低耦合）
		selHosInHosCardSel: {
			allType: undefined, // 所有医院
			mzjfType: undefined, // 门诊缴费类型的医院
			mzczType: undefined, // 门诊充值类型的医院
			zyczType: undefined // 住院充值类型的医院
		}
	},

	mutations: {
		/**
		 * 更新未阅读消息数（动态tab显示数量）
		 * @param {Object} state
		 * @param {Int} unreadMsgNum 未阅读消息数
		 */
		setUnreadMsgNum(state, unreadMsgNum) {
			state.vuex_tabbar[1].badge = unreadMsgNum;
		},

		/** 设置健康卡 */
		setCardList(state, cardList) {
			state.cardList = cardList;
		},

		/**
		 * 设置选中的医院，由于不能传递多个参数，所以改为对象的形式
		 * @param {Object} state 
		 * @param {Object} hosObj  医院包装对象，包含医院类型type,以及医院对象
		 */
		setSelHos(state, hosObj = { type: '', hospital: {} }) {
			switch (hosObj.type) {
				case 'mzjf':
					state.selHosInHosCardSel.mzjfType = hosObj.hospital;
					break

				case 'zycz':
					state.selHosInHosCardSel.zyczType = hosObj.hospital;
					break

				default:
					state.selHosInHosCardSel.allType = hosObj.hospital;
					break
			}
		}

	}
})
