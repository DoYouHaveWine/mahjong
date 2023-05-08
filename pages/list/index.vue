<template>
	<view>
		<!-- 搜索 -->
		<view class="search-box flex-box align-center" slot="center">
			<view style="background: #f6f6f6;" class="flex-item flex-box align-center plr-10">
				<view class="flex-box align-center">
					<text class="c-66 f-14">深圳</text>
					<u-icon name="arrow-down" color="#666666" size="14" />
				</view>
				<view class="plr-10">
					<u-search placeholder="搜索门店" v-model="keyword" placeholder-color="#cccccc" shape="square" :showAction="false"
						searchIconSize="0" color="#000000" bg-color="#F6F6F6" :input-style="{ 'font-size': '28rpx' }"
						:action-style="{ color: '#000000', 'font-size': '28rpx' }" @search="onSearch" @custom="onSearch" @change="onSearch"
						@clear="onSearch" />
				</view>
			</view>
			<view class="tc" style="padding-left: 20rpx;">
				<image src="../../static/list/ic_list_map.svg" style="width: 30rpx;height: 30rpx;"></image>
				<view class="f-12 c-66">地图</view>
			</view>
		</view>
		<view class="plr-10">
			<image src="../../static/list/ambition.gif" style="width: 100%;height: 136rpx;" @click="$linkJump({ url:`/pagesA/join/index`})"></image>
		</view>
		<!-- 列表 -->
		<view class="plr-10 border-box">
			<view class="todo-box mb10" v-if="list.length > 0" v-for="item in list" :key="item.uuid">
				<view class="flex-box align-center" style="position: relative;">
					<image :src="item.backgroundImages[0]" style="width: 200rpx;height: 260rpx;" @tap="onShopClick(item)"></image>
					
					<!-- <view class="bt-txt-top bt-txt-top-2 tc f-10 c-33">
						<view class="flexItem">24小时营业</view>
					</view> -->
					
					<view class="flex-item" style="padding-left: 20rpx;">
						<view class="flex-box" @tap="onShopClick(item)">
							<view style="width: 340rpx;" class="fb align-center">
								<text class="f-14">{{item.name}}</text>
							</view>
							<view style="width: 110rpx;" class="align-center">
								<text class="tip-kinds c-white">品牌店</text>
							</view>
						</view>
						<view class="mt10">
							<u--text prefixIcon="map-fill" iconStyle="font-size: 19px;color:#cccccc" :lines="1"
								:text="item.address" size="12" color="#666666"></u--text>
						</view>
						<view class="mt10 c-58aa6c f-12">{{item.differTime}}前有人预定</view>
						<view class="just-between align-center mt10">
							<view>
								<text class="distance plr-10 ptb-5 f-12" v-if="item.distance<1000">据我{{item.distance}}m</text>
								<text class="distance plr-10 ptb-5 f-12" v-if="item.distance>=1000">据我{{new Number(item.distance/1000).toFixed(1)}}km</text>
							</view>
							<view class="flex-box align-center">
								<image @tap="goLocation(item)" src="../../static/list/ic_list_location.svg" class="plr-10" style="width: 40rpx;height: 40rpx;" />
								<image @tap="call(item.businessPhone)" src="../../static/list/ic_list_phone.svg" class="plr-10" style="width: 40rpx;height: 40rpx;" />
							</view>
						</view>
					</view>
				</view>
			</view>
			<load-data v-if="list.length == 0" :loading="loading" />
		</view>
	</view>
</template>

