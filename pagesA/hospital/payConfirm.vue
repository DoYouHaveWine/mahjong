<template>
	<view>
		<card-sel @currentCard="onCurrentCard" />

		<view class="plr-20 bg-white">
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">就诊医生</text>
				<text v-text="hosMsg.doctorName" />
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">就诊医院</text>
				<text v-text="hosMsg.hospitalName" />
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">医院地址</text>
				<text v-text="hosMsg.hospitalAddress" style="max-width: 400rpx;word-break: break-all;"></text>
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">就诊科室</text>
				<text v-text="hosMsg.deptName" />
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">就诊时间</text>
				<text v-text="hosMsg.treatTime" />
			</view>
			<view class="just-between align-center f-16 ptb-10">
				<text class="c-99">总费用</text>
				<view v-if="hosMsg.unitPrice != undefined" style="color: #ea3131">
					¥ {{ hosMsg.unitPrice }}
					<text v-if="hosMsg.diagPrice" style="font-size: 24rpx;">（含看诊费：¥ {{ hosMsg.diagPrice }})</text>
				</view>
			</view>
		</view>
		<view class="mt10 plr-20" v-if="resText">
			<view class="fb f-14">挂号须知</view>
			<u-parse :tagStyle="{ p: 'font-size:26rpx;color:#999', span: 'font-size: 26rpx;color:#999' }" :content="resText" />
		</view>
		<u-button
			:custom-style="{ position: 'fixed', bottom: 0, width: '90%', left: '5%', bottom: '20rpx' }"
			type="primary"
			shape="circle"
			@click="beforeSubmit"
			throttleTime="1000"
			block
			text="确认预约"
		/>

		<u-modal :show="showModal" title="挂号温馨提醒" confirmText="已阅读" @confirm="showModal = false">
			<u-parse :tagStyle="{ p: 'font-size:26rpx;color:#999', span: 'font-size: 26rpx;color:#999' }" :content="resText" />
		</u-modal>

		<!-- 确认预约时展示弹窗loading,避免交互还可切换就诊卡 -->
		<load-data :loading="loading.isLoading" :loadingText="loading.loadingText" isLoadingDialog onlyShowLoading />
		<!-- 支付方式选择 -->
		<u-popup :show="showPayKind" :round="10" @open="openPopup" @close="showPayKind = false">
			<!-- <scroll-view class="card-manager" scroll-y> -->
			<view class="tc"><text class="f-20 fb">选择支付方式</text></view>
			<view class="card-list">
				<view
					v-for="(item, i) in payKinds"
					:key="i"
					:class="['card-item', { 'active-item': selPayIndex === i }]"
					@click="clickCard(i, item.value)"
				>
					<view class="left">{{ item.name }}</view>
				</view>
			</view>
			<u-button
				customStyle="width:90%;margin-top:20rpx"
				@click="onSubmit"
				shape="circle"
				type="primary"
				text="确认"
				:disabled="selPayIndex === undefined"
			/>
			<!-- </scroll-view> -->
		</u-popup>
	</view>
</template>

