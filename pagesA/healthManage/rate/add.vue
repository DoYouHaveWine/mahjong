<template>
	<view>
		<u-notify ref="uNotify" />

		<view class="card">
			<u--form :model="form" ref="uForm" :rules="rules">
				<u-form-item prop="day" required label="记录日期" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="dateShow = true">
						<u--input v-model="form.day" border="none" inputAlign="right" placeholder="请选择记录日期" readonly />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="time" required label="记录时间" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="timeShow = true">
						<u--input v-model="form.time" border="none" inputAlign="right" placeholder="请输入记录时间" readonly />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item label="心率值" prop="bpm" required borderBottom labelWidth="110px">
					<u-input v-model="form.bpm" placeholder="请输入" inputAlign="right" type="number" border="none">
						<span slot="suffix" class="suffix-text">bpm</span>
					</u-input>
				</u-form-item>
			</u--form>
		</view>

		<view class="normal-range">
			<view class="">指标正常范围</view>
			<view class="">心率过缓：低于60bpm</view>
			<view class="">心率正常：60~100bpm</view>
			<view class="">心率过速：高于100bpm</view>
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
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { addRate } from '@/common/http/api.js';
export default {
	data() {
		return {
			submitLoading: false,
			dateShow: false,
			timeShow: false,
			recordId: '',
			day: dayjs().format('YYYY-MM-DD'),
			maxDate: dayjs().valueOf(),
			form: {
				bpm: '',
				day: dayjs().format('YYYY-MM-DD'),
				time: dayjs().format('HH:mm')
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
				bpm: {
					required: true,
					message: '请输入40到150的整数',
					validator: (rule, value, callback) => {
						return uni.$u.test.digits(value) && uni.$u.test.range(value, [40, 150]);
					},
					trigger: ['change', 'blur']
				}
			}
		};
	},

	onReady() {
		// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
		this.$refs.uForm.setRules(this.rules);
	},

	onLoad(options) {
		const { recordId = '' } = options;
		this.recordId = recordId;
	},

	methods: {
		dateChoose({ value }) {
			this.form.day = dayjs(value).format('YYYY-MM-DD');
			this.dateShow = false;
		},

		onSubmit() {
			this.$refs.uForm.validate().then(valid => {
				if (!valid) {
					return;
				}

				addRate({ recordId: this.recordId, ...this.form }).then(({ code }) => {
					if (code == 200) {
						this.$refs.uNotify.show({
							message: `记录心率成功`,
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

	.card {
		/deep/.u-form-item__body {
			padding: 20rpx 40rpx;
		}

		/deep/ .u-form-item__body__left__content__required {
			font-size: 30rpx;
			top: 0px;
		}

		/deep/ .u-form-item__body__left__content__label {
			font-size: 30rpx;
		}

		/deep/ .u-form-item__body__right__message {
			text-align: right;
			padding-right: 15rpx;
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
