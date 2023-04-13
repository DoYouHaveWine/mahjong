<template>
	<view class="page">
		<view v-if="hosedObj.id">
			<text class="title">充值信息</text>
			<view class="card">
				<view class="item">
					<text class="label">就诊人</text>
					<text class="value">{{ hosedObj.patientName }}</text>
				</view>

				<view class="item">
					<text class="label">就诊医院</text>
					<text class="value">{{ hosedObj.hospitalName }}</text>
				</view>

				<view class="item">
					<text class="label">就诊卡号</text>
					<text class="value">{{ hosedObj.cardNo }}</text>
				</view>
			</view>

			<text class="title">充值金额</text>
			<view class="card">
				<view class="remain-num f-15">
					可用余额
					<text class="card-balance">{{ hosedObj.depositFeeBalance }}</text>
					<text v-if="hosedObj.depositFeeBalance != undefined">元</text>
				</view>
				<view class="remain-num f-12 mt5">
					住院总费用￥{{ hosedObj.feeTotal }}
					<text class="plr-20">押金金额￥{{ hosedObj.depositFeeTotal }}</text>
				</view>
				<view class="input-box">
					<input placeholder="请输入充值金额" type="digit" v-model="rechargeAmount" @input="onInput" />
					<text>元</text>
				</view>

				<view class="list">
					<view class="item" v-for="(item, index) in numList" :key="index" @click="onRechargeNumChoosed(item)">
						<text>{{ item.label }}</text>
						<view class="choosed" v-if="rechargeAmount == item.value">
							<u-icon name="checkmark" size="20rpx" color="#fff" />
						</view>
					</view>
				</view>
			</view>

			<u-button
				text="立即充值"
				type="primary"
				shape="circle"
				customStyle="margin-top:64rpx;height:112rpx"
				@click="recharge"
				:disabled="!rechargeAmount || rechargeAmount <= 0 || loading.isLoading"
			/>
			<view class="recharge-record" @click="$navTo(`./rechargeList?recordId=${chooseCard.id}&visitId=${hosedObj.visitId}`)">
				<text>充值记录</text>
			</view>
		</view>

		<load-data v-else :loading="loading.isLoading" :emptyText="loading.emptyText" :loadingText="loading.loadingText" isLoadingDialog />
	</view>
</template>

