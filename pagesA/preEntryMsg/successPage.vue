<template>
	<view>
		<view class="content">
			<view class="flex-box">
				<view class="success-icon"><u-icon :size="40" name="checkbox-mark" color="#fff" /></view>
				<text class="success-tips">诊前问卷填写完毕！</text>
			</view>
			<view class="img-wrap">
				<u-loading-icon v-if="loading" size="60" />
				<image v-else :src="img" />
			</view>
			<view class="current-leave-seconds">{{ currentLeaveSeconds }} S 后自动刷新</view>
			<u-button
				:custom-style="{ width: '120rpx', padding: '10rpx', marginTop: '20rpx' }"
				type="primary"
				size="small"
				@click="getHealthQrCode"
				text="刷新"
			/>
			<view class="toptip">就诊时出示此二维码</view>
			<view>
				<u-cell title="姓名" :value="name" />
				<u-cell title="证件号码" :value="idCard | $idCardSecret" />
			</view>
		</view>
	</view>
</template>

<script>
import { fetchUserInfo, refreshCardList, getCardScanCode, delHnCode } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: true,
			idCard: '',
			name: '',
			recordId: '',
			img: '',
			recordList: [],
			currentLeaveSeconds: 60,
			timer: null
		};
	},

	onLoad(option) {
		this.recordId = option.recordId;
	},

	onShow() {
		this.getHealthQrCode();
	},

	onHide() {
		this.clearTimer();
	},

	onUnload() {
		this.clearTimer();
	},

	methods: {
		/** 获取绑定的健康卡列表 */
		async getRecordList() {
			let { data } = await refreshCardList();
			this.recordList = data || [];
		},

		async getHealthQrCode() {
			await this.getRecordList();
			this.recordList.forEach(item => {
				if (this.recordId == item.id) {
					this.idCard = item.idCard;
					this.name = item.name;
				}
			});
			this.loading = true;
			let { data } = await getCardScanCode(this.recordId);
			this.img = `data:image/png;base64,${data}`;
			this.loading = false;
			this.clearTimer();
			this.currentLeaveSeconds = 60;
			this.setTimer();
		},

		/** 设置定时器 */
		setTimer() {
			this.timer = setInterval(() => {
				this.currentLeaveSeconds--;
				if (this.currentLeaveSeconds == 0) {
					this.clearTimer();
					this.getHealthQrCode();
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
	background: #5483f9;

	.content {
		width: 677rpx;
		background: #ffffff;
		border-radius: 32rpx;
		margin: 40rpx auto;
		padding-top: 60rpx;
		overflow: hidden;

		.img-wrap {
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0 auto;
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
			font-size: 39rpx;
			font-family: Source Han Sans CN;
			font-weight: bold;
			color: #333333;
			line-height: 1;
			text-align: center;
			padding-top: 38rpx;
		}
	}

	.codeBtn {
		width: 677rpx;
		height: 86rpx;
		background: #ffffff;
		border-radius: 43rpx;
		font-size: 32rpx;
		font-family: Source Han Sans CN;
		font-weight: 400;
		color: #5483f9;
		line-height: 86rpx;
		text-align: center;
		margin: 40rpx auto;
	}

	.flex-box {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 30rpx;
		.success-icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background-color: #18b566;
			text-align: center;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 20rpx;
		}
		.success-tips {
			font-size: 36rpx;
			font-weight: bold;
			color: #18b566;
		}
	}
}
</style>
