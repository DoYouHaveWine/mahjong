<template>
	<view>
		<!-- 就医服务 -->
		<view class="commom-tools">
			<text class="category-title">就医服务</text>
			<view class="func-grid">
				<view
					v-if="!item.hidden"
					class="item"
					:class="{ 'dev-func-style': item.dev }"
					v-for="(item, index) in commonToolList"
					:key="index"
					@click="onFuncItemClick(item)"
				>
					<view class="image-box"><image :src="item.src" /></view>
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>

		<!-- 其他服务 -->
		<view class="other">
			<text class="category-title">其他服务</text>
			<view class="func-grid">
				<view
					v-if="!item.hidden"
					class="item"
					:class="{ 'dev-func-style': item.dev }"
					v-for="(item, index) in otherList"
					:key="index"
					@click="onFuncItemClick(item)"
				>
					<image :src="item.src" />
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getVertionType } from '@/common/utils/commonUtil.js';
export default {
	data() {
		return {
			commonToolList: [
				{
					text: '预约挂号',
					src: '/static/index/ic_yygh.svg',
					url: '/pagesA/hospital/hosList?fromPage=yygh',
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
				// {
				// 	text: '病历查询',
				// 	src: '/static/index/ic_zzzc.svg',
				// 	url: '/pagesA/selfCheck/selfCheck',
				// 	needCard: true,
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				{
					text: '智能导诊',
					src: '/static/index/ic_zndz.svg',
					url: '',
					needCard: true
				},
				{
					text: '电子健康码',
					src: '/pagesA/static/more/ic_dzjkm.svg',
					url: '/pagesA/card/qrCode',
					needCard: true
				},
				// {
				// 	text: '影像报告',
				// 	src: '/static/index/ic_yxbg.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				{
					text: '来院导航',
					src: '/static/index/ic_lydh.svg',
					url: '/pagesA/hospital/hosList?fromPage=lydh'
				},
				{
					text: '症状自查',
					src: '/pagesA/static/more/ic_zzzc.png',
					url: '/pagesA/selfCheck/selfCheck'
				}
			],
			otherList: [
				{
					text: '宝贝计划',
					src: '/static/index/ic_bbjh.svg'
				},
				{
					text: '商保服务',
					src: '/static/index/ic_sbfw.svg',
					url: ''
				},
				{
					text: '病友圈',
					src: '/pagesA/static/more/ic_byq.png',
					url: '/pagesA/patientCircle/list'
				},
				{
					text: '个人防疫手册',
					src: '/pagesA/static/more/ic_grfyzc.svg',
					url: ''
				}
			],
			zndzUrl: undefined
		};
	},

	computed: {
		cardList() {
			return this.$store.state.cardList;
		}
	},

	onLoad() {
		this.init();
	},

	methods: {
		/** 检查是否绑定了电子健康卡 */
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
		 * 功能项点击
		 * @param {String} item 功能项
		 */
		async onFuncItemClick(item) {
			if (item.dev) {
				// 建设中...
				this.$devFuncClick();
				return;
			}

			if (item.needCard && !this.checkBindCard()) {
				// 需要绑卡但未绑卡
				return;
			}

			switch (item.text) {
				case '智能导诊':
					// #ifdef MP-WEIXIN
					const encodeURIComponentStr = encodeURIComponent(iFlyGuide.jumptoGuide());
					uni.navigateTo({
						url: `../../pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr}&title=zndz`
					});
					// #endif
					return;

				case '宝贝计划':
					// #ifdef MP-WEIXIN
					uni.navigateToMiniProgram({
						appId: 'wx39503cdaa1697ef9',
						path: 'pages/index/index'
					});
					// #endif
					return;

				case '影像报告':
					let bindOwnCard = false;
					this.cardList.forEach(({ relationShip, id }) => {
						if (relationShip === 0) {
							bindOwnCard = true;
							uni.navigateTo({
								url: `/pagesA/report/imageReportList?cardId=${id}`
							});
							return;
						}
					});

					if (!bindOwnCard) {
						uni.showModal({
							title: '提示',
							content: '为保障个人隐私安全，目前仅支持查看【本人】影像报告！',
							showCancel: false
						});
						return;
					}
					return;

				case '商保服务':
					// #ifdef MP-WEIXIN
					uni.navigateToMiniProgram({
						appId: 'wx835522741309f4d2',
						path: 'pages/Index/index?UserUniqueId=Bkt001'
					});
					// #endif
					return;

				case '个人防疫手册':
					const encodeURIComponentStr2 = encodeURIComponent(
						'https://clinc.iflyhealth.com/robot/#/wx/text-dialog?&wjw=rmhys&from=rmhys'
					);
					uni.navigateTo({
						url: `/pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr2}`
					});
					return;
			}

			if (item.url) {
				uni.navigateTo({ url: item.url });
			}
		}
	}
};
</script>

<style lang="scss">
.commom-tools,
.other {
	margin: 28rpx 0 20rpx 0;

	.category-title {
		color: #333;
		font-family: PingFang SC;
		font-weight: 600;
		font-size: 30rpx;
		margin: 0 40rpx;
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

	.func-grid {
		overflow: hidden;
		margin-top: 32rpx;
		width: 100%;
		padding: 0 20rpx;
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;

		.item {
			display: flex;
			width: 25%;
			text-align: center;
			background: #fff;
			align-items: center;
			flex-direction: column;
			justify-content: center;
			margin-bottom: 40rpx;

			image {
				width: 70rpx;
				height: 70rpx;
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
.other {
	padding-bottom: 30rpx;
}
</style>
