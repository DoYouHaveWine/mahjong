<!-- 添加普通成员 -->
<template>
	<view class="add-family">
		<view class="page-top">
			<view class="card">
				<u-form :model="form" ref="uForm" :rules="rules">
					<u-form-item prop="addressArea" label="意向城市" required borderBottom labelWidth="90px">
						<view slot="right" class="slot-right" @click="showAddressAreaPicker = true">
							<u--input v-model="form.addressArea" border="none" inputAlign="right" placeholder="请选择意向城市" readonly />
							<u-icon size="32rpx" name="arrow-right" />
						</view>

						<my-select mode="mutil-column-auto" :show="showAddressAreaPicker" :list="regionList" valueName="code"
							labelName="name" @confirm="onAreaSelConfirm" @cancel="showAddressAreaPicker = false" />
					</u-form-item>
					<u-form-item prop="name" required label="您的姓名" borderBottom labelWidth="90px">
						<u-input v-model="form.name" placeholder="请输入姓名" inputAlign="right" border="none" />
					</u-form-item>
					<u-form-item prop="mobile" label="您的手机号" required borderBottom labelWidth="90px">
						<u-input v-model="form.mobile" border="none" placeholder="请填写手机号" inputAlign="right" type="number" />
					</u-form-item>
					<u-form-item prop="name" label="留言建议" borderBottom labelWidth="90px">
						<u-input v-model="form.name" placeholder="选填" inputAlign="right" border="none" />
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
	</view>
</template>

<script>
	import {
		joinSubmit
	} from '@/common/http/api.js';
	import mySelect from '@/pagesA/components/mySelect.vue';
	export default {
		components: {
			mySelect
		},
		data() {
			return {
				showAddressAreaPicker: false,
				regionList: [],
				form: {
					name: '',
					mobile: undefined,
					province: '',
					city: '',
					district: ''
				},
				rules: {
					name: {
						required: true,
						message: '姓名不能为空',
						trigger: ['change', 'blur']
					},
					addressArea: {
						required: true,
						message: '意向城市不能为空',
						trigger: ['change', 'blur']
					},
					mobile: {
						required: true,
						validator: (rule, value, callback) => {
							return uni.$u.test.mobile(value);
						},
						message: '手机号码格式不正确',
						trigger: ['change', 'blur']
					}
				},
				submitLoading: false
			};
		},

		watch: {

		},

		computed: {

		},

		onLoad(options) {

		},

		onReady() {

		},

		methods: {
			call() {
				const phoneNumber = '123456';
				uni.showModal({
					title: '提示',
					content: `你确定要拨打客服电话:\n${phoneNumber}`, // 微信开发者工具不换行，真机会换行
					success: res => {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: phoneNumber
							});
						}
					}
				});
			},
			onSubmit() {
				this.$refs.uForm
					.validate()
					.then(async valid => {
						if (!valid) {
							return;
						}

						const {	...rest	} = this.form;
						let params = {	...rest	};
						this.submitLoading = true;
						//todo
						//提交
						this.submitLoading = false;
						if (res.code == 200) {
							this.$refs.uNotify.show({
								message: `提交成功`,
								type: 'success',
								duration: '2000'
							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 2
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
		background: #f5f7fa;

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