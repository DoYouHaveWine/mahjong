<template>
	<view class="page">
		<!-- 门店信息 -->
		<view class="header-box">
			<view class="func-grid">
				<view v-if="!item.hidden" class="item" :class="{ 'dev-func-style': item.dev }" v-for="(item, index) in funcList"
					:key="index" @click="onFuncClick(item)">
					<view class="image-box">
						<image :src="item.src" />
					</view>
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>
		<!-- content -->
		<view class="content plr-10">
			<!-- card -->
			<view class="card-box bg-white">
				<view>
					<image :src="shopMsg.backgroundImages[0]" style="width: 100%;height: 340rpx;"></image>
				</view>
				<view class="just-between align-center plr-10 ptb-5">
					<text class="c-33 f-16 fb">{{shopMsg.name}}</text>
					<view style="width: 160rpx;height: 48rpx;">
						<u-button shape="circle" color="linear-gradient(299deg, #E5C284 0%, #F8E6CD 100%)" size="mini"
							customStyle="width: 100%;height: 100%;color:#4B320D" @click="goList()">切换门店></u-button>
					</view>
				</view>
				<view class="just-between align-center plr-10 ptb-10">
					<view>
						<u--text prefixIcon="map" iconStyle="font-size: 19px;color:#cccccc" :lines="1" :text="shopMsg.address"
							size="12" color="#666666"></u--text>
						<view class="mt10">
							<text class="distance plr-10 ptb-5 f-12" v-if="shopMsg.distance<1000">据我{{shopMsg.distance}}m</text>
							<text class="distance plr-10 ptb-5 f-12" v-if="shopMsg.distance>=1000">据我{{new Number(shopMsg.distance/1000).toFixed(1)}}km</text>
						</view>
					</view>
					<view class="flex-box align-center">
						<view class="plr-10" @tap="openlocation">
							<image src="../../static/index/ic_index_dh.svg" style="width: 52rpx;height: 52rpx;"></image>
							<view class="f-12 c-66">导航</view>
						</view>
						<view class="plr-10" @tap="call(shopMsg.businessPhone)">
							<image src="../../static/index/ic_index_kf.svg" style="width: 52rpx;height: 52rpx;"></image>
							<view class="f-12 c-66">客服</view>
						</view>
					</view>
				</view>
			</view>
			<!-- banner -->
			<view class="ptb-5" @tap="goRecharge()">
				<image src="../../static/index/banner_index.png" style="width: 100%;height: 108rpx;" mode=""></image>
			</view>
			<!-- todo -->
			<view v-for="(item,index) in shopMsg.rooms" :key='index' class="todo-box bg-white plr-5 ptb-10 mb10 border-box">
				<view class="flex-box align-center" style="position: relative;">
					<image :src="item.backgroundImage" style="width: 200rpx;height: 260rpx;"></image>
					
					<block v-if="item.equipmentUuid">
						<view v-if="item.isUse==0" class="status-box1 tc align-center">空闲中</view>
						<view v-else-if="item.isUse==1" class="status-box2 tc align-center">{{item.finishTime.substring(11, 16)}} 结束</view>
						<view v-else-if="item.isUse==2" class="status-box3 tc align-center">保洁中</view>
						<view v-else-if="item.isUse==3" class="status-box4 tc align-center">开局中</view>
					</block>
					<block v-if="!item.equipmentUuid">
						<view class="status-box5 tc align-center">暂停预订</view>
					</block>
					
					<view class="flex-item plr-10">
						<view class="just-between align-center">
							<view class="fb flex-box align-center">
								<text class="f-14">{{item.name}}</text>
							</view>
							
						</view>
						<view class="mt10 f-12">
							<view class="just-between align-center" style="background-color: #EDFAF1; padding: 8rpx 20rpx;">
								<view style="color: #58AA6C;">舒适中包4小时</view>
								<view style="color: #E57F70;">49.90元</view>
							</view>
							<view class="just-between align-center mt5" style="background-color: #EDFAF1; padding: 8rpx 20rpx;">
								<view style="color: #58AA6C;">优惠套餐6小时</view>
								<view style="color: #E57F70;">49.90元</view>
							</view>
						</view>
						<view class="tips-box mt5 f-10">
							<text>独立空调</text>
							<text>Wifi</text>
							<text>沙发</text>
							<text>纸巾</text>
							<text>独立窗户</text>
							<!-- <view class="f-14">{{item.description}}</view> -->
						</view>
						<view class="just-between align-center mt10">
							<!-- <view>
								<view class="f-14 c-33">原价：{{ item.unitPrice }}元/1小时</view>
								<view>
									<text class="f-12" style="color: #E57F70;">福利：卡劵限时特惠</text>
								</view>
							</view> -->
							<view></view>
							<view v-if="item.equipmentUuid && item.type==1" style="width: 120rpx;height: 48rpx;">
								<u-button v-if="item.isUse==0 || item.isUse==2" shape="" size="mini" customStyle="width: 100%;height: 100%;color:#ffffff;background:#58AA6C;font-size:24rpx;" @click="gobook(item)">预约</u-button>
								<u-button v-else shape="" size="mini" customStyle="width: 100%;height: 100%;color:#999999;font-size:24rpx;">预约</u-button>
							</view>
							<view v-if="item.equipmentUuid && item.type==2" style="width: 120rpx;height: 48rpx;">
								<u-button shape="" size="mini" customStyle="width: 100%;height: 100%;color:#ffffff;background:#58AA6C;font-size:24rpx;" @click="gobook(item)">预约</u-button>
							</view>
						</view>
					</view>
				</view>
				<view class="tip-box mt15">
					<view class="just-between mt10">
						<view v-for="(item2,index2) in item.nowArr" :key='index2' class="flex-item align-center">
							<view v-if="!item2.unused" class="b-d tr flex-box align-center">
								<view v-if="index2%2==0" class="b-d-1 tr"></view>
								<view v-if="index2%2!=0" class="b-d-2 tr"></view>
							</view>
							<view v-else class="b-a tr v-middle flex-box align-center">
								<view v-if="index2%2==0" class="b-a-1 tr"></view>
								<view v-if="index2%2!=0" class="b-a-2 tr"></view>
							</view>
						</view>
					</view>
					<view class="just-between">
						<view v-for="(item2,index2) in item.nowArr" :key='index2' class="flex-item">
							<view v-if="index2%2==0 && item2.id!=24" class="tl mt5 f-8 ">{{item2.id}}</view>
							<view v-if="index2%2!=0 && item2.id!=24" class="tl mt5 f-8">{{item2.id}}</view>
							<view v-if="item2.id==24" class="tl mt5 f-8"><view>次</view><view>日</view></view>
						</view>
					</view>
					<view class="flex-box align-center mt10">
						<view class="marks marks-active"></view>
						<text class="plr-10 f-10 c-33">已预约时段</text>
						<view class="marks marks-default"></view>
						<text class="plr-10 f-10 c-33">可预约时段</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 弹层 -->
		<u-popup :show="popShow" mode="center" @close="close" @open="open" bgColor="transparent">
			<view class="open-door border-box">
				<image src="../../static/index/ic_index_km.png" mode=""></image>
				<view class="ptb-20">
					<u-button @click="tongdian(order[0].uuid, 1, 1)" shape="circle" size="large" color="linear-gradient(179deg, #90E3B1 0%, #58AA6C 100%)" customStyle="width: 100%;height: 80rpx;color:#ffffff;">开门上电</u-button>
					<u-button v-if="order[0].merchantEquipment" @click="tongdian2(order[0].uuid, 1)" shape="circle" size="large" color="rgba(119,202,146,0.13)" customStyle="width: 100%;height: 80rpx;margin-top:40rpx;border: 2rpx solid #6DA772;color:#58AA6C;">开大门</u-button>
				</view>
			</view>
		</u-popup>
		
		<u-popup :show="gonggao" mode="center" bgColor="transparent">
			<view class="open-gonggao border-box">
				<view v-if="shopMsg.businessState==2" class="mb10 f-20 fb tc">暂停营业</view>
				<view v-if="shopMsg.businessState==11" class="mb10 f-20 fb tc">营业通告</view>
				<view class="mt10 mb10 f20 tl c-33">{{shopMsg.businessNotice}}</view>
				<view class="">
					<u-button shape="circle" size="large" color="rgba(119,202,146,0.13)" customStyle="width: 100%;height: 80rpx;margin-top:40rpx;border: 2rpx solid #6DA772;color:#58AA6C;" @click="confirm()">已了解</u-button>
				</view>
			</view>
		</u-popup>
		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
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
				unreadMsgNum: '',
				
				order: [],
				
				funcList: [{
						idx: 1,
						text: '开门',
						src: '/static/index/ic_index_km.svg',
						url: '',
						hidden: false // 是否隐藏
					},
					{
						idx: 2,
						text: '续单',
						src: '/static/index/ic_index_xd.svg',
						url: ''
					},
					{
						text: '自助验券',
						src: '/static/index/ic_index_mtyq.svg',
						type: 4,
						url: `/pages/preferential/index`
					},
					{
						text: '充值中心',
						src: '/static/index/ic_index_dyyq.svg',
						type: 4,
						url: `/pages/preferential/index`
					}
				]
			};
		},

		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			}
		},
		
		onShow() {
			this.uuid = uni.getStorageSync('cur_mch_uuid')
			if (this.uuid) {
				this.get();
				
				this.getOrder();
			} else {
				uni.removeStorageSync('cur_mch_uuid')
				uni.reLaunch({ url: '/pages/list/index' })
			}
		},

		methods: {
			async get() {
				let _this = this;
				let res = await getMerchant({
					merchantUuid: _this.uuid
				})
				if (res.code === 200) {
					let data = res.data;
					_this.shopMsg = data;
					_this.merchantName = _this.shopMsg.name;
					
					uni.setStorageSync('cur_mch_cuid', _this.shopMsg.contactorUuid)
					
					if (_this.shopMsg.businessState == 1) {
						_this.gonggao = false
					} else if (_this.shopMsg.businessState == 2) {
						_this.gonggao = true
					} else if (_this.shopMsg.businessState == 11) {
						_this.gonggao = true
					}
					// _this.isClose = true
					for (let i in _this.shopMsg.rooms) {
						let room = _this.shopMsg.rooms[i]
						if (room.type == 1) {
							_this.type1++;
						} else if (room.type == 2) {
							_this.type2++;
						}
					}
					
					if (_this.roomUuid) {
						let room = _this.shopMsg.rooms.filter(item => {
							return item.uuid == _this.roomUuid;
						})[0];
						if (room) {
							if (room.type == 2) {
								_this.showType = 2
								_this.goBooking(room)
							} else if (room.type == 1 && room.isUse == 0) {
								_this.showType = 1
								_this.goBooking(room)
							} else if (room.type == 1 && room.isUse == 2) {
								_this.showType = 1
								uni.showActionSheet({
									itemList: ['保洁中，暂开1分钟', '整洁干净，确认开房'],
									itemColor: '#58AA6C',
									success: function (res) {
										if (res.tapIndex == 0) {
											_this.tongdian(room.uuid, function() {
												_this.goBooking(room)
											})
										} else if (res.tapIndex == 1) {
											_this.goBooking(room)
										}
									}
								});
							}
						}
					} else {
						if (_this.shopMsg.rooms.length > 0) {
							_this.showType = _this.shopMsg.rooms[0].type
						}
					}
				}
			},
			open() {
				this.popShow = true
			},
			close() {
				this.popShow = false
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
					this.$linkJump({
						url:item.url
					})
				} else {
					if (item.idx == 1) {
						if (!this.order || this.order.length == 0) {
							uni.showToast({
								duration: 2000,
								icon: 'none',
								title: '暂无预约订单'
							})
						} else if (this.order.length > 1) {
							uni.showToast({
								duration: 2000,
								icon: 'error',
								title: '多个订单，请从订单页面操作'
							})
						} else {
							this.popShow = true
						}
					} else if (item.idx == 2) {
						if (!this.order || this.order.length == 0) {
							uni.showToast({
								duration: 2000,
								icon: 'none',
								title: '暂无预约订单'
							})
						} else if (this.order.length > 1) {
							uni.showToast({
								duration: 2000,
								icon: 'error',
								title: '多个订单，请从订单页面操作'
							})
						} else {
							
						}
					}
					
				}
			},
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
			},
			call(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
			goRecharge(){
				this.$linkJump({ url: '/pages/preferential/index' })
			},
			goList() {
				uni.removeStorageSync('cur_mch_uuid')
				uni.reLaunch({ url: '/pages/list/index' })
			},
			confirm() {
				let _this = this;
				if (_this.shopMsg.businessState == 2) {
					_this.gonggao = false
					// uni.navigateBack({
					// 	delta: 1
					// })
				} else if (_this.shopMsg.businessState == 11) {
					_this.gonggao = false
				} else {
					_this.gonggao = false
				}
			},
			gobook(item) {
				console.log(item)
				let _this = this
				if (item.type == 2) {
					_this.goBooking(item)
				} else if(item.type == 1 && item.isUse == 2) {
					uni.showActionSheet({
						itemList: ['保洁中，暂开1分钟', '整洁干净，确认开房'],
						itemColor: '#58AA6C',
						success: function (res) {
							if (res.tapIndex == 0) {
								_this.tongdian(item.uuid, function() {
									_this.goBooking(item)
								})
							} else if (res.tapIndex == 1) {
								_this.goBooking(item)
							}
						}
					});
				} else if (item.type == 1 && item.isUse == 0) {
					_this.goBooking(item)
				}
			},
			goBooking(room) {
				this.$linkJump({ url:`/pagesA/appointment/booking?rid=${room.uuid}`})
			},
			
			async getOrder() {
				let _this = this;
				let res = await order1()
				if (res.code === 200) {
					_this.order = res.data;
				}
			},
			async tongdian(uuid, type, mode) {
				let _this = this;
				let res = await operate1({
					orderId: uuid,
					orderType: type,
					mode: mode
				})
				if (res.code === 200) {
					uni.showToast({
						title: '操作成功',
						duration: 2000
					});
				} else {
					uni.showToast({
						title: res.data.message,
						icon:'none',
						duration: 2000
					});
				}
			},
			async tongdian2(uuid, type) {
				let _this = this;
				let res = await operate2({
					orderId: uuid,
					orderType: type
				})
				if (res.code === 200) {
					uni.showToast({
						title: '操作成功',
						duration: 2000
					});
				} else {
					uni.showToast({
						title: res.data.message,
						icon:'none',
						duration: 2000
					});
				}
			},
		}
	};
