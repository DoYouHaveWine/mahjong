<template>
	<!-- 充值记录详情 -->
	<view class="plr-20 ptb-10 border-box">
		<text class="title f-16 c-33 fb">住院详情</text>
		<view class="box bg-white mt15 plr-10 ptb-10">
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊人</text>
				<u--text mode="name" :text="msgObj.inHospitalInfo.patientName||''" format="encrypt" align="right"></u--text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊医院</text>
				<text>{{msgObj.inHospitalInfo.hospitalName||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊卡号</text>
				<text>{{msgObj.inHospitalInfo.visitId||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">就诊科室</text>
				<text>{{msgObj.inHospitalInfo.deptName||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">床位</text>
				<text>{{msgObj.inHospitalInfo.bedNo||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">入院时间</text>
				<text>{{msgObj.inHospitalInfo.checkInDate||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">入院诊断</text>
				<text>{{msgObj.inHospitalInfo.diagnose||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">费用总金额</text>
				<text>{{msgObj.inHospitalInfo.feeTotal||''}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">押金总金额</text>
				<text>{{msgObj.inHospitalInfo.depositFeeTotal}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">可用金额</text>
				<text>{{msgObj.inHospitalInfo.depositFeeBalance||''}}</text>
			</view>
		</view>
		<view class="mt15">
			<text class="title f-16 c-33 fb mt15">订单明细</text>
		</view>
		<view class="box bg-white mt15 plr-10 ptb-10">
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">订单状态</text>
				<text>{{msgObj.state}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">订单编号</text>
				<u--text :lines="1" :text="msgObj.code" align="right"></u--text>
				
				<!-- <text>{{msgObj.code}}</text> -->
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">订单时间</text>
				<text>{{msgObj.bizTime}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">充值类别</text>
				<text>{{msgObj.chargeType}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">充值金额</text>
				<text>{{msgObj.payAmount}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">充值方式</text>
				<text>{{msgObj.payMethod}}</text>
			</view>
			<view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">支付时间</text>
				<text>{{msgObj.payTime}}</text>
			</view>
			<!-- <view class="just-between align-center plr-10 ptb-5 f-15">
				<text class="item-title">支付流水</text>
				<text>张三</text>
			</view> -->
		</view>
		<view class="tips item-title f-12 mt10">
			<view class="">{{tip.title}}</view>
			<!-- <view class="mt5" style="white-space:pre-line;">{{tip.content}}</view> -->
			<view class="mt5">
				<view v-if="tip.isDefault" style="white-space:pre-line;">{{tip.content}}</view>
				<u-parse v-else :content="tip.content"></u-parse>
			</view>
		</view>
	</view>
</template>

<script>
	import { getRechargeDetails, getNoticeInfo } from '@/common/http/api.js';
	export default {
		data() {
			return {
				show:false,
				msgObj:undefined,
				loading: {
					isLoading: true,
					loadingText: '加载中...'
				},
				orderId:'',
				tip: {
					title: '充值须知',
					content: `1、请核对就诊人和余额信息；
					2、可选择常用金额快捷充值，或者输入自定义金额进行充值；
					3、门诊充值仅用于门诊缴费，住院充值仅用户住院缴费，如需办理退费请到人工窗口办理；
					4、我院暂不支持线上医保缴费，如需医保缴费请到人工窗口办理。`,
					isDefault:false
				}
			};
		},
		onLoad(options) {
			var str = options.pageType ? options.orderId + '?pageType=msg' : options.orderId;
			this.fetchList(str)
		},
		methods: {
			async fetchList(str) {
				this.loading = { isLoading: true, loadingText: '加载中...' };
				const { data } = await getRechargeDetails(str);
				this.loading.isLoading = false;
				this.msgObj = data || undefined;
				this.getNotice(this.msgObj.inHospitalInfo)
			},
			async getNotice(hospital){
				if(hospital){
					const { data } = await getNoticeInfo(hospital.hospitalId)
					this.tip.content = data.inHospRechargeInfo?data.inHospRechargeInfo:this.tip.content;
					this.tip.isDefault = data.inHospRechargeInfo?false:true
				}
			}
		}
	};
</script>

<style lang="scss">
page {
	background: #f5f7fa;
		.box{
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
		.item-title{
			color: #9E9EA8;
		}
		.value-success{
			color: #28D094;
		}
		.value-fail{
			color: #ea3131;
		}
	}
</style>