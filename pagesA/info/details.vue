<template>
	<view style="margin: 0 34rpx;">
		<template v-if="info">
			<view class="title">{{ info.title }}</view>
			<view class="time">{{ info.createTime || '' }}</view>
			<view class="time row_change">来源：{{ info.source || '' }}</view>
			<video v-if="info.sourceUrl && info.sourceUrl.indexOf('.mp4') != -1" :src="info.sourceUrl" />
			<view v-if="content"><u-parse :content="content" /></view>
		</template>
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { getInformationDetail } from '@/common/http/api.js';
export default {
	data() {
		return {
			content: '',
			loading: true,
			info: undefined
		};
	},
	onLoad(options) {
		this.getInformationDetail(options.id);
	},

	methods: {
		/**
		 * 获取消息详情
		 * @param {Object} id 消息ID
		 */
		async getInformationDetail(id) {
			this.loading = true;
			let { data } = await getInformationDetail(id);
			this.loading = false;
			this.info = data;
			if (data.content) {
				// replaceAll会有兼容性问题，例如APP上不执行
				// this.content = data.content.replaceAll(`src="..`, `src="${this.serverUrl}`) || '';
				// this.content = this.content.replaceAll(`<video`, `<video style="width: 100%;"`);
				this.content = data.content.replace(/src="\.\./g, `src="${this.serverUrl}`) || '';
				this.content = this.content.replace(/\<video/g, `<video style="width: 100%;"`);
			}
		}
	},

	// 分享发送给朋友
	onShareAppMessage() {
		return {
			title: `${this.info.title}`,
			path: `/pagesA/info/details?id=${this.info.id}`,
			imageUrl: this.info.images ? `${this.serverUrl}${this.info.images}` : '' // 有大图放大图，无大图设置为默认（页面截图）
		};
	},

	// 分享到朋友圈
	onShareTimeline() {
		return {
			title: `${this.info.title}`,
			path: `/pagesA/info/details?id=${this.info.id}`,
			imageUrl: this.info.images ? `${this.serverUrl}${this.info.images}` : ''
		};
	}
};
</script>

<style lang="scss">
video {
	width: 100%;
}

.title {
	font-size: 38rpx;
	font-family: PingFang SC;
	font-weight: 400;
	color: #353535;
	line-height: 50rpx;
	margin-top: 22rpx;
	margin-bottom: 12rpx;
}
.time {
	font-size: 26rpx;
	font-family: PingFang SC;
	font-weight: 400;
	color: #666666;
	line-height: 1;
	margin-bottom: 22rpx;
}
</style>
