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
						<view :class="[item.class]">{{ item.xyName }}</view>
					</view>
					<view class="history-content">
						<view class="flex-box block">
							<view class="">
								<view class="xy-label">心率值(bpm)</view>
								<view class="xy-nums" :class="[item.class]">{{ item.bpm || '' }}</view>
							</view>
							<view class=""></view>
							<view class="">
								<view class="xy-label">正常范围</view>
								<view class="xy-num">60~100</view>
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
import { getHisRate, deleteRateData } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			timeShow: false,
			activeTime: '',
			historyList: [],
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
		const { recordId = '' } = options;
		this.recordId = recordId;
		this.activeTime = dayjs();
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
			const { bpm } = item;
			let obj = {
				class: 'safe',
				xyName: '心率正常'
			};
			if (bpm < 60) {
				obj.class = 'lower';
				obj.xyName = '心率过缓';
			}
			if (bpm > 100) {
				obj.class = 'higher';
				obj.xyName = '心率过速';
			}
			return obj;
		},
		getData() {
			this.loading = true;
			const { recordId, month } = this;
			getHisRate({ recordId, month })
				.then(({ data = [] }) => {
					data.forEach(item => {
						const obj = this.judge(item || {});
						Object.assign(item, obj);
					});
					console.log(data);
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
			// 			deleteRateData(id)
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
					line-height: 56rpx;
				}
				.xy-nums {
					font-size: 46rpx;
					line-height: 56rpx;
				}
			}
		}
	}
}
</style>
