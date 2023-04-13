<template>
	<view class="page">
		<!-- 门店信息 -->
		<view class="header-box">
			
		</view>
		<!-- 功能菜单 -->
		<swiper class="func-swiper" :indicator-dots="funcPage2.length > 0" indicator-active-color="#4298ff">
			<swiper-item class="func-page">
				<view
					v-for="(item, index) in funcPage1"
					:key="index"
					class="func-item"
					:class="{ 'dev-func-style': item.dev }"
					@click="onFuncClick(item)"
				>
					<image :src="item.src" />
					<text>{{ item.text }}</text>
				</view>
			</swiper-item>
			<swiper-item class="func-page" v-if="funcPage2.length > 0">
				<view
					v-for="(item, index) in funcPage2"
					:key="index"
					class="func-item"
					:class="{ 'dev-func-style': item.dev }"
					@click="onFuncClick(item)"
				>
					<image :src="item.src" />
					<text>{{ item.text }}</text>
				</view>
			</swiper-item>
		</swiper>

		<!-- 活动轮播图 -->
		<view class="activity-swiper">
			<u-swiper
				radius="10"
				indicator
				indicatorStyle="right:20rpx;bottom:10rpx"
				imgMode="scaleToFill"
				indicatorMode="dot"
				:list="activityList"
				keyName="src"
				@click="onSwiperItemClick"
			/>
		</view>

		<!-- 健康资讯 -->
		<view class="health-info-box">
			<view class="title-item">
				<text class="title">健康资讯</text>
				<text class="more" @click="navTo('/pagesA/info/list')">更多</text>
			</view>

			<view class="health-info-list">
				<view class="item" v-for="item in healthInfoList" :key="item.id" @click="navTo(`../../pagesA/info/details?id=${item.id}`)">
					<view class="left">
						<u--image width="80" height="80" radius="10" :src="serverUrl + item.images" errorIcon="photo" />
					</view>

					<view class="right">
						<view class="title">{{ item.title || '' }}</view>
						<view class="description">{{ item.description || '' }}</view>
						<view class="create-time">{{ item.createTime || '' }}</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
