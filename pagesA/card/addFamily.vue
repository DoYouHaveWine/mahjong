<!-- 添加普通成员 -->
<template>
	<view class="add-family">
		<u-notify ref="uNotify" />

		<view class="page-top">
			<view class="card">
				<u-form :model="form" ref="uForm" :rules="rules">
					<u-form-item prop="name" required label="姓名" borderBottom labelWidth="90px">
						<u-input v-model="form.name" placeholder="请输入姓名" inputAlign="right" border="none" />
					</u-form-item>
					<u-form-item prop="idCard" required label="身份证号" borderBottom labelWidth="90px">
						<u-input v-model="form.idCard" placeholder="请输入身份证号码" inputAlign="right" border="none" />
					</u-form-item>
					<u-form-item label="性别" borderBottom labelWidth="90px">
						<u-input v-model="form.sex" placeholder=" " inputAlign="right" border="none" readonly />
					</u-form-item>
					<u-form-item label="出生日期" borderBottom labelWidth="90px">
						<u-input v-model="form.birthday" placeholder=" " inputAlign="right" border="none" readonly />
					</u-form-item>
					<u-form-item prop="nation" label="民族" required borderBottom labelWidth="90px">
						<view slot="right" class="slot-right" @click="nationShow = true">
							<u--input v-model="form.nationText" border="none" inputAlign="right" placeholder="请选择民族" readonly />
							<u-icon size="32rpx" name="arrow-right" />
						</view>

						<my-select
							:show="nationShow"
							labelName="text"
							@confirm="onConfirm"
							:list="nationsArr"
							@cancel="nationShow = false"
						/>
					</u-form-item>
					<u-form-item prop="mobile" label="手机号" required borderBottom labelWidth="90px">
						<view class="mobile-box">
							<u-input v-model="form.mobile" border="none" placeholder="请填写手机号" inputAlign="right" type="number" />
							<u-button
								v-if="!recordId"
								customStyle="width:150rpx;height:50rpx;margin-left:20rpx;margin-right:-10rpx"
								size="mini"
								plain
								:disabled="codeBtnDisabled"
								@click="getCode"
								:text="codeTxt"
							/>
						</view>
						<u-code ref="uCode" @change="codeChange" @start="codeBtnDisabled = true" @end="codeBtnDisabled = false" />
					</u-form-item>
					<u-form-item v-if="!recordId" prop="code" label="验证码" :required="!recordId" borderBottom labelWidth="90px">
						<u-input v-model="form.code" placeholder="请填写验证码" border="none" inputAlign="right" type="number" />
					</u-form-item>
					<u-form-item prop="addressArea" label="现居地" required borderBottom labelWidth="90px">
						<view slot="right" class="slot-right" @click="showAddressAreaPicker = true">
							<u--input v-model="form.addressArea" border="none" inputAlign="right" placeholder="请选择现居地" readonly />
							<u-icon size="32rpx" name="arrow-right" />
						</view>

						<my-select
							mode="mutil-column-auto"
							:show="showAddressAreaPicker"
							:list="regionList"
							valueName="code"
							labelName="name"
							@confirm="onAreaSelConfirm"
							@cancel="showAddressAreaPicker = false"
						/>
					</u-form-item>
					<u-form-item prop="address" required label="详细地址" borderBottom labelWidth="90px">
						<u-input v-model="form.address" border="none" inputAlign="right" placeholder="请输入详细地址" />
					</u-form-item>
					<u-form-item prop="relationShip" label="与本人关系" required labelWidth="90px">
						<view slot="right" class="slot-right" @click="showRelationTypePicker = true">
							<u-input v-model="relationTypeName" border="none" inputAlign="right" placeholder="请选择现居地" readonly />
							<u-icon size="32rpx" name="arrow-right" />
						</view>

						<my-select
							mode="mutil-column-auto"
							:show="showRelationTypePicker"
							:list="relationTypeList"
							@confirm="onRelationTypeSelConfirm"
							@cancel="showRelationTypePicker = false"
						/>
					</u-form-item>
				</u-form>
			</view>

			<view class="check-default">
				<checked label="默认" @onChecked="onChecked" :checked="defaultChecked" :disabled="defaultCheckedDisabled" />
			</view>
		</view>

		<view class="page-bottom">
			<u-button
				shape="circle"
				text="提交"
				type="primary"
				@click="onSubmit"
				:loading="submitLoading"
				loadingText="提交中..."
				:disabled="submitLoading"
				:customStyle="{ width: '90%' }"
			/>
		</view>
	</view>
