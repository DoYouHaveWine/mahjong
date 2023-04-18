<template>
	<view class="mine-page">
		<u-notify ref="uNotify" />
		<!-- 用户信息-->
		<view class="header border-box ptb-20 plr-20">
			<view class="flex-box align-center">
				<view>
					<image src="../../static/mine/ic_mine_head.svg" style="width: 128rpx;height: 128rpx;"></image>
				</view>
				<view class="c-white plr-10">
					<view class="f-18">微信昵称</view>
					<view class="f-14 mt5">135****5464</view>
				</view>
			</view>
		</view>
		<view class="content"></view>
		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
	import {
		serverUrl
	} from '@/common/http/baseRequest.js';
	import {
		getMemberDetails,
		refreshCardList,
		getDictList
	} from '@/common/http/api.js';
	import md5 from '@/common/utils/md5.js';
	import {
		getVertionType
	} from '@/common/utils/commonUtil.js';
	export default {
		data() {
			return {
				versionType: getVertionType(),
				sysUser: uni.getStorageSync('sysUser'),
				commonToolList: [{
						text: '美团验券',
						src: '/static/mine/ic_mine_mtyq.svg',
						url: '/pagesA/hospital/myDoctor',
						needCard: true
					},
					{
						text: 'WIFI连接',
						src: '/static/mine/ic_mine_wifi.svg',
						url: '',
						needCard: true,
					},
					{
						text: '全部门店',
						src: '/static/mine/ic_mine_qbmd.svg',
						url: ''
					},
					{
						text: '联系商家',
						src: '/static/mine/ic_mine_lxsj.svg',
						url: ''
					},
					{
						text: '我要加盟',
						src: '/static/mine/ic_mine_wyjm.svg',
						url: ''
					},
					{
						text: '常见问题',
						src: '/static/mine/ic_mine_cjwt.svg',
						url: ''
					}
				]
			};
		},

		filters: {
			avatarUrl(avatar) {
				if (!avatar) return;

				if (avatar.indexOf('http') != -1) {
					return avatar;
				} else {
					return serverUrl + avatar;
				}
			}
		},

		computed: {
			tabbarList() {
				return this.$store.state.vuex_tabbar;
			},

			cardList() {
				return this.$store.state.cardList;
			}
		},

		async onShow() {
			if (!uni.getStorageSync('token')) {
				this.navToAuth();
			} else {
				// 请求刷新卡列表，主要目的是防止PC端建卡，这里能相对实时刷新
				refreshCardList();
			}
		},

		onLoad() {
			this.getDictList();
			if (uni.getStorageSync('token')) {
				this.getMemberDetails();
			}
		},

		methods: {
			async getDictList() {
				const {
					data
				} = await getDictList('ZBJG_MOBILE');
				let isContain = data.some(it => it.text == this.sysUser.mobile);
				if (isContain) {
					// 指定的用户才展示绩效考核
					this.commonToolList.filter(it => it.text == '绩效考核')[0].hidden = false;
				}
			},

			/** 获取用户详情 */
			async getMemberDetails() {
				const {
					data
				} = await getMemberDetails(this.sysUser.id);
				this.sysUser = data;
				if (data.operationData) {
					// 指定的用户才展示运营数据
					this.commonToolList.filter(it => it.text == '运营数据')[0].hidden = false;
				}
			},

			/** 检查是否绑定本人的卡并跳转到健康档案 */
			checkAndNavToHealthRecord() {
				if (!this.checkBindCard()) {
					// 需要绑卡但未绑卡
					return;
				}

				let bindOwnCard = false;
				this.cardList.forEach(({
					relationShip,
					idCard
				}) => {
					if (relationShip === 0) {
						bindOwnCard = true;
						uni.navigateTo({
							url: `/pagesA/healthRecords/healthRecords`
						});
						return;
					}
				});

				if (!bindOwnCard) {
					uni.showModal({
						title: '提示',
						content: '为保障个人隐私安全，目前仅支持查看【本人】健康档案，请先绑定本人的健康卡！',
						showCancel: false
					});
					return;
				}
			},

			/**
			 * 功能项点击
			 * @param {String} item 功能项
			 */
			async onFuncItemClick(item) {
				if (item.dev) {
					// 建设中...
					this.$devFuncClick();
					return;
				}

				if (!uni.getStorageSync('token')) {
					// 未授权
					this.navToAuth();
					return;
				}

				if (item.needCard && !this.checkBindCard()) {
					// 需要绑卡但未绑卡
					return;
				}

				if (item.url) {
					uni.navigateTo({
						url: item.url
					});
				} else {
					switch (item.text) {
						case '绩效考核':
							const encodeURIComponentStr = encodeURIComponent(
								`https://jiankangbaoding.cn/webapp?uuid=${md5.toMD5(this.sysUser.mobile).toUpperCase()}`
							);
							uni.navigateTo({
								url: `/pagesA/webview/webview?encodeURIComponentStr=${encodeURIComponentStr}`
							});
							break;

						case '联系客服':
							const phoneNumber = '03122060198';
							uni.showModal({
								title: '提示',
								content: '你确定要拨打客服电话:\n(0312) 206 0198', // 微信开发者工具不换行，真机会换行
								success: res => {
									if (res.confirm) {
										uni.makePhoneCall({
											phoneNumber: '03122060198'
										});
									}
								}
							});
							break;
						case '运营数据':
							uni.navigateTo({
								url: `/pagesA/data/index?hospitalId=${this.sysUser.hospitalId}`
							});
							break;
					}
				}
			}
		}
	};
</script>

<style lang="scss">
	.mine-page {
		overflow-x: hidden;
		background: #58AA6C;
		height: 100vh;

		.header {
			height: 300rpx;
		}
	}
</style>