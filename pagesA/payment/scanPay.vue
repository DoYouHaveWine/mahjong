<template>
	<view>
		<template>
			<view class="page-top" v-if="info">
				<text class="category-title">就诊信息</text>
				<view class="content">
					<view class="item">
						<text class="label">就诊人</text>
						<text class="value">{{ info.recordName || ' ' }}</text>
					</view>
					<view class="item">
						<text class="label">就诊医院</text>
						<text class="value">{{ info.hospitalName || ' ' }}</text>
					</view>
					<view class="item">
						<text class="label">就诊卡号</text>
						<text class="value">{{ info.visitNo || ' ' }}</text>
					</view>
					<view class="item">
						<text class="label">诊疗科室</text>
						<text class="value">{{ info.deptName || ' ' }}</text>
					</view>
					<view class="item">
						<text class="label">就诊医生</text>
						<text class="value">{{ info.doctorName || ' ' }}</text>
					</view>
				</view>

				<text class="category-title">缴费项目</text>
				<view class="table-box">
					<view v-for="(item,index) in info.clinicFeeList" :key="index">
						<view style="font-weight: bold;">{{item.feeType}}</view>
						<view class="table-title">
							<text>项目名称</text>
							<text>单价</text>
							<text>数量</text>
							<text>金额</text>
						</view>
						<view v-for="(child,key) in item.feeTypeList" :key="item.id" class="item">
							<text>{{ child.name }}</text>
							<text>￥{{ child.unitPrice }}</text>
							<text>x{{ child.qty }}</text>
							<text>￥{{ child.subAmount }}</text>
						</view>
					</view>
					<view class="summary">
						<text>合计：</text>
						<text class="money">¥{{ info.amount || ' ' }}</text>
					</view>
				</view>
			</view>
			<view class="pay-box">
				<view class="top">
					<view class="pay-btn" v-if="info">
						<u-button color="#F59A23" @click="toPay" :text="status == 0?'去支付':'已支付'"
							:disabled="status == 0?false:true" shape="circle" />
					</view>
				</view>
			</view>
			<load-data :loading="loading.isLoading" :loadingText="loading.loadingText" isLoadingDialog onlyShowLoading />
		</template>
	</view>
</template>

<script>
	// const jweixin = require("jweixin-module");
	import { getMsg, createWxOrder } from '@/common/http/api.js';
	export default {
		data() {
			return {
				loading: {
					isLoading: false,
					loadingText: '加载中...'
				},
				opt: undefined,
				info: undefined,
				status: undefined,
				miniLink: undefined
			};
		},
		onLoad(options) {
			const _this = this
			let formUrl = decodeURIComponent(options.q);
			console.log(formUrl)
			console.log(options.q)
			if(uni.getStorageSync('token')){
				let msgObj = this.getQueryString(formUrl)
				_this.opt = msgObj
				_this.fetchClinicOrderDetails();
			}else{//去授权
				uni.redirectTo({ url: `/pagesA/auth/auth?fromPage=scanPay&q=${options.q}` });
				return;
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
				let { data } = await getMsg(this.opt);
				this.loading.isLoading = false;
				this.info = { ...data, patientName: this.opt.patientName };
				this.status = data.status
			},

			/** 去支付 */
			toPay() {
				this.loading = {
					isLoading: true,
					loadingText: '调起支付中...'
				};
				createWxOrder({
						id: this.info.orderNo,
						payMethod: 1,
						pcReq: false,
						tradeType: 'JSAPI',
						weixinOpenid: uni.getStorageSync('openId')
					})
					.then(({ code, data }) => {
						if (code == 200) {
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: data.timeStamp,
								nonceStr: data.nonceStr,
								package: data.package,
								signType: 'MD5',
								paySign: data.paySign,
								success: payRes => {
									// 轮询请求后台检测支付的结果
									this.status = 1
									uni.showModal({
										content: '订单已支付',
										showCancel: false,
										success: function(res) {
											// uni.removeStorageSync('token')
											if (res.confirm) {
												console.log('用户点击确定');
											} else if (res.cancel) {
												console.log('用户点击取消');
											}
										}
									})
								},
								fail: payErr => {
									console.log(payErr);
								}
							});
						}
					})
					.finally(() => (this.loading.isLoading = false));
			},
			getQueryString(url) {
				if (url) {
					url = url.substr(url.indexOf("?") + 1)
				}
				var result = {},
					queryString = url || location.search.substring(1),
					re = /([^&=]+)=([^&]*)/g,
					m
				while (m = re.exec(queryString)) {
					result[decodeURIComponent(m[1])] = decodeURIComponent(m[2])
				}
				return result;
			}
		}
	};
</script>

<style lang="scss">
	page {
		background-color: #f5f7fa;

		.page-top {
			overflow-y: scroll;

			.category-title {
				font-size: 30rpx;
				display: inline-block;
				font-family: PingFang SC-Semibold, PingFang SC;
				font-weight: 600;
				color: #333;
				margin: 30rpx 0 0 40rpx;
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
					padding: 6rpx;
					margin-top: 15rpx;

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
					padding: 6rpx;
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
			width: 100%;
			display: flex;
			flex-direction: column;
			padding: 28rpx;
			box-sizing: border-box;

			.top {
				display: flex;
				justify-content: center;

				.amount {
					font-size: 30rpx;
					font-family: PingFang SC-Medium, PingFang SC;
					font-weight: 500;
					color: #ed8c53;
				}

				.pay-btn {
					width: 500rpx;
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

		.nav-box {
			display: flex;
			justify-content: center;
			padding: 0 40rpx;
		}
	}
</style>
