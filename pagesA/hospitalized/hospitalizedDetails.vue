<template>
	<!-- 充值记录详情 -->
	<view>
		<view class="bg-white flex-box align-center tc ptb-10">
			<view class="flex-item" @click="toRecharge(msgObj)">
				<template>
					<image v-if="msgObj.state === '1'" src="../../static/hospitalized/ic_zycz_un.svg" />
					<image v-else src="../../static/index/ic_zycz.svg" />
				</template>
				<view class="f-15" :class="msgObj.state === '1' ? 'c-99' : ''">住院充值</view>
				<text class="f-12" :class="msgObj.state === '1' ? 'c-99' : 'remark'">余额:￥{{ msgObj.depositFeeBalance || '' }}</text>
			</view>
			<view class="flex-item" @click="toDays(msgObj)">
				<image src="../../static/hospitalized/ic_fyrqd.svg" />
				<view class="f-15">费用日清单</view>
				<text class="f-12 remark">总费用:￥{{ msgObj.feeTotal || '' }}</text>
			</view>
			<view class="flex-item" @click="toRechargeList(msgObj)">
				<image src="../../static/hospitalized/ic_czjl.svg" />
				<view class="f-15">充值记录</view>
				<text class="f-12 remark">累计:￥{{ msgObj.depositFeeTotal || 0 }}</text>
			</view>
		</view>
		<view class="mt15 plr-20 ptb-10 border-box"><text class="title f-16 c-33 fb mt15">住院信息</text></view>
		<view class="box bg-white mt15 plr-10 ptb-10">
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">住院状态</text>
				<text :class="msgObj.state == 1 ? 'leave' : 'in'">{{ msgObj.state === '1' ? '已出院' : '住院中' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊人</text>
				<u--text mode="name" :text="msgObj.patientName || ''" format="encrypt" align="right"></u--text>
				<!-- <text>{{msgObj.patientName||''}}</text> -->
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊医院</text>
				<text>{{ msgObj.hospitalName || '' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊卡号</text>
				<text>{{ msgObj.cardNo || '' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊科室</text>
				<text>{{ msgObj.deptName || '' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">床位</text>
				<text>{{ msgObj.bedNo || '' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">入院时间</text>
				<text>{{ msgObj.checkInDate || '' }}</text>
			</view>
			<template v-if="msgObj.state === '1'">
				<view class="just-between align-center plr-10 ptb-5 f-15">
					<text class="item-title">出院时间</text>
					<text>{{ msgObj.checkOutDate || '' }}</text>
				</view>
				<view class="just-between align-center plr-10 ptb-5 f-15">
					<text class="item-title">住院天数</text>
					<text>{{ msgObj.days || '' }}</text>
				</view>
			</template>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">入院诊断</text>
				<text>{{ msgObj.diagnose || '' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">费用总金额</text>
				<text>{{ msgObj.feeTotal || '' }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">押金总金额</text>
				<text>{{ msgObj.depositFeeTotal }}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">可用余额</text>
				<text>{{ msgObj.depositFeeBalance || '' }}</text>
			</view>
			<load-data :loading="loading.isLoading" :loadingText="loading.loadingText" isLoadingDialog onlyShowLoading />
		</view>
	</view>
</template>

<script>
import { gethospitalizedDetails } from '@/common/http/api.js';
export default {
	data() {
		return {
			msgObj: {},
			form: {
				recordId: '',
				visitId: '',
				hospitalId: ''
			},
			loading: {
				isLoading: true,
				loadingText: '加载中...'
			}
		};
	},
	onLoad(options) {
		const { recordId, visitId, state, hospitalId } = options;
		this.form.recordId = recordId;
		this.form.visitId = visitId;
		this.form.hospitalId = hospitalId;
		this.state = state;
		this.fetchList();
	},
	methods: {
		/** 请求获取列表 */
		async fetchList() {
			this.loading = { isLoading: true, loadingText: '加载中...' };
			this.list = undefined;
			const { data } = await gethospitalizedDetails(this.form);
			this.loading.isLoading = false;
			this.msgObj = data || {};
		},
		toRechargeList(obj) {
			uni.navigateTo({
				url: `./rechargeList?recordId=${obj.recordId}&visitId=${obj.visitId}`
			});
		},
		toRecharge(obj) {
			if (obj.state === '1') {
				uni.showModal({
					title: '提示',
					content: '当前患者已经出院,无需充值',
					showCancel: false
				});
			} else {
				uni.navigateTo({
					url: `./recharge?hospitalId=${obj.hospitalId}&cardId=${obj.recordId}`
				});
			}
		},
		toDays(obj) {
			uni.navigateTo({
				url: `./expenseList?hospitalId=${obj.hospitalId}&recordId=${obj.recordId}&visitId=${obj.visitId}`
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f5f7fa;
	.box {
		border-radius: 10px;
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
	.in {
		color: #ed8c53;
	}
	.leave {
		color: rgba(15, 20, 25, 0.3);
	}
	.item-title {
		color: #9e9ea8;
	}
	.flex-item {
		image {
			width: 72rpx;
			height: 72rpx;
		}
		.remark {
			color: #ffa143;
		}
	}
}
</style>
