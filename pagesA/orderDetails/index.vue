<template>
	<view class="page">
		<!-- 门店信息 -->
		<view class="header-box just-between align-center c-white">
				<view>
					<view>09:00</view>
					<text class="f-12 mt5">2023-04-12</text>
				</view>
				<view style="width: 50rpx;">
					<u-line></u-line>
				</view>
				<view>共2小时</view>
				<view style="width: 50rpx;">
					<u-line></u-line>
				</view>
				<view>
					<view>11:00</view>
					<text class="f-12 mt5">2023-04-12</text>
				</view>
		</view>
		<!-- content -->
		<view class="content plr-10">
			 <view class="bg-white plr-10 ptb-10 border-box order-box">
			 	<view class="just-between align-center">
			 		<view class="fb flex-box align-center">
			 			<text>113</text>
			 			<text class="plr-5">大包</text>
			 		</view>
			 		<view class="flex-box align-center tip-doing plr-10 ptb-5">
			 			<text class="f-12 c-white">导航到店</text>
						<image src="../../static/orderDetails/daohang.svg" style="width: 20rpx;height: 20rpx;"></image>
			 		</view>
			 	</view>
			 	<view class="flex-box align-center todo-box mt10">
			 		<image src="../../static/index/bg_room.png" style="width: 204rpx;height: 232rpx;"></image>
			 		<view class="flex-item plr-10">
			 			<view class="flex-box align-center mt5 f-14">
			 				<view class="fb">预约包间:</view>
			 				<view class="plr-10">v11【特惠包】</view>
			 			</view>
			 			<view class="flex-box align-center mt5 f-14">
			 				<view class="fb">下单时间:</view>
			 				<view class="plr-10">2022-11-25 15:30</view>
			 			</view>
			 			<view class="flex-box align-center mt5 f-14">
			 				<view class="fb">开始时间:</view>
			 				<view class="plr-10">2022-11-25 15:30</view>
			 			</view>
			 			<view class="flex-box align-center mt5 f-14">
			 				<view class="fb">结束时间:</view>
			 				<view class="plr-10">2022-11-25 15:30</view>
			 			</view>
			 		</view>
			 	</view>
				<view class="mt10">
					<u-line dashed></u-line>
				</view>
			 	<view class="just-between align-center mt10 f-14 c-66">
			 		<view>订单编号:</view>
			 		<view class="plr-10">4654643413</view>
			 	</view>
			 	<view class="just-between align-center mt10 f-14 c-66">
			 		<view>支付方式:</view>
			 		<view class="plr-10">微信</view>
			 	</view>
			 	<view class="just-between align-center mt10 f-14 c-66">
			 		<view>支付时间:</view>
			 		<view class="plr-10">2023-05-01 14:56:25</view>
			 	</view>
			 </view>
			 <view class="bg-white plr-10 ptb-10 border-box order-box mt20">
				 <view class="fb f-16">自主操作</view>
				 <view class="mt10 just-between align-center wifi-box plr-10 ptb-10">
					 <view class="flex-box">
						 <image src="../../static/orderDetails/wifi.svg" style="width: 40rpx;height: 44rpx;"></image>
						 <text class="plr-10 f-16">门店WiFi</text>
					 </view>
					 <view class="flex-box align-center">
						 <text class="f-16" style="color: #58AA6C;">查看</text>
						 <u-icon name="arrow-right" color="#58AA6C" size="18"></u-icon>
					 </view>
				 </view>
				 <view class="page-bottom plr-10 mt20">
				 	<u-button text="进店开门" color="linear-gradient(179deg, #90E3B1 0%, #58AA6C 100%)" customStyle="color:#ffffff;" />
				 	<view style="width: 40rpx;"></view>
				 	<u-button text="确认到店" color="linear-gradient(179deg, #90E3B1 0%, #58AA6C 100%)"
				 		customStyle="color:#ffffff;" />
				 </view>
				 <view class="page-bottom plr-10 mt15">
				 	<u-button text="更换位置" color="rgba(119,202,146,0.13)" customStyle="color:#58AA6C;" />
				 	<view style="width: 40rpx;"></view>
				 	<u-button text="分享给好友" color="rgba(119,202,146,0.13)"
				 		customStyle="color:#58AA6C;" />
				 </view>
			 </view>
			 <view class="bg-white plr-10 ptb-10 border-box order-box mt20">
				 <view class="fb f-16">温馨提示</view>
				 <view class="f-14 c-66">
					 <view class="mt10">1.这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容。</view>
					 <view class="mt10">2.这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容。</view>
					 <view class="mt10">3.这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容。</view>
					 <view class="mt10">4.这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容。</view>
					 <view class="mt10">5.这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容。</view>
					 <view class="mt10">6.这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容这里是温馨提示内容。</view>
				 </view>
			 </view>
		</view>
 
	</view>
</template>

<script>
	import { getMerchant, order1, order2, operate1, operate2 } from '@/common/http/api.js';
	export default {
		data() {
			return {
				uuid: '',
				shopMsg: {
					backgroundImages: []
				},
				gonggao: false,
				popShow: false,
				searchKey: '',
				order: []
			};
		},

		computed: {
			 
		},
		
		onShow() {

		},

		methods: {
			/** 导航 */
			openlocation() {
				let that = this;
				uni.openLocation({
					latitude: that.shopMsg.latitude,
					longitude: that.shopMsg.longitude,
					name: that.shopMsg.name,
					address: that.shopMsg.address,
					scale: 28
				})
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #f7f7f7;
		.header-box {
			background: linear-gradient(180deg, #58AA6C 0%, #84C794 100%);
			padding: 20rpx 60rpx 150rpx 60rpx;
			text-align: center;
		}
		.content {
			position: relative;
			top: -100rpx;
			.order-box {
				border-radius: 10px;
				.tip-doing{
					background: #58AA6C;
					border-radius: 8rpx 8rpx 8rpx 8rpx;
				}
				.wifi-box{
					background: #f6f6f6;
				}
				.page-bottom {
				display: flex;
				justify-content: center;
				align-items: center;
			}
			}
		}
 
	}
</style>