<template>
	<view class="hos-info-page">
		<u-navbar
			:bgColor="bgColor"
			:placeholder="true"
			title="机构主页"
			:autoBack="true"
			leftIconColor="#fff"
			:titleStyle="{ color: '#fff' }"
		/>
		<view class="bg-header"></view>
		<view class="header">
			<view class="header-content">
				<view class="head flex-box">
					<image v-if="hosInfo.logo" class="icon" :src="serverUrl + hosInfo.logo" />
					<image v-else class="icon" src="/static/social/ic_hospital.svg" />
					<view class="right">
						<view class="big-title">{{ hosInfo.name }}</view>
						<view class="">
							<text v-for="(item, i) in hosInfo.tagRender" :class="['tips', `${item.status || ''}-tips`]" :key="i">
								{{ item.name }}
							</text>
						</view>
						<view class="icon-box">
							<image src="../../static/social/ic_location.svg"></image>
							<text>{{ hosInfo.address || '' }}</text>
						</view>
						<view class="icon-box" @click="callPhone(hosInfo.tel)">
							<image src="../../static/social/ic_phone.svg"></image>
							<text :class="{ tel: hosInfo.tel }">{{ hosInfo.tel || '该机构暂无电话' }}</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 开通服务 -->
			<view class="commom-tools">
				<view class="category-title">
					<text class="title">开通服务</text>
					<view class="title-line" />
				</view>
				<view class="func-grid">
					<view
						v-if="!item.hidden"
						class="item"
						:class="{ 'dev-func-style': item.dev }"
						v-for="(item, index) in toolList"
						:key="index"
						@click="onFuncItemClick(item)"
					>
						<view class="image-box"><image :src="item.src" /></view>
						<text>{{ item.text }}</text>
					</view>
				</view>
			</view>
			<view class="list">
				<view v-if="false" class="list-item flex-box" @click="$devFuncClick">
					<text>全部医生</text>
					<u-icon name="arrow-right" size="34rpx" />
				</view>
				<view v-if="false" class="list-item flex-box" @click="$devFuncClick">
					<text>挂号记录</text>
					<u-icon name="arrow-right" size="34rpx" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getVertionType } from '@/common/utils/commonUtil';
