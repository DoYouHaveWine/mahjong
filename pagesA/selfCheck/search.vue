<template>
	<view class="hos-content">
		<!-- 搜索 -->
		<view class="search-box">
			<u-search
				shape="round"
				placeholder="搜索症状"
				@search="getList"
				v-model="opt.symptomName"
				:show-action="false"
				margin="0 20rpx 0 20rpx"
			/>
		</view>

		<view class="hos-list-wrap">
			<view v-if="list.length"><u-cell v-for="item in list" :key="item.id" :title="item.name" @click="goInfo(item)" /></view>
			<load-data v-else :loading="loading" />
		</view>
	</view>
</template>

<script>
import { getDeptBySympName } from '@/common/http/api.js';
export default {
	data() {
		return {
			opt: {
				symptomName: ''
			},
			list: [],
			loading: true
		};
	},
	onLoad(option) {
		this.opt.symptomName = option.searchValue;
		this.getList();
	},
	methods: {
		goInfo(item) {
			uni.navigateTo({
				url: './recomDeptList?id=' + item.id
			});
		},
		async getList() {
			this.loading = true;
			this.dataList = [];
			var rs = await getDeptBySympName(this.opt);
			this.list = rs.data;
			this.loading = false;
		}
	}
};
</script>

<style lang="scss">
.hos-content {
	background: #f9f9f9;
	min-height: 100vh;
	overflow: hidden;
}

.search-box {
	width: 100%;
	background-color: #4298ff;
	padding: 20rpx 0;
}
</style>
