<template>
	<view class="phone-page">
		<u-form :model="form" :rules="rules" ref="uForm">
			<u-form-item prop="account">
				<u-input
					v-model="form.name"
					shape="circle"
					placeholder="请输入昵称"
					placeholderStyle="color: rgba(15,20,25,0.2)"
					prefixIcon="account"
					prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
					customStyle="height:70rpx"
				/>
			</u-form-item>
			<u-form-item prop="password">
				<u-input
					v-model="form.password"
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
			<u-form-item prop="surePassword">
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
		<view class="user-agreement" @click="$navTo('/pagesA/pdf/agreement')">《用户协议》</view>

		<load-data :loading="loading" onlyShowLoading isLoadingDialog />
	</view>
</template>

<script>
import { register } from '@/common/http/api.js';
export default {
	data() {
		return {
			form: {
				mobile: '',
				code: '',
				name: '',
				password: '',
				surePassword: '',
				fromType: 3 // 1:小程序;2:公众号;3:安卓app,4:ios,5:后台
			},
			showPassword: false,
			showSurePassword: false,
			rules: {
				name: {
					type: 'string',
					required: true,
					message: '请输入昵称',
					trigger: ['blur', 'change']
				},
				password: {
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
							return value == this.form.password;
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
					const { code } = await register(this.form);
					this.loading = false;
					if (code == 200) {
						uni.$u.toast('注册成功');
						uni.setStorageSync('account', this.form.name);
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

	.user-agreement {
		text-align: center;
		font-size: 30rpx;
		font-family: Inter-Regular, Inter;
		margin-top: 48rpx;
		color: #4298ff;
	}
}
</style>
