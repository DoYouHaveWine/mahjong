<template>
	<view>
		<hos-card-sel
			@currentHosAndCard="onCurrentHosAndCard"
			:selHosInList="false"
			:recordId="selCardId"
			hosType="zycz"
			:ifDisabled="true"
		/>

		<view class="select-box">
			<view class="date-range-box">
				<uni-data-select v-model="dateRangeValue" :localdata="dateRangeList" @change="changeDate" iconColor="#999" />

				<view class="cus-date-sel" v-if="dateRangeValue == 3">
					<view class="date-sel" @click="startDateShow = true">
						<text class="date-text">{{ startDateStr }}</text>
						<u-icon name="arrow-down-fill" color="#999" size="16rpx" />
					</view>
					<text class="date-split">至</text>
					<view class="date-sel" @click="endDateShow = true">
						<text class="date-text">{{ endDateStr }}</text>
						<u-icon name="arrow-down-fill" color="#999" size="16rpx" />
					</view>
				</view>
			</view>
		</view>

		<view class="list-box" v-if="!loading && list.length">
			<view class="item" v-for="item in list" :key="item.id" @click="onItemClick(item)">
				<view class="left">
					<view>
						<image class="icon" v-if="item.logo" :src="serverUrl + item.logo" />
						<image class="icon" v-else src="/static/social/ic_hospital.svg" />
					</view>

					<view class="name-and-time">
						<text class="name">住院充值</text>
						<text class="time">{{ item.tradeTime }}</text>
					</view>
				</view>

				<view class="right">
					<text class="num tr">{{ item.tradeAmt }}</text>
					<view class="remain-num">
						<text class="plr-5">余额</text>
						<text>{{ item.availableBalance }}</text>
					</view>
				</view>
			</view>
		</view>
		<load-data v-else :loading="loading" />

		<u-datetime-picker
			:show="startDateShow"
			v-model="startDate"
			closeOnClickOverlay
			title="开始日期"
			:minDate="minDate"
			:maxDate="maxDate"
			mode="date"
			@confirm="startDateConfirm"
			@cancel="startDateShow = false"
		/>

		<u-datetime-picker
			:show="endDateShow"
			v-model="endDate"
			:minDate="minDate"
			:maxDate="maxDate"
			closeOnClickOverlay
			title="结束日期"
			mode="date"
			@confirm="endDateConfirm"
			@cancel="endDateShow = false"
		/>
	</view>
</template>

<script>
import hosCardSel from '@/pagesA/components/hosCardSel.vue';
import uniDataSelect from '@/pagesA/components/uni-data-select.vue';
import { getHosedRechargelist } from '@/common/http/api.js';

