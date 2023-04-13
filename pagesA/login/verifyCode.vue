<template>
	<view class="phone-page">
		<view class="page-title">输入验证码</view>
		<view class="tip">输入我们发送到您手机号{{ form.mobile | $mobileSecret }}的验证码</view>
		<u-code-input v-model="form.code" space="30rpx" maxlength="6" focus size="80rpx" bold borderColor="#4298ff" />
		<u-button type="primary" shape="circle" text="继续" customStyle="height:100rpx" :disabled="form.code.length != 6" @click="submit" />
		<load-data :loading="loading" loadingText="验证中..." isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { verifyCode } from '@/common/http/api.js';
export default {
	data() {
		return {
			pageTitle: '',
			form: { mobile: '', code: '' },
			loading: false
		};
	},

	onLoad(options) {
		const { mobile, fromPage } = options;
		this.fromPage = fromPage;
		this.form.mobile = mobile;
		this.refreshUI();
	},

	methods: {
		/** 页面ui刷新 */
		refreshUI() {
			switch (this.fromPage) {
				case 'register':
					uni.setNavigationBarTitle({ title: '注册' });
					break;

				case 'forgetPwd':
					uni.setNavigationBarTitle({ title: '忘记密码' });
					break;
			}
		},

		/** 提交 */
		async submit() {
			this.loading = true;
			try {
				const { code, data } = await verifyCode(this.form);
				this.loading = false;
				if (code == 200) {
					if (data) {
						if (this.fromPage == 'register') {
							this.$navTo(`./createAccount?mobile=${this.form.mobile}&code=${this.form.code}`);
						} else {
							this.$navTo(`./createNewPwd?mobile=${this.form.mobile}&code=${this.form.code}`);
						}
					} else {
						uni.showToast({
							icon: 'none',
							title: '验证码错误，请重新输入'
						});
					}
				}
			} catch (e) {
				this.loading = false;
			}
		}
	}
};
</script>

<style lang="scss">
.phone-page {
	font-family: PingFang SC-Regular, PingFang SC;
	margin: 52rpx;

	.page-title {
		font-size: 46rpx;
		color: #101623;
	}

	.tip {
		font-size: 30rpx;
		margin-top: 24rpx;
		color: #536471;
	}

	.u-code-input {
		display: flex;
		justify-content: center;
		margin: 64rpx 0;
	}
}
</style>
