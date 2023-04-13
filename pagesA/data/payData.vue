<template>
	<view>
		<hos-date-sel @currentHosAndCard="onCurrentHosAndCard" :ifDisabled="hospitalId" :hospitalId="hospitalId" />
		<view class="num-box mt10">
			<view>
				<tab-list :list="tabList" :fontsize="26" @change="clickTabs" />
			</view>
			<view class="mt10 bg-white f-14 tc c-33 ptb-10">
				<view v-if="tabItem==1" class="flex-box align-center">
					<text class="flex-item">预约总量:{{chartData.payTotalNum||0}}</text>
					<text class="flex-item">支付笔数:{{chartData.registerTotalNum||0}}</text>
					<text class="flex-item">退款笔数:{{chartData.refundTotalNum||0}}</text>
				</view>
				<view v-else class="flex-box align-center">
					<text class="flex-item">订单金额:￥{{chartData.orderTotalMoney||0}}</text>
					<text class="flex-item">交易金额:￥{{chartData.businessTotalMoney||0}}</text>
					<text class="flex-item">退款金额:￥{{chartData.refundTotalMoney||0}}</text>
				</view>
			</view>
			<view class="charts-box bg-white mt10">
				<qiun-data-charts 
				type="column" 
				:opts="opts" 
				:chartData="chartData" 
				:ontouch="true"
				:canvas2d="true"
				canvasId="canvaspayf"
				 />
			</view>
		</view>
	</view>
</template>

<script>
	import { getDetailDataChart } from '@/common/http/api.js';
	import hosDateSel from '@/pagesA/components/hosDateSel.vue';
	import tabList from '@/pagesA/components/tabList.vue';
	import dayjs from 'dayjs';
	export default {
		components: {
			hosDateSel,
			tabList
		},
		data() {
			return {
				tabList: [{
						label: '数量',
						value: 1
					},
					{
						label: '金额',
						value: 2
					}
				],
				chartData: {},
				opts: {
					color: ["#1890FF", "#91CB74", "#FAC858"],
					padding: [15, 15, 0, 5],
					enableScroll: true,
					legend: {},
					xAxis: {
						disableGrid: true,
						scrollShow: true,
						itemCount:4
					},
					yAxis: {
						data: [{
							min: 0
						}]
					},
					extra: {
						column: {
							type: "group",
							width: 20,
							activeBgColor: "#000000",
							activeBgOpacity: 0.08
						}
					}
				},
				tabItem:1,
				year:undefined,
				selHosId:undefined,
				hospitalId:undefined
			};
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
				this.getServerData(1)
			},
			async getServerData(types) {
				//模拟从服务器获取数据时的延时
				const param = {
					hospitalId:this.hospitalId?this.hospitalId:this.selHosId,
					year:this.year,
					dataType:types,
					businessType:this.businessType
				}
				const {data} = await getDetailDataChart(param)
				this.chartData = JSON.parse(JSON.stringify(data));
			},
			clickTabs(e){
				this.tabItem = e.value
				this.getServerData(e.value)
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
	}
</style>
