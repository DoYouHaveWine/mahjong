<template>
	<view class="mine-page">
		<u-notify ref="uNotify" />

		<!-- 蓝色背景、用户信息-->
		<view :class="['bg-blue-box', { 'bg-blue-box-dev': versionType != 'release' }]">
			<view class="user-info" @click="$navTo('/pagesA/personalCenter/personalCenter')">
				<u-avatar :src="sysUser.avatar | avatarUrl" size="140rpx" mode="aspectFill" default-url="/static/mine/ic_avatar.svg" />
				<view class="user-name">{{ sysUser.name }}</view>
			</view>
			<view class="archives-box">
				<view class="card-member" @click="$navTo('/pagesA/card/list')">
					<image src="/static/mine/ic_family.svg" />
					<view class="right">
						<text class="title">成员管理</text>
						<text class="desc" v-if="cardList">共{{ cardList.length }}人</text>
					</view>
				</view>
				<view class="line" />
				<view class="health-archives" @click="checkAndNavToHealthRecord">
					<image src="/static/mine/ic_family.svg" />
					<view class="right">
						<text class="title">健康档案</text>
						<text class="desc" v-if="false">共{{ cardList.length }}份</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 钱包、卡包、优惠券 -->
		<!-- <view class="card-box" v-if="versionType != 'release'">
			<view class="dev-func-style" @click="$devFuncClick">
				<u-icon size="48rpx" labelSize="26rpx" labelColor="#172b4d" space="12rpx"
					name="/static/mine/ic_wallet.svg" label="钱包" labelPos="bottom" />
			</view>

			<view class="dev-func-style" @click="$devFuncClick">
				<u-icon size="48rpx" labelSize="26rpx" labelColor="#172b4d" space="12rpx"
					name="/static/mine/ic_card_bag.svg" label="卡包" labelPos="bottom" />
			</view>

			<view class="dev-func-style" @click="$devFuncClick">
				<u-icon size="48rpx" labelSize="26rpx" labelColor="#172b4d" space="12rpx"
					name="/static/mine/ic_coupon.svg" label="优惠券" labelPos="bottom" />
			</view>
		</view> -->

		<!-- 订单/记录 -->
		<view class="commom-tools" style="margin-top: 40rpx">
			<text class="category-title">订单/记录</text>
			<view class="func-grid">
				<view
					v-if="!item.hidden"
					class="item"
					:class="{ 'dev-func-style': item.dev }"
					v-for="(item, index) in orderOrRecordList"
					:key="index"
					@click="onFuncItemClick(item)"
				>
					<view class="image-box"><image :src="item.src" /></view>
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>

		<!-- 常用工具 -->
		<view class="commom-tools">
			<text class="category-title">常用工具</text>
			<view class="func-grid">
				<view
					v-if="!item.hidden"
					class="item"
					:class="{ 'dev-func-style': item.dev }"
					v-for="(item, index) in commonToolList"
					:key="index"
					@click="onFuncItemClick(item)"
				>
					<view class="image-box"><image :src="item.src" /></view>
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>

		<!-- 其它 -->
		<view class="other">
			<text class="category-title">其它</text>
			<view class="func-grid">
				<view
					v-if="!item.hidden"
					class="item"
					:class="{ 'dev-func-style': item.dev }"
					v-for="(item, index) in otherList"
					:key="index"
					@click="onFuncItemClick(item)"
				>
					<image :src="item.src" />
					<text>{{ item.text }}</text>
				</view>
			</view>
		</view>

		<!-- 底部tabbar -->
		<tabbar :tabList="tabbarList" />
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import { getMemberDetails, refreshCardList, getDictList } from '@/common/http/api.js';
import md5 from '@/common/utils/md5.js';
import { getVertionType } from '@/common/utils/commonUtil.js';
export default {
	data() {
		return {
			versionType: getVertionType(),
			sysUser: uni.getStorageSync('sysUser'),
			orderOrRecordList: [
				{
					text: '挂号订单',
					src: '/static/mine/ic_mine_ghdd.svg',
					url: '/pagesA/hospital/recordList',
					needCard: true
				},
				{
					text: '门诊订单',
					src: '/static/mine/ic_mzdd.svg',
					url: '/pagesA/order/clinicList',
					needCard: true
				},
				{
					text: '住院记录',
					src: '/static/mine/ic_zyjl.svg',
					url: '/pagesA/hospitalized/hospitalizedList',
					needCard: true
				}
				// {
				// 	text: '服务记录',
				// 	src: '/static/mine/ic_mine_fwjl.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '咨询记录',
				// 	src: '/static/mine/ic_mine_zxjl.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '问诊记录',
				// 	src: '/static/mine/ic_mine_wzjl.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '体检订单',
				// 	src: '/static/mine/ic_mine_tjdd.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '药品订单',
				// 	src: '/static/mine/ic_mine_ypdd.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			],

			commonToolList: [
				{
					text: '我的医生',
					src: '/static/mine/ic_mine_wdys.svg',
					url: '/pagesA/hospital/myDoctor',
					needCard: true
				},
				{
					text: '运营数据',
					src: '/static/mine/ic_mine_yysj.svg',
					url: '',
					needCard: true,
					hidden: true
				},
				{
					text: '绩效考核',
					src: '/static/mine/ic_mine_zbjg.svg',
					url: '',
					hidden: true
				}
				// {
				// 	text: '签到送礼',
				// 	src: '/static/mine/ic_mine_qdsl.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '收货地址',
				// 	src: '/static/mine/ic_mine_shdz.svg',
				// 	url: '',
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// },
				// {
				// 	text: '天天抽奖',
				// 	src: '/static/mine/ic_mine_ttcj.svg',
				// 	url: '',
				// 	needCard: true,
				// 	dev: true,
				// 	hidden: getVertionType() == 'release'
				// }
			],
			otherList: [
				// #ifdef APP-PLUS
				{
					text: '好友推荐',
					src: '/static/mine/ic_mine_hytj.svg',
					url: '',
					dev: true
				},
				// #endif
				{
					text: '问题帮助',
					src: '/static/mine/ic_mine_wtbz.svg',
					url: '/pagesA/pdf/help'
				},
				{
					text: '用户协议',
					src: '/static/mine/ic_mine_yhxy.svg',
					url: '/pagesA/pdf/agreement'
				},
				{
					text: '隐私政策',
					src: '/static/mine/ic_mine_yszc.svg',
					url: '/pagesA/pdf/privacy'
				},
				{
					text: '联系客服',
					src: '/static/mine/ic_mine_lxkf.svg'
				},
				// #ifdef APP-PLUS
				{
					text: '设置',
					src: '/static/mine/ic_mine_setting.svg',
					url: ''
				}
				// #endif
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
			const { data } = await getDictList('ZBJG_MOBILE');
			let isContain = data.some(it => it.text == this.sysUser.mobile);
			if (isContain) {
				// 指定的用户才展示绩效考核
				this.commonToolList.filter(it => it.text == '绩效考核')[0].hidden = false;
			}
		},

		/** 获取用户详情 */
		async getMemberDetails() {
			const { data } = await getMemberDetails(this.sysUser.id);
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
			this.cardList.forEach(({ relationShip, idCard }) => {
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
				uni.navigateTo({ url: item.url });
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
									uni.makePhoneCall({ phoneNumber: '03122060198' });
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
		},

		/** 检查是否绑定了电子健康卡 */
		checkBindCard() {
			if (this.cardList.length === 0) {
				uni.showModal({
					title: '提示',
					content: '请先绑定电子健康卡再进行相应操作！',
					success: res => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pagesA/card/list' });
						}
					}
				});
				return false;
			}
			return true;
		},

		/** 跳转到去授权的页面
		 * @param {Object} fromPage 跳到auth授权的页面来源，例如mine
		 */
		navToAuth(fromPage = 'mine') {
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
.mine-page {
	overflow-x: hidden;

	.bg-blue-box {
		background-color: $uni-color-primary;
		width: 110%;
		margin-left: -5%;
		height: 530rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.user-info {
			display: flex;
			align-items: center;
			flex-direction: column;
			margin-top: 150rpx;

			.user-name {
				color: #fafafa;
				font-family: PingFang SC;
				font-size: 40rpx;
				font-weight: bold;
				margin-top: 16rpx;
			}
		}

		.archives-box {
			width: 70%;
			margin-top: 28rpx;
			height: 104rpx;
			border-radius: 20rpx;
			background: #0000001a;
			display: flex;
			align-items: center;

			.line {
				height: 40rpx;
				width: 2rpx;
				opacity: 0.5;
				background-color: #e6f1ff;
			}

			.card-member,
			.health-archives {
				display: flex;
				align-items: center;
				justify-content: center;
				flex: 1;

				image {
					width: 60rpx;
					height: 60rpx;
				}

				.right {
					display: flex;
					flex-direction: column;
					margin-left: 20rpx;

					.title {
						opacity: 0.85;
						color: #fff;
						font-family: PingFang SC;
						font-weight: bold;
						font-size: 26rpx;
					}

					.desc {
						color: #e5e7eb;
						font-family: PingFang SC;
						font-weight: 500;
						font-size: 24rpx;
						margin-top: 4rpx;
					}
				}
			}
		}
	}

	// .bg-blue-box-dev {
	// 	height: 630rpx;
	// 	border-bottom-left-radius: 20%;
	// 	border-bottom-right-radius: 20%;
	// }

	.card-box {
		height: 168rpx;
		border-radius: 20rpx;
		background: #fff;
		box-shadow: 0rpx 4rpx 16rpx 4rpx #0000001a;
		display: flex;
		align-items: center;
		margin: -100rpx 40rpx 0 40rpx;
		justify-content: space-around;
	}

	.commom-tools,
	.other {
		margin: 28rpx 0 20rpx 0;

		.category-title {
			color: #333;
			font-family: PingFang SC;
			font-weight: 600;
			font-size: 30rpx;
			margin: 0 40rpx;
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
				background: #fff;
				align-items: center;
				flex-direction: column;
				justify-content: center;

				image {
					width: 46rpx;
					height: 50rpx;
				}

				text {
					color: #333;
					font-family: SF Pro Display;
					font-weight: 500;
					font-size: 28rpx;
					margin-top: 12rpx;
				}
			}
		}
	}

	.other {
		padding-bottom: 30rpx;
	}
}
</style>
