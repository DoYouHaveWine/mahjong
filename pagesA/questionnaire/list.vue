<template>
	<view>
		<u-sticky bgColor="#fff"><u-tabs :list="tabList" @click="onTabClick" :scrollable="false" lineWidth="80" /></u-sticky>

		<view v-if="list.length" class="list">
			<view
				@click="$navTo(`./index?voteId=${item.id}&hospitalId=${form.hospitalId}`)"
				class="list-item"
				v-for="item in list"
				:key="item.id"
			>
				<view class="name">{{ item.name }}</view>
				<view class="desc-and-time">
					<text class="desc">{{ item.description }}</text>
					<text class="time">{{ item.createTime }}</text>
				</view>
			</view>
		</view>
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { getVoteList } from '@/common/http/api.js';
export default {
	data() {
		return {
			tabList: [],
			loading: true,
			list: [],
			form: {
				hospitalId: undefined,
				type: 1
			}
		};
	},

	onLoad(options) {
		this.form.hospitalId = options.hospitalId;
		this.loadData();
	},

	methods: {
		onTabClick(item) {
			this.form.type = item.value;
			this.loadData();
		},

		/** 加载数据 */
		async loadData() {
			this.loading = true;
			let { data } = await getVoteList(this.form);
			this.loading = false;
			this.list = data || [];
		}
	}
};
</script>

<style lang="scss">
page {
	.u-tabs {
		border-bottom: 10rpx solid #efefef;
		padding-bottom: 6rpx;
	}

	.list {
		margin-top: 10rpx;
		.list-item {
			padding: 20rpx;
			border-bottom: 1rpx solid #c0c4cc;

			.name {
				font-size: 30rpx;
				font-weight: bold;
			}

			.desc-and-time {
				display: flex;
				font-size: 24rpx;
				margin-top: 10rpx;

				.desc {
					flex: 1;
					color: #999;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.time {
					color: #c0c4cc;
				}
			}
		}
	}
}
</style>
