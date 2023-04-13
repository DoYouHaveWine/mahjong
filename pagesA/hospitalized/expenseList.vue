<template>
	<!-- 费用清单 -->
	<view class="">
		<view class="bg-white flex-box align-center ptb-10 border-box">
			<view class="plr-10">
				<u--text prefixIcon="play-left-fill" iconStyle="font-size: 12px;color:#cccccc" text="前一天" @click="getPreDate" />
			</view>
			<view class="flex-item tc date-select">
				<view>
					<u--text
						suffixIcon="arrow-down-fill"
						iconStyle="font-size: 12px;color:#cccccc"
						mode="date"
						:text="value1"
						@click="showPicker"
					/>
				</view>
			</view>
			<view class="plr-10">
				<u--text suffixIcon="play-right-fill" iconStyle="font-size: 12px;color:#cccccc" text="后一天" @click="getNextDate" />
			</view>
		</view>
		<view class="plr-10 mt15 f-12">
			<view>
				<text class="c-33">总费用</text>
				<text style="color:#ea3131" class="plr-5">￥{{ msgObj.countTotal || '' }}</text>
			</view>
			<view class="mt15 item-box bg-white">
				<view class="flex-box tc f-12 c-33 ptb-10 items">
					<text class="flex-item">费用类别</text>
					<text class="flex-item">项目名称</text>
					<text class="flex-item">数量</text>
					<text class="flex-item">金额</text>
				</view>
				<view v-for="(item, index) in msgObj.list" class="flex-box tc f-12 ptb-10 items">
					<text class="flex-item">{{ item.feeType || '' }}</text>
					<text class="flex-item">{{ item.feeItem || '' }}</text>
					<text class="flex-item">{{ item.amt || '' }}{{ item.unit || '' }}</text>
					<text class="flex-item">￥{{ item.feeTotal || '' }}</text>
				</view>
			</view>
		</view>
		<load-data :loading="loading.isLoading" :loadingText="loading.loadingText" isLoadingDialog onlyShowLoading />
		<u-datetime-picker :show="show" v-model="value1" mode="date" @confirm="getDate" @cancel="show = false" />
	</view>
</template>

<script>
import { getDailyBill } from '@/common/http/api.js';
export default {
	data() {
		return {
			show: false,
			value1: Number(new Date()),
			form: {
				recordId: '',
				hospitalId: '',
				visitId: ''
			},
			msgObj: undefined,
			loading: {
				isLoading: true,
				loadingText: '加载中...'
			}
		};
	},
	onLoad(options) {
		const { hospitalId, recordId, visitId } = options;
		this.form.hospitalId = hospitalId;
		this.form.recordId = recordId;
		this.form.visitId = visitId;

		this.fetchList();
	},
	methods: {
		showPicker() {
			this.show = true;
		},
		getDate(e) {
			this.value1 = e.value;
			this.show = false;
			this.fetchList();
		},
		getPreDate() {
			this.value1 -= 24 * 60 * 60 * 1000;
			this.fetchList();
		},
		getNextDate() {
			this.value1 += 24 * 60 * 60 * 1000;
			this.fetchList();
		},
		async fetchList() {
			this.loading = { isLoading: true, loadingText: '加载中...' };
			this.list = undefined;
			const form = {
				...this.form,
				date: uni.$u.timeFormat(this.value1, 'yyyy-mm-dd')
			};
			const { data } = await getDailyBill(form);
			this.loading.isLoading = false;
			this.msgObj = data || undefined;
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f5f7fa;
	.date-select {
		display: flex;
		justify-content: center;
	}
	.item-box {
		border-radius: 10px;
		.items {
			border-bottom: 1px solid #ccc;
			&:last-child {
				border: none;
			}
		}
	}
}
</style>
