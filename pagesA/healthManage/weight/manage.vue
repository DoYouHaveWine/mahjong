<template>
	<view>
		<card-sel @currentCard="onCurrentCard" backgroudColor="#e6f1ff99" />

		<view class="record-content">
			<view v-if="latestRecord">
				<view>
					<view class="category-title">
						<view>
							<text class="title">最近记录</text>
							<view class="title-line" />
						</view>
						<view class="more-btn" @click="$navTo(`./history?recordId=${chooseCardId}`)">更多</view>
					</view>

					<view class="latest-record-card">
						<view class="grade-and-time">
							<text :style="{ color: BMIColor(latestRecord.bmi) }">{{ latestRecord.bmi | BMIDesc }}</text>
							<text class="time">{{ latestRecord.day }} {{ latestRecord.time }}</text>
						</view>
						<view class="grid-box">
							<view class="item">
								<view class="label">体重(KG）</view>
								<view class="value">{{ latestRecord.weight }}</view>
							</view>
							<view class="item">
								<view class="label">身高(CM）</view>
								<view class="value">{{ latestRecord.height }}</view>
							</view>
							<view class="item">
								<view class="label">BMI</view>
								<view class="value">{{ latestRecord.bmi }}</view>
							</view>
						</view>
					</view>

					<view class="bmi-tip">
						<text>BMI正常范围</text>
						<text>过低：＜18.5 正常：18.5-23.9</text>
						<text>肥胖：＞28.0 超重：24.0-27.9</text>
					</view>
				</view>

				<view class="charts-box">
					<view class="category-title">
						<view>
							<text class="title">变化趋势</text>
							<view class="title-line" />
						</view>
					</view>
					<view class="line-chart">
						<qiun-data-charts
							type="line"
							:opts="opts"
							canvasId="mycanvas"
							:canvas2d="true"
							:ontouch="true"
							:chartData="chartData"
						/>
						<view class="date-range-box">
							<uni-data-select v-model="dateRangeValue" :localdata="dateRangeList" @change="change" iconColor="#4298ff" />
						</view>
					</view>
				</view>
			</view>

			<load-data v-else :loading="loading" />
		</view>

		<view class="btn-add" v-if="!loading">
			<u-button @click="$navTo(`./add?cardId=${chooseCardId}`)" shape="circle" type="primary" text="添加体重记录" />
		</view>
	</view>
</template>

<script>
import { getLatestWeightRecord, getWeightRecordTrend } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
import uniDataSelect from '@/pagesA/components/uni-data-select.vue';
export default {
	components: {
		cardSel,
		uniDataSelect
	},

	data() {
		return {
			loading: true,
			chooseCardId: undefined,
			latestRecord: undefined,

			dateRangeList: [
				{
					value: 7,
					text: '7天'
				},
				{
					value: 30,
					text: '30天'
				}
			],
			dateRangeValue: 7,

			chartData: {},
			// 您可以通过修改 config-ucharts.js 文件中下标为 ['line'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。
			// 实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
			opts: {
				color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272'],
				padding: [0, 0, 10, 10],
				touchMoveLimit: 24,
				enableScroll: true, // x轴可滑动，需在组件上搭配:ontouch="true"才有效
				legend: { position: 'top', float: 'left', margin: 20 },
				xAxis: { itemCount: 5, scrollShow: true, scrollColor: '#dedede' },
				yAxis: { disableGrid: true },
				extra: {
					line: {
						type: 'curve',
						width: 2
					}
				}
			},

			needRefreshData: false // 是否需要刷新数据，提供给下一个页面返回数据刷新
		};
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

	onShow() {
		if (this.needRefreshData && this.chooseCardId) {
			this.getLatestWeightRecord();
			this.getWeightRecordTrend();
			this.needRefreshData = false;
		}
	},

	methods: {
		onCurrentCard(card) {
			this.chooseCardId = card.id;
			this.getLatestWeightRecord();
			this.getWeightRecordTrend();
		},

		async getLatestWeightRecord() {
			this.loading = true;
			const { data } = await getLatestWeightRecord(this.chooseCardId);
			this.latestRecord = data;
			this.loading = false;
		},

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

		change(e) {
			this.dateRangeValue = e;
			this.getWeightRecordTrend();
		},

		async getWeightRecordTrend() {
			let categories = [];
			let seriesData = [];

			const { data } = await getWeightRecordTrend({ recordId: this.chooseCardId, days: this.dateRangeValue });
			data.forEach(record => {
				categories.push(record.day.substring(5).replace('-', '/'));
				seriesData.push(record.bmi);
			});

			this.chartData = JSON.parse(
				JSON.stringify({
					categories,
					series: [
						{
							legendShape: 'circle',
							name: 'BMI',
							data: seriesData
						}
					]
				})
			);
		}
	}
};
</script>

<style lang="scss">
page {
	background: #fafafa;

	.record-content {
		/* #ifdef MP-WEIXIN */
		min-height: calc(100vh - 320rpx);
		/* #endif */

		/* #ifndef MP-WEIXIN */
		min-height: calc(100vh - 400rpx);
		/* #endif */

		.category-title {
			color: #333;
			font-family: PingFang SC;
			font-weight: 600;
			font-size: 30rpx;
			display: flex;
			margin: 20rpx 40rpx;
			justify-content: space-between;
			align-items: center;

			.title-line {
				margin-top: -16rpx;
				width: 66rpx;
				height: 16rpx;
				opacity: 0.2;
				border-radius: 60rpx;
				background: #4298ff;
			}

			.more-btn {
				font-weight: 500;
				font-size: 24rpx;
				line-height: 80rpx;
				padding: 0 40rpx;
				color: rgba(15, 20, 25, 0.3);
			}
		}

		.latest-record-card {
			background: #fff;
			padding: 24rpx 28rpx;
			margin: 0 40rpx;
			border-radius: 20rpx;

			.grade-and-time {
				display: flex;
				justify-content: space-between;
				font-size: 24rpx;
				color: #0f1419;

				.time {
					color: #0f14194d;
				}
			}

			.grid-box {
				display: flex;
				margin-top: 12rpx;

				.item {
					flex: 1;
					font-family: PingFang SC;

					.label {
						font-size: 26rpx;
						color: #0f141980;
					}

					.value {
						color: #333333;
						font-size: 46rpx;
					}
				}
			}
		}

		.bmi-tip {
			margin: 40rpx;
			display: flex;
			flex-direction: column;
			color: #0f141980;
			font-family: PingFang SC;
			font-size: 26rpx;
		}

		.charts-box {
			.line-chart {
				position: relative;
				margin: 28rpx 40rpx;
				border-radius: 20rpx;
				width: calc(100% - 80rpx);
				height: 580rpx;
				background-color: #fff;

				.date-range-box {
					width: 120rpx;
					position: absolute;
					height: 35rpx;
					top: 28rpx;
					right: 20rpx;
				}
			}
		}
	}

	// 覆盖uni-data-select样式
	.uni-select {
		.uni-select__input-box {
			background: #0065ff26;
			border-radius: 10rpx;
			min-height: 40rpx !important;

			.uni-select__input-text {
				color: #4298ff !important;
				font-size: 20rpx;
			}
		}

		.uni-select__selector {
			width: 150rpx;
			margin-left: -20rpx;
		}
	}

	.btn-add {
		padding-bottom: 48rpx;
		margin: 40rpx 50rpx;
		width: calc(100% - 100rpx);
	}
}
</style>
