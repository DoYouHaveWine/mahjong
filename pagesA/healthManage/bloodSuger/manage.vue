<template>
	<view>
		<view class="page-top">
			<view class="item-top"><card-sel @currentCard="onCurrentCard" /></view>
			<template v-if="!loading && recentData">
				<view class="manage-content">
					<view class="">
						<view class="category-title">
							<view class="">
								<text class="title">最近记录</text>
								<view class="title-line" />
							</view>
							<view class="more-btn" @click="$navTo(`./history?recordId=${choosedPatient.id}`)">更多</view>
						</view>
						<view class="xy-info mar-top-28">
							<view class="xy-title flex-box">
								<span :class="[recentData.class]">{{ recentData.valueName }}</span>
								<span class="time">{{ recentData.day || '' }} {{ recentData.time || '' }}</span>
							</view>
							<view class="xy-content flex-box">
								<view class="">
									<view class="xy-label">血糖值(mmol/L)</view>
									<view class="xy-num">{{ recentData.value || '' }}</view>
								</view>
								<view class="">
									<view class="xy-label">控糖目标({{ recentData.timeScopeName || '' }})</view>
									<view class="xy-num">{{ recentData.targetRange || '' }}</view>
								</view>
							</view>
						</view>
					</view>
					<view class="mar-top-28">
						<view class="category-title">
							<view class="">
								<text class="title">变化趋势</text>
								<view class="title-line" />
							</view>
						</view>
						<view class="mar-top-28 charts-box">
							<view class="charts-title flex-box">
								<span class="txt">变化趋势</span>
								<span class="charts-time">
									<uni-data-select v-model="days" :localdata="dateRangeList" iconColor="#4298ff" />
								</span>
							</view>
							<view class="charts-content">
								<qiun-data-charts
									type="line"
									:opts="opts"
									canvasId="mycanvas"
									:ontouch="true"
									:canvas2d="true"
									:chartData="chartData"
								/>
							</view>
						</view>
					</view>
				</view>
			</template>
			<load-data v-else :loading="loading" />
		</view>
		<view class="page-bottom">
			<u-button
				@click="$navTo(`./add?recordId=${choosedPatient.id}`)"
				shape="circle"
				type="primary"
				text="添加血糖记录"
				:customStyle="{ width: '90%' }"
			/>
		</view>
	</view>
</template>

<script>
import cardSel from '@/pagesA/components/cardSel.vue';
import { getRecentBloodSuger, getRecentBloodSugerCharts } from '@/common/http/api.js';
import uniDataSelect from '@/pagesA/components/uni-data-select.vue';
import dayjs from 'dayjs';
export default {
	components: {
		cardSel,
		uniDataSelect
	},
	data() {
		return {
			choosedPatient: '',
			loading: false,
			needRefreshData: false, // 是否需要刷新数据，提供给下一个页面返回数据刷新
			daysShow: false,
			recentData: '',
			emptyRange: [],
			notEmptyRange: [],
			chartData: {},
			days: 7,
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
			opts: {
				color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272'],
				padding: [0, 0, 10, 10],
				touchMoveLimit: 24,
				enableScroll: true, // x轴可滑动，需在组件上搭配:ontouch="true"才有效
				legend: { position: 'top', float: 'left', margin: 20 },
				xAxis: { itemCount: 3, scrollShow: true, scrollColor: '#dedede' },
				yAxis: { disableGrid: true },
				extra: {
					line: {
						type: 'curve',
						width: 2
					}
				}
			}
		};
	},

	watch: {
		days() {
			this.getServerData();
		}
	},

	onLoad() {
		this.emptyRange = this.constantMap.get('bloodSugerType')['EMPTINESS'].split('-');
		this.notEmptyRange = this.constantMap.get('bloodSugerType')['OTHER'].split('-');
		this.opts.xAxis.min = dayjs()
			.subtract(7, 'day')
			.date();
	},

	onShow() {
		if (this.needRefreshData) {
			this.getData();
			this.needRefreshData = false;
		}
	},

	methods: {
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

		onCurrentCard(card) {
			this.choosedPatient = card;
			this.getData();
		},

		getData() {
			const params = {
				recordId: this.choosedPatient.id
			};
			this.loading = true;
			getRecentBloodSuger(params)
				.then(({ data = '' }) => {
					if (!data) {
						this.recentData = '';
						return;
					}
					const obj = this.judge(data || {});
					this.recentData = {
						...data,
						...obj
					};
					this.getServerData();
				})
				.finally(() => (this.loading = false));
		},

		getServerData() {
			let categories = [];
			let seriesData = [];

			getRecentBloodSugerCharts({
				recordId: this.choosedPatient.id,
				days: this.days
			}).then(({ data = [] }) => {
				data.forEach(record => {
					categories.push(`${record.day.substring(5).replace('-', '/')} ${record.time}`);
					seriesData.push(record.value);
				});

				this.chartData = JSON.parse(
					JSON.stringify({
						categories,
						series: [
							{
								legendShape: 'circle',
								name: '血糖记录',
								data: seriesData
							}
						]
					})
				);
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

	.mar-top-28 {
		margin-top: 28rpx;
	}

	.flex-box {
		display: flex;
	}

	.page-top {
		/* #ifdef MP-WEIXIN */
		min-height: calc(100vh - 120rpx);
		/* #endif */

		/* #ifndef MP-WEIXIN */
		min-height: calc(100vh - 200rpx);
		/* #endif */
	}

	.page-bottom {
		padding-bottom: 20rpx;
	}

	.category-title {
		color: #333;
		font-family: PingFang SC;
		font-weight: 600;
		font-size: 30rpx;
		display: flex;
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
			color: rgba(15, 20, 25, 0.3);
		}
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

	.manage-content {
		padding: 32rpx 40rpx;

		.xy-info {
			background: #fff;
			padding: 24rpx 28rpx;
			border-radius: 20rpx;

			.xy-title {
				justify-content: space-between;
				font-size: 24rpx;
				margin-bottom: 12rpx;

				.time {
					color: rgba(15, 20, 25, 0.3);
				}
			}

			.xy-content {
				justify-content: space-between;

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

	.btn-box {
		margin-top: 48rpx;
		padding: 0 48rpx;
	}

	.charts-box {
		padding: 20rpx;
		border-radius: 20rpx;
		background: #fff;
		box-sizing: border-box;

		.charts-title {
			font-size: 24rpx;
			padding-bottom: 10rpx;
			justify-content: space-between;
			align-items: center;
			position: relative;

			.txt {
				padding-left: 16rpx;
			}

			.charts-time {
				width: 120rpx;
			}
		}

		.charts-content {
			width: 100%;
			height: 520rpx;
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
}
</style>
