<template>
	<u-cell-group v-if="symList.length"><u-cell v-for="(item, index) in symList" :key="index" :title="item.name" @click="chooseSymList(item)" /></u-cell-group>
	<load-data v-else :loading="loading" />
</template>

<script>
import { getBodySymptom } from '@/common/http/api.js';
export default {
	data() {
		return {
			symList: [],
			option: {},
			loading: true
		};
	},
	onLoad(option) {
		this.option = option;
		this.getList(option);
	},
	methods: {
		async getList(opt) {
			this.loading = true;
			let { data } = await getBodySymptom(opt);
			this.loading = false;
			this.symList = data;
		},
		chooseSymList(row) {
			uni.navigateTo({
				url: './symptomInfoList?id=' + row.id + '&personType=' + this.option.personType
			});
		}
	}
};
</script>
