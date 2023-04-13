<template>
	<view>
		<web-view v-if="pId" :src="webUrl" />
		<load-data v-else :loading="loading" emptyText="健康档案数据为空" />
	</view>
</template>

<script>
import { getPId } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: true,
			pId: undefined,
			fromPage: undefined,
			webUrl: undefined
		};
	},
	onLoad(options) {
		this.fromPage = options.fromPage;

		this.getPId();
	},
	methods: {
		/** 获取健康档案跳转所需的PId */
		async getPId() {
			this.loading = true;
			let { data } = await getPId();
			this.loading = false;
			this.pId = data;
			// this.pId = '43bcae47d5b5478f86ad69435cc64187';

			this.webUrl =
				this.fromPage == 'tjbg'
					? `https://jiankangbaoding.cn/public/health/index.html#/BodyExamination?pid=${this.pId}&tabbar=close`
					: `https://jiankangbaoding.cn/public/health/index.html#/Home?pid=${this.pId}`;
		}
	}
};
</script>
