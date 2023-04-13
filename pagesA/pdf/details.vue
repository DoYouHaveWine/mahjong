<template>
	<view class="pages">
		<view class="title">{{ info.title }}</view>
		<view class="time">{{ info.createTime ? info.createTime : '' }}</view>
		<u-line margin="20rpx 0" color="#e4e7ed" />
		<u-parse v-if="content" :content="content" />
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { getHelpInfo } from '@/common/http/api.js';
export default {
	data() {
		return {
			info: {},
			content: '',
			loading: true
		};
	},
	onLoad(options) {
		uni.setNavigationBarTitle({
			title: '帮助手册详情'
		});
		this.getHelpInfo(options.id);
	},
	methods: {
		async getHelpInfo(id) {
			var res = await getHelpInfo(id);
			this.content = res.data.content.replace(/src="\.\./g, 'src="' + this.serverUrl) || '';
			// console.log(this.content)
			this.info = res.data;
		}
	}
};
</script>

<style lang="scss">
.pages {
	padding: 0 20rpx;
	.title {
		font-size: 38rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #353535;
		line-height: 50rpx;
		margin-top: 22rpx;
		margin-bottom: 12rpx;
	}
	.time {
		font-size: 26rpx;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #666666;
		line-height: 1;
		margin-bottom: 22rpx;
	}
}
</style>
