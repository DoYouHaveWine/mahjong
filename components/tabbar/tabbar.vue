<template>
	<view>
		<!-- 二次封装tabbar -->
		<u-tabbar :value="currentTabVal" @change="onTabChange" :activeColor="activeColor" :inactiveColor="inactiveColor" :border="border">
			<u-tabbar-item
				v-for="(item, index) in tabList"
				:key="index"
				:text="item.text"
				:name="item.name"
				:badge="item.badge"
				:dot="item.dot"
				:badgeStyle="badgeStyle"
			>
				<!-- 自定义图标 -->
				<u-icon slot="active-icon" :color="activeColor" :name="item.activeIcon || item.icon" :size="iconSize" />
				<u-icon slot="inactive-icon" :color="inactiveColor" :name="item.icon" :size="iconSize" />
			</u-tabbar-item>
		</u-tabbar>
	</view>
</template>

<script>
import { getToken, fetchUserInfo } from '@/common/http/api.js';

export default {
	name: 'tabbar',
	props: {
		iconSize: {
			type: Number,
			default: 24
		},

		// 选中的颜色
		activeColor: {
			type: String,
			default: '#33322E'
		},
		// 未选中颜色
		inactiveColor: {
			type: String,
			default: '#666666'
		},
		// 是否显示边框色
		border: {
			type: Boolean,
			default: true
		},
		// 控制徽标的位置，对象或者字符串形式，可以设置top和right属性
		badgeStyle: {
			type: [Object, String],
			default: uni.$u.props.tabbarItem.badgeStyle
		},

		tabList: {
			type: Array,
			default() {
				return [];
			}
		}
	},

	data() {
		return {
			currentTabVal: undefined // 当前选中的tab
		};
	},

	created() {
		// 隐藏原生tabbar
		uni.hideTabBar();
		this.handleCurrentTab();
	},

	methods: {
		// 处理当前选中tab项
		handleCurrentTab() {
			this.currentTabVal = this.tabList[0].name;

			// 获取引入了u-tabbar页面的路由地址，该地址没有路径前面的"/"
			let pages = getCurrentPages();
			// 页面栈中的最后一个即为项为当前页面，route属性为页面路径
			let pageUrl = pages[pages.length - 1].route;
			this.tabList.forEach(item => {
				if (item.page.indexOf(pageUrl) != -1) {
					this.currentTabVal = item.name;
				}
			});
		},

		/** 页面切换 */
		onTabChange(name) {
			this.tabList.forEach(item => {
				if (name == item.name) {
					if (item.page) {
						uni.switchTab({ url: item.page });
					}
				}
			});
		}
	}
};
</script>
