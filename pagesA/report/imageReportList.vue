<template>
	<view>
		<card-sel @currentCard="onCurrentCard" :defultSelCardId="selCardId" onlyShow backgroudColor="rgba(230,241,255,0.6)" />

		<view class="date-range-box">
			<uni-data-select v-model="dateRangeValue" :localdata="dateRangeList" @change="change" iconColor="#999" />

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

		<view class="list-box" v-if="list.length">
			<view class="item" v-for="item in list" :key="item.id" @click="$navTo(`./imageReportDetails?id=${item.id}`)">
				<view class="title-box">
					<text class="time">{{ item.examTime }}</text>
					<text class="num">序号：{{ item.id || '' }}</text>
				</view>

				<view class="content">
					<view>
						<text class="label">就诊医院</text>
						<text class="value">{{ item.hospitalName || '' }}</text>
					</view>
					<view>
						<text class="label">检查名称</text>
						<text class="value">{{ item.examName || '' }}</text>
					</view>
					<view>
						<text class="label">检查编号</text>
						<text class="value">{{ item.examNo || '' }}</text>
					</view>
					<view>
						<text class="label">报告时间</text>
						<text class="value">{{ item.reportTime || '' }}</text>
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
import { getImageReportList } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
import uniDataSelect from '@/pagesA/components/uni-data-select.vue';
import dayjs from 'dayjs';
export default {
	components: {
		cardSel,
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
				recordId: ''
			},

			list: []
		};
	},

	onLoad(options) {
		this.selCardId = options.cardId;
	},

	methods: {
		onCurrentCard(card) {
			this.form.recordId = card.id;
			this.fetchList();
		},

		/** 日期范围类型选择 */
		change(e) {
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
			const { data } = await getImageReportList(this.form);
			this.loading = false;
			this.list = data || [];
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f7f7fa;

	.date-range-box {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
		align-items: center;

		.uni-stat__select {
			width: 250rpx;
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

	.list-box {
		padding-bottom: 30rpx;

		.item {
			margin: 30rpx;
			border: 2px solid rgba(229, 231, 235, 0.5);
			border-radius: 20rpx;
			background-color: #fff;

			&:first-child {
				margin-top: 0;
			}

			.title-box {
				display: flex;
				height: 96rpx;
				justify-content: space-between;
				padding: 0 26rpx;
				align-items: center;
				border-bottom: 2rpx solid #f0f0f0;
				font-size: 28rpx;
				font-family: PingFang SC-Medium, PingFang SC;
				font-weight: 500;
				color: #333;

				.num {
					color: rgba(15, 20, 25, 0.2);
				}
			}

			.content {
				display: flex;
				flex-direction: column;
				padding: 28rpx 4rpx;
				margin: 0 24rpx;

				view {
					font-size: 30rpx;
					font-family: PingFang SC-Regular, PingFang SC;
					font-weight: 400;
					color: rgba(15, 20, 25, 0.5);
					line-height: 48rpx;
					display: flex;
					flex-wrap: wrap;

					.label {
						// min-width: 4rem;
						// text-align: justify;
						// text-align-last: justify;
					}

					.value {
						flex: 1;
						margin-left: 20rpx;
						color: #333;
						text-align: end;
						white-space: wrap;
						word-break: break-all;
					}
				}
			}
		}
	}
}
</style>
