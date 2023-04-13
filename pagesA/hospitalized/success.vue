<template>
	<view class="page">
		<u-icon v-if="orderStatus" name="checkmark-circle-fill" color="#28D094" size="160rpx" />
		<view class="recharge-success">{{orderStatusName}}</view>
		<view class="recharge-tip">您可以在个人中心【住院记录-住院详情】中查看您的充值记录</view>

		<u-button
			shape="circle"
			text="查看充值记录"
			type="primary"
			size="large"
			customStyle="margin-top:68rpx;width:92%;height:90rpx;"
			@click="$navTo(`./rechargeList?orderId=${orderId}&recordId=${recordId}`)"
		/>

		<text class="nav-to-index" @click="navToIndex">返回首页</text>
	</view>
</template>

<script>
import { getRechargeResult } from '@/common/http/api.js';
export default {
	data() {
		return {
			orderStatus:false,
			orderStatusName:'充值中',
			orderId:'',
			recordId:''
		};
	},
	onLoad(options) {
		const { orderId,recordId } = options;
		this.orderId = orderId
		this.recordId = recordId
		this.getOrderStatus(orderId);
	},
	methods: {
		/** 首页 */
		navToIndex() {
			uni.switchTab({ url: '/pages/index/index' });
		},
		/** 获取订单状态，每三秒一次直至状态为支付成功 */
		getOrderStatus(orderId) {
			this.timer = setInterval(_ => {
				getRechargeResult(orderId).then(res => {
					console.log(res)
					if (res.code == 200) {
						this.orderStatus = true;
						this.orderStatusName = '充值成功';
						this.clearTimer();
					}else if(res.code == 500){
						this.orderStatusName = '充值失败';
						this.clearTimer();
					}
				});
			}, 3000);
		},
		/** 清除定时器 */
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.page {
		display: flex;
		flex-direction: column;
		align-items: center;

		.u-icon {
			margin-top: 120rpx;
		}

		.recharge-success {
			margin-top: 36rpx;
			font-size: 30rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: #000;
		}

		.recharge-tip {
			margin-top: 16rpx;
			font-size: 26rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: #999;
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
