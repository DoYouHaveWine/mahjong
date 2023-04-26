<template>
	<view class="page">
		<!-- 门店信息 -->
		<view class="header-box ptb-10">
			<view class="func-grid">
				<view v-if="!item.hidden" class="item" :class="{ 'dev-func-style': item.dev }" v-for="(item, index) in funcList"
					:key="index" @click="onFuncClick(item)">
					<view class="image-box">
						<image :src="item.src" />
					</view>
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>
		<!-- content -->
		<view class="content ptb-10 plr-10">
			<!-- card -->
			<view class="card-box bg-white">
				<view>
					<image src="../../static/index/shop_bg.png" style="width: 100%;height: 340rpx;"></image>
				</view>
				<view class="just-between align-center plr-10 ptb-10">
					<text class="c-33 f-16">深圳-龙岗文创园店</text>
					<view style="width: 160rpx;height: 48rpx;">
						<u-button shape="circle" color="linear-gradient(299deg, #E5C284 0%, #F8E6CD 100%)" size="mini"
							customStyle="width: 100%;height: 100%;color:#4B320D">切换门店></u-button>
					</view>
				</view>
				<view class="just-between align-center plr-10 ptb-10">
					<view>
						<u--text prefixIcon="map" iconStyle="font-size: 19px;color:#cccccc" :lines="1" text="广东深圳龙岗区季华路276号文创园"
							size="12" color="#666666"></u--text>
						<view class="mt10">
							<text class="distance plr-10 ptb-5 f-12">据我372.5KM</text>
						</view>
					</view>
					<view class="flex-box align-center">
						<view class="plr-10">
							<image src="../../static/index/ic_index_dh.svg" style="width: 52rpx;height: 52rpx;" @click="goLocation"></image>
							<view class="mt5 f-12 c-66">导航</view>
						</view>
						<view>
							<image src="../../static/index/ic_index_kf.svg" style="width: 52rpx;height: 52rpx;"></image>
							<view class="mt5 f-12 c-66">客服</view>
						</view>
					</view>
				</view>
			</view>
			<!-- banner -->
			<view>
				<image src="../../static/index/banner_index.png" style="width: 100%;height: 144rpx;" mode=""></image>
			</view>
			<!-- todo -->
			<view class="todo-box bg-white plr-10 ptb-10 border-box">
				<view class="flex-box align-center">
					<image src="../../static/index/bg_room.png" style="width: 204rpx;height: 232rpx;"></image>
					<view class="flex-item plr-10">
						<view class="just-between align-center">
							<view class="fb flex-box align-center">
								<text>113</text>
								<text class="plr-5">大包</text>
								<view>
									<u-icon name="arrow-right" color="#999999" size="18"></u-icon>
								</view>
							</view>
							<view>
								<text class="tip-doing">使用中</text>
							</view>
						</view>
						<view class="tips-box mt10">
							<text>空调</text>
							<text>wifi</text>
							<text>沙发</text>
							<text>纸巾</text>
							<text>独立窗户</text>
							<text>独立洗手间</text>
						</view>
						<view class="just-between align-center mt10">
							<view>
								<view class="f-12 c-33">原价：25:00元/小时</view>
								<view>
									<text class="c-33 f-12">4小时套餐：</text>
									<text class="fb f-16" style="color: #E57F70;">68.00元</text>
								</view>
							</view>
							<view style="width: 140rpx;height: 68rpx;">
								<u-button shape="circle" size="mini" customStyle="width: 100%;height: 100%;color:#4B320D" @click="goPay">预约</u-button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 弹层 -->
		<u-popup :show="popShow" mode="center" @close="close" @open="open" bgColor="transparent">
			<view class="open-door border-box">
				<image src="../../static/index/ic_index_km.png" mode=""></image>
				<view class="ptb-20">
					<u-button shape="circle" size="large" color="linear-gradient(179deg, #90E3B1 0%, #58AA6C 100%)" customStyle="width: 100%;height: 80rpx;color:#ffffff;">开未命名</u-button>
					<u-button shape="circle" size="large" color="rgba(119,202,146,0.13)" customStyle="width: 100%;height: 80rpx;margin-top:40rpx;border: 2rpx solid #6DA772;color:#58AA6C;">开包间-房门</u-button>
				</view>
			</view>
		</u-popup>
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
						type: 4,
						url: `/pages/preferential/index`
					},
					{
						text: '抖音验券',
						src: '/static/index/ic_index_dyyq.svg',
						type: 4,
						url: `/pages/preferential/index`
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
					this.$linkJump({
						url:item.url
					})
				} else {
					switch (item.text) {
						case '开门':
							this.popShow = true
							break;
					}
				}
			},
			/** 导航 */
			goLocation(item) {
				uni.openLocation({
					latitude: item.lat,
					longitude: item.lng
				});
			},
			goPay(){
				this.$linkJump({ url: '/pagesA/appointment/index' })
			}
		}
	};
</script>

<style lang="scss">
	page {
		.header-box {
			background: linear-gradient(180deg, #58AA6C 0%, #84C794 100%);

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
					align-items: center;
					flex-direction: column;
					justify-content: center;

					image {
						width: 52rpx;
						height: 56rpx;
					}

					text {
						color: #fff;
						font-family: PingFang SC-Semibold;
						font-weight: 500;
						font-size: 28rpx;
						margin-top: 12rpx;
					}
				}
			}
		}

		.content {
			.card-box {
				box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(18, 80, 33, 0.1);
				border-radius: 16rpx 16rpx 16rpx 16rpx;

				.distance {
					border-radius: 10rpx 10rpx 10rpx 10rpx;
					border: 1px solid #6DA772;
					color: #58AA6C;
				}
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

				.tips-box {
					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: space-between;

					text {
						border-radius: 10rpx 10rpx 10rpx 10rpx;
						border: 2rpx solid #B9E0BD;
						color: #B9E0BD;
						padding: 4rpx 6rpx;
						margin-top: 10rpx;
						font-size: 24rpx;
					}
				}
			}
		}
		.open-door{
			width: 520rpx;
			height: 404rpx;
			padding: 100rpx 40rpx;
			background: linear-gradient(180deg, #D1E8E3 0%, #FFFFFF 100%);
			border-radius: 20rpx 20rpx 20rpx 20rpx;
			position: relative;
			
			image{
				width: 256rpx;
				height: 256rpx;
				position: absolute;
				top: -128rpx;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}
</style>