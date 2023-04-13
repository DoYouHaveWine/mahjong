<template>
	<view class="page">
		<view v-if="status != 9" class="time-box plr-10 ptb-10 tc">
			<view class="f-14">剩余支付时间</view>
			<view class="c-B24143 mt5">
				<text class="time">{{ inittime(this.exprieTime) }}</text>
			</view>
			<view class="c-B24143 mt5 f-16">超时不支付则自动取消预约</view>
		</view>
		<view class="plr-20 bg-white mt15">
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">姓名</text>
				<text v-text="info.recordName"></text>
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">科室</text>
				<text v-text="info.deptName"></text>
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">医生</text>
				<text v-text="info.doctorName"></text>
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">就诊时间</text>
				<text v-text="info.treatTime"></text>
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">总费用</text>
				<view v-if="info.amount" style="color: #ea3131">
					¥ {{ info.amount }}
					<text v-if="info.diagPrice" style="font-size: 24rpx;">（含看诊费：¥ {{ info.diagPrice }})</text>
				</view>
			</view>
		</view>
		
		<u-button
			type="primary"
			:custom-style="{ position: 'fixed', bottom: 0, width: '90%', left: '5%', bottom: '20rpx' }"
			shape="circle"
			@click="payTo"
			:loading="submitLoading"
			loadingText="调起支付中..."
			:disabled="submitLoading"
			throttleTime="1000"
			text="确认支付"
		/>
	</view>
</template>

<script>
import { createWxOrder, getRegisterRecordDetials, setResult0 } from '@/common/http/api.js';
export default {
	data() {
		return {
			timer: null,
			submitLoading: false,
			exprieTime: undefined,
			price: undefined,
			orderNum: undefined,
			type: undefined,
			timeStamp: undefined,
			patientMsg: {},
			info: {},
			status: ''
		};
	},
	onLoad(options) {
		const { orderId, status } = options;
		this.getOrdersDetail(orderId);
		this.status = status;
	},
	methods: {
		async payTo() {
			// // #ifdef MP-WEIXIN
			// wx.requestSubscribeMessage({
			// 	tmplIds: ['rak0FjbKDdHyeBcEu1mlhEbjuIxmauIvN7VyRy4xSmQ'],
			// 	success: res => {
			// 		console.log(res);
			// 	},
			// 	fail: error => {
			// 		console.error(error);
			// 	},
			// 	complete: async res => {
			// 		// #endif
					const info = this.info;
					this.submitLoading = true;
					if (info.amount === 0) {
						let res = await setResult0(info.payResultReq);
						this.submitLoading = false;
						if (res.code == 200) {
							uni.redirectTo({
								url: `./success?orderId=${info.id}&payType=2`
							});
						}
					} else {
						// 创建微信订单
						let { data } = await createWxOrder({
							id: info.id,
							payMethod: 1,
							pcReq: false,
							tradeType: 'JSAPI',
							weixinOpenid: uni.getStorageSync('openId')
						});
						this.submitLoading = false;
						uni.requestPayment({
							provider: 'wxpay',
							timeStamp: data.timeStamp,
							nonceStr: data.nonceStr,
							package: data.package,
							signType: 'MD5',
							paySign: data.paySign,
							success: function(res) {
								console.log('success:' + JSON.stringify(res));
								uni.redirectTo({ url: `./success?orderId=${info.id}&payType=1` });
							},
							fail: function(err) {
								console.log('fail:' + JSON.stringify(err));
							}
						});
					}
			// 		// #ifdef MP-WEIXIN
			// 	}
			// });
			// // #endif
		},
		async getOrdersDetail(id) {
			const { data } = await getRegisterRecordDetials(id);
			this.info = data;
			this.exprieTime = this.info.exprieTime;
		},
		setData() {
			if (this.exprieTime <= 0) {
				return false;
			} else {
				this.timer = setInterval(() => {
					this.exprieTime--;
				}, 1000);
			}
		},
		inittime(leftTime) {
			var m, s;
			if (leftTime >= 0) {
				m = this.formatNum(Math.floor((leftTime / 60) % 60));
				s = this.formatNum(Math.floor(leftTime % 60));
			} else {
				m = '00';
				s = '00';
			}
			return m + ' : ' + s;
		},
		formatNum(num) {
			return num < 10 ? '0' + num : '' + num;
		},
		clearTimer() {
			clearInterval(this.timer);
			this.timer = null;
		}
	},
	mounted() {
		this.setData();
	},
	onUnload() {
		this.timer && this.clearTimer();
	}
};
</script>

<style lang="scss">
page {
	background: $uni-f9f9f9;
	.time-box {
		background: #e6f1ff;
	}
	.c-B24143 {
		color: #b24143;
	}
}
</style>
