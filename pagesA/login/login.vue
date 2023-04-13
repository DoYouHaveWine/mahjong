<template>
	<view>
		<view class="blue-top">
			<view class="white-cicle1" />
			<view class="white-cicle2" />
			<view class="logo-and-name">
				<image src="/static/ic_logo.jpg" @tap="handleChangeIp" />
				<text>健康涪陵</text>
			</view>
			<view class="bg-white-radius" />
		</view>

		<u-form labelPosition="left" :model="form" :rules="rules" ref="uForm">
			<!-- 密码登录 -->
			<template v-if="isPwdLoginType">
				<u-form-item prop="account">
					<u-input
						v-model="form.account"
						shape="circle"
						placeholder="手机号或账户名"
						placeholderStyle="color: rgba(15,20,25,0.2)"
						prefixIcon="account"
						prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
						customStyle="height:70rpx"
					/>
				</u-form-item>
				<u-form-item prop="password">
					<!-- 注意在APP下需要修改源码才能显示隐藏密码生效https://github.com/umicro/uView2.0/issues/829 -->
					<u-input
						v-model="form.password"
						shape="circle"
						placeholder="请输入您的密码"
						placeholderStyle="color: rgba(15,20,25,0.2)"
						:password="!showPassword"
						prefixIcon="lock"
						prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
						customStyle="height:70rpx"
					>
						<view slot="suffix" class="show-password" @click="showPassword = !showPassword">
							<u-icon :name="showPassword ? 'eye-fill' : 'eye-off'" color="#A0A8B0" size="50rpx" />
						</view>
					</u-input>
				</u-form-item>
			</template>

			<!-- 验证码登录 -->
			<template v-else>
				<u-form-item prop="mobile">
					<u-input
						v-model="form.mobile"
						shape="circle"
						placeholder="手机号"
						placeholderStyle="color: rgba(15,20,25,0.2)"
						prefixIcon="account"
						prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
						customStyle="height:70rpx"
					/>
				</u-form-item>

				<u-form-item prop="code">
					<u-input
						v-model="form.code"
						shape="circle"
						placeholder="请输入验证码"
						placeholderStyle="color: rgba(15,20,25,0.2)"
						prefixIcon="lock"
						prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
						customStyle="height:70rpx"
					>
						<view slot="suffix" class="show-password">
							<u-button
								shape="circle"
								plain
								type="primary"
								size="small"
								:text="verifyCodeText"
								@click="onStartVerifyCode"
								:disabled="codeBtnDisabled"
							/>
						</view>
					</u-input>
				</u-form-item>
			</template>
		</u-form>

		<!-- 验证码组件 -->
		<u-code ref="uCode" @change="codeChange" @start="codeBtnDisabled = true" @end="codeBtnDisabled = false" />

		<view class="login-tip-box">
			<text @click="switchLoginType">{{ isPwdLoginType ? '短信登录' : '密码登录' }}</text>
			<text v-if="isPwdLoginType" @click="$navTo('./phone?fromPage=forgetPwd')">忘记密码?</text>
		</view>

		<view class="btn-box"><u-button type="primary" shape="circle" customStyle="height:100rpx" text="登录" @click="handleLogin" /></view>

		<view class="register-box">
			<text>没有账号?</text>
			<text class="register" @click="$navTo('./phone?fromPage=register')">立即注册</text>
		</view>

		<view class="bottom-privacy-box">
			<checked :checked="checked" @onChecked="checked = !checked" />
			<text>已阅读并同意《</text>
			<text class="blue-text" @click="$navTo('/pagesA/pdf/agreement')">用户协议</text>
			<text>》和</text>
			<text>《</text>
			<text class="blue-text" @click="$navTo('/pagesA/pdf/privacy')">隐私协议</text>
			<text>》</text>
		</view>

		<load-data :loading="loadData.isLoading" :loadingText="loadData.loadingText" onlyShowLoading isLoadingDialog />
	</view>
</template>

