<template>
	<u-cell-group v-if="symInfoList.length"><u-cell v-for="(item, index) in symInfoList" :key="index" :title="item.name" @click="chooseSymInfoList(item)" /></u-cell-group>
	<load-data v-else :loading="loading" />
</template>

<script>
import { getSymptomInfo } from '@/common/http/api.js';
export default {
	data() {
		return {
			symInfoList: [],
			loading: true
		};
	},
	onLoad(option) {
		this.getInfoList(option);
	},
	methods: {
		async getInfoList(opt) {
			this.loading = true;
			let { data } = await getSymptomInfo(opt);
			this.loading = false;
			this.symInfoList = data;
		},
		chooseSymInfoList(row) {
			uni.navigateTo({
				url: './recomDeptList?id=' + row.id
			});
		}
	}
};
</script>
