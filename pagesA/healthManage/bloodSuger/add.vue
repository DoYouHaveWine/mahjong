<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="card">
			<u--form :model="form" ref="uForm" :rules="rules">
				<u-form-item prop="day" required label="记录日期" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="dateShow = true">
						<u--input v-model="form.day" placeholder="请选择记录日期" inputAlign="right" readonly border="none" />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="time" required label="记录时间" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="timeShow = true">
						<u--input v-model="form.time" placeholder="请输入记录时间" inputAlign="right" readonly border="none" />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="timeScope" required label="检测时段" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="checkTimeShow = true">
						<u--input v-model="form.checkTime" placeholder="请选择检测时段" inputAlign="right" readonly border="none" />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="value" label="血糖值" required labelWidth="110px">
					<u-input v-model="form.value" border="none" inputAlign="right" placeholder="请输入血糖值">
						<span slot="suffix" class="suffix-text">mmol/L</span>
					</u-input>
				</u-form-item>
			</u--form>
		</view>

		<view class="normal-range">
			<view class="">控糖目标（2型糖尿病参考标准）</view>
			<view class="">空腹：{{ bloodSugerType.EMPTINESS || '' }}mmol/L</view>
			<view class="">餐前/餐后/睡前/凌晨：{{ bloodSugerType.OTHER || '' }}mmol/L</view>
		</view>

		<u-button
			shape="circle"
			text="保存"
			type="primary"
			@click="onSubmit"
			:loading="submitLoading"
			loadingText="保存中..."
			:disabled="submitLoading"
			:customStyle="{ width: '90%', position: 'absolute', bottom: '0', margin: '20px' }"
		/>

		<u-datetime-picker
			:show="dateShow"
			v-model="day"
			closeOnClickOverlay
			mode="date"
			:maxDate="maxDate"
			@confirm="dateChoose"
			@cancel="dateShow = false"
		/>

		<u-datetime-picker
			:show="timeShow"
			v-model="form.time"
			closeOnClickOverlay
			mode="time"
			@confirm="timeShow = false"
			@cancel="timeShow = false"
		/>

		<u-picker
			:show="checkTimeShow"
			@confirm="confirmCheckTime"
			@cancel="checkTimeShow = false"
			:columns="[bloodTypeList]"
			keyName="text"
		/>
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { addBloodSuger, getDictList } from '@/common/http/api.js';
export default {
	data() {
		return {
			submitLoading: false,
			dateShow: false,
			timeShow: false,
			checkTimeShow: false,
			recordId: '',
			bloodSugerType: '',
			maxDate: dayjs().valueOf(),
			day: dayjs().format('YYYY-MM-DD'),
			bloodTypeList: [],
			form: {
				day: dayjs().format('YYYY-MM-DD'),
				time: dayjs().format('HH:mm'),
				timeScope: '',
				checkTime: '',
				value: ''
			},
			rules: {
				day: {
					required: true,
					message: '记录日期不能为空',
					trigger: ['change', 'blur']
				},
				time: {
					required: true,
					message: '记录时间不能为空',
					trigger: ['change', 'blur']
				},
				timeScope: {
					required: true,
					message: '检测时段不能为空',
					trigger: ['change', 'blur']
				},
				value: {
					required: true,
					message: '请输入0.1到35的数值',
					validator: (rule, value, callback) => {
						if (!uni.$u.test.range(value, [0.1, 35])) {
							return false;
						} else {
							return true;
						}
					},
					trigger: ['change', 'blur']
				}
			}
		};
	},

	onReady() {
		this.$refs.uForm.setRules(this.rules);
	},

	onLoad(options) {
		this.bloodSugerType = this.constantMap.get('bloodSugerType');
		const { recordId = '' } = options;
		this.recordId = recordId;
		this.getDict();
	},

	methods: {
		async getDict() {
			const { data = [] } = await getDictList('BLOOD_SUGAR_TIME_SCOPE');
			this.bloodTypeList = data;
		},
		confirmCheckTime({ value = [] }) {
			this.form.checkTime = value[0].text;
			this.form.timeScope = value[0].value;
			this.checkTimeShow = false;
		},
		dateChoose({ value }) {
			this.form.day = dayjs(value).format('YYYY-MM-DD');
			this.dateShow = false;
		},
		onSubmit() {
			this.$refs.uForm.validate().then(valid => {
				if (!valid) {
					return;
				}
				addBloodSuger({ recordId: this.recordId, ...this.form }).then(({ code }) => {
					if (code == 200) {
						this.$refs.uNotify.show({
							message: `添加血糖记录成功`,
							type: 'success',
							duration: '2000'
						});
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 上一页
						beforePage.$vm.needRefreshData = true;
						// 延时返回让notify展示
						setTimeout(() => uni.navigateBack(), 2000);
					}
				});
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

	.suffix-text {
		padding-left: 10rpx;
		font-size: 15px;
	}
	.card /deep/ .u-form-item__body__left__content__required {
		font-size: 30rpx;
		top: 0px;
	}

	.card /deep/ .u-form-item__body__left__content__label {
		font-size: 30rpx;
	}
	.card /deep/ .u-form-item__body {
		padding: 12rpx 30rpx;
	}

	.card /deep/ .u-form-item__body__right__message {
		text-align: right;
		padding-right: 15rpx;
	}

	.card {
		background-color: #ffffff;

		/deep/.u-form-item {
			padding: 12rpx 18rpx;
		}

		.slot-right {
			display: flex;

			.u-icon {
				margin-left: 10rpx;
			}
		}
	}
	.normal-range {
		padding: 28rpx 48rpx 0 48rpx;
		font-size: 26rpx;
		line-height: 40rpx;
		color: rgba(15, 20, 25, 0.5);
	}
	.sm-size {
		font-size: 30rpx;
	}
}
</style>
