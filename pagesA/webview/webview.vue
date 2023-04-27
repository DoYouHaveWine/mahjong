<template>
	<view><web-view :src="webUrl" /></view>
</template>

<script>
export default {
	data() {
		return {
			webUrl: undefined
		};
	},

	onLoad(options) {
		const { encodeURIComponentStr,title } = options
		this.webUrl = decodeURIComponent(encodeURIComponentStr);
	}
};
</script>
