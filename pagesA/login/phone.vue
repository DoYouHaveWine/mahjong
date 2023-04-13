<template>
	<view class="phone-page">
		<view class="page-title">{{ pageTitle }}</view>
		<view class="tip">输入您的电话号码，我们将向您发送验证码</view>

		<u-form :model="form" :rules="rules" ref="uForm">
			<u-form-item prop="mobile">
				<u-input
					v-model="form.mobile"
					shape="circle"
					placeholder="请输入您的手机号"
					maxlength="11"
					placeholderStyle="color: rgba(15,20,25,0.2)"
					type="number"
					prefixIcon="phone"
					prefixIconStyle="color:#4298ff;fontSize:50rpx"
					customStyle="height:70rpx"
				/>
			</u-form-item>
		</u-form>

		<u-button type="primary" shape="circle" text="继续" @click="onSubmit" customStyle="height:100rpx" :disabled="btnDisabled" />
		<view class="user-agreement" @click="$navTo('/pagesA/pdf/agreement')">《用户协议》</view>

		<load-data :loading="loading" loadingText="发送中..." isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { getCode } from '@/common/http/api.js';
export default {
	data() {
		return {
			fromPage: '',
			pageTitle: '',
			form: { mobile: '' },
			btnDisabled: true,
			rules: {
				mobile: [
					{
						type: 'string',
						required: true,
						message: '请输入手机号',
						trigger: ['blur', 'change']
					},
					{
						// 自定义验证函数，见上说明
						validator: (rule, value, callback) => {
							// 上面有说，返回true表示校验通过，返回false表示不通过
							// uni.$u.test.mobile()就是返回true或者false的
							let validate = uni.$u.test.mobile(value);
							this.btnDisabled = !validate;
							return validate;
						},
						message: '手机号码格式不正确',
						// 触发器可以同时用blur和change
						trigger: ['change', 'blur']
					}
				]
			},
			loading: false
		};
	},

	onReady() {
		//如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则。
		this.$refs.uForm.setRules(this.rules);
	},

	onLoad(options) {
		this.fromPage = options.fromPage || 'register';
		this.refreshUI();
	},

	methods: {
		/** 页面ui刷新 */
		refreshUI() {
			switch (this.fromPage) {
				case 'register':
					uni.setNavigationBarTitle({ title: '注册' });
					this.pageTitle = '手机号注册';
					break;

				case 'forgetPwd':
					uni.setNavigationBarTitle({ title: '忘记密码' });
					this.pageTitle = '忘记密码?';
					break;
			}
		},

		/** 提交继续 */
		onSubmit() {
			this.$refs.uForm.validate().then(async res => {
				this.loading = true;
				try {
					const { code } = await getCode(this.form.mobile);
					this.loading = false;
					if (code == 200) {
						this.$navTo(`./verifyCode?fromPage=${this.fromPage}&mobile=${this.form.mobile}`);
					}
				} catch (e) {
					this.loading = false;
				}
			});
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

	.u-form {
		margin: 48rpx 0;
	}

	.user-agreement {
		text-align: center;
		font-size: 30rpx;
		font-family: Inter-Regular, Inter;
		margin-top: 48rpx;
		color: #4298ff;
	}
}
</style>
