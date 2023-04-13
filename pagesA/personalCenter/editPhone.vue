<template>
	<view class="page">
		<u-notify ref="uNotify" />

		<u-form labelPosition="left" :model="form" :rules="rules" ref="uForm">
			<u-form-item prop="mobile">
				<u-input
					v-model="form.mobile"
					shape="circle"
					placeholder="请输入手机号"
					placeholderStyle="color: rgba(15,20,25,0.2)"
					prefixIcon="account"
					maxlength="11"
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
					maxlength="6"
					prefixIconStyle="color:#A0A8B0;fontSize:50rpx"
					customStyle="height:70rpx"
				>
					<view slot="suffix" class="show-password" @click="getCode">
						<u-button
							shape="circle"
							plain
							type="primary"
							size="small"
							:text="verifyCodeText"
							:disabled="codeBtnDisabled"
						/>
					</view>
				</u-input>
			</u-form-item>
		</u-form>

		<u-code ref="uCode" @change="codeChange" @start="codeBtnDisabled = true" @end="codeBtnDisabled = false" />

		<u-button
			customStyle="marginTop: 80rpx"
			type="primary"
			@click="editMember"
			:loading="loading"
			shape="circle"
			:disabled="sureBtnDisabled"
			text="确认修改"
		/>

		<load-data :loading="loadData.isLoading" :loadingText="loadData.loadingText" onlyShowLoading isLoadingDialog />
	</view>
</template>

<script>
import { getMemberDetails, editMember, getCode } from '@/common/http/api.js';

export default {
	data() {
		return {
			form: { mobile: '', code: '' },
			loading: false,
			verifyCodeText: '获取验证码',
			codeBtnDisabled: true,
			sureBtnDisabled: true,
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
							const mobileValidate = uni.$u.test.mobile(value);
							this.codeBtnDisabled = !mobileValidate;
							return mobileValidate;
						},
						message: '手机号码格式不正确',
						// 触发器可以同时用blur和change
						trigger: ['change', 'blur']
					}
				],
				code: {
					type: 'string',
					required: true,
					message: '请输入验证码',
					trigger: ['blur', 'change']
				}
			},
			loadData: { isLoading: false, loadingText: '发送中...' }
		};
	},

	watch: {
		'form.mobile': function() {
			this.checkBtnDisabled();
		},
		
		'form.code': function() {
			this.checkBtnDisabled();
		}
	},

	onReady() {
		// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
		this.$refs.uForm.setRules(this.rules);
	},

	methods: {
		/** 检查按键是否可点击 */
		checkBtnDisabled() {
			if (this.$refs.uCode.canGetCode) {
				// 获取验证码时更换手机号也不能点击按键
				this.codeBtnDisabled = this.form.mobile.length !== 11;
			}
			this.sureBtnDisabled = this.form.mobile.length !== 11 || !this.form.code || this.form.code.length !== 6;
		},

		/** 获取验证码 */
		async getCode() {
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

		/**
		 * 验证码改变回调
		 * @param {Object} text 验证码文本
		 */
		codeChange(text) {
			this.verifyCodeText = text;
		},

		/** 修改用户信息 */
		async editMember() {
			this.$refs.uForm.validate().then(async res => {
				this.loadData = { isLoading: true, loadingText: '修改中...' };
				const { code } = await editMember({
					id: uni.getStorageSync('sysUser').id,
					...this.form
				});
				this.loadData.isLoading = false;
				if (code == 200) {
					this.$refs.uNotify.show({
						message: '更新成功',
						type: 'success',
						duration: '2300'
					});
					setTimeout(() => {
						uni.$emit('refreshMember'); // 通知我的页面刷新
						uni.navigateBack();
					}, 1000);
				}
			});
		}
	}
};
</script>

<style lang="scss">
.page {
	margin: 30rpx;
}
</style>
