<template>
	<view>
		<view v-if="info">
			<view class="card">
				<view class="card-title">
					<view class="avatar">
						<image :src="serverUrl + info.avatar" v-if="info.avatar" />
						<template v-else>
							<image src="../static/hospital/ic_doctor.svg"></image>
						</template>
					</view>
					<view class="">
						<view style="color: #333">{{ info.doctorName }} {{ info.deptName }}</view>
						<view class="hos">{{ info.hospitalName }}</view>
					</view>
				</view>

				<image v-if="info.qrCode" class="qr-image" :src="'data:image/png;base64,' + info.qrCode" />

				<view class="info">
					<view class="patient-id">
						二维码识别号：
						<text>{{ info.qrCodeNo }}</text>
					</view>
					<view>就 诊 人 ：{{ info.recordName }}</view>
					<view class="patient-id">
						就诊卡号：
						<text>{{ info.cardNo }}</text>
					</view>
					<view>挂号费用：{{ info.payAmount }}元</view>
					<view v-if="info.qhfph">取号号码：{{ info.qhfph }}</view>
					<view v-if="info.platformpassword">取号密码：{{ info.platformpassword }}</view>
					<view>就诊时间：{{ info.treatTime || '' }}</view>
					<view v-if="info.status > 0">就诊序号：{{ info.serialNo || '' }}</view>
				</view>
			</view>

			<view class="card text">
				<view class="tite">订单详情</view>
				<view>订单号：{{ info.code }}</view>
				<view>订单状态：{{ constantMap.get('payStatusName')[info.status] || '' }}</view>
				<view>下单时间：{{ info.bizTime }}</view>
				<view v-if="info.status > 0 && info.payTime">支付时间：{{ info.payTime }}</view>
				<view v-if="info.status > 0">支付方式：{{ constantMap.get('payMethodName')[info.payMethod] || '' }}</view>
			</view>

			<view class="card text spec">
				<view class="tite">就诊须知</view>
				<u-parse :tagStyle="{ p: 'font-size:26rpx;color:#999', span: 'font-size: 26rpx;color:#999' }" :content="resText" />
			</view>
		</view>

		<load-data v-else />
	</view>
</template>

<script>
import { getOrdersDetail, getResInfo } from '@/common/http/api.js';
export default {
	data() {
		return {
			info: undefined,
			resText: ''
		};
	},

	onLoad(options) {
		var str = options.fromPage ? options.id + '?fromPage=msg' : options.id;
		this.getInfo(str);
	},

	methods: {
		async getInfo(opt) {
			const { data } = await getOrdersDetail(opt);
			this.info = data;
			this.getText(data.hospitalId);
		},

		async getText(id) {
			const { data } = await getResInfo(id);
			if (uni.$u.test.isEmpty(data)) {
				this.resText =
					'<p>1、本系统要求实名挂号，就诊时可持挂号记录详情二维码或首页电子健康卡就诊；</p>\n' +
					'<p>2、本系统预约挂号目前仅支持自费支付，如需医保支付可到线下持医保电子凭证挂号</p>\n' +
					'<p>3、预约成功后，请您按预约时间提前30分钟持电子健康码或预约短信至医院就诊，逾期会被作废；</p>\n' +
					'<p>4、用户挂号限制：每科室当日限挂1次，每月限挂30次；</p>\n' +
					'<p>5、请携带身份证、电子健康卡前往对应科室就诊、检验、治疗、取药等；</p>\n' +
					'<p>6、如需取消预约，请在预约时间24小时前在“我的—挂号订单”申请取消或退款；如不可取消需到医院窗口办理退费；</p>\n' +
					'<p>7、如需索取发票，请咨询医院导医台。';
			} else {
				this.resText = data;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f2f5f9;
	min-height: 100vh;

	.card {
		display: flex;
		flex-direction: column;
		margin: 10px;
		background: #fff;
		padding: 4px;
		border-radius: 14px;

		.card-title {
			display: flex;
			margin-top: 10rpx;
			padding: 0 10rpx;
			align-items: center;
			.hos {
				color: #999;
				font-size: 26rpx;
			}
		}

		.avatar {
			margin-right: 20rpx;

			image {
				width: 90rpx;
				height: 90rpx;
				border-radius: 50%;
			}
		}

		.qr-image {
			width: 476rpx;
			height: 476rpx;
			margin: 0 auto;
		}

		.info {
			padding: 0 20rpx;
			margin: 20rpx 0;
			font-size: 28rpx;

			.patient-id {
				display: flex;

				text {
					flex: 1;
					white-space: wrap;
					word-break: break-all;
				}
			}

			view {
				line-height: 50rpx;
				color: #333;
				font-size: 28rpx;
			}
		}
	}

	.text {
		font-size: 26rpx;
		line-height: 50rpx;
		padding: 20rpx !important;

		.tite {
			color: #333;
			font-size: 28rpx;
		}

		view {
			font-size: 28rpx;
		}
	}
	.spec {
		color: #666;
	}
}
</style>
