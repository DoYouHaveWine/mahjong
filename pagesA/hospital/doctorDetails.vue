<template>
	<view class="plr-20 border-box">
		<view class="header"></view>
		<view class="doctor-box">
			<view class="item">
				<view class="left">
					<image v-if="msg.logo" class="icon" :src="serverUrl + msg.logo" />
					<image v-else class="icon" src="/static/social/ic_hospital.svg" />
				</view>
				<view class="center">
					<text class="name f-16">王医生</text>
					<view class="level-type-name mt5 c-ed8c53">
						<text>副主任医师</text>
						<text class="plr-5">消化科</text>
					</view>
					<u-text :lines="2" text="医生简介：心内科超出省略超出省asdasd略超出省略" color="#999999" :size="13" />
					<view class="tip-box mt5 c-99">
						<text class="tip-items">糖尿病</text>
						<text class="tip-items">尿毒症</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 医生排班 -->
		<view class="mt20">
			<text class="fb title f-16">医生全部排班</text>
			<view class="scheduling-box bg-white mt20">
				<!-- <view class="just-between align-center">
          <view class="">7-15</view>
          <text>|</text>
          <view class=""></view>
        </view> -->
				<view class="scheduling-item plr-20 ptb-10 flex-box align-center">
					<view class="flex-item">
						<view class="f-14">
							<text>2022-07-16</text>
							<text class="plr-10">周六</text>
							<text class="days f-12 c-99">一天后</text>
						</view>
						<view class="c-ed8c53 f-14 mt10">￥70</view>
					</view>
					<u-button type="primary" size="small" shape="circle">余60</u-button>
				</view>
			</view>
		</view>
		<!-- 同科室医生推荐 -->
		<view class="mt20">
			<view class="just-between align-center">
				<text class="fb title f-16">同科室医生推荐</text>
				<text class="f-12 c-99">更多</text>
			</view>
			<view class="doctor-box mt20">
				<view class="item">
					<view class="left">
						<image v-if="msg.logo" class="icon" :src="serverUrl + msg.logo" />
						<image v-else class="icons" src="/static/social/ic_hospital.svg" />
					</view>
					<view class="center">
						<view class="">
							<text class="name f-16">王医生</text>
							<text class="levelName c-ed8c53 f-12 plr-5">副主任医师</text>
						</view>
						<view class="ptb-5" style="border-bottom: 1px solid #ccc;">
							<u-text :lines="1" text="擅长：心内科超出省略超出省asdasd略超出省略" color="#999999" :size="13" />
						</view>
						<view class="just-between mt5 c-99">
							<text></text>
							<view class="flex-box align-center">
								<text class="c-ed8c53 f-14 plr-10">￥70</text>
								<u-button type="primary" size="small" color="#4298ff" shape="circle">余60</u-button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- popup -->
		<u-popup :show="show" :round="10" mode="bottom" @close="close" @open="open">
			<view class="plr-10 ptb-10">
				<view class="just-between align-center">
					<text></text>
					<text class="f-20 fb">选择预约时间段</text>
					<text class="f-20 fb c-99">×</text>
				</view>
				<view class="mt20">
					<text class="title">上午号源</text>
					<view class="just-between source-box">
						<view v-for="(item, index) in sourseList" class="source-item mt15">
							<u-button
								:color="index == activeIndex ? '#4298ff' : ''"
								:plain="index == activeIndex ? true : false"
								:disabled="item.count == 0 ? true : false"
								@click="chooseTime(index)"
							>
								09:00-09:30 剩余12
							</u-button>
						</view>
						<!-- <view class="source-item mt15">
              <u-button type="primary" plain>09:00-09:30 剩余12</u-button>
            </view>
            <view class="source-item mt15">
              <u-button disabled>09:00-09:30 剩余12</u-button>
            </view>
            <view class="source-item mt15">
              <u-button>09:00-09:30 剩余12</u-button>
            </view>
            <view class="source-item mt15">
              <u-button>09:00-09:30 剩余12</u-button>
            </view> -->
					</view>
				</view>
				<view class="mt20">
					<text class="title">下午号源</text>
					<view class="just-between source-box">
						<view class="source-item mt15"><u-button>09:00-09:30 剩余12</u-button></view>
						<view class="source-item mt15"><u-button>09:00-09:30 剩余12</u-button></view>
						<view class="source-item mt15"><u-button>09:00-09:30 剩余12</u-button></view>
						<view class="source-item mt15"><u-button>09:00-09:30 剩余12</u-button></view>
					</view>
				</view>
				<view class="mt20">
					<u-button
						type="primary"
						shape="circle"
						@click="payTo(orderNum)"
						throttleTime="1000"
						block
						text="确认预约"
					/>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { getDeptListById } from '@/common/http/api.js';
export default {
	data() {
		return {
			show: true,
			activeIndex: 0,
			sourseList: [
				{ time: '09:00-09:30', count: 5 },
				{ time: '09:00-09:30', count: 0 },
				{ time: '09:00-09:30', count: 5 },
				{ time: '09:00-09:30', count: 5 }
			]
		};
	},
	onLoad() {},
	methods: {
		close() {
			this.show = false;
		},
		open() {
			this.show = true;
		},
		chooseTime(index) {
			this.activeIndex = index;
		}
	}
};
</script>

<style lang="scss">
page {
	background: $uni-f9f9f9;
	.header {
		position: absolute;
		height: 120rpx;
		width: 100%;
		&::after {
			width: 140%;
			height: 100%;
			position: absolute;
			left: -20%;
			top: 0;
			z-index: -1;
			content: '';
			border-radius: 0 0 50% 50%;
			background: linear-gradient(180deg, #66acff 0%, #3683ff 99.99%, #4298ff 100%);
		}
	}
	.doctor-box {
		box-shadow: 0rpx 2rpx 20rpx 2rpx #0000000d;
		.item {
			background: $uni-ffffff;
			display: flex;
			justify-content: space-between;
			padding: 20rpx;
			border-radius: 10px;

			.left {
				.icon {
					width: 180rpx;
					height: 180rpx;
					border-radius: 50%;
					background: #aaa;
				}
				.icons {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					background: #aaa;
				}
			}

			.center {
				flex: 1;
				margin: 0 20rpx;
				.level-type-name {
					font-size: 24rpx;
					margin: 6rpx 0;
				}
				.name {
					margin-right: 10rpx;
				}
				.levelName {
					border: 1px solid #ed8c53;
					border-radius: 5px;
				}
				.tip-box {
					font-size: 24rpx;
					.tip-items {
						padding: 0px 5px;
						border-radius: 4px;
						text-align: center;
						background-color: #e6f1ff;
						&:nth-child(2) {
							margin: 0 15rpx;
						}
					}
				}
			}
		}
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
	.scheduling-box {
		border-radius: 10px;
		.scheduling-item {
			// border-top: 1px solid #ccc;
			.u-button {
				width: auto;
			}
		}
	}
	.source-count {
		background: #4298ff;
		border-radius: 25px;
		padding-top: 8rpx;
		padding-bottom: 8rpx;
	}
	.c-ed8c53 {
		color: #ed8c53;
	}
	.days {
		padding: 0px 5px;
		border-radius: 4px;
		text-align: center;
		background-color: #e6f1ff;
	}
	.source-box {
		flex-wrap: wrap;
		.source-item {
			width: 30%;
		}
	}
}
</style>