<script>
	import { isLease, auth, queryMerchant } from '@/common/http/api.js';

	export default {
		data() {
			return {
				longitude: 116.397470001,
				latitude: 39.9088230001,
				list: [],
				_list:[],
				isLogin: false,
				authCode: '',
				loading: true,
				show: false,
				keyword: ''
			};
		},

		onLoad(options) {
			let _this = this
			_this.login(function() {
				const value = uni.getStorageSync('cur_mch_uuid');
				if (value) {
					_this.$linkJump({ url:`/pages/index/index`})
				} else {
					_this.getLoc()
				}
			})
		},
		
		computed: {},

		methods: {
			call(phone){
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
			/** 导航 */
			goLocation(item) {
				uni.openLocation({
					latitude: item.latitude,
					longitude: item.longitude,
					name: item.name,
					address: item.address,
					scale: 28
				})
			},
			/** 小程序获取位置 */
			getLoc() {
				uni.getLocation({
					type: 'wgs84',
					success: res => {
						this.longitude = res.longitude;
						this.latitude = res.latitude;
					},
					fail: () => {
						console.error('获取定位失败，请打开GPS开关!');
					},
					complete: () => {
						this.queryList();
					}
				});
			},
			/**
			 * 筛选框点击事件
			 *
			 * @param {Object} e 点击选择的值
			 * @param {Object} category 点击的按键类型
			 */
			checkboxGroupChange(e, category) {
				if (category == 'sortType' && this.distanceSelValue == 2 && !this.opt.lng) {
					// 这里重新定位是避免选择距离排序后再开启定位又回到页面重新选择距离排序
					uni.getLocation({
						type: 'wgs84',
						success: res => {
							this.opt.lng = res.longitude;
							this.opt.lat = res.latitude;
							this.opt[category] = e == 0 ? '' : e;
							this.getList();
						},
						fail: () => {
							uni.showModal({
								title: '获取定位失败',
								content: '无法获取当前定位，故不能按距离排序，请打开GPS开关!',
								showCancel: false
							});
							this.distanceSelValue = this.opt.sortType;
						}
					});
				} else {
					this.opt[category] = e == 0 ? '' : e;
					this.getList();
				}
			},
			/** 搜索门店 */
			onSearch(e) {
				if (e) {
					this.list = this._list.filter((item) => {
						return item.name.indexOf(e) > -1
					})
				} else {
					this.list = this._list
				}
			},
			/** 门店点击 */
			onShopClick(item) {
				let _this = this
				uni.setStorage({
					key: 'cur_mch_uuid',
					data: item.uuid,
					success() {
						_this.$linkJump({ url:`/pages/index/index`})
					}
				})
			},
			async queryList() {
				let _this = this
				let res = await queryMerchant({
					longitude: _this.longitude,
					latitude: _this.latitude,
					isAll: true
				})
				if (res.code === 200) {
					_this.list = res.data
					_this._list = res.data
				}
			},
			async login(fn) {
				let _this = this
				let res = await isLease()
				if (res.code === 200) {
					fn && fn()
				} else if (res.code === 401) {
					_this.isLogin = false;
					_this.autoLogin(fn)
				}
			},
			autoLogin(fn) {
				let _this = this;
				uni.login({
					success: async (res) => {
						if (res.code) {
							_this.authCode = res.code;
							let res1 = await auth({
								authCode: _this.authCode
							})
							if (res1.code === 200) {
								_this.autoLoginSuccess(res1.data.accessToken.accessToken, fn)
							}
						} else {
							console.log('登录失败！')
						}
					}
				})
			},
			autoLoginSuccess(token, fn) {
				let _this = this;
				uni.setStorage({
					key: 'token',
					data: token,
					success: () => {
						_this.isLogin = true;
						_this.login(fn);
					},
				})
			},
		}
	};
</script>

<style lang="scss">
	page {
		background: #ffffff;

		.search-box {
			padding: 20rpx;
		}

		.todo-box {
			box-shadow: 2rpx 6rpx 30rpx 2rpx rgba(109, 75, 23, 0.1);
			border-radius: 16rpx 16rpx 16rpx 16rpx;
			padding: 20rpx;

			.tip-kinds {
				background: linear-gradient(180deg, #90E3B1 0%, #58AA6C 100%);
				border-radius: 10rpx 10rpx 10rpx 10rpx;
				padding: 4rpx 10rpx;
				font-size: 24rpx;
			}

			.distance {
				border-radius: 10rpx 10rpx 10rpx 10rpx;
				border: 1px solid #6DA772;
				color: #58AA6C;
			}

			.c-58aa6c {
				color: #58AA6C;
			}
			
			.bt-txt-top {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				height: 30rpx;
				width: 120rpx;
				border-bottom-right-radius: 6rpx;
			}
			.bt-txt-top-2 {
				background: linear-gradient(136deg, #FDFADA 0%, #FAF3CD 35%, #EFDA9C 58%, #F3E3B5 77%, #F9F0CB 100%);
			}
		}
	}
</style>