<!-- 添加普通成员 -->
<template>
	<view class="add-family">
		<view class="page-top">
			<view class="card">
				<u-form :model="form" ref="uForm" :rules="rules">
					<u-form-item prop="city" label="意向城市" required borderBottom labelWidth="90px">
						<u-input v-model="form.city" placeholder="请输入意向城市" inputAlign="right" border="none" clearable />
					</u-form-item>
					<u-form-item prop="name" required label="联系姓名" borderBottom labelWidth="90px">
						<u-input v-model="form.name" placeholder="请输入联系姓名" inputAlign="right" border="none" clearable />
					</u-form-item>
					<u-form-item prop="cellphone" label="联系手机" required borderBottom labelWidth="90px">
						<u-input v-model="form.cellphone" border="none" placeholder="请填写联系手机" inputAlign="right" type="number" clearable />
					</u-form-item>
					<u-form-item prop="mode" label="经营类目" required borderBottom labelWidth="90px">
						<u-radio-group v-model="form.mode" placement="row" activeColor="#58AA6C">
							<u-radio key="1" label="棋牌" name="1"></u-radio>
							<u-radio key="2" label="茶室" name="2"></u-radio>
							<u-radio key="3" label="其他" name="3"></u-radio>
						</u-radio-group>
					</u-form-item>
					<u-form-item prop="message" label="留言建议" borderBottom labelWidth="90px">
						<u-input v-model="form.message" placeholder="选填" inputAlign="right" border="none" />
					</u-form-item>
				</u-form>
				<view class="u-form-item f-12 c-66 mt5">
					<view>*提交表单申请，工作人员将在3个工作日内与您电话联系</view>
					<view class="ptb-10">*如需即时了解，请直接电话咨询，客服人员将第一时间解答。</view>
				</view>
			</view>
		</view>

		<view class="page-bottom plr-10">
			<u-button shape="circle" text="电话咨询" customStyle="color:#58AA6C;" @click="call" />
			<view style="width: 40rpx;"></view>
			<u-button shape="circle" text="提交申请" color="linear-gradient(313deg, #58AA6C 0%, #84C794 100%)"
				customStyle="color:#ffffff;" @click="onSubmit" :loading="submitLoading" loadingText="提交中..."
				:disabled="submitLoading" />
		</view>
		
		<u-notify ref="uNotify"></u-notify>
	</view>
</template>

<script>
	import { ambition } from '@/common/http/api.js';
	export default {
		data() {
			return {
				form: {
					city: '',
					name: '',
					cellphone: undefined,
					mode: '1',
					message: ''
				},
				rules: {
					city: {
						required: true,
						message: '意向城市不能为空',
						trigger: ['change', 'blur']
					},
					name: {
						required: true,
						message: '联系姓名不能为空',
						trigger: ['change', 'blur']
					},
					cellphone: {
						required: true,
						validator: (rule, value, callback) => {
							return uni.$u.test.mobile(value);
						},
						message: '联系手机格式不正确',
						trigger: ['change', 'blur']
					},
					mode: {
						required: true,
						message: '经营类目不能为空',
						trigger: ['change']
					}
				},
				submitLoading: false
			};
		},
		
		computed: {

		},

		onLoad(options) {

		},

		onReady() {

		},

		methods: {
			call() {
				uni.makePhoneCall({
					phoneNumber: getApp().globalData.qPhone
				});
			},
			onSubmit() {
				this.$refs.uForm.validate()
					.then(async valid => {
						if (!valid) {
							return;
						}
						const {	...rest	} = this.form;
						let params = {	...rest	};
						this.submitLoading = true;
						//todo
						let res = await ambition(params);
						//提交
						this.submitLoading = false;
						if (res.code === 200) {
							// this.$refs.uNotify.show({
							// 	message: '提交成功',
							// 	type: 'success',
							// 	duration: '2000'
							// });
							uni.showToast({
								title: '提交成功',
								icon: 'success',
								duration: 2000
							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								});
							}, 2000);
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							});
						}
					})
					.catch(errors => {});
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #ffffff;
		
		margin-top: 20rpx;

		.card /deep/ .u-form-item__body {
			padding: 12rpx 30rpx;
		}

		.card {
			background-color: #ffffff;

			.u-form-item {
				padding: 12rpx 18rpx;
			}
		}

		.add-family {
			/deep/.u-form-item__body__left__content__required {
				font-size: 30rpx;
				top: 0px;
			}

			/deep/.u-form-item__body__right__message {
				text-align: right;
				padding-right: 15rpx;
			}

			.page-bottom {
				margin-top: 120rpx;
				padding-bottom: 20rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.slot-right {
				display: flex;

				.u-icon {
					margin-left: 10rpx;
				}
			}
		}
	}
</style>