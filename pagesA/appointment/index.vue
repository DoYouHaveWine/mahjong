<template>
	<view class="page">
		<!-- 门店信息 -->
		<view class="header-box ptb-10"></view>
		<!-- content -->
		<view class="content ptb-10 plr-10">
			<view class="flex-box align-center bg-white plr-10 ptb-10 border-box todo-box">
				<image src="../../static/index/bg_room.png" style="width: 204rpx;height: 232rpx;"></image>
				<view class="flex-item plr-10">
					<view class="just-between align-center">
						<view class="fb flex-box align-center">
							<text>113</text>
							<text class="plr-5">大包</text>
						</view>
						<view>
							<text class="tip-doing">使用中</text>
						</view>
					</view>
					<view class="just-between align-center mt10">
						<view class="fb f-14">预约须知:</view>
						<navigator url="../help/index.vue">
							<view class="f-14 c-58AA6C fb">使用教程></view>
						</navigator>
					</view>
					<view class="mt10 f-12 c-66">预定下单后，在预约开始时间前后半 小时可以进入门店自助开门，预约时 间到期前可以自助进行续单，请提前 规划好预约时间段。</view>
				</view>
			</view>
			<!-- card -->
			<view class="card-box bg-white mt10">
				<view class="card-header" :class="activeValue==1?'header-1':'header-2'">
					<tab-list :list="tabLists" @change="clickTabs" :bgColor="'transparent'" />
				</view>
				<view class="plr-10 ptb-10 mt10">
					<view class="time-bottom border-box">
						<view class="just-between">
							<view @click="changeDate(i, item.date)" :class="['time-item', { 'active-item': dateActiveIndex === i }]"
								v-for="(item, i) in dateList" :key="item.date">
								<view class="week active-color">{{ item.week }}</view>
								<view class="date active-color">{{ item.date.substring(5, 10) }}</view>
							</view>
						</view>
					</view>
					<view class="flex-box align-center duration-box mt20">
						<text class="c-33 f-16 fb">时长选择：</text>
						<view class="just-between align-center flex-item">
							<view @click="durationClick(item,i)" v-for="(item,i) in timeList" :key="item.value"
								class="duration-item f-14" :class="{ 'active-item': timeActiveIndex === i }">
								<text class="active-color">{{item.label}}</text>
							</view>
						</view>
					</view>
					<view class="flex-box align-center duration-box mt20">
						<text class="c-33 f-16 fb">时间选择：</text>
						<view class="flex-item flex-box align-center f-14 fb" style="justify-content: center;">
							<view class="duration-item active-item time-pad">
								<text class="active-color">14:00</text>
							</view>
							<text class="plr-10 c-66">--</text>
							<view class="duration-item time-pad">
								<text>15:00</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!-- todo -->
			<view class="order-box border-box bg-white plr-10 ptb-10 mt10">
				<view class="just-between align-center dashed f-16 fb ptb-10">
					<view class="c-33">订单总价</view>
					<view style="color: #E57F70 ;">￥100</view>
				</view>
				<view class="just-between align-center f-14 mt10">
					<view class="c-66">预约时长</view>
					<view class="c-33">5小时</view>
				</view>
				<view class="just-between align-center mt10">
					<view class="c-66">包厢单价</view>
					<view class="c-33">20元/小时</view>
				</view>
				<view class="just-between align-center dashed ptb-10">
					<view class="c-66">会员特价</view>
					<view class="c-33">20元/小时</view>
				</view>
				<view class="just-between align-center cash mt10">
					<view class="flex-box align-center">
						<image src="../../static/appointment/ic_appointment_thq.svg"></image>
						<text class="plr-10 c-66">团购券</text>
					</view>
					<view class="c-58AA6C">暂无可用优惠券</view>
				</view>
				<view class="just-between align-center cash mt10">
					<view class="flex-box align-center">
						<image src="../../static/appointment/ic_appointment_yhq.svg"></image>
						<text class="plr-10 c-66">优惠券</text>
					</view>
					<view class="c-58AA6C">暂无可用优惠券</view>
				</view>
				<view class="just-between align-center cash mt10">
					<view class="flex-box align-center">
						<image src="../../static/appointment/ic_appointment_zhye.svg"></image>
						<text class="plr-10 c-66">账户余额</text>
					</view>
					<view style="color: #E57F70;">余额不足,请充值</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		refreshCardList,
		getUnreadMsgNum,
		getInfoArticlePage,
		getAppUpdate
	} from '@/common/http/api.js';
	import dayjs from 'dayjs';
	import tabList from '@/components/tablist/tabList.vue';
	export default {
		components: {
			tabList
		},
		data() {
			return {
				popShow: false,
				tabLists: [{
						label: '小时模式',
						value: 1
					},
					{
						label: '卡券套餐',
						value: 2
					}
				],
				activeValue: 1,
				dateList: [],
				dateActiveIndex: 0,
				timeList: [{
						label: '4小时',
						value: 1
					},
					{
						label: '5小时',
						value: 2
					}, {
						label: '8小时',
						value: 3
					}, {
						label: '其他',
						value: 0
					}
				],
				timeActiveIndex: 0,
			};
		},

		computed: {

		},

		onLoad(options) {
			this.initDate()
		},
		onShow() {

		},

		methods: {
			durationClick(item, i) {
				this.timeActiveIndex = i
				//todo 拿到选中项的value
			},
			initDate() {
				this.dateList = [];
				const weekArr = ['日', '一', '二', '三', '四', '五', '六'];
				for (let i = 0; i < 5; i++) {
					let obj = {
						week: `周${
									weekArr[
										dayjs()
											.add(i, 'day')
											.day()
									]
								}`,
						date: dayjs()
							.add(i, 'day')
							.format('YYYY-MM-DD')
					};
					if (i === 0) {
						obj.week = '今天';
					} else if (i === 1) {
						obj.week = '明天';
					}
					this.dateList.push(obj);
				}
				this.dateActiveIndex = 0;
				this.maxDate = dayjs()
					.add(6, 'day')
					.format('YYYY-MM-DD');
			},
			changeDate(i, date) {
				this.dateActiveIndex = i;
				// this.form.activeDate = date;
			},
			clickTabs(e) {
				this.activeValue = e.value;
			},
			open() {
				this.popShow = true
			},
			close() {
				this.popShow = false
			},
			/**
			 * 页面跳转
			 * @param {String} url 跳转URL
			 * @param {Bool} needToken 是否需要检查登录（获取token）
			 * @param {Bool} needCard 是否需要健康卡
			 */
			async navTo(url, needToken = false, needCard = false) {
				if (needCard) {
					// 跳转需要先建卡时必定需要token
					needToken = true;
				}
				if (needToken && !uni.getStorageSync('token')) {
					// 需要Token但未获取Token
					this.navToAuth();
					return;
				}

				if (needCard && !this.checkBindCard()) {
					// 需要绑卡但未绑卡
					return;
				}

				uni.navigateTo({
					url
				});
			},
			/**
			 * 功能点击回调
			 *
			 * @param {Object} item 功能项
			 */
			async onFuncClick(item) {
				if (item.dev) {
					// 建设中...
					this.$devFuncClick();
					return;
				}
				if (item.url) {
					if (type == 1) {
						uni.switchTab({
							url: item.url
						});
					} else {
						uni.navigateTo({
							url: item.url
						});
					}
				} else {
					switch (item.text) {
						case '开门':
							this.popShow = true
							break;
					}
				}
			}
		}
	};