<script>
import checked from '@/pagesA/components/checked.vue';
import { loginByPwd, loginByCode, getCode, fetchUserInfo } from '@/common/http/api';
export default {
	components: {
		checked
	},

	data() {
		return {
			form: {
				account: '',
				mobile: '',
				password: '',
				code: '',
				fromType: 3 // 1:小程序;2:公众号;3:安卓app,4:ios,5:后台
			},
			rules: {
				account: {
					type: 'string',
					required: true,
					message: '请输入手机号或账户名',
					trigger: ['blur', 'change']
				},
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
							const mobileValidate = uni.$u.test.mobile(value);
							this.codeBtnDisabled = !mobileValidate;
							return mobileValidate;
						},
						message: '手机号码格式不正确',
						// 触发器可以同时用blur和change
						trigger: ['change', 'blur']
					}
				],
				password: {
					type: 'string',
					required: true,
					message: '请输入密码',
					trigger: ['blur', 'change']
				},
				code: {
					type: 'string',
					required: true,
					message: '请输入验证码',
					trigger: ['blur', 'change']
				}
			},
			showPassword: false,
			checked: false,
			isPwdLoginType: true, // 是否是密码登录的方式
			verifyCodeText: '获取验证码',
			codeBtnDisabled: true,
			loadData: { isLoading: false, loadingText: '发送中...' },
			tapTimes: 0,
			fromPage: 'index'
		};
	},

	onReady() {
		//如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则。
		this.$refs.uForm.setRules(this.rules);
	},

	onLoad(options) {
		this.fromPage = options.fromPage || 'index';
		this.form.account = uni.getStorageSync('account') || '';
	},

	methods: {
		/** 切换登录方式 */
		switchLoginType() {
			this.isPwdLoginType = !this.isPwdLoginType;
			this.$refs.uForm.clearValidate();
		},

		/** 获取验证码 */
		onStartVerifyCode() {
			this.$refs.uForm.validateField('mobile', async errorRes => {
				if (errorRes.length > 1) {
					uni.$u.toast(errorRes[0].message);
					return;
				}

				this.loadData = { isLoading: true, loadingText: '发送中...' };
				try {
					const { code } = await getCode(this.form.mobile);
					this.loadData.isLoading = false;
					if (code == 200) {
						this.$refs.uCode.start();
					}
				} catch (e) {
					this.loadData.isLoading = false;
				}
			});
		},

		/** 验证码倒计时回调 */
		codeChange(text) {
			this.verifyCodeText = text;
		},

		/** 登录 */
		handleLogin() {
			this.$refs.uForm.validate().then(async res => {
				if (!this.checked) {
					uni.$u.toast('请阅读并勾选下方的协议');
					return;
				}

				let response;
				this.loadData = { isLoading: true, loadingText: '登录中...' };
				try {
					if (this.isPwdLoginType) {
						response = await loginByPwd(this.form);
					} else {
						response = await loginByCode(this.form);
					}
					this.loadData.isLoading = false;
					if (response.code == 200) {
						uni.setStorageSync('token', response.data);
						uni.setStorageSync('account', this.form.account || this.form.mobile);
						await fetchUserInfo();
						switch (this.fromPage) {
							case 'index':
								uni.switchTab({ url: '/pages/index/index' });
								break;

							case 'health':
								uni.switchTab({ url: '/pages/health/health' });
								break;

							case 'mine':
								uni.switchTab({ url: '/pages/mine/mine' });
								break;

							default:
								uni.switchTab({ url: '/pages/index/index' });
								break;
						}
					}
				} catch (e) {
					this.loadData.isLoading = false;
				}
			});
		},

		/** 在2s内连续点五下进入修改IP的界面 */
		handleChangeIp() {
			this.tapTimes++;
			if (this.tapTimes >= 5) {
				uni.navigateTo({ url: '/pagesA/changeIp/changeIp' });
			}
			setTimeout(_ => {
				this.tapTimes = 0;
			}, 2000);
		}
	}
};
</script>

<style lang="scss">
page {
	.blue-top {
		height: 40vh;
		background-color: #4298ff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;

		.white-cicle1 {
			width: 184rpx;
			height: 184rpx;
			position: absolute;
			top: 70rpx;
			right: 40rpx;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
			border-radius: 50%;
		}

		.white-cicle2 {
			width: 64rpx;
			height: 64rpx;
			position: absolute;
			bottom: 46rpx;
			right: 84rpx;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
			border-radius: 50%;
		}

		.logo-and-name {
			display: flex;
			flex-direction: column;
			align-items: center;

			image {
				width: 133rpx;
				height: 133rpx;
				border-radius: 50%;
			}

			text {
				margin-top: 20rpx;
				font-size: 60rpx;
				font-family: YRDZST-Bold, YRDZST;
				color: #fff;
			}
		}

		.bg-white-radius {
			position: absolute;
			background-color: #fff;
			height: 48rpx;
			width: 100%;
			bottom: 0;
			border-radius: 48rpx 48rpx 0 0;
		}
	}

	.u-form {
		margin: 0 48rpx;

		.show-password {
			padding: 0 10rpx;
		}
	}

	.login-tip-box {
		margin-top: 10rpx;
		display: flex;
		justify-content: space-between;
		font-size: 26rpx;
		font-family: PingFang SC-Regular, PingFang SC;
		color: #4298ff;

		text {
			padding: 0 48rpx 20rpx 48rpx;
		}
	}

	.btn-box {
		margin: 48rpx 48rpx 30rpx 48rpx;
	}

	.register-box {
		display: flex;
		justify-content: center;
		font-size: 30rpx;
		font-family: PingFang SC-Regular, PingFang SC;
		color: #536471;

		.register {
			color: #4298ff;
			padding: 0 20rpx;
		}
	}

	.bottom-privacy-box {
		width: 100%;
		position: absolute;
		bottom: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		font-family: PingFang SC-Regular, PingFang SC;

		text {
			&:first-of-type {
				margin-left: -10rpx;
			}
		}

		.blue-text {
			color: #4298ff;
		}
	}
}
</style>
