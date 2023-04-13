<template>
	<view class="page">
		<!-- 活动轮播图 -->
		<view class="activity-swiper">
			<u-swiper radius="10" indicator indicatorStyle="right:20rpx;bottom:10rpx" imgMode="scaleToFill"
				indicatorMode="dot" :list="activityList" keyName="src" @click="onSwiperItemClick" />
		</view>
		<!-- 总览 -->
		<view class="commom-tools">
			<text class="category-title">总览</text>
			<view class="func-grid">
				<view class="item" v-for="(item,index) in tabList" :key="index" @click="navTo(item)">
					<image :src="item.src" mode=""></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { refreshCardList, getUnreadMsgNum, getInfoArticlePage, getAppUpdate } from '@/common/http/api.js';
	export default {
		data() {
			return {
				activityList: [
					{ src: '/static/data/banner_data.png', url: '/pagesA/data/totalData' }
				],
				tabList: [{
					src: '/static/data/btn_data1.png',
					url: '/pagesA/data/recordData?businessType=1'
				}, {
					src: '/static/data/btn_data2.png',
					url: '/pagesA/data/outpatientsData?businessType=2'
				}, {
					src: '/static/data/btn_data3.png',
					url: '/pagesA/data/hospitalizedData?businessType=3'
				}, {
					src: '/static/data/btn_data4.png',
					url: '/pagesA/data/payData?businessType=4'
				}, {
					src: '/static/data/btn_data5.png',
					url: '/pagesA/data/reportData?businessType=5'
				}],
				hospitalId:undefined
			};
		},
		onShow() {},
		onLoad(options) {
			this.hospitalId = options.hospitalId
		},
		methods: {
			/**
			 * 轮播图点击
			 * @param {Object} index 位置
			 */
			onSwiperItemClick(index) {
				let item = this.activityList[index];
				uni.navigateTo({
					url: `${item.url}?hospitalId=${this.hospitalId}`
				})
			},
			navTo(item) {
				uni.navigateTo({
					url: `${item.url}&hospitalId=${this.hospitalId}`
				})
			},
		}
	};
</script>

<style lang="scss">
	page {
		.activity-swiper {
			margin: 20rpx 30rpx;
		}

		.commom-tools {
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
				width: 100%;
				display: flex;
				flex-wrap: wrap;

				.item {
					display: flex;
					width: 50%;
					height: 160rpx;
					text-align: center;
					margin-top: 20rpx;
					background: #fff;
					align-items: center;
					flex-direction: column;
					justify-content: center;

					image {
						width: 339rpx;
						height: 154rpx;
					}
				}
			}
		}
	}
</style>
