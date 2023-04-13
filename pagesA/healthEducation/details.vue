<template>
	<view style="margin: 0 34rpx;">
		<template v-if="info">
			<view class="title">{{ info.title }}</view>
			<view class="time-source-collect">
				<view class="time-source">
					<text class="time">{{ info.createTime ? info.createTime : '' }}</text>
					<text class="time row_change">来源：{{ info.source ? info.source : '' }}</text>
				</view>
				<!-- <u-icon @click="collect(info)" :name="info.favoriteFlg == 1 ? 'heart-fill' : 'heart'" size="36" color="#dd524d" /> -->
			</view>
			<video v-if="info.sourceUrl && info.sourceUrl != null && info.sourceUrl.indexOf('.mp4') != -1" :src="info.sourceUrl" />
			<view v-if="content" v-html=""><u-parse :content="content" /></view>
		</template>
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
import { getInformationDetail, submitFavorite, cancelFavorite } from '@/common/http/api.js';
export default {
	data() {
		return {
			content: '',
			loading: true,
			info: undefined
		};
	},
	onLoad(options) {
		this.getInformationDetail(options.id, options.pageType);
	},
	methods: {
		/**
		 * 获取消息详情
		 * @param {Object} id 消息ID
		 */
		async getInformationDetail(id, pageType) {
			this.loading = true;
			let { data } = await getInformationDetail(id, pageType);
			this.info = data || {};
			this.content = data.content.replaceAll(`src="..`, 'src="' + serverUrl) || '';
			this.content = this.content.replaceAll(`<video`, `<video style="width: 100%;"`);
			this.loading = false;
		},

		/** 收藏/取消收藏 */
		async collect(item) {
			let userId = uni.getStorageSync('sysUser').id;
			if (!item.favoriteFlg == 1) {
				await submitFavorite({
					memberId: userId,
					objectId: item.id,
					objectType: 4
				});
				this.getInformationDetail(this.info.id);
			} else {
				await cancelFavorite({ memberId: userId, objectId: item.id, objectType: 4 });
				this.getInformationDetail(this.info.id);
			}
		}
	}
};
</script>

<style lang="scss">
video {
	width: 100%;
}

.title {
	font-size: 38rpx;
	font-family: Microsoft YaHei;
	font-weight: 400;
	color: #353535;
	line-height: 50rpx;
	margin-top: 22rpx;
	margin-bottom: 12rpx;
}

.time-source-collect {
	display: flex;
	align-items: center;

	.time-source {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.time {
			font-size: 26rpx;
			font-family: Microsoft YaHei;
			font-weight: 400;
			color: #666666;
			line-height: 1;
			margin-bottom: 22rpx;
		}
	}
}
</style>