import { getHosInfo } from '@/common/http/api.js';
export default {
	data() {
		return {
			bgColor: 'transparent',
			hosInfo: {},
			toolList: [
				{
					text: '预约挂号',
					src: '/static/social/ic_yygh.svg',
					url: '/pagesA/registerRecord/registerRecord'
					// needCard: true
					// dev: true
				},
				{
					text: '门诊缴费',
					src: '/static/social/ic_mzjf.svg',
					url: '/pagesA/registerRecord/registerRecord',
					needCard: true,
					dev: true,
					hidden: getVertionType() == 'release'
				},
				{
					text: '在线签约',
					src: '/static/social/ic_zxqy.svg',
					url: '/pagesA/registerRecord/registerRecord',
					needCard: true,
					dev: true,
					hidden: getVertionType() == 'release'
				},
				{
					text: '咨询家医',
					src: '/static/social/ic_zxjy.svg',
					url: '/pagesA/registerRecord/registerRecord',
					needCard: true,
					dev: true,
					hidden: getVertionType() == 'release'
				},
				{
					text: '慢病续方',
					src: '/static/social/ic_mbxf.svg',
					url: '/pagesA/registerRecord/registerRecord',
					needCard: true,
					dev: true,
					hidden: getVertionType() == 'release'
				},
				{
					text: '服务包',
					src: '/static/social/ic_fwb.svg',
					url: '/pagesA/registerRecord/registerRecord',
					needCard: true,
					dev: true,
					hidden: getVertionType() == 'release'
				},
				{
					text: '满意度调查',
					src: '/static/social/ic_fwb.svg',
					url: '',
					needCard: true
				}
			]
		};
	},

	computed: {
		cardList() {
			return this.$store.state.cardList;
		}
	},

	onPageScroll(e) {
		if (e.scrollTop > 0) {
			this.bgColor = '#65abff';
		} else {
			this.bgColor = 'transparent';
		}
	},
	onLoad(options) {
		this.hosId = options.hospitalId;
		this.getData();
	},
	async onShow() {
		if (!uni.getStorageSync('token')) {
			this.navToAuth('social');
		}
		this.sysUser = uni.getStorageSync('sysUser');
		if (this.sysUser) {
			//this.getCardList();
		}
	},
	methods: {
		getData() {
			const colorArr = ['success', 'error', 'primary', 'warning'];
			getHosInfo(this.hosId).then(({ data = {} }) => {
				this.hosInfo = data || {};
				const { tagNames = '' } = this.hosInfo;
				const arr = tagNames.split(',');
				if (tagNames) {
					this.hosInfo.tagRender = arr.map((item, index) => {
						return {
							name: item,
							status: index > 4 ? colorArr[(index % 4) - 1] : colorArr[index % 4]
						};
					});
				} else {
					this.hosInfo.tagRender = [];
				}
			});
		},
		callPhone(tel) {
			if (tel) {
				uni.makePhoneCall({
					phoneNumber: tel
				});
			}
		},

		/** 跳转到去授权的页面
		 * @param {Object} fromPage 跳到auth授权的页面来源，例如mine
		 */
		navToAuth(fromPage) {
			uni.reLaunch({
				url: `/pagesA/auth/auth?fromPage=${fromPage}`
			});
		},

		async onFuncItemClick(item) {
			if (item.dev) {
				this.$devFuncClick();
				return;
			}
			var url = item.url;
			if (!uni.getStorageSync('token')) {
				await this.toAuth();
				return;
			}

			if (item.needCard && !this.checkBindCard()) {
				// 需要绑卡但未绑卡
				return;
			}

			switch (item.text) {
				case '预约挂号':
					this.checkMessageAuth(this.constantMap.get('tmplIds').REGISTER);
					uni.navigateTo({
						url: `/pagesA/hospital/deptList?hospitalId=${this.hosInfo.id}`
					});
					return;
				case '满意度调查':
					uni.navigateTo({
						url: `/pagesA/questionnaire/list?hospitalId=${this.hosInfo.id}`
					});
					return;
			}

			uni.navigateTo({ url });
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
		/** 点击简介 */
		onClickIntroduce() {
			if (this.hosInfo.intro.length > 30) {
				this.showIntroduce = true;
			}
		},
		// 订阅消息通知授权
		async checkMessageAuth(tmplIds) {
			return new Promise((resolve, reject) => {
				uni.requestSubscribeMessage({
					tmplIds: tmplIds,
					success(res) {
						console.log(res, 'res');
						resolve();
					}
				});
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f5f7fa;

	.hos-info-page {
		position: relative;
	}

	.flex-box {
		display: flex;
	}

	.bg-header {
		width: 140%;
		height: 372rpx;
		position: absolute;
		left: -20%;
		top: 0;
		border-radius: 0 0 50% 50%;
		background: linear-gradient(180deg, #66acff 0%, #3683ff 99.99%, #4298ff 100%);
	}

	.header {
		position: absolute;
		left: 40rpx;
		right: 40rpx;
		top: 238rpx;

		.header-content {
			padding: 24rpx;
			border-radius: 20rpx;
			background: #fff;
			box-shadow: 0rpx 2rpx 20rpx 2rpx rgba(0, 0, 0, 0.05);

			.head {
				min-height: 200rpx;
				align-items: center;

				> image {
					margin-right: 20rpx;
					width: 150rpx;
					height: 150rpx;
				}

				.right {
					flex: 1;

					.big-title {
						margin-bottom: 8rpx;
						font-size: 30rpx;
					}

					.tips {
						border-radius: 8rpx;
						font-size: 20rpx;
						color: rgba(15, 20, 25, 0.5);
						background: #f4f4f5;
						padding: 4rpx 12rpx;
						margin-right: 12rpx;
						margin-bottom: 8rpx;

						&:last-child {
							margin-right: 0;
						}
					}

					.success-tips {
						background: rgba(40, 208, 148, 0.15);
						color: #28d094;
					}

					.primary-tips {
						background: #e6f1ff;
						color: #4298ff;
					}

					.error-tips {
						background: rgba(255, 98, 98, 0.15);
						color: #ff6262;
					}

					.warning-tips {
						background: rgba(255, 199, 28, 0.1);
						color: #e1ae11;
					}
				}

				.icon-box {
					font-size: 24rpx;
					color: rgba(15, 20, 25, 0.5);
					margin: 12rpx 0;

					image {
						width: 30rpx;
						height: 30rpx;
						vertical-align: middle;
						margin-right: 6rpx;
					}

					.tel {
						text-decoration: underline;
						color: #4298ff;
					}
				}
			}
		}
	}

	.commom-tools {
		.category-title {
			color: #333;
			font-family: PingFang SC;
			font-weight: 600;
			font-size: 30rpx;
			margin: 28rpx 40rpx 20rpx 40rpx;

			.title-line {
				margin-top: -16rpx;
				width: 66rpx;
				height: 16rpx;
				opacity: 0.2;
				border-radius: 60rpx;
				background: #4298ff;
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
				height: 180rpx;
				text-align: center;
				align-items: center;
				flex-direction: column;
				justify-content: center;

				.image-box {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 120rpx;
					height: 104rpx;
					border-radius: 20rpx;
					background: #fff;
					box-shadow: 0rpx 2rpx 20rpx 2rpx #0000000d;

					image {
						width: 46rpx;
						height: 50rpx;
					}
				}

				text {
					color: #333;
					font-family: SF Pro Display;
					font-weight: 500;
					font-size: 28rpx;
					margin-top: 8rpx;
				}
			}
		}
	}

	.list {
		background: #fff;
		border-radius: 20rpx;
		font-size: 28rpx;
		padding: 0 24rpx;
		margin-top: 32rpx;

		.list-item {
			justify-content: space-between;
			padding: 28rpx 0;
			border-bottom: 2rpx solid #f0f0f0;

			&:last-child {
				border-bottom: 0;
			}
		}
	}
}
</style>