<script>
import { gethospitalizedDetails, rechargeHosed } from '@/common/http/api.js';
export default {
	data() {
		return {
			chooseHos: {},
			chooseCard: {},
			hosedObj: {},
			rechargeAmount: '',
			numList: [
				{ label: '50元', value: 50 },
				{ label: '100元', value: 100 },
				{ label: '200元', value: 200 },
				{ label: '500元', value: 500 },
				{ label: '1000元', value: 1000 },
				{ label: '1500元', value: 1500 }
			],
			loading: {
				isLoading: true,
				loadingText: '加载中...',
				emptyText: ''
			}
		};
	},

	onLoad(options) {
		const { hospitalId, hospitalName, cardId } = options;
		this.chooseHos = { id: hospitalId, name: hospitalName };
		this.chooseCard = { id: cardId };

		this.fetchCardBalance();
	},

	methods: {
		/** 获取卡内余额 */
		async fetchCardBalance() {
			this.loading = { isLoading: true, loadingText: '加载中...' };
			const form = {
				recordId: this.chooseCard.id,
				hospitalId: this.chooseHos.id
			};
			const { data } = await gethospitalizedDetails(form);
			this.loading.isLoading = false;
			this.loading.emptyText = `当前就诊人在${this.chooseHos.name}没有在院记录`;
			this.hosedObj = data;
		},

		/** 金额选择回调 */
		onRechargeNumChoosed(item) {
			this.rechargeAmount = item.value;
		},

		/** 金额输入监听，主要目的是保留两位小数 */
		onInput(e) {
			let { value } = e.detail;
			if (value) {
				// 正则表达试
				value = value.match(/^\d*(\.?\d{0,2})/g)[0] || null;
				// 重新赋值
				this.$nextTick(() => {
					this.rechargeAmount = value;
				});
			}
		},

		/** 充值 */
		recharge() {
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds: ['d7mTZeTfn0KteNwiu6CyKp3iE4p1Vv4P_4krGstrpIQ','2i8UnbiOCJNefNfJkyoutPOoSv7i-XbCswjsVRG_C3U'],
				success: res => {
					console.log('success');
					console.log(res);
				},
				fail: error => {
					console.log('fail');
					console.error(error);
				},
				complete: async res => {
					// #endif
					this.loading = {
						isLoading: true,
						loadingText: '充值中...'
					};
					rechargeHosed({
						hospitalId: this.chooseHos.id,
						payAmount: this.rechargeAmount,
						recordId: this.chooseCard.id
					})
						.then(({ code, data }) => {
							if (code == 200) {
								this.loading.isLoading = false;
								// 这里延时0.5s的目的是等待加载框关闭，否则会出现白块
								setTimeout(
									() =>
										uni.requestPayment({
											provider: 'wxpay',
											timeStamp: data.data.timeStamp,
											nonceStr: data.data.nonceStr,
											package: data.data.package,
											signType: 'MD5',
											paySign: data.data.paySign,
											success: res => {
												uni.navigateTo({
													url: `./success?orderId=${data.orderId}&recordId=${this.chooseCard.id}`
												});
											},
											fail: err => {
												console.error('fail:' + JSON.stringify(err));
											}
										}),
									500
								);
							}
						})
						.catch(() => (this.loading.isLoading = false));
					// #ifdef MP-WEIXIN
				}
			});
			// #endif
		},
		toRechargeList(obj) {
			uni.navigateTo({
				url: `./rechargeList?recordId=${obj.recordId}&visitId=${obj.visitId}`
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.page {
		padding: 40rpx;

		.title {
			font-size: 30rpx;
			font-family: PingFang SC-Semibold, PingFang SC;
			font-weight: 600;
			color: #333;
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

		.card {
			padding: 20rpx;
			background-color: #fff;
			border-radius: 20rpx;
			margin: 28rpx 0 40rpx 0;

			.item {
				flex-wrap: wrap;
				display: flex;
				font-family: PingFang SC-Regular, PingFang SC;
				font-weight: 400;
				margin: 10rpx 0;
				font-size: 30rpx;

				.label {
					width: 25%;
					color: #9e9ea8;
				}

				.value {
					width: 75%;
					color: #333;
					word-wrap: break-word;
					text-align: end;
				}
			}

			.remain-num {
				font-family: PingFang SC-Medium, PingFang SC;
				font-weight: 500;
				color: rgba(15, 20, 25, 0.5);

				.card-balance {
					color: #ff5c5c;
					font-weight: bold;
					margin: 0 4rpx;
				}
			}

			.input-box {
				margin-top: 26rpx;
				display: flex;
				align-items: center;

				input {
					flex: 1;
					height: 80rpx;
					padding: 4rpx 10rpx;
					box-sizing: border-box;
					background-color: #f9fafb;
					border-radius: 12rpx;
					font-size: 28rpx;
				}

				text {
					margin-left: 10rpx;
					font-size: 26rpx;
					font-family: PingFang SC-Medium, PingFang SC;
					font-weight: 500;
					color: rgba(15, 20, 25, 0.5);
				}
			}

			.list {
				margin-top: 20rpx;
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				justify-content: space-around;

				.item {
					width: 30%;
					background-color: #e6f1ff;
					text-align: center;
					line-height: 80rpx;
					height: 80rpx;
					border-radius: 12rpx;
					position: relative;

					text {
						width: 100%;
					}

					.choosed {
						width: 0;
						height: 0;
						position: absolute;
						right: 0;
						bottom: 0;
						border-top: 20rpx solid #e6f1ff;
						border-bottom: 20rpx solid #4298ff;
						border-left: 20rpx solid #e6f1ff;
						border-right: 20rpx solid #4298ff;
					}
				}
			}
		}

		.recharge-record {
			margin-top: 28rpx;
			display: flex;
			justify-content: center;

			text {
				text-decoration: underline;
				color: #4298ff;
				font-size: 28rpx;
				font-family: PingFang SC-Medium, PingFang SC;
				font-weight: 500;
			}
		}
	}
}
</style>
