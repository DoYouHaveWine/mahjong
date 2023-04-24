<template>
	<view class="page">
		<!-- 门店信息 -->
		<view class="header-box ptb-10"></view>
		<!-- content -->
		<view class="content ptb-10 plr-10">
			<view class="flex-box align-center bg-white plr-10 ptb-10 border-box todo-box">
				<image src="../../static/index/bg_room.png" style="width: 204rpx;height: 232rpx;"></image>
				<view class="flex-item plr-10">
					<view class="just-between align-center">
						<view class="fb flex-box align-center">
							<text>113</text>
							<text class="plr-5">大包</text>
							<!-- <view>
								<u-icon name="arrow-right" color="#999999" size="18"></u-icon>
							</view> -->
						</view>
						<view>
							<text class="tip-doing">使用中</text>
						</view>
					</view>
					<view class="just-between align-center mt10">
						<view class="fb f-14">预约须知:</view>
						<navigator url="../../pagesA/help/index.vue">
							<view class="f-14 c-58AA6C fb">使用教程></view>
						</navigator>
					</view>
					<view class="mt10 f-12 c-66">预定下单后，在预约开始时间前后半 小时可以进入门店自助开门，预约时 间到期前可以自助进行续单，请提前 规划好预约时间段。</view>
				</view>
			</view>
			<!-- card -->
			<view class="card-box bg-white mt10">
				
			</view>
			<!-- todo -->
			<view class="order-box border-box bg-white plr-10 ptb-10 mt10">
				<view class="just-between align-center dashed f-16 fb ptb-10">
					<view class="c-33">订单总价</view>
					<view style="color: #E57F70 ;">￥100</view>
				</view>
				<view class="just-between align-center f-14 mt10">
					<view class="c-66">预约时长</view>
					<view class="c-33">5小时</view>
				</view>
				<view class="just-between align-center mt10">
					<view class="c-66">包厢单价</view>
					<view class="c-33">20元/小时</view>
				</view>
				<view class="just-between align-center dashed ptb-10">
					<view class="c-66">会员特价</view>
					<view class="c-33">20元/小时</view>
				</view>
				<view class="just-between align-center cash mt10">
					<view class="flex-box align-center">
						<image src="../../static/appointment/ic_appointment_thq.svg"></image>
						<text class="plr-10 c-66">团购券</text>
					</view>
					<view class="c-58AA6C">暂无可用优惠券</view>
				</view>
				<view class="just-between align-center cash mt10">
					<view class="flex-box align-center">
						<image src="../../static/appointment/ic_appointment_yhq.svg"></image>
						<text class="plr-10 c-66">优惠券</text>
					</view>
					<view class="c-58AA6C">暂无可用优惠券</view>
				</view>
				<view class="just-between align-center cash mt10">
					<view class="flex-box align-center">
						<image src="../../static/appointment/ic_appointment_zhye.svg"></image>
						<text class="plr-10 c-66">账户余额</text>
					</view>
					<view style="color: #E57F70;">余额不足,请充值</view>
				</view>
			</view>
		</view>
		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
	import {
		refreshCardList,
		getUnreadMsgNum,
		getInfoArticlePage,
		getAppUpdate
	} from '@/common/http/api.js';
	export default {
		data() {
			return {
				popShow: false,

				searchKey: '',
				unreadMsgNum: '',
				funcList: [{
						text: '开门',
						src: '/static/index/ic_index_km.svg',
						url: '',
						hidden: false // 是否隐藏
					},
					{
						text: '续单',
						src: '/static/index/ic_index_xd.svg',
						url: ''
					},
					{
						text: '美团验券',
						src: '/static/index/ic_index_mtyq.svg',
						type: 1,
						url: ''
					},
					{
						text: '抖音验券',
						src: '/static/index/ic_index_dyyq.svg',
						type: 1,
						url: ''
					}
				]
			};
		},

		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			}
		},

		onLoad(options) {

		},
		onShow() {

		},

		methods: {
			open() {
				this.popShow = true
			},
			close() {
				this.popShow = false
			},
			/**
			 * 页面跳转
			 * @param {String} url 跳转URL
			 * @param {Bool} needToken 是否需要检查登录（获取token）
			 * @param {Bool} needCard 是否需要健康卡
			 */
			async navTo(url, needToken = false, needCard = false) {
				if (needCard) {
					// 跳转需要先建卡时必定需要token
					needToken = true;
				}
				if (needToken && !uni.getStorageSync('token')) {
					// 需要Token但未获取Token
					this.navToAuth();
					return;
				}

				if (needCard && !this.checkBindCard()) {
					// 需要绑卡但未绑卡
					return;
				}

				uni.navigateTo({
					url
				});
			},
			/**
			 * 功能点击回调
			 *
			 * @param {Object} item 功能项
			 */
			async onFuncClick(item) {
				if (item.dev) {
					// 建设中...
					this.$devFuncClick();
					return;
				}
				if (item.url) {
					if (type == 1) {
						uni.switchTab({
							url: item.url
						});
					} else {
						uni.navigateTo({
							url: item.url
						});
					}
				} else {
					switch (item.text) {
						case '开门':
							this.popShow = true
							break;
					}
				}
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #f7f7f7;
		.header-box {
			background: linear-gradient(180deg, #58AA6C 0%, #84C794 100%);
			height: 150rpx;
		}

		.content {
			position: relative;
			top: -150rpx;
			.card-box {
				border-radius: 20rpx 20rpx 20rpx 20rpx;
				border: 4rpx solid #7BC18C;
			}

			.todo-box {
				box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(109, 75, 23, 0.1);
				border-radius: 16rpx 16rpx 16rpx 16rpx;
				.tip-doing {
					color: #D9A661;
					background: rgba(217, 166, 97, 0.12);
					border-radius: 8rpx 8rpx 8rpx 8rpx;
					opacity: 1;
					border: 1rpx solid #D9A661;
					padding: 4rpx 6rpx;
					font-size: 24rpx;
				}
			}
			.order-box{
				border-radius: 10px;
				.dashed{
					border-bottom: 1px dashed #ccc;
				}
				.cash{
					font-size: 28rpx;
					image{
						width: 44rpx;
						height: 44rpx;
					}
				}
			}
		}
	}
</style>