</script>

<style lang="scss">
	page {
		.header-box {
			background: linear-gradient(180deg, #58AA6C 0%, #84C794 100%);

			.func-grid {
				overflow: hidden;
				width: 100%;
				display: flex;
				flex-wrap: wrap;

				.item {
					display: flex;
					width: 25%;
					height: 160rpx;
					text-align: center;
					align-items: center;
					flex-direction: column;
					justify-content: center;

					image {
						width: 52rpx;
						height: 56rpx;
					}

					text {
						color: #fff;
						font-family: PingFang SC-Semibold;
						font-weight: 500;
						font-size: 28rpx;
						margin-top: 12rpx;
					}
				}
			}
		}

		.content {
			.card-box {
				box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(18, 80, 33, 0.1);
				border-radius: 16rpx 16rpx 16rpx 16rpx;

				.distance {
					border-radius: 10rpx 10rpx 10rpx 10rpx;
					border: 1px solid #6DA772;
					color: #58AA6C;
				}
			}

			.todo-box {
				box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(109, 75, 23, 0.1);
				border-radius: 16rpx 16rpx 16rpx 16rpx;
				
				.tips-box {
					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: space-between;

					text {
						border-radius: 10rpx 10rpx 10rpx 10rpx;
						border: 2rpx solid #B9E0BD;
						color: #B9E0BD;
						padding: 4rpx 6rpx;
						margin-top: 10rpx;
					}
				}
				.tip-box{
					.marks{
						width: 24rpx;
						height: 24rpx;
					}
					.marks-active{
						background: #58AA6C;
					}
					.marks-default{
						background: #EEEEEE;
					}
				}
			}
			.status-box1 {
				position: absolute;
				bottom: 0;
				left: 0;
				height: 40rpx;
				line-height: 40rpx;
				background-color: #58AA6C;
				color: #FFFFFF;
				width: 200rpx;
				font-size: 22rpx;
			}
			
			.status-box2 {
				position: absolute;
				bottom: 0;
				left: 0;
				height: 40rpx;
				line-height: 40rpx;
				background-color: #E57F70;
				color: #333333;
				width: 200rpx;
				font-size: 22rpx;
			}
			
			.status-box3 {
				position: absolute;
				bottom: 0;
				left: 0;
				height: 40rpx;
				line-height: 40rpx;
				background-color: #FF9200;
				color: #FFFFFF;
				width: 200rpx;
				font-size: 22rpx;
			}
			
			.status-box4 {
				position: absolute;
				bottom: 0;
				left: 0;
				height: 40rpx;
				line-height: 40rpx;
				background-color: #999999;
				color: #FFFFFF;
				width: 200rpx;
				font-size: 22rpx;
			}
			
			.status-box5 {
				position: absolute;
				bottom: 0;
				left: 0;
				height: 40rpx;
				line-height: 40rpx;
				background-color: #999999;
				color: #FFFFFF;
				width: 200rpx;
				font-size: 22rpx;
			}
			
		}
		.open-door{
			width: 520rpx;
			padding: 80rpx 40rpx;
			background: linear-gradient(180deg, #D1E8E3 0%, #FFFFFF 100%);
			border-radius: 20rpx 20rpx 20rpx 20rpx;
			position: relative;
			
			image{
				width: 256rpx;
				height: 256rpx;
				position: absolute;
				top: -140rpx;
				left: 50%;
				transform: translateX(-50%);
			}
		}
		.open-gonggao{
			width: 520rpx;
			padding: 40rpx 40rpx;
			background: linear-gradient(180deg, #D1E8E3 0%, #FFFFFF 100%);
			border-radius: 20rpx 20rpx 20rpx 20rpx;
			position: relative;
			
		}
		.b-a{
			background-color: #F4F4F4;
			height: 14upx;
			
			.b-a-1 {
				height: 14upx;
				width: 1px;
				background-color: #CCCCCC;
			}
			.b-a-2 {
				height: 2px;
				width: 2px;
				border-radius: 2px;
				background-color: #CCCCCC;
			}
		}
		.b-d{
			background-color: #58AA6C;
			height: 14upx;
			
			.b-d-1 {
				height: 14upx;
				width: 1upx;
				background-color: #FFFFFF;
			}
			.b-d-2 {
				height: 2px;
				width: 2px;
				border-radius: 2px;
				background-color: #FFFFFF;
			}
		}
	}
</style>