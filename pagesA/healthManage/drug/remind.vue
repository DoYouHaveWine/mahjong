<template>
	<view class="page">
		<card-sel @currentCard="onCurrentCard" backgroudColor="#e6f1ff99" :defultSelCardId="defultSelCardId" />

		<view class="plr-20 ptb-10 border-box" style="height: 80vh;overflow-y: scroll;">
			<view v-if="dataList.length">
				<view v-for="item in dataList" :key="item.id" class="bg-white drug-items plr-20 ptb-10 mt10">
					<view class="just-between align-center">
						<text class="f-16 fb">{{ item.name }}</text>
						<image src="../../../static/health/ic_del.svg" style="width: 45rpx;height: 50rpx;" @click="del(item.id)"></image>
					</view>
					<view class="mt10">
						<view class="f-14">
							<view>
								提醒日期：
								<text v-text="item.timeLine"></text>
							</view>
							<view v-if="item.remark" class="mt5">
								用药备注：
								<text v-text="item.remark"></text>
							</view>
						</view>
					</view>
					<u-line margin="20rpx 0"></u-line>
					<view class="drug-times f-12 just-between align-center">
						<view>
							<text>用药时间：</text>
							<text v-for="(child, index) in item.timeArr" :key="index" v-text="child" class="time-items"></text>
						</view>
						<view><u-switch :value="item.isReminder == 1" asyncChange @change="switchTips(item.id)"></u-switch></view>
					</view>
				</view>
			</view>
			<load-data v-else :loading="loading" />
		</view>
		<u-button
			:custom-style="{ position: 'fixed', bottom: 0, width: '90%', left: '5%', bottom: '20rpx' }"
			type="primary"
			shape="circle"
			@click="$navTo(`./add?id=${choosedPatient.id}&name=${choosedPatient.name}`)"
			throttleTime="1000"
			:loading="submitLoading"
			loadingText="提交中..."
			:disabled="submitLoading"
			block
			text="添加用药提醒"
		/>
	</view>
</template>

<script>
import { getDrugList, delDrugTips, switchDrugTips } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
export default {
	components: { cardSel },
	data() {
		return {
			submitLoading: false,
			loading: false,
			needRefreshData: false, // 是否需要刷新数据，提供给下一个页面返回数据刷新
			dataList: [],
			choosedPatient: {},
			defultSelCardId: ''
		};
	},
	onShow() {
		if (this.needRefreshData) {
			this.getDrugList(this.choosedPatient.id);
			this.needRefreshData = false;
		}
	},
	onLoad(options) {
		const { id } = options;
		this.defultSelCardId = id;
	},
	methods: {
		onCurrentCard(card) {
			this.choosedPatient = card;
			this.getDrugList(card.id);
		},
		change(e) {
			console.log('change', e);
		},
		async getDrugList(id) {
			this.loading = true;
			const { data } = await getDrugList(id);
			console.log(data);

			this.dataList = data.map((item, index) => {
				return {
					...item,
					timeArr: item.time.split(','),
					timeLine: item.startDate + '至' + this.getBeforeDate(item.startDate, item.cycle)
				};
			});
			this.loading = false;
		},
		del(id) {
			const _this = this;
			uni.showModal({
				title: '温馨提示',
				content: '确定删除当前提醒?',
				success: async function(res) {
					if (res.confirm) {
						console.log('用户点击确定');
						const data = await delDrugTips(id);
						if (+data.code == 200) {
							_this.getDrugList(_this.choosedPatient.id);
						}
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
		},
		async switchTips(id) {
			const data = await switchDrugTips(id);
			if (+data.code == 200) {
				this.getDrugList(this.choosedPatient.id);
			}
		},
		getBeforeDate(strDate, n) {
			var datt = strDate.split('-');
			var newDate = new Date(datt[0], datt[1] - 1, datt[2]);
			var befminuts = newDate.getTime() + 1000 * 60 * 60 * 24 * parseInt(n);
			var beforeDat = new Date();
			beforeDat.setTime(befminuts);
			var befMonth = beforeDat.getMonth() + 1;
			var mon = befMonth >= 10 ? befMonth : '0' + befMonth;
			var befDate = beforeDat.getDate();
			var da = befDate >= 10 ? befDate : '0' + befDate;
			var newDate = beforeDat.getFullYear() + '-' + mon + '-' + da;
			return newDate;
		}
	}
};
</script>

<style lang="scss">
page {
	background: $uni-f9f9f9;
	.drug-items {
		border-radius: 10px;
		.drug-times {
			color: #eb9143;
			.time-items {
				background: #fef3e6;
				padding: 5rpx 8rpx;
				margin-left: 10rpx;
				border-radius: 5px;
			}
		}
	}
}
</style>
