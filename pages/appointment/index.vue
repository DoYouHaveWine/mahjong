<template>
	<view>
		<view class="bg-header">
			<u-navbar bgColor="transparent" :placeholder="true"><text slot="left"></text></u-navbar>
			<view class="header plr-20">
				<view class="weather-box">
					<view>
						<view v-if="weatherInfo.city">
							<view>
								<text v-text="weatherInfo.city" />
								<text class="plr-10">|</text>
								<text v-text="weatherInfo.weather" />
							</view>
							<view class="centigrade" v-text="weatherInfo.temperature + '℃'" />
						</view>
					</view>
					<view class=""><image src="../../static/health/ic_left_top.svg" style="width: 224rpx; height:154rpx;" /></view>
				</view>
			</view>
		</view>
		<view class="banner plr-20">
			<image src="/static/index/ic_banner.png" style="width: 100%;height: 100%;border-radius: 5px;"></image>
		</view>

		<view class="main-content">
			<!-- 健康管理 -->
			<view class="category-title">
				<view class="fb title f-16">健康管理</view>
				<view class="c-99 f-12" @click="navTo('/pagesA/healthManage/index')">更多</view>
			</view>
			<view class="flex-box">
				<view class="item" v-for="(item, index) in list1" :key="index" @click="navTo(item.url)">
					<image :src="item.src" />
					<view class="mt5 c-33 f-14">{{ item.name }}</view>
				</view>
			</view>

			<!-- 健康数据 -->
			<view class="category-title">
				<view class="fb title f-16">健康数据</view>
				<view class="c-99 f-12" @click="navTo('/pagesA/healthManage/healthData', true, true)">更多</view>
			</view>
			<view class="flex-box">
				<view class="item" v-for="(item, index) in list2" :key="index" @click="navTo(item.url)">
					<image :src="item.src" />
					<view class="mt5 c-33 f-14">{{ item.name }}</view>
				</view>
			</view>

			<!-- 健康工具 -->
			<view class="category-title">
				<view class="fb title f-16">健康工具</view>
				<!-- <view class="c-99 f-12">更多</view> -->
			</view>
			<view class="flex-box">
				<view
					v-if="!item.hidden"
					class="item"
					v-for="(item, index) in list3"
					:key="index"
					:class="{ 'dev-func-style': item.dev }"
					@click="navTo(item.url, true, true, item.dev)"
				>
					<image :src="item.src" />
					<view class="mt5 c-33 f-14">{{ item.name }}</view>
				</view>
			</view>
		</view>

		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
