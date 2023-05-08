<!-- 封装的选中组件 -->
<template>
	<view @tap.stop="onChecked(currentChecked)" class="checked-box">
		<u-icon v-if="currentChecked" name="checkmark-circle-fill" :color="disabled ? disabledColor : activeIconColor" :size="iconSize" />
		<view v-else class="uncheck" :style="{ width: iconSize, height: iconSize, color: disabledColor }" />
		<text class="label" :style="{ color: disabled ? disabledColor : '#666' }">{{ label }}</text>
	</view>
</template>

<script>
export default {
	props: {
		// 标签
		label: {
			type: String,
			default: ''
		},
		// 是否选中
		checked: {
			type: Boolean,
			default: false
		},
		activeIconColor: {
			type: String,
			default: '#4298FF'
		},
		iconSize: {
			type: String,
			default: '32rpx'
		},
		disabled: {
			type: Boolean,
			default: false
		},
		disabledColor: {
			type: String,
			default: '#c8c9cc'
		}
	},

	watch: {
		checked(newVal) {
			this.currentChecked = newVal;
		}
	},

	data() {
		return {
			currentChecked: this.checked
		};
	},

	methods: {
		/** 选中事件 */
		onChecked(checked) {
			if (this.disabled) return;

			this.$emit('onChecked', checked);
		}
	}
};
</script>

<style lang="scss">
.checked-box {
	display: flex;
	align-items: center;

	.uncheck {
		border-radius: 50%;
		border: 2rpx solid #d9d8db;
		box-sizing: border-box;
	}

	.label {
		margin: 0 10rpx;
		font-size: 26rpx;
	}
}
</style>
