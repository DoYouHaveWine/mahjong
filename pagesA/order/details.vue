<template>
	<view>
		<template v-if="info">
			<view class="page-top" :style="{ paddingBottom: info.status == 0 ? '180rpx' : '30rpx' }">
				<text class="category-title">就诊信息</text>
				<view class="content">
					<view class="item">
						<text class="label">就诊人</text>
						<text class="value">{{ info.recordName || '' }}</text>
					</view>
					<view class="item">
						<text class="label">就诊医院</text>
						<text class="value">{{ info.hospitalName || '' }}</text>
					</view>
					<view class="item">
						<text class="label">就诊卡号</text>
						<text class="value">{{ info.visitNo || '' }}</text>
					</view>
					<view class="item">
						<text class="label">项目名称</text>
						<text class="value">{{ info.title || '' }}</text>
					</view>
					<view class="item">
						<text class="label">诊疗科室</text>
						<text class="value">{{ info.deptName || '' }}</text>
					</view>
					<view class="item">
						<text class="label">就诊医生</text>
						<text class="value">{{ info.doctorName || '' }}</text>
					</view>
				</view>

				<text class="category-title">缴费项目</text>
				<view class="table-box">
					<view class="table-title">
						<text>项目名称</text>
						<text>单价</text>
						<text>数量</text>
						<text>金额</text>
					</view>

					<view v-for="item in info.items" :key="item.id" class="item">
						<text>{{ item.name }}</text>
						<text>￥{{ item.unitPrice }}</text>
						<text>x{{ item.qty }}</text>
						<text>￥{{ item.subAmount }}</text>
					</view>

					<view class="summary">
						<text>合计：</text>
						<text class="money">¥{{ info.amount || '' }}</text>
					</view>
				</view>

				<text class="category-title">订单明细</text>
				<view class="content">
					<view class="item">
						<text class="label">支付类别</text>
						<text class="value">{{ info.paymentType ? (info.paymentType == 1 ? '自费' : '医保') : '' }}</text>
					</view>
					<view class="item">
						<text class="label">订单编号</text>
						<text class="value">{{ info.orderNo || '' }}</text>
					</view>
					<view class="item">
						<text class="label">订单时间</text>
						<text class="value">{{ info.bizTime || '' }}</text>
					</view>
					<view class="item">
						<text class="label">订单状态</text>
						<text class="value">{{ constantMap.get('payStatusName')[info.status] || '' }}</text>
					</view>

					<!-- 已支付 -->
					<template v-if="info.status == 1">
						<view class="item">
							<text class="label">自费</text>
							<!-- 排除0 -->
							<text class="value">{{ info.selfPayAmt == undefined ? '' : `￥${info.selfPayAmt}` }}</text>
						</view>
						<view class="item">
							<text class="label">医保</text>
							<text class="value">{{ info.socialPayAmt == undefined ? '' : `￥${info.socialPayAmt}` }}</text>
						</view>
						<view class="item">
							<text class="label">支付时间</text>
							<text class="value">{{ info.payTime || '' }}</text>
						</view>
						<view class="item">
							<text class="label">支付流水</text>
							<text class="value">{{ info.payNo || '' }}</text>
						</view>
					</template>
				</view>

				<view class="pay-tip" v-if="info.status == 1">
					<view>缴费须知</view>
					<view>
						1、微信线上门诊诊间缴费功能，暂不支持医保患者诊间缴费，医保患者需持医保卡或医保电子凭证到自助机或激费窗口办理业务
					</view>
					<view>2、缴费成功后，如需退费，请到窗口办理退费业务，线上不办理退费业务</view>
				</view>
			</view>

			<view class="pay-box" v-if="info.status == 0">
				<view class="top">
					<text class="amount">小计：¥ {{ info.amount || '' }}</text>
					<view class="pay-btn">
						<u-button
							v-if="info.status == 0"
							type="primary"
							customStyle="height: 60rpx"
							@click="toPay"
							text="去支付"
							shape="circle"
						/>
					</view>
				</view>

				<text class="expire-time">剩余支付时间：{{ info.expireTime | timeFilter }}</text>
			</view>
		</template>

		<load-data :loading="loading.isLoading" :loadingText="loading.loadingText" isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { getClinicOrderDetails, createWxOrder } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: {
				isLoading: true,
				loadingText: '加载中...'
			},

			info: undefined,
			timer: null,
			orderId: undefined,
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
		this.orderId = options.orderId;
		this.fetchClinicOrderDetails();
	},

	onShow() {
		if (this.needRefresh) {
			this.fetchClinicOrderDetails();
		}
		this.setTimer();
	},

	onHide() {
		if (this.timer) {
			this.clearTimer();
		}
	},

	methods: {
		/** 获取订单详情 */
		async fetchClinicOrderDetails() {
			this.loading = {
				isLoading: true,
				loadingText: '加载中...'
			};
			this.info = undefined;
			let { data } = await getClinicOrderDetails(this.orderId);
			this.loading.isLoading = false;
			this.info = data;
		},

		/** 去支付 */
		toPay() {
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds: ['rak0FjbKDdHyeBcEu1mlhEbjuIxmauIvN7VyRy4xSmQ'],
				success: res => {
					console.log(res);
				},
				fail: error => {
					console.error(error);
				},
				complete: res => {
					// #endif
					this.loading = {
						isLoading: true,
						loadingText: '调起支付中...'
					};
					createWxOrder({
						id: this.info.orderId,
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
										uni.navigateTo({ url: `/pagesA/payment/paySuccess?orderId=${this.info.orderId}` });
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
				if (this.info) {
					this.info.expireTime--;
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
	background-color: #f5f7fa;

	.page-top {
		.category-title {
			font-size: 30rpx;
			display: inline-block;
			font-family: PingFang SC-Semibold, PingFang SC;
			font-weight: 600;
			color: #333;
			margin: 40rpx 0 0 40rpx;
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

		.content {
			margin: 28rpx 40rpx 0 40rpx;
			display: flex;
			flex-direction: column;
			padding: 28rpx;
			border-radius: 20rpx;
			background-color: #fff;

			.item {
				font-size: 30rpx;
				font-family: PingFang SC-Regular, PingFang SC;
				font-weight: 400;
				color: rgba(15, 20, 25, 0.5);
				line-height: 48rpx;
				display: flex;

				.label {
					// text-align: justify;
					// text-align-last: justify;
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

		.table-box {
			margin: 28rpx 40rpx 0 40rpx;
			padding: 28rpx 28rpx 22rpx 28rpx;
			border-radius: 20rpx;
			background-color: #fff;

			.table-title {
				background: rgba(230, 241, 255, 0.5);
				height: 40rpx;
				font-size: 26rpx;
				font-family: PingFang SC-Medium, PingFang SC;
				font-weight: 500;
				color: #0f1419;
				line-height: 40rpx;
				display: flex;
				padding: 4rpx;

				text {
					flex: 1;
					text-align: center;

					&:first-child {
						flex: 4;
						text-align: start;
					}
				}
			}

			.item {
				font-size: 26rpx;
				font-family: PingFang SC-Regular, PingFang SC;
				font-weight: 400;
				color: rgba(15, 20, 25, 0.6);
				line-height: 40rpx;
				display: flex;
				padding: 4rpx;
				border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);

				text {
					flex: 1;
					text-align: center;

					&:first-child {
						flex: 4;
						text-align: start;
					}
				}
			}

			.summary {
				margin-top: 22rpx;
				text-align: end;
				font-size: 26rpx;
				font-family: PingFang SC-Medium, PingFang SC;
				font-weight: 500;
				color: rgba(15, 20, 25, 0.5);

				.money {
					color: #ed8c53;
				}
			}
		}

		.pay-tip {
			font-size: 26rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: rgba(15, 20, 25, 0.5);
			margin: 32rpx 26rpx 32rpx 26rpx;
			line-height: 1.6;
		}
	}

	.pay-box {
		position: fixed;
		bottom: 0;
		width: 100%;
		background: #fff;
		border-top: 2rpx solid rgba(229, 231, 235, 0.5);
		display: flex;
		flex-direction: column;
		padding: 28rpx;
		height: 150rpx;
		box-sizing: border-box;

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
</style>
