<template>
	<u-cell-group v-if="symInfoList.length">
		<u-cell
			v-for="(item, index) in symInfoList"
			:key="index"
			:title="item.hospitalName + '>' + item.deptName"
			@click="$navTo(`/pagesA/hospital/doctorList?hospitalId=${item.hospitalId}&deptId=${item.deptId}`)"
		/>
	</u-cell-group>
	<load-data :loading="loading" v-else emptyText="暂无推荐科室" />
</template>

<script>
import { getReDep } from '@/common/http/api.js';
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
			let { data } = await getReDep(opt);
			this.loading = false;
			this.symInfoList = data;
		}
	}
};
</script>