</script>

<style lang="scss">
	page {

		/deep/.u-scroll-list {
			padding-bottom: 0;
		}

		/deep/.u-scroll-list__indicator {
			margin-top: 14rpx;
		}

		background: #f7f7f7;

		.header-box {
			background: linear-gradient(180deg, #58AA6C 0%, #84C794 100%);
			height: 150rpx;
		}

		.content {
			position: relative;
			top: -150rpx;

			.card-box {
				border-radius: 20rpx 20rpx 20rpx 20rpx;
				border: 4rpx solid #7BC18C;

				.card-header {
					height: 80rpx;
				}

				& /deep/ .tabs {
					color: #fff;
				}

				& /deep/ .tabs-active {
					color: #333;
				}

				& .header-1 {
					background: url('../../static/appointment/bg_appointment_1.png') no-repeat;
					background-size: 100% 100%;
				}

				& .header-2 {
					background: url('../../static/appointment/bg_appointment_2.png') no-repeat;
					background-size: 100% 100%;
				}

				.time-bottom {

					.time-item {
						border-radius: 16rpx;
						padding: 10rpx 18rpx;
						font-size: 24rpx;
						display: flex;
						flex-direction: column;
						text-align: center;

						.date {
							color: #0f1419;
						}

						.week {
							color: rgba(15, 20, 25, 0.5);
						}
					}

				}

				.duration-box {
					.duration-item {
						border-radius: 8rpx 8rpx 8rpx 8rpx;
						border: 1px solid #E4E4E4;
						color: #333333;
						padding: 6rpx 10rpx;
					}

					.time-pad {
						padding: 10rpx 20rpx;
					}
				}

				.active-item {
					background: #58AA6C;
					transition: all 0.4s;

					.active-color {
						color: #fff !important;
						transition: all 0.2s;
					}
				}
			}

			.todo-box {
				box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(109, 75, 23, 0.1);
				border-radius: 16rpx 16rpx 16rpx 16rpx;

				.tip-doing {
					color: #D9A661;
					background: rgba(217, 166, 97, 0.12);
					border-radius: 8rpx 8rpx 8rpx 8rpx;
					opacity: 1;
					border: 1rpx solid #D9A661;
					padding: 4rpx 6rpx;
					font-size: 24rpx;
				}
			}

			.order-box {
				border-radius: 10px;

				.dashed {
					border-bottom: 1px dashed #ccc;
				}

				.cash {
					font-size: 28rpx;

					image {
						width: 44rpx;
						height: 44rpx;
					}
				}
			}
		}
	}
</style>