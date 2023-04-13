<template>
	<view>
		<card-sel @currentCard="onCurrentCard" backgroudColor="#e6f1ff99" />

		<view>
			<view class="list-item" @click="$navTo('/pagesA/healthManage/gxy/manage')">
				<view class="left"><image src="/pagesA/static/health/ic_bp.svg" /></view>
				<view class="center">
					<text class="type">血压</text>
					<text class="time" v-if="bloodPressure">{{ bloodPressure.date }} {{ bloodPressure.time }}</text>
				</view>
				<view class="right">
					<template v-if="bloodPressure">
						<text :class="['grade', bloodPressure.gradeClass]">{{ bloodPressure.grade }}</text>
						<view class="num-box">
							<text class="num">{{ bloodPressure.systolicPressure }}/{{ bloodPressure.diastolicPressure }}</text>
							<text>mmHg</text>
						</view>
					</template>
					<text v-else class="no-data-tip">暂无数据</text>
				</view>
			</view>

			<view class="list-item" @click="$navTo('/pagesA/healthManage/bloodSuger/manage')">
				<view class="left"><image src="/pagesA/static/health/ic_glu.svg" /></view>
				<view class="center">
					<text class="type">血糖</text>
					<text class="time" v-if="bloodSugar">{{ bloodSugar.day }} {{ bloodSugar.time }}</text>
				</view>
				<view class="right">
					<template v-if="bloodSugar">
						<text class="grade" :style="{ color: bloodSugar.result == 'N' ? '#01b09a' : '#dd524d' }">
							{{ bloodSugar.resultName }}
						</text>
						<view class="num-box">
							<text class="num">{{ bloodSugar.value }}</text>
							<text>mmol/L</text>
						</view>
					</template>
					<text v-else class="no-data-tip">暂无数据</text>
				</view>
			</view>

			<view class="list-item" @click="$navTo('/pagesA/healthManage/weight/manage')">
				<view class="left"><image src="/pagesA/static/health/ic_weight.svg" /></view>
				<view class="center">
					<text class="type">体重</text>
					<text class="time" v-if="weight">{{ weight.day }} {{ weight.time }}</text>
				</view>
				<view class="right">
					<template v-if="weight">
						<text class="grade" :style="{ color: BMIColor(weight.bmi) }">{{ weight.bmi | BMIDesc }}</text>
						<view class="num-box">
							<text class="num">{{ weight.weight }}</text>
							<text>KG</text>
						</view>
					</template>
					<text v-else class="no-data-tip">暂无数据</text>
				</view>
			</view>

			<view class="list-item" @click="$navTo('/pagesA/healthManage/rate/manage')">
				<view class="left"><image src="/pagesA/static/health/ic_heart_rate.svg" /></view>
				<view class="center">
					<text class="type">心率</text>
					<text class="time" v-if="heartRate">{{ heartRate.day }} {{ heartRate.time }}</text>
				</view>
				<view class="right">
					<template v-if="heartRate">
						<text class="grade" :style="{ color: bpmColor(heartRate.bpm) }">{{ heartRate.bpm | bpmDesc }}</text>
						<view class="num-box">
							<text class="num">{{ heartRate.bpm }}</text>
							<text>bpm</text>
						</view>
					</template>
					<text v-else class="no-data-tip">暂无数据</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getHealthData } from '@/common/http/api.js';
import cardSel from '@/pagesA/components/cardSel.vue';
export default {
	components: {
		cardSel
	},

	data() {
		return {
			loading: true,
			bloodPressure: undefined,
			bloodSugar: undefined,
			weight: undefined,
			heartRate: undefined
		};
	},

	filters: {
		BMIDesc(bmi) {
			if (bmi < 18.5) {
				return '偏瘦';
			} else if (bmi < 23.9) {
				return '正常';
			} else if (bmi < 28) {
				return '偏重';
			} else {
				return '肥胖';
			}
		},

		bpmDesc(bpm) {
			if (bpm < 60) {
				return '心率过缓';
			} else if (bpm > 100) {
				return '心率过快';
			} else {
				return '正常';
			}
		}
	},

	methods: {
		onCurrentCard(card) {
			this.fetchHealthData(card.id);
		},

		async fetchHealthData(cardId) {
			const { data } = await getHealthData(cardId);
			if (data.bloodResp) {
				this.bloodPressure = { ...data.bloodResp, ...this.handleBloodPressure(data.bloodResp) };
			} else {
				this.bloodPressure = null;
			}
			this.bloodSugar = data.bloodSugarResp;
			this.weight = data.weightResp;
			this.heartRate = data.heartRateResp;
		},

		BMIColor(bmi) {
			if (bmi < 18.5) {
				return '#f0ad4e';
			} else if (bmi < 23.9) {
				return '#01b09a';
			} else if (bmi < 28) {
				return '#f0ad4e';
			} else {
				return '#dd524d';
			}
		},

		bpmColor(bpm) {
			if (bpm < 60) {
				return '#f0ad4e';
			} else if (bpm > 100) {
				return '#dd524d';
			} else {
				return '#01b09a';
			}
		},

		/** 处理血压数据 */
		handleBloodPressure(item) {
			const { systolicPressure, diastolicPressure } = item;
			let systolicRange = this.constantMap.get('xyType')['systolicRange'].split('-');
			let diastolicRange = this.constantMap.get('xyType')['diastolicRange'].split('-');
			let obj = { gradeClass: 'green-text', grade: '正常' };
			if (systolicPressure <= systolicRange[0] || diastolicPressure <= diastolicRange[0]) {
				obj.gradeClass = 'yellow-text';
				obj.grade = '偏低';
			}
			if (systolicPressure > systolicRange[1] || diastolicPressure > diastolicRange[1]) {
				obj.gradeClass = 'red-text';
				obj.grade = '偏高';
			}
			return obj;
		}
	}
};
</script>

<style lang="scss">
page {
	background: #fafafa;

	.list-item {
		display: flex;
		border-radius: 20rpx;
		background: #fff;
		margin: 32rpx 40rpx;

		.left {
			background: #e6f1ff80;
			width: 148rpx;
			height: 128rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			image {
				width: 82rpx;
				height: 82rpx;
			}
		}

		.center {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			margin: 15rpx 18rpx;
			font-family: PingFang SC;
			font-weight: 500;

			.type {
				color: #0f1419;
				font-size: 26rpx;
			}

			.time {
				color: #0f14194d;
				font-size: 22rpx;
			}
		}

		.right {
			flex: 1;
			margin: 10rpx 24rpx 10rpx 0;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: flex-end;
			font-family: PingFang SC;
			font-weight: 500;

			.grade {
				font-size: 24rpx;
			}

			.num-box {
				color: #0f141980;
				font-family: PingFang SC;
				font-size: 26rpx;
				margin-bottom: 15rpx;

				.num {
					color: #333;
					font-size: 40rpx;
					margin-right: 8rpx;
				}
			}

			.no-data-tip {
				color: #0f1419;
				font-size: 26rpx;
			}
		}
	}

	.green-text {
		color: #01b09a;
	}

	.yellow-text {
		color: #f0ad4e;
	}

	.red-text {
		color: #dd524d;
	}
}
</style>
