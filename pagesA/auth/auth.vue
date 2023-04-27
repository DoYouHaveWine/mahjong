<template>
	<view class="page">
		<image class="logo" src="/static/ic_logo.jpg" />
		<view class="name">四个朋友</view>
		<view class="logo-tip">— 随时随地，点击预约</view>
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
