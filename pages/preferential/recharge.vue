<template>
	<view class="page">
		<view class="header">
			<tab-list :list="tabList" @change="clickTabs" :activeIdx="activeIdx" />
		</view>
		<view class="content-box mt15">
			<template v-if="activeValue==1">
				<view class="account-header">
					<view class="just-between align-center">
						<view class="c-white">
							<view class="fb f-40">{{totalMoney.toFixed(2)}}</view>
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
				<view class="recharge mt15" v-if="rechargeList.length > 0">
					<view class="fb f-18">充值套餐</view>
					<view class="recharge-box just-between align-center mt20">
						<view class="recharge-items ptb-15 plr-15" :class="activeRecharge==index?'active':''"
							@click="activeRecharge=index" v-for="(item,index) in rechargeList" :key="item.uuid">
							<text class="f-18">{{item.amount.toFixed(2)}}</text>
							<text class="f-12 mt10">到账{{item.gainAmount.toFixed(2)}}元</text>
						</view>
					</view>
					<view style="position:'relative';width:'90%';left:'5%';" class="mt20">
						<u-button text="立即充值" color="linear-gradient(313deg, #58AA6C 0%, #84C794 100%)" @click="pay()"></u-button>
						<view class="tc mt10 f-12 c-99">点击充值,则表示已阅读并同意<text style="color: #66A9F6;">《充值说明》</text></view>
					</view>
				</view>
			</template>
			<template v-if="activeValue==2">
				<view class="tc">
					<image src="../../static/list/tuangou.png" style="height: 80rpx; width: 280rpx;" mode="heightFix"></image>
				</view>
				<view class="f-14 c-66 tc mt5">
					请前往美团、大众点评、抖音搜索相关店铺进行购买
				</view>
			</template>
			<!-- <template v-if="activeValue==3">
				3
			</template> -->
			<template v-if="activeValue==4">
				<view>
					<view class="recharge mt15" style="padding: 0 100rpx;">
						<view class="tc">
							<image src="../../static/list/tuangou.png" style="height: 80rpx; width: 280rpx;" mode="heightFix"></image>
						</view>
						<view class="f-16 fb c-33 tc mt5">美团、大众点评、抖音自助验券</view>
						<view class="mt20" @click="scan">
							<u--input placeholder="点击输入卡券兑换码" v-model="qrcode" inputAlign="center" readonly border="bottom" suffixIcon="scan"
								suffixIconStyle="color: #909399;font-size:60rpx;"></u--input>
						</view>
						<view style="position:'relative';width:'90%';left:'5%';" class="mt20">
							<u-button text="验券" shape="circle" color="linear-gradient(313deg, #58AA6C 0%, #84C794 100%)"></u-button>
						</view>
					</view>
				</view>
				<view class="mt20">
					<view class="c-33 fb f-18">温馨提示</view>
					<view class="c-99 mt10 f-14">1:自助验券之前请确认所选门店是否正确，可前往首页查看门店信息是否为将去体验的门店信息</view>
					<view class="c-99 mt5 f-14">2:自助验券是校验可用门店，可用房间，可用时间段等信息规则，不等于核销</view>
					<view class="c-99 mt5 f-14">3:请前往对应门店，对应房间进行核销兑换</view>
					<!-- <view class="c-99 mt10 f-14">2:抖音验券请到抖音APP的订单详情页复制券码然后进行自助核销兑换验券</view>
					<view class="c-99 mt10 f-14">
						3:核销验券之后的券会进入到您的卡包当中，可去门店预约时自动抵扣使用，若显示无法使用团购券，请核验团购券的可用门店，可用时间段。团购券过期后自动作废，不退款不退还不延期，请尽快使用</view> -->
				</view>
			</template>
			<!-- 使用弹窗Dialog是避免请求时切换tab，数据会混乱 -->
			<!-- <load-data v-else :loading="loading" isLoadingDialog /> -->
		</view>
		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
	import { wallet2, queryRecharge, payRecharge } from '@/common/http/api.js';
	import tabList from '@/components/tablist/tabList.vue';
	export default {
		components: {
			tabList
		},
		data() {
			return {
				contactorUuid: '',
				totalMoney: 0.00,
				tabList: [{
						label: '账户充值',
						value: 1
					},
					{
						label: '团购券',
						value: 2
					},
					// {
					// 	label: '优惠券',
					// 	value: 3
					// },
					{
						label: '自助验券',
						value: 4
					}
				],
				activeIdx: 0,
				activeValue: 1, //选中tab
				rechargeList: [],
				activeRecharge: -1,
				qrcode: '',
				loading: true
			};
		},
		onShow() {
			this.contactorUuid = uni.getStorageSync('cur_mch_cuid')
			this.getWallet2()
			this.queryList()
		},
		
		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			}
		},

		methods: {
			async getWallet2() {
				let _this = this;
				//获取钱包
				let res = await wallet2({
					contactorUuid: _this.contactorUuid
				})
				if (res.code === 200) {
					_this.totalMoney = res.data.money + res.data.integral;
				}
			},
			async queryList() {
				let _this = this;
				let res = await queryRecharge({
					contactorUuid: _this.contactorUuid
				})
				if (res.code === 200) {
					_this.rechargeList = res.data.recharges;
					_this.merchants = res.data.merchants;
					//获取第一个的uuid赋值给支付按钮
					if (_this.rechargeList.length > 0) {
						_this.activeRecharge = 0
					}
				}
			},
			clickTabs(e) {
				this.activeValue = e.value
			},
			rechargeTabs(index) {
				this.activeRecharge = index
			},
			async pay() {
				let _this = this;
				if (_this.activeRecharge == -1) {
					uni.showToast({
						title: '请选择充值套餐',
						duration: 2000,
						icon: 'none'
					})
					return
				}
				let res = await payRecharge({
					mealUuid: _this.rechargeList[_this.activeRecharge].uuid
				})
				if (res.code === 200) {
					uni.requestPayment({
					    provider: 'wxpay',
						timeStamp: res.data.timeStamp,
						nonceStr: res.data.nonceStr,
						package: res.data.package,
						signType: res.data.signType,
						paySign: res.data.paySign,
					    success(res) {
							uni.showToast({
								icon: 'loading',
								title: '入账中...',
								duration: 2000,
								success() {
									setTimeout(function () {
										_this.getWallet2()
									}, 2000) //延迟时间
								}
							})
						},
					    fail(e) {}
					})
				}
			},
			scan() {
				let _this = this;
				uni.scanCode({
					success: res => {
						if (res.errMsg == 'scanCode:ok') {
							_this.qrcode = res.result
						} else {
							uni.showToast({
								title: '无效二维码，请重新扫码',
								icon: 'none',
								duration: 2000
							});
						}
					},
					fail(res) {
						if (res.errMsg == 'scanCode:fail') {
							uni.showToast({
								title: '无效二维码，请重新扫码',
								icon: 'none',
								duration: 2000
							})
						}
					}
				})
			},
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