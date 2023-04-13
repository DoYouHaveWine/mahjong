<template>
	<view>
		<templete v-if="list.length">
			<u-cell
				v-for="(item, index) in list"
				:key="index"
				:title="item.title"
				hover-class="cell-hover-class"
				@click="$navTo(`./details?id=${item.id}`)"
			/>
		</templete>
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { getHelpList } from '@/common/http/api.js';
export default {
	data() {
		return {
			list: [],
			loading: true
		};
	},

	onLoad() {
		this.getHelpList();
	},

	methods: {
		async getHelpList() {
			this.loading = true;
			const { data } = await getHelpList();
			this.loading = false;
			this.list = data;
		}
	}
};
</script>

<style lang="scss"></style>
