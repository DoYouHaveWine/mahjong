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
					<text class="opacity-07 items">申请科室:</text>
					<text class="items">{{ info.deptName || '' }}</text>
				</view>
				<view class="flex-box align-center">
					<text class="opacity-07 items">申请医生:</text>
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
          <text class="items">{{info.reportTime?strSplit(info.reportTime)||'':''}}</text>
        </view> -->
			</view>
		</view>
		<view class="content bg-white border-box ptb-20 plr-20">
			<view>
				<text class="title">临床诊断</text>
				<view class="mt10 c-99" v-text="info.lczd"></view>
			</view>
			<view>
				<view v-for="(item, index) in info.checkItems" :key="index" class="mt20">
					<text class="title" v-text="item.deptname"></text>
					<view class="mt10 c-99 f-14">
						<view v-if="item.checkpart">
							<text class="c-99">检查部位:</text>
							<text class="c-33" v-text="item.checkpart"></text>
						</view>
						<view class="mt10" v-if="item.checksituation">
							<text class="c-99">检查所见:</text>
							<text class="c-33" v-text="item.checksituation"></text>
						</view>
						<view class="mt10" v-if="item.advice">
							<text class="c-99">检查诊断依据:</text>
							<text class="c-33" v-text="item.advice"></text>
						</view>
						<view class="mt10" v-if="item.checkresult">
							<text class="c-99">检查结果:</text>
							<text class="c-33" v-text="item.checkresult"></text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<load-data :loading="loading" isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { getExaminationDetail } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			recordId: '',
			hosId: '',
			id: '',
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
			getExaminationDetail({
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
