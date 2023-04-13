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
		switch (title){
			case 'zndz':
			uni.setNavigationBarTitle({ title: '智能导诊' }); 
				break;
			default:
				break;
		}
		this.webUrl = decodeURIComponent(encodeURIComponentStr);
	}
};
</script>
