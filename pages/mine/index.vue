<template>
	<view class="mine-page">
		<u-notify ref="uNotify" />
		<!-- 用户信息-->
		<view class="header border-box ptb-20 plr-20">
			<view class="flex-box align-center">
				<view>
					<image src="../../static/mine/ic_mine_head.svg" style="width: 128rpx;height: 128rpx;"></image>
				</view>
				<view class="c-white plr-10">
					<view class="f-18">微信昵称</view>
					<view class="f-14 mt5">135****5464</view>
				</view>
			</view>
		</view>
		<view class="content">
			<view class="content-box">
				<view class="plr-15">
					<view class="recharge-box plr-20 just-between align-center border-box">
						<view>
							<view class="f-12" style="color: #AE865B;">账户余额</view>
							<view class="mt5 f-20 fb" style="color: #6C3F03;">1234 <text class="f-15">元</text></view>
						</view>
						<view style="height: 60rpx;width: 152rpx;">
							<u-button shape="circle" color="linear-gradient(299deg, #BB751F 0%, #E0B14C 100%)" size="mini"
								customStyle="width: 100%;height: 100%;">立即充值</u-button>
						</view>
					</view>
					<view class="tip-box plr-10 just-between align-center border-box mt10">
						<text class="c-white f-16">特惠团购券限时抢</text>
						<view style="width: 120rpx;height: 48rpx;">
							<u-button shape="circle" color="linear-gradient(299deg, #E5C284 0%, #F8E6CD 100%)" size="mini"
								customStyle="width: 100%;height: 100%;color:#4B320D">去抢购</u-button>
						</view>
					</view>
				</view>
				<!-- 工具 -->
				<view class="commom-tools" style="margin-top: 30rpx">
					<text class="category-title">我的工具</text>
					<view class="func-grid mt10">
						<view v-if="!item.hidden" class="item" :class="{ 'dev-func-style': item.dev }"
							v-for="(item, index) in commonToolList" :key="index" @click="onFuncItemClick(item)">
							<view class="image-box">
								<image :src="item.src" />
							</view>
							<text>{{ item.text }}</text>
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
	import {
		serverUrl
	} from '@/common/http/baseRequest.js';
	import {
		getMemberDetails,
		refreshCardList,
		getDictList
	} from '@/common/http/api.js';
	import md5 from '@/common/utils/md5.js';
	import {
		getVertionType
	} from '@/common/utils/commonUtil.js';
	export default {
		data() {
			return {
				versionType: getVertionType(),
				sysUser: uni.getStorageSync('sysUser'),
				commonToolList: [{
						text: '美团验券',
						src: '/static/mine/ic_mine_mtyq.svg',
						url: '/pagesA/hospital/myDoctor',
						needCard: true
					},
					{
						text: 'WIFI连接',
						src: '/static/mine/ic_mine_wifi.svg',
						url: '',
						needCard: true,
					},
					{
						text: '全部门店',
						src: '/static/mine/ic_mine_qbmd.svg',
						url: ''
					},
					{
						text: '联系商家',
						src: '/static/mine/ic_mine_lxsj.svg',
						url: ''
					},
					{
						text: '我要加盟',
						src: '/static/mine/ic_mine_wyjm.svg',
						url: ''
					},
					{
						text: '常见问题',
						src: '/static/mine/ic_mine_cjwt.svg',
						url: ''
					}
				]
			};
		},

		filters: {
			avatarUrl(avatar) {
				if (!avatar) return;

				if (avatar.indexOf('http') != -1) {
					return avatar;
				} else {
					return serverUrl + avatar;
				}
			}
		},

		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			},

			cardList() {
				return this.$store.state.cardList;
			}
		},

		async onShow() {
			if (!uni.getStorageSync('token')) {
				this.navToAuth();
			} else {
				// 请求刷新卡列表，主要目的是防止PC端建卡，这里能相对实时刷新
				refreshCardList();
			}
		},

		onLoad() {
			if (uni.getStorageSync('token')) {
				this.getMemberDetails();
			}
		},

		methods: {
			/**
			 * 功能项点击
			 * @param {String} item 功能项
			 */
			async onFuncItemClick(item) {
				if (item.dev) {
					// 建设中...
					this.$devFuncClick();
					return;
				}

				if (!uni.getStorageSync('token')) {
					// 未授权
					this.navToAuth();
					return;
				}

				if (item.needCard && !this.checkBindCard()) {
					// 需要绑卡但未绑卡
					return;
				}

				if (item.url) {
					uni.navigateTo({
						url: item.url
					});
				} else {
					switch (item.text) {
						case '绩效考核':
							const encodeURIComponentStr = encodeURIComponent(
								`https://jiankangbaoding.cn/webapp?uuid=${md5.toMD5(this.sysUser.mobile).toUpperCase()}`
							);
							uni.navigateTo({
								url: `/pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr}`
							});
							break;

						case '联系客服':
							const phoneNumber = '03122060198';
							uni.showModal({
								title: '提示',
								content: '你确定要拨打客服电话:\n(0312) 206 0198', // 微信开发者工具不换行，真机会换行
								success: res => {
									if (res.confirm) {
										uni.makePhoneCall({
											phoneNumber: '03122060198'
										});
									}
								}
							});
							break;
						case '运营数据':
							uni.navigateTo({
								url: `/pagesA/data/index?hospitalId=${this.sysUser.hospitalId}`
							});
							break;
					}
				}
			},

			/** 检查是否绑定了电子健康卡 */
			checkBindCard() {
				if (this.cardList.length === 0) {
					uni.showModal({
						title: '提示',
						content: '请先绑定电子健康卡再进行相应操作！',
						success: res => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pagesA/card/list'
								});
							}
						}
					});
					return false;
				}
				return true;
			},

			/** 跳转到去授权的页面
			 * @param {Object} fromPage 跳到auth授权的页面来源，例如mine
			 */
			navToAuth(fromPage = 'mine') {
				// #ifdef MP-WEIXIN
				uni.reLaunch({
					url: `/pagesA/auth/auth?fromPage=${fromPage}`
				});
				// #endif

				// #ifndef MP-WEIXIN
				uni.reLaunch({
					url: `/pagesA/login/login?fromPage=${fromPage}`
				});
				// #endif
			}
		}
	};
