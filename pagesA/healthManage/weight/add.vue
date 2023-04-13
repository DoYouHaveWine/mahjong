<template>
	<view class="weight-page">
		<u-notify ref="uNotify" />

		<view class="card">
			<u--form :model="form" ref="uForm" :rules="rules">
				<u-form-item prop="date" required label="记录日期" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="showDatePicker = true">
						<u--input v-model="form.day" border="none" inputAlign="right" placeholder="请选择记录日期" readonly />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="time" required label="记录时间" borderBottom labelWidth="110px">
					<view slot="right" class="slot-right" @click="showTimePicker = true">
						<u--input v-model="form.time" border="none" inputAlign="right" placeholder="请输入记录时间" readonly />
						<u-icon size="32rpx" name="arrow-right" />
					</view>
				</u-form-item>
				<u-form-item prop="height" required label="身高" borderBottom>
					<u-input v-model="form.height" fontSize="30rpx" placeholder="请输入" type="number" inputAlign="right" border="none">
						<text slot="suffix" class="suffix-text">CM</text>
					</u-input>
				</u-form-item>
				<u-form-item prop="weight" label="体重" required>
					<u-input fontSize="30rpx" v-model="form.weight" border="none" type="number" inputAlign="right" placeholder="请输入">
						<span slot="suffix" class="suffix-text">KG</span>
					</u-input>
				</u-form-item>
			</u--form>
		</view>

		<view class="btn-box">
			<u-button
				shape="circle"
				text="保存"
				type="primary"
				@click="onSubmit"
				:loading="submitLoading"
				loadingText="保存中..."
				:disabled="submitLoading"
			/>
		</view>

		<u-datetime-picker
			:show="showDatePicker"
			v-model="chooseDate"
			closeOnClickOverlay
			mode="date"
			:maxDate="maxDate"
			:formatter="formatter"
			@confirm="onDateConfirm"
			@cancel="showDatePicker = false"
		/>

		<u-datetime-picker
			:show="showTimePicker"
			v-model="form.time"
			closeOnClickOverlay
			mode="time"
			@confirm="showTimePicker = false"
			@cancel="showTimePicker = false"
		/>
	</view>
</template>

<script>
import dayjs from 'dayjs';
import { addWeightRecord } from '@/common/http/api.js';
export default {
	data() {
		return {
			submitLoading: false,
			showDatePicker: false,
			showTimePicker: false,
			cardId: '',
			chooseDate: dayjs().format('YYYY-MM-DD'),
			maxDate: dayjs().valueOf(),
			form: {
				day: dayjs().format('YYYY-MM-DD'),
				time: dayjs().format('HH:mm'),
				height: '',
				weight: ''
			},
			rules: {
				height: {
					required: true,
					message: '请输入身高',
					trigger: ['change', 'blur']
				},
				weight: {
					required: true,
					message: '请输入体重',
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
		const { cardId = '' } = options;
		this.cardId = cardId;
		this.initDate();
	},

	methods: {
		confirmCheckTime({ value = [] }) {
			this.form.checkTime = value[0].text;
			this.form.timeScope = value[0].value;
			this.checkshowTimePicker = false;
		},

		onDateConfirm({ value }) {
			this.form.day = dayjs(value).format('YYYY-MM-DD');
			this.showDatePicker = false;
		},

		onSubmit() {
			this.$refs.uForm.validate().then(async valid => {
				if (!valid) {
					return;
				}
				this.submitLoading = true;
				const { code } = await addWeightRecord({ recordId: this.cardId, ...this.form });
				this.submitLoading = false;
				if (code == 200) {
					this.$refs.uNotify.show({
						message: `添加体重记录成功`,
						type: 'success',
						duration: '1000'
					});

					let pages = getCurrentPages(); // 当前页面
					let beforePage = pages[pages.length - 2]; // 上一页
					beforePage.$vm.needRefreshData = true;
					// 延时返回让notify展示
					setTimeout(() => uni.navigateBack(), 2000);
				}
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

	.card {
		padding-top: 10rpx;
		background-color: #ffffff;

		.suffix-text {
			padding-left: 10rpx;
			font-size: 26rpx;
		}

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

		.sm-size {
			font-size: 30rpx;
		}

		.slot-right {
			display: flex;

			.u-icon {
				margin-left: 10rpx;
			}
		}
	}

	.btn-box {
		position: absolute;
		bottom: 48rpx;
		margin: 0 48rpx;
		width: calc(100% - 96rpx);
	}
}
</style>
