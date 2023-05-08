<template>
	<view class="page">
		<!-- 筛选 -->
		<view class="dropdown-box">
			<dropdown :close-on-click-mask="false" ref="uDropdown">
				<dropdown-item :title="shopSelLabel" :options="shopOptions" height="800" v-model="shopSelValue"
					@change="value => checkboxGroupChange(value, 'district')" />
				<dropdown-item :title="orderSelLabel" :options="orderOptions" v-model="orderSelValue" height="800"
					@change="value => checkboxGroupChange(value, 'level')" />
				<dropdown-item :title="distanceSelLabel" :options="distanceOptions" v-model="distanceSelValue" height="800"
					@change="value => checkboxGroupChange(value, 'sortType')" />
			</dropdown>
		</view>
		<!-- content -->
		<view class="content ptb-10 plr-10">
			<view class="bg-white plr-10 ptb-10 border-box order-box">
				<view class="just-between align-center">
					<view class="fb flex-box align-center">
						<text>113</text>
						<text class="plr-5">大包</text>
					</view>
					<view>
						<text class="tip-doing">使用中</text>
					</view>
				</view>
				<view class="flex-box align-center todo-box mt10">
					<image src="../../static/index/bg_room.png" style="width: 204rpx;height: 232rpx;"></image>
					<view class="flex-item plr-10">
						<view class="flex-box align-center mt5 f-14">
							<view class="fb">预约包间:</view>
							<view class="plr-10">v11【特惠包】</view>
						</view>
						<view class="flex-box align-center mt5 f-14">
							<view class="fb">下单时间:</view>
							<view class="plr-10">2022-11-25 15:30</view>
						</view>
						<view class="flex-box align-center mt5 f-14">
							<view class="fb">开始时间:</view>
							<view class="plr-10">2022-11-25 15:30</view>
						</view>
						<view class="flex-box align-center mt5 f-14">
							<view class="fb">结束时间:</view>
							<view class="plr-10">2022-11-25 15:30</view>
						</view>
					</view>
				</view>
				<view class="just-between align-center mt10 f-14">
					<view class="c-66">预约时长:</view>
					<view class="plr-10 fb">2022-11-25 15:30</view>
				</view>
				<view class="just-between align-center mt10 f-14">
					<view class="c-66">订单总计:</view>
					<view class="plr-10 fb c-ea3131">¥25</view>
				</view>
				<view class="just-between align-center mt10 f-14">
					<view class="c-66">订单优惠:</view>
					<view class="plr-10 fb c-ea3131">¥10</view>
				</view>
				<view class="just-between align-center mt10 f-14">
					<view class="c-66">订单实付:</view>
					<view class="plr-10 fb c-ea3131">¥15</view>
				</view>
				<view class="just-between align-center mt10 f-14">
					<text></text>
					<view class="flex-box align-center">
						<view>
							<u-button customStyle="color:#58AA6C;">取消订单</u-button>
						</view>
						<veiw class="plr-10">
							<u-button customStyle="color:#58AA6C;">确认到店</u-button>
						</veiw>
						<view>
							<u-button color="linear-gradient(313deg, #58AA6C 0%, #84C794 100%)" customStyle="color:#ffffff;">查看详情</u-button>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
	import { order2 } from '@/common/http/api.js';
	import tabList from '@/components/tablist/tabList.vue';
	const defaultShopOption = {
		label: '全部门店',
		value: 0,
		code: ''
	};
	const defaultOrderOption = {
		label: '全部订单',
		value: 0,
		code: ''
	};
	export default {
		components: {
			tabList
		},
		data() {
			return {
				shopSelValue: 0, // 默认选中的Options中的value值（注意并非index）
				orderSelValue: 0,
				distanceSelValue: 1, // 默认选中的Options中的value值（注意并非index）
				// 门店筛选
				shopOptions: [defaultShopOption],
				// 订单筛选
				orderOptions: [defaultOrderOption],
				// 综合筛选（这里暂时没接数据）
				distanceOptions: [{
						label: '综合排序',
						value: 1
					},
					{
						label: '距离优先',
						value: 2
					},
					{
						label: '等级优先',
						value: 3
					}
				],
				orders: [],
				hasNext: false
			};
		},

		computed: {
			/** 选择的区域条件Label */
			shopSelLabel() {
				let label = this.shopOptions.find(it => it.value === this.shopSelValue).label;
				return label.length > 5 ? `${label.substr(0, 5)}...` : label;
			},

			distanceSelLabel() {
				return this.distanceOptions.find(it => it.value === this.distanceSelValue).label;
			},

			orderSelLabel() {
				return this.orderOptions.find(it => it.value === this.orderSelValue).label;
			},
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			}
		},

		onLoad(options) {

		},
		onShow() {
			this.queryOrder()
		},

		methods: {
			/**
			 * 筛选框点击事件
			 *
			 * @param {Object} e 点击选择的值
			 * @param {Object} category 点击的按键类型
			 */
			checkboxGroupChange(e, category) {
				// if (category == 'sortType' && this.distanceSelValue == 2 && !this.opt.lng) {
				// 	// 这里重新定位是避免选择距离排序后再开启定位又回到页面重新选择距离排序
				// 	uni.getLocation({
				// 		type: 'wgs84',
				// 		success: res => {
				// 			this.opt.lng = res.longitude;
				// 			this.opt.lat = res.latitude;
				// 			this.opt[category] = e == 0 ? '' : e;
				// 			this.getOrderList();
				// 		},
				// 		fail: () => {
				// 			uni.showModal({
				// 				title: '获取定位失败',
				// 				content: '无法获取当前定位，故不能按距离排序，请打开GPS开关!',
				// 				showCancel: false
				// 			});
				// 			this.distanceSelValue = this.opt.sortType;
				// 		}
				// 	});
				// } else {
				// 	this.opt[category] = e == 0 ? '' : e;
				// 	this.getOrderList();
				// }
			},
			async queryOrder() {
				let _this = this;
				let res = await order2({
					curPage: 1,
					status: 2
				})
				if (res.code === 200) {
					_this.orders = _this.orders.concat(res.data.entities);
					_this.hasNext = res.data.hasNext;
				}
			},
		}
	};
</script>

<style lang="scss">
	page {
		background: #f7f7f7;
		.dropdown-box {
			background-color: #fff;
		}
		.content {
			// position: relative;
			// top: -150rpx;

			.order-box {
				border-radius: 10px;

				.dashed {
					border-bottom: 1px dashed #ccc;
				}

				.cash {
					font-size: 28rpx;

					image {
						width: 44rpx;
						height: 44rpx;
					}
				}
			}
		}
	}
</style>