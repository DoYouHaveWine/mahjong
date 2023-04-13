<template>
	<web-view v-if="pId" :src="webUrl" />
	<load-data v-else :loading="loading" emptyText="影像报告数据为空" />
</template>

<script>
import { getImageReportUrl } from '@/common/http/api.js';
export default {
	data() {
		return {
			id: undefined,
			loading: true,
			webUrl: undefined,
			timer: null
		};
	},

	onLoad(options) {
		this.id = options.id;
	},

	onShow() {
		this.getWebUrl();
	},

	onHide() {
		this.clearTimer();
	},

	onUnload() {
		this.clearTimer();
	},

	methods: {
		/** 获取影像数据链接 */
		async getWebUrl() {
			this.loading = true;
			let { data } = await getImageReportUrl(this.id);
			if (data) {
				this.webUrl = data;
				this.loading = false;
			} else {
				this.startTimer();
			}
		},

		/** 开启定时请求，每隔3秒请求一次直至成功 */
		startTimer() {
			this.timer = setInterval(async () => {
				let { data } = await getImageReportUrl(this.id);
				if (data) {
					this.clearTimer();
					this.webUrl = data;
					this.loading = false;
				}
			}, 3000);
		},

		/** 清除计时器 */
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		}
	}
};
</script>
