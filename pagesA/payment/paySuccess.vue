<template>
	<view class="pay-success-page">
		<u-icon name="checkmark-circle-fill" color="#28D094" size="160rpx" />
		<view class="pay-success">支付成功</view>
		<view class="pay-way">
			支付方式——
			<text>微信支付</text>
		</view>

		<u-button
			shape="circle"
			text="查看门诊缴费订单"
			color="#4298ff"
			size="large"
			customStyle="margin-top:68rpx;width:92%;height:90rpx;"
			@click="$navTo(`/pagesA/order/details?orderId=${orderId}`)"
		/>

		<text class="nav-to-index" @click="navToIndex">返回首页</text>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderId: ''
		};
	},

	onLoad(options) {
		this.orderId = options.orderId;
	},

	methods: {
		navToIndex() {
			uni.switchTab({
				url: '/pages/index/index'
			});
		}
	},

	onUnload() {
		let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2]; // 上一页
		prevPage.$vm.needRefresh = true;
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.pay-success-page {
		display: flex;
		flex-direction: column;
		align-items: center;

		.u-icon {
			margin-top: 120rpx;
		}

		.pay-success {
			margin-top: 36rpx;
			font-size: 30rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: #000;
		}

		.pay-way {
			margin-top: 16rpx;
			font-size: 26rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: rgba(15, 20, 25, 0.5);

			text {
				color: #ed8c53;
			}
		}

		.nav-to-index {
			padding: 28rpx;
			font-size: 32rpx;
			font-family: PingFang SC-Medium, PingFang SC;
			font-weight: 500;
			color: #4298ff;
			text-decoration: underline;
			text-underline-offset: 2rpx;
		}
	}
}
</style>
