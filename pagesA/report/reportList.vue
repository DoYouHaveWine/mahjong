<template>
	<view>
		<hos-card-sel @currentHosAndCard="onCurrentHosAndCard" />

		<view class="time-choose flex-box" @click="calendarShow = true">
			<view class="time-label flex-box">
				<image src="../../static/report/time.svg"></image>
				<text>时间区间选择</text>
			</view>
			<view class="time-value flex-box">
				<view class="flex-box" @click="startDateShow = true">
					<text class="time-text">{{ startDateStr }}</text>
					<u-icon name="arrow-down-fill" color="#cccccc" size="16rpx" />
				</view>
				<text class="time-division">至</text>
				<view class="flex-box" @click="endDateShow = true">
					<text class="time-text">{{ endDateStr }}</text>
					<u-icon name="arrow-down-fill" color="#cccccc" size="16rpx" />
				</view>
			</view>
		</view>
		<view class="report-content">
			<view class="report-header"><tab-list :list="tabList" @change="clickTabs" /></view>
			<view class="report-list">
				<template v-if="reportList.length">
					<view class="report-item" v-for="(item, i) in reportList" :key="i" @click="toInfo(item)">
						<view class="item-box">
							<text class="item-label">申请单号</text>
							<text class="item-value">{{ item.bizNo || '' }}</text>
						</view>
						<view class="item-box" v-if="activeValue !== 3">
							<text class="item-label">申请科室</text>
							<text class="item-value">{{ item.deptName || '' }}</text>
						</view>
						<view class="item-box">
							<text class="item-label">项目名称</text>
							<text class="item-value">{{ item.name || '' }}</text>
						</view>
						<view class="item-box">
							<text class="item-label" v-if="activeValue==3">体检日期</text>
							<text class="item-value">{{ item.sampleTime || '' }}</text>
						</view>
						<view class="item-box">
							<text class="item-label">报告时间</text>
							<text class="item-value">{{ item.reportTime || '' }}</text>
						</view>
					</view>
				</template>
				<!-- 使用弹窗Dialog是避免请求时切换tab，数据会混乱 -->
				<load-data v-else :loading="loading" isLoadingDialog />
			</view>
		</view>

		<u-datetime-picker
			:show="startDateShow"
			v-model="startDate"
			closeOnClickOverlay
			title="开始日期"
			mode="date"
			ref="sDatetimePicker"
			@confirm="startDateConfirm"
			@cancel="startDateShow = false"
		/>

		<u-datetime-picker
			:show="endDateShow"
			v-model="endDate"
			closeOnClickOverlay
			title="结束日期"
			mode="date"
			ref="eDatetimePicker"
			@confirm="endDateConfirm"
			@cancel="endDateShow = false"
		/>
	</view>
</template>

