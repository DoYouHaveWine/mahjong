<template>
	<view class="mine-page">
		<view class="">
			<image src="../../static/help/banner_help.png" style="width: 100%;height: 280rpx;"></image>
		</view>
		<view class="mt10 f-14 c-33">
			简介详情
		</view>
		<view class="c-33 f-18 fb mt10">预约使用教程</view>
		<view class="mt10">
			<view class="steps item-1 mt5">
				<view class="plr-15">
					<view class="c-58AA6C f-16">01.小程序预约</view>
					<view class="c-66 f-12 mt10">小程序预约下单，并完成支付</view>
				</view>
			</view>
			<view class="help-next tc mt5">
				<image src="../../static/help/help_next.svg"></image>
			</view>
			<view class="steps item-2 mt5">
				<view class="plr-15">
					<view class="c-58AA6C f-16">02.点击‘确认到店’开门</view>
					<view class="c-66 f-12 mt10">到达门店后，点击“确认到店”开始订单并开门</view>
				</view>
			</view>
			<view class="help-next tc mt5">
				<image src="../../static/help/help_next.svg"></image>
			</view>
			<view class="steps item-3 mt5">
				<view class="plr-15">
					<view class="c-58AA6C f-16">03.找到预约房间</view>
					<view class="c-66 f-12 mt10">进店后，找到您所预约的房间，享受美好时光</view>
				</view>
			</view>
			<view class="help-next tc mt5">
				<image src="../../static/help/help_next.svg"></image>
			</view>
			<view class="steps item-4 mt5">
				<view class="plr-15">
					<view class="c-58AA6C f-16">04.离店自动结算</view>
					<view class="c-66 f-12 mt10">时间到，携带好随身物品离店自动结算</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		},
		computed: {},

		onShow() {},

		onLoad() {},

		methods: {}
	};
</script>

<style lang="scss">
	.mine-page {
		padding: 20rpx;
		box-sizing: border-box;
		.steps{
			width: 100%;
			height: 144rpx;
			display: flex;
			align-items: center;
			.c-58AA6C{
				color: #58AA6C;
			}
		}
		& .item-1{
			background: url('../../static/help/help_step1.png') no-repeat;
			background-size: 100% 100%;
		}
		& .item-2{
			background: url('../../static/help/help_step2.png') no-repeat;
			background-size: 100% 100%;
		}
		& .item-3{
			background: url('../../static/help/help_step3.png') no-repeat;
			background-size: 100% 100%;
		}
		& .item-4{
			background: url('../../static/help/help_step4.png') no-repeat;
			background-size: 100% 100%;
		}
		.help-next{
			image{
				width: 28rpx;
				height: 40rpx;
			}
		}
	}
	
</style>