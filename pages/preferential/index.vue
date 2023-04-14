<template>
	<view class="page">
		<view class="header">
			<tab-list :list="tabList" @change="clickTabs" />
		</view>
		<view class="content-box mt15">
			<template v-if="activeValue==1">
				<view class="account-header">
					<view class="just-between align-center">
						<view class="c-white">
							<view class="fb f-40">2000.00</view>
							<text class="f-12 mt10">可用余额(元)</text>
						</view>
						<view class="f-14 tc">
							<view class="account-btn">查看使用明细></view>
							<view class="account-btn mt10">查看可用门店></view>
						</view>
					</view>
					<view class="account-tips flex-box align-center">
						<u-icon name="info-circle" color="#ffffff" size="18"></u-icon>
						<text class="f-12 c-white plr-5">充值福利限时放送,充值赠送现金,还能享受门店会员价！</text>
					</view>
				</view>
				<view class="recharge mt15">
					<view class="fb f-18">充值套餐</view>
					<view class="recharge-box just-between align-center mt20">
						<view class="recharge-items ptb-20 plr-20" :class="activeRecharge==index?'active':''"
							@click="activeRecharge=index" v-for="(item,index) in rechargeList" :key="item.id">
							<text class="f-20">{{item.val}}元</text>
							<text class="f-12 mt10">到账{{item.nval}}元</text>
						</view>
					</view>
					<view style="position:'relative';width:'90%';left:'5%';" class="mt20">
						<u-button text="立即充值" color="linear-gradient(313deg, #58AA6C 0%, #84C794 100%)"></u-button>
						<view class="tc mt10 f-12 c-99">点击充值,则表示已阅读并同意<text style="color: #66A9F6;">《充值说明》</text></view>
					</view>
				</view>
			</template>
			<template v-if="activeValue==2">
				2
			</template>
			<template v-if="activeValue==3">
				3
			</template>
			<template v-if="activeValue==4">
				4
			</template>
			<!-- 使用弹窗Dialog是避免请求时切换tab，数据会混乱 -->
			<!-- <load-data v-else :loading="loading" isLoadingDialog /> -->
		</view>
		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
	import tabList from '@/components/tablist/tabList.vue';
	export default {
		components: {
			tabList
		},
		data() {
			return {
				tabList: [{
						label: '账户充值',
						value: 1
					},
					{
						label: '团购券',
						value: 2
					},
					{
						label: '优惠券',
						value: 3
					},
					{
						label: '自助验券',
						value: 4
					}
				],
				activeValue: 1, //选中tab
				rechargeList: [{
						id: 1,
						val: 500,
						nval: 638
					},
					{
						id: 2,
						val: 800,
						nval: 1038
					}, {
						id: 3,
						val: 1500,
						nval: 2038
					}
				],
				activeRecharge: 0,
				districtSelValue: 0, // 默认选中的Options中的value值（注意并非index）
				hosSelValue: 0,
				distanceSelValue: 1, // 默认选中的Options中的value值（注意并非index）
				// 综合筛选（这里暂时没接数据）
				distanceOptions: [{
						label: '综合排序',
						value: 1
					},
					{
						label: '距离优先',
						value: 2
					},
					{
						label: '等级优先',
						value: 3
					}
				],
				opt: {
					district: '', // 所属地区
					lat: '', // 纬度
					lng: '', // 经度
					hospitalType: '', // 医院类型
					name: '',
					sortType: 1, //排序方式(1:综合排序,2:距离优先,3:等级优先)
					adminLevel: '3' //行政级别(1:市级;2:县级;3:社区)
				},
				dataList: [],
				loading: true
			};
		},

		onLoad(options) {
			// this.getLoc();
			// this.getConfigData();
		},

		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			}
		},

		methods: {
			clickTabs(e) {
				this.activeValue = e.value;
			},
			rechargeTabs(index) {
				this.activeRecharge = index
			},
			goLocation(item) {
				uni.openLocation({
					latitude: item.lat,
					longitude: item.lng,
					name: item.name
				});
			},

			async toPage(item) {
				//const { data } = await setDefaultHos(item.id);
				uni.navigateTo({
					url: `../../pagesA/publicHealth/hosInfo?hospitalId=${item.id}`
				});
			},
			/** 跳转到去授权的页面
			 * @param {Object} fromPage 跳到auth授权的页面来源，例如social
			 */
			navToAuth(fromPage = 'social') {
				// #ifdef MP-WEIXIN
				uni.reLaunch({ url: `/pagesA/auth/auth?fromPage=${fromPage}` });
				// #endif

				// #ifndef MP-WEIXIN
				uni.reLaunch({ url: `/pagesA/login/login?fromPage=${fromPage}` });
				// #endif
			}
		}
	};
</script>

<style lang="scss">
	page {
		padding: 30rpx;
		box-sizing: border-box;

		.content-box {
			.account-header {
				height: 288rpx;
				background: url("../../static/preferential/bg_bill.png") no-repeat;
				background-size: 100% 100%;
				border-radius: 20rpx 20rpx 20rpx 20rpx;
				padding: 40rpx 20rpx 20rpx 20rpx;
				box-sizing: border-box;
				position: relative;

				.account-btn {
					width: 240rpx;
					height: 52rpx;
					line-height: 52rpx;
					background: linear-gradient(139deg, #F3FEFE 0%, #D8F8E8 100%);
					border-radius: 26rpx 26rpx 26rpx 26rpx;
					opacity: 1;
					color: #005C29;
				}

				.account-tips {
					position: absolute;
					left: 20rpx;
					bottom: 14rpx;
				}
			}

			.recharge {
				.recharge-box {
					.recharge-items {
						background: #F6F6F6;
						color: #58AA6C;
						display: flex;
						flex-direction: column;
						align-items: center;
						text-align: center;
						border-radius: 16rpx;
					}

					.active {
						background: linear-gradient(180deg, #90E3B1 0%, #58AA6C 100%);
						color: #ffffff;
					}
				}
			}
		}
	}
</style>