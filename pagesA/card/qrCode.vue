<template>
	<view>
		<view class="blue-bg" />

		<view class="content">
			<card-sel @currentCard="onCurrentCard" :defultSelCardId="recordId" customContent>
				<view slot="content" class="choose-card">
					<text class="name">{{ chooseCard.name | $nameSecret }}</text>
					<u-icon name="arrow-down-fill" color="#ccc" size="26rpx" />
				</view>
			</card-sel>

			<view class="img-wrap">
				<u-loading-icon v-if="loading" />
				<image v-else :src="scanCodeImg" />
			</view>
			<view class="current-leave-seconds">{{ currentLeaveSeconds }} S 后自动刷新</view>
			<u-text
				text="刷新"
				type="primary"
				iconStyle="color:#4298ff;margin:13rpx;padding-top:4rpx"
				prefixIcon="reload"
				align="center"
				@click="getCardScanCode"
			/>

			<view class="toptip">就诊时出示此二维码</view>

			<view class="item-box">
				<u-cell-group customStyle="margin-top:48rpx" :border="false">
					<u-cell title="姓名" :value="chooseCard.name | $nameSecret" size="large" />
					<u-cell title="证件号码" :value="chooseCard.idCard | $idCardSecret" size="large" />
				</u-cell-group>
				<u-button customStyle="margin-top:70rpx" type="primary" shape="circle" @click="unbindCard" text="解绑电子健康卡" />
			</view>

			<text class="change-box" @click="$navTo(`./addFamily?recordId=${recordId}`)">修改</text>
		</view>

		<load-data :loading="unbindLoading" loadingText="解绑中..." isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { getCardScanCode, unbindCard, refreshCardList } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
export default {
	components: { cardSel },

	data() {
		return {
			loading: true,
			chooseCard: {},
			recordId: '',
			scanCodeImg: '',
			currentLeaveSeconds: 60,
			timer: null,
			unbindLoading: false
		};
	},

	onLoad(option) {
		this.recordId = option.recordId;
	},

	onShow() {
		if (this.recordId) {
			this.getCardScanCode();
		}
	},

	onHide() {
		this.clearTimer();
	},

	onUnload() {
		this.clearTimer();
	},

	methods: {
		onCurrentCard(card) {
			this.chooseCard = card;
			this.recordId = card.id;
			this.getCardScanCode();
		},

		/** 获取电子健康卡二维码 */
		async getCardScanCode() {
			this.loading = true;
			let { data } = await getCardScanCode(this.recordId);
			this.scanCodeImg = `data:image/png;base64,${data}`;
			this.loading = false;
			this.clearTimer();
			this.currentLeaveSeconds = 60;
			this.setTimer();
		},

		/** 解绑电子健康卡 */
		unbindCard() {
			uni.showModal({
				title: '提示',
				content: '解绑电子健康卡',
				success: res => {
					if (res.confirm) {
						this.unbindLoading = true;
						unbindCard(this.recordId)
							.then(({ code, message }) => {
								if (code == 200) {
									uni.showToast({
										icon: 'none',
										title: message,
										success: async res2 => {
											await refreshCardList();
											setTimeout(() => {
												uni.navigateBack();
											}, 1500);
										}
									});
								}
							})
							.finally(() => (this.unbindLoading = false));
					}
				}
			});
		},

		/** 设置定时器 */
		setTimer() {
			this.timer = setInterval(() => {
				this.currentLeaveSeconds--;
				if (this.currentLeaveSeconds == 0) {
					this.clearTimer();
					this.getCardScanCode();
				}
			}, 1000);
		},

		/** 清除定时器 */
		clearTimer() {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
};
</script>

<style lang="scss">
page {
	.blue-bg {
		height: 50rpx;
		background-color: $uni-color-primary;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: -20rpx;
		background: #ffffff;
		border-top-left-radius: 32rpx;
		border-top-right-radius: 32rpx;
		padding-top: 48rpx;

		.choose-card {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 72rpx;
			min-width: 170rpx;
			max-width: 300rpx;
			padding: 0 20rpx;
			background-color: rgba(229, 231, 235, 0.5);
			border-radius: 20rpx;

			.name {
				margin-right: 6rpx;
				font-size: 30rpx;
				font-family: PingFang SC-Medium, PingFang SC;
				font-weight: 500;
				color: #0f1419;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}
		}

		.img-wrap {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 48rpx;
			width: 476rpx;
			height: 476rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.current-leave-seconds {
			text-align: center;
			font-size: 22rpx;
			color: #999;
		}

		.toptip {
			font-size: 36rpx;
			font-weight: bold;
			color: #333333;
			line-height: 1;
			text-align: center;
			padding-top: 24rpx;
		}

		.item-box {
			margin: 0 40rpx;
			width: calc(100% - 80rpx);
		}

		.change-box {
			text-align: center;
			color: #4298ff;
			text-decoration: underline;
			font-size: 32rpx;
			padding: 32rpx;
		}
	}
}
</style>
