<template>
	<view>
		<!-- 搜索 -->
		<view class="search-box">
			<u-search
				placeholder="搜索机构"
				v-model="searchName"
				placeholderColor="#cccccc"
				color="#0F1419"
				borderColor="#f1f1ff"
				height="80rpx"
				bgColor="#ffffff"
				:showAction="false"
				:inputStyle="{ 'font-size': '24rpx' }"
				@search="fetchHosList"
				@clear="fetchHosList"
			/>
		</view>

		<view class="title-tip" v-if="hosList.length">已开通缴费的机构共{{ hosList.length }}家</view>

		<view v-if="hosList.length" class="list">
			<view class="item" v-for="item in hosList" :key="item.id" @click="onChooseHos(item)">{{ item.name }}</view>
		</view>
		<load-data v-else :loading="loading" />
	</view>
</template>

<script>
import { getPaymentHosList, getRechargeHosedList, setDefaultClinicHos, setDefaultRechargeHosed } from '@/common/http/api.js';
export default {
	data() {
		return {
			loading: true,
			searchName: '',
			hosType: 'mzjf',
			hosList: []
		};
	},

	onLoad(options) {
		this.hosType = options.hosType || 'mzjf';
		this.fetchHosList();
	},

	methods: {
		/** 请求各类型的医院列表 */
		async fetchHosList() {
			this.loading = true;
			let res;
			switch (this.hosType) {
				case 'mzjf': // 门诊缴费
					res = await getPaymentHosList(this.searchName);
					break;

				case 'mzcz': // 门诊充值
					// res = await getRechargeHosList(this.searchName);
					break;

				case 'zycz': // 住院充值
					res = await getRechargeHosedList(this.searchName);
					break;
			}

			this.loading = false;
			this.hosList = res.data;
		},

		/** 点击选择医院 */
		onChooseHos(hospital) {
			this.saveDefaltHos(hospital.id);
			this.$store.commit('setSelHos', { hospital, type: this.hosType });
			uni.navigateBack();
		},

		/**
		 * 保存默认选择的医院
		 *
		 * @param {Object} id 医院id
		 */
		saveDefaltHos(id) {
			switch (this.hosType) {
				case 'mzjf': // 门诊缴费
					setDefaultClinicHos(id);
					break;

				case 'mzcz': // 门诊充值
					// setDefaultRechargeHos(id);
					break;

				case 'zycz': // 住院充值
					setDefaultRechargeHosed(id);
					break;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #fafafa;

	.search-box {
		margin: 24rpx 48rpx;
	}

	.title-tip {
		margin-left: 24rpx;
		font-size: 26rpx;
		font-family: PingFang SC-Medium, PingFang SC;
		font-weight: 500;
		color: rgba(15, 20, 25, 0.5);
	}

	.list {
		margin-top: 24rpx;
		background-color: #fff;

		.item {
			padding: 24rpx;
			font-size: 26rpx;
			font-family: PingFang SC-Regular, PingFang SC;
			font-weight: 400;
			color: #333333;
			border-bottom: 1rpx solid rgba(229, 231, 235, 0.5);
		}
	}
}
</style>
