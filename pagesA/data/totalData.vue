<template>
	<view>
		<hos-date-sel @currentHosAndCard="onCurrentHosAndCard" :ifDisabled="hospitalId" :hospitalId="hospitalId" />
		<view class="num-box mt10 bg-white">
			<view>
				<tab-list :list="tabList1" :fontsize="26" @change="clickTabs" />
			</view>
			<view class="charts-box">
				<qiun-data-charts 
				type="ring" 
				:opts="opts" 
				:chartData="chartData1" 
				:canvas2d="true"
				canvasId="canvastotalf" />
			</view>
				<view class="tc f-14 ptb-10">合计：{{chartData1.total||0}}(笔)</view>
		</view>
		<view class="price-box mt10 bg-white">
			<view>
				<tab-list :list="tabList2" :fontsize="26" @change="clickTabs" />
			</view>
			<view class="charts-box">
				<qiun-data-charts 
				type="ring" 
				:opts="opts" 
				:chartData="chartData2"
				:canvas2d="true"
				canvasId="canvastotals"
				 />
			</view>
				<view class="tc f-14 ptb-10">合计：￥{{chartData2.total||0}}</view>
		</view>
	</view>
</template>

<script>
	import { getTotalDataChart } from '@/common/http/api.js';
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
				tabList1: [{
						label: '支付笔数',
						value: 1
					},
					{
						label: '退款笔数',
						value: 2
					}
				],
				tabList2: [{
						label: '订单金额',
						value: 3
					},
					{
						label: '交易金额',
						value: 4
					},
					{
						label: '退款金额',
						value: 5
					}
				],
				chartData1: {},
				chartData2: {},
				opts: {
					color: ["#1890FF", "#91CB74", "#FAC858"],
					padding: [20, 20, 0, 20],
					dataLabel: true,
					legend: {
						show: false,
						position: "bottom",
						lineHeight: 25
					},
					title: {
						name: "",
						fontSize: 15,
						color: "#666666"
					},
					subtitle: {
						name: "",
						fontSize: 25,
						color: "#7cb5ec"
					},
					extra: {
						ring: {
							ringWidth: 30,
							offsetAngle: 0
						}
					}
				},
				year:undefined,
				selHosId:undefined,
				hospitalId:undefined
			};
		},
		onLoad(options) {
			if(+options.hospitalId>0){
				this.hospitalId = options.hospitalId
			}
		},
		methods: {
			onCurrentHosAndCard(e) {
				this.year = e.year;
				this.selHosId = e.hospitalId;
				this.getServerData(1)
				this.getServerData(3)
			},
			async getServerData(types) {
				//模拟从服务器获取数据时的延时
				const param = {
					hospitalId:this.hospitalId?this.hospitalId:this.selHosId,
					year:this.year,
					dataType:types
				}
				const {data} = await getTotalDataChart(param)
				if(types>=3){
					this.chartData2 = JSON.parse(JSON.stringify(data));
				}else{
					this.chartData1 = JSON.parse(JSON.stringify(data));
				}
			},
			clickTabs(e){
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
			height: 250px;
		}
	}
</style>