import { refreshCardList, getUnreadMsgNum, getInfoArticlePage, getAppUpdate } from '@/common/http/api.js';
export default {
	data() {
		return {
			navbarBgColor: 'transparent',
			navbarTitleAlpha: 0,

			searchKey: '',
			unreadMsgNum: '',
			funcList: [
				{
					text: '预约挂号',
					src: '/static/index/ic_yygh.svg',
					url: '../../pagesA/hospital/hosList?fromPage=yygh',
					needCard: false, // 是否需要建卡之后才能操作,这里不需要建卡才能进入，在里面提交订单前判断体验更好
					dev: false, // 是否是开发中的功能
					hidden: false // 是否隐藏
				},
				{
					text: '候诊查询',
					src: '/static/index/ic_hzcx.svg',
					url: '/pagesA/hospital/waitSearch',
					needCard: true
				},
				{
					text: '门诊缴费',
					src: '/static/index/ic_zzjf.svg',
					url: '/pagesA/payment/filter?fromPage=mzjf',
					needCard: true
				},
				{
					text: '住院充值',
					src: '/static/index/ic_zycz.svg',
					url: '/pagesA/payment/filter?fromPage=zycz',
					needCard: true
				},
				{
					text: '报告查询',
					src: '/static/index/ic_bgcx.svg',
					url: '/pagesA/report/reportList',
					needCard: true
				},
				{
					text: '智能导诊',
					src: '/static/index/ic_zndz.svg',
					url: '',
					needCard: true
				},
				{
					text: '宝贝计划',
					src: '/static/index/ic_bbjh.svg',
					url: ''
				},
				{
					text: '更多服务',
					src: '/static/index/ic_gdfw.svg',
					url: '/pagesA/more/more'
				}
			],
			activityList: [
				{ src: '/static/index/ic_banner.png', url: '/pagesA/hospital/hosList?fromPage=yygh', needToken: true, needCard: true }
			],
			healthInfoList: [],
			tapTimes: 0
		};
	},

	computed: {
		tabbarList() {
			return this.$store.state.vuex_tabbar;
		},

		cardList() {
			return this.$store.state.cardList;
		},

		/** 功能滑动菜单第一页 */
		funcPage1() {
			return this.funcList.filter(it => it.hidden != true).slice(0, 8);
		},

		/** 功能滑动菜单第二页 */
		funcPage2() {
			return this.funcList.filter(it => it.hidden != true).slice(8, 16);
		}
	},

	onLoad(options) {
		console.log(options)
		if (options.q) {
			// 非要从自家小程序路过一下
			uni.showModal({
				title: '提示',
				content: '点击查看医保电子凭证！',
				// showCancel: false,
				success: res => {
					if (res.confirm) {
						this.navToCardCertificate()
					}
				}
			})
		}
		this.getHealthInfoList();

		// #ifdef APP-PLUS
		this.checkAppVersionUpdate();
		// #endif
	},

	onPageScroll(e) {
		// 根据滑动距离修改标题颜色等
		let alpha;
		if (e.scrollTop < 100) {
			alpha = 0;
		} else if (e.scrollTop < 200) {
			alpha = ((e.scrollTop - 100) / 100).toFixed(2);
		} else {
			alpha = 1;
		}
		this.navbarBgColor = `rgba(66,152,255,${alpha})`;
		this.navbarTitleAlpha = alpha;
	},

	async onShow() {
		if (uni.getStorageSync('token')) {
			let { code } = await refreshCardList();
			// 体验版与正式版的缓存会互相影响，两个版本互相切换会出现过期，
			// 两个接口都需要验证token,一个成功才请求另一个，避免出现两次授权弹窗
			if (code == 200) {
				this.getUnreadMsgNum();
			}
			this.init();
		}
	},

	methods: {
		/** 获取健康资讯列表(只获取前10条) */
		async getHealthInfoList() {
			this.loading = true;
			const { data } = await getInfoArticlePage({ pageNum: 1, pageSize: 10 });
			this.loading = false;
			this.healthInfoList = data.list;
		},

		/** 获取未阅读消息数 */
		async getUnreadMsgNum() {
			let { data } = await getUnreadMsgNum();
			this.unreadMsgNum = data;
		},

		/** 去授权 */
		navToAuth() {
			// #ifdef MP-WEIXIN
			uni.reLaunch({ url: `/pagesA/auth/auth` });
			// #endif

			// #ifndef MP-WEIXIN
			uni.reLaunch({ url: `/pagesA/login/login` });
			// #endif
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
		/**
		 * 初始化导医导诊项目
		 * @param url 前端url
		 * @param secKey 密钥
		 * @param channel 渠道
		 * @param entrance 入口  001:菜单栏   002:功能模块
		 * @param terminaltag 终端标识  wechat-officialacc:微信公众号 wechat-minipro:微信小程序  app:App  alipay:支付宝  web:WEB
		 * @param userid  患者id
		 * @param sex 性别  男 or 女
		 * @param age 年龄
		 * @param extend 当有额外的参数需要传输时，使用这个字段，格式为JSON ，eg: {"token":"1212"}
		 */
		init() {
			this.cardList.forEach(item => {
				if (item.defaultFlg === 1) {
					iFlyGuide.init({
						url: 'https://zlwyl.iflyhealth.com',
						// https://devmir.iflytek.com/robotMobile
						secKey: 'cd25f4ed9ecaf8eeb9c75a83c307cb50',
						channel: 'jkbd214',
						entrance: '001',
						terminaltag: 'wechat-minipro',
						userid: item.id + '',
						sex: item.sex == 1 ? '男' : '女',
						age: item.age
					});
				}
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
				uni.navigateTo({ url: item.url });
			} else {
				switch (item.text) {
					case '智能导诊':
						// #ifdef MP-WEIXIN
						const encodeURIComponentStr = encodeURIComponent(iFlyGuide.jumptoGuide());
						uni.navigateTo({
							url: `../../pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr}&title=zndz`
						});
						// #endif
						break;
					case '宝贝计划':
						uni.navigateToMiniProgram({
							appId: 'wx39503cdaa1697ef9',
							path: 'pages/index/index'
						});
						break;
				}
			}
		},

		/** 搜索 */
		onSearch() {
			// 这个函数本身也有参数，但不用searchKey显得searchKey用不到一样，但不定义searchKey吧，clear清除文本没效果
			if (this.searchKey.length === 0) {
				uni.showToast({
					icon: 'none',
					title: '请输入搜索关键字'
				});
				return;
			}
			if (!uni.getStorageSync('token')) {
				this.navToAuth();
			} else {
				uni.navigateTo({ url: `../../pagesA/search/search?searchValue=${this.searchKey}` });
			}
		},

		/**
		 * 轮播图点击
		 * @param {Object} index 位置
		 */
		onSwiperItemClick(index) {
			let item = this.activityList[index];
			this.navTo(item.url, item.needToken, item.needCard);
		},

		/** 跳转至电子医保凭证 */
		navToCardCertificate() {
			// #ifdef MP-WEIXIN
			uni.navigateToMiniProgram({
				appId: 'wxe1022cca111d18be',
				path: 'pages/cert/bind/bind?from=gQcUCa9UrA38_6rqkDSlkw.=&cityCode=340400',
				complete:res=>{
					console.log('complete')
					console.log(res)
				}
			});
			// #endif
			// #ifdef H5
			location.href =
				'https://mp.weixin.qq.com/insurance/card/creditjump?cityid=999999&from=WNfjmT_vghjSEItGXbnvog.%3D#wechat_redirect';
			// #endif
		},

		/** 点击健康保定位置，在2s内连续点三下进入修改IP的界面 */
		onTapDoctor() {
			this.tapTimes++;
			if (this.tapTimes >= 5) {
				uni.navigateTo({
					url: '/pagesA/changeIp/changeIp'
				});
			}
			setTimeout(_ => {
				this.tapTimes = 0;
			}, 2000);
		},

		/** 检查APP版本更新 */
		async checkAppVersionUpdate() {
			let { data } = await getAppUpdate();
			this.appUpdateInfo = data;
			if (data.android_code > plus.runtime.versionCode) {
				this.showUpdateModal = true;
			}
		},

		/** 更新模态框点击确定 */
		onUpdateConfirm() {
			if (this.downloadProgress == 100) {
				plus.runtime.install(plus.io.convertLocalFileSystemURL(this.downloadFile), {}, {}, error => {
					uni.showToast({
						title: '安装失败',
						icon: 'none',
						duration: 3000
					});
				});
				return;
			}

			const downloadTask = uni.downloadFile({
				url: this.appUpdateInfo.android_url,
				success: res => {
					if (res.statusCode == 200) {
						// 下载完成
						this.downloadFile = res.tempFilePath;
						plus.runtime.install(plus.io.convertLocalFileSystemURL(this.downloadFile), {}, {}, error => {
							uni.showToast({
								title: '安装失败',
								icon: 'none',
								duration: 3000
							});
						});
					} else {
						uni.showToast({
							title: '更新失败',
							icon: 'none',
							duration: 3000
						});
						this.showUpdateModal = false;
					}
				},
				fail: error => {
					console.error(`出错${error}`);
				}
			});

			downloadTask.onProgressUpdate(res => {
				this.downloadProgress = res.progress;
			});
		}
	}
};
</script>

<style lang="scss">
page {
	padding: 30rpx;
	box-sizing: border-box;
	.header-box {
		height: 580rpx;
		background: #FFFFFF;
		box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(18,80,33,0.1);
		border-radius: 16rpx 16rpx 16rpx 16rpx;
		opacity: 1;

		.welcome {
			margin-top: 36rpx;
			text-align: center;
			font-size: 40rpx;
			letter-spacing: 10%;
			text-shadow: 2rpx 4rpx #1c70f2;
		}

		.welcome-tip {
			margin-top: 4rpx;
			text-align: center;
			font-size: 24rpx;
			letter-spacing: 5%;
			text-shadow: 1rpx 2rpx #1c70f2;
		}

		.top-func-box {
			display: flex;
			margin-top: 18rpx;
			justify-content: space-around;

			.top-func {
				display: flex;
				flex-direction: column;
				align-items: center;

				image {
					width: 80rpx;
					height: 80rpx;
				}

				.title {
					margin: 4rpx 0;
					font-size: 28rpx;
					text-shadow: 1rpx 2rpx #1c70f2;
				}

				.desc {
					font-size: 20rpx;
				}
			}
		}
	}

	.func-swiper {
		height: 350rpx;
		margin-top: 32rpx;
		.func-page {
			width: 100%;
			display: flex;
			flex-flow: wrap;

			.func-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 25%;
				font-size: 24rpx;
				text-align: center;
				background: #fff;

				image {
					width: 80rpx;
					height: 80rpx;
					margin: 12rpx 0;
				}
			}
		}
	}

	.activity-swiper {
		margin: 20rpx 30rpx;
	}

	.health-info-box {
		.title-item {
			margin-top: 30rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.title {
				margin-left: 30rpx;
				color: #333;
				font-weight: bold;
				font-size: 32rpx;
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

			.more {
				color: #999;
				padding: 10rpx 30rpx;
				font-size: 24rpx;
			}
		}

		.item {
			margin: 24rpx 30rpx;
			display: flex;
			background-color: #fff;
			padding: 24rpx;
			height: 188rpx;
			box-sizing: border-box;
			align-items: center;
			border-radius: 20rpx;
			box-shadow: 0rpx 2rpx 20rpx 2rpx rgba(0, 0, 0, 0.05);

			.left {
				width: 160rpx;
			}

			.right {
				flex: 1;
				overflow: hidden;
				height: 100%;
				margin-left: 30rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-around;

				.title {
					color: #000;
					font-weight: 500;
					font-size: 28rpx;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.description {
					color: #999;
					font-weight: 500;
					font-size: 24rpx;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.create-time {
					color: #999;
					font-weight: 500;
					font-size: 20rpx;
				}
			}
		}
	}
}
</style>
