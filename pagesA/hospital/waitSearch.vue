<template>
	<view class="page">
		<hos-card-sel @currentHosAndCard="onCurrentHosAndCard" />

		<view class="mt15 list-box">
			<view v-if="dataList.length">
				<view
					v-for="item in dataList"
					:key="item.serialNo"
					class="just-between align-center waiting-items ptb-10 plr-20 mt10 bg-white"
				>
					<view>
						<view class="flex-box align-center">
							<view class="">
								<image
									:src="item.avatar ? serverUrl + item.avatar : '../static/hospital/ic_doctor.svg'"
									style="width: 88rpx;height: 88rpx;"
								></image>
							</view>
							<view class="plr-10">
								<view>
									<text class="f-14">{{ item.doctorName }}</text>
									<text class="f-12 c-99 plr-5">{{ item.doctorLevel }}</text>
								</view>
								<view class="f-12 c-99">
									{{ item.deptName }}
									<!-- <text class="plr-5">|</text>十四诊室 -->
								</view>
							</view>
						</view>
						<view v-if="item.treatTime" class="f-14 c-99 mt5">
							就诊时间:
							<text class="c-33 plr-5">{{ item.treatTime }}</text>
						</view>
						<view v-if="item.serialNo" class="f-14 c-99 mt5">
							就诊号:
							<text class="c-33 plr-5">{{ item.serialNo }}</text>
						</view>
					</view>
					<view v-if="item.queueTotalNum" class="waiting fb f-12">
						您前面还有
						<text class="waiting-tips plr-5">{{ item.queueTotalNum }}</text>
						位
					</view>
				</view>
			</view>
			<load-data v-else :loading="loading" />
		</view>
		<view style="position:'relative';width:'90%';left:'5%';padding: 30rpx;">
			<u-button type="primary" shape="circle" @click="getQueueList(opt)" throttleTime="1000" block>更新</u-button>
		</view>
	</view>
</template>

<script>
import { getQueueList, setDefaultHos } from '@/common/http/api.js';
import hosCardSel from '@/pagesA/components/hosCardSel.vue';

export default {
	components: { hosCardSel },
	data() {
		return {
			loading: false,
			dataList: [],
			opt: {}
		};
	},

	methods: {
		/**
		 * 医院和卡选择回调
		 * @param {Object} e 包含hospitalId:医院Id、健康卡Id:recordId
		 */
		onCurrentHosAndCard(e) {
			this.opt = e;
			this.getQueueList(e);
		},

		async getQueueList(params) {
			this.loading = true;
			this.dataList = [];
			const { data } = await getQueueList(params);
			this.dataList = data;
			this.loading = false;
		}
	}
};
</script>

<style lang="scss">
.page {
	background: $uni-f9f9f9;
	height: 100vh;
	display: flex;
	flex-direction: column;
	.list-box {
		flex: 1;
		overflow-y: scroll;
		.waiting-items {
			.waiting {
				color: #4298ff;
				.waiting-tips {
					background: #e6f1ff;
				}
			}
			.after {
				color: #b24143;
			}
			.before {
				color: rgba(66, 152, 255, 0.5);
			}
		}
	}
}
</style>
