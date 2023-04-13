<template>
	<view>
		<view class="time-select flex-box" @click="timeShow = true">
			<text class="time">{{ month || '' }}</text>
			<u-icon name="arrow-down-fill" color="#cccccc" size="16rpx" />
		</view>

		<view class="history-list">
			<template v-if="!loading && historyList.length">
				<view class="history-item" v-for="item in historyList" :key="item.id" @longpress="deleteItem(item.id)">
					<view class="history-title flex-box">
						<view class="">
							<text class="dot"></text>
							<text class="time">{{ item.day || '' }} {{ item.time || '' }}</text>
						</view>
						<view :style="{ color: BMIColor(item.bmi) }">{{ item.bmi | BMIDesc }}</view>
					</view>
					<view class="history-content">
						<view class="flex-box block">
							<view class="">
								<view class="xy-label">身高(cm)</view>
								<view class="xy-num">{{ item.height || '' }}</view>
							</view>
							<view class="">
								<view class="xy-label">体重(kg)</view>
								<view class="xy-num">{{ item.weight || '' }}</view>
							</view>
							<view class="">
								<view class="xy-label">BMI</view>
								<view class="xy-num">{{ item.bmi || '' }}</view>
							</view>
						</view>
					</view>
				</view>
			</template>

			<load-data v-else :loading="loading" />
		</view>

		<u-datetime-picker
			:show="timeShow"
			v-model="activeTime"
			closeOnClickOverlay
			title="选择月份"
			mode="year-month"
			ref="timePicker"
			@confirm="timeConfirm"
			@cancel="timeShow = false"
		/>
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { getWeightHistoryList, deleteWeightData } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			timeShow: false,
			activeTime: '',
			historyList: [],
			systolicRange: [],
			diastolicRange: [],
			recordId: '',
			needRefreshData: false // 返回时是否需要刷新数据
		};
	},

	computed: {
		month() {
			return dayjs(this.activeTime).format('YYYY-MM');
		}
	},

	filters: {
		BMIDesc(bmi) {
			if (bmi < 18.5) {
				return '体重过低';
			} else if (bmi < 23.9) {
				return '体重正常';
			} else if (bmi < 28) {
				return '体重偏高';
			} else {
				return '体重超重';
			}
		}
	},

	onLoad(options) {
		this.systolicRange = this.constantMap.get('xyType')['systolicRange'].split('-');
		this.diastolicRange = this.constantMap.get('xyType')['diastolicRange'].split('-');
		const { recordId = '' } = options;
		this.recordId = recordId;
		this.activeTime = dayjs();
		this.getData();
	},

	methods: {
		BMIColor(bmi) {
			if (bmi < 18.5) {
				return '#f0ad4e';
			} else if (bmi < 23.9) {
				return '#01b09a';
			} else if (bmi < 28) {
				return '#f0ad4e';
			} else {
				return '#dd524d';
			}
		},

		timeConfirm({ value }) {
			this.timeShow = false;
			this.$nextTick(() => {
				this.getData();
			});
		},

		getData() {
			this.loading = true;
			const { recordId, month } = this;
			getWeightHistoryList({ recordId, month })
				.then(({ data = [] }) => {
					this.historyList = data || [];
				})
				.finally(() => (this.loading = false));
		},

		deleteItem(id) {
			uni.showModal({
				title: '温馨提示',
				content: '您确定删除该数据',
				success: res => {
					if (res.confirm) {
						this.loading = true;
						deleteWeightData(id)
							.then(({ code }) => {
								this.needRefreshData = true;
								this.getData();
							})
							.catch(error => (this.loading = false));
					}
				}
			});
		}
	},

	onUnload() {
		// 返回时，监听是否删除过数据，删除过需要刷新manager页面
		if (this.needRefreshData) {
			let pages = getCurrentPages();
			let prevPage = pages[pages.length - 2]; // 上一页
			prevPage.$vm.needRefreshData = true;
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

	.flex-box {
		display: flex;
	}
	.time-select {
		height: 88rpx;
		border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);
		background: #fff;
		line-height: 32rpx;
		align-items: center;
		justify-content: center;
		.time {
			font-size: 26rpx;
			color: #000000;
			font-weight: bold;
			margin-right: 20rpx;
		}
	}
	.history-list {
		padding: 32rpx 40rpx;
		.dot {
			display: inline-block;
			border-radius: 50%;
			width: 16rpx;
			height: 16rpx;
			background: #4298ff;
			margin-right: 10rpx;
		}
		.safe {
			color: #01b09a;
		}
		.higher {
			color: #f66201;
		}
		.lower {
			color: #fc9b4f;
		}
		.history-item {
			margin-bottom: 32rpx;
			&:last-child {
				margin-bottom: 0;
			}
		}
		.history-title {
			justify-content: space-between;
			font-size: 24rpx;
			.time {
				color: rgba(15, 20, 25, 0.3);
			}
		}
		.history-content {
			margin-top: 8rpx;
			border-radius: 20rpx;
			padding-left: 26rpx;
			.block {
				justify-content: space-between;
				padding: 24rpx 28rpx;
				background: #fff;
				.xy-label {
					font-size: 26rpx;
					color: rgba(15, 20, 25, 0.5);
				}
				.xy-num {
					font-size: 46rpx;
					color: #333333;
					line-height: 62rpx;
				}
			}
		}
	}
}
</style>
