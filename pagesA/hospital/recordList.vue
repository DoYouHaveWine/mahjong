<template>
	<view class="record-page">
		<hos-card-sel @currentHosAndCard="onCurrentHosAndCard" />

		<view class="record-list">
			<template v-if="recordList.length">
				<view class="record-item" v-for="item in recordList" :key="item.orderId">
					<view class="record-head flex-box al-c">
						<view>
							<text class="normal-text">订单号：</text>
							<text class="spec-text">{{ item.orderNo || '' }}</text>
						</view>
						<view :class="['status-text', statusClass[item.status]]">{{ constantMap.get('payStatusName')[item.status] }}</view>
					</view>
					<view class="record-body" @click="$navTo(`./recordInfo?id=${item.orderId}`)">
						<view class="img-box flex-box al-c">
							<image class="avatar" v-if="item.doctorAvatar" :src="serverUrl + item.doctorAvatar" />
							<image class="avatar" v-else src="../static/hospital/ic_doctor.svg" />
							<view class="info">
								<view class="base spec-text">
									<text>{{ item.doctorName || '' }}</text>
									<text>{{ item.deptName || '' }}</text>
								</view>
								<view class="hos-name">{{ item.hospitalName || '' }}</view>
							</view>
						</view>
						<view class="list-item normal-text">就诊人：{{ item.recordName || '' }}</view>
						<view class="list-item normal-text">挂号费用：¥{{ item.amount || 0 }}</view>
						<view class="list-item normal-text">就诊时间：{{ item.treatTime || '' }}</view>
					</view>
					<view class="record-foot flex-box">
						<view class="">
							<text class="txt" v-if="item.expireTime > 0 && (item.status == 0 || item.status == 9)">
								{{ remainingTime(item.expireTime) }} 内未支付将自动取消订单
							</text>
						</view>
						<view class="flex-box btn-box">
							<template>
								<u-button
									type="error"
									text="取消"
									size="mini"
									shape="circle"
									customStyle="height:60rpx;width:120rpx"
									v-if="item.status == 0 || item.status == 7 || item.status == 8 || item.status == 9 || item.status == 13"
									@click="toPage(item, 1)"
								/>
								<u-button
									type="primary"
									text="去支付"
									size="mini"
									shape="circle"
									v-if="item.status == 0 || item.status == 8 || item.status == 9"
									:color="item.status == 8 ? '#aaa' : ''"
									customStyle="height:60rpx;width:120rpx;margin-left:10rpx"
									@click="toPage(item, 2)"
								/>
								<u-button
									type="warning"
									size="mini"
									text="退款"
									hairline="false"
									shape="circle"
									customStyle="height:60rpx;width:120rpx;margin-left:10rpx"
									v-if="item.status == 1 && item.isNumberOver == 1 && item.amount > 0"
									:color="item.refundFee == 2 ? '#aaa' : ''"
									@click="toPage(item, 4)"
								/>
								<u-button
									v-if="item.status != 0 && item.status != 4 && item.status != 7 && item.status != 8 && item.status != 9"
									type="primary"
									customStyle="height:60rpx;width:120rpx;margin-left:10rpx"
									text="再次预约"
									shape="circle"
									size="mini"
									@click="toPage(item, 3)"
								/>
							</template>
						</view>
					</view>
				</view>
			</template>

			<load-data
				v-if="!recordList.length || loading.isLoading"
				:loading="loading.isLoading"
				:loadingText="loading.loadingText"
				isLoadingDialog
			/>
		</view>

		<u-modal
			:show="cancelModel"
			title="提示"
			@confirm="cancelConfirm"
			@cancel="cancelModel = false"
			content="是否取消预约"
			:showCancelButton="true"
		/>

		<u-modal
			:show="sefModel"
			title="提示"
			@confirm="sefConfirm"
			@cancel="sefModel = false"
			content="是否退号退款"
			:showCancelButton="true"
		/>

		<u-notify ref="uNotify" />
	</view>
</template>

