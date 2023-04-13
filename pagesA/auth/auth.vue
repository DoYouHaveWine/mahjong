<template>
	<view class="page">
		<image class="logo" src="/static/ic_logo.jpg" />
		<view class="name">健康保定</view>
		<view class="logo-tip">— 保定人自己的健康平台</view>
		<view class="tip-title">登录后开发者将获得以下权限</view>
		<view class="tip-content">· 获得您的公开信息（昵称、头像等）</view>
		<u-button
			customStyle="margin-top:64rpx"
			shape="circle"
			type="primary"
			@click="authorization"
			text="授权登录"
			:loading="loading"
			loadingText="授权中..."
		/>
	</view>
</template>

<script>
/** 公共授权组件 */
import { authorization } from '@/common/http/api.js';

export default {
	data() {
		return {
			fromPage: 'index',
			loading: false,
			opts:undefined
		};
	},

	onLoad(options) {
		this.fromPage = options.fromPage || 'index';
		this.opts = options
	},

	methods: {
		/** 微信授权 */
		async authorization() {
			this.loading = true;
			const res = await authorization();
			this.loading = false;
			if (res) {
				switch (this.fromPage) {
					case 'index':
						uni.switchTab({ url: '/pages/index/index' });
						break;

					case 'health':
						uni.switchTab({ url: '/pages/health/health' });
						break;

					case 'social':
						uni.switchTab({ url: '/pages/social/social' });
						break;
						
					case 'mine':
						uni.switchTab({ url: '/pages/mine/mine' });
						break;

					case 'zqwj': // 诊前问卷
						uni.reLaunch({ url: '/pagesA/preEntryMsg/preEntryMsgForm' });
						break;

					case 'myddc': // 满意度调查
						uni.reLaunch({ url: `/pagesA/questionnaire/index?hospitalId=${this.opts.hospitalId}&voteId=${this.opts.voteId}` });
						break;
					case 'card': // 电子健康卡
						uni.reLaunch({ url: `/pagesA/card/manager` });
						break;
					case 'deptList': // 科室列表
						uni.reLaunch({ url: `/pagesA/hospital/deptList?hospitalId=${this.opts.hospitalId}&hasChild=${this.opts.hasChild}` });
						break;
					case 'scanPay': // 科室列表
						uni.reLaunch({ url: `/pagesA/payment/scanPay?q=${this.opts.q}` });
						break;
					case 'filter': // 科室列表
						uni.reLaunch({ url: `/pagesA/payment/filter?fromPage=${this.opts.fromPages}&hospitalId=${this.opts.hospitalId}` });
						break;
					default:
						uni.switchTab({ url: '/pages/index/index' });
						break;
				}
			} else {
				uni.showToast({
					title: '授权失败',
					icon: 'none'
				});
			}
		}
	}
};
</script>

<style lang="scss">
.page {
	display: flex;
	padding: 48rpx;
	flex-direction: column;
	align-items: center;

	.logo {
		width: 240rpx;
		height: 230rpx;
		margin-top: 160rpx;
	}

	.name {
		margin-top: 20rpx;
		font-size: 40rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: #4298ff;
	}

	.logo-tip {
		color: #4298ff;
		font-family: PingFang SC;
		font-weight: 500;
		margin-top: 40rpx;
		font-size: 24rpx;
		letter-spacing: 5%;
		margin-top: 28rpx;
	}

	.tip-title {
		color: #0f1419;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 30rpx;
		line-height: 48rpx;
		margin-top: 100rpx;
		align-self: flex-start;
	}

	.tip-content {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 30rpx;
		line-height: 48rpx;
		color: #0f141980;
		align-self: flex-start;
	}
}
</style>