<script>
import { getDefaultCard, getHosList, getReportList, getDefaultHos } from '@/common/http/api.js';
import hosCardSel from '@/pagesA/components/hosCardSel.vue';
import tabList from '@/pagesA/components/tabList.vue';
import dayjs from 'dayjs';
export default {
	components: {
		hosCardSel,
		tabList
	},
	data() {
		return {
			loading: true,
			startDateShow: false,
			endDateShow: false,
			selCardId: '',
			selHosId: '',
			activeValue: 2,
			startDate: dayjs().subtract(1, 'year'),
			startDateStr: dayjs()
				.subtract(1, 'year')
				.format('YYYY-MM-DD'),
			endDate: dayjs(),
			endDateStr: dayjs().format('YYYY-MM-DD'),
			tabList: [
				{
					label: '检验报告',
					value: 2
				},
				{
					label: '检查报告',
					value: 1
				},
				{
					label: '体检报告',
					value: 3
				}
			],
			reportList: []
		};
	},

	watch: {
		activeValue() {
			this.fetchList();
		},
		startDateStr() {
			if (this.selHosId) {
				this.fetchList();
			}
		},
		endDateStr() {
			if (this.selHosId) {
				this.fetchList();
			}
		}
	},

	methods: {
		onCurrentHosAndCard(e) {
			this.selCardId = e.recordId;
			this.selHosId = e.hospitalId;
			this.fetchList();
		},

		clickTabs(e) {
			this.activeValue = e.value;
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

			this.startDateStr = dayjs(e.value).format('YYYY-MM-DD');
			this.startDateShow = false;
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

			this.endDateStr = dayjs(e.value).format('YYYY-MM-DD');
			this.endDateShow = false;
		},

		fetchList() {
			// 保定小程序体检报告暂时不做
			// if (this.activeValue === 3) {
			// 	this.reportList = [];
			// 	return;
			// }
			const params = {
				hospitalId: this.selHosId,
				beginDate: this.startDateStr,
				endDate: this.endDateStr,
				bizType: this.activeValue,
				recordId: this.selCardId
			};

			// 检查报告
			// const params = {
			// 	hospitalId: 53,
			// 	beginDate: '2021-10-18',
			// 	endDate: '2021-10-25',
			// 	bizType: 1,
			// 	recordId: 42
			// };

			// 检验报告（一般）
			// const params = {
			// 	hospitalId: 53,
			// 	beginDate: '2021-11-03',
			// 	endDate: '2021-11-05',
			// 	bizType: 2,
			// 	recordId: 42
			// };

			// 检验报告（药敏）
			// const params = {
			// 	hospitalId: 60,
			// 	beginDate: '2022-05-23',
			// 	endDate: '2022-05-24',
			// 	bizType: 2,
			// 	recordId: 3
			// };

			this.loading = true;
			this.reportList = [];
			getReportList(params)
				.then(({ data = [] }) => {
					this.reportList = data || [];
				})
				.finally(() => {
					this.loading = false;
				});
		},

		toInfo(item) {
			const { id, checkType } = item;
			const { activeValue } = this;
			let urlObj = {
				1: './examineInfo', // 检查报告
				2: './testInfo', // 检验报告 checkType:1(一般)、2(细菌)、3(核酸检测)、4(药敏)
				3: './phyExamineInfo' //体检
			};
			let url = urlObj[activeValue];
			if (checkType == 2) {
				url = './germInfo';
			} else if (checkType == 4) {
				url = './drugSensitiveInfo';
			}
			uni.navigateTo({
				url: `${url}?hosId=${this.selHosId}&id=${id}&recordId=${this.selCardId}`
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f5f7fa;

	.flex-box {
		display: flex;
	}
	.time-choose {
		padding: 28rpx 40rpx;
		justify-content: space-between;
		background: linear-gradient(#f9fafb80, #f9fafb80), #ffffff;
		border-radius: 0rpx 0rpx 20rpx 20rpxpx;
		font-size: 26rpx;
		.time-label {
			color: rgba(15, 20, 25, 0.3);
			align-items: center;
			> image {
				width: 32rpx;
				height: 32rpx;
				margin-right: 8rpx;
			}
		}
		.time-value {
			color: #000;

			.time-text {
				margin-right: 8rpx;
			}

			.time-division {
				font-weight: bold;
				margin: 0 20rpx;
			}
		}
	}
	.report-content {
		margin-top: 32rpx;
		.report-list {
			.report-item {
				background: #fff;
				padding: 28rpx 40rpx;
				border-bottom: 2rpx solid #e5e7eb80;
				&:last-child {
					border: none;
				}
				.item-box {
					display: flex;
					justify-content: space-between;
					font-size: 30rpx;
					margin-bottom: 6rpx;
					&:last-child {
						margin-bottom: 0;
					}
					.item-label {
						color: #9e9ea8;
						width: 160rpx;
					}
					.item-value {
						color: #333333;
						flex: 1;
						text-align: right;
					}
				}
			}
		}
	}
}
</style>