</script>

<style lang="scss">
	.mine-page {
		overflow-x: hidden;
		background: #58AA6C;
		height: 100vh;

		.header {
			height: 300rpx;
		}

		.content {
			height: calc(100vh - 300rpx);
			background: #fff;
			border-radius: 40rpx 40rpx 0rpx 0rpx;

			.content-box {
				position: relative;
				top: -100rpx;

				.recharge-box {
					width: 100%;
					height: 160rpx;
					background: url('../../static/mine/bg_mine.png') no-repeat;
					background-size: 100% 100%;
				}

				.tip-box {
					width: 100%;
					height: 80rpx;
					background: url('../../static/mine/tips_mine.png') no-repeat;
					background-size: 100% 100%;
				}

				.commom-tools {
					margin: 28rpx 0 20rpx 0;

					.category-title {
						color: #333;
						font-family: PingFang SC;
						font-weight: 600;
						font-size: 30rpx;
						margin: 0 40rpx;
					}

					.func-grid {
						overflow: hidden;
						width: 100%;
						display: flex;
						flex-wrap: wrap;

						.item {
							display: flex;
							width: 25%;
							height: 160rpx;
							text-align: center;
							background: #fff;
							align-items: center;
							flex-direction: column;
							justify-content: center;

							image {
								width: 80rpx;
								height: 80rpx;
							}

							text {
								color: #333;
								font-family: SF Pro Display;
								font-weight: 500;
								font-size: 28rpx;
								margin-top: 12rpx;
							}
						}
					}
				}
			}
		}
	}
</style>