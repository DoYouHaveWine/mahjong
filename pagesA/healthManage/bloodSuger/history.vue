<template>
	<view class="history-page">
		<view class="time-select flex-box" @click="timeShow = true">
			<text class="time">{{ month || '' }}</text>
			<u-icon name="arrow-down-fill" color="#cccccc" size="16rpx"></u-icon>
		</view>
		<view class="history-list">
			<template v-if="!loading && historyList.length != 0">
				<view class="history-item" v-for="item in historyList" :key="item.id" @longpress="deleteItem(item.id)">
					<view class="history-title flex-box">
						<view class="">
							<text class="dot"></text>
							<text class="time">{{ item.day || '' }} {{ item.time || '' }}</text>
						</view>
						<view :class="[item.class]">{{ item.valueName }}</view>
					</view>
					<view class="history-content">
						<view class="flex-box block">
							<view class="">
								<view class="xy-label">血糖值(mmol/L)</view>
								<view class="xy-num">{{ item.value || '' }}</view>
							</view>
							<view class="">
								<view class="xy-label">控糖目标({{ item.timeScopeName || '' }})</view>
								<view class="xy-num">{{ item.targetRange || '' }}</view>
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
import { getBloodSugerHistory, deleteBloodSugarData } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			timeShow: false,
			activeTime: dayjs(),
			historyList: [],
			emptyRange: [],
			notEmptyRange: [],
			recordId: '',
			needRefreshData: false // 返回时是否需要刷新数据
		};
	},

	computed: {
		month() {
			return dayjs(this.activeTime).format('YYYY-MM');
		}
	},

	onLoad(options) {
		this.emptyRange = this.constantMap.get('bloodSugerType')['EMPTINESS'].split('-');
		this.notEmptyRange = this.constantMap.get('bloodSugerType')['OTHER'].split('-');
		const { recordId = '' } = options;
		this.recordId = recordId;
		this.getData();
	},

	methods: {
		timeConfirm({ value }) {
			this.timeShow = false;
			this.$nextTick(() => {
				this.getData();
			});
		},
		judge(item) {
			const { value, timeScope } = item;
			const { emptyRange, notEmptyRange } = this;
			let minValue = timeScope === 'EMPTINESS' ? emptyRange[0] : notEmptyRange[0];
			let maxValue = timeScope === 'EMPTINESS' ? emptyRange[1] : notEmptyRange[1];
			let obj = {
				class: 'safe',
				valueName: '血糖正常',
				targetRange: timeScope === 'EMPTINESS' ? `${emptyRange[0]}-${emptyRange[1]}` : `${notEmptyRange[0]}-${notEmptyRange[1]}`
			};
			if (value < minValue) {
				obj.class = 'lower';
				obj.valueName = '血糖偏低';
			} else if (value > maxValue) {
				obj.class = 'higher';
				obj.valueName = '血糖偏高';
			}
			return obj;
		},
		getData() {
			this.loading = true;
			const { recordId, month } = this;
			getBloodSugerHistory({ recordId, month })
				.then(({ data = [] }) => {
					data.forEach(item => {
						const obj = this.judge(item || {});
						Object.assign(item, obj);
					});
					this.historyList = data || [];
				})
				.finally(() => (this.loading = false));
		},

		deleteItem(id) {
			// uni.showModal({
			// 	title: '温馨提示',
			// 	content: '您确定删除该数据',
			// 	success: res => {
			// 		if (res.confirm) {
			// 			this.loading = true;
			// 			deleteBloodSugarData(id)
			// 				.then(({ code }) => {
			// 					this.needRefreshData = true;
			// 					this.getData();
			// 				})
			// 				.catch(error => (this.loading = false));
			// 		}
			// 	}
			// });
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

	.history-page {
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
}
</style>