import dayjs from 'dayjs';
export default {
	components: {
		hosCardSel,
		uniDataSelect
	},

	data() {
		return {
			selCardId: undefined,
			loading: true,
			dateRangeList: [
				{ value: 0, text: '近三个月' },
				{ value: 1, text: '近六个月' },
				{ value: 2, text: '近一年' },
				{ value: 3, text: '自定义' }
			],
			dateRangeValue: 0,
			minDate: dayjs()
				.subtract(3, 'year')
				.valueOf(),
			maxDate: dayjs().valueOf(),
			startDateShow: false,
			startDate: dayjs()
				.subtract(3, 'month')
				.valueOf(),
			startDateStr: dayjs()
				.subtract(3, 'month')
				.format('YYYY-MM-DD'),
			endDateShow: false,
			endDate: dayjs().valueOf(),
			endDateStr: dayjs().format('YYYY-MM-DD'),

			form: {
				beginDay: dayjs()
					.subtract(3, 'month')
					.format('YYYY-MM-DD'),
				endDay: dayjs().format('YYYY-MM-DD'),
				hospitalId: '',
				recordId: '',
				visitId: '',
				orderId: ''
			},

			list: []
		};
	},
	onLoad(options) {
		this.selCardId = options.recordId;
		this.form.visitId = options.visitId;
		this.form.orderId = options.orderId;
	},
	methods: {
		onCurrentHosAndCard(e) {
			this.form.recordId = e.recordId;
			this.form.hospitalId = e.hospitalId;
			this.fetchList();
		},

		/** 日期范围类型选择 */
		changeDate(e) {
			this.dateRangeValue = e;
			this.form.beginDay = dayjs().format('YYYY-MM-DD');
			switch (e) {
				case 0:
					this.form.beginDay = dayjs()
						.subtract(3, 'month')
						.format('YYYY-MM-DD');
					break;

				case 1:
					this.form.beginDay = dayjs()
						.subtract(6, 'month')
						.format('YYYY-MM-DD');
					break;

				case 2:
					this.form.beginDay = dayjs()
						.subtract(1, 'year')
						.format('YYYY-MM-DD');
					break;
				case 3:
					this.startDateStr = this.form.beginDay = dayjs(e.value).format('YYYY-MM-DD');
					break;
			}
			this.fetchList();
		},

		/** 开始日期选择
		 * @param {Object} e
		 */
		startDateConfirm(e) {
			if (dayjs(e.value).isAfter(dayjs(this.endDateStr))) {
				uni.showToast({
					title: '开始日期必须小于结束日期',
					icon: 'none'
				});
				return;
			}

			this.startDateStr = this.form.beginDay = dayjs(e.value).format('YYYY-MM-DD');
			this.startDateShow = false;
			this.fetchList();
		},

		/** 结束日期选择
		 * @param {Object} e
		 */
		endDateConfirm(e) {
			if (dayjs(this.startDateStr).isAfter(dayjs(e.value))) {
				uni.showToast({
					title: '开始日期必须小于结束日期',
					icon: 'none'
				});
				return;
			}

			this.endDateStr = this.form.endDay = dayjs(e.value).format('YYYY-MM-DD');
			this.endDateShow = false;
			this.fetchList();
		},

		/** 请求获取列表 */
		async fetchList() {
			this.loading = true;
			this.list = [];
			const { data } = await getHosedRechargelist(this.form);
			this.loading = false;
			this.list = data || [];
		},

		/**
		 * item点击
		 * @param {Object} item
		 */
		onItemClick(item) {
			uni.navigateTo({
				url: `./rechargeDetails?orderId=${item.id}`
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f7f7fa;

	.select-box {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
		align-items: center;

		.date-range-box {
			display: flex;

			.uni-stat__select {
				width: 160rpx;
				background-color: #f7f7fa;

				.uni-select__input-text {
					color: #666;
					font-size: 26rpx;
				}
			}

			.cus-date-sel {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				margin-left: -10rpx;

				.date-split {
					color: #000;
					font-weight: bold;
				}

				.date-sel {
					margin: 0 10rpx;
					display: flex;
					align-items: center;
					color: #666;

					.date-text {
						margin-right: 10rpx;
					}
				}
			}
		}

		.type-select {
			.uni-stat__select {
				width: 120rpx;
				background-color: rgba(229, 231, 235, 0.5);
				border-radius: 8rpx;

				.uni-select__input-box {
					min-height: 56rpx;
				}

				.uni-select__input-text {
					color: #666;
					font-size: 26rpx;
				}
			}
		}
	}

	.list-box {
		padding-bottom: 30rpx;

		.item {
			padding: 38rpx;
			border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);
			background-color: #fff;
			display: flex;
			justify-content: space-between;

			.left {
				display: flex;
				.icon {
					width: 92rpx;
					height: 92rpx;
				}

				.name-and-time {
					margin-left: 30rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					font-family: PingFang SC-Regular, PingFang SC;
					font-weight: 400;

					.name {
						font-size: 30rpx;
						color: #000;
					}

					.time {
						font-size: 26rpx;
						color: rgba(15, 20, 25, 0.3);
					}
				}
			}

			.right {
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				font-family: PingFang SC-Regular, PingFang SC;
				font-weight: 400;

				.num {
					font-size: 30rpx;
					color: #13b97d;
				}

				.remain-num {
					margin-left: 4rpx;
					font-size: 26rpx;
					color: rgba(15, 20, 25, 0.5);

					text {
						font-size: 26rpx;
						color: rgba(15, 20, 25, 1);
					}
				}
			}
		}
	}
}
</style>
