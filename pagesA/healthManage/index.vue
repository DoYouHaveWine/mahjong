<template>
	<view>
		<u-sticky bgColor="#fff">
			<view class="tabs">
				<u-tabs
					:list="tabList"
					@change="onTabChange"
					:scrollable="false"
					:current="currentTab"
					lineWidth="100rpx"
					lineHeight="4rpx"
					activeStyle="color:#4298ff"
				/>
			</view>
		</u-sticky>

		<view class="content-box">
			<!-- 活动轮播图 -->
			<u-swiper
				radius="10"
				indicator
				indicatorStyle="right:20rpx;bottom:10rpx"
				imgMode="scaleToFill"
				indicatorMode="dot"
				:list="swiperList"
				keyName="src"
				@click="onSwiperItemClick"
			/>

			<!-- <view class="consulting-service" v-if="versionType != 'release'">
				<view class="kszx-box dev-func-style" @click="$devFuncClick">
					<view class="title">快速咨询</view>
					<view>
						<text class="red-text">3分钟</text>
						快速接诊
					</view>
					<view>不限制次数</view>
				</view>
				<view class="zjzx-box dev-func-style" @click="$devFuncClick">
					<view class="title">专家咨询</view>
					<view>
						<text class="red-text">专科医生</text>
						坐诊
					</view>
					<view>咨询到位</view>
				</view>
			</view> -->

			<!-- 菜单 -->
			<view class="commom-tools">
				<view class="func-grid">
					<view
						v-if="!item.hidden"
						class="item"
						:class="{ 'dev-func-style': item.dev }"
						v-for="(item, index) in funcList"
						:key="index"
						@click="navTo(item)"
					>
						<view class="image-box"><image :src="item.src" /></view>
						<text>{{ item.text }}</text>
					</view>
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
			versionType: getVertionType(),
			tabList: [{ name: '高血压' }, { name: '糖尿病' }, { name: '冠心病' }, { name: '慢阻肺' }],
			currentTab: 0,

			swiperList: [],
			gxySwipperList: [{ src: 'https://hnzhyl.net/test/images/banner/ic_banner_gxy.png', url: '' }],
			tnbSwipperList: [{ src: 'https://hnzhyl.net/test/images/banner/ic_banner_tnb.png', url: '' }],
			gxbSwipperList: [{ src: 'https://hnzhyl.net/test/images/banner/ic_banner_gxb.png', url: '' }],
			mzfSwipperList: [{ src: 'https://hnzhyl.net/test/images/banner/ic_banner_mzf.png', url: '' }],

			funcList: [],
			gxyFuncList: [
				{
					text: '血压管理',
					src: '/static/social/ic_yygh.svg',
					url: '/pagesA/healthManage/gxy/manage'
				},
				{
					text: '用药提醒',
					src: '/static/social/ic_mzjf.svg',
					url: '/pagesA/healthManage/drug/remind'
				},
				{
					text: '高血压挂号',
					src: '/static/social/ic_zxqy.svg',
					url: `../../pagesA/hospital/hosList?fromPage=gxygh`
				},
				// {
				// 	text: '高血压问诊',
				// 	src: '/static/social/ic_zxjy.svg',
				// 	url: '/pagesA/registerRecord/registerRecord',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			],
			tnbFuncList: [
				{
					text: '血糖管理',
					src: '/static/social/ic_yygh.svg',
					url: '/pagesA/healthManage/bloodSuger/manage'
				},
				{
					text: '用药提醒',
					src: '/static/social/ic_mzjf.svg',
					url: '/pagesA/healthManage/drug/remind'
				},
				{
					text: '高血糖挂号',
					src: '/static/social/ic_zxqy.svg',
					url: '../../pagesA/hospital/hosList?fromPage=gxtgh'
				},
				// {
				// 	text: '高血糖问诊',
				// 	src: '/static/social/ic_zxjy.svg',
				// 	url: '/pagesA/registerRecord/registerRecord',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			],
			gxbFuncList: [
				{
					text: '血压管理',
					src: '/static/social/ic_yygh.svg',
					url: '/pagesA/healthManage/gxy/manage'
				},
				{
					text: '血糖管理',
					src: '/static/social/ic_mzjf.svg',
					url: '/pagesA/healthManage/bloodSuger/manage'
				},
				{
					text: '用药提醒',
					src: '/static/social/ic_zxqy.svg',
					url: '/pagesA/healthManage/drug/remind'
				},
				{
					text: '冠心病挂号',
					src: '/static/social/ic_zxjy.svg',
					url: '../../pagesA/hospital/hosList?fromPage=gxbgh'
				},
				// {
				// 	text: '冠心病问诊',
				// 	src: '/static/social/ic_zxjy.svg',
				// 	url: '/pagesA/registerRecord/registerRecord',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			],
			mzfFuncList: [
				{
					text: '用药提醒',
					src: '/static/social/ic_mzjf.svg',
					url: '/pagesA/healthManage/drug/remind'
				},
				{
					text: '慢阻肺挂号',
					src: '/static/social/ic_zxqy.svg',
					url: '../../pagesA/hospital/hosList?fromPage=mzfgh'
				},
				// {
				// 	text: '慢阻肺问诊',
				// 	src: '/static/social/ic_zxjy.svg',
				// 	url: '/pagesA/registerRecord/registerRecord',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			]
		};
	},

	onLoad(options) {
		if (options.tabIndex) {
			this.currentTab = Number(options.tabIndex);
		}
		this.refreshTabView(this.currentTab);
	},

	methods: {
		onTabChange(item) {
			this.refreshTabView(item.index);
		},

		/** 刷新Tab视图
		 * @param {Object} tabIndex tab索引值Index
		 */
		refreshTabView(tabIndex) {
			switch (tabIndex) {
				case 0: // 高血压
					this.swiperList = this.gxySwipperList;
					this.funcList = this.gxyFuncList;
					break;

				case 1: // 糖尿病
					this.swiperList = this.tnbSwipperList;
					this.funcList = this.tnbFuncList;
					break;

				case 2: // 冠心病
					this.swiperList = this.gxbSwipperList;
					this.funcList = this.gxbFuncList;
					break;

				case 3: // 慢阻肺
					this.swiperList = this.mzfSwipperList;
					this.funcList = this.mzfFuncList;
					break;
			}
		},

		onSwiperItemClick() {
			uni.navigateTo({
				url: '/pagesA/info/list'
			});
		},

		navTo(item) {
			if (item.dev) {
				this.$devFuncClick();
				return;
			}

			uni.navigateTo({ url: item.url });
		}
	}
};
</script>

<style lang="scss">
page {
	background: #fafafa;

	.tabs {
		padding: 0 40rpx;
		border-bottom: 2rpx solid #e5e7eb80;
	}

	.content-box {
		padding: 34rpx 40rpx;

		.consulting-service {
			display: flex;
			justify-content: space-between;
			margin: 32rpx 0;

			.kszx-box,
			.zjzx-box {
				margin-right: 26rpx;
				flex: 1;
				padding: 22rpx 24rpx;
				font-size: 20rpx;
				line-height: 32rpx;
				color: #0f141980;

				.title {
					line-height: 40rpx;
					font-weight: 500;
					font-size: 30rpx;
					margin-bottom: 10rpx;
				}

				.red-text {
					color: #ff6262;
				}
			}

			.kszx-box {
				background-image: url('/pagesA/static/health/ic_kszx.png');
				background-size: 100%;
				background-repeat: no-repeat;

				.title {
					color: #21b1a5;
				}
			}

			.zjzx-box {
				background-image: url('/pagesA/static/health/ic_zjzx.png');
				background-size: 100%;
				background-repeat: no-repeat;
				.title {
					color: #194da4;
				}
			}
		}

		.commom-tools {
			.func-grid {
				overflow: hidden;
				margin: 15rpx -20rpx;
				width: calc(100% + 40rpx);
				display: flex;
				flex-wrap: wrap;

				.item {
					display: flex;
					width: 25%;
					height: 180rpx;
					align-items: center;
					flex-direction: column;
					justify-content: center;

					.image-box {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 120rpx;
						height: 104rpx;
						border-radius: 20rpx;
						background: #fff;
						box-shadow: 0rpx 2rpx 20rpx 2rpx #0000000d;

						image {
							width: 46rpx;
							height: 50rpx;
						}
					}

					text {
						color: #333;
						font-family: SF Pro Display;
						font-weight: 500;
						font-size: 28rpx;
						margin-top: 16rpx;
					}
				}
			}
		}
	}
}
</style>
