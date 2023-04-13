<template>
	<view>
		<u-notify ref="uNotify" />
		<u-cell-group :border="false" :customStyle="{ background: '#fff' }">
			<u-cell title="服药人" :value="choosedPatient.name" border />
		</u-cell-group>
		<u-cell-group :customStyle="{ 'margin-top': '20rpx', background: '#fff' }" :border="false">
			<u-cell title="药品名称" border>
				<u-input slot="value" border="none" inputAlign="right" placeholder="请输入药品名称" v-model="opt.name" @change="change" />
			</u-cell>
			<u-cell title="用药时间" :value="choseTime" border isLink @click="timeShow = true" />
			<u-cell title="开始日期" :value="choseDate" border isLink @click="dateShow = true" />
			<u-cell title="提醒天数" :value="choseDay" border isLink @click="tipShow = true" />
			<u-cell title="备注" border>
				<u-input
					slot="value"
					border="none"
					inputAlign="right"
					placeholder="添加用药注意事项(选填)"
					v-model="opt.remark"
					@change="change"
				/>
			</u-cell>
		</u-cell-group>
		<u-button
			:custom-style="{ position: 'fixed', bottom: 0, width: '90%', left: '5%', bottom: '20rpx' }"
			type="primary"
			shape="circle"
			@click="addDrugTips"
			throttleTime="1000"
			:loading="submitLoading"
			loadingText="添加中..."
			:disabled="submitLoading"
			block
			text="保存"
		/>
		<!-- 用药时间 -->
		<view v-show="timeShow">
			<view
				class=""
				style="position: fixed;z-index: 10075;background: #fff;left: 0;right: 0;width: 100%;bottom: 132px;padding: 10rpx 0"
			>
				<view class="just-between align-center plr-10 ptb-5">
					<text @click="timeShow = false" style="color:#909193">取消</text>
					<text class="f-16">请选择用药时间</text>
					<text @click="timeConfirm" style="color:#3c9cff;">确认</text>
				</view>
				<view class="flex-box tc fb f-14 ptb-10" style="">
					<text class="flex-item">第一次</text>
					<text class="flex-item">第二次</text>
					<text class="flex-item">第三次</text>
				</view>
			</view>
			<u-picker :show="true" :showToolbar="false" :columns="columns" visibleItemCount="3" @change="timeChange" />
		</view>
		<!-- 用药开始时间 -->
		<u-datetime-picker
			:show="dateShow"
			title="请选择开始时间"
			:minDate="minDate"
			mode="date"
			@confirm="dateConfirm"
			@cancel="dateShow = false"
		/>
		<!-- 提醒天数 -->
		<u-picker :show="tipShow" title="请选择提醒天数" :columns="dayArray" @confirm="dayConfirm" @cancel="tipShow = false" />
	</view>
</template>

<script>
import { addDrugTips } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';

let array = [];
for (let i = 1; i < 31; i++) {
	array.push(i);
}

export default {
	components: {
		cardSel
	},
	data() {
		return {
			choosedPatient: {},
			submitLoading: false,
			value: true,
			timeShow: false,
			dateShow: false,
			tipShow: false,
			dayArray: [array],
			columns: [],
			minDate: new Date() - 0,
			choseDate: '',
			choseDay: '请选择提醒天数',
			choseTime: '请选择用药时间提醒',
			choseTimeArr: [], //用药次数选中并处理后的数组
			choosedPatient: {},
			opt: {
				recordId: '',
				name: '', //药品名称
				cycle: '', //提醒天数
				remark: '', //用药备注
				startDate: '',
				time: ''
			}
		};
	},
	onLoad(options) {
		if (options) {
			this.choosedPatient = options;
			this.opt.recordId = options.id;
		}
		this.choseDate = this.initDate();
		this.opt.startDate = uni.$u.timeFormat(new Date() - 0, 'yyyy年mm月dd日');
		this.columns = [this.timeSlot(30), this.timeSlot(30), this.timeSlot(30)];
	},
	methods: {
		onCurrentCard(card) {
			this.choosedPatient = card;
		},
		change(e) {
			console.log('change', e);
		},
		timeConfirm() {
			this.choseTime = this.choseTimeArr.join();
			this.opt.time = this.choseTimeArr.join();
			this.timeShow = false;
		},
		timeChange(e) {
			console.log(e);
			let value = e.value;
			let arr = value.filter((value, index) => {
				if (value !== '--:--') {
					return value;
				}
			});
			this.choseTimeArr = arr;
		},
		dateConfirm(e) {
			console.log(e);
			this.choseDate = uni.$u.timeFormat(e.value, 'yyyy年mm月dd日');
			this.opt.startDate = uni.$u.timeFormat(e.value, 'yyyy年mm月dd日');
			this.dateShow = false;
		},
		dayConfirm(e) {
			console.log(e);
			this.choseDay = e.value[0] + '天';
			this.opt.cycle = e.value[0];
			this.tipShow = false;
		},

		async addDrugTips() {
			this.submitLoading = true;
			uni.$u.test.isEmpty(false);
			const testArr = [
				{
					value: this.opt.name,
					text: '请输入用药名称'
				},
				{
					value: this.opt.time,
					text: '请选择用药时间'
				},
				{
					value: this.opt.cycle,
					text: '请选择提醒天数'
				}
			];
			for (let i of testArr) {
				if (uni.$u.test.isEmpty(i.value)) {
					uni.showToast({
						title: i.text,
						icon: 'error',
						duration: 1500
					});
					this.submitLoading = false;
					return false;
				}
			}
			// #ifdef MP-WEIXIN
			wx.requestSubscribeMessage({
				tmplIds: ['mRLlM7v6OEQr7JapCUiQbghmJPXMgJTrE_E-hC_pV1I'],
				complete: async res => {
					// #endif
					const data = await addDrugTips(this.opt);
					if (data.code == 200) {
						this.$refs.uNotify.show({
							message: `添加提醒成功`,
							type: 'success',
							duration: '2000'
						});
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 上一页
						beforePage.$vm.needRefreshData = true;
						// 延时返回让notify展示
						setTimeout(() => uni.navigateBack(), 2000);
					}
					this.submitLoading = false;
					// #ifdef MP-WEIXIN
				}
			});
			// #endif
		},

		initDate() {
			let date = uni.$u.timeFormat(new Date() - 0, 'yyyy年mm月dd日');
			return date + '(今天)';
		},

		timeSlot(step) {
			var date = new Date();
			date.setHours(0);
			date.setSeconds(0);
			date.setUTCMinutes(0);
			var arr = [],
				timeArr = ['--:--'];
			var slotNum = (24 * 60) / step;
			for (var f = 0; f < slotNum; f++) {
				var time = new Date(Number(date.getTime()) + Number(step * 60 * 1000 * f));
				var hour = '',
					sec = '';
				time.getHours() < 10 ? (hour = '0' + time.getHours()) : (hour = time.getHours());
				time.getMinutes() < 10 ? (sec = '0' + time.getMinutes()) : (sec = time.getMinutes());
				timeArr.push(hour + ':' + sec);
			}
			return timeArr;
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f9f9f9;
}
</style>
