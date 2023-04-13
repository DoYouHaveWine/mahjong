<template>
	<view class="phone-page">
		<view class="page-title">创建新密码</view>
		<view class="tip">输入您要设置的新密码</view>
		<u-form :model="form" :rules="rules" ref="uForm">
			<u-form-item prop="newPassword">
				<u-input
					v-model="form.newPassword"
					shape="circle"
					placeholder="请输入您的密码"
					placeholderStyle="color: rgba(15,20,25,0.2)"
					:type="showPassword ? 'text' : 'password'"
					prefixIcon="lock"
					prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
					customStyle="height:70rpx"
				>
					<view slot="suffix" class="show-password" @click="showPassword = !showPassword">
						<u-icon :name="showPassword ? 'eye-fill' : 'eye-off'" color="#A0A8B0" size="50rpx" />
					</view>
				</u-input>
			</u-form-item>
			<u-form-item prop="password">
				<u-input
					v-model="form.surePassword"
					shape="circle"
					placeholder="请再次输入您的密码"
					placeholderStyle="color: rgba(15,20,25,0.2)"
					:type="showSurePassword ? 'text' : 'password'"
					prefixIcon="lock"
					prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
					customStyle="height:70rpx"
				>
					<view slot="suffix" class="show-password" @click="showSurePassword = !showSurePassword">
						<u-icon :name="showSurePassword ? 'eye-fill' : 'eye-off'" color="#A0A8B0" size="50rpx" />
					</view>
				</u-input>
			</u-form-item>
		</u-form>
		<u-button type="primary" shape="circle" text="确定" @click="onSubmit" customStyle="height:100rpx;margin:48rpx 0" />

		<load-data :loading="loading" isLoadingDialog onlyShowLoading />
	</view>
</template>

<script>
import { forgetPwd } from '@/common/http/api.js';
export default {
	data() {
		return {
			form: { mobile: '', code: '', newPassword: '', surePassword: '' },
			showPassword: false,
			showSurePassword: false,
			rules: {
				newPassword: {
					type: 'string',
					required: true,
					message: '请输入密码',
					trigger: ['blur', 'change']
				},
				surePassword: [
					{
						type: 'string',
						required: true,
						message: '请再次输入密码',
						trigger: ['blur', 'change']
					},
					{
						// 自定义验证函数，见上说明
						validator: (rule, value, callback) => {
							// 上面有说，返回true表示校验通过，返回false表示不通过
							return value == this.form.newPassword;
						},
						message: '两次输入的密码不一致',
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
		const { mobile, code } = options;
		this.form.mobile = mobile;
		this.form.code = code;
	},

	methods: {
		/** 提交继续 */
		onSubmit() {
			this.$refs.uForm.validate().then(async res => {
				this.loading = true;
				try {
					const { code } = await forgetPwd(this.form);
					this.loading = false;
					if (code == 200) {
						uni.$u.toast('密码修改成功');
						uni.reLaunch({ url: '/pagesA/login/login' });
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
		margin-top: 56rpx;
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
