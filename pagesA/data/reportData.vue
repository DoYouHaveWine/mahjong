<template>
	<view>
		<hos-date-sel @currentHosAndCard="onCurrentHosAndCard" :ifDisabled="hospitalId" :hospitalId="hospitalId" />
		<view class="num-box mt10">
			<view class="mt10 bg-white f-14 tc c-33">
				<view class="kind-box align-center">
					<text class="kind-item">检查报告:{{chartData.examineTotal||0}}</text>
					<text class="kind-item">检验报告:{{chartData.inspectionTotal||0}}</text>
					<text class="kind-item">体检报告:{{chartData.physicalExaminationTotal||0}}</text>
					<text class="kind-item">细菌培养报告:{{chartData.germTotal||0}}</text>
					<text class="kind-item">药敏试验报告:{{chartData.drugSensitivityTotal||0}}</text>
				</view>
			</view>
			<view class="charts-box bg-white mt10">
				<qiun-data-charts 
				type="line" 
				:opts="opts" 
				:chartData="chartData" 
				:ontouch="true"
				:canvas2d="true"
				canvasId="canvasreportf"
				 />
			</view>
		</view>
	</view>
</template>

<script>
	import { getReportChart } from '@/common/http/api.js';
	import hosDateSel from '@/pagesA/components/hosDateSel.vue';
	import dayjs from 'dayjs';
	export default {
		components: {
			hosDateSel
		},
		data() {
			return {
				chartData: {},
				opts: {
					color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE"],
					padding: [15, 15, 0, 5],
					enableScroll: true,
					legend: {
						show: true,
						position: "top",
						lineHeight: 25
					},
					xAxis: {
						disableGrid: true,
						scrollShow: true,
						itemCount: 4
					},
					yAxis: {
						gridType: "dash",
						dashLength: 2
					},
					extra: {
						line: {
							type: "straight",
							width: 2,
							activeType: "hollow"
						}
					}
				},
				year:undefined,
				selHosId:undefined,
				hospitalId:undefined
			};
		},

		watch: {

		},
		onLoad(options){
			this.businessType = options.businessType
			if(+options.hospitalId>0){
				this.hospitalId = options.hospitalId
			}
		},
		methods: {
			onCurrentHosAndCard(e) {
				this.year = e.year;
				this.selHosId = e.hospitalId;
				this.getServerData()
			},
			async getServerData() {
				//模拟从服务器获取数据时的延时
				const param = {
					hospitalId:this.hospitalId?this.hospitalId:this.selHosId,
					year:this.year
				}
				const {data} = await getReportChart(param)
				this.chartData = JSON.parse(JSON.stringify(data));
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #f5f7fa;

		.charts-box {
			width: 100%;
			height: calc(100vh - 200px);
		}

		.kind-box {
			display: flex;
			flex-wrap: wrap;

			.kind-item {
				width: 50%;
				padding: 10rpx 0;
			}
		}
	}
</style>
