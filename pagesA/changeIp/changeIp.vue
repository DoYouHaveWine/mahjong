<template>
	<view>
		<view class="input-box">
			<u-input v-model="ipValue" type="text" class="u-input" />
			<u-button type="primary" @click="onChangeIP" size="normal" :disabled="!ipValue" customStyle="width:100px" text="确认" />
		</view>

		<view class="ip-list" v-for="(item, index) in ipList" :key="index" @click="onIpItemClick(item)">
			<text>{{ item }}</text>
			<view v-if="item !== curIp" class="del-icon" @click.stop="deleteIp(index)"><u-icon name="close" size="20" /></view>
		</view>
	</view>
</template>

<script>
import { serverUrl } from '@/common/http/baseRequest.js';
export default {
	data() {
		return {
			ipValue: undefined,
			curIp: uni.getStorageSync('devIp') || serverUrl, // 当前IP
			ipList: uni.getStorageSync('ipList') || []
		};
	},

	onLoad() {
		this.initDefaultIpList();
	},

	methods: {
		/** 切换IP */
		onChangeIP() {
			uni.setStorageSync('devIp', this.ipValue);
			if (this.ipList.indexOf(this.ipValue) === -1) {
				this.ipList.push(this.ipValue);
				uni.setStorageSync('ipList', this.ipList);
			}
			uni.showModal({
				content: '切换IP需要点击菜单手动重新进入小程序，重新进入后生效',
				showCancel: false,
				success() {
					// #ifdef APP-PLUS
					plus.runtime.restart();
					// #endif
				}
			});
		},

		/** IP初始化 */
		initDefaultIpList() {
			const defaultIpList = [
				'https://jiankangbaoding.cn/test',
				'https://jiankangbaoding.cn',
				'http://172.168.11.7:8700',
				'http://172.168.11.40:8700',
				'http://172.168.11.39:8700',
			];
			if (this.ipList.length === 0) {
				this.ipList = defaultIpList;
				uni.setStorageSync('ipList', defaultIpList);
			}
		},

		/** 点击IP的Item项 */
		onIpItemClick(item) {
			this.ipValue = item;
		},

		/** 点击IP的Item项 */
		deleteIp(index) {
			this.ipList.splice(index, 1);
			uni.setStorageSync('ipList', this.ipList);
		}
	}
};
</script>

<style lang="scss">
page {
	.input-box {
		display: flex;
		margin: 20rpx;
		align-items: center;

		.u-input {
			flex: 1;
			margin: 0 10rpx;
			border: 2rpx solid #c0c0c0 !important;
		}
	}

	.ip-list {
		display: flex;
		padding: 0 20rpx;
		border-bottom: 2rpx solid #c0c0c0;
		line-height: 90rpx;
		align-items: center;
		justify-content: space-between;

		.del-icon {
			padding: 10rpx 30rpx;
		}
	}
}
</style>
