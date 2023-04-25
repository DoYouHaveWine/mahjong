<template>
	<view class="tabs-list" :style="{background:`${bgColor}`}">
		<view class="tabs-line" :style="{ width: `${tabLength*0.4}%`, left: `${((activeIndex + 1)*tabLength) - tabLength/2}%` }"></view>
		<template v-for="(item, index) in tabList">
			<view
				@click="clickTabs(item, index)"
				:key="item.value"
				:class="['tabs', { 'tabs-active': activeIndex === index }]"
				:style="{ width: `${tabLength}%`,fontSize:`${fontsize}rpx`}">{{ item.label || '' }}</view>
		</template>
	</view>
</template>

<script>
	export default {
		props: {
			list: {
				type: Array,
				default() {
					return []
				}
			},
			fontsize:{
				type:Number,
				default(){
					return 32
				}
			},
			bgColor:{
				type:String,
				default(){
					return '#fff'
				}
			}
		},
		mounted() {
			this.tabList = this.list
		},
		data() {
			return {
				tabList: [],
				activeIndex: 0,
				activeValue: ''
			}
		},
		methods: {
			clickTabs(item, index) {
				const { value } = item
				this.activeIndex = index
				this.activeValue = value
				this.$emit('change', item)
			}
		},
		computed: {
			tabLength() {
				const { length } = this.tabList || []
				return (Math.floor(100/length*100))/100
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tabs-list {
		display: flex;
		position: relative;
		// background: #fff;
		width: 100%;
		text-align: center;
		justify-content: space-around;
		padding:0 5rpx;
		box-sizing: border-box;
		.tabs {
			padding: 23rpx 0rpx;
			color: #999999;
		}
		.tabs-active {
			color: #333333;
			font-weight: bold;
		}
		.tabs-line {
			position: absolute;
			transform: translateX(-50%);
			height: 6rpx;
			border-radius: 60rpx;
			bottom: -4rpx;
			background: linear-gradient(180deg, #90E3B1 0%, #58AA6C 100%);
			transition: all .2s;
		}
	}
</style>