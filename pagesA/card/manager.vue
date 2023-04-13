<template>
	<view class="card-manager-page">
		<view class="bg-blue" />

		<!-- 电子健康卡轮播图 -->
		<view class="card-banner">
			<swiper class="swiper" indicator-dots="true" :autoplay="autoplay" duration="300"
				indicator-active-color="#dd524d" indicator-color="#eee" @transition="onTransition"
				@animationfinish="onAnimationfinish">
				<swiper-item v-for="item in cardList" :key="item.id">
					<view @click="$navTo(`./qrCode?recordId=${item.id}`)"
						:class="['swiper-item', { 'swiper-margin': needSwiperMargin }]"
						:style="{ backgroundImage: 'url(' + serverUrl + '/images/cardbg.png' + ')' }">
						<text class="mechanism">{{ item.mechanism || '保定市卫生健康委员会' }}</text>
						<text class="name">{{ item.name | $nameSecret }}</text>
						<text class="idCard">{{ item.idCard | $idCardSecret }}</text>
						<image :src="serverUrl + '/images/qrcode.png'" />
					</view>
				</swiper-item>
				<swiper-item>
					<view class="add-card">
						<image class="add-icon" src="/pagesA/static/card/ic_add.svg" @click="addCard" />
						<text>请添加您的健康卡</text>
						<text>（您还可以添加 {{ 5 - Number(cardList.length) }} 张健康卡）</text>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<u-cell-group customStyle="background-color:#fff;margin-top:40rpx;padding:0 40rpx">
			<!-- <u-cell
				icon="/pagesA/static/card/ic_jkda.svg"
				title="健康档案"
				isLink
				url="/pagesA/healthRecords/healthRecords"
				size="large"
				iconStyle="width: 55rpx;height: 55rpx"
				titleStyle="margin-left:15rpx;color: #101623;font-size: 28rpx;"
			/> -->
			<u-cell icon="/pagesA/static/card/ic_dzjkkxz.svg" title="电子健康卡须知" isLink url="/pagesA/pdf/details?id=4"
				size="large" iconStyle="width: 55rpx;height: 55rpx"
				titleStyle="margin-left:15rpx;color: #101623;font-size: 28rpx;" />
			<u-cell icon="/pagesA/static/card/ic_dzjkksyzy.svg" title="电子健康卡使用指引" isLink url="/pagesA/pdf/details?id=5"
				size="large" iconStyle="width: 55rpx;height: 55rpx"
				titleStyle="margin-left:15rpx;color: #101623;font-size: 28rpx;" />
		</u-cell-group>
	</view>
</template>

<script>
	import { refreshCardList } from '@/common/http/api.js';
	export default {
		data() {
			return {
				needSwiperMargin: false,
				autoplay: false
			};
		},

		computed: {
			cardList() {
				return this.$store.state.cardList;
			}
		},
		async onLoad(options) {
			// 判断是否有登录
			if (!uni.getStorageSync('token')) {
				// 扫码方式进入
				if (options.q) {
					// 去授权
					uni.redirectTo({ url: `/pagesA/auth/auth?fromPage=card` });
					return;
				}
			} else {
				let { code } = await refreshCardList();
			}

		},
		onShow() {
			this.autoplay = true;
		},

		onHide() {
			this.autoplay = false;
		},

		methods: {
			/** 添加电子健康卡 */
			addCard() {
				if (this.cardList.length >= 5) {
					uni.showToast({
						icon: 'none',
						title: '您最多可添加5张健康卡，如需添加请先解绑!'
					});
					return;
				}
				this.$navTo('./bindCard');
			},

			/** 健康卡滑动监听，添加边距 */
			onTransition(e) {
				this.needSwiperMargin = true;
			},

			/** 健康卡停止滑动监听，删除边距 */
			onAnimationfinish(e) {
				this.needSwiperMargin = false;
			}
		}
	};
</script>

<style lang="scss">
	page {
		background-color: #f5f7fa;

		.card-manager-page {
			overflow-x: hidden;

			.bg-blue {
				background-color: $uni-color-primary;
				width: 110%;
				margin-left: -5%;
				height: 200rpx;
				border-bottom-left-radius: 20%;
				border-bottom-right-radius: 20%;
			}

			.card-banner {
				margin: 0 auto;
				margin-top: -160rpx;
				width: 620rpx;
				height: 350rpx;
				overflow: hidden;
				border-radius: 10rpx;
				background: #fff;
				box-shadow: 0px 3px 7px 0px rgba(84, 131, 249, 0.15);

				::v-deep .swiper {
					height: 100%;

					swiper-item {
						height: 100%;

						.swiper-item {
							height: 100%;
							overflow: hidden;
							position: relative;
							border-radius: 10rpx;
							background-size: 100%;
							background-size: cover;
							background-repeat: no-repeat;

							text {
								font-weight: bold;
								font-family: PingFangSC-Medium, sans-serif;
							}

							.mechanism {
								position: absolute;
								top: 32rpx;
								left: 34rpx;
								font-size: 24rpx;
							}

							.name {
								position: absolute;
								top: 202rpx;
								left: 35rpx;
								font-size: 36rpx;
							}

							.idCard {
								position: absolute;
								top: 254rpx;
								left: 35rpx;
								font-size: 30rpx;

								&+image {
									position: absolute;
									top: 124rpx;
									left: 443rpx;
									width: 162rpx;
									height: 162rpx;
									background-color: #eeeeee;
								}
							}
						}
					}

					.add-card {
						display: flex;
						flex-direction: column;
						height: 100%;
						align-items: center;
						justify-content: center;
						font-size: 14px;
						line-height: 1.5em;
						color: #999;

						.add-icon {
							margin: 10rpx 0;
							width: 100rpx;
							height: 100rpx;
						}
					}
				}
			}

			.swiper-margin {
				margin-left: 2rpx;
			}
		}
	}
</style>
