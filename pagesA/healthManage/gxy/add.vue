<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="card">
			<u--form :model="form" ref="uForm" :rules="rules">
				<u-form-item prop="date" required label="记录日期" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="dateShow = true">
						<u--input v-model="form.date" placeholder="请选择记录日期" inputAlign="right" readonly border="none" />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="time" required label="记录时间" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="timeShow = true">
						<u--input v-model="form.time" placeholder="请输入记录时间" inputAlign="right" readonly border="none" />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item label="高压（收缩压）" prop="systolicPressure" required borderBottom labelWidth="110px">
					<u-input v-model="form.systolicPressure" placeholder="请输入" inputAlign="right" border="none" type="number">
						<text slot="suffix" class="suffix-text">mmHg</text>
					</u-input>
				</u-form-item>
				<u-form-item label="低压（舒张压）" prop="diastolicPressure" required borderBottom labelWidth="110px">
					<u-input v-model="form.diastolicPressure" placeholder="请输入" inputAlign="right" border="none" type="number">
						<text slot="suffix" class="suffix-text">mmHg</text>
					</u-input>
				</u-form-item>
				<u-form-item prop="pulse" label="脉搏" required labelWidth="110px">
					<u-input v-model="form.pulse" border="none" inputAlign="right" placeholder="请输入" type="number">
						<text slot="suffix" class="suffix-text">次/分钟</text>
					</u-input>
				</u-form-item>
			</u--form>
		</view>

		<view class="normal-range">
			<view class="">指标正常范围</view>
			<view class="">高压（收缩压）：{{ xyType.systolicRange || '' }}mmHg</view>
			<view class="">低压（舒张压）：{{ xyType.diastolicRange || '' }}mmHg</view>
			<view class="">脉搏：{{ xyType.pulse || '' }}次/分钟（记录脉搏可方便医生排查参考）</view>
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
			v-model="date"
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
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { addXy } from '@/common/http/api.js';
export default {
	data() {
		return {
			submitLoading: false,
			dateShow: false,
			timeShow: false,
			recordId: '',
			date: dayjs().format('YYYY-MM-DD'),
			xyType: '',
			maxDate: dayjs().valueOf(),
			form: {
				date: dayjs().format('YYYY-MM-DD'),
				time: dayjs().format('HH:mm'),
				pulse: '',
				diastolicPressure: '',
				systolicPressure: ''
			},
			rules: {
				date: {
					required: true,
					message: '记录日期不能为空',
					trigger: ['change', 'blur']
				},
				time: {
					required: true,
					message: '记录时间不能为空',
					trigger: ['change', 'blur']
				},
				pulse: {
					required: true,
					message: '请输入40到300的整数',
					validator: (rule, value, callback) => {
						return uni.$u.test.digits(value) && uni.$u.test.range(value, [40, 300]);
					},
					trigger: ['change', 'blur']
				},
				diastolicPressure: {
					required: true,
					message: '请输入40到300的整数',
					validator: (rule, value, callback) => {
						return uni.$u.test.digits(value) && uni.$u.test.range(value, [40, 300]);
					},
					trigger: ['change', 'blur']
				},
				systolicPressure: {
					required: true,
					message: '请输入40到300的整数',
					validator: (rule, value, callback) => {
						return uni.$u.test.digits(value) && uni.$u.test.range(value, [40, 300]);
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
		this.xyType = this.constantMap.get('xyType');
		const { recordId = '' } = options;
		this.recordId = recordId;
	},

	methods: {
		dateChoose({ value }) {
			this.form.date = dayjs(value).format('YYYY-MM-DD');
			this.dateShow = false;
		},
		onSubmit() {
			this.$refs.uForm.validate().then(valid => {
				if (!valid) {
					return;
				}
				addXy({ recordId: this.recordId, ...this.form }).then(({ code }) => {
					if (code == 200) {
						this.$refs.uNotify.show({
							message: `添加血压成功`,
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
}
</style>
