<template>
	<view class="">
		<view class="history-list" v-if="list.length > 0">
			<view
				class="fistory-item"
				v-for="(item, i) in list"
				:key="i"
				@click="$navTo(`./formDetail?submitId=${item.submitId}&voteId=${voteId}`)"
			>
				<text class="title">诊前录入调查问卷</text>
				<view class="time-box">
					<text class="label">提交时间</text>
					<text class="time">{{ item.createTime || '' }}</text>
				</view>
			</view>
		</view>
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { getPreMsgList } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: false,
			pageNum: 1,
			pageSize: 10,
			list: [],
			voteId: ''
		};
	},
	onLoad(options) {
		const { voteId, ...rest } = options;
		this.voteId = voteId;
		this.getListData(rest);
	},
	onReachBottom() {
		this.pageNum++;
		this.getListData();
	},
	methods: {
		getListData(params) {
			this.loading = true;
			const { pageNum, pageSize } = this;
			const postData = {
				pageNum,
				pageSize,
				...params
			};
			getPreMsgList(postData)
				.then(({ data = {} }) => {
					const { list = [] } = data;
					this.list = this.list.concat(list);
				})
				.finally(() => {
					this.loading = false;
				});
		}
	}
};
</script>

<style lang="scss">
.history-list {
	.fistory-item {
		display: flex;
		padding: 0 20rpx;
		justify-content: space-between;
		align-items: center;
		height: 120rpx;
		border-bottom: 2rpx solid #eee;
		.title {
			font-size: 30rpx;
			font-weight: bold;
		}
		.time-box {
			display: flex;
			flex-direction: column;
			text-align: right;
			.label {
				color: #909399;
			}
			.time {
				font-size: 28rpx;
				font-weight: bold;
			}
		}
	}
}
</style>