<script>
import {
	getRegisterRecordMsg,
	submitReserve,
	submitsReserve,
	getHosInfo,
	getResInfo,
	orderPay,
	getRegisterRecordMsgByHisId
} from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
export default {
	components: { cardSel },
	data() {
		return {
			loading: {
				isLoading: true,
				loadingText: '加载中...'
			},
			choosedPatient: {},
			hosMsg: {},
			hospitalDetails: {},
			sourceId: '',
			scheduleId: '',
			resText: '',
			showModal: false,
			showPayKind: false,
			selPayIndex: undefined,
			payKinds: [
				{
					name: '现场支付',
					value: '1'
				},
				{
					name: '线上支付',
					value: '2'
				}
			],
			payType: undefined //最终传入的payType
		};
	},
	onLoad(options) {
		this.sourceId = options.id;
		this.scheduleId = options.scheduleId;
		this.getConfig(this.sourceId, this.scheduleId, options.doctorId);
	},
	methods: {
		onCurrentCard(card) {
			this.choosedPatient = card;
		},

		async getConfig(id, scheduleId, doctorId = '') {
			this.loading = {
				isLoading: true,
				loadingText: '加载中...'
			};
			try {
				const { data: res } = await getRegisterRecordMsgByHisId({ hisId: id, scheduleId, doctorId });
				const { data } = await getHosInfo(res.hospitalId);
				const { data: text } = await getResInfo(res.hospitalId);
				this.resText = text;
				if (uni.$u.test.isEmpty(text)) {
					this.resText =
						'<p>1、本系统要求实名挂号，就诊时可持挂号记录详情二维码或首页电子健康卡就诊；</p>\n' +
						'<p>2、本系统预约挂号目前仅支持自费支付，如需医保支付可到线下持医保电子凭证挂号</p>\n' +
						'<p>3、预约成功后，请您按预约时间提前30分钟持电子健康码或预约短信至医院就诊，逾期会被作废；</p>\n' +
						'<p>4、用户挂号限制：每科室当日限挂1次，每月限挂30次；</p>\n' +
						'<p>5、请携带身份证、电子健康卡前往对应科室就诊、检验、治疗、取药等；</p>\n' +
						'<p>6、如需取消预约，请在预约时间24小时前在“我的—挂号订单”申请取消或退款；如不可取消需到医院窗口办理退费；</p>\n' +
						'<p>7、如需索取发票，请咨询医院导医台。';
				}
				this.showModal = true;
				this.hospitalDetails = data;
				this.hosMsg = res;
			} finally {
				this.loading.isLoading = false;
			}
		},

		// 判断时间是否过期 过期返回true
		calcDay(val) {
			let day = new Date().getTime();
			let oldday = new Date(val).getTime();
			if (day - oldday < 86400000 && day - oldday > 0) {
				return true;
			}
			return false;
		},
		beforeSubmit() {
			const payType = this.hospitalDetails.payType;
			const unitPrice = this.hosMsg.unitPrice;
			if (payType.includes('1') && payType.includes('2')) {
				if (unitPrice != 0) {
					this.openPopup();
				} else {
					this.payType = '2';
					this.onSubmit();
				}
			} else {
				this.payType = payType;
				this.onSubmit();
			}
		},
		async onSubmit() {
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds: [
					'GEgybqbdmdzlrns_2ooi4WUwAqxkIIXHuZsr8ffZIZQ',
					'oe0WnUznPSwZiw0E5-GHRFksFNJOlHErVrkCkGRYyGc',
					'_6y1GtKk04M-KXkcSuBQo1G-j6L7moBNGZ22ujIxe-8'
				],
				success: res => {
					console.log(res);
				},
				fail: error => {
					console.error(error);
				},
				complete: async res => {
					// #endif
					const payType = this.payType;
					const payMode = this.hospitalDetails.payMode;
					const unitPrice = this.hosMsg.unitPrice;
					//第二医院需要判断当前是否为当天挂号
					const day = this.hosMsg.day;
					let req = {
						srcId: this.hosMsg.id,
						schId: this.hosMsg.schId,
						doctorId: this.hosMsg.doctorId,
						recordId: this.choosedPatient.id,
						orderTime: day + ',' + this.hosMsg.beginTime + ',' + this.hosMsg.endTime,
						paymentMethod: payType
					};
					console.log(payType);
					if (payType.includes('2') && unitPrice != 0 && payMode != 1) {
						this.loading = {
							isLoading: true,
							loadingText: '提交中...'
						};
						const { data } = await orderPay(req);
						this.loading.isLoading = false;
						uni.navigateTo({
							url: `./pay?orderId=${data.orderId}`
						});
					} else {
						//第二医院配置
						if (payMode == 1 && this.calcDay(day)) {
							this.loading = {
								isLoading: true,
								loadingText: '提交中...'
							};
							const { data } = await orderPay(req);
							this.loading.isLoading = false;
							uni.navigateTo({
								url: `./pay?orderId=${data.orderId}`
							});
						} else {
							this.loading = {
								isLoading: true,
								loadingText: '提交中...'
							};
							const { data } = await orderPay(req);
							this.loading.isLoading = false;
							uni.navigateTo({
								url: `./success?orderId=${data.orderId}&payType=2`
							});
						}
					}
					// #ifdef MP-WEIXIN
				}
			});
			// #endif
		},
		/** 打开popup弹窗 */
		openPopup() {
			this.showPayKind = true;
		},
		clickCard(index, value) {
			this.selPayIndex = index;
			this.payType = value;
		}
	}
};
</script>

<style lang="scss">
page {
	background: $uni-f9f9f9;
	.patient-box {
		background: #e6f1ff;
	}
	.sex-icon {
		width: 36rpx;
		height: 36rpx;
		margin: 0 8rpx 0 16rpx;
	}

	.card-list {
		.card-item {
			background: #fff;
			border-radius: 28rpx;
			padding: 30rpx 26rpx;
			margin: 10rpx 32rpx;
			display: flex;
			align-items: center;
			border: 2rpx solid #f2f2f2;

			.left {
				flex: 1;
			}
		}

		.active-item {
			border: 4rpx solid #4298ff;
			transition: all 0.1s;
		}
	}
}
</style>
