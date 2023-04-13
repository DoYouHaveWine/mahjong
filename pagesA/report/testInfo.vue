<template>
	<view class="page">
		<view class="title-box f-14 c-white plr-20 ptb-10">
			<view class="f-16 fb c-white">{{ info.name || '' }}</view>
			<view class="just-between align-center mt10">
				<view class="flex-box align-center">
					<text class="opacity-07 items">就诊人:</text>
					<text class="items">{{ info.patientName || '' }}</text>
				</view>
				<view class="flex-box align-center">
					<text class="opacity-07 items">报告类型:</text>
					<text class="items">{{ info.bizTypeName || '' }}</text>
				</view>
			</view>
			<view class="just-between align-center mt5">
				<view class="flex-box align-center">
					<text class="opacity-07 items">科室:</text>
					<text class="items">{{ info.deptName || '' }}</text>
				</view>
				<view class="flex-box align-center">
					<text class="opacity-07 items">送检医生:</text>
					<text class="items">{{ info.applyDoctorName || '' }}</text>
				</view>
			</view>
			<view class="just-between align-center mt5">
				<view class="flex-box align-center">
					<text class="opacity-07 items">申请时间:</text>
					<text class="items">{{ info.reqTime ? strSplit(info.reqTime) || '' : '' }}</text>
				</view>
				<!-- <view class="flex-box align-center">
          <text class="opacity-07 items">报告时间</text>
          <text class="items">{{info.reportTime?strSplit(info.reportTime) || '':''}}</text>
        </view> -->
			</view>
		</view>
		<view class="content bg-white border-box ptb-20 plr-20">
			<view v-if="info.lczd">
				<text class="title">临床诊断</text>
				<view class="mt10 c-99" v-text="info.lczd"></view>
			</view>
			<view class="mt20">
				<text class="title">结论</text>
				<view class="mt10 f-12">
					<view class="flex-box align-center info-title ptb-10 plr-5">
						<text class="flex-item tc">检查项目</text>
						<text class="flex-item tc">结果值</text>
						<text class="flex-item tc">参考值</text>
						<text class="flex-item tc">单位</text>
					</view>
					<view v-for="item in info.reportItems" :key="item.id" class="flex-box align-center info-item ptb-10 plr-5">
						<text class="flex-item tc">{{ item.itemName || '' }}</text>
						<view class="flex-item tc flex-box align-center" style="justify-content: center;">
							<text>{{ item.itemValue || '' }}</text>
							<u-icon name="arrow-upward" color="#FF6262" v-if="item.result == 'L'" />
							<u-icon name="arrow-downward" color="#FF6262" v-if="item.result == 'H'" />
						</view>
						<text class="flex-item tc">{{ item.refer || '' }}</text>
						<text class="flex-item tc">{{ item.unit || '' }}</text>
					</view>
				</view>
			</view>
		</view>

		<load-data :loading="loading" isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { getInspectionDetail } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			id: '',
			recordId: '',
			hosId: '',
			info: {}
		};
	},

	onLoad(options) {
		this.id = options.id;
		this.recordId = options.recordId;
		this.hosId = options.hosId;
		this.getData();
	},

	methods: {
		getData() {
			this.loading = true;
			getInspectionDetail({
				id: this.id,
				hospitalId: this.hosId
			})
				.then(({ data }) => (this.info = data))
				.finally(() => (this.loading = false));
		},

		strSplit(str) {
			let arr = str.split(' ');
			return arr[0];
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #4298ff;

	.page {
		display: flex;
		flex-direction: column;

		.title-box {
			background: #4298ff;
			.opacity-07 {
				opacity: 0.7;
			}
			.items {
				min-width: 150rpx;
			}
		}
		.content {
			flex: 1;
			border-top-left-radius: 20px;
			border-top-right-radius: 20px;
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
}
</style>