import { refreshCardList } from '@/common/http/api.js';
import { getVertionType } from '@/common/utils/commonUtil.js';
export default {
	data() {
		return {
			weatherInfo: {},
			list1: [
				{
					name: '高血压',
					src: '/static/health/ic_gxy.svg',
					url: '/pagesA/healthManage/index?tabIndex=0'
				},
				{
					name: '糖尿病',
					src: '/static/health/ic_tnb.svg',
					url: '/pagesA/healthManage/index?tabIndex=1'
				},
				{
					name: '冠心病',
					src: '/static/health/ic_gxb.svg',
					url: '/pagesA/healthManage/index?tabIndex=2'
				},
				{
					name: '慢阻肺',
					src: '/static/health/ic_mzf.svg',
					url: '/pagesA/healthManage/index?tabIndex=3'
				}
			],
			list2: [
				{
					name: '血压',
					src: '/static/health/ic_xy.svg',
					url: '/pagesA/healthManage/gxy/manage'
				},
				{
					name: '血糖',
					src: '/static/health/ic_xt.svg',
					url: '/pagesA/healthManage/bloodSuger/manage'
				},
				{
					name: '体重',
					src: '/static/health/ic_tz.svg',
					url: '/pagesA/healthManage/weight/manage'
				},
				{
					name: '心率',
					src: '/static/health/ic_xl.svg',
					url: '/pagesA/healthManage/rate/manage',
					needToken: true,
					needCard: true
				}
			],
			list3: [
				// {
				// 	name: '健康问答',
				// 	src: '/static/health/ic_jkwd.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	name: '医学百科',
				// 	src: '/static/health/ic_yxbk.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				{
					name: '用药提醒',
					src: '/static/health/ic_yytx.svg',
					url: '/pagesA/healthManage/drug/remind',
					needToken: true,
					needCard: true
				},
				// {
				// 	name: '监测提醒',
				// 	src: '/static/health/ic_jctx.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			]
		};
	},

	computed: {
		tabbarList() {
			return this.$store.state.vuex_tabbar;
		},

		cardList() {
			return this.$store.state.cardList;
		}
	},

	onShow() {
		if (uni.getStorageSync('token')) {
			refreshCardList();
		}
		this.getWeather();
	},

	methods: {
		/**
		 * 页面跳转
		 * @param {String} url 跳转URL
		 * @param {Bool} needToken 是否需要检查登录（获取token）
		 * @param {Bool} needCard 是否需要健康卡
		 */
		async navTo(url, needToken = true, needCard = true, dev) {
			if (dev) {
				// 建设中。。。
				this.$devFuncClick();
				return;
			}
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

			uni.navigateTo({ url });
		},

		/** 检查是否绑定电子健康卡,并做未绑卡提示 */
		checkBindCard() {
			if (this.cardList.length === 0) {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					success: res => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pagesA/card/list' });
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
		navToAuth(fromPage = 'health') {
			// #ifdef MP-WEIXIN
			uni.reLaunch({ url: `/pagesA/auth/auth?fromPage=${fromPage}` });
			// #endif
			
			// #ifndef MP-WEIXIN
			uni.reLaunch({ url: `/pagesA/login/login?fromPage=${fromPage}` });
			// #endif
		},

		getWeather() {
			uni.request({
				url: 'https://restapi.amap.com/v3/weather/weatherInfo',
				method: 'GET',
				data: {
					key: '508a2ae0ca620fdcbe9c99a3fa58b312',
					city: '130600',
					extensions: 'base',
					output: 'JSON'
				},
				success: res => {
					this.weatherInfo = res.data.lives[0];
				},
				fail(err) {
					console.log(err);
				}
			});
		}
	}
};
</script>

<style lang="scss">
page {
	.bg-header {
		position: relative;
		overflow: hidden;
		&::after {
			width: 140%;
			height: 100%;
			position: absolute;
			left: -20%;
			top: 0;
			z-index: -1;
			content: '';
			border-radius: 0 0 50% 50%;
			background: linear-gradient(180deg, #66acff 0%, #3683ff 99.99%, #4298ff 100%);
		}
	}

	.header {
		height: 340rpx;
		color: #fff;
		overflow: hidden;

		.weather-box {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.centigrade {
				font-size: 40rpx;
			}
		}

		.tip-box {
			height: 100rpx;
			border-radius: 20rpx;
			background: rgba(0, 0, 0, 0.1);
			display: flex;
			box-sizing: border-box;

			.tip-items {
				flex: 1;
				display: flex;
				align-items: center;

				image {
					width: 60rpx;
					height: 60rpx;
				}

				.item-index {
					color: #e2e2e2;
					font-family: PingFang SC;
					font-size: 20rpx;
				}
			}
		}
	}

	.banner {
		position: relative;
		top: -160rpx;
		height: 240rpx;
		border-radius: 5px;
		overflow: hidden;
	}

	.main-content {
		position: relative;
		top: -160rpx;

		.category-title {
			padding: 20rpx 40rpx;
			display: flex;
			justify-content: space-between;

			.title {
				position: relative;

				&::after {
					width: 50%;
					height: 16rpx;
					opacity: 0.2;
					content: '';
					border-radius: 30rpx;
					background: #4298ff;
					position: absolute;
					bottom: -5rpx;
					left: 0;
				}
			}
		}

		.flex-box {
			display: flex;
			width: 100%;
			flex-flow: wrap;

			.item {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 25%;
				padding: 20rpx;
				box-sizing: border-box;
				text-align: center;

				image {
					width: 70rpx;
					height: 70rpx;
				}
			}
		}
	}
}
</style>
