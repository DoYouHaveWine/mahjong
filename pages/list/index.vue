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
					<u-search placeholder="搜索门店" v-model="opt.name" placeholder-color="#cccccc" shape="square" :showAction="false"
						searchIconSize="0" color="#000000" bg-color="#F6F6F6" :input-style="{ 'font-size': '28rpx' }"
						:action-style="{ color: '#000000', 'font-size': '28rpx' }" @search="onSearch" @custom="onSearch"
						@clear="onSearch" />
				</view>
			</view>
			<view class="tc" style="padding-left: 20rpx;">
				<image src="../../static/list/ic_list_map.svg" style="width: 30rpx;height: 30rpx;"></image>
				<view class="f-12 c-66">地图</view>
			</view>
		</view>
		<view class="plr-10">
			<image src="../../static/list/banner_list.jpg" style="width: 100%;height: 136rpx;" @click="$linkJump({ url:`/pagesA/join/index`})"></image>
		</view>
		<!-- 列表 -->
		<view class="plr-10 border-box">
			<view class="todo-box mt10" v-if="list.length" v-for="item in list" :key="item.id" @click="$linkJump({ url: '/pages/index/index' })">
				<view class="flex-box align-center">
					<image :src="item.logo" style="width: 204rpx;height: 232rpx;"></image>
					<view class="flex-item" style="padding-left: 20rpx;">
						<view class="just-between align-center">
							<view class="fb flex-box align-center">
								<text>{{item.name}}</text>
							</view>
							<view>
								<text class="tip-kinds c-white">{{item.tips}}</text>
							</view>
						</view>
						<view class="mt10">
							<u--text prefixIcon="map-fill" iconStyle="font-size: 19px;color:#cccccc" :lines="1"
								:text="item.address" size="12" color="#666666"></u--text>
						</view>
						<view class="mt10 c-58aa6c f-12" v-if="item.mark">{{item.mark}}小时前有人预定</view>
						<view class="just-between align-center mt10">
							<view>
								<text class="distance plr-10 ptb-5 f-12">据我{{item.distance}}</text>
							</view>
							<view class="flex-box align-center">
								<image @click.stop="()=>goLocation(item)" src="../../static/list/ic_list_location.svg" style="width: 40rpx;height: 40rpx;" />
								<image @click.stop="()=>call(item.phone)" src="../../static/list/ic_list_phone.svg" class="plr-10" style="width: 40rpx;height: 40rpx;" />
							</view>
						</view>
					</view>
				</view>
			</view>
			<load-data v-else :loading="loading" />
		</view>
	</view>
</template>

<script>
	import { getDictList, getHosList, getRegionListv1, setDefaultHos } from '@/common/http/api.js';

	export default {
		data() {
			return {
				list: [{
					logo:'../../static/index/bg_room.png',
					name:'深圳-华侨创意园',
					tips:'标准店',
					address:'广东深圳龙岗区季华路276号文创园',
					mark:1,
					distance:'315KM',
					phone:'0755-123456',
					lat: '23.22', // 纬度
					lng: '141.52' // 经度
				},{
					logo:'../../static/index/bg_room.png',
					name:'深圳-龙岗园',
					tips:'概念店',
					address:'广东深圳龙岗区季华路276号文创园',
					mark:1,
					distance:'45KM',
					phone:'0755-123456',
					lat: '23.22', // 纬度
					lng: '141.52' // 经度
				}],
				loading: true,
				show: false
			};
		},

		onLoad(options) {

		},

		computed: {},

		methods: {
			call(num){
				console.log(num)
				uni.makePhoneCall({
					phoneNumber: num //仅为示例
				});
			},
			/** 导航 */
			goLocation(item) {
				console.log(item)
				uni.openLocation({
					latitude: item.lat,
					longitude: item.lng,
					name: item.name
				});
			},
			/** 小程序获取位置 */
			getLoc() {
				uni.getLocation({
					type: 'wgs84',
					success: res => {
						this.opt.lng = res.longitude;
						this.opt.lat = res.latitude;
					},
					fail: () => {
						console.error('获取定位失败，请打开GPS开关!');
					},
					complete: () => {
						this.getList();
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
			onSearch() {
				this.getList();
			},
			/**
			 * 门店点击
			 * @param {Object} item 门店Item
			 */
			onShopClick(item) {
				
			}
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
				padding: 4rpx 6rpx;
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
		}
	}
</style>