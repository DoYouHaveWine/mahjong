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
					<view class="f-14">ID: {{userID}}</view>
					<button open-type="getPhoneNumber" @getphonenumber="getPhone" @tap="getCode" hover-class="none" class="add-begin f-14">{{cellphone?cellphone:'快速绑定'}}</button>
				</view>
			</view>
		</view>
		<view class="content">
			<view class="content-box">
				<view class="plr-15">
					<view class="recharge-box plr-20 just-between align-center border-box">
						<view>
							<view class="f-12" style="color: #AE865B;">账户余额</view>
							<view class="mt5 f-20 fb" style="color: #6C3F03;">{{totalMoney.toFixed(2)}} <text class="f-15">元</text></view>
						</view>
						<view style="height: 60rpx;width: 152rpx;">
							<u-button shape="circle" color="linear-gradient(299deg, #BB751F 0%, #E0B14C 100%)" size="mini"
								customStyle="width: 100%;height: 100%;" @click="goRecharge()">立即充值</u-button>
						</view>
					</view>
					<view class="tip-box plr-10 just-between align-center border-box mt10">
						<text class="c-white f-16">特惠团购券限时抢</text>
						<view style="width: 120rpx;height: 48rpx;">
							<u-button shape="circle" color="linear-gradient(299deg, #E5C284 0%, #F8E6CD 100%)" size="mini"
								customStyle="width: 100%;height: 100%;color:#4B320D" @click="goCoupon()">去抢购</u-button>
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
	import { wallet1, wallet2, binding } from '@/common/http/api.js';
	export default {
		data() {
			return {
				isLogin: false,
				contactorUuid: '',
				totalMoney: 0.00,
				userID: '',
				cellphone: '',
				authCode: '',
				commonToolList: [
					// {
					// 	text: '美团验券',
					// 	src: '/static/mine/ic_mine_mtyq.svg',
					// 	url: ''
					// },
					{
						id: 1,
						text: '全部门店',
						src: '/static/mine/ic_mine_qbmd.svg',
						url: '/pages/list/index'
					},
					{
						id: 2,
						text: '平台客服',
						src: '/static/mine/ic_mine_lxsj.svg',
						url: ''
					},
					{
						id: 3,
						text: 'WIFI连接',
						src: '/static/mine/ic_mine_wifi.svg',
						url: ''
					},
					{
						id: 4,
						text: '常见问题',
						src: '/static/mine/ic_mine_cjwt.svg',
						url: ''
					},
					{
						id: 5,
						text: '我要加盟',
						src: '/static/mine/ic_mine_wyjm.svg',
						url: '/pagesA/join/index'
					}
				]
			};
		},

		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			}
		},

		onShow() {
			this.contactorUuid = uni.getStorageSync('cur_mch_cuid')
			this.getWallet1()
			this.getWallet2()
		},

		onLoad() {

		},

		methods: {
			/**
			 * 功能项点击
			 * @param {String} item 功能项
			 */
			async onFuncItemClick(item) {
				if (item.url) {
					if (item.id === 1) {
						uni.removeStorageSync('cur_mch_uuid')
						uni.reLaunch({ url: '/pages/list/index' })
						return
					}
					uni.navigateTo({
						url: item.url
					});
				} else {
					switch (item.id) {
						case 2:
							uni.makePhoneCall({
								phoneNumber: getApp().globalData.qPhone
							})
							break;
					}
				}
			},
			async getWallet1() {
				let _this = this;
				//获取钱包
				let res = await wallet1()
				if (res.code === 200) {
					_this.isLogin = true
					_this.userID = res.data.uuid;
					_this.cellphone = res.data.cellphone;
				}
			},
			async getWallet2() {
				let _this = this;
				//获取钱包
				let res = await wallet2({
					contactorUuid: _this.contactorUuid
				})
				if (res.code === 200) {
					_this.totalMoney = res.data.money + res.data.integral;
				}
			},
			//授权
			getCode() {
				let _this = this;
				uni.login({
					success: (res) => {
						if (res.code) {
							_this.authCode = res.code;
						} else {
							console.log('登录失败！')
						}
					},
					fail: (res) => {
						console.log(res)
					}
				})
			},
			
			async getPhone (e) {
				let _this = this;
				if (e.detail.encryptedData && e.detail.iv) {
					let res = await binding({
						authCode: _this.authCode,
						wxEncryptData: e.detail.encryptedData,
						wxIvData: e.detail.iv
					})
					if (res.code === 200) {
						_this.cellphone = res.data.cellphone;
					}
				}
			},
			
			order() {
				if (this.isLogin) {
					uni.navigateTo({
						url: '/pages/orderlist/orderlist'
					})
				} else {
					uni.showToast({
						icon: 'none',
						duration: 1000,
						title: '请先点击登录'
					})
				}
			},
			call() {
				uni.makePhoneCall({
					phoneNumber: this.servicePhone
				})
			},
			
			goRecharge(){
				this.$linkJump({ url: '/pages/preferential/index' })
			},
			goCoupon() {
				this.$linkJump({ url: '/pages/preferential/index' })
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
	.add-begin {
		background: #58AA6C;
		color: #FFFFFF;
		/* line-height: 42upx; */
		border: 0px;
		padding-left: 0;
		padding-right: 0;
		text-align: left;
		text-decoration: underline;
		position: static;
		border: 0;
	}
	.add-begin::after {
		border: 0px;
		content: ''; 
		width: 0;
		height: 0;
		transform: scale(1);  
		display: none;  
		background: transparent;
	}
	
</style>