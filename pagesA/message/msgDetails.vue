<template>
	<view v-if="msg" class="content-box">
		<view class="title">{{ msg.title }}</view>
		<view class="createTime">{{ msg.createTime }}</view>
		<view class="content">{{ msg.content }}</view>
	</view>
	<load-data v-else />
</template>

<script>
import { getOtherMsgDetails } from '@/common/http/api.js';
export default {
	data() {
		return {
			msg: undefined
		};
	},

	onLoad(option) {
		this.getOtherMsgDetails(option.id);
	},

	methods: {
		/**
		 * 获取消息详情
		 * @param {Object} id
		 */
		async getOtherMsgDetails(id) {
			let { data } = await getOtherMsgDetails(id);
			this.msg = data;
		}
	}
};
</script>

<style lang="scss">
page {
	.content-box {
		padding: 20rpx;

		.title {
			margin-top: 10rpx;
			font-size: 34rpx;
			text-align: center;
			color: #000;
		}

		.createTime {
			text-align: end;
			margin: 20rpx 0;
			font-size: 24rpx;
			color: #666;
		}

		.content {
			text-indent: 40rpx;
			line-height: 50rpx;
			word-wrap: break-word;
		}
	}
}
</style>
