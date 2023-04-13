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
								<text :class="[recentData.class]">{{ recentData.xyName }}</text>
								<text class="time">{{ recentData.day || '' }} {{ recentData.time || '' }}</text>
							</view>
							<view class="just-between align-center">
								<view class="">
									<view class="xy-label">心率(bpm)</view>
									<view class="xy-num">{{ recentData.bpm || '' }}</view>
								</view>
								<view class="">
									<view class="xy-label">正常范围</view>
									<view class="xy-num">60~100</view>
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
								<text class="txt">变化趋势</text>
								<text class="charts-time">
									<uni-data-select v-model="days" :localdata="dateRangeList" iconColor="#4298ff" />
								</text>
								<!-- <text class="charts-time flex-box" @click="daysShow=true">
									<text>{{ days || '' }}天</text>
									<u-icon name="arrow-down" color="#4298ff" size="16rpx"></u-icon>
								</text> -->
							</view>
							<view class="charts-content">
								<qiun-data-charts
									type="area"
									canvasId="mycanvas"
									:canvas2d="true"
									:ontouch="true"
									:opts="opts"
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
				text="添加心率记录"
				:customStyle="{ width: '90%' }"
			/>
		</view>
		<u-picker :show="daysShow" :columns="columns" @confirm="daysChoose" @cancel="daysShow = false"></u-picker>
	</view>
</template>

<script>
import cardSel from '@/pagesA/components/cardSel.vue';
import { getRecentRate, getRateTrend } from '@/common/http/api.js';
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
				color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc'],
				padding: [15, 0, 0, 0],
				legend: { position: 'top', float: 'left', margin: 20 },
				touchMoveLimit: 24,
				enableScroll: true, // x轴可滑动，需在组件上搭配:ontouch="true"才有效
				xAxis: {
					disableGrid: true,
					scrollShow: true,
					itemCount: 5,
					scrollColor: '#dedede'
				},
				yAxis: {
					gridType: 'dash',
					dashLength: 2
				},
				extra: {
					area: {
						type: 'curve',
						opacity: 0.2,
						addLine: true,
						width: 2,
						gradient: true
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

	onShow() {
		if (this.needRefreshData) {
			this.getData();
			this.needRefreshData = false;
		}
	},

	methods: {
		daysChoose({ value }) {
			this.days = value[0];
			this.daysShow = false;
			this.getServerData();
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
		getSelData(obj) {},
		onCurrentCard(card) {
			this.choosedPatient = card;
			this.getData();
		},
		getData() {
			this.loading = true;
			getRecentRate(this.choosedPatient.id)
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
			const params = {
				recordId: this.choosedPatient.id,
				days: this.days
			};
			getRateTrend(params).then(({ data = [] }) => {
				let res = {
					categories: [],
					series: [
						{
							legendShape: 'circle',
							name: '心率',
							data: []
						}
					]
				};
				data.forEach(({ day = '', bpm = 0 }) => {
					res.categories.push(day.substring(5).replace('-', '/'));
					res.series[0].data.push(bpm);
				});
				this.chartData = JSON.parse(JSON.stringify(res));
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

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
	.mar-top-28 {
		margin-top: 28rpx;
	}
	.flex-box {
		display: flex;
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
					line-height: 56rpx;
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
