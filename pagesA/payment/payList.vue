<template>
	<view>
		<templete v-if="paymentList.length" class="toBePay-box">
			<view class="item" v-for="item in paymentList" :key="item.orderId" @click="$navTo(`../order/details?orderId=${item.orderId}`)">
				<view class="title">
					<image src="/pagesA/static/hospital/ic_institution.svg" />
					<text>{{ item.hospitalName }}</text>
				</view>

				<view class="content">
					<view>
						<text class="label">就 诊 人</text>
						<text class="value">{{ item.recordName || '' }}</text>
					</view>
					<view>
						<text class="label">就诊卡号</text>
						<text class="value">{{ item.visitNo || '' }}</text>
					</view>
					<view>
						<text class="label">支付类别</text>
						<text class="value">{{ item.paymentType ? (item.paymentType == 1 ? '自费' : '医保') : '' }}</text>
					</view>
					<view>
						<text class="label">项目名称</text>
						<text class="value">{{ item.title || '' }}</text>
					</view>
					<view>
						<text class="label">诊疗科室</text>
						<text class="value">{{ item.deptName || '' }}</text>
					</view>
					<view>
						<text class="label">就诊医生</text>
						<text class="value">{{ item.doctorName || '' }}</text>
					</view>
					<view>
						<text class="label">订单时间</text>
						<text class="value">{{ item.bizTime || '' }}</text>
					</view>
					<view>
						<text class="label">订单编号</text>
						<text class="value">{{ item.orderNo || '' }}</text>
					</view>
				</view>

				<view class="bottom">
					<view class="top">
						<text class="amount">小计：¥ {{ item.amount || '' }}</text>
						<view class="pay-btn" @click.stop="toPay(item)">
							<u-button v-if="item.status == 0" type="primary" customStyle="height: 60rpx;" text="去支付" shape="circle" />
						</view>
					</view>

					<text class="expire-time">剩余支付时间：{{ item.expireTime | timeFilter }}</text>
				</view>
			</view>
		</templete>

		<load-data
			v-if="!paymentList.length || loading.isLoading"
			:loading="loading.isLoading"
			:loadingText="loading.loadingText"
			:isLoadingDialog="loading.isLoadingDialog"
		/>
	</view>
</template>

<script>
import { getUnpaidClinicList, createWxOrder } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: {
				isLoading: true,
				loadingText: '加载中...',
				isLoadingDialog: false
			},
			form: {},
			paymentList: [],
			timer: null,
			needRefresh: false // 支付成功返回页面刷新
		};
	},

	filters: {
		/**
		 * 将剩余的秒数转换为天小时分秒
		 * @param {Object} remainTime 剩余的秒数
		 */
		timeFilter(remainTime) {
			if (remainTime < 0) return 0;
			let dates = Math.floor(remainTime / (24 * 3600));
			let hours = Math.floor((remainTime % (24 * 3600)) / 3600);
			let minutes = Math.floor((remainTime % 3600) / 60);
			let seconds = remainTime % 60;
			let dateStr = dates == 0 ? '' : `${dates}天`;
			let hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
			let minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
			let secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
			return `${dateStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
		}
	},

	onLoad(options) {
		this.form = options;
		this.fetchUnpaidClinicList();
	},

	onShow() {
		if (this.needRefresh) {
			this.fetchUnpaidClinicList();
		}
		this.setTimer();
	},

	onHide() {
		if (this.timer) {
			this.clearTimer();
		}
	},

	methods: {
		/** 查询门诊待缴费列表 */
		async fetchUnpaidClinicList() {
			this.loading = {
				isLoading: true,
				loadingText: '加载中...',
				isLoadingDialog: false
			};
			this.paymentList = [];
			const { data } = await getUnpaidClinicList(this.form);
			this.loading.isLoading = false;
			this.paymentList = data;
		},

		/**
		 * 支付
		 * @param {Object} item 订单项
		 */
		toPay(item) {
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds: ['rak0FjbKDdHyeBcEu1mlhEbjuIxmauIvN7VyRy4xSmQ'],
				success: res => {
					console.log(res);
				},
				fail: error => {
					console.error(error);
				},
				complete: async res => {
					// #endif
					this.loading = {
						isLoading: true,
						loadingText: '调起支付中...',
						isLoadingDialog: true
					};
					createWxOrder({
						id: item.orderId,
						payMethod: 1,
						weixinOpenid: uni.getStorageSync('openId'),
						tradeType: 'JSAPI'
					})
						.then(({ code, data }) => {
							if (code == 200) {
								uni.requestPayment({
									provider: 'wxpay',
									timeStamp: data.timeStamp,
									nonceStr: data.nonceStr,
									package: data.package,
									signType: data.signType,
									paySign: data.paySign,
									success: res => {
										uni.navigateTo({ url: `/pagesA/payment/paySuccess?orderId=${item.orderId}` });
									},
									fail: err => {
										console.error('fail:' + JSON.stringify(err));
									}
								});
							}
						})
						.finally(() => (this.loading.isLoading = false));
					// #ifdef MP-WEIXIN
				}
			});
			// #endif
		},

		/** 设置定时器 */
		setTimer() {
			this.timer = setInterval(() => {
				if (this.paymentList) {
					this.paymentList = this.paymentList.map(element => {
						element.expireTime--;
						return element;
					});
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
	background-color: $uni-page-background-color;

	.toBePay-box {
		.item {
			margin: 30rpx;
			border: 2px solid rgba(229, 231, 235, 0.5);
			border-radius: 20rpx;
			background-color: #fff;

			.title {
				display: flex;
				align-items: center;
				border-bottom: 2rpx solid #f0f0f0;
				height: 96rpx;
				font-size: 30rpx;
				padding: 0 26rpx;
				color: #333;

				image {
					width: 32rpx;
					height: 32rpx;
					margin-right: 6rpx;
				}
			}

			.content {
				display: flex;
				flex-direction: column;
				padding: 28rpx 4rpx;
				margin: 0 24rpx;
				border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);

				view {
					font-size: 30rpx;
					font-family: PingFang SC-Regular, PingFang SC;
					font-weight: 400;
					color: rgba(15, 20, 25, 0.5);
					line-height: 48rpx;
					display: flex;

					.label {
						width: 25%;
					}

					.value {
						width: 75%;
						color: #333;
						text-align: end;
						word-break: break-all;
					}
				}
			}

			.bottom {
				display: flex;
				flex-direction: column;
				padding: 28rpx;

				.top {
					display: flex;
					justify-content: space-between;

					.amount {
						font-size: 30rpx;
						font-family: PingFang SC-Medium, PingFang SC;
						font-weight: 500;
						color: #ed8c53;
					}

					.pay-btn {
						width: 140rpx;
						height: 60rpx;
					}
				}

				.expire-time {
					margin-top: 10rpx;
					font-size: 26rpx;
					font-family: PingFang SC-Regular, PingFang SC;
					font-weight: 400;
					color: #ff6262;
					text-align: end;
				}
			}
		}
	}
}
</style>
