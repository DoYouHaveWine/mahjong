<template>
	<view class="page">
		<view class="title-box f-14 c-white plr-20 ptb-10">
			<view class="just-between align-center mt10">
				<view class="flex-box align-center">
					<text class="items f-16 fb">体检报告</text>
				</view>
				<view class="flex-box align-center">
					<text class="opacity-07 items">报告单ID:</text>
					<text class="items">{{ info.recordId || '' }}</text>
				</view>
			</view>
			<!-- <view class="f-16 fb c-white">体检报告</view> -->
			<view class="just-between align-center mt10">
				<view class="flex-box align-center" v-if="info.name">
					<text class="opacity-07 items">体检人:</text>
					<text class="items">{{ info.patientName || '' }}</text>
				</view>
				<view class="flex-box align-center" v-if="info.age">
					<text class="opacity-07 items">年龄:</text>
					<text class="items">{{ info.barcode || '' }}</text>
				</view>
			</view>
			<view class="just-between align-center mt10">
				<view class="flex-box align-center">
					<text class="opacity-07 items">总检医生:</text>
					<text class="items">{{ info.reqDoctorName || '' }}</text>
				</view>
				<view class="flex-box align-center">
					<text class="opacity-07 items">体检日期:</text>
					<text class="items">{{ info.reqTime || '' }}</text>
				</view>
			</view>
			<view class="just-between align-center mt10">
				<view class="flex-box align-center" v-if="info.reportTime">
					<text class="opacity-07 items">报告时间:</text>
					<text class="items">{{ info.reportTime || '' }}</text>
				</view>
				<view class="flex-box align-center"></view>
			</view>
		</view>
		<view class="content bg-white border-box ptb-20 plr-20">
			<u-subsection :list="list" :current="curNow" @change="sectionChange"></u-subsection>
			<view>
				<view v-if="curNow==0">
					<view v-for="(item,index) in info.healthExamReports" :key="index" class="exam-items f-12 ptb-10">
						<view class="fb">{{item.itemName}}</view>
						<view class="just-between align-center mt5">
							<view>
								<text class="c-99">检查日期：</text>
								<text>{{item.examDate||''}}</text>
							</view>
							<view>
								<text class="c-99">检查医生：</text>
								<text>{{item.doctorName||'暂无信息'}}</text>
							</view>
						</view>
						<view class="mt5">
							<text class="c-99">检测所见：</text>
							<text>{{item.see||item.prompt}}</text>
						</view>
					</view>
				</view>
				<view v-else-if="curNow==1">
						<view class="mt10 f-12">
							<view class="flex-box align-center info-title ptb-10 plr-5">
								<text class="flex-item tc">检查项目</text>
								<text class="flex-item tc">结果值</text>
								<text class="flex-item tc">参考值</text>
								<text class="flex-item tc">单位</text>
							</view>
						</view>
						<view class="mt10 f-12" v-for="(item, index) in info.healthAssayReports" :key="index">
							<view class="flex-box align-center info-item ptb-10 plr-5">
								<text class="flex-item tc">{{ item.assayName || '' }}</text>
								<text class="flex-item tc">{{ item.assayValue || '' }}</text>
								<text class="flex-item tc">{{ item.refer || '' }}</text>
								<text class="flex-item tc">{{ item.unit || '' }}</text>
							</view>
						</view>
				</view>
				<view v-else>
					<view class="mt10 f-12">
						<view class="flex-box align-center info-title ptb-10 plr-5">
							<text class="flex-item tc">检查项目</text>
							<text class="flex-item tc">结果值</text>
							<text class="flex-item tc">参考值</text>
							<text class="flex-item tc">单位</text>
						</view>
					</view>
					<view class="mt10 f-12" v-for="(item, index) in info.healthOtherReports" :key="index">
						<view class="flex-box align-center info-item ptb-10 plr-5">
							<text class="flex-item tc">{{ item.assayName || '' }}</text>
							<text class="flex-item tc">{{ item.assayValue || '' }}</text>
							<text class="flex-item tc">{{ item.refer || '' }}</text>
							<text class="flex-item tc">{{ item.unit || '' }}</text>
						</view>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	import { getHealthDetail } from '@/common/http/api.js';
	export default {
		data() {
			return {
				id: '',
				recordId: '',
				hosId: '',
				info: {},
				list: ['检查结果', '检验结果', '其他结果'],
				curNow: 0
			};
		},
		onLoad(options) {
			this.id = options.id;
			this.recordId = options.recordId;
			this.hosId = options.hosId;
			this.getData();
		},
		methods: {
			async getData() {
				// let opt = {
				//   id:1000002828,hospitalId:42,recordId:57
				// }
				let opt = {
					id: this.id,
					hospitalId: this.hosId,
					recordId: this.recordId
				};
				const { data } = await getHealthDetail(opt);
				console.log(data);
				this.info = data;
			},
			sectionChange(index) {
				this.curNow = index;
			}
		}
	};
</script>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		background: #4298ff;
		height: 100vh;

		.title-box {
			.opacity-07 {
				opacity: 0.7;
			}
		}

		.content {
			flex: 1;
			border-top-left-radius: 20px;
			border-top-right-radius: 20px;

			.exam-items {
				border-bottom: 1px solid #ccc;
			}

			.info-title {
				background: rgba(230, 241, 255, 0.5);
			}

			.info-item {
				border-bottom: 1px solid #ccc;
			}

			.title {
				position: relative;

				&::after {
					width: 50%;
					height: 16rpx;
					opacity: 0.2;
					content: '';
					border-radius: 30rpx;
					background: #4298ff;
					position: absolute;
					bottom: -5rpx;
					left: 0;
				}
			}
		}
	}
</style>
