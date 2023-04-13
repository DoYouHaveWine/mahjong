<template>
	<view class="info-list-page">
		<!-- 上面的蓝色背景 -->
		<view class="blue-view" />

		<!-- 资讯分类 -->
		<scroll-view class="scroll-view_H " scroll-x="true" scroll-left="0">
			<view v-for="item in headerList" class="scroll-view-item_H" :key="item.id" @click="onHeaderItemClick(item.id)">
				<view class="title-image"><u--image width="100rpx" height="100rpx" radius="10" :src="serverUrl + item.imgUrl" /></view>
				<view>{{ item.name }}</view>
			</view>
		</scroll-view>

		<!-- 资讯文章列表 -->
		<view class="list-box">
			<template v-if="list.length">
				<view class="item" v-for="item in list" :key="item.id" @click="$navTo(`./details?id=${item.id}`)">
					<view class="left">
						<u--image width="80" height="80" radius="10" :src="serverUrl + item.images" errorIcon="photo" />
					</view>

					<view class="right">
						<view class="title">{{ item.title || '' }}</view>
						<view class="description">{{ item.description || '' }}</view>
						<view class="create-time">{{ item.createTime || '' }}</view>
					</view>
				</view>
				<u-loadmore :status="loadStatus" />
			</template>

			<load-data v-else :loading="loading" />
		</view>
	</view>
</template>

<script>
import { getInformationHeaders, getInfoArticlePage } from '@/common/http/api.js';

export default {
	data() {
		return {
			headerList: [],
			columnId: undefined,
			list: [],
			pageCount: undefined,
			pageNum: 1,
			pageSize: 10,
			loading: true,
			loadStatus: 'loadmore'
		};
	},

	onLoad(option) {
		this.getInformationHeaders();
	},

	onReachBottom() {
		if (this.pageCount > this.pageNum * this.pageSize) {
			this.pageNum++;
			this.getInfoArticlePage();
			this.loadStatus = 'loading';
		} else {
			this.loadStatus = 'nomore';
		}
	},

	methods: {
		/** 获取资讯分类列表 */
		async getInformationHeaders() {
			var rs = await getInformationHeaders(1);
			this.headerList = rs.data || [];
			if (this.headerList && this.headerList[0]) {
				this.columnId = this.headerList[0].id;
				this.getInfoArticlePage();
			}
		},

		/**
		 * 获取资讯文章分页列表
		 */
		async getInfoArticlePage() {
			this.loading = true;
			if (this.pageNum == 1) {
				this.list = [];
			}
			let { data } = await getInfoArticlePage({ columnId: this.columnId, pageNum: this.pageNum, pageSize: this.pageSize });
			this.loading = false;
			this.pageCount = data.totalCount;
			this.list = this.list.concat(data.list);
			if (this.pageNum == 1 && this.pageSize > this.pageCount) {
				this.loadStatus = 'nomore';
			}
		},

		/** 标题栏分类项点击 */
		onHeaderItemClick(columnId) {
			this.columnId = columnId;
			this.pageNum = 1;
			this.getInfoArticlePage();
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f4f6fe;

	.info-list-page {
		overflow-x: hidden;

		.blue-view {
			background-color: $uni-color-primary;
			width: 110%;
			margin-left: -5%;
			height: 150rpx;
			border-bottom-left-radius: 20%;
			border-bottom-right-radius: 20%;
		}

		.scroll-view_H {
			white-space: nowrap;
			width: 85%;
			margin: -90rpx auto;
			background: #fff;
			padding: 20rpx;
			border-radius: 20rpx;
			box-shadow: 0 2rpx 40rpx 0 rgba(69, 157, 247, 0.24);

			// 去掉滑动scrollbar
			::-webkit-scrollbar {
				display: none;
				width: 0 !important;
				height: 0 !important;
				-webkit-appearance: none;
				background: transparent;
			}

			.scroll-view-item_H {
				display: inline-block;
				height: 100%;
				line-height: 28rpx;
				text-align: center;
				font-size: 28rpx;
				background: #fff;
				font-family: PingFang SC;
				padding: 4rpx 0;
				margin: 0 40rpx;

				.title-image {
					width: 100rpx;
					height: 100rpx;
					margin-bottom: 20rpx;
				}
			}
		}

		.list-box {
			margin-top: 110rpx;
			padding-bottom: 10rpx;

			.item {
				margin: 24rpx 30rpx;
				display: flex;
				background-color: #fff;
				padding: 24rpx;
				height: 188rpx;
				box-sizing: border-box;
				align-items: center;
				font-family: PingFang SC;
				border-radius: 20rpx;

				.left {
					width: 160rpx;
				}

				.right {
					flex: 1;
					overflow: hidden;
					height: 100%;
					margin-left: 30rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-around;

					.title {
						color: #000;
						font-weight: 500;
						font-size: 28rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.description {
						color: #999;
						font-weight: 500;
						font-size: 24rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.create-time {
						color: #999;
						font-weight: 500;
						font-size: 20rpx;
					}
				}
			}
		}
	}
}
</style>