<script>
import { getRegisterRecordList, cancel, setRef } from '@/common/http/api.js';
import hosCardSel from '@/pagesA/components/hosCardSel.vue';
export default {
	components: { hosCardSel },
	data() {
		return {
			loading: {
				isLoading: true,
				loadingText: '加载中...'
			},
			selHosId: '',
			selCardId: '',
			recordList: [],
			statusClass: {
				0: 'warning', // 未支付
				1: 'success', // 已付款
				2: 'error', // 已退款
				3: 'cancel', // 已取消
				4: 'warning', // 退款中
				5: 'cancel', // 已过期
				6: 'error', // 退款失败
				7: 'warning', // 线下未支付
				8: 'warning', // 未到就诊日不允许支付;
				9: 'success', // 到了就诊日允许支付
				10: 'success', // 已完成
				11: 'error', // 支付异常
				12: 'warning', // 支付中
				13: 'success' // 0元订单预约成功(预约成功)
			},
			cancelModel: false,
			activeItem: '',
			sefModel: false,
			timer: null
		};
	},

	onShow() {
		this.timer && this.fetchList(); // 挂后台后重新进入必须得重新请求时间计时
	},

	onHide() {
		this.timer && this.clearTimer();
	},

	methods: {
		onCurrentHosAndCard(e) {
			this.selCardId = e.recordId;
			this.selHosId = e.hospitalId;
			this.getData();
		},

		getData() {
			const { selHosId, selCardId } = this;
			const params = {
				hospitalId: selHosId,
				recordId: selCardId
			};
			this.loading = {
				isLoading: true,
				loadingText: '加载中...'
			};
			this.recordList = [];
			getRegisterRecordList(params)
				.then(({ data = [] }) => {
					this.recordList = data;
					this.setTimer();
				})
				.finally(() => (this.loading.isLoading = false));
		},

		/**
		 * 将剩余的秒数转换为天小时分秒
		 * @param {Object} remainTime 剩余的秒数
		 */
		remainingTime(remainTime) {
			if (remainTime < 0) return 0;
			let dates = Math.floor(remainTime / (24 * 3600));
			let hours = Math.floor((remainTime % (24 * 3600)) / 3600);
			let minutes = Math.floor((remainTime % 3600) / 60);
			let seconds = remainTime % 60;
			let dateStr = dates == 0 ? '' : `${dates}天`;
			let hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
			let minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
			let secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
			// return `${dateStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
			return `${minutesStr}:${secondsStr}`;
		},

		cancelConfirm() {
			const { orderId } = this.activeItem;
			this.cancelModel = false;
			this.loading = {
				isLoading: true,
				loadingText: '取消中...'
			};
			cancel(orderId)
				.then(({ code }) => {
					if (code === 200) {
						this.$refs.uNotify.show({
							message: `取消预约成功`,
							type: 'success',
							duration: '2000'
						});
						this.getData();
					}
				})
				.finally(() => (this.loading.isLoading = false));
		},

		sefConfirm() {
			const { orderId } = this.activeItem;
			this.sefModel = false;
			this.loading = {
				isLoading: true,
				loadingText: '退款中...'
			};
			setRef({ id: orderId })
				.then(({ code }) => {
					if (code === 200) {
						this.$refs.uNotify.show({
							message: `退号退款成功`,
							type: 'success',
							duration: '2000'
						});
						this.getData();
					}
				})
				.finally(() => (this.loading.isLoading = false));
		},

		toPage(item, type) {
			this.activeItem = item;
			if (type === 1) {
				this.cancelModel = true;
			} else if (type === 2) {
				if (item.status === 8) {
					uni.showToast({
						title: '还未到就诊日期，暂时无法支付',
						icon: 'none',
						duration: 3000
					});
				} else {
					uni.navigateTo({
						url: `./pay?orderId=${item.orderId}&&status=${item.status}`
					});
				}
			} else if (type === 3) {
				uni.navigateTo({
					url: `./doctorList?hospitalId=${item.hospitalId}&deptId=${item.deptId}&doctorName=${item.doctorName}`
				});
			} else if (type === 4) {
				if (item.refundFee == 2) {
					uni.showToast({
						title: '当前暂不支持线上退费业务，如需退费，请到窗口办理退费',
						icon: 'none',
						duration: 3000
					});
				} else {
					this.sefModel = true;
				}
			}
		},

		/** 设置定时器 */
		setTimer() {
			this.timer = setInterval(() => {
				if (this.recordList) {
					this.recordList = this.recordList.map(element => {
						element.expireTime--;
						if (element.expireTime == 0) {
							this.getData();
						}
						return element;
					});
				}
			}, 1000);
		},

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

	.record-page {
		/deep/.u-button__text {
			font-size: 24rpx !important;
		}
	}
	.flex-box {
		display: flex;
	}
	.al-c {
		align-items: center;
	}
	.normal-text {
		color: #606266;
	}
	.spec-text {
		color: #303133;
	}
	.status-text {
		color: #303133;
		border-radius: 24rpx;
		padding: 4rpx 15rpx;
		font-size: 28rpx;
	}
	.record-list {
		padding: 24rpx;
		.record-item {
			padding: 22rpx;
			background: #fff;
			border-radius: 24rpx;
			margin-bottom: 24rpx;
			&:last-child {
				margin-bottom: 0;
			}
			.record-head {
				justify-content: space-between;
				font-size: 28rpx;
				.warning {
					color: #f9ae3d;
				}
				.error {
					color: #f56c6c;
				}
				.success {
					color: #5ac725;
				}
				.cancel {
					color: rgba(15, 20, 25, 0.2);
				}
			}
			.record-body {
				border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);
				border-top: 2rpx solid rgba(229, 231, 235, 0.5);
				padding: 16rpx 0;
				margin: 16rpx 0;
				.avatar {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					margin-right: 40rpx;
				}
				.info {
					.base {
						font-size: 32rpx;
						> text {
							margin-right: 12rpx;
						}
					}
					.hos-name {
						margin-top: 6rpx;
						font-size: 28rpx;
						color: #909399;
					}
				}
				.img-box {
					margin-bottom: 24rpx;
				}
				.list-item {
					font-size: 26rpx;
					margin-bottom: 6rpx;
					&:last-child {
						margin-bottom: 0;
					}
				}
			}
			.record-foot {
				justify-content: space-between;
				.txt {
					flex: 1;
					font-size: 24rpx;
				}
				.btn-box {
					flex-wrap: wrap;
					justify-content: flex-end;

					/deep/.u-button--square {
						margin: 0;
						margin-left: 8rpx;
						margin-bottom: 5rpx;
						&:first-child {
							margin-left: 0;
						}
						&:last-child {
							margin-bottom: 0;
						}
					}
				}
			}
		}
	}
}
</style>
