<template>
	<view>
		<template v-if="!loading && info">
			<view class="text tc">
				<view class="top">
					<u-icon name="checkmark-circle-fill" color="#28D094" size="20"></u-icon>
					<text>{{ orderStatusName }}</text>
				</view>
				<view class="content">
					详细信息可以在
					<text @click="$linkJump({ url: '/pagesA/hospital/recordList' })" class="link">我的-挂号记录</text>
					中查看
				</view>
			</view>

			<view class="card">
				<view class="top">
					<view class="left">
						<image v-if="info.avatar" style="width: 132rpx;height: 132rpx;border-radius: 50%;" :src="serverUrl + info.avatar" />
						<image v-else style="width: 132rpx;height: 132rpx;border-radius: 50%;" src="../static/hospital/ic_doctor.svg" />
					</view>
					<view class="right">
						<view style="color:#333">
							{{ info.doctorName || '' }}
							<text v-if="info.doctorTitle" class="tag">{{ info.doctorTitle }}</text>
						</view>
						<view class="hos-and-dept" v-if="info.hospitalName">{{ info.hospitalName }} | {{ info.deptName }}</view>
					</view>
				</view>

				<view class="info">
					<view class="info-item">
						<text class="label">就诊时间：</text>
						<text>{{ info.treatTime || '' }}</text>
					</view>
					<view class="info-item">
						<text class="label">就诊人：</text>
						<text>{{ info.recordName || '' }}</text>
					</view>
				</view>
			</view>

			<view class="mt10 plr-20" v-if="resText">
				<view class="fb f-14">挂号须知</view>
				<u-parse :tagStyle="{ p: 'font-size:26rpx;color:#999', span: 'font-size: 26rpx;color:#999' }" :content="resText" />
			</view>

			<view class="just-between align-center plr-20 mt20">
				<u-button type="primary" shape="circle" @click="$linkJump({ url: '/pagesA/hospital/recordList' })" text="挂号记录" />
			</view>

			<view class="change-box"><text @click="reLaunch">返回首页</text></view>
		</template>

		<load-data v-else :loading="loading" onlyShowLoading />
	</view>
</template>

<script>
import { getOrdersDetail, getOrderStatus, getResInfo, setDefaultHos } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: true,
			info: undefined,
			orderStatusName: '',
			resText: ''
		};
	},

	onLoad(options) {
		const { orderId, payType } = options;
		this.getData(orderId);
		if (payType == 1) {
			// 在线支付
			this.orderStatusName = '订单支付处理中...';
			this.getOrderStatus(orderId);
		} else {
			// 现场支付
			this.orderStatusName = '预约成功';
		}
	},

	methods: {
		reLaunch() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},

		async getData(id) {
			this.loading = true;
			const { data } = await getOrdersDetail(id);
			const { data: text } = await getResInfo(data.hospitalId);
			this.loading = false;
			// 这里手动调用下设置默认选择医院（从智能导诊进入时，挂号是自己推荐的医院并未选择过，所以手动调用一次）
			setDefaultHos(data.hospitalId);
			this.info = data;
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
		},

		/** 获取订单状态，每三秒一次直至状态为支付成功 */
		getOrderStatus(orderId) {
			this.timer = setInterval(_ => {
				getOrderStatus(orderId).then(res => {
					if (res.data == 1) {
						this.orderStatusName = '支付成功';
						this.clearTimer();
					}
				});
			}, 3000);
		},

		/** 清除定时器 */
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.text {
		text-align: center;
		font-size: 28rpx;
		line-height: 56rpx;

		.top {
			margin-top: 68rpx;
			display: flex;
			color: #000;
			font-size: 30rpx;
			justify-content: center;
			> text {
				margin-left: 8rpx;
			}
		}

		.content {
			color: #333;
			font-size: 28rpx;

			.link {
				display: inline-block;
				color: #ff7522;
			}
		}
	}

	.card {
		margin: 68rpx 40rpx 40rpx 40rpx;
		background: #fff;
		padding: 32rpx;
		border-radius: 10px;

		.top {
			display: flex;
			align-items: center;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid rgba(229, 231, 235, 0.5);

			.right {
				margin-left: 20rpx;

				.tag {
					font-size: 22rpx;
					font-family: PingFang SC-Medium, PingFang SC;
					font-weight: 500;
					color: #ed8c53;
					padding: 4rpx;
					border: 2rpx solid #ed8c53;
					border-radius: 8rpx;
					margin-left: 10rpx;
				}

				.hos-and-dept {
					margin-top: 16rpx;
					font-size: 26rpx;
					font-family: PingFang SC-Regular, PingFang SC;
					font-weight: 400;
					color: rgba(15, 20, 25, 0.5);
				}
			}
		}

		.info {
			padding: 0 20rpx;
			margin-top: 20rpx;
			color: #666;
			font-size: 30rpx;

			.info-item {
				display: flex;
				justify-content: space-between;
				line-height: 48rpx;
				.label {
					color: #9e9ea8;
				}
			}
		}
	}

	.change-box {
		text-align: center;
		color: #4298ff;
		text-decoration: underline;
		font-size: 32rpx;
		padding: 32rpx 0;
	}
}
</style>
