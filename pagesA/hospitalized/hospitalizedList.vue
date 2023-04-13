<template>
	<view>
		<hos-card-sel @currentHosAndCard="onCurrentHosAndCard" hosType="zycz" />

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

		<view class="list-box" v-if="list.length">
			<view class="item f-15" v-for="item in list" :key="item.id" @click="onItemClick(item)">
				<view class="just-between align-center ptb-5">
					<text class="fb">{{ item.hospitalName }}</text>
					<text :class="item.state == 1 ? 'leave' : 'in'">{{ item.state == 1 ? '已出院' : '住院中' }}</text>
				</view>
				<view class="just-between align-center ptb-5">
					<text class="title">就诊人</text>
					<text class="c-33">{{ item.patientName }}</text>
				</view>
				<view class="just-between align-center ptb-5">
					<text class="title">入院时间</text>
					<text class="c-33">{{ item.checkInDate }}</text>
				</view>
				<template v-if="item.state === '1'">
					<view class="just-between align-center ptb-5">
						<text class="title">出院时间</text>
						<text class="c-33">{{ item.checkOutDate }}</text>
					</view>
					<view class="just-between align-center ptb-5">
						<text class="title">住院天数</text>
						<text class="c-33">{{ item.days }}</text>
					</view>
				</template>
			</view>
		</view>

		<load-data
			v-if="!list.length || loading.isLoading"
			:loading="loading.isLoading"
			:loadingText="loading.loadingText"
			isLoadingDialog
			emptyText="暂无住院记录"
		/>

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
import { gethospitalizedList } from '../../common/http/api.js';
import dayjs from 'dayjs';
export default {
	components: {
		hosCardSel,
		uniDataSelect
	},

	data() {
		return {
			selCardId: undefined,
			loading: {
				isLoading: true,
				loadingText: '加载中...'
			},
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
				recordId: ''
			},

			list: []
		};
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
			this.loading.isLoading = true;
			this.list = [];

			// 处理无住院充值机构情况
			if (!this.form.hospitalId) {
				this.loading.isLoading = false;
				return;
			}

			const { data } = await gethospitalizedList(this.form);
			this.loading.isLoading = false;
			this.list = data || [];
		},

		/**
		 * item点击
		 * @param {Object} item
		 */
		onItemClick(item) {
			uni.navigateTo({
				url: `./hospitalizedDetails?recordId=${item.recordId}&visitId=${item.visitId}&hospitalId=${item.hospitalId}&state=${
					item.state
				}`
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
			.title {
				color: #9e9ea8;
			}
			.in {
				color: #ed8c53;
			}
			.leave {
				color: rgba(15, 20, 25, 0.3);
			}
		}
	}
}
</style>