</template>

<script>
import { getDictList, getRegionList, addCard, editCard, getCardDetail, refreshCardList, getCode } from '@/common/http/api.js';
import mySelect from '@/pagesA/components/mySelect.vue';
import checked from '@/pagesA/components/checked.vue';
export default {
	components: {
		mySelect,
		checked
	},

	data() {
		return {
			showRelationTypePicker: false,
			showAddressAreaPicker: false,
			nationShow: false,
			defaultChecked: false,
			defaultCheckedDisabled: false,
			idTypeList: [],
			nationsArr: [],
			regionList: [],
			relationTypeList: [],
			form: {
				name: '',
				nation: '',
				idCard: '',
				mobile: undefined,
				relationShip: 0,
				nation: '',
				nationText: '',
				birthday: '',
				sex: '',
				defaultFlg: 1,
				province: '',
				city: '',
				district: '',
				address: ''
			},
			rules: {
				name: {
					required: true,
					message: '姓名不能为空',
					trigger: ['change', 'blur']
				},
				relationShip: {
					required: true,
					message: '请选择关系',
					type: 'number',
					trigger: ['change', 'blur']
				},
				idCard: {
					required: true,
					len: 18,
					validator: (rule, value, callback) => {
						return uni.$u.test.idCard(value);
					},
					message: '身份证号码格式不正确',
					trigger: ['change', 'blur']
				},
				addressArea: {
					required: true,
					message: '现居地不能为空',
					trigger: ['change', 'blur']
				},
				address: {
					required: true,
					message: '详细地址不能为空',
					trigger: ['change', 'blur']
				},
				mobile: {
					required: true,
					validator: (rule, value, callback) => {
						return uni.$u.test.mobile(value);
					},
					message: '手机号码格式不正确',
					trigger: ['change', 'blur']
				},
				nation: {
					required: true,
					message: '民族不能为空',
					trigger: ['change', 'blur']
				}
			},
			submitLoading: false,
			recordId: '',
			codeTxt: '获取验证码',
			codeBtnDisabled: true
		};
	},

	watch: {
		'form.idCard': function(newVal, oldVal) {
			let value = newVal;
			if (uni.$u.test.idCard(value)) {
				this.form.birthday = `${value.substr(6, 4)}-${value.substr(10, 2)}-${value.substr(12, 2)}`;
				this.form.sex = value.substr(16, 1) % 2 == 0 ? '女' : '男';
			}
		},

		'form.mobile': function(newVal, oldVal) {
			if (this.$refs.uCode.canGetCode) {
				// 获取验证码时更换手机号也不能点击按键
				this.codeBtnDisabled = newVal.length !== 11;
			}
		}
	},

	computed: {
		/** 关系名 */
		relationTypeName() {
			for (let item of this.relationTypeList) {
				if (item.value == this.form.relationShip) {
					return item.label;
				}
			}
			return '';
		}
	},

	onLoad(options) {
		const { recordId = '', wechatCode = '' } = options;
		this.recordId = recordId;

		if (options && wechatCode) {
			this.$set(this.form, 'wechatCode', wechatCode);
		}

		this.getRelationShipList();
		this.getData();

		if (recordId) {
			uni.setNavigationBarTitle({ title: '修改电子健康卡' });
			this.getDetail();
		} else {
			// 修改时即使设置验证码不可见，规则依然生效，只能动态添加
			this.rules.code = {
				required: true,
				message: '验证码不能为空',
				trigger: ['change', 'blur']
			};
		}
	},

	onReady() {
		// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
		this.$refs.uForm.setRules(this.rules);
	},

	methods: {
		getRelationShipList() {
			const obj = this.constantMap.get('relationShipType');
			for (let key in obj) {
				this.relationTypeList.push({
					label: obj[key],
					value: key
				});
			}
		},

		onChecked(checked) {
			this.defaultChecked = !checked;
		},

		async getDetail() {
			let { data = {} } = await getCardDetail(this.recordId);
			const { provinceName, cityName, districtName, nationName, relationShip, defaultFlg } = data || {};
			for (let key in this.form) {
				this.form[key] = data[key] !== null || data[key] !== undefined ? data[key] : '';
			}
			this.form.addressArea = `${provinceName || ''}${cityName || ''}${districtName || ''}`;
			this.form.nationText = nationName || '';
			this.relationTypeList.forEach(({ label, value }) => {
				if (value === relationShip) {
					this.relationTypeName = label;
					return;
				}
			});
			this.defaultChecked = defaultFlg == 1;
			this.defaultCheckedDisabled = defaultFlg == 1;
		},

		async getData() {
			var rs = await getDictList('NATION_TYPE');
			this.form.nation = rs.data && rs.data[0].value ? rs.data[0].value : '';
			this.form.nationText = rs.data && rs.data[0].text ? rs.data[0].text : '';
			this.nationsArr = rs.data;

			let { data = [] } = await getRegionList();
			this.regionList = data;
		},

		/**
		 * 区域选择
		 *
		 * @param {Object} e 选择结果回调
		 */
		onAreaSelConfirm(e) {
			this.form.province = e[0].value || '';
			this.form.city = e[1].value || '';
			this.form.district = e[2].value || '';
			this.form.addressArea = `${e[0].label}${e[1].label == '市辖区' ? '' : e[1].label}${e[2].label}`;
			this.showAddressAreaPicker = false;
		},

		onConfirm(e) {
			this.form.nation = e[0].value;
			this.form.nationText = e[0].label;
			this.nationShow = false;
		},

		/** 关系弹窗选择 */
		onRelationTypeSelConfirm(e) {
			this.form.relationShip = e[0].value;
			this.showRelationTypePicker = false;
		},

		onSubmit() {
			this.$refs.uForm
				.validate()
				.then(async valid => {
					if (!valid) {
						return;
					}

					const { addressArea = '', birthday, nationText, sex, defaultFlg, ...rest } = this.form;
					let params = {
						openId: uni.getStorageSync('openId'),
						fromType: 1, // 1来源小程序
						queryType: 1, //1 正常注册 2 快速建档
						defaultFlg: this.defaultChecked ? 1 : 0,
						...rest
					};
					let res = '';
					this.submitLoading = true;
					if (this.recordId) {
						params.recordId = this.recordId;
						res = await editCard(params);
					} else {
						res = await addCard(params);
					}
					this.submitLoading = false;
					if (res.code == 200) {
						this.$refs.uNotify.show({
							message: `健康卡${this.recordId ? '修改' : '添加'}成功`,
							type: 'success',
							duration: '2000'
						});
						setTimeout(async () => {
							await refreshCardList();
							uni.navigateBack({ delta: 2 });
						}, 2000);
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				})
				.catch(errors => {});
		},

		/** 获取验证码 */
		async getCode() {
			if (this.$refs.uCode.canGetCode) {
				if (this.$u.test.mobile(this.form.mobile)) {
					this.$refs.uCode.start();
					let res = await getCode(this.form.mobile);
					if (res.code === 200) {
						this.$refs.uNotify.show({
							message: '验证码发送成功',
							type: 'success',
							duration: '2000'
						});
						this.codeBtnDisabled = true;
					}
				} else {
					this.$refs.uTips.show({
						title: '手机号格式错误',
						type: 'error',
						duration: '2300'
					});
				}
			} else {
				this.codeBtnDisabled = true;
			}
		},

		/**
		 * 验证码改变回调
		 * @param {Object} text 验证码文本
		 */
		codeChange(text) {
			this.codeTxt = text;
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

	.btn-box {
		position: fixed;
		width: 100%;
		box-sizing: border-box;
		bottom: 40rpx;
	}

	.sm-size {
		font-size: 30rpx;
	}

	.add-family {
		height: 100vh;
		/deep/.u-form-item__body__left__content__required {
			font-size: 30rpx;
			top: 0px;
		}
		/deep/.u-form-item__body__right__message {
			text-align: right;
			padding-right: 15rpx;
		}
		.page-top {
			min-height: calc(100vh - 120rpx);

			.mobile-box {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
		}
		.page-bottom {
			padding-bottom: 20rpx;
		}

		.slot-right {
			display: flex;

			.u-icon {
				margin-left: 10rpx;
			}
		}
	}

	.check-default {
		padding: 28rpx 30rpx;
	}
}
</style>